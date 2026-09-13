import { useEffect, useState } from 'react'

const HINT_KEY = 'blog_cmd_hint_seen'

/** 快捷键标签：macOS 显示 ⌘K，其它平台显示 Ctrl+K */
export function cmdKeyLabel() {
  const platform = navigator.platform || ''
  const ua = navigator.userAgent || ''
  return /Mac|iPhone|iPad|iPod/.test(platform) || /Mac OS X/.test(ua) ? '⌘K' : 'Ctrl+K'
}

/** 以合成键盘事件唤出命令面板，与手动按 Cmd/Ctrl+K 走同一入口 */
export function openCommandPalette() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }))
}

/** 侧栏搜索框右侧的快捷键徽标：常驻可见，点击可唤出命令面板 */
export function CmdKbdBadge() {
  return (
    <button
      type="button"
      className="cmd-badge"
      onClick={openCommandPalette}
      title="打开命令面板：快速搜索文章与跳转页面"
      aria-label="打开命令面板"
    >
      {cmdKeyLabel()}
    </button>
  )
}

/** 首次访问的一次性提示条：告知命令面板快捷键（关闭后不再出现） */
export function CmdHint() {
  const [show, setShow] = useState(false)
  const label = cmdKeyLabel()

  useEffect(() => {
    let seen = false
    try {
      seen = localStorage.getItem(HINT_KEY) === '1'
    } catch {
      /* 隐私模式下读取失败，按未看过处理 */
    }
    if (seen) return
    const timer = window.setTimeout(() => setShow(true), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!show) return
    const timer = window.setTimeout(() => {
      setShow(false)
      try {
        localStorage.setItem(HINT_KEY, '1')
      } catch {
        /* 隐私模式下写入失败，忽略 */
      }
    }, 20000)
    return () => window.clearTimeout(timer)
  }, [show])

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(HINT_KEY, '1')
    } catch {
      /* 隐私模式下写入失败，忽略 */
    }
  }

  if (!show) return null

  return (
    <div className="cmd-hint" role="status" aria-live="polite">
      <div className="cmd-hint-head">
        <span className="cmd-hint-title">TIP / 快捷入口</span>
        <button className="cmd-hint-close" onClick={dismiss} aria-label="关闭提示">
          ✕
        </button>
      </div>
      <p className="cmd-hint-text">
        按 <kbd className="cmd-hint-kbd">{label}</kbd> 打开命令面板
      </p>
      <p className="cmd-hint-sub">快速搜索文章、跳转归档 / 路线 / 八股页面</p>
      <button
        className="cmd-hint-btn"
        onClick={() => {
          dismiss()
          openCommandPalette()
        }}
      >
        试一下
      </button>
    </div>
  )
}
