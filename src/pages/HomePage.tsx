import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES, ARTICLES_SORTED, type ArticleMeta } from '../data/articles'
import { getRawContent } from '../lib/content'
import { estimateReadingTime, formatDateCN, getSummary, getTagCounts, getTagColors, getPrimaryTag } from '../lib/blog'
import { ThemeToggleButton } from '../components/widgets'
import { setPageMeta } from '../lib/seo'
import { searchSlugs } from '../lib/search'
import { getHotArticles, getArticleViews } from '../lib/stats'
import { UNITY_LEARNING_PATH } from '../data/learningPath'

const QUOTES = [
  { text: '游戏是让人快乐的，做游戏也是。', author: '萌神小天' },
  { text: 'Bug 不是缺陷，是尚未被理解的特性。', author: '萌神小天' },
  { text: '代码能跑就行，但能跑得优雅更好。', author: '萌神小天' },
  { text: '独立开发是一场马拉松，不是百米冲刺。', author: '萌神小天' },
  { text: '每一个伟大的游戏都从一个简单的想法开始。', author: '萌神小天' },
  { text: '不要等待灵感，动手就是最好的灵感。', author: '萌神小天' },
  { text: '学习 Unity 最好的方式就是做一个游戏。', author: '萌神小天' },
]

function postUrl(a: ArticleMeta): string {
  return '/post/' + a.slug
}

function readingMinutes(a: ArticleMeta): number {
  const md = getRawContent(a.path)
  if (!md) return 1
  const raw = md.length
  return Math.max(1, Math.round(raw / 450))
}

