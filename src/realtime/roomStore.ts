// Состояние комнаты и партии на клиенте (Zustand). Истина — последний снимок от сервера:
// клиент не собирает состояние из событий, а заменяет снимок целиком (протокол, 1).
import { create } from 'zustand'
import type { CommandError, Snapshot } from '../game/protocol.ts'
import type { ConnectionStatus } from './gameClient.ts'

export interface RoomStoreState {
  /** Комната, к которой подключены; null — ни к какой. */
  code: string | null
  connection: ConnectionStatus | 'idle'
  snapshot: Snapshot | null
  /** Поправка часов: serverTime − Date.now() из последнего снимка (протокол, 7). */
  clockOffsetMs: number
  /** Последняя отклонённая своя команда. */
  lastCommandError: CommandError | null
  /** Хозяин исключил этого игрока. */
  kicked: boolean

  /** Начать работу с комнатой: всё прежнее состояние сбрасывается. */
  enter: (code: string) => void
  /** Выйти: состояние очищается. */
  exit: () => void
  applySnapshot: (snapshot: Snapshot, receivedAt?: number) => void
  setConnection: (status: ConnectionStatus) => void
  setCommandError: (error: CommandError | null) => void
  markKicked: () => void
}

const initial = {
  code: null,
  connection: 'idle' as const,
  snapshot: null,
  clockOffsetMs: 0,
  lastCommandError: null,
  kicked: false,
}

export const useRoomStore = create<RoomStoreState>()((set, get) => ({
  ...initial,

  enter: (code) => set({ ...initial, code }),

  exit: () => set(initial),

  applySnapshot: (snapshot, receivedAt = Date.now()) => {
    const { code, snapshot: current } = get()
    // Снимок другой комнаты (пришёл после ухода) — не наш
    if (code !== null && snapshot.room.code !== code) return
    // Снимки могут прийти не по порядку: старый не должен откатить новый
    if (current && snapshot.version < current.version) return
    set({ snapshot, clockOffsetMs: Date.parse(snapshot.serverTime) - receivedAt })
  },

  setConnection: (connection) => set({ connection }),

  setCommandError: (lastCommandError) => set({ lastCommandError }),

  markKicked: () => set({ kicked: true }),
}))

/** Текущее время по часам сервера, с учётом поправки. */
export function serverNow(clockOffsetMs: number): number {
  return Date.now() + clockOffsetMs
}
