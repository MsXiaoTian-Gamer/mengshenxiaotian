import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ARTICLES, ARTICLES_SORTED, type ArticleMeta } from '../data/articles'
import { getRawContent } from '../lib/content'
import { estimateReadingTime, formatDateCN, getTagColors, getPrimaryTag, pickRelated } from '../lib/blog'
import { enhanceMarkdownDom, renderMarkdownHtml, copyText, buildDescription } from '../lib/render'
import { setPageMeta } from '../lib/seo'
import { ThemeToggleButton } from '../components/widgets'
import { trackArticleView } from '../lib/stats'

interface TocItem {
  id: string
  level: number
  text: string
}

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
  root.querySelectorAll('h2, h3').forEach(hRaw => {
    const h = hRaw as HTMLElement
    let base = slugifyHeading(h.textContent || '')
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

export function GiscusComments() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'MsXiaoTian-Gamer/mengshenxiaotian')
    script.setAttribute('data-repo-id', 'R_kgDOToc_Fg')
    script.setAttribute('data-category', 'General')
    script.setAttribute('data-category-id', 'DIC_kwDOToc_Fs4DCXIO')
    script.setAttribute('data-mapping', 'pathname')
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'preferred_color_scheme')
    script.setAttribute('data-lang', 'zh-CN')
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true
    el.appendChild(script)
    return () => {
      el.innerHTML = ''
    }
  }, [])
  return <div ref={ref}></div>
}

