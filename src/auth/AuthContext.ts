import { createContext } from 'react'
import type { Session } from './session.ts'

export interface AuthContextValue {
  /** Текущая сессия; null — игрок не вошёл. */
  session: Session | null
  /** Гостевой вход; при ошибке бросает ApiError. */
  login: (name: string) => Promise<Session>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
