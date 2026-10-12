// Сессия гостя в localStorage (протокол, 3.1): после перезагрузки страницы игрок остаётся
// тем же гостем — с тем же id, а значит, может вернуться в свою партию.

export interface SessionUser {
  id: string
  name: string
  role: string
}

/** Ответ гостевого входа, он же сохраняемая сессия. */
export interface Session {
  token: string
  /** Когда истекает токен, ISO 8601. */
  expiresAt: string
  user: SessionUser
}

export const SESSION_STORAGE_KEY = 'elementary.session'

/** Токен считается истёкшим за минуту до срока: часы браузера и сервера могут немного расходиться. */
const EXPIRY_MARGIN_MS = 60_000

export function isExpired(session: Session, now = Date.now()): boolean {
  const expiresAt = Date.parse(session.expiresAt)
  return Number.isNaN(expiresAt) || expiresAt - EXPIRY_MARGIN_MS <= now
}

/** Сколько миллисекунд сессия ещё действует (с учётом запаса). */
export function msUntilExpiry(session: Session, now = Date.now()): number {
  return Math.max(0, Date.parse(session.expiresAt) - EXPIRY_MARGIN_MS - now)
}

/**
 * Сохранённая сессия или null. Испорченная или истёкшая запись удаляется.
 * localStorage может быть недоступен (приватный режим, запрет cookies) — тогда просто null.
 */
export function loadSession(now = Date.now()): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (raw === null) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (isSession(parsed) && !isExpired(parsed, now)) {
      return parsed
    }
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  } catch {
    return null
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Не сохранилось — игра работает, но после перезагрузки придётся войти заново
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // нечего удалять
  }
}

/** localStorage может содержать что угодно (старый формат, ручная правка): проверяем форму. */
function isSession(value: unknown): value is Session {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const { token, expiresAt, user } = value as Record<string, unknown>
  if (typeof token !== 'string' || typeof expiresAt !== 'string') {
    return false
  }
  if (typeof user !== 'object' || user === null) {
    return false
  }
  const { id, name, role } = user as Record<string, unknown>
  return typeof id === 'string' && typeof name === 'string' && typeof role === 'string'
}
