import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES, ARTICLES_SORTED, type ArticleMeta } from '../../data/articles'
import { POST_MINUTES } from '../../data/generated-meta'
import { TAPTAP_PROFILE_URL } from '../../data/links'
import { getArticleExcerpt } from '../../lib/articleExcerpt'
import { getTagColors } from '../../lib/blog'

export interface DailyQuestion {
  category: string
  question: string
  points: string[]
  talk: string
}

interface HomeDashboardProps {
  articles: ArticleMeta[]
  query: string
  selectedTag: string
  quote: string
  question: DailyQuestion | null
  questionDay: number
}

function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link to={`/post/${article.slug}`} className="article-card">
      <div className="card-date">
        <time dateTime={article.date}>{article.date}</time>
        <span>{POST_MINUTES[article.slug] || 1} min read</span>
      </div>
      <h3 className="card-title">{article.title}</h3>
      <div className="card-tags">
        {article.tags.map((tag) => {
          const colors = getTagColors(tag)
          return (
            <span
              key={tag}
              className="card-tag"
              style={{ background: colors.bg, color: colors.color }}
            >
              {tag}
            </span>
          )
        })}
      </div>
      <p className="card-summary">{getArticleExcerpt(article)}</p>
      <div className="card-bottom">
        <span>阅读全文</span>
        <span aria-hidden="true">↗</span>
      </div>
    </Link>
  )
}

