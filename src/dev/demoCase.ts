import type { CardFace, LocalizedText } from '../game/types.ts'

// Дело-заглушка из репозитория cases (cases/demo/case.json) в том виде, в каком карты
// придут от сервера (протокол, 5.3): без признака relevant, выравнивание заглавными.
// Нужно, пока сервер ещё не умеет отдавать партию; изображения раздаёт Vite (vite.config.ts).

export const DEMO_CASE_ID = 'demo'
export const DEMO_LANGUAGE = 'ru'

export const demoCards: CardFace[] = [
  {
    number: 1,
    image: 'cards/01.webp',
    caption: { ru: 'Пустая шкатулка в спальне' },
  },
  {
    number: 2,
    background: 'backgrounds/paper.webp',
    text: {
      ru: 'Показания садовника: «Весь вечер я был в оранжерее. **Свет в спальне погас около полуночи**».',
    },
    align: 'LEFT',
  },
  {
    number: 3,
    image: 'cards/03.webp',
    caption: { ru: 'Следы земли на ковре' },
  },
  {
    number: 4,
    background: 'backgrounds/paper.webp',
    text: { ru: 'Записка в кармане гостьи:\n__Встретимся у ломбарда__ в **10 утра**' },
    align: 'CENTER',
  },
  {
    number: 5,
    background: 'backgrounds/receipt.webp',
    text: { ru: 'Чек из цветочного магазина на имя хозяйки.' },
    align: 'LEFT',
  },
]

export const demoSolution: LocalizedText = {
  ru: 'Гостья забрала браслет из шкатулки ([[1]]) после того, как погас свет ([[2]]), и утром собиралась заложить его в ломбарде ([[4]]). Следы земли ([[3]]) оставил садовник, когда приносил цветы ([[5]]).',
}
