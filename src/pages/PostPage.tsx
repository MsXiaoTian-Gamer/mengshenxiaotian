import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ARTICLES, ARTICLES_SORTED, type ArticleMeta } from '../data/articles'
import { POST_MINUTES, POST_SUMMARY } from '../data/generated-meta'
import { getArticleExcerpt } from '../lib/articleExcerpt'
import { getRawContent } from '../lib/content'
import { formatDateCN, getTagColors, getPrimaryTag, pickRelated } from '../lib/blog'
import { enhanceMarkdownDom, renderMarkdownHtml, copyText, buildDescription } from '../lib/render'
import { setPageMeta } from '../lib/seo'
import { getTheme, ensureHljsCss } from '../lib/theme'
import { reportArticleView, fetchRemoteStats } from '../lib/stats'
import { ReadingRail, TableOfContents, type TocItem } from '../components/post/ArticleOutline'
import { GiscusComments, LikeButton } from '../components/post/PostEngagement'

function slugifyHeading(text: string): string {
  return (
    'h-' +
      text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'h'
  )
}

/** 根据当前文章内容，在 .art-body 内为标题补齐 id，返回 TOC */
function collectToc(root: HTMLElement): TocItem[] {
  const items: TocItem[] = []
  const seen: Record<string, number> = {}
  root.querySelectorAll('h2, h3').forEach((hRaw) => {
    const h = hRaw as HTMLElement
    const base = slugifyHeading(h.textContent || '')
    seen[base] = (seen[base] || 0) + 1
    const id = seen[base] > 1 ? base + '-' + seen[base] : base
    h.id = id
    items.push({ id, level: h.tagName === 'H2' ? 2 : 3, text: (h.textContent || '').trim() })
  })
  return items
}

function useScrollSpy(ids: string[]): string {
  const [active, setActive] = useState('')
  useEffect(() => {
    const onScroll = () => {
      let current = ''
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 90) current = id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])
  return active
}

