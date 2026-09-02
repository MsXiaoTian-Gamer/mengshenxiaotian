import { useEffect, useRef, useState } from 'react'
import { toggleTheme } from '../lib/theme'

/** 爱心飘浮背景（15 个随机 wrapper） */
export function Hearts() {
  const hearts = Array.from({ length: 15 }, (_, i) => i)
  return (
    <div className="hearts-bg" id="heartsBg" aria-hidden="true">
      {hearts.map((_, i) => {
        const size = 8 + Math.random() * 16
        const dur = 6 + Math.random() * 10
        const delay = Math.random() * 8
        const left = Math.random() * 90
        const top = Math.random() * 80
        return (
          <div
            key={i}
            className="heart-wrap"
            style={
              {
                '--size': size + 'px',
                '--dur': dur + 's',
                '--delay': delay + 's',
                left: left + '%',
                top: top + '%',
              } as React.CSSProperties
            }
          >
            <div className="heart"></div>
          </div>
        )
      })}
    </div>
  )
}

/** 主题切换按钮（图标 ☀/☾） */
export function ThemeToggleButton({ className = 'header-btn' }: { className?: string }) {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const onClick = () => {
    const next = toggleTheme()
    setDark(next === 'dark')
  }
  return (
    <button className={className} onClick={onClick} title="切换主题" aria-label="切换主题" id="themeIcon">
      {dark ? '☀' : '☾'}
    </button>
  )
}

/** 阅读进度条 + 返回顶部按钮 */
export function ProgressAndBackTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const bar = document.getElementById('progress-bar')
    const onScroll = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - window.innerHeight
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0
      if (bar) bar.style.width = pct + '%'
      setVisible(window.scrollY > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <div id="progress-bar"></div>
      <button
        id="back-to-top"
        className={visible ? 'visible' : ''}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="返回顶部"
      >
        ↑
      </button>
    </>
  )
}
