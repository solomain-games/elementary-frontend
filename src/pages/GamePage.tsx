import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

function GamePage() {
  const { code } = useParams()
  const { t } = useTranslation()

  return (
    <>
      <Typography.Title level={2}>{t('game.title', { code })}</Typography.Title>
      <Typography.Paragraph>{t('game.placeholder')}</Typography.Paragraph>
    </>
  )
}

export default GamePage
