// Разметка текстов дел (формат дел и протокол, раздел 2):
//   **жирный**   __подчёркнутый__   [[15]] — ссылка на карту №15   \n — перенос строки
// Парсер превращает строку в дерево узлов, а компонент RichText рисует его в React.
// HTML из текста дела не создаётся, поэтому вставить в карту скрипт или чужую разметку нельзя.

export type MarkupNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; children: MarkupNode[] }
  | { type: 'underline'; children: MarkupNode[] }
  | { type: 'cardRef'; number: number }
  | { type: 'lineBreak' }

const CARD_REF = /^\[\[(\d{1,3})\]\]/

/**
 * Разбирает текст с разметкой. Правила:
 * - выделения можно вкладывать друг в друга: **жирный __и подчёркнутый__**;
 * - маркер без пары остаётся обычным текстом: «5 ** 2» выводится как есть;
 * - пустое выделение (****) тоже остаётся текстом.
 */
export function parseMarkup(source: string): MarkupNode[] {
  const nodes: MarkupNode[] = []
  let buffer = ''

  // Накопленный обычный текст превращается в один узел
  const flush = () => {
    if (buffer) {
      nodes.push({ type: 'text', text: buffer })
      buffer = ''
    }
  }

  let i = 0
  while (i < source.length) {
    if (source.startsWith('**', i) || source.startsWith('__', i)) {
      const marker = source.slice(i, i + 2)
      const end = source.indexOf(marker, i + 2)
      if (end > i + 2) {
        flush()
        nodes.push({
          type: marker === '**' ? 'bold' : 'underline',
          children: parseMarkup(source.slice(i + 2, end)),
        })
        i = end + 2
      } else {
        buffer += marker
        i += 2
      }
      continue
    }

    if (source.startsWith('[[', i)) {
      const match = CARD_REF.exec(source.slice(i))
      if (match) {
        flush()
        nodes.push({ type: 'cardRef', number: Number(match[1]) })
        i += match[0].length
        continue
      }
    }

    if (source[i] === '\n') {
      flush()
      nodes.push({ type: 'lineBreak' })
      i++
      continue
    }

    if (source[i] !== '\r') {
      buffer += source[i]
    }
    i++
  }

  flush()
  return nodes
}
