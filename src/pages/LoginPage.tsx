import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation } from 'react-router'
import { ApiError } from '../api/client.ts'
import { GUEST_NAME_MAX_LENGTH, checkGuestName } from '../auth/guestName.ts'
import type { LoginRedirectState } from '../auth/RequireAuth.tsx'
import { useAuth } from '../auth/useAuth.ts'

interface LoginForm {
  name: string
}

/** Вход гостя: имя → токен. После входа — туда, откуда пришли, или на главную. */
function LoginPage() {
  const { session } = useAuth()
  const location = useLocation()
  const from = (location.state as LoginRedirectState | null)?.from ?? '/'

  // Уже вошёл (в том числе только что): сразу уходим со страницы входа
  return session ? <Navigate to={from} replace /> : <GuestLoginForm />
}

/** Форма отдельно: useForm должен быть привязан к отрисованной форме, иначе Ant Design предупреждает. */
function GuestLoginForm() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [form] = Form.useForm<LoginForm>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFinish = async ({ name }: LoginForm) => {
    setSubmitting(true)
    setError(null)
    try {
      await login(name.trim())
    } catch (e) {
      if (e instanceof ApiError && e.code === 'VALIDATION_FAILED') {
        // Сервер строже нас — показываем ошибку у поля
        form.setFields([{ name: 'name', errors: [t('login.errors.rejected')] }])
      } else if (e instanceof ApiError && e.isServerUnavailable) {
        setError(t('errors.serverUnavailable'))
      } else {
        setError(t('errors.unknown'))
      }
      setSubmitting(false)
    }
  }

  return (
    <Card style={{ maxWidth: 400, margin: '48px auto' }}>
      <Typography.Title level={2}>{t('login.title')}</Typography.Title>
      <Typography.Paragraph type="secondary">{t('login.subtitle')}</Typography.Paragraph>

      <Form<LoginForm> form={form} layout="vertical" requiredMark={false} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label={t('login.nameLabel')}
          rules={[
            {
              validator: (_, value: string | undefined) => {
                const problem = checkGuestName(value)
                return problem
                  ? Promise.reject(
                      new Error(t(`login.errors.${problem}`, { max: GUEST_NAME_MAX_LENGTH })),
                    )
                  : Promise.resolve()
              },
            },
          ]}
        >
          <Input
            placeholder={t('login.namePlaceholder')}
            maxLength={GUEST_NAME_MAX_LENGTH}
            showCount
            autoFocus
            autoComplete="nickname"
          />
        </Form.Item>

        {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

        <Button type="primary" htmlType="submit" block loading={submitting}>
          {t('login.submit')}
        </Button>
      </Form>
    </Card>
  )
}

export default LoginPage
