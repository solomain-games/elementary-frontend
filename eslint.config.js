import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // Ф10: надписи интерфейса только через ключи переводов — t('...').
    // Ловим буквы прямо в JSX: <Button>Начать</Button> и title="Начать".
    // Строки в обычном коде (сообщения в console, ключи) правило не трогает.
    files: ['src/**/*.tsx'],
    ignores: ['src/**/*.test.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'JSXText[value=/[A-Za-zА-Яа-яЁё]/]',
          message: 'Текст интерфейса — через t() из react-i18next, а не прямо в JSX.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(title|subTitle|placeholder|label|alt|aria-label|tooltip|okText|cancelText)$/] > Literal[value=/[A-Za-zА-Яа-яЁё]/]',
          message: 'Текст интерфейса — через t() из react-i18next, а не строкой в атрибуте.',
        },
      ],
    },
  },
  // Последним: выключает правила форматирования, за форматирование отвечает Prettier
  eslintConfigPrettier,
])
