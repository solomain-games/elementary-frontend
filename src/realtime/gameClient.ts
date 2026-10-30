// Подключение к комнате по STOMP поверх WebSocket (протокол, раздел 5).
// Модуль ничего не знает о React и хранилище: он только соединяется, подписывается,
// разбирает сообщения и сообщает о них через колбэки. Связывает всё useRoomConnection.
import { Client, type IFrame, type IMessage } from '@stomp/stompjs'
import type { CommandError, CommandName, RoomEvent, Snapshot } from '../game/protocol.ts'

/** Состояние соединения, как его видит игрок. */
export type ConnectionStatus =
  | 'connecting' // первое подключение
  | 'connected'
  | 'reconnecting' // связь пропала, клиент сам пробует снова
  | 'outdated' // сервер требует обновить страницу (CLIENT_OUTDATED)
  | 'closed' // отключились сами

export interface RoomConnectionHandlers {
  onSnapshot: (snapshot: Snapshot) => void
  onEvent: (event: RoomEvent) => void
  onCommandError: (error: CommandError) => void
  onStatus: (status: ConnectionStatus) => void
  /** Сервер отверг токен (ERROR UNAUTHORIZED): нужно войти заново. */
  onUnauthorized: () => void
}

export interface RoomConnectionOptions extends RoomConnectionHandlers {
  code: string
  /** Токен берётся при каждом (пере)подключении: так всегда используется актуальный. */
  getToken: () => string | null
  /** Адрес WebSocket; по умолчанию /ws на том же хосте, что и страница. */
  url?: string
}

export interface RoomConnection {
  /** Команда игры: SEND на /app/room/{code}/{команда}. Возвращает requestId. */
  send: (command: CommandName, body?: Record<string, unknown>) => string
  disconnect: () => void
}

/** Пауза перед повторным подключением. */
export const RECONNECT_DELAY_MS = 2000
/** Пульс в обе стороны (протокол, 5.1): так обрыв замечается за секунды. */
export const HEARTBEAT_MS = 10_000

/** ws://хост/ws для http-страницы и wss://хост/ws для https: адрес совпадает со страницей. */
export function defaultSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws`
}

export function connectToRoom(options: RoomConnectionOptions): RoomConnection {
  const { code, getToken } = options
  let stopped = false

  const setStatus = (status: ConnectionStatus) => {
    if (!stopped || status === 'closed' || status === 'outdated') {
      options.onStatus(status)
    }
  }

  const client = new Client({
    brokerURL: options.url ?? defaultSocketUrl(),
    reconnectDelay: RECONNECT_DELAY_MS,
    heartbeatIncoming: HEARTBEAT_MS,
    heartbeatOutgoing: HEARTBEAT_MS,

    // Перед каждой попыткой: свежий токен в кадре CONNECT (браузер не умеет передать
    // заголовок Authorization в самом WebSocket-рукопожатии — протокол, 3.2)
    beforeConnect: () => {
      client.connectHeaders = {
        Authorization: `Bearer ${getToken() ?? ''}`,
        'X-Client-Version': __APP_VERSION__,
      }
    },

    onConnect: () => {
      client.subscribe('/user/queue/state', (message) => {
        const snapshot = parse<Snapshot>(message)
        if (snapshot) options.onSnapshot(snapshot)
      })
      client.subscribe('/user/queue/errors', (message) => {
        const error = parse<CommandError>(message)
        if (error) options.onCommandError(error)
      })
      client.subscribe(`/topic/room.${code}`, (message) => {
        const event = parse<RoomEvent>(message)
        if (event) options.onEvent(event)
      })
      setStatus('connected')
      // После каждого (пере)подключения просим актуальный снимок (протокол, 5.2)
      publish('sync', {})
    },

    onStompError: (frame: IFrame) => {
      const reason = frame.headers['message']
      if (reason === 'UNAUTHORIZED') {
        stop('closed')
        options.onUnauthorized()
      } else if (reason === 'CLIENT_OUTDATED') {
        stop('outdated')
      }
      // Прочие ошибки: сервер закроет соединение, клиент переподключится сам
    },

    onWebSocketClose: () => {
      // Обрыв: stompjs сам переподключится через RECONNECT_DELAY_MS
      setStatus('reconnecting')
    },
  })

  const publish = (command: CommandName, body: Record<string, unknown>): string => {
    const requestId = crypto.randomUUID()
    if (client.connected) {
      client.publish({
        destination: `/app/room/${code}/${command}`,
        body: JSON.stringify({ requestId, ...body }),
        headers: { 'content-type': 'application/json' },
      })
    }
    return requestId
  }

  const stop = (status: ConnectionStatus) => {
    if (stopped) return
    stopped = true
    void client.deactivate()
    setStatus(status)
  }

  setStatus('connecting')
  client.activate()

  return {
    send: (command, body = {}) => publish(command, body),
    disconnect: () => stop('closed'),
  }
}

/** JSON из тела сообщения; испорченное сообщение пропускаем, а не роняем приложение. */
function parse<T>(message: IMessage): T | null {
  try {
    return JSON.parse(message.body) as T
  } catch {
    console.warn('Malformed STOMP message', message.body)
    return null
  }
}
