import type { Session } from '../auth/session.ts'
import { apiRequest } from './client.ts'

/** Гостевой вход (протокол, 3.1): имя → токен на сутки. */
export function loginAsGuest(name: string): Promise<Session> {
  return apiRequest<Session>('/api/auth/guest', { method: 'POST', body: { name }, auth: false })
}
