import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ARTICLES } from '../data/articles'
import { toggleTheme, setCrt, type CrtPalette } from '../lib/theme'

interface Cmd {
  id: string
  group: string
  label: string
  hint?: string
  keywords: string
  run: () => void
}

const CRT_PALETTES: { v: CrtPalette; label: string; desc: string }[] = [
  { v: 'green', label: 'PHOSPHOR.GREEN', desc: '磷光绿（默认）' },
  { v: 'amber', label: 'PHOSPHOR.AMBER', desc: '琥珀暖光' },
  { v: 'blue', label: 'PHOSPHOR.BLUE', desc: '蓝磷冷光' },
]

function crtName(v: CrtPalette): string {
  return CRT_PALETTES.find(p => p.v === v)?.label || v.toUpperCase()
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const run = (fn: () => void) => {
    setOpen(false)
    setQuery('')
    setIdx(0)
    fn()
  }

  const items = useMemo<Cmd[]>(() => {
    const q = query.trim().toLowerCase()
    const nav: Cmd[] = [
      { id: 'nav-home', group: '导航', label: '首页', hint: '/', keywords: 'home 首页', run: () => navigate('/') },
      { id: 'nav-archive', group: '导航', label: '文章归档', hint: '/archive', keywords: 'archive 归档 文章 列表', run: () => navigate('/archive') },
      { id: 'nav-quiz', group: '导航', label: 'Unity 八股题库', hint: '/quiz', keywords: 'quiz 八股 unity 题库 面试', run: () => navigate('/quiz') },
      { id: 'nav-play', group: '导航', label: 'WebGL 试玩', hint: '/play', keywords: 'play webgl 试玩 游戏 pong', run: () => navigate('/play') },
      { id: 'nav-stats', group: '导航', label: '统计仪表盘', hint: '/stats', keywords: 'stats 统计 访问 阅读 数据', run: () => navigate('/stats') },
      { id: 'nav-about', group: '导航', label: '关于我', hint: '/about', keywords: 'about 关于 简历 联系', run: () => navigate('/about') },
    ]
    const actions: Cmd[] = [
      { id: 'act-theme', group: '操作', label: '切换明暗主题', keywords: 'theme dark light 主题 明暗 深色 浅色', run: () => toggleTheme() },
      ...CRT_PALETTES.map<Cmd>(p => ({
        id: 'act-crt-' + p.v,
        group: '操作',
        label: p.label,
        hint: p.desc,
        keywords: p.label + ' crt 配色 颜色 ' + p.v + ' ' + p.desc,
        run: () => setCrt(p.v),
      })),
      { id: 'act-top', group: '操作', label: '回到顶部', keywords: 'top 顶部 上滚 scroll', run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    ]
    const posts: Cmd[] = ARTICLES.slice(0, 40).map(a => ({
      id: 'post-' + a.slug,
      group: '文章',
      label: a.title,
      hint: a.date + (a.tags?.length ? ' · #' + a.tags.slice(0, 3).join(' #') : ''),
      keywords: a.title + ' ' + (a.tags || []).join(' ') + ' ' + a.slug,
      run: () => navigate('/post/' + a.slug),
    }))

    const match = (cmd: Cmd) => {
      if (!q) return cmd.group !== '文章' // 空输入只显示导航/操作
      const hay = cmd.keywords.toLowerCase()
      return hay.includes(q) || hay.startsWith(q)
    }
    const list = [...nav, ...posts, ...actions].filter(match)
    const scored = [...list].sort((a, b) => {
      const rank = (c: Cmd) => {
        const hay = c.keywords.toLowerCase()
        if (q && hay.startsWith(q)) return 0
        return 1
      }
      return rank(a) - rank(b)
    })
    return scored
  }, [query, navigate])

  const groups = useMemo(() => {
    const map: { name: string; list: Cmd[] }[] = []
    items.forEach(it => {
      const last = map[map.length - 1]
      if (last && last.name === it.group) last.list.push(it)
      else map.push({ name: it.group, list: [it] })
    })
    return map
  }, [items])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault()
        setOpen(v => {
          if (!v) {
            setQuery('')
            setIdx(0)
          }
          return !v
        })
        return
      }
      if (!open) return
      if (k === 'escape') {
        e.preventDefault()
        setOpen(false)
        setQuery('')
        setIdx(0)
      } else if (k === 'arrowdown') {
        e.preventDefault()
        setIdx(i => Math.min(items.length - 1, i + 1))
      } else if (k === 'arrowup') {
        e.preventDefault()
        setIdx(i => Math.max(0, i - 1))
      } else if (k === 'enter') {
        e.preventDefault()
        const target = items[idx]
        if (target) run(target.run)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, items, idx])

  useEffect(() => {
    if (open) {
      setIdx(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open, query])

  if (!open) return null

  return (
    <div
      className="cmd-overlay"
      onMouseDown={e => {
        if (e.target === e.currentTarget) {
          setOpen(false)
          setQuery('')
          setIdx(0)
        }
      }}
    >
      <div className="cmd-panel" role="dialog" aria-label="命令面板">
        <div className="cmd-input-row">
          <span className="cmd-prompt">❯</span>
          <input
            ref={inputRef}
            className="cmd-input"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setIdx(0)
            }}
            placeholder="输入命令 / 搜索文章..."
            spellCheck={false}
            autoComplete="off"
          />
          <span className="cmd-kbd-hint">ESC</span>
        </div>
        {items.length === 0 ? (
          <div className="cmd-empty">没有匹配项</div>
        ) : (
          <div className="cmd-list" onMouseDown={e => e.preventDefault()}>
            {groups.map(g => (
              <div className="cmd-group" key={g.name}>
                <div className="cmd-group-name">{g.name}</div>
                {g.list.map(it => {
                  const flat = groups.reduce((acc: number, x) => acc + x.list.length, 0)
                  void flat
                  const globalIndex = (() => {
                    let n = 0
                    for (const x of groups) {
                      for (const c of x.list) {
                        if (c.id === it.id) return n
                        n++
                      }
                    }
                    return -1
                  })()
                  const active = globalIndex === idx
                  return (
                    <button
                      key={it.id}
                      type="button"
                      className={'cmd-item' + (active ? ' active' : '')}
                      onMouseEnter={() => setIdx(globalIndex)}
                      onClick={() => run(it.run)}
                    >
                      <span className="cmd-item-label">{it.label}</span>
                      {it.hint && <span className="cmd-item-hint">{it.hint}</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        )}
        <div className="cmd-footer">
          <span>↑↓ 选择</span>
          <span>↵ 执行</span>
          <span>⌘K 开关</span>
        </div>
      </div>
    </div>
  )
}
