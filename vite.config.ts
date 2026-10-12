/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, resolve, sep } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

// Типы файлов дел, которые можно отдавать браузеру
const CASE_MEDIA_TYPES: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}

/**
 * В разработке раздаёт изображения и звук дел по адресу /cases/{caseId}/{путь}
 * прямо из соседнего репозитория cases (в prod это делает Caddy).
 * Отдаются только медиафайлы: case.json с правильными ответами браузеру не нужен.
 */
function serveCaseMedia(casesDir: string): Plugin {
  const root = resolve(casesDir)
  return {
    name: 'elementary-case-media',
    configureServer(server) {
      // use('/cases', ...) отрезает префикс: req.url здесь — '/demo/cards/01.webp'
      server.middlewares.use('/cases', (req, res, next) => {
        const path = decodeURIComponent((req.url ?? '').split('?')[0])
        const file = resolve(root, `.${path}`)
        const type = CASE_MEDIA_TYPES[extname(file).toLowerCase()]
        // Не медиафайл, выход за пределы папки дел (../) или файла нет — не наше дело
        if (
          !type ||
          !file.startsWith(root + sep) ||
          !existsSync(file) ||
          !statSync(file).isFile()
        ) {
          next()
          return
        }
        res.setHeader('Content-Type', type)
        createReadStream(file).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serveCaseMedia(process.env.CASES_DIR ?? '../cases/cases')],
  server: {
    port: 5173,
    // В разработке браузер обращается только к Vite (:5173),
    // а запросы к бэкенду Vite пересылает в шлюз (:8080).
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  // Настройки Vitest: тесты запускаются в jsdom — имитации браузера внутри Node.js
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