function PostArticle({ article }: { article: ArticleMeta }) {
  const [md, setMd] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    getRawContent(article.path)
      .then((content) => {
        if (alive) setMd(content)
      })
      .catch(() => {
        if (alive) setMd('')
      })
    return () => {
      alive = false
    }
  }, [article.path])
  const html = useMemo(() => (md ? renderMarkdownHtml(md) : ''), [md])
  const bodyRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [views, setViews] = useState<number | null>(null)
  const [viewsLoaded, setViewsLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [focusMode, setFocusMode] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const tocIds = useMemo(() => toc.map((t) => t.id), [toc])
  const active = useScrollSpy(tocIds)

  useEffect(() => {
    document.body.classList.toggle('reading-focus', focusMode)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFocusMode(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('reading-focus')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [focusMode])
  const related = useMemo(() => pickRelated(article, ARTICLES_SORTED), [article])
  const index = ARTICLES_SORTED.findIndex((a) => a.slug === article.slug)
  const prev = index > 0 ? ARTICLES_SORTED[index - 1] : null
  const next = index >= 0 && index < ARTICLES_SORTED.length - 1 ? ARTICLES_SORTED[index + 1] : null

  useEffect(() => {
    const updateProgress = () => {
      const body = bodyRef.current
      if (!body || !html) {
        setReadingProgress(0)
        return
      }
      const start = body.getBoundingClientRect().top + window.scrollY
      const end = start + body.offsetHeight - window.innerHeight
      const span = Math.max(1, end - start)
      const progress = Math.round(
        Math.min(100, Math.max(0, ((window.scrollY - start) / span) * 100)),
      )
      setReadingProgress(progress)
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [html])

  useEffect(() => {
    setPageMeta(article.title + ' - 萌神小天', buildDescription(POST_SUMMARY[article.slug] || ''), {
      path: '/post/' + article.slug,
    })
  }, [article])

  // 阅读量：上报（同浏览器同一天一次），再拉取远端计数展示
  useEffect(() => {
    let alive = true
    reportArticleView(article.slug)
      .then(() => fetchRemoteStats())
      .then((s) => {
        if (!alive) return
        if (s) setViews(s.articles[article.slug] || 0)
        setViewsLoaded(true)
      })
      .catch(() => {
        if (alive) setViewsLoaded(true)
      })
    return () => {
      alive = false
    }
  }, [article])

  useEffect(() => {
    if (!bodyRef.current) return
    const root = bodyRef.current
    root.innerHTML = html
    // 正文含代码块才注入 hljs 主题 CSS；切主题后进入文章页以当前主题加载（幂等）
    void ensureHljsCss(getTheme())
    enhanceMarkdownDom(root)
    setToc(collectToc(root))
    setCopied(false)
    setFontSize(16)
    contentRef.current?.style.setProperty('--article-font-size', '16px')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [article, html])

  const time = POST_MINUTES[article.slug] || 1
  const excerpt = getArticleExcerpt(article)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://msxiaotian.top'
  const shareTitle = encodeURIComponent(article.title + ' - 萌神小天')

  const onCopyLink = () => {
    copyText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const onTocClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const renderRelated = (list: ArticleMeta[]) => {
    if (list.length === 0) return null
    return (
      <div className="related-section">
        <h3>相关文章</h3>
        <div className="related-cards">
          {list.map((r) => {
            const tc = getTagColors(getPrimaryTag(r) || '')
            return (
              <Link key={r.path} to={'/post/' + r.slug} className="related-card">
                <div className="related-card-meta">{r.date}</div>
                <div className="related-card-title">{r.title}</div>
                <div className="related-card-tags">
                  {(r.tags || []).slice(0, 3).map((t) => (
                    <span key={t} style={{ background: tc.bg, color: tc.color }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="related-card-desc">{POST_MINUTES[r.slug] || 1} min read</div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <main className="art-container" id="mainContent">
        <header className="art-header">
          <div className="article-kicker">
            <span className="article-kicker-dot" />
            <Link to="/archive">文章归档</Link>
            <span>/</span> 开发手记
          </div>
          <h1>{article.title}</h1>
          {excerpt && <p className="art-deck">{excerpt}</p>}
          <div className="art-meta">
            <time dateTime={article.date}>{formatDateCN(article.date)}</time>
            <span>约 {time} 分钟</span>
            <span>
              {views === null
                ? viewsLoaded
                  ? '阅读量暂不可用'
                  : '阅读量加载中'
                : `${views} 次阅读`}
            </span>
          </div>
          <div className="article-reading-tools" aria-label="阅读设置">
            <span>字号</span>
            <button
              type="button"
              aria-label="缩小字号"
              title="缩小字号"
              disabled={fontSize <= 14}
              onClick={() =>
                setFontSize((size) => {
                  const next = Math.max(14, size - 1)
                  contentRef.current?.style.setProperty('--article-font-size', `${next}px`)
                  return next
                })
              }
            >
              A−
            </button>
            <span className="article-font-value">{fontSize}px</span>
            <button
              type="button"
              aria-label="放大字号"
              title="放大字号"
              disabled={fontSize >= 22}
              onClick={() =>
                setFontSize((size) => {
                  const next = Math.min(22, size + 1)
                  contentRef.current?.style.setProperty('--article-font-size', `${next}px`)
                  return next
                })
              }
            >
              A+
            </button>
            <button
              type="button"
              className="focus-mode-toggle"
              aria-pressed={focusMode}
              onClick={() => setFocusMode((value) => !value)}
            >
              {focusMode ? '退出专注' : '专注阅读'}
            </button>
          </div>
          {focusMode && (
            <button type="button" className="focus-mode-exit" onClick={() => setFocusMode(false)}>
              退出专注阅读 <kbd>Esc</kbd>
            </button>
          )}
          <div className="art-tags">
            {(article.tags || []).map((t) => {
              const tc = getTagColors(t)
              return (
                <span key={t} className="post-tag" style={{ background: tc.bg, color: tc.color }}>
                  #{t}
                </span>
              )
            })}
          </div>
        </header>

        {article.kind === 'interview' && (
          <aside className="interview-guide" aria-label="面试复盘阅读提示">
            <strong>面试复盘阅读提示</strong>
            <span>
              建议按“面试背景 → 题目与回答 → 暴露的问题 →
              后续复习”阅读，把经历记录转成自己的复习清单。
            </span>
          </aside>
        )}

        <div className="article-reading-layout">
          <div className="article-main-column">
            <TableOfContents items={toc} activeId={active} onNavigate={onTocClick} />

            <div className="art-content" ref={contentRef}>
              {!html && (
                <div className="article-load-state" role="status">
                  {md === null ? '正在加载正文…' : '正文暂时无法加载，请稍后刷新重试。'}
                </div>
              )}
              <div className="art-body" ref={bodyRef}></div>
            </div>
          </div>
          <ReadingRail
            items={toc}
            activeId={active}
            onNavigate={onTocClick}
            progress={readingProgress}
            minutes={time}
          />
        </div>

        <div className="art-footer" style={{ display: 'block' }}>
          <div
            className="art-share"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
              marginTop: 28,
            }}
          >
            <span>分享：</span>
            <button
              className={'share-btn' + (copied ? ' copied' : '')}
              onClick={onCopyLink}
              title="复制链接"
              aria-label="复制链接"
            >
              🔗 复制链接
            </button>
            <a
              className="share-btn"
              href={
                'https://service.weibo.com/share/share.php?url=' +
                encodeURIComponent(shareUrl) +
                '&title=' +
                shareTitle
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label="分享到微博"
            >
              微博
            </a>
            <a
              className="share-btn"
              href={
                'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' +
                encodeURIComponent(shareUrl) +
                '&title=' +
                shareTitle
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label="分享到QQ空间"
            >
              QQ空间
            </a>
            <LikeButton article={article} />
          </div>
        </div>

        {article.downloads && article.downloads.length > 0 && (
          <div className="art-downloads">
            <h3 className="downloads-title">📦 附件下载</h3>
            <div className="downloads-list">
              {article.downloads.map((d, i) => (
                <div className="download-item" key={i}>
                  <div>
                    <div className="download-name">{d.name}</div>
                    {d.desc && <div className="download-desc">{d.desc}</div>}
                  </div>
                  <a
                    className="download-btn"
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    下载 ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {renderRelated(related)}

        <nav className="art-pagination" aria-label="相邻文章">
          {prev ? (
            <Link to={'/post/' + prev.slug} className="pagination-card pagination-prev">
              <span className="pagination-direction">← 上一篇</span>
              <span className="pagination-title">{prev.title}</span>
              <span className="pagination-date">{prev.date}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={'/post/' + next.slug} className="pagination-card pagination-next">
              <span className="pagination-direction">下一篇 →</span>
              <span className="pagination-title">{next.title}</span>
              <span className="pagination-date">{next.date}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className="giscus-comments" style={{ marginTop: 40 }}>
          <div
            className="discuss-note"
            style={{
              marginBottom: 10,
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              lineHeight: 1.7,
            }}
          >
            评论由 GitHub Discussions 驱动，也可以直接到{' '}
            <a
              href="https://github.com/MsXiaoTian-Gamer/mengshenxiaotian/discussions"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--brand)', textDecoration: 'none' }}
            >
              GitHub 讨论区
            </a>{' '}
            参与交流，有回复会第一时间同步。
          </div>
          <GiscusComments />
        </div>
      </main>
    </>
  )
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const article = ARTICLES.find((item) => item.slug === slug)

  useEffect(() => {
    if (!article) setPageMeta('文章未找到 - 萌神小天')
  }, [article])

  if (!article) {
    return (
      <main className="art-container article-missing" id="mainContent">
        <h1>文章不存在或已被移动</h1>
        <Link to="/archive">去归档页看看 →</Link>
      </main>
    )
  }

  return <PostArticle key={article.slug} article={article} />
}
