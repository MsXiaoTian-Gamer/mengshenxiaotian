// 加载 src/content/*.md 原始正文（动态按需，避免全文 eager 进引用 chunk）
// Vite 会把每篇 md 拆为独立小 chunk，仅在调用 getRawContent(path) 时加载
const rawModules = import.meta.glob('/src/content/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

/** 按 md 文件名（如 2026-08-17-mihoyo-game-client-interview.md）异步取原始正文 */
export async function getRawContent(path: string): Promise<string> {
  const loader = rawModules['/src/content/' + path]
  if (!loader) return ''
  return (await loader()) as string
}

export const CONTENT_COUNT = Object.keys(rawModules).length
