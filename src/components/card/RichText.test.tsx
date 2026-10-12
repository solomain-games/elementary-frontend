import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RichText from './RichText.tsx'

describe('RichText', () => {
  it('без обработчика ссылка на карту — просто текст', () => {
    render(<RichText text="см. [[15]]" />)

    expect(screen.getByText('№15')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('с обработчиком ссылка — кнопка, передаёт номер карты', () => {
    const onCardRef = vi.fn()
    render(<RichText text="см. [[15]] и [[2]]" onCardRef={onCardRef} />)

    fireEvent.click(screen.getByRole('button', { name: '№2' }))

    expect(onCardRef).toHaveBeenCalledWith(2)
  })

  it('клик по ссылке не доходит до карты, в которой она лежит', () => {
    const onCardClick = vi.fn()
    render(
      <div onClick={onCardClick}>
        <RichText text="[[3]]" onCardRef={() => {}} />
      </div>,
    )

    fireEvent.click(screen.getByRole('button', { name: '№3' }))

    expect(onCardClick).not.toHaveBeenCalled()
  })

  it('текст не превращается в HTML', () => {
    const { container } = render(<RichText text={'<img src=x onerror="alert(1)">'} />)

    expect(container.querySelector('img')).toBeNull()
    expect(container).toHaveTextContent('<img src=x onerror="alert(1)">')
  })
})
