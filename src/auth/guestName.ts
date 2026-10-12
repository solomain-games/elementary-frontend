// Правила имени гостя — те же, что проверяет user-service (протокол, 3.1).
// Сервер всё равно проверит сам; здесь — чтобы подсказать ошибку сразу, без запроса.

export const GUEST_NAME_MAX_LENGTH = 24

const ALLOWED = /^[\p{L}\p{N} _-]+$/u

export type GuestNameProblem = 'required' | 'tooLong' | 'invalidChars'

/** Что не так с именем, или null, если всё в порядке. Пробелы по краям не считаются. */
export function checkGuestName(value: string | undefined): GuestNameProblem | null {
  const name = value?.trim() ?? ''
  if (name === '') {
    return 'required'
  }
  if (name.length > GUEST_NAME_MAX_LENGTH) {
    return 'tooLong'
  }
  if (!ALLOWED.test(name)) {
    return 'invalidChars'
  }
  return null
}
