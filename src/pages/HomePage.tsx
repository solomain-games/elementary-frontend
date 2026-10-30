import { Button, Card, Flex, Form, Input, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth.ts'

const CODE_PATTERN = /^[A-Z2-9]{6}$/

/** Главная после входа: создать комнату или войти по коду. */
function HomePage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      <Typography.Title level={2}>{t('home.title', { name: session?.user.name })}</Typography.Title>
      <Flex wrap gap={24}>
        <Card title={t('home.createTitle')} style={{ width: 340 }}>
          <Typography.Paragraph type="secondary">{t('home.createText')}</Typography.Paragraph>
          <Button type="primary" size="large" onClick={() => navigate('/rooms/new')}>
            {t('home.createButton')}
          </Button>
        </Card>

        <Card title={t('home.joinTitle')} style={{ width: 340 }}>
          <Form<{ code: string }>
            layout="vertical"
            requiredMark={false}
            onFinish={({ code }) => navigate(`/room/${code.trim().toUpperCase()}`)}
          >
            <Form.Item
              name="code"
              label={t('home.codeLabel')}
              normalize={(value: string) => value.toUpperCase()}
              rules={[
                {
                  validator: (_, value: string | undefined) =>
                    CODE_PATTERN.test(value?.trim() ?? '')
                      ? Promise.resolve()
                      : Promise.reject(new Error(t('home.codeInvalid'))),
                },
              ]}
            >
              <Input placeholder={t('home.codePlaceholder')} maxLength={6} autoComplete="off" />
            </Form.Item>
            <Button htmlType="submit" size="large">
              {t('home.joinButton')}
            </Button>
          </Form>
        </Card>
      </Flex>
    </>
  )
}

export default HomePage
