import { useState } from 'react'

const FLINKS = [
  { name: '萌神小天 GitHub', url: 'https://github.com/MsXiaoTian-Gamer', desc: '代码仓库' },
  { name: '小绿虫的冒险蹦践', url: 'https://www.taptap.cn/app/779424', desc: 'TapTap 游戏页' },
]

/** 友链悬浮按钮 + 面板 */
export function FriendlyLinks() {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(v => !v)
  return (
    <>
      <button className="fl-trigger" onClick={toggle} title="友链">
        友链
      </button>
      <div
        className={'fl-overlay' + (open ? ' active' : '')}
        onClick={toggle}
        style={open ? undefined : { display: 'none' }}
      ></div>
      <div className={'fl-panel' + (open ? ' active' : '')}>
        <div className="fl-panel-header">
          <span className="fl-panel-title">友情链接</span>
          <button className="fl-panel-close" onClick={toggle}>
            ✕
          </button>
        </div>
        <div className="fl-panel-list">
          {FLINKS.map(f => (
            <div className="fl-item" style={{ marginBottom: 12 }} key={f.url}>
              <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>
                {f.name}
              </a>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
