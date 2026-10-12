// HTTP-клиент для REST бэкенда. Все запросы идут по относительным адресам /api/...:
// в разработке их пересылает Vite (vite.config.ts), в prod — Caddy, в обоих случаях дальше шлюз.

/** Ошибка отдельного поля из ответа VALIDATION_FAILED (протокол, 4.1). */
export interface FieldError {
  field: string
  message: string
}

/**
 * Ошибка запроса. code — машинный код из Problem Details (протокол, 4.1); по нему интерфейс
 * выбирает текст из переводов. Если ответа нет вовсе (сервер недоступен), code = NETWORK_ERROR.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: FieldError[]

  constructor(status: number, code: string, message: string, fieldErrors: FieldError[] = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }

  /** Сервер не ответил или упал: имеет смысл повторить позже. */
  get isServerUnavailable(): boolean {
    return this.status === 0 || this.status >= 500
  }
}

interface AuthHooks {
  /** Текущий токен или null, если игрок не вошёл. */
  getToken: () => string | null
  /** Сервер отверг токен (401): сессию нужно сбросить и войти заново. */
  onUnauthorized: () => void
}

// Клиент ничего не знает о React: AuthProvider сообщает ему, где взять токен
let authHooks: AuthHooks = { getToken: () => null, onUnauthorized: () => {} }

export function configureApiAuth(hooks: AuthHooks): void {
  authHooks = hooks
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  /** Добавлять ли токен; false — для входа, когда токена ещё нет. */
  auth?: boolean
}

/** Запрос к API: JSON туда и обратно, токен в заголовке Authorization, ошибки — ApiError. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  const token = auth ? authHooks.getToken() : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    // fetch падает, только если ответа нет совсем: нет сети, сервер не запущен
    throw new ApiError(0, 'NETWORK_ERROR', `Request to ${path} failed`)
  }

  if (response.ok) {
    return (response.status === 204 ? undefined : await response.json()) as T
  }

  const problem = await readProblem(response)
  if (response.status === 401 && token) {
    authHooks.onUnauthorized()
  }
  throw new ApiError(
    response.status,
    problem.code ?? `HTTP_${response.status}`,
    problem.detail ?? response.statusText,
    problem.errors ?? [],
  )
}

interface Problem {
  code?: string
  detail?: string
  errors?: FieldError[]
}

/** Тело ошибки в формате Problem Details; если тело не JSON (например, ошибка прокси) — пусто. */
async function readProblem(response: Response): Promise<Problem> {
  try {
    return (await response.json()) as Problem
  } catch {
    return {}
  }
}
