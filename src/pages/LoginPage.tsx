import { Typography } from 'antd'
import { useTranslation } from 'react-i18next'

function LoginPage() {
  const { t } = useTranslation()

  return (
    <>
      <Typography.Title level={2}>{t('login.title')}</Typography.Title>
      <Typography.Paragraph>{t('login.placeholder')}</Typography.Paragraph>
    </>
  )
}

export default LoginPage
