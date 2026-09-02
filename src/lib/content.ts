// 加载 src/content/*.md 原始正文（构建期内联，eager 一次性全部载入）
const rawModules = import.meta.glob('/src/content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** 按 md 文件名（如 2026-08-17-mihoyo-game-client-interview.md）取原始正文 */
export function getRawContent(path: string): string {
  return rawModules['/src/content/' + path] ?? ''
}

export const CONTENT_COUNT = Object.keys(rawModules).length