function HomeHero() {
  return (
    <section className="hero" id="heroSection">
      <div className="hero-inner">
        <div className="studio-status">
          <span aria-hidden="true" />
          记录学习，也创造快乐
        </div>
        <span className="hero-eyebrow">THE INDEPENDENT DEV JOURNAL</span>
        <h1>
          <span>把想法写成代码，</span>
          <br />
          把热爱做成游戏。
        </h1>
        <p>
          一个独立游戏开发者的学习笔记与创作记录。分享 Unity 开发经验、游戏设计心得和 TapTap
          聚光灯参赛历程。
        </p>
        <div className="hero-meta">
          <span>✍️ {ARTICLES.length} 篇文章</span>
          <span>🏷️ {new Set(ARTICLES.flatMap((article) => article.tags)).size} 个主题</span>
        </div>
        <div className="hero-actions">
          <Link className="hero-btn hero-btn-primary" to="/play">
            🎮 试玩我的游戏 ↗
          </Link>
          <a
            className="hero-btn hero-btn-secondary"
            href={TAPTAP_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            TapTap 作品主页 ↗
          </a>
        </div>
      </div>
      <aside className="studio-console" aria-label="开发者档案">
        <div className="console-caption">
          <span aria-hidden="true">⌘</span> developer.profile
        </div>
        <div className="console-prompt">
          <span>~/xiaotian</span> $ cat about.md
        </div>
        <div className="console-avatar" aria-hidden="true">
          &lt; / &gt;
        </div>
        <strong>你好，我是萌神小天。</strong>
        <p>独立游戏开发者 / Unity 探索者</p>
        <div className="console-stack">
          <span>Unity</span>
          <span>C#</span>
          <span>Game Design</span>
        </div>
        <div className="console-foot">
          <span>小步迭代，持续创造</span>
          <span aria-hidden="true">●</span>
        </div>
      </aside>
    </section>
  )
}

function FeaturedStory() {
  const article = ARTICLES_SORTED[0]
  if (!article) return null
  const excerpt = getArticleExcerpt(article)

  return (
    <section className="featured-story" aria-labelledby="featured-story-title">
      <div className="featured-story-content">
        <span className="featured-story-kicker">
          LATEST NOTE <span aria-hidden="true">/</span> 最新发布
        </span>
        <h2 id="featured-story-title">
          <Link to={`/post/${article.slug}`}>{article.title}</Link>
        </h2>
        <p>{excerpt}</p>
        <Link className="featured-story-link" to={`/post/${article.slug}`}>
          读这篇文章 <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="featured-story-stamp" aria-hidden="true">
        <span>DEV JOURNAL</span>
        <strong>{article.date.slice(5).replace('-', '.')}</strong>
        <small>
          {article.date.slice(0, 4)} · {article.tags[0] || '创作记录'}
        </small>
      </div>
    </section>
  )
}

function DiscoveryLanes() {
  const lanes = [
    { kind: 'learn', icon: '🧭', title: '学 Unity', desc: '从零基础到项目工程化', link: '/learn' },
    {
      kind: 'interview',
      icon: '💬',
      title: '看面试复盘',
      desc: '客户端岗位题目与答题思路',
      link: '/archive?kind=interview',
    },
    {
      kind: 'release',
      icon: '🛠️',
      title: '看项目进展',
      desc: '独立游戏从原型到发布',
      link: '/archive?kind=release',
    },
  ]

  return (
    <section className="content-lanes" aria-labelledby="content-lanes-title">
      <div className="lp-head">
        <h2 className="lp-title" id="content-lanes-title">
          从这里开始
        </h2>
        <Link to="/archive" className="lp-more">
          查看全部文章 →
        </Link>
      </div>
      <div className="content-lane-grid">
        {lanes.map((lane) => {
          const count = ARTICLES_SORTED.filter((article) => article.kind === lane.kind).length
          return (
            <Link className="content-lane" to={lane.link} key={lane.kind}>
              <span className="content-lane-icon" aria-hidden="true">
                {lane.icon}
              </span>
              <span>
                <strong>{lane.title}</strong>
                <small>{lane.desc}</small>
              </span>
              <em>{count} 篇 →</em>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function DailyQuestion({ question, day }: { question: DailyQuestion | null; day: number }) {
  const [open, setOpen] = useState(false)
  return (
    <section className="quiz-home" id="quizHome" aria-labelledby="daily-question-title">
      <div className="quiz-home-window">
        <div className="quiz-home-bar">
          <span className="quiz-home-bar-title" id="daily-question-title">
            今日一题 · Unity 面试练习
          </span>
          <Link to="/quiz" className="quiz-home-bar-link">
            完整题库 →
          </Link>
        </div>
        <div className="quiz-home-body">
          {!question ? (
            <div className="quiz-home-loading" role="status">
              正在准备今日题目…
            </div>
          ) : (
            <>
              <div className="quiz-home-meta">
                <span className="quiz-home-day">DAY {String(day).padStart(3, '0')}</span>
                <span className="quiz-home-cat">{question.category}</span>
              </div>
              <p className="quiz-home-question">{question.question}</p>
              <button
                className="quiz-home-btn"
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
              >
                {open ? '收起解析 ▲' : '查看解析与面试表达 ▼'}
              </button>
              {open && (
                <>
                  <ul className="quiz-home-points">
                    {question.points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                  <div className="quiz-home-talk">
                    <span className="quiz-home-talk-label">面试表达</span>
                    <p>{question.talk}</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function HomeDashboard({
  articles,
  query,
  selectedTag,
  quote,
  question,
  questionDay,
}: HomeDashboardProps) {
  const isFiltering = Boolean(query.trim()) || selectedTag !== 'all'
  const visibleArticles = isFiltering ? articles : articles.slice(0, 8)

  return (
    <main className="main" id="mainContent">
      <HomeHero />
      <FeaturedStory />
      <DiscoveryLanes />
      <DailyQuestion question={question} day={questionDay} />
      <blockquote className="daily-quote" id="dailyQuote">
        <p className="quote-text">“{quote}”</p>
        <footer className="quote-author">萌神小天</footer>
      </blockquote>
      <section aria-labelledby="journal-title">
        <div className="journal-heading">
          <div>
            <span className="journal-kicker">THE JOURNAL / 开发手记</span>
            <h2 id="journal-title">{isFiltering ? '筛选结果' : '最近写下的故事'}</h2>
          </div>
          <span className="journal-count">{articles.length} 篇记录</span>
        </div>
        {articles.length ? (
          <>
            <div className="article-cards-grid" id="articleCardsGrid">
              {visibleArticles.map((article) => (
                <ArticleCard key={article.path} article={article} />
              ))}
            </div>
            {!isFiltering && articles.length > visibleArticles.length && (
              <Link className="journal-all-link" to="/archive">
                浏览全部 {articles.length} 篇文章 <span aria-hidden="true">↗</span>
              </Link>
            )}
          </>
        ) : (
          <div className="no-results" id="noResults">
            <p>没有找到匹配的文章，试试其他关键词。</p>
          </div>
        )}
      </section>
    </main>
  )
}
