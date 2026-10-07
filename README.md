# Elementary — фронтенд (frontend)

Веб-клиент игры **Elementary**: React + TypeScript, Ant Design, React Router, сборка через Vite.

## Запуск локально

Требуется Node.js 24 (LTS).

```powershell
npm install
npm run dev
```

Приложение открывается на http://localhost:5173.

Запросы `/api/**` и `/ws/**` dev-сервер Vite пересылает в шлюз на `http://localhost:8080` (см. `vite.config.ts`), поэтому для работы с бэкендом нужно запустить gateway и сервисы.

## Команды

| Команда                | Что делает                            |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | dev-сервер с горячей перезагрузкой    |
| `npm run build`        | проверка типов и сборка в `dist/`     |
| `npm run preview`      | локальный просмотр собранного `dist/` |
| `npm run lint`         | проверка кода ESLint                  |
| `npm run typecheck`    | проверка типов TypeScript             |
| `npm run format`       | форматирование кода Prettier          |
| `npm run format:check` | проверка форматирования без изменений |
| `npm test`             | тесты (Vitest), один прогон           |
| `npm run test:watch`   | тесты в режиме наблюдения             |

## Структура

| Папка         | Содержимое                         |
| ------------- | ---------------------------------- |
| `src/layout/` | общий каркас страниц (шапка, меню) |
| `src/pages/`  | страницы: вход, комната, игра      |
