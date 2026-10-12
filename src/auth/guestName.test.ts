import { describe, expect, it } from 'vitest'
import { checkGuestName } from './guestName.ts'

describe('checkGuestName', () => {
  it.each(['Анна', 'Dr Watson', 'игрок_1', 'Мария-Луиза', '  Анна  ', 'x'.repeat(24)])(
    '«%s» подходит',
    (name) => {
      expect(checkGuestName(name)).toBeNull()
    },
  )

  it.each([undefined, '', '   '])('пустое имя (%j) — required', (name) => {
    expect(checkGuestName(name)).toBe('required')
  })

  it('25 символов — tooLong; пробелы по краям не считаются', () => {
    expect(checkGuestName('x'.repeat(25))).toBe('tooLong')
    expect(checkGuestName(` ${'x'.repeat(24)} `)).toBeNull()
  })

  it.each(['<script>', 'Анна!', 'a.b', 'emoji 🙂'])('«%s» — invalidChars', (name) => {
    expect(checkGuestName(name)).toBe('invalidChars')
  })
})
