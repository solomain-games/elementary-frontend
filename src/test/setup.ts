// Подготовка окружения перед каждым тестовым файлом.

// Матчеры для DOM: toBeInTheDocument(), toHaveTextContent() и т. п.
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
// Переводы: компоненты в тестах показывают те же русские строки, что и в приложении
import '../i18n/index.ts'

// Убираем отрисованные компоненты после каждого теста
afterEach(() => {
  cleanup()
  // Тесты не должны влиять друг на друга: сессия из одного теста не попадает в следующий,
  // подменённый fetch возвращается на место
  localStorage.clear()
  vi.unstubAllGlobals()
})

// В jsdom нет window.matchMedia, а Ant Design использует его для адаптивной вёрстки
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// В jsdom нет ResizeObserver, а Ant Design следит через него за размерами элементов (например, меню в шапке).
// Заглушка ничего не измеряет: в тестах нам важна логика, а не раскладка.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
