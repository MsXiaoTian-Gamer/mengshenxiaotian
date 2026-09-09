import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES_SORTED, type ArticleMeta } from '../data/articles'
import { POST_MINUTES } from '../data/generated-meta'
import { getTagCounts, KIND_LABELS, KIND_ORDER } from '../lib/blog'
import { setPageMeta } from '../lib/seo'
import { ThemeToggleButton } from '../components/widgets'

interface YearGroup {
  year: string
  items: ArticleMeta[]
}

function groupByYear(articles: ArticleMeta[]): YearGroup[] {
  const map: Record<string, ArticleMeta[]> = {}
  articles.forEach(a => {
    const y = a.date.slice(0, 4)
    if (!map[y]) map[y] = []
    map[y].push(a)
  })
  return Object.keys(map)
    .sort((a, b) => b.localeCompare(a))
    .map(year => ({ year, items: map[year] }))
}

export default function ArchivePage() {
  const [kind, setKind] = useState('all')
  const [tag, setTag] = useState('all')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const tagCounts = useMemo(() => getTagCounts(ARTICLES_SORTED), [])
  const kindCounts = useMemo(() => {
    const counts: Record<string, number> = { all: ARTICLES_SORTED.length }
    ARTICLES_SORTED.forEach(a => { counts[a.kind] = (counts[a.kind] || 0) + 1 })
    return counts
  }, [])

  useEffect(() => {
    setPageMeta('文章归档 - 萌神小天')
  }, [])

  const filtered = useMemo(() => {
    let list = ARTICLES_SORTED
    if (kind !== 'all') list = list.filter(a => a.kind === kind)
    if (tag !== 'all') list = list.filter(a => a.tags && a.tags.includes(tag))
    return list
  }, [kind, tag])

  const groups = useMemo(() => groupByYear(filtered), [filtered])

  const toggleYear = (year: string) => {
    setCollapsed(c => ({ ...c, [year]: !c[year] }))
  }

  return (
    <>
      <nav className="archive-nav">
        <Link to="/" title="回到首页">
          ← 萌神小天
        </Link>
        <span className="nav-divider"></span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>归档</span>
        <ThemeToggleButton className="theme-btn" />
      </nav>

      <div className="archive-container">
        <h1 className="archive-title">文章归档</h1>

        <div className="archive-kind-tabs">
          <button className={'archive-tag-btn' + (kind === 'all' ? ' active' : '')} onClick={() => setKind('all')}>
            全部 ({kindCounts.all || 0})
          </button>
          {KIND_ORDER.map(k => {
            const c = kindCounts[k] || 0
            if (c === 0) return null
            return (
              <button
                key={k}
                className={'archive-tag-btn' + (kind === k ? ' active' : '')}
                onClick={() => setKind(k)}
              >
                {KIND_LABELS[k]} ({c})
              </button>
            )
          })}
        </div>

        <div className="archive-tag-filters">
          <button className={'archive-tag-btn' + (tag === 'all' ? ' active' : '')} onClick={() => setTag('all')}>
            全部 ({ARTICLES_SORTED.length})
          </button>
          {tagCounts.map(tc => (
            <button
              key={tc.tag}
              className={'archive-tag-btn' + (tag === tc.tag ? ' active' : '')}
              onClick={() => setTag(tc.tag)}
            >
              {tc.tag} ({tc.count})
            </button>
          ))}
        </div>

        <div className="archive-content">
          {groups.length === 0 && <p style={{ color: 'var(--text-muted)' }}>该分类下暂无文章</p>}
          {groups.map(g => (
            <div className="archive-year" key={g.year} data-year={g.year}>
              <h2 className="archive-year-title" onClick={() => toggleYear(g.year)} title="点击折叠/展开">
                {g.year} 年
                <span className="archive-count">{g.items.length} 篇</span>
                <span className="archive-toggle">{collapsed[g.year] ? '+' : '−'}</span>
              </h2>
              <div className="archive-year-body" style={collapsed[g.year] ? { display: 'none' } : undefined}>
                {g.items.map(a => {
                  const mins = POST_MINUTES[a.slug] || 1
                  return (
                    <div className="archive-item" key={a.path}>
                      <span className="archive-date">{a.date}</span>
                      <Link className="archive-link" to={'/post/' + a.slug}>
                        {a.title}
                      </Link>
                      <span className="archive-words">约 {mins} min</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
