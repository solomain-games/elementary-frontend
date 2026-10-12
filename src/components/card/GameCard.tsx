import type { CSSProperties, KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { caseAssetUrl } from '../../game/assets.ts'
import { localize } from '../../game/localize.ts'
import { isImageCard, type CardFace } from '../../game/types.ts'
import RichText from './RichText.tsx'
import './GameCard.css'

interface GameCardProps {
  face: CardFace
  /** Дело, из папки которого берутся изображения. */
  caseId: string
  /** Язык текстов дела (язык комнаты). */
  language: string
  /** Ширина карты; высота вычисляется из пропорций 5:7. По умолчанию — вся ширина родителя. */
  width?: CSSProperties['width']
  /** Клик по карте; с ним карта становится кнопкой (доступна с клавиатуры). */
  onClick?: () => void
  /** Клик по ссылке [[15]] в тексте карты. */
  onCardRef?: (number: number) => void
}

/**
 * Карта дела: картинка с подписью или текст поверх фона, и номер в углу.
 * Все размеры внутри карты заданы в долях её ширины (единицы cqi), поэтому карта
 * выглядит одинаково и в руке на телефоне, и крупно на большом экране.
 */
function GameCard({ face, caseId, language, width = '100%', onClick, onCardRef }: GameCardProps) {
  const { t } = useTranslation()
  const label = t('card.label', { number: face.number })

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault() // пробел иначе прокрутил бы страницу
      onClick()
    }
  }

  return (
    <div
      className={onClick ? 'game-card game-card--clickable' : 'game-card'}
      style={{ width }}
      role={onClick ? 'button' : 'figure'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={label}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="game-card__face">
        {isImageCard(face) ? (
          <>
            <img
              className="game-card__image"
              src={caseAssetUrl(caseId, face.image)}
              alt={localize(face.caption, language) || label}
              loading="lazy"
              draggable={false}
            />
            {face.caption && (
              <div className="game-card__caption">{localize(face.caption, language)}</div>
            )}
          </>
        ) : (
          <div
            className="game-card__text-face"
            style={{ backgroundImage: `url("${caseAssetUrl(caseId, face.background)}")` }}
          >
            <div className={`game-card__text game-card__text--${face.align.toLowerCase()}`}>
              <RichText text={localize(face.text, language)} onCardRef={onCardRef} />
            </div>
          </div>
        )}
        <span className="game-card__number" aria-hidden="true">
          {face.number}
        </span>
      </div>
    </div>
  )
}

export default GameCard
