// Типизация ключей: TypeScript знает структуру ru.json, поэтому t('nav.lgoin') с опечаткой
// не скомпилируется, а редактор подсказывает существующие ключи.
import 'i18next'
import type ru from './locales/ru.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof ru
    }
  }
}
