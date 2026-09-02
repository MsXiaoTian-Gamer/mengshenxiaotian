// 阅读量统计（localStorage 本地口径；权威统计见 Vercel Web Analytics）
const PV_PREFIX = 'blog_pv_'
const PV_DAY_PREFIX = 'blog_pv_day_'

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    /* ignore */
  }
}

function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return d.getFullYear() + '-' + m + '-' + day
}

/** 单篇文章阅读量 +1（同一浏览器同一天只计一次） */
export function trackArticleView(slug: string): number {
  const day = todayKey()
  const dayFlag = PV_DAY_PREFIX + slug
  if (safeGet(dayFlag) === day) return getArticleViews(slug)
  safeSet(dayFlag, day)
  const key = PV_PREFIX + slug
  const cur = parseInt(safeGet(key) || '0', 10) || 0
  safeSet(key, String(cur + 1))
  return cur + 1
}

/** 读取单篇文章阅读量 */
export function getArticleViews(slug: string): number {
  const key = PV_PREFIX + slug
  return parseInt(safeGet(key) || '0', 10) || 0
}

/** 取热门文章 topN（本地口径；浏览量相等时按 date 最新优先） */
export function getHotArticles<T extends { slug: string; date: string }>(articles: T[], n = 5): T[] {
  const scored = articles
    .map(a => ({ a, v: getArticleViews(a.slug) }))
    .sort((x, y) => y.v - x.v || y.a.date.localeCompare(x.a.date))
  const list = scored.filter(x => x.v > 0).slice(0, n).map(x => x.a)
  return list.length > 0 ? list : []
}
