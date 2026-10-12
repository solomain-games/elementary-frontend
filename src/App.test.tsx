import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { SESSION_STORAGE_KEY } from './auth/session.ts'
import { jsonResponse, signIn, testSession } from './test/session.ts'

// MemoryRouter хранит адрес в памяти, а не в строке браузера: удобно задавать стартовую страницу в тестах
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function submitName(name: string) {
  fireEvent.change(screen.getByLabelText('Имя'), { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: 'Войти' }))
}

describe('маршруты', () => {
  it('без входа главная отправляет на страницу входа', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })

  it('вошедший видит главную со своим именем', () => {
    signIn('Анна')
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Здравствуйте, Анна!' })).toBeInTheDocument()
  })

  it('показывает код комнаты из адреса', () => {
    signIn()
    renderAt('/room/ABC123')
    expect(screen.getByRole('heading', { name: 'Комната ABC123' })).toBeInTheDocument()
  })

  it('на неизвестном адресе показывает 404', () => {
    renderAt('/no-such-page')
    expect(screen.getByText('Такой страницы нет')).toBeInTheDocument()
  })
})

describe('вход гостя', () => {
  it('имя → запрос к API → сессия в localStorage → главная', async () => {
    const fetchMock = vi.fn(() => Promise.resolve(jsonResponse(testSession('Ватсон'))))
    vi.stubGlobal('fetch', fetchMock)
    renderAt('/login')

    submitName('  Ватсон ')

    expect(
      await screen.findByRole('heading', { name: 'Здравствуйте, Ватсон!' }),
    ).toBeInTheDocument()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('/api/auth/guest')
    expect(init.body).toBe('{"name":"Ватсон"}') // пробелы по краям обрезаны
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY)!).user.name).toBe('Ватсон')
  })

  it('ссылка-приглашение: после входа игрок попадает в комнату', async () => {
    vi.stubGlobal('fetch', () => Promise.resolve(jsonResponse(testSession())))
    renderAt('/room/K7Q2PX')

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
    submitName('Анна')

    expect(await screen.findByRole('heading', { name: 'Комната K7Q2PX' })).toBeInTheDocument()
  })

  it('неверное имя: подсказка у поля, запроса нет', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderAt('/login')

    submitName('Анна!')

    expect(
      await screen.findByText('Только буквы, цифры, пробел, дефис и подчёркивание'),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('пустое имя: просит ввести', async () => {
    renderAt('/login')

    submitName('   ')

    expect(await screen.findByText('Введите имя')).toBeInTheDocument()
  })

  it('сервер недоступен: понятное сообщение, игрок остаётся на странице входа', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')))
    renderAt('/login')

    submitName('Анна')

    expect(
      await screen.findByText('Сервер недоступен. Попробуйте ещё раз чуть позже.'),
    ).toBeInTheDocument()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('сервер отверг имя: ошибка у поля', async () => {
    vi.stubGlobal('fetch', () =>
      Promise.resolve(jsonResponse({ code: 'VALIDATION_FAILED', errors: [] }, 400)),
    )
    renderAt('/login')

    submitName('Анна')

    expect(
      await screen.findByText('Сервер не принял это имя, попробуйте другое'),
    ).toBeInTheDocument()
  })

  it('«Выйти» удаляет сессию и возвращает на вход', () => {
    signIn('Анна')
    renderAt('/')

    fireEvent.click(screen.getByRole('button', { name: 'Выйти' }))

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })
})
