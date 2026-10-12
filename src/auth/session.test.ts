import { describe, expect, it } from 'vitest'
import { testSession } from '../test/session.ts'
import {
  SESSION_STORAGE_KEY,
  clearSession,
  isExpired,
  loadSession,
  saveSession,
} from './session.ts'

describe('session', () => {
  it('сохраняется и читается обратно', () => {
    const session = testSession()
    saveSession(session)

    expect(loadSession()).toEqual(session)
  })

  it('без записи — null', () => {
    expect(loadSession()).toBeNull()
  })

  it('истёкшая сессия не возвращается и удаляется', () => {
    saveSession({ ...testSession(), expiresAt: new Date(Date.now() - 1000).toISOString() })

    expect(loadSession()).toBeNull()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('за минуту до срока сессия уже считается истёкшей', () => {
    const now = Date.parse('2026-10-01T12:00:00Z')
    const session = { ...testSession(), expiresAt: '2026-10-01T12:00:30Z' }

    expect(isExpired(session, now)).toBe(true)
    expect(isExpired({ ...session, expiresAt: '2026-10-01T12:05:00Z' }, now)).toBe(false)
  })

  it('испорченная запись не ломает приложение', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, '{не json')
    expect(loadSession()).toBeNull()

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token: 'x' }))
    expect(loadSession()).toBeNull()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('clearSession удаляет запись', () => {
    saveSession(testSession())
    clearSession()

    expect(loadSession()).toBeNull()
  })
})
