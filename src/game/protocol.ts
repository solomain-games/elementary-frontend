// Сообщения протокола (docs/protocol.md): REST-ответы, снимки, события и ошибки команд.
// Типы карт — в types.ts.
import type { CardFace, LocalizedText } from './types.ts'

/** Версия протокола, которую понимает клиент. */
export const PROTOCOL_VERSION = 1

// ---------- REST (раздел 4) ----------

export interface PlayersRange {
  min: number
  max: number
}

/** Дело в списке для выбора (4.2). */
export interface CaseSummary {
  id: string
  title: LocalizedText
  summary: LocalizedText
  cover: string
  languages: string[]
  recommendedPlayers: PlayersRange
  durationMinutes: number
}

/** Допустимые значения таймера хода; null — без таймера (4.4). */
export const TURN_TIMEOUTS = [30, 60, 120] as const
export type TurnTimeout = (typeof TURN_TIMEOUTS)[number]

export interface CreateRoomRequest {
  caseId: string
  language: string
  maxPlayers: number
  turnTimeoutSeconds: TurnTimeout | null
}

export interface CreateRoomResponse {
  code: string
}

export type RoomStatus = 'WAITING' | 'IN_GAME' | 'FINISHED'

/** Открытые сведения о комнате (4.5). */
export interface RoomInfo {
  code: string
  caseId: string
  caseTitle: LocalizedText | null
  language: string
  players: number
  maxPlayers: number
  status: RoomStatus
}

// ---------- Снимок (5.3) ----------

export interface RoomMember {
  id: string
  name: string
  /** Есть ли у игрока открытое подключение. */
  online: boolean
}

/** Синхронный показ предыстории (раздел 6). */
export interface ProloguePlayback {
  startsAt: string
  readyPlayerIds: string[]
}

export interface RoomSnapshot {
  code: string
  caseId: string
  language: string
  maxPlayers: number
  turnTimeoutSeconds: number | null
  hostId: string
  status: RoomStatus
  /** Все, кто в комнате, в порядке входа. */
  members: RoomMember[]
  prologue: ProloguePlayback | null
}

export type Phase = 'PROLOGUE' | 'PLAYING' | 'NO_MOVES_LEFT' | 'ANSWERING' | 'FINISHED'
export type PlayerStatus = 'ACTIVE' | 'DISCONNECTED' | 'LEFT'

export interface PlayerSummary {
  id: string
  name: string
  status: PlayerStatus
  handSize: number
}

export interface VoteView {
  initiatorId: string
  /** id игрока → голос «за». */
  votes: Record<string, boolean>
  deadline: string
  votesNeeded: number
}

export interface QuestionView {
  id: string
  text: LocalizedText
  options: { id: string; text: LocalizedText }[]
}

export interface AnsweringView {
  questions: QuestionView[]
  participants: string[]
  answered: string[]
  /** Свои ответы: id вопроса → id варианта. */
  ownAnswers: Record<string, string>
}

export interface Reveal {
  discard: CardFace[]
  allCards: CardFace[]
  relevantCards: number[]
  solution: LocalizedText
  correctAnswers: Record<string, string>
  scores: Record<string, number>
}

/** Представление партии для одного игрока: только то, что ему можно видеть. */
export interface PlayerView {
  caseId: string
  phase: Phase
  viewerId: string
  hand: CardFace[]
  table: CardFace[]
  /** В порядке ходов. */
  players: PlayerSummary[]
  currentPlayerId: string | null
  deckSize: number
  discardSize: number
  turnNumber: number
  turnDeadline: string | null
  vote: VoteView | null
  answering: AnsweringView | null
  reveal: Reveal | null
}

/** Личный снимок комнаты и партии; приходит в /user/queue/state. */
export interface Snapshot {
  protocolVersion: number
  /** Растёт с каждым изменением; снимок с меньшим номером устарел. */
  version: number
  serverTime: string
  room: RoomSnapshot
  /** null — зал ожидания. */
  game: PlayerView | null
}

// ---------- События (5.4) ----------

export type RoomEvent =
  | { type: 'PLAYER_JOINED'; playerId: string; name: string }
  | { type: 'PLAYER_LEFT_ROOM'; playerId: string }
  | { type: 'PLAYER_KICKED'; playerId: string }
  | { type: 'GAME_STARTED' }
  | { type: 'CARD_PLAYED'; playerId: string; cardNumber: number; byTimer: boolean }
  | { type: 'CARD_DISCARDED'; playerId: string }
  | { type: 'PLAYER_DISCONNECTED' | 'PLAYER_RECONNECTED' | 'PLAYER_GAVE_UP'; playerId: string }
  | { type: 'VOTE_STARTED'; initiatorId: string }
  | { type: 'VOTE_PASSED' | 'VOTE_FAILED' | 'NO_MOVES_LEFT' | 'RESULTS_SHOWN' }

// ---------- Команды и ошибки (5.5, 5.6) ----------

export type CommandName =
  | 'sync'
  | 'ready'
  | 'begin'
  | 'play'
  | 'discard'
  | 'startVote'
  | 'castVote'
  | 'submitAnswers'
  | 'forceResults'

/** Ответ на свою отклонённую команду; приходит в /user/queue/errors. */
export interface CommandError {
  requestId: string | null
  command: string
  code: string
}
