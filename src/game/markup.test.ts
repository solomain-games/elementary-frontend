import { describe, expect, it } from 'vitest'
import { parseMarkup } from './markup.ts'

describe('parseMarkup', () => {
  it('обычный текст — один узел', () => {
    expect(parseMarkup('Чек из магазина')).toEqual([{ type: 'text', text: 'Чек из магазина' }])
  })

  it('пустая строка — пустой список', () => {
    expect(parseMarkup('')).toEqual([])
  })

  it('жирный и подчёркнутый', () => {
    expect(parseMarkup('a **b** c __d__')).toEqual([
      { type: 'text', text: 'a ' },
      { type: 'bold', children: [{ type: 'text', text: 'b' }] },
      { type: 'text', text: ' c ' },
      { type: 'underline', children: [{ type: 'text', text: 'd' }] },
    ])
  })

  it('выделения вкладываются', () => {
    expect(parseMarkup('**жирный __и подчёркнутый__**')).toEqual([
      {
        type: 'bold',
        children: [
          { type: 'text', text: 'жирный ' },
          { type: 'underline', children: [{ type: 'text', text: 'и подчёркнутый' }] },
        ],
      },
    ])
  })

  it('ссылка на карту', () => {
    expect(parseMarkup('см. [[15]].')).toEqual([
      { type: 'text', text: 'см. ' },
      { type: 'cardRef', number: 15 },
      { type: 'text', text: '.' },
    ])
  })

  it('ссылка внутри выделения', () => {
    expect(parseMarkup('**[[2]]**')).toEqual([
      { type: 'bold', children: [{ type: 'cardRef', number: 2 }] },
    ])
  })

  it('перенос строки; \\r из Windows-переносов отбрасывается', () => {
    expect(parseMarkup('a\r\nb')).toEqual([
      { type: 'text', text: 'a' },
      { type: 'lineBreak' },
      { type: 'text', text: 'b' },
    ])
  })

  it('маркер без пары остаётся текстом', () => {
    expect(parseMarkup('5 ** 2 = 25')).toEqual([{ type: 'text', text: '5 ** 2 = 25' }])
    expect(parseMarkup('snake__case')).toEqual([{ type: 'text', text: 'snake__case' }])
  })

  it('пустое выделение остаётся текстом', () => {
    expect(parseMarkup('****')).toEqual([{ type: 'text', text: '****' }])
  })

  it('неверная ссылка остаётся текстом', () => {
    expect(parseMarkup('[[abc]] [[]]')).toEqual([{ type: 'text', text: '[[abc]] [[]]' }])
  })

  it('карта №4 из дела-заглушки', () => {
    expect(
      parseMarkup('Записка в кармане гостьи:\n__Встретимся у ломбарда__ в **10 утра**'),
    ).toEqual([
      { type: 'text', text: 'Записка в кармане гостьи:' },
      { type: 'lineBreak' },
      { type: 'underline', children: [{ type: 'text', text: 'Встретимся у ломбарда' }] },
      { type: 'text', text: ' в ' },
      { type: 'bold', children: [{ type: 'text', text: '10 утра' }] },
    ])
  })
})
