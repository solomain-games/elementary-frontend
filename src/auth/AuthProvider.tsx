import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loginAsGuest } from '../api/auth.ts'
import { configureApiAuth } from '../api/client.ts'
import { AuthContext, type AuthContextValue } from './AuthContext.ts'
import {
  SESSION_STORAGE_KEY,
  clearSession,
  loadSession,
  msUntilExpiry,
  saveSession,
  type Session,
} from './session.ts'

/**
 * Хранит сессию гостя и раздаёт её компонентам через контекст (хук useAuth).
 * - При запуске берёт сессию из localStorage: перезагрузка страницы не разлогинивает.
 * - Передаёт токен HTTP-клиенту, чтобы он добавлял его во все запросы.
 * - Сбрасывает сессию, когда истекает срок токена или сервер ответил 401.
 * - Следит за другими вкладками: вход или выход в одной виден во всех.
 */
function AuthProvider({ children }: { children: ReactNode }) {
  // Функция в useState выполняется один раз, при первой отрисовке
  const [session, setSession] = useState<Session | null>(() => loadSession())

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const login = useCallback(async (name: string) => {
    const newSession = await loginAsGuest(name)
    saveSession(newSession)
    setSession(newSession)
    return newSession
  }, [])

  useEffect(() => {
    configureApiAuth({ getToken: () => session?.token ?? null, onUnauthorized: logout })
  }, [session, logout])

  // Токен истёк, пока страница открыта, — выходим, чтобы не слать запросы, которые получат 401
  useEffect(() => {
    if (!session) {
      return
    }
    const timer = setTimeout(logout, msUntilExpiry(session))
    return () => clearTimeout(timer)
  }, [session, logout])

  // Событие storage приходит, когда localStorage изменили в другой вкладке того же сайта
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY || event.key === null) {
        setSession(loadSession())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // useMemo: новый объект только при смене сессии, иначе все потребители перерисовывались бы зря
  const value = useMemo<AuthContextValue>(
    () => ({ session, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
