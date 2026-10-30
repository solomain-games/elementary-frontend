import { ApiError } from './client.ts'

/** Коды ошибок REST, для которых у интерфейса есть понятный текст (протокол, 4.1). */
const KNOWN_CODES = [
  'ROOM_NOT_FOUND',
  'ROOM_FULL',
  'GAME_ALREADY_STARTED',
  'KICKED_FROM_ROOM',
  'NOT_HOST',
  'NOT_IN_ROOM',
  'CASE_NOT_FOUND',
  'LANGUAGE_NOT_SUPPORTED',
] as const

export type KnownErrorCode = (typeof KNOWN_CODES)[number]

/** Ключ перевода для ошибки: по коду из ответа сервера, иначе — общий текст. */
export function errorMessageKey(
  error: unknown,
): `errors.codes.${KnownErrorCode}` | 'errors.serverUnavailable' | 'errors.unknown' {
  if (error instanceof ApiError) {
    if ((KNOWN_CODES as readonly string[]).includes(error.code)) {
      return `errors.codes.${error.code as KnownErrorCode}`
    }
    if (error.isServerUnavailable) {
      return 'errors.serverUnavailable'
    }
  }
  return 'errors.unknown'
}
