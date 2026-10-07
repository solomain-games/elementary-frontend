import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

// MemoryRouter хранит адрес в памяти, а не в строке браузера: удобно задавать стартовую страницу в тестах
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('маршруты', () => {
  it('на главной показывает страницу входа', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })

  it('показывает код комнаты из адреса', () => {
    renderAt('/room/ABC123')
    expect(screen.getByRole('heading', { name: 'Комната ABC123' })).toBeInTheDocument()
  })

  it('на неизвестном адресе показывает 404', () => {
    renderAt('/no-such-page')
    expect(screen.getByText('Такой страницы нет')).toBeInTheDocument()
  })
})
