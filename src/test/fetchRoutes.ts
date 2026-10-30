import { vi } from 'vitest'

type Route = (init: RequestInit | undefined) => Response | Promise<Response>

/**
 * Подменяет fetch: ответ выбирается по «МЕТОД путь», например 'POST /api/game/rooms'.
 * Неизвестный запрос — 404, чтобы тест упал заметно. Возвращает мок для проверки вызовов.
 */
export function routeFetch(routes: Record<string, Route>) {
  const fetchMock = vi.fn((url: string, init?: RequestInit) => {
    const route = routes[`${init?.method ?? 'GET'} ${url}`]
    return Promise.resolve(
      route ? route(init) : new Response('{"code":"TEST_NO_ROUTE"}', { status: 404 }),
    )
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Был ли запрос «МЕТОД путь»; возвращает тело последнего такого запроса. */
export function requestBody(fetchMock: ReturnType<typeof routeFetch>, method: string, url: string) {
  const call = fetchMock.mock.calls
    .filter(([u, init]) => u === url && (init?.method ?? 'GET') === method)
    .at(-1)
  if (!call) return undefined
  const body = call[1]?.body
  return typeof body === 'string' ? JSON.parse(body) : null
}

export const noContent = () => new Response(null, { status: 204 })
