import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ARTICLES_SORTED } from '../data/articles'
import { POST_MINUTES } from '../data/generated-meta'
import { getTagCounts, KIND_LABELS, KIND_ORDER } from '../lib/blog'
import { filterArticles, groupArticlesByYear } from '../lib/archive'
import { setPageMeta } from '../lib/seo'

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
    ARTICLES_SORTED.forEach((a) => {
      counts[a.kind] = (counts[a.kind] || 0) + 1
    })
    return counts
  }, [])

  useEffect(() => {
    setPageMeta('文章归档 - 萌神小天')
  }, [])

  const filtered = useMemo(
    () => filterArticles(ARTICLES_SORTED, { kind, tag, query }),
    [kind, tag, query],
  )

  const groups = useMemo(() => groupArticlesByYear(filtered), [filtered])
  const activeFilterCount =
    Number(kind !== 'all') + Number(tag !== 'all') + Number(Boolean(query.trim()))
  const archiveYears = useMemo(
    () => new Set(ARTICLES_SORTED.map((article) => article.date.slice(0, 4))).size,
    [],
  )

  const toggleYear = (year: string) => {
    setCollapsed((c) => ({ ...c, [year]: !c[year] }))
  }

  return (
    <>
      <div className="archive-container">
        <div className="archive-heading">
          <div>
            <p className="archive-kicker">THE JOURNAL / INDEX</p>
            <h1 className="archive-title">文章归档</h1>
            <p className="archive-intro">按主题和年份，找到你想读的开发记录。</p>
          </div>
          <div className="archive-stats" aria-label="归档统计">
            <span>
              <strong>{ARTICLES_SORTED.length}</strong> 篇文章
            </span>
            <span>
              <strong>{archiveYears}</strong> 年记录
            </span>
            <span>
              <strong>{tagCounts.length}</strong> 个主题
            </span>
          </div>
        </div>
        <label className="archive-search">
          <span>搜索归档</span>
          <input
            value={query}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="按标题、标签搜索…"
            type="search"
          />
        </label>

        <div className="archive-kind-tabs">
          <button
            className={'archive-tag-btn' + (kind === 'all' ? ' active' : '')}
            onClick={() => updateFilter('kind', 'all')}
          >
            全部 ({kindCounts.all || 0})
          </button>
          {KIND_ORDER.map((k) => {
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
          <button
            className={'archive-tag-btn' + (tag === 'all' ? ' active' : '')}
            onClick={() => updateFilter('tag', 'all')}
          >
            全部 ({ARTICLES_SORTED.length})
          </button>
          {tagCounts.map((tc) => (
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
          <div className="archive-results-head">
            <p className="archive-result-count">
              找到 <strong>{filtered.length}</strong> 篇文章
              {query.trim() ? ` · 关键词“${query.trim()}”` : ''}
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                className="archive-clear"
                onClick={() => setParams(new URLSearchParams())}
              >
                清除筛选 <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
          {groups.length === 0 && (
            <div className="archive-empty">
              <span aria-hidden="true">⌕</span>
              <strong>没有找到匹配的文章</strong>
              <p>试试更短的关键词，或清除部分筛选条件。</p>
              <button type="button" onClick={() => setParams(new URLSearchParams())}>
                查看全部文章
              </button>
            </div>
          )}
          {groups.map((g) => (
            <section className="archive-year" key={g.year} data-year={g.year}>
              <h2 className="archive-year-title">
                <button
                  type="button"
                  aria-expanded={!collapsed[g.year]}
                  aria-controls={'archive-year-' + g.year}
                  onClick={() => toggleYear(g.year)}
                >
                  <span className="archive-year-label">{g.year} 年</span>
                  <span className="archive-count">{g.items.length} 篇</span>
                  <span className="archive-toggle" aria-hidden="true">
                    {collapsed[g.year] ? '+' : '−'}
                  </span>
                </button>
              </h2>
              <div
                className="archive-year-body"
                id={'archive-year-' + g.year}
                hidden={collapsed[g.year]}
              >
                {g.items.map((a) => {
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
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
