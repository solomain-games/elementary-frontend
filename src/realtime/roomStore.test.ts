import { beforeEach, describe, expect, it } from 'vitest'
import type { Snapshot } from '../game/protocol.ts'
import { useRoomStore } from './roomStore.ts'

function snapshot(
  version: number,
  code = 'K7Q2PX',
  serverTime = '2026-10-30T12:00:10.000Z',
): Snapshot {
  return {
    protocolVersion: 1,
    version,
    serverTime,
    room: {
      code,
      caseId: 'demo',
      language: 'ru',
      maxPlayers: 6,
      turnTimeoutSeconds: null,
      hostId: 'g-anna',
      status: 'WAITING',
      members: [],
      prologue: null,
    },
    game: null,
  }
}

const store = () => useRoomStore.getState()

describe('roomStore', () => {
  beforeEach(() => {
    store().enter('K7Q2PX')
  })

  it('принимает снимок и считает поправку часов', () => {
    store().applySnapshot(snapshot(1), Date.parse('2026-10-30T12:00:07.000Z'))

    expect(store().snapshot?.version).toBe(1)
    expect(store().clockOffsetMs).toBe(3000) // часы сервера спешат на 3 секунды
  })

  it('старый снимок не откатывает новый', () => {
    store().applySnapshot(snapshot(5))
    store().applySnapshot(snapshot(4))

    expect(store().snapshot?.version).toBe(5)
  })

  it('снимок другой комнаты игнорируется', () => {
    store().applySnapshot(snapshot(1, 'ABCDEF'))

    expect(store().snapshot).toBeNull()
  })

  it('вход в комнату сбрасывает прежнее состояние', () => {
    store().applySnapshot(snapshot(3))
    store().markKicked()

    store().enter('ABCDEF')

    expect(store()).toMatchObject({
      code: 'ABCDEF',
      snapshot: null,
      kicked: false,
      connection: 'idle',
    })
  })
})
