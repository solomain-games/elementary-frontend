import { Alert, Button, Card, Form, InputNumber, Result, Segmented, Select, Spin, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { fetchCases } from '../api/cases.ts'
import { errorMessageKey } from '../api/errorMessages.ts'
import { createRoom } from '../api/rooms.ts'
import CaseSelect from '../components/room/CaseSelect.tsx'
import { TURN_TIMEOUTS, type CaseSummary, type TurnTimeout } from '../game/protocol.ts'

/** Значение «без таймера» в переключателе: Segmented не умеет null. */
const NO_TIMER = 0

interface CreateRoomForm {
  caseId: string
  language: string
  maxPlayers: number
  turnTimeout: TurnTimeout | typeof NO_TIMER
}

type CasesState =
  | { status: 'loading' }
  | { status: 'error'; messageKey: ReturnType<typeof errorMessageKey> }
  | { status: 'ready'; cases: CaseSummary[] }

/** Создание комнаты (Ф3): дело, язык, лимит игроков, таймер хода. */
function CreateRoomPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = Form.useForm<CreateRoomForm>()
  const [casesState, setCasesState] = useState<CasesState>({ status: 'loading' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const caseId = Form.useWatch('caseId', form)

  useEffect(() => {
    let cancelled = false // ответ пришёл, когда страницу уже закрыли, — игнорируем
    fetchCases().then(
      (cases) => !cancelled && setCasesState({ status: 'ready', cases }),
      (e: unknown) => !cancelled && setCasesState({ status: 'error', messageKey: errorMessageKey(e) }),
    )
    return () => {
      cancelled = true
    }
  }, [])

  if (casesState.status === 'loading') {
    return <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />
  }
  if (casesState.status === 'error') {
    return <Result status="warning" title={t(casesState.messageKey)} />
  }

  const { cases } = casesState
  const selected = cases.find((item) => item.id === caseId)

  // Выбрали дело — подставляем его язык и рекомендуемое число игроков
  const handleCaseChange = (id: string) => {
    const chosen = cases.find((item) => item.id === id)
    if (chosen) {
      form.setFieldsValue({
        caseId: id,
        language: chosen.languages[0],
        maxPlayers: chosen.recommendedPlayers.max,
      })
    }
  }

  const handleFinish = async (values: CreateRoomForm) => {
    setSubmitting(true)
    setError(null)
    try {
      const { code } = await createRoom({
        caseId: values.caseId,
        language: values.language,
        maxPlayers: values.maxPlayers,
        turnTimeoutSeconds: values.turnTimeout === NO_TIMER ? null : values.turnTimeout,
      })
      navigate(`/room/${code}`)
    } catch (e) {
      setError(t(errorMessageKey(e)))
      setSubmitting(false)
    }
  }

  return (
    <Card style={{ maxWidth: 900, margin: '0 auto' }}>
      <Typography.Title level={2}>{t('createRoom.title')}</Typography.Title>

      <Form<CreateRoomForm>
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ maxPlayers: 6, turnTimeout: NO_TIMER }}
        onFinish={handleFinish}
      >
        <Form.Item
          name="caseId"
          label={t('createRoom.case')}
          rules={[{ required: true, message: t('createRoom.errors.caseRequired') }]}
        >
          <CaseSelect cases={cases} onChange={handleCaseChange} />
        </Form.Item>

        {/* Язык дела для всех игроков комнаты; выбирать есть смысл, только если переводов несколько */}
        <Form.Item
          name="language"
          label={t('createRoom.language')}
          hidden={!selected || selected.languages.length < 2}
        >
          <Select
            options={(selected?.languages ?? []).map((language) => ({
              value: language,
              label: language.toUpperCase(),
            }))}
            style={{ width: 120 }}
          />
        </Form.Item>

        <Form.Item name="maxPlayers" label={t('createRoom.maxPlayers')}>
          <InputNumber min={1} max={8} precision={0} />
        </Form.Item>

        <Form.Item name="turnTimeout" label={t('createRoom.turnTimeout')}>
          <Segmented
            options={[
              { value: NO_TIMER, label: t('createRoom.noTimer') },
              ...TURN_TIMEOUTS.map((seconds) => ({
                value: seconds,
                label: t('createRoom.seconds', { seconds }),
              })),
            ]}
          />
        </Form.Item>

        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

        <Button type="primary" htmlType="submit" size="large" loading={submitting}>
          {t('createRoom.submit')}
        </Button>
      </Form>
    </Card>
  )
}

export default CreateRoomPage
