import { saveSession, type Session } from '../auth/session.ts'

/** Сессия гостя для тестов: действует ещё сутки. */
export function testSession(name = 'Анна'): Session {
  return {
    token: 'test-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user: { id: 'g-test', name, role: 'GUEST' },
  }
}

/** Как будто игрок уже входил раньше: сессия лежит в localStorage. */
export function signIn(name = 'Анна'): Session {
  const session = testSession(name)
  saveSession(session)
  return session
}

/** Ответ fetch с JSON-телом. */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
