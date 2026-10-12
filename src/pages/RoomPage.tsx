import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

function RoomPage() {
  const { code } = useParams()
  const { t } = useTranslation()

  return (
    <>
      <Typography.Title level={2}>{t('room.title', { code })}</Typography.Title>
      <Typography.Paragraph>{t('room.placeholder')}</Typography.Paragraph>
    </>
  )
}

export default RoomPage
