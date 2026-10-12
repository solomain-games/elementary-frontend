// Типы карт из протокола (docs/protocol.md, раздел 5.3: поля hand, table, discard, allCards).

/** Текст дела на нескольких языках: { "ru": "...", "en": "..." }. */
export type LocalizedText = Record<string, string>

/** Выравнивание текста на текстовой карте; одно на всю карту. */
export type TextAlign = 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFY'

/** Карта-картинка: изображение и необязательная подпись. */
export interface ImageCardFace {
  number: number
  image: string
  caption: LocalizedText | null
}

/** Текстовая карта: текст с разметкой поверх фона. */
export interface TextCardFace {
  number: number
  background: string
  text: LocalizedText
  align: TextAlign
}

/** Лицо карты, как его видит игрок. Признака «относится к делу» здесь нет: он раскрывается только в финале. */
export type CardFace = ImageCardFace | TextCardFace

/** Тип карты в протоколе различается по наличию поля image или background. */
export function isImageCard(face: CardFace): face is ImageCardFace {
  return 'image' in face
}
