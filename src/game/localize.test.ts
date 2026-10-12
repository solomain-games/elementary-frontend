import { describe, expect, it } from 'vitest'
import { localize } from './localize.ts'

describe('localize', () => {
  it('берёт текст на нужном языке', () => {
    expect(localize({ ru: 'Шкатулка', en: 'Box' }, 'en')).toBe('Box')
  })

  it('без перевода берёт первый имеющийся', () => {
    expect(localize({ ru: 'Шкатулка' }, 'en')).toBe('Шкатулка')
  })

  it('пустой текст — пустая строка', () => {
    expect(localize(null, 'ru')).toBe('')
    expect(localize({}, 'ru')).toBe('')
  })
})
