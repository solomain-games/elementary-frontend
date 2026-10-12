import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { parseMarkup, type MarkupNode } from '../../game/markup.ts'
import './RichText.css'

interface RichTextProps {
  /** Текст с разметкой (**жирный**, __подчёркнутый__, [[15]], \n). */
  text: string
  /** Если задан, ссылки [[15]] кликабельны и вызывают его с номером карты (финал, ТЗ 4.8). */
  onCardRef?: (number: number) => void
}

/** Текст дела с разметкой. Рисует React-элементы, а не HTML-строку. */
function RichText({ text, onCardRef }: RichTextProps) {
  const { t } = useTranslation()

  const render = (nodes: MarkupNode[]): ReactNode[] =>
    nodes.map((node, index) => {
      switch (node.type) {
        case 'text':
          return <Fragment key={index}>{node.text}</Fragment>
        case 'bold':
          return <strong key={index}>{render(node.children)}</strong>
        case 'underline':
          return <u key={index}>{render(node.children)}</u>
        case 'lineBreak':
          return <br key={index} />
        case 'cardRef': {
          const label = t('card.ref', { number: node.number })
          return onCardRef ? (
            <button
              key={index}
              type="button"
              className="rich-text__card-ref rich-text__card-ref--link"
              onClick={(event) => {
                event.stopPropagation() // клик по ссылке не должен открывать карту, внутри которой она
                onCardRef(node.number)
              }}
            >
              {label}
            </button>
          ) : (
            <span key={index} className="rich-text__card-ref">
              {label}
            </span>
          )
        }
      }
    })

  return <>{render(parseMarkup(text))}</>
}

export default RichText
