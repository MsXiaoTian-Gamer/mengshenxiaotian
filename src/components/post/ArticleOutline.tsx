export interface TocItem {
  id: string
  level: number
  text: string
}

interface OutlineProps {
  items: TocItem[]
  activeId: string
  onNavigate: (id: string) => void
}

export function TableOfContents({ items, activeId, onNavigate }: OutlineProps) {
  if (!items.length) return null

  return (
    <details className="toc" open>
      <summary className="toc-summary">
        <span className="toc-title">文章目录</span>
        <span className="toc-summary-meta">
          {items.length} 个章节{' '}
          <span className="toc-chevron" aria-hidden="true">
            ⌄
          </span>
        </span>
      </summary>
      <ul className="toc-list">
        {items.map((item) => (
          <li key={item.id} className={'toc-item' + (item.level === 3 ? ' toc-h3' : '')}>
            <a
              href={'#' + item.id}
              aria-current={activeId === item.id ? 'location' : undefined}
              className={activeId === item.id ? 'active' : ''}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.id)
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  )
}

export function ReadingRail({
  items,
  activeId,
  onNavigate,
  progress,
  minutes,
}: OutlineProps & { progress: number; minutes: number }) {
  if (!items.length) return null

  return (
    <aside className="article-reading-rail" aria-label="阅读进度与章节导航">
      <div className="reading-rail-heading">
        <span className="article-kicker-dot" /> 正在阅读
      </div>
      <div className="reading-rail-progress-label">
        <span>阅读进度</span>
        <strong>{progress}%</strong>
      </div>
      <div
        className="reading-rail-track"
        role="progressbar"
        aria-label="正文阅读进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="reading-rail-time">
        约剩 {Math.max(0, Math.ceil(minutes * (1 - progress / 100)))} 分钟
      </div>
      <div className="reading-rail-divider" />
      <div className="reading-rail-caption">文章章节</div>
      <nav className="reading-rail-chapters" aria-label="文章章节导航">
        {items.map((item, index) => (
          <a
            key={item.id}
            href={'#' + item.id}
            className={
              (activeId === item.id ? 'active ' : '') + (item.level === 3 ? 'subchapter' : '')
            }
            aria-current={activeId === item.id ? 'location' : undefined}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(item.id)
            }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
