import { Modal } from 'antd'
import type { CardFace } from '../../game/types.ts'
import './CardPreview.css'
import GameCard from './GameCard.tsx'

interface CardPreviewProps {
  /** Открытая карта; null — окно закрыто. */
  face: CardFace | null
  caseId: string
  language: string
  onClose: () => void
  onCardRef?: (number: number) => void
}

/**
 * Просмотр карты крупно — как просмотр фотографии: только карта поверх затемнённой страницы,
 * без заголовка и рамки окна (номер и так виден на карте).
 * Закрывается клавишей Esc, кликом по затемнению или по самой карте — на телефоне это удобнее
 * всего. Клик по ссылке [[15]] в тексте карты окно не закрывает, а открывает другую карту.
 *
 * Ширина подобрана так, чтобы карта целиком помещалась на экране:
 * не шире 90% экрана и не выше 80% его высоты (ширина = высота × 5/7).
 */
function CardPreview({ face, caseId, language, onClose, onCardRef }: CardPreviewProps) {
  return (
    <Modal
      open={face !== null}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      destroyOnHidden
      rootClassName="card-preview"
      width="min(90vw, calc(80vh * 5 / 7))"
    >
      {face && (
        <GameCard
          face={face}
          caseId={caseId}
          language={language}
          onClick={onClose}
          onCardRef={onCardRef}
        />
      )}
    </Modal>
  )
}

export default CardPreview
