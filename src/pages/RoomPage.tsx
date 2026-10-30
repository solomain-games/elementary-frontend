import { Button, Flex, Result, Spin, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { errorMessageKey } from '../api/errorMessages.ts'
import { fetchRoomInfo, joinRoom, leaveRoom } from '../api/rooms.ts'
import { useAuth } from '../auth/useAuth.ts'
import WaitingRoom from '../components/room/WaitingRoom.tsx'
import { localize } from '../game/localize.ts'
import type { RoomInfo } from '../game/protocol.ts'
import ConnectionBanner from '../realtime/ConnectionBanner.tsx'
import { useRoomStore } from '../realtime/roomStore.ts'
import { useRoomConnection } from '../realtime/useRoomConnection.ts'

type JoinState =
  | { status: 'joining' }
  | { status: 'failed'; messageKey: ReturnType<typeof errorMessageKey> }
  | { status: 'joined'; info: RoomInfo | null }

/**
 * Комната по ссылке-приглашению /room/{код} (Ф3). Сначала вход по REST (повторный вход
 * безопасен — так же заходит и создатель), затем подключение по WebSocket и снимки.
 */
function RoomPage() {
  const { code: rawCode = '' } = useParams()
  const code = rawCode.toUpperCase()

  // Код в адресе набран строчными — приводим адрес к каноническому виду
  if (rawCode !== code) {
    return <Navigate to={`/room/${code}`} replace />
  }
  // key: при переходе в другую комнату состояние страницы начинается заново
  return <Room key={code} code={code} />
}

function Room({ code }: { code: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { session } = useAuth()
  const [join, setJoin] = useState<JoinState>({ status: 'joining' })

  useEffect(() => {
    let cancelled = false
    joinRoom(code)
      .then(() => fetchRoomInfo(code).catch(() => null))
      .then(
        (info) => !cancelled && setJoin({ status: 'joined', info }),
        (e: unknown) => !cancelled && setJoin({ status: 'failed', messageKey: errorMessageKey(e) }),
      )
    return () => {
      cancelled = true
    }
  }, [code])

  // WebSocket — только после успешного входа
  useRoomConnection(join.status === 'joined' ? code : null)
  const snapshot = useRoomStore((state) => state.snapshot)
  const kicked = useRoomStore((state) => state.kicked)

  const handleLeave = async () => {
    try {
      await leaveRoom(code)
    } finally {
      navigate('/')
    }
  }

  const toHome = (
    <Link to="/">
      <Button type="primary">{t('notFound.toHome')}</Button>
    </Link>
  )

  if (join.status === 'joining') {
    return <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />
  }
  if (join.status === 'failed') {
    return <Result status="warning" title={t(join.messageKey)} extra={toHome} />
  }
  if (kicked) {
    return <Result status="warning" title={t('errors.codes.KICKED_FROM_ROOM')} extra={toHome} />
  }
  // Партия началась — на игровой стол
  if (snapshot && snapshot.room.status !== 'WAITING') {
    return <Navigate to={`/game/${code}`} replace />
  }

  const caseTitle = join.info?.caseTitle ? localize(join.info.caseTitle, join.info.language) : null

  return (
    <>
      <ConnectionBanner />
      {snapshot && session ? (
        <WaitingRoom
          room={snapshot.room}
          caseTitle={caseTitle}
          playerId={session.user.id}
          onLeave={handleLeave}
        />
      ) : (
        <Flex vertical align="center" gap={16} style={{ marginTop: 64 }}>
          <Spin size="large" />
          <Typography.Text type="secondary">{t('room.connecting')}</Typography.Text>
        </Flex>
      )}
    </>
  )
}

export default RoomPage
