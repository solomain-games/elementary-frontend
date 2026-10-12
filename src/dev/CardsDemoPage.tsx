import { Card, Flex, Segmented, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import CardPreview from '../components/card/CardPreview.tsx'
import GameCard from '../components/card/GameCard.tsx'
import RichText from '../components/card/RichText.tsx'
import { localize } from '../game/localize.ts'
import type { CardFace } from '../game/types.ts'
import { DEMO_CASE_ID, DEMO_LANGUAGE, demoCards, demoSolution } from './demoCase.ts'

type CardSize = 'small' | 'medium' | 'large'

const WIDTHS: Record<CardSize, number> = {
  small: 110,
  medium: 200,
  large: 320,
}

/** Страница для разработки (Ф5): все карты дела-заглушки в выбранном размере. Только в dev-режиме. */
function CardsDemoPage() {
  const { t } = useTranslation()
  const [size, setSize] = useState<CardSize>('medium')
  const [opened, setOpened] = useState<CardFace | null>(null)

  const openByNumber = (number: number) =>
    setOpened(demoCards.find((card) => card.number === number) ?? null)

  return (
    <>
      <Typography.Title level={2}>{t('cardsDemo.title')}</Typography.Title>
      <Typography.Paragraph type="secondary">{t('cardsDemo.description')}</Typography.Paragraph>

      <Segmented<CardSize>
        value={size}
        onChange={setSize}
        options={(Object.keys(WIDTHS) as CardSize[]).map((value) => ({
          value,
          label: t(`cardsDemo.size.${value}`),
        }))}
        style={{ marginBottom: 24 }}
      />

      <Flex wrap gap={16} align="flex-start">
        {demoCards.map((card) => (
          <GameCard
            key={card.number}
            face={card}
            caseId={DEMO_CASE_ID}
            language={DEMO_LANGUAGE}
            width={WIDTHS[size]}
            onClick={() => setOpened(card)}
          />
        ))}
      </Flex>

      <Card title={t('cardsDemo.solutionTitle')} style={{ marginTop: 32, maxWidth: 720 }}>
        <Typography.Paragraph type="secondary">{t('cardsDemo.solutionHint')}</Typography.Paragraph>
        <Typography.Paragraph>
          <RichText text={localize(demoSolution, DEMO_LANGUAGE)} onCardRef={openByNumber} />
        </Typography.Paragraph>
      </Card>

      <CardPreview
        face={opened}
        caseId={DEMO_CASE_ID}
        language={DEMO_LANGUAGE}
        onClose={() => setOpened(null)}
        onCardRef={openByNumber}
      />
    </>
  )
}

export default CardsDemoPage
