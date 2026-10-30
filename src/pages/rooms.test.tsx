import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.tsx'
import type { CaseSummary, RoomInfo, Snapshot } from '../game/protocol.ts'
import type { RoomConnectionOptions } from '../realtime/gameClient.ts'
import { noContent, requestBody, routeFetch } from '../test/fetchRoutes.ts'
import { jsonResponse, signIn } from '../test/session.ts'

// WebSocket подменён: тест сам «присылает» снимки и события через сохранённые колбэки
const realtime = vi.hoisted(() => ({
  options: null as RoomConnectionOptions | null,
  disconnect: vi.fn(),
}))

vi.mock('../realtime/gameClient.ts', () => ({
  connectToRoom: (options: RoomConnectionOptions) => {
    realtime.options = options
    return { send: vi.fn(), disconnect: realtime.disconnect }
  },
}))

const DEMO: CaseSummary = {
  id: 'demo',
  title: { ru: 'Пропавший браслет' },
  summary: { ru: 'Учебное дело' },
  cover: 'images/cover.webp',
  languages: ['ru'],
  recommendedPlayers: { min: 1, max: 4 },
  durationMinutes: 10,
}

const INFO: RoomInfo = {
  code: 'K7Q2PX',
  caseId: 'demo',
  caseTitle: { ru: 'Пропавший браслет' },
  language: 'ru',
  players: 1,
  maxPlayers: 4,
  status: 'WAITING',
}