function LikeButton({ article }: { article: ArticleMeta }) {
  const likeKey = 'blog_likes_' + article.path
  const countKey = likeKey + '_count'
  const [liked, setLiked] = useState(() => {
    try {
      return localStorage.getItem(likeKey) === '1'
    } catch (e) {
      return false
    }
  })
  const [count, setCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem(countKey) || '0', 10)
    } catch (e) {
      return 0
    }
  })

  const onClick = () => {
    try {
      if (liked) {
        localStorage.setItem(likeKey, '0')
        const c = Math.max(0, count - 1)
        localStorage.setItem(countKey, String(c))
        setCount(c)
        setLiked(false)
      } else {
        localStorage.setItem(likeKey, '1')
        const c = count + 1
        localStorage.setItem(countKey, String(c))
        setCount(c)
        setLiked(true)
      }
    } catch (e) {
      /* ignore */
    }
  }

  return (
    <div className="like-section">
      <button className={'like-btn' + (liked ? ' liked' : '')} onClick={onClick}>
        <span className="like-icon">{liked ? '❤️' : '🤍'}</span>{' '}
        <span className="like-count">{count}</span> 次点赞
      </button>
    </div>
  )
}

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const article = useMemo(() => ARTICLES.find(a => a.slug === slug) || null, [slug])
  const md = useMemo(() => (article ? getRawContent(article.path) : ''), [article])
  const html = useMemo(() => (article ? renderMarkdownHtml(md) : ''), [article, md])
  const bodyRef = useRef<HTMLDivElement>(null)
  const [toc, setToc] = useState<TocItem[]>([])
  const [views, setViews] = useState(0)
  const [copied, setCopied] = useState(false)
  const active = useScrollSpy(toc.map(t => t.id))
  const related = useMemo(() => (article ? pickRelated(article, ARTICLES_SORTED) : []), [article])
  const relatedRef = useRef<HTMLDivElement>(null)
  const index = article ? ARTICLES_SORTED.findIndex(a => a.slug === article.slug) : -1
  const prev = index > 0 ? ARTICLES_SORTED[index - 1] : null
  const next = index >= 0 && index < ARTICLES_SORTED.length - 1 ? ARTICLES_SORTED[index + 1] : null

  useEffect(() => {
    if (!article) {
      setPageMeta('文章未找到 - 萌神小天')
      return
    }
    setPageMeta(article.title + ' - 萌神小天', buildDescription(md), { path: '/post/' + article.slug })
  }, [article, md])

  // 阅读量：同一浏览器同一天只计一次
  useEffect(() => {
    if (!article) return
    setViews(trackArticleView(article.slug))
  }, [article])

  useEffect(() => {
    if (!article || !bodyRef.current) return
    const root = bodyRef.current
    root.innerHTML = html
    enhanceMarkdownDom(root)
    setToc(collectToc(root))
    setCopied(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [article, html])

  if (!article) {
    return (
      <>
        <nav className="art-nav">
          <Link to="/" className="home-link" title="回到首页">
            ← 萌神小天
          </Link>
          <span className="nav-divider"></span>
          <span className="nav-title">文章未找到</span>
          <ThemeToggleButton className="theme-btn" />
        </nav>
        <main className="art-container">
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 12 }}>文章不存在或已被移动</h1>
            <Link to="/archive" style={{ color: 'var(--brand)' }}>
              去归档页看看 →
            </Link>
          </div>
        </main>
      </>
    )
  }

  const time = estimateReadingTime(md)
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
        <div className="related-cards" ref={relatedRef}>
          {list.map(r => {
            const tc = getTagColors(getPrimaryTag(r) || '')
            const rmd = getRawContent(r.path)
            return (
              <Link key={r.path} to={'/post/' + r.slug} className="related-card">
                <div className="related-card-meta">{r.date}</div>
                <div className="related-card-title">{r.title}</div>
                <div className="related-card-tags">
                  {(r.tags || []).slice(0, 3).map(t => (
                    <span key={t} style={{ background: tc.bg, color: tc.color }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="related-card-desc">{estimateReadingTime(rmd)} min read</div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <nav className="art-nav">
        <Link to="/" className="home-link" title="回到首页">
          ← 萌神小天
        </Link>
        <span className="nav-divider"></span>
        <span className="nav-title">{article.title}</span>
        <ThemeToggleButton className="theme-btn" />
      </nav>

      <main className="art-container">
        <article className="art-header">
          <h1>{article.title}</h1>
          <div className="art-meta" style={{ marginTop: 10 }}>
            <span>{formatDateCN(article.date)}</span>
            <span> · </span>
            <span>约 {time} 分钟</span>
            <span> · </span>
            <span>{views} 次阅读</span>
          </div>
          <div className="art-tags" style={{ marginTop: 12 }}>
            {(article.tags || []).map(t => {
              const tc = getTagColors(t)
              return (
                <span key={t} style={{ background: tc.bg, color: tc.color, padding: '2px 10px', borderRadius: 999, fontSize: '0.75rem' }}>
                  #{t}
                </span>
              )
            })}
          </div>
        </article>

        {toc.length > 0 && (
          <div className="toc" style={{ margin: '16px 0' }}>
            <h3 className="toc-title">📑 目录</h3>
            <ul className="toc-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
              {toc.map(t => (
                <li key={t.id} className={'toc-item' + (t.level === 3 ? ' toc-h3' : '')}>
                  <a
                    href={'#' + t.id}
                    className={active === t.id ? 'active' : ''}
                    onClick={e => {
                      e.preventDefault()
                      onTocClick(t.id)
                    }}
                  >
                    {t.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="art-content">
          <div className="art-body" ref={bodyRef}></div>
        </div>

        <div className="art-footer" style={{ display: 'block' }}>
          <div className="art-share" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 28 }}>
            <span>分享：</span>
            <button className={'share-btn' + (copied ? ' copied' : '')} onClick={onCopyLink} title="复制链接" aria-label="复制链接">
              🔗 复制链接
            </button>
            <a
              className="share-btn"
              href={'https://service.weibo.com/share/share.php?url=' + encodeURIComponent(shareUrl) + '&title=' + shareTitle}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="分享到微博"
            >
              微博
            </a>
            <a
              className="share-btn"
              href={'https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + encodeURIComponent(shareUrl) + '&title=' + shareTitle}
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
          <div className="art-downloads" style={{ marginTop: 30 }}>
            <h3 className="downloads-title" style={{ fontSize: '1.05rem', marginBottom: 12 }}>
              📦 附件下载
            </h3>
            <div className="downloads-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {article.downloads.map((d, i) => (
                <div
                  className="download-item"
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--card-bg)',
                  }}
                >
                  <div>
                    <div className="download-name" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {d.name}
                    </div>
                    {d.desc && (
                      <div className="download-desc" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        {d.desc}
                      </div>
                    )}
                  </div>
                  <a
                    className="download-btn"
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flexShrink: 0,
                      padding: '7px 18px',
                      borderRadius: 999,
                      background: 'var(--brand)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      textDecoration: 'none',
                    }}
                  >
                    下载 ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {renderRelated(related)}

        <div className="art-pagination" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 28 }}>
          {prev ? (
            <Link to={'/post/' + prev.slug} style={{ color: 'var(--brand)', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← {prev.title}
            </Link>
          ) : (
            <span></span>
          )}
          {next ? (
            <Link to={'/post/' + next.slug} style={{ color: 'var(--brand)', fontSize: '0.85rem', textDecoration: 'none' }}>
              {next.title} →
            </Link>
          ) : (
            <span></span>
          )}
        </div>

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
