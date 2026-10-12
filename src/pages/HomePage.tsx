import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/useAuth.ts'

/** Главная после входа. Создание комнаты и вход по коду появятся в Ф3. */
function HomePage() {
  const { t } = useTranslation()
  const { session } = useAuth()

  return (
    <>
      <Typography.Title level={2}>{t('home.title', { name: session?.user.name })}</Typography.Title>
      <Typography.Paragraph>{t('home.placeholder')}</Typography.Paragraph>
    </>
  )
}

export default HomePage
