import { ConfigProvider, type ConfigProviderProps } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type AntdLocale = NonNullable<ConfigProviderProps['locale']>

// Встроенные тексты Ant Design (пагинация, «ОК» в диалогах, календарь) переводит сам Ant Design.
// Здесь их язык привязан к языку i18next, чтобы при смене языка менялось всё сразу.
const antdLocales: Record<string, AntdLocale> = {
  ru: ruRU,
}

function LocalizedConfigProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const locale = antdLocales[i18n.resolvedLanguage ?? i18n.language] ?? ruRU

  return <ConfigProvider locale={locale}>{children}</ConfigProvider>
}

export default LocalizedConfigProvider
