import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggleButton } from '../components/widgets'
import { setPageMeta } from '../lib/seo'
import { ARTICLES_SORTED } from '../data/articles'
import { fetchRemoteStats, type RemoteStats } from '../lib/stats'
import { getTagCounts } from '../lib/blog'

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 统计仪表盘：服务端口径（Upstash Redis，经 /api/pv 读写），可导出 JSON 归档 */
export default function StatsPage() {
  useEffect(() => {
    setPageMeta('统计仪表盘 - 萌神小天', '萌神小天博客访问与文章阅读统计（服务端计数，可导出）')
  }, [])

  const [remote, setRemote] = useState<RemoteStats | null>(null)
  const [remoteReady, setRemoteReady] = useState(false)

  useEffect(() => {
    let alive = true
    fetchRemoteStats().then(s => {
      if (alive) {
        setRemote(s)
        setRemoteReady(true)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  const data = useMemo(() => {
    const list = ARTICLES_SORTED.map(a => ({ ...a, views: remote?.articles[a.slug] || 0 }))
    const sitePv = remote?.site || 0
    const totalPv = list.reduce((s, a) => s + a.views, 0)
    const hot = list
      .filter(a => a.views > 0)
      .sort((x, y) => y.views - x.views || y.date.localeCompare(x.date))
      .slice(0, 10)
    const tagCounts = getTagCounts(ARTICLES_SORTED)
    return { list, sitePv, totalPv, hot, tagCounts }
  }, [remote])

  const maxViews = Math.max(1, ...data.list.map(a => a.views))

  return (
    <>
      <nav className="archive-nav">
        <Link to="/" title="回到首页">
          ← 萌神小天
        </Link>
        <span className="nav-divider"></span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>统计仪表盘 / STATS.SYS</span>
        <ThemeToggleButton className="theme-btn" />
      </nav>

      <main className="stats-container">
        <div className="stats-hero">
          <div className="stats-title">STATS.SYS</div>
          <div className="stats-sub">访问统计 · 服务端计数 · 随时导出</div>
        </div>

        <div className="stats-cards">
          <div className="stats-card">
            <div className="stats-card-num">{data.sitePv}</div>
            <div className="stats-card-label">全站访问量</div>
          </div>
          <div className="stats-card">
            <div className="stats-card-num">{data.totalPv}</div>
            <div className="stats-card-label">文章累计阅读量</div>
          </div>
          <div className="stats-card">
            <div className="stats-card-num">{data.list.length}</div>
            <div className="stats-card-label">文章总数</div>
          </div>
          <div className="stats-card">
            <div className="stats-card-num">{data.tagCounts.length}</div>
            <div className="stats-card-label">标签分类</div>
          </div>
        </div>

        {!remoteReady && <div className="stats-empty">正在从服务端读取统计…</div>}

        <section className="stats-sec">
          <h2>热门文章 TOP 10</h2>
          {remoteReady && data.hot.length === 0 ? (
            <div className="stats-empty">
              暂无阅读数据 —— 每篇文章的阅读量会在打开时自动上报到服务端（同一浏览器同一天只计一次）。
            </div>
          ) : (
            <div className="stats-hot-list">
              {data.hot.map((a, i) => (
                <Link key={a.slug} className="stats-hot-item" to={'/post/' + a.slug}>
                  <span className="stats-hot-rank">{String(i + 1).padStart(2, '0')}</span>
                  <span className="stats-hot-title">{a.title}</span>
                  <span className="stats-hot-bar" style={{ width: Math.max(8, (a.views / maxViews) * 100) + '%' }} />
                  <span className="stats-hot-views">{a.views} 次</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="stats-sec">
          <h2>全部文章阅读明细</h2>
          <div className="stats-table-wrap">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>文章</th>
                  <th>日期</th>
                  <th>阅读</th>
                </tr>
              </thead>
              <tbody>
                {data.list.map(a => (
                  <tr key={a.slug}>
                    <td>
                      <Link to={'/post/' + a.slug} className="stats-table-link">
                        {a.title}
                      </Link>
                    </td>
                    <td>{a.date}</td>
                    <td>{a.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="stats-actions">
          <button
            className="quiz-btn"
            onClick={() =>
              downloadJson(
                {
                  exportedAt: new Date().toISOString(),
                  sitePv: data.sitePv,
                  totalPv: data.totalPv,
                  articles: data.list.map(a => ({ title: a.title, slug: a.slug, date: a.date, views: a.views })),
                },
                'msxt-blog-stats-' + new Date().toISOString().slice(0, 10) + '.json'
              )
            }
          >
            ⬇ 导出 JSON
          </button>
          <span className="stats-note">
            注：统计存储于 Upstash Redis 服务端（经 /api/pv 读写），非浏览器本地口径。首页访问按浏览器会话计一次；文章阅读同一浏览器同一天只计一次。
          </span>
        </div>
      </main>
    </>
  )
}
