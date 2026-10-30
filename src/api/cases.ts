import type { CaseSummary } from '../game/protocol.ts'
import { apiRequest } from './client.ts'

/** Дела для выбора в комнате (протокол, 4.2). */
export function fetchCases(): Promise<CaseSummary[]> {
  return apiRequest<CaseSummary[]>('/api/game/cases')
}
