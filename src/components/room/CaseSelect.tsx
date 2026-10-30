import { Card, Flex, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { caseAssetUrl } from '../../game/assets.ts'
import { localize } from '../../game/localize.ts'
import type { CaseSummary } from '../../game/protocol.ts'
import './CaseSelect.css'

interface CaseSelectProps {
  cases: CaseSummary[]
  /** id выбранного дела; value и onChange подставляет Form.Item. */
  value?: string
  onChange?: (caseId: string) => void
}

/** Выбор дела карточками с обложкой. Для экранных дикторов — группа радиокнопок. */
function CaseSelect({ cases, value, onChange }: CaseSelectProps) {
  const { t, i18n } = useTranslation()

  return (
    <Flex wrap gap={16} role="radiogroup">
      {cases.map((item) => {
        const selected = item.id === value
        const title = localize(item.title, i18n.language)
        return (
          <Card
            key={item.id}
            hoverable
            role="radio"
            aria-checked={selected}
            aria-label={title}
            tabIndex={0}
            className={
              selected ? 'case-select__card case-select__card--selected' : 'case-select__card'
            }
            cover={
              <img alt="" src={caseAssetUrl(item.id, item.cover)} className="case-select__cover" />
            }
            onClick={() => onChange?.(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onChange?.(item.id)
              }
            }}
          >
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              {title}
            </Typography.Title>
            <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }}>
              {localize(item.summary, i18n.language)}
            </Typography.Paragraph>
            <Flex wrap gap={4}>
              <Tag>
                {t('createRoom.casePlayers', {
                  min: item.recommendedPlayers.min,
                  max: item.recommendedPlayers.max,
                })}
              </Tag>
              <Tag>{t('createRoom.caseDuration', { minutes: item.durationMinutes })}</Tag>
            </Flex>
          </Card>
        )
      })}
    </Flex>
  )
}

export default CaseSelect
