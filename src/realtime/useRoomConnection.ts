import { useCallback, useEffect, useRef } from 'react'
import type { CommandName } from '../game/protocol.ts'
import { useAuth } from '../auth/useAuth.ts'
import { connectToRoom, type RoomConnection } from './gameClient.ts'
import { useRoomStore } from './roomStore.ts'

/**
 * Держит WebSocket-подключение к комнате, пока компонент на экране, и складывает
 * снимки в хранилище useRoomStore. Возвращает функцию отправки команд игры.
 *
 * @param code    код комнаты; null — пока не подключаться (например, ещё не вошли по REST)
 */
export function useRoomConnection(code: string | null) {
  const { session, logout } = useAuth()
  const connection = useRef<RoomConnection | null>(null)

  // Токен читаем через ref: смена токена не должна рвать соединение,
  // новый токен уйдёт при следующем переподключении
  const token = useRef(session?.token ?? null)
  useEffect(() => {
    token.current = session?.token ?? null
  }, [session])
  const playerId = session?.user.id ?? null

  useEffect(() => {
    if (code === null || playerId === null) {
      return
    }
    const store = useRoomStore.getState()
    store.enter(code)

    const current = connectToRoom({
      code,
      getToken: () => token.current,
      onSnapshot: (snapshot) => useRoomStore.getState().applySnapshot(snapshot),
      onEvent: (event) => {
        if (event.type === 'PLAYER_KICKED' && event.playerId === playerId) {
          useRoomStore.getState().markKicked()
          current.disconnect()
        }
      },
      onCommandError: (error) => useRoomStore.getState().setCommandError(error),
      onStatus: (status) => useRoomStore.getState().setConnection(status),
      onUnauthorized: logout,
    })
    connection.current = current

    return () => {
      current.disconnect()
      connection.current = null
      useRoomStore.getState().exit()
    }
  }, [code, playerId, logout])

  const send = useCallback(
    (command: CommandName, body?: Record<string, unknown>) =>
      connection.current?.send(command, body),
    [],
  )

  return { send }
}