/** Снимок зала ожидания: Анна (g-test, хозяин — если не сказано иное) и Борис. */
function snapshot(overrides: { hostId?: string; status?: 'WAITING' | 'IN_GAME' } = {}): Snapshot {
  return {
    protocolVersion: 1,
    version: 1,
    serverTime: new Date().toISOString(),
    room: {
      code: 'K7Q2PX',
      caseId: 'demo',
      language: 'ru',
      maxPlayers: 4,
      turnTimeoutSeconds: 60,
      hostId: overrides.hostId ?? 'g-test',
      status: overrides.status ?? 'WAITING',
      members: [
        { id: 'g-test', name: 'Анна', online: true },
        { id: 'g-boris', name: 'Борис', online: false },
      ],
      prologue: null,
    },
    game: null,
  }
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

/** Комната открыта, вход по REST прошёл, WebSocket «подключился». */
async function openRoom() {
  const fetchMock = routeFetch({
    'POST /api/game/rooms/K7Q2PX/join': noContent,
    'GET /api/game/rooms/K7Q2PX': () => jsonResponse(INFO),
    'POST /api/game/rooms/K7Q2PX/start': noContent,
    'POST /api/game/rooms/K7Q2PX/kick': noContent,
    'POST /api/game/rooms/K7Q2PX/leave': noContent,
  })
  renderAt('/room/K7Q2PX')
  await waitFor(() => expect(realtime.options).not.toBeNull())
  return fetchMock
}

function pushSnapshot(value: Snapshot) {
  act(() => realtime.options!.onSnapshot(value))
}

describe('создание комнаты', () => {
  beforeEach(() => {
    realtime.options = null
    signIn('Анна')
  })

  it('главная ведёт к созданию комнаты', async () => {
    routeFetch({ 'GET /api/game/cases': () => jsonResponse([DEMO]) })
    renderAt('/')

    fireEvent.click(screen.getByRole('button', { name: 'Создать комнату' }))

    // Страница сначала загружает список дел, заголовок появляется после ответа
    expect(await screen.findByRole('heading', { name: 'Новая комната' })).toBeInTheDocument()
  })

  it('дело → настройки → POST → комната', async () => {
    const fetchMock = routeFetch({
      'GET /api/game/cases': () => jsonResponse([DEMO]),
      'POST /api/game/rooms': () => jsonResponse({ code: 'K7Q2PX' }, 201),
      'POST /api/game/rooms/K7Q2PX/join': noContent,
      'GET /api/game/rooms/K7Q2PX': () => jsonResponse(INFO),
    })
    renderAt('/rooms/new')

    fireEvent.click(await screen.findByRole('radio', { name: 'Пропавший браслет' }))
    fireEvent.click(screen.getByRole('button', { name: 'Создать комнату' }))

    expect(await screen.findByText('Подключение к комнате…')).toBeInTheDocument()
    // Число мест подставилось из рекомендаций дела, таймера нет
    expect(requestBody(fetchMock, 'POST', '/api/game/rooms')).toEqual({
      caseId: 'demo',
      language: 'ru',
      maxPlayers: 4,
      turnTimeoutSeconds: null,
    })
    expect(requestBody(fetchMock, 'POST', '/api/game/rooms/K7Q2PX/join')).not.toBeUndefined()
  })

  it('без выбранного дела — подсказка, запроса нет', async () => {
    const fetchMock = routeFetch({ 'GET /api/game/cases': () => jsonResponse([DEMO]) })
    renderAt('/rooms/new')

    await screen.findByRole('radio', { name: 'Пропавший браслет' })
    fireEvent.click(screen.getByRole('button', { name: 'Создать комнату' }))

    expect(await screen.findByText('Выберите дело')).toBeInTheDocument()
    expect(requestBody(fetchMock, 'POST', '/api/game/rooms')).toBeUndefined()
  })

  it('вход по коду с главной; регистр не важен', async () => {
    const fetchMock = routeFetch({
      'POST /api/game/rooms/K7Q2PX/join': noContent,
      'GET /api/game/rooms/K7Q2PX': () => jsonResponse(INFO),
    })
    renderAt('/')

    fireEvent.change(screen.getByLabelText('Код комнаты'), { target: { value: 'k7q2px' } })
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Подключение к комнате…')).toBeInTheDocument()
    expect(requestBody(fetchMock, 'POST', '/api/game/rooms/K7Q2PX/join')).not.toBeUndefined()
  })
})

describe('зал ожидания', () => {
  beforeEach(() => {
    realtime.options = null
    realtime.disconnect.mockClear()
    signIn('Анна')
  })

  it('пока нет снимка — «Подключение…»', async () => {
    await openRoom()

    expect(screen.getByText('Подключение к комнате…')).toBeInTheDocument()
  })

  it('хозяин видит игроков, ссылку и свои кнопки', async () => {
    await openRoom()
    pushSnapshot(snapshot())

    expect(screen.getByRole('heading', { name: 'Пропавший браслет' })).toBeInTheDocument()
    expect(screen.getAllByText('Анна')).toHaveLength(2) // в шапке и в списке игроков
    expect(screen.getByText('Борис')).toBeInTheDocument()
    expect(screen.getByText('Хозяин')).toBeInTheDocument()
    expect(screen.getByText('Вы')).toBeInTheDocument()
    expect(screen.getAllByText(/\/room\/K7Q2PX$/).length).toBeGreaterThan(0)
    expect(screen.getByText('Игроков: 2 из 4')).toBeInTheDocument()
    // Исключить можно только другого игрока
    expect(screen.getAllByRole('button', { name: 'Исключить' })).toHaveLength(1)
  })

  it('«Начать игру» отправляет запрос; снимок IN_GAME ведёт на игровой стол', async () => {
    const fetchMock = await openRoom()
    pushSnapshot(snapshot())

    fireEvent.click(screen.getByRole('button', { name: 'Начать игру' }))
    await waitFor(() =>
      expect(requestBody(fetchMock, 'POST', '/api/game/rooms/K7Q2PX/start')).not.toBeUndefined(),
    )

    pushSnapshot({ ...snapshot({ status: 'IN_GAME' }), version: 2 })
    expect(await screen.findByRole('heading', { name: 'Игра K7Q2PX' })).toBeInTheDocument()
  })

  it('хозяин исключает игрока после подтверждения', async () => {
    const fetchMock = await openRoom()
    pushSnapshot(snapshot())

    // Кнопка в списке открывает подтверждение; в нём своя кнопка «Исключить»
    fireEvent.click(screen.getByRole('button', { name: 'Исключить' }))
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Исключить' })).toHaveLength(2),
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Исключить' })[1])

    await waitFor(() =>
      expect(requestBody(fetchMock, 'POST', '/api/game/rooms/K7Q2PX/kick')).toEqual({
        playerId: 'g-boris',
      }),
    )
  })

  it('не хозяин ждёт и не видит кнопок хозяина', async () => {
    await openRoom()
    pushSnapshot(snapshot({ hostId: 'g-boris' }))

    expect(screen.getByText('Ждём, когда хозяин начнёт игру')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Начать игру' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Исключить' })).toBeNull()
  })

  it('исключённый видит сообщение, соединение закрыто', async () => {
    await openRoom()
    pushSnapshot(snapshot({ hostId: 'g-boris' }))

    act(() => realtime.options!.onEvent({ type: 'PLAYER_KICKED', playerId: 'g-test' }))

    expect(screen.getByText('Хозяин исключил вас из этой комнаты.')).toBeInTheDocument()
    expect(realtime.disconnect).toHaveBeenCalled()
  })

  it('«Переподключение…», когда связь пропала', async () => {
    await openRoom()
    pushSnapshot(snapshot())

    act(() => realtime.options!.onStatus('reconnecting'))

    expect(screen.getByText('Связь потеряна. Переподключение…')).toBeInTheDocument()
  })

  it('нет такой комнаты — понятное сообщение', async () => {
    routeFetch({
      'POST /api/game/rooms/ZZZZZZ/join': () => jsonResponse({ code: 'ROOM_NOT_FOUND' }, 404),
    })
    renderAt('/room/ZZZZZZ')

    expect(await screen.findByText(/Комната не найдена/)).toBeInTheDocument()
    expect(realtime.options).toBeNull() // WebSocket не открывали
  })

  it('исключённому не войти снова', async () => {
    routeFetch({
      'POST /api/game/rooms/K7Q2PX/join': () => jsonResponse({ code: 'KICKED_FROM_ROOM' }, 403),
    })
    renderAt('/room/K7Q2PX')

    expect(await screen.findByText('Хозяин исключил вас из этой комнаты.')).toBeInTheDocument()
  })
})
