import { Alert, Button } from 'antd'
import { useTranslation } from 'react-i18next'
import { useRoomStore } from './roomStore.ts'

/** Полоса с состоянием связи: показывается, только когда что-то не так. */
function ConnectionBanner() {
  const { t } = useTranslation()
  const connection = useRoomStore((state) => state.connection)

  if (connection === 'reconnecting') {
    return <Alert type="warning" showIcon title={t('connection.reconnecting')} banner />
  }
  if (connection === 'outdated') {
    return (
      <Alert
        type="error"
        showIcon
        banner
        title={t('connection.outdated')}
        action={
          <Button size="small" onClick={() => window.location.reload()}>
            {t('connection.reload')}
          </Button>
        }
      />
    )
  }
  return null
}

export default ConnectionBanner
