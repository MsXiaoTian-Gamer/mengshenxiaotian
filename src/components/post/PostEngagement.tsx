import { useEffect, useRef, useState } from 'react'
import type { ArticleMeta } from '../../data/articles'

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

export function LikeButton({ article }: { article: ArticleMeta }) {
  const likeKey = 'blog_likes_' + article.path
  const countKey = likeKey + '_count'
  const [liked, setLiked] = useState(() => {
    try {
      return localStorage.getItem(likeKey) === '1'
    } catch {
      return false
    }
  })
  const [count, setCount] = useState(() => {
    try {
      const stored = parseInt(localStorage.getItem(countKey) || '0', 10)
      return Number.isFinite(stored) ? Math.max(0, stored) : 0
    } catch {
      return 0
    }
  })

  const onClick = () => {
    const nextLiked = !liked
    const nextCount = Math.max(0, count + (nextLiked ? 1 : -1))
    setLiked(nextLiked)
    setCount(nextCount)
    try {
      localStorage.setItem(likeKey, nextLiked ? '1' : '0')
      localStorage.setItem(countKey, String(nextCount))
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="like-section">
      <button
        type="button"
        className={'like-btn' + (liked ? ' liked' : '')}
        aria-pressed={liked}
        onClick={onClick}
      >
        <span className="like-icon">{liked ? '❤️' : '🤍'}</span>{' '}
        <span className="like-count">{count}</span> 次喜欢
      </button>
    </div>
  )
}
