// Локализация интерфейса: i18next хранит переводы и выбирает строку по ключу,
// react-i18next даёт компонентам хук useTranslation().
//
// Файл импортируется один раз в main.tsx (и в настройке тестов) ради побочного эффекта:
// после импорта i18next уже инициализирован.
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './locales/ru.json'

/** Язык интерфейса по умолчанию; пока он единственный. */
export const DEFAULT_LANGUAGE = 'ru'

/** Все переводы: язык → пространство имён → ключи. */
export const resources = {
  ru: { translation: ru },
} as const

// Атрибут <html lang> подсказывает браузеру язык страницы (переносы, проверка орфографии, озвучка)
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  // Переводы лежат в коде, загружать нечего: инициализируемся сразу,
  // чтобы первая же отрисовка (и тесты) получили готовые строки
  initAsync: false,
  interpolation: {
    escapeValue: false, // React сам экранирует текст, двойное экранирование испортило бы «кавычки»
  },
})

export default i18n
