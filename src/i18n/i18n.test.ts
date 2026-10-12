import { describe, expect, it } from 'vitest'
import i18n, { resources } from './index.ts'

/** Все пары «ключ — строка» из вложенного объекта переводов: { 'nav.login': 'Вход', ... }. */
function flatten(tree: object, prefix = ''): Record<string, unknown> {
  return Object.entries(tree).reduce<Record<string, unknown>>((result, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'object' && value !== null
      ? { ...result, ...flatten(value, path) }
      : { ...result, [path]: value }
  }, {})
}

describe('i18n', () => {
  it('по умолчанию интерфейс на русском', () => {
    expect(i18n.language).toBe('ru')
    expect(i18n.t('nav.login')).toBe('Вход')
  })

  it('подставляет параметры в строку', () => {
    expect(i18n.t('room.title', { code: 'K7Q2PX' })).toBe('Комната K7Q2PX')
  })

  it('в русском файле нет пустых строк', () => {
    const entries = Object.entries(flatten(resources.ru.translation))

    expect(entries.length).toBeGreaterThan(0)
    for (const [key, value] of entries) {
      expect(typeof value, key).toBe('string')
      expect((value as string).trim(), key).not.toBe('')
    }
  })
})