function filterArticles(query: string, tag: string): ArticleMeta[] {
  let list = ARTICLES_SORTED
  if (tag !== 'all') {
    list = list.filter(a => a.tags && a.tags.includes(tag))
  }
  const q = query.trim().toLowerCase()
  if (q) {
    list = list.filter(a => {
      const hay = (a.title + ' ' + (a.tags || []).join(' ') + ' ' + a.slug).toLowerCase()
      return hay.includes(q)
    })
  }
  return list
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('all')
  const [navOpen, setNavOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)

  useEffect(() => {
    setPageMeta('萌神小天 - 独立游戏开发博客', '萌神小天的独立游戏开发博客，分享Unity学习、游戏开发和独立游戏心得')
  }, [])

  const filtered = useMemo(() => filterArticles(query, tag), [query, tag])
  const tagCounts = useMemo(() => getTagCounts(ARTICLES_SORTED), [])
  const hotArticles = useMemo(() => getHotArticles(ARTICLES_SORTED, 5), [])

  const stats = useMemo(() => {
    let visits = 0
    try {
      visits = parseInt(localStorage.getItem('blog_visits') || '0', 10) + 1
      localStorage.setItem('blog_visits', String(visits))
    } catch (e) {
      /* ignore */
    }
    return visits
  }, [])

  const daysOnline = useMemo(() => {
    const start = new Date('2025-10-11T00:00:00')
    return Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1)
  }, [])

  const quote = useMemo(() => {
    const d = new Date()
    return QUOTES[(d.getFullYear() + d.getMonth() + d.getDate()) % QUOTES.length]
  }, [])
  const [daily, setDaily] = useState<{
    q: { category: string; question: string; points: string[] }
    dayNo: number
  } | null>(null)

  useEffect(() => {
    let alive = true
    import('../data/unityQuestions')
      .then(m => {
        if (!alive) return
        setDaily({ q: m.getDailyQuestion(), dayNo: Math.max(1, m.dayIndex() + 1) })
      })
      .catch(() => {
        /* ignore */
      })
    return () => {
      alive = false
    }
  }, [])

  const quizToday = daily?.q
  const quizDayNo = daily ? daily.dayNo : 0
  const onHamburger = () => {
    setNavOpen(v => !v)
    const layout = document.getElementById('layout')
    if (layout) layout.classList.toggle('nav-open', !navOpen)
  }

  const setTagAndRefresh = (t: string) => {
    setTag(t)
    setNavOpen(false)
    const layout = document.getElementById('layout')
    if (layout) layout.classList.remove('nav-open')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const renderSidebarItems = (list: ArticleMeta[]) => {
    if (list.length === 0) return <div className="empty-state">暂无文章</div>
    return (
      <>
        {list.slice(0, 8).map(a => {
          const tag0 = getPrimaryTag(a)
          const tc = getTagColors(tag0 || '')
          const time = readingMinutes(a)
          return (
            <Link key={a.path} to={postUrl(a)} className="article-item">
              <div className="item-body">
                <div className="item-title">{a.title}</div>
                <div className="item-meta">
                  <span>{a.date}</span>
                  <span className="reading-time">{time} min</span>
                </div>
                <div className="item-tags">
                  {(a.tags || []).map(t => {
                    const c = getTagColors(t)
                    return (
                      <span key={t} className="item-tag" style={{ '--item-tag-color': c.color, '--item-tag-bg': c.bg } as React.CSSProperties}>
                        {t}
                      </span>
                    )
                  })}
                </div>
              </div>
            </Link>
          )
        })}
      </>
    )
  }

  const renderCards = (list: ArticleMeta[]) => {
    if (list.length === 0) return null
    return (
      <>
        {list.map(a => {
          const md = getRawContent(a.path)
          const summary = getSummary(md)
          return (
            <Link key={a.path} to={postUrl(a)} className="article-card">
              <div className="card-date">{a.date}</div>
              <div className="card-title">{a.title}</div>
              <div className="card-tags">
                {(a.tags || []).map(t => {
                  const tc = getTagColors(t)
                  return (
                    <span key={t} className="card-tag" style={{ background: tc.bg, color: tc.color }}>
                      {t}
                    </span>
                  )
                })}
              </div>
              <div className="card-summary">{summary}</div>
            </Link>
          )
        })}
      </>
    )
  }

  return (
    <>
      <button className="hamburger" id="hamburgerBtn" onClick={onHamburger} aria-label="菜单">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="layout" id="layout">
        {/* ===== Sidebar ===== */}
        <aside className="sidebar" id="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-header-left">
              <Link to="/">萌神小天</Link>
              <p>独立游戏开发者</p>
            </div>
            <div className="header-actions">
              <ThemeToggleButton />
            </div>
          </div>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              id="searchInput"
              placeholder="搜索文章..."
              autoComplete="off"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="tag-filters" id="tagFilters">
            <button
              className={'tag-filter' + (tag === 'all' ? ' active' : '')}
              onClick={() => setTagAndRefresh('all')}
            >
              全部
            </button>
            {tagCounts.map(tc => (
              <button
                key={tc.tag}
                className={'tag-filter' + (tag === tc.tag ? ' active' : '')}
                onClick={() => setTagAndRefresh(tc.tag)}
              >
                {tc.tag} ({tc.count})
              </button>
            ))}
          </div>

          {hotArticles.length > 0 && (
            <div className="hot-articles">
              <div className="article-list-title hot-title">
                🔥 热门文章
              </div>
              {hotArticles.map((a, idx) => (
                <Link key={a.path} to={postUrl(a)} className="article-item">
                  <div className="item-body">
                    <div className="item-title">
                      <span className="hot-rank">{idx + 1}.</span>{' '}
                      {a.title}
                    </div>
                    <div className="item-meta">
                      <span>{a.date}</span>
                      <span className="reading-time">{getArticleViews(a.slug)} 次阅读</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="article-list">
            <div className="article-list-title">文章列表</div>
            <div id="sidebarArticles">{renderSidebarItems(filtered)}</div>
          </div>

          <div className="sidebar-footer">
            <div id="siteStats">
              <div>
                👀 本站访问 {stats} 次 · 已运行 {daysOnline} 天
              </div>
              <div>
                ✍️ {ARTICLES.length} 篇文章 · {tagCounts.length} 个标签
              </div>
            </div>
            <div className="social-links" id="socialLinks">
              <a href="https://github.com/MsXiaoTian-Gamer" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href="https://www.taptap.cn/app/779424" target="_blank" rel="noopener noreferrer">
                TapTap
              </a>
              <a href="https://msxiaotian.itch.io/tiny-pet-sand-wars" target="_blank" rel="noopener noreferrer">
                itch.io
              </a>
              <a href="https://github.com/MsXiaoTian-Gamer/mengshenxiaotian/discussions" target="_blank" rel="noopener noreferrer">
                讨论区
              </a>
            </div>
            <div className="sidebar-bottom-links">
              <Link to="/about">关于</Link>
              <span>|</span>
              <Link to="/archive">归档</Link>
              <span>|</span>
              <Link to="/quiz">八股</Link>
            </div>
          </div>
        </aside>

        {/* ===== Main ===== */}
        <main className="main" id="mainContent">
          <section className="hero" id="heroSection">
            <div className="hero-inner">
              <span className="hero-eyebrow">Independent Game Dev Blog</span>
              <h1>
                <span>萌神小天</span> 的博客
              </h1>
              <p>一个独立游戏开发者的学习笔记与创作记录。分享 Unity 开发经验、游戏设计心得和 TapTap 聚光灯参赛历程。</p>
              <div className="hero-meta">
                <span>
                  ✍️ {ARTICLES.length} 篇文章
                </span>
                <span>
                  🏷️ {tagCounts.length} 个标签
                </span>
              </div>
              <div className="hero-actions">
                <a
                  className="hero-btn hero-btn-primary"
                  href="https://msxiaotian.itch.io/tiny-pet-sand-wars"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🎮 试玩《Tiny Pet Sand Wars》
                </a>
                <a
                  className="hero-btn hero-btn-secondary"
                  href="https://www.taptap.cn/app/779424"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💛 TapTap 支持我
                </a>
              </div>
            </div>
          </section>

          <section className="learning-path">
            <div className="lp-head">
              <span className="lp-title">🎮 Unity 学习路线</span>
              <Link to="/archive" className="lp-more">
                全部文章 →
              </Link>
            </div>
            <div className="lp-cards">
              {UNITY_LEARNING_PATH.map(s => (
                <Link
                  key={s.slug}
                  to={'/post/' + s.slug}
                  className="lp-card"
                >
                  <div className="lp-step">{s.step}</div>
                  <div className="lp-card-title">{s.title}</div>
                  <div className="lp-card-desc">{s.desc}</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="quiz-home" id="quizHome">
            <div className="quiz-home-window">
              <div className="quiz-home-bar">
                <span className="quiz-home-bar-title">~/dev/unity-interview — 每日八股</span>
                <Link to="/quiz" className="quiz-home-bar-link">
                  完整题库 →
                </Link>
              </div>
              <div className="quiz-home-body">
                {!quizToday ? (
                  <div className="quiz-home-loading">LOADING_QUESTION█</div>
                ) : (
                  <>
                    <div className="quiz-home-meta">
                      <span className="quiz-home-day">DAY {String(quizDayNo).padStart(3, '0')}</span>
                      <span className="quiz-home-cat">{quizToday.category}</span>
                    </div>
                    <div className="quiz-home-question">{quizToday.question}</div>
                    <button className="quiz-home-btn" onClick={() => setQuizOpen(v => !v)}>
                      {quizOpen ? '收起要点 ▲' : '查看要点 ▼'}
                    </button>
                    {quizOpen && (
                      <ul className="quiz-home-points">
                        {quizToday.points.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          <div className="daily-quote" id="dailyQuote">
            <div className="quote-text">“{quote.text}”</div>
            <div className="quote-author">—— {quote.author}</div>
          </div>

          {filtered.length > 0 ? (
            <>
              <div className="article-cards-grid" id="articleCardsGrid">
                {renderCards(filtered)}
              </div>
              <div className="mobile-article-list mobile-only" id="mobileArticleList">
                <div className="mobile-article-list-title">最新文章</div>
                <div className="mobile-article-cards" id="mobileCards">
                  {filtered.map(a => {
                    const time = readingMinutes(a)
                    return (
                      <Link key={a.path} to={postUrl(a)} className="mobile-card">
                        <div className="mobile-card-title">{a.title}</div>
                        <div className="mobile-card-meta">
                          <span className="mobile-card-time">{a.date}</span>
                          <span>{time} min</span>
                        </div>
                        <div className="mobile-card-tags">
                          {(a.tags || []).map(t => (
                            <span key={t} className="mobile-card-tag">
                              {t}
                            </span>
                          ))}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="no-results" id="noResults">
              <p>没有找到匹配的文章，试试其他关键词吧~</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
