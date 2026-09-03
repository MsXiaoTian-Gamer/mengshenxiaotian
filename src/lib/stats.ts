// 访问/阅读统计：权威数据存于 Upstash Redis（/api/pv），本模块负责
//   1) 埋点上报（含浏览器侧节流：文章按天、首页按浏览器会话）
//   2) 读取远端统计，失败时回退到本地缓存的最近一次快照
// 节流标记与快照缓存使用 localStorage，但不再承担计数职责。
const API = '/api/pv'
const SESSION_VISIT_KEY = 'blog_visit_session_done'
const PV_DAY_PREFIX = 'blog_pv_day_'
const CACHE_KEY = 'blog_stats_cache'

export interface RemoteStats {
  site: number
  articles: Record<string, number>
}

function todayKey(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return d.getFullYear() + '-' + m + '-' + day
}

function readCache(): RemoteStats | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as RemoteStats
    if (typeof data.site !== 'number' || !data.articles || typeof data.articles !== 'object') return null
    return data
  } catch (e) {
    return null
  }
}

function writeCache(stats: RemoteStats): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(stats))
  } catch (e) {
    /* ignore */
  }
}

/** 拉取远端统计；未配置/失败时回退本地缓存（可能为 null） */
export async function fetchRemoteStats(): Promise<RemoteStats | null> {
  try {
    const res = await fetch(API, { headers: { accept: 'application/json' } })
    if (!res.ok) throw new Error('pv http ' + res.status)
    const data = await res.json()
    if (!data || typeof data.site !== 'number' || !data.articles) throw new Error('pv bad payload')
    const stats: RemoteStats = { site: data.site, articles: data.articles }
    writeCache(stats)
    return stats
  } catch (e) {
    return readCache()
  }
}

/** 上报一次全站访问（同一浏览器会话内只上报一次，刷新不重复计） */
export async function reportSiteVisit(): Promise<void> {
  try {
    if (sessionStorage.getItem(SESSION_VISIT_KEY)) return
    sessionStorage.setItem(SESSION_VISIT_KEY, '1')
  } catch (e) {
    /* ignore */
  }
  try {
    await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'site' }),
    })
  } catch (e) {
    /* 离线/未配置时静默跳过 */
  }
}

/** 上报一次文章阅读（同一浏览器同一天只计一次，语义与旧版一致） */
export async function reportArticleView(slug: string): Promise<void> {
  const day = todayKey()
  const flag = PV_DAY_PREFIX + slug
  try {
    if (localStorage.getItem(flag) === day) return
    localStorage.setItem(flag, day)
  } catch (e) {
    /* ignore */
  }
  try {
    await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'article', slug }),
    })
  } catch (e) {
    /* ignore */
  }
}
