import { afterEach, describe, expect, it, vi } from 'vitest'
import { connectToRoom, type RoomConnectionOptions } from './gameClient.ts'

// Подменяем @stomp/stompjs: настоящий WebSocket в тестах не нужен, проверяем,
// что клиент правильно настраивает STOMP и разбирает сообщения
const stomp = vi.hoisted(() => {
  interface Config {
    brokerURL: string
    beforeConnect: () => void
    onConnect: () => void
    onStompError: (frame: { headers: Record<string, string> }) => void
    onWebSocketClose: () => void
  }
  type Handler = (message: { body: string }) => void

  class FakeClient {
    config: Config
    connectHeaders: Record<string, string> = {}
    connected = false
    subscriptions = new Map<string, Handler>()
    published: { destination: string; body: string }[] = []
    activate = vi.fn()
    deactivate = vi.fn(() => Promise.resolve())

    constructor(config: Config) {
      this.config = config
      instances.push(this)
    }

    subscribe(destination: string, handler: Handler) {
      this.subscriptions.set(destination, handler)
    }

    publish(frame: { destination: string; body: string }) {
      this.published.push(frame)
    }

    /** Как будто сервер принял CONNECT. */
    simulateConnect() {
      this.config.beforeConnect()
      this.connected = true
      this.config.onConnect()
    }

    deliver(destination: string, body: string) {
      this.subscriptions.get(destination)?.({ body })
    }
  }

  const instances: FakeClient[] = []
  return { FakeClient, instances }
})

vi.mock('@stomp/stompjs', () => ({ Client: stomp.FakeClient }))

function connect(overrides: Partial<RoomConnectionOptions> = {}) {
  const options = {
    code: 'K7Q2PX',
    getToken: () => 'token-1',
    url: 'ws://test/ws',
    onSnapshot: vi.fn(),
    onEvent: vi.fn(),
    onCommandError: vi.fn(),
    onStatus: vi.fn(),
    onUnauthorized: vi.fn(),
    ...overrides,
  }
  const connection = connectToRoom(options)
  const client = stomp.instances.at(-1)!
  return { options, connection, client }
}

describe('connectToRoom', () => {
  afterEach(() => {
    stomp.instances.length = 0
  })

  it('подключается с токеном и версией, подписывается и просит снимок', () => {
    const { options, client } = connect()

    expect(client.activate).toHaveBeenCalled()
    expect(options.onStatus).toHaveBeenLastCalledWith('connecting')

    client.simulateConnect()

    expect(client.connectHeaders.Authorization).toBe('Bearer token-1')
    expect(client.connectHeaders['X-Client-Version']).toEqual(expect.any(String))
    expect([...client.subscriptions.keys()]).toEqual([
      '/user/queue/state',
      '/user/queue/errors',
      '/topic/room.K7Q2PX',
    ])
    expect(client.published).toHaveLength(1)
    expect(client.published[0].destination).toBe('/app/room/K7Q2PX/sync')
    expect(JSON.parse(client.published[0].body)).toHaveProperty('requestId')
    expect(options.onStatus).toHaveBeenLastCalledWith('connected')
  })

  it('при переподключении берёт свежий токен', () => {
    let token = 'token-1'
    const { client } = connect({ getToken: () => token })
    client.simulateConnect()

    token = 'token-2'
    client.simulateConnect()

    expect(client.connectHeaders.Authorization).toBe('Bearer token-2')
  })

  it('разбирает снимки, события и ошибки команд', () => {
    const { options, client } = connect()
    client.simulateConnect()

    client.deliver('/user/queue/state', '{"version":7}')
    client.deliver('/topic/room.K7Q2PX', '{"type":"GAME_STARTED"}')
    client.deliver('/user/queue/errors', '{"requestId":"r1","command":"play","code":"NOT_YOUR_TURN"}')

    expect(options.onSnapshot).toHaveBeenCalledWith({ version: 7 })
    expect(options.onEvent).toHaveBeenCalledWith({ type: 'GAME_STARTED' })
    expect(options.onCommandError).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'NOT_YOUR_TURN' }),
    )
  })

  it('испорченное сообщение пропускается', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { options, client } = connect()
    client.simulateConnect()

    client.deliver('/user/queue/state', '{не json')

    expect(options.onSnapshot).not.toHaveBeenCalled()
  })

  it('команда уходит на /app/room/{код}/{команда} с requestId', () => {
    const { connection, client } = connect()
    client.simulateConnect()

    const requestId = connection.send('play', { cardNumber: 3 })

    const frame = client.published.at(-1)!
    expect(frame.destination).toBe('/app/room/K7Q2PX/play')
    expect(JSON.parse(frame.body)).toEqual({ requestId, cardNumber: 3 })
  })

  it('обрыв связи — «переподключение»; после своего отключения статус не меняется', () => {
    const { options, connection, client } = connect()
    client.simulateConnect()

    client.config.onWebSocketClose()
    expect(options.onStatus).toHaveBeenLastCalledWith('reconnecting')

    connection.disconnect()
    client.config.onWebSocketClose()
    expect(options.onStatus).toHaveBeenLastCalledWith('closed')
    expect(client.deactivate).toHaveBeenCalled()
  })

  it('ERROR UNAUTHORIZED — отключиться и сообщить, что нужен новый вход', () => {
    const { options, client } = connect()

    client.config.onStompError({ headers: { message: 'UNAUTHORIZED' } })

    expect(client.deactivate).toHaveBeenCalled()
    expect(options.onUnauthorized).toHaveBeenCalled()
  })

  it('ERROR CLIENT_OUTDATED — просить обновить страницу', () => {
    const { options, client } = connect()

    client.config.onStompError({ headers: { message: 'CLIENT_OUTDATED' } })

    expect(options.onStatus).toHaveBeenLastCalledWith('outdated')
    expect(options.onUnauthorized).not.toHaveBeenCalled()
  })
})
