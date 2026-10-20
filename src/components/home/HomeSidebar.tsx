import { Link } from 'react-router-dom'
import { ARTICLES, type ArticleMeta } from '../../data/articles'
import { POST_MINUTES } from '../../data/generated-meta'
import { TAPTAP_PROFILE_URL } from '../../data/links'
import { getTagColors } from '../../lib/blog'
import type { RemoteStats } from '../../lib/stats'
import { CmdKbdBadge } from '../CmdHint'
import { ThemeToggleButton } from '../widgets'

interface HomeSidebarProps {
  query: string
  onQueryChange: (query: string) => void
  selectedTag: string
  onTagSelect: (tag: string) => void
  tagCounts: { tag: string; count: number }[]
  articles: ArticleMeta[]
  hotArticles: ArticleMeta[]
  remote: RemoteStats | null
  onlineDays: number
}

const postUrl = (article: ArticleMeta) => `/post/${article.slug}`

export default function HomeSidebar({
  query,
  onQueryChange,
  selectedTag,
  onTagSelect,
  tagCounts,
  articles,
  hotArticles,
  remote,
  onlineDays,
}: HomeSidebarProps) {
  return (
    <aside className="sidebar" id="sidebar" aria-label="文章筛选与导航">
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
        <span className="search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          type="search"
          className="search-input has-badge"
          id="searchInput"
          placeholder="搜索文章…"
          aria-label="搜索文章"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <CmdKbdBadge />
      </div>

      <div className="tag-filters" id="tagFilters" aria-label="按主题筛选">
        <button
          type="button"
          className={'tag-filter' + (selectedTag === 'all' ? ' active' : '')}
          aria-pressed={selectedTag === 'all'}
          onClick={() => onTagSelect('all')}
        >
          全部
        </button>
        {tagCounts.map(({ tag, count }) => (
          <button
            type="button"
            key={tag}
            className={'tag-filter' + (selectedTag === tag ? ' active' : '')}
            aria-pressed={selectedTag === tag}
            onClick={() => onTagSelect(tag)}
          >
            {tag} ({count})
          </button>
        ))}
      </div>

      {hotArticles.length > 0 && (
        <section className="hot-articles" aria-labelledby="home-hot-title">
          <h2 className="article-list-title hot-title" id="home-hot-title">
            本周热门
          </h2>
          {hotArticles.map((article, index) => (
            <Link key={article.path} to={postUrl(article)} className="article-item">
              <div className="item-body">
                <div className="item-title">
                  <span className="hot-rank">{String(index + 1).padStart(2, '0')}</span>{' '}
                  {article.title}
                </div>
                <div className="item-meta">
                  <time dateTime={article.date}>{article.date}</time>
                  <span className="reading-time">{remote?.articles[article.slug] || 0} 次阅读</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      <section className="article-list" aria-labelledby="home-article-list-title">
        <h2 className="article-list-title" id="home-article-list-title">
          最新文章
        </h2>
        <div id="sidebarArticles">
          {articles.length === 0 ? (
            <div className="empty-state">暂无匹配文章</div>
          ) : (
            articles.slice(0, 8).map((article) => (
              <Link key={article.path} to={postUrl(article)} className="article-item">
                <div className="item-body">
                  <div className="item-title">{article.title}</div>
                  <div className="item-meta">
                    <time dateTime={article.date}>{article.date}</time>
                    <span className="reading-time">{POST_MINUTES[article.slug] || 1} 分钟</span>
                  </div>
                  <div className="item-tags">
                    {article.tags.map((tag) => {
                      const colors = getTagColors(tag)
                      return (
                        <span
                          key={tag}
                          className="item-tag"
                          style={
                            {
                              '--item-tag-color': colors.color,
                              '--item-tag-bg': colors.bg,
                            } as React.CSSProperties
                          }
                        >
                          {tag}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <footer className="sidebar-footer">
        <div id="siteStats">
          <div>
            本站访问 {remote?.site || 0} 次 · 已运行 {onlineDays} 天
          </div>
          <div>
            {ARTICLES.length} 篇文章 · {tagCounts.length} 个主题
          </div>
        </div>
        <nav className="social-links" id="socialLinks" aria-label="外部链接">
          <a href="https://github.com/MsXiaoTian-Gamer" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={TAPTAP_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            TapTap 主页
          </a>
          <a
            href="https://msxiaotian.itch.io/tiny-pet-sand-wars"
            target="_blank"
            rel="noopener noreferrer"
          >
            itch.io
          </a>
          <a
            href="https://github.com/MsXiaoTian-Gamer/mengshenxiaotian/discussions"
            target="_blank"
            rel="noopener noreferrer"
          >
            讨论区
          </a>
          <a href="/feed.xml" target="_blank" rel="noopener noreferrer" title="RSS 订阅">
            RSS
          </a>
        </nav>
      </footer>
    </aside>
  )
}
