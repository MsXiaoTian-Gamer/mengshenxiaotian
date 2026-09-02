// 萌神小天博客 - 共享工具函数（源自旧 app.js，TS 化）
import type { ArticleMeta } from '../data/articles'

export const MONTHS_CN = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
export const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDateCN(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const y = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const d = parseInt(parts[2], 10)
  return y + '年' + m + '月' + d + '日'
}

export function getDateBadge(dateStr: string): { month: string; day: string } {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return { month: '', day: '' }
  const m = parseInt(parts[1], 10)
  const d = parseInt(parts[2], 10)
  return { month: MONTHS_EN[m - 1] || '', day: String(d) }
}

/** 去掉 markdown 语法字符后估算阅读分钟数 */
export function estimateReadingTime(content: string): number {
  const text = content.replace(/[#*`\-_>\[\]()!|~]/g, ' ').replace(/\s+/g, ' ').trim()
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = text.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(chineseChars / 300 + englishWords / 200))
}

/** 中文字符 + 英文单词计数 */
export function countWords(content: string): number {
  const text = content.replace(/[#*`\-_>\[\]()!|~]/g, ' ').replace(/\s+/g, ' ').trim()
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const englishWords = text.replace(/[\u4e00-\u9fff]/g, '').split(/\s+/).filter(Boolean).length
  return chineseChars + englishWords
}

/** 摘要：去掉 front matter 与 markdown 符号，截取前 100 字 */
export function getSummary(content: string): string {
  if (!content) return ''
  const text = stripFrontMatter(content)
    .replace(/[#*`\-_>\[\]()!|~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

/** 去掉 markdown front matter（---...---） */
export function stripFrontMatter(md: string): string {
  if (md.startsWith('---')) {
    const end = md.indexOf('---', 3)
    if (end !== -1) {
      return md.substring(end + 3).trim()
    }
  }
  return md
}

export interface TagColors {
  color: string
  bg: string
}

const TAG_COLORS: Record<string, TagColors> = {
  GameDev: { color: 'var(--c-blue)', bg: 'var(--c-blue-bg)' },
  独立游戏: { color: 'var(--c-green)', bg: 'var(--c-green-bg)' },
  Unity: { color: 'var(--c-purple)', bg: 'var(--c-purple-bg)' },
  更新: { color: 'var(--c-orange)', bg: 'var(--c-orange-bg)' },
  面试: { color: 'var(--c-red)', bg: 'var(--c-red-bg)' },
  腾讯: { color: 'var(--c-teal)', bg: 'var(--c-teal-bg)' },
  TapTap: { color: 'var(--c-cyan)', bg: 'var(--c-cyan-bg)' },
  聚光灯: { color: 'var(--c-amber)', bg: 'var(--c-amber-bg)' },
  学习: { color: 'var(--c-indigo)', bg: 'var(--c-indigo-bg)' },
  Unity2D: { color: 'var(--c-default)', bg: 'var(--c-default-bg)' },
  DOTS: { color: 'var(--c-default)', bg: 'var(--c-default-bg)' },
}

export function getTagColors(tag: string): TagColors {
  return TAG_COLORS[tag] || { color: 'var(--c-default)', bg: 'var(--c-default-bg)' }
}

/** 文章"主标签"：优先取有预设配色者 */
export function getPrimaryTag(article: ArticleMeta): string | null {
  if (!article.tags || article.tags.length === 0) return null
  for (let i = 0; i < article.tags.length; i++) {
    if (TAG_COLORS[article.tags[i]]) return article.tags[i]
  }
  return article.tags[0]
}

/** 统计文章标签分布（按数量降序） */
export function getTagCounts(articles: ArticleMeta[]): { tag: string; count: number }[] {
  const tagCount: Record<string, number> = {}
  articles.forEach(a => {
    (a.tags || []).forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1
    })
  })
  return Object.keys(tagCount)
    .map(tag => ({ tag, count: tagCount[tag] }))
    .sort((a, b) => b.count - a.count)
}

/** 按相关标签得分取前 3 篇相关文章 */
export function pickRelated(article: ArticleMeta, all: ArticleMeta[]): ArticleMeta[] {
  const candidates = all.filter(a => a.path !== article.path)
  const scored = candidates
    .map(a => {
      let commonTags = 0
      ;(article.tags || []).forEach(t => {
        if (a.tags && a.tags.indexOf(t) >= 0) commonTags++
      })
      return { article: a, score: commonTags }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
  return scored.map(s => s.article)
}
