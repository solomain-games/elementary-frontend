import type { LocalizedText } from './types.ts'

/**
 * Текст дела на нужном языке. Если перевода нет, берётся первый имеющийся:
 * лучше показать текст на другом языке, чем пустую карту.
 */
export function localize(text: LocalizedText | null | undefined, language: string): string {
  if (!text) {
    return ''
  }
  return text[language] ?? Object.values(text)[0] ?? ''
}
