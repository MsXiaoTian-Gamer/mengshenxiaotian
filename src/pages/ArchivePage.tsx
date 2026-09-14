import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
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
  const [params, setParams] = useSearchParams()
  const kind = params.get('kind') || 'all'
  const tag = params.get('tag') || 'all'
  const query = params.get('q') || ''
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value === 'all' || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next)
  }
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
    const q = query.trim().toLowerCase()
    if (q) list = list.filter(a => (a.title + ' ' + a.tags.join(' ') + ' ' + a.slug).toLowerCase().includes(q))
    return list
  }, [kind, tag, query])

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
        <label className="archive-search">
          <span>搜索归档</span>
          <input value={query} onChange={e => updateFilter('q', e.target.value)} placeholder="按标题、标签搜索…" type="search" />
        </label>

        <div className="archive-kind-tabs">
          <button className={'archive-tag-btn' + (kind === 'all' ? ' active' : '')} onClick={() => updateFilter('kind', 'all')}>
            全部 ({kindCounts.all || 0})
          </button>
          {KIND_ORDER.map(k => {
            const c = kindCounts[k] || 0
            if (c === 0) return null
            return (
              <button
                key={k}
                className={'archive-tag-btn' + (kind === k ? ' active' : '')}
                onClick={() => updateFilter('kind', k)}
              >
                {KIND_LABELS[k]} ({c})
              </button>
            )
          })}
        </div>

        <div className="archive-tag-filters">
          <button className={'archive-tag-btn' + (tag === 'all' ? ' active' : '')} onClick={() => updateFilter('tag', 'all')}>
            全部 ({ARTICLES_SORTED.length})
          </button>
          {tagCounts.map(tc => (
            <button
              key={tc.tag}
              className={'archive-tag-btn' + (tag === tc.tag ? ' active' : '')}
              onClick={() => updateFilter('tag', tc.tag)}
            >
              {tc.tag} ({tc.count})
            </button>
          ))}
        </div>

        <div className="archive-content">
          <p className="archive-result-count">找到 {filtered.length} 篇文章{query.trim() ? ` · 关键词“${query.trim()}”` : ''}</p>
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
