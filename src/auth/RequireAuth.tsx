import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth.ts'

/** Адрес, с которого отправили на вход; после входа игрок вернётся туда. */
export interface LoginRedirectState {
  from: string
}

/**
 * Обёртка для страниц, где нужен вход. Без сессии отправляет на /login и запоминает,
 * куда игрок шёл: так ссылка-приглашение /room/K7Q2PX после входа приведёт в комнату.
 */
function RequireAuth() {
  const { session } = useAuth()
  const location = useLocation()

  if (!session) {
    const state: LoginRedirectState = { from: location.pathname + location.search }
    return <Navigate to="/login" replace state={state} />
  }
  return <Outlet />
}

export default RequireAuth
