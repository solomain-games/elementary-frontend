/**
 * Адрес файла дела (изображения, фона, звука). Пути в данных дела — относительные
 * внутри папки дела (протокол, раздел 2); файлы отдаются по /cases/{caseId}/{путь}.
 * В разработке их раздаёт Vite из репозитория cases (vite.config.ts), в prod — Caddy.
 */
export function caseAssetUrl(caseId: string, path: string): string {
  return `/cases/${encodeURIComponent(caseId)}/${path}`
}
