// REST комнат (протокол, 4.4–4.6). Результат действий участники видят в снимках по WebSocket.
import type { CreateRoomRequest, CreateRoomResponse, RoomInfo } from '../game/protocol.ts'
import { apiRequest } from './client.ts'

const roomPath = (code: string) => `/api/game/rooms/${encodeURIComponent(code)}`

export function createRoom(request: CreateRoomRequest): Promise<CreateRoomResponse> {
  return apiRequest<CreateRoomResponse>('/api/game/rooms', { method: 'POST', body: request })
}

export function fetchRoomInfo(code: string): Promise<RoomInfo> {
  return apiRequest<RoomInfo>(roomPath(code))
}

/** Вход в комнату; повторный вход безопасен. */
export function joinRoom(code: string): Promise<void> {
  return apiRequest<void>(`${roomPath(code)}/join`, { method: 'POST' })
}

export function leaveRoom(code: string): Promise<void> {
  return apiRequest<void>(`${roomPath(code)}/leave`, { method: 'POST' })
}

export function kickPlayer(code: string, playerId: string): Promise<void> {
  return apiRequest<void>(`${roomPath(code)}/kick`, { method: 'POST', body: { playerId } })
}

export function startGame(code: string): Promise<void> {
  return apiRequest<void>(`${roomPath(code)}/start`, { method: 'POST' })
}
