import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { ImageCardFace, TextCardFace } from '../../game/types.ts'
import GameCard from './GameCard.tsx'

const imageCard: ImageCardFace = {
  number: 1,
  image: 'cards/01.webp',
  caption: { ru: 'Пустая шкатулка в спальне' },
}

const textCard: TextCardFace = {
  number: 4,
  background: 'backgrounds/paper.webp',
  text: { ru: 'Записка:\n__Встретимся у ломбарда__ в **10 утра**' },
  align: 'CENTER',
}

describe('GameCard', () => {
  it('карта-картинка: изображение из папки дела, подпись и номер', () => {
    render(<GameCard face={imageCard} caseId="demo" language="ru" />)

    const image = screen.getByRole('img', { name: 'Пустая шкатулка в спальне' })
    expect(image).toHaveAttribute('src', '/cases/demo/cards/01.webp')
    expect(screen.getByText('Пустая шкатулка в спальне')).toBeInTheDocument()
    expect(screen.getByRole('figure', { name: 'Карта №1' })).toHaveTextContent('1')
  })

  it('карта-картинка без подписи: alt — номер карты', () => {
    render(<GameCard face={{ ...imageCard, caption: null }} caseId="demo" language="ru" />)

    expect(screen.getByRole('img', { name: 'Карта №1' })).toBeInTheDocument()
  })

  it('текстовая карта: разметка, выравнивание и фон', () => {
    const { container } = render(<GameCard face={textCard} caseId="demo" language="ru" />)

    expect(screen.getByText('10 утра').tagName).toBe('STRONG')
    expect(screen.getByText('Встретимся у ломбарда').tagName).toBe('U')
    expect(container.querySelector('br')).not.toBeNull()
    expect(container.querySelector('.game-card__text--center')).not.toBeNull()
    expect(
      container.querySelector<HTMLElement>('.game-card__text-face')?.style.backgroundImage,
    ).toContain('/cases/demo/backgrounds/paper.webp')
  })

  it('без onClick карта не кнопка', () => {
    render(<GameCard face={imageCard} caseId="demo" language="ru" />)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('с onClick открывается мышью и с клавиатуры', () => {
    const onClick = vi.fn()
    render(<GameCard face={imageCard} caseId="demo" language="ru" onClick={onClick} />)

    const card = screen.getByRole('button', { name: 'Карта №1' })
    fireEvent.click(card)
    fireEvent.keyDown(card, { key: 'Enter' })
    fireEvent.keyDown(card, { key: ' ' })
    fireEvent.keyDown(card, { key: 'a' })

    expect(onClick).toHaveBeenCalledTimes(3)
  })
})
