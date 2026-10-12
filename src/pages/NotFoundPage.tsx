import { Button, Result } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <Result
      status="404"
      title="404"
      subTitle={t('notFound.subtitle')}
      extra={
        <Link to="/">
          <Button type="primary">{t('notFound.toHome')}</Button>
        </Link>
      }
    />
  )
}

export default NotFoundPage
