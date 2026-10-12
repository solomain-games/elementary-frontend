import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { TextCardFace } from '../../game/types.ts'
import CardPreview from './CardPreview.tsx'

const card: TextCardFace = {
  number: 2,
  background: 'backgrounds/paper.webp',
  text: { ru: 'Смотри [[1]]' },
  align: 'LEFT',
}

describe('CardPreview', () => {
  it('без заголовка: номер виден только на самой карте', () => {
    render(<CardPreview face={card} caseId="demo" language="ru" onClose={() => {}} />)

    expect(screen.getByRole('button', { name: 'Карта №2' })).toBeInTheDocument()
    expect(screen.queryByText('Карта №2')).toBeNull()
  })

  it('клик по карте закрывает просмотр, клик по ссылке — нет', () => {
    const onClose = vi.fn()
    const onCardRef = vi.fn()
    render(
      <CardPreview
        face={card}
        caseId="demo"
        language="ru"
        onClose={onClose}
        onCardRef={onCardRef}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '№1' }))
    expect(onCardRef).toHaveBeenCalledWith(1)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Карта №2' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
