import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
  List,
  Popconfirm,
  Space,
  Tag,
  Typography,
  message,
} from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { errorMessageKey } from '../../api/errorMessages.ts'
import { kickPlayer, startGame } from '../../api/rooms.ts'
import type { RoomSnapshot } from '../../game/protocol.ts'

interface WaitingRoomProps {
  room: RoomSnapshot
  /** Название дела на языке комнаты; null — ещё не загрузилось. */
  caseTitle: string | null
  /** id текущего игрока. */
  playerId: string
  onLeave: () => void
}

/**
 * Зал ожидания (Ф3): код и ссылка-приглашение, список игроков, кнопки хозяина.
 * Список приходит снимками по WebSocket — действия выполняются через REST, а их результат
 * все видят в следующем снимке.
 */
function WaitingRoom({ room, caseTitle, playerId, onLeave }: WaitingRoomProps) {
  const { t } = useTranslation()
  const [messageApi, messageHolder] = message.useMessage()
  const [busy, setBusy] = useState(false)
  const isHost = room.hostId === playerId
  const inviteLink = `${window.location.origin}/room/${room.code}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      void messageApi.success(t('room.linkCopied'))
    } catch {
      // Буфер обмена недоступен (старый браузер, нет разрешения) — ссылку можно выделить вручную
      void messageApi.warning(t('room.linkCopyFailed'))
    }
  }

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    try {
      await action()
    } catch (e) {
      void messageApi.error(t(errorMessageKey(e)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card style={{ maxWidth: 720, margin: '0 auto' }}>
      {messageHolder}
      <Typography.Title level={2} style={{ marginTop: 0 }}>
        {caseTitle ?? t('room.title', { code: room.code })}
      </Typography.Title>

      <Flex vertical gap={16}>
        <div>
          <Typography.Text type="secondary">{t('room.codeLabel')}</Typography.Text>
          <Typography.Title
            level={3}
            copyable={{ text: room.code }}
            style={{ margin: 0, letterSpacing: 4 }}
          >
            {room.code}
          </Typography.Title>
        </div>

        <Space.Compact style={{ width: '100%' }}>
          <Typography.Text
            code
            style={{ flex: 1, padding: '4px 8px', overflow: 'hidden' }}
            ellipsis
          >
            {inviteLink}
          </Typography.Text>
          <Button onClick={copyLink}>{t('room.copyLink')}</Button>
        </Space.Compact>

        <Flex gap={8} wrap>
          <Tag>{t('room.players', { current: room.members.length, max: room.maxPlayers })}</Tag>
          <Tag>
            {room.turnTimeoutSeconds === null
              ? t('room.noTimer')
              : t('room.timer', { seconds: room.turnTimeoutSeconds })}
          </Tag>
        </Flex>

        <List
          bordered
          dataSource={room.members}
          renderItem={(member) => (
            <List.Item
              actions={
                isHost && member.id !== playerId
                  ? [
                      <Popconfirm
                        key="kick"
                        title={t('room.kickConfirm', { name: member.name })}
                        okText={t('room.kick')}
                        cancelText={t('common.cancel')}
                        onConfirm={() => run(() => kickPlayer(room.code, member.id))}
                      >
                        <Button size="small" danger disabled={busy}>
                          {t('room.kick')}
                        </Button>
                      </Popconfirm>,
                    ]
                  : []
              }
            >
              <Space>
                <Badge
                  dot
                  status={member.online ? 'success' : 'default'}
                  title={member.online ? t('room.online') : t('room.offline')}
                >
                  <Avatar>{member.name.charAt(0).toUpperCase()}</Avatar>
                </Badge>
                <Typography.Text strong={member.id === playerId}>{member.name}</Typography.Text>
                {member.id === room.hostId && <Tag color="gold">{t('room.host')}</Tag>}
                {member.id === playerId && <Tag>{t('room.you')}</Tag>}
              </Space>
            </List.Item>
          )}
        />

        <Flex justify="space-between" align="center" wrap gap={12}>
          {isHost ? (
            <Button
              type="primary"
              size="large"
              loading={busy}
              onClick={() => run(() => startGame(room.code))}
            >
              {t('room.start')}
            </Button>
          ) : (
            <Typography.Text type="secondary">{t('room.waitingForHost')}</Typography.Text>
          )}
          <Popconfirm
            title={t('room.leaveConfirm')}
            okText={t('room.leave')}
            cancelText={t('common.cancel')}
            onConfirm={onLeave}
          >
            <Button disabled={busy}>{t('room.leave')}</Button>
          </Popconfirm>
        </Flex>
      </Flex>
    </Card>
  )
}

export default WaitingRoom
