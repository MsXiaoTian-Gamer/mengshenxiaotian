import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../lib/seo'
import { ThemeToggleButton } from '../components/widgets'

// Tiny Pet Sand Wars —— Unity WebGL 导出版（独立 Vercel 项目部署，体积大不随博客仓库构建）
// TODO(部署后替换)：把下面的地址换成真实线上地址
const GAME_URL = 'https://tiny-sand-war.vercel.app/'

export default function PlayPage() {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const frameRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setPageMeta('试玩：Tiny Pet Sand Wars - 萌神小天', 'Unity WebGL 即时试玩《Tiny Pet Sand Wars》，浏览器直接开玩')
  }, [])

  return (
    <>
      <nav className="archive-nav">
        <Link to="/" title="回到首页">
          ← 萌神小天
        </Link>
        <span className="nav-divider"></span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>WebGL 试玩 / PLAY.SYS</span>
        <ThemeToggleButton className="theme-btn" />
      </nav>

      <div className="tsw-page">
        <div className="tsw-head">
          <span className="tsw-brand">TINY PET SAND WARS</span>
          <div className="tsw-links">
            <a className="tsw-ext" href="https://www.taptap.cn/app/779424" target="_blank" rel="noreferrer">
              TapTap ↗
            </a>
            <Link className="tsw-ext" to="/play/pong" title="终端彩蛋小游戏">
              PHOSPHOR PONG ▸
            </Link>
          </div>
        </div>

        <div className={'tsw-frame-wrap' + (loaded ? ' loaded' : '')}>
          {!loaded && !failed && (
            <div className="tsw-loading">
              <div className="tsw-loading-text">LOADING_WEBGL://tiny-sand-war █</div>
              <div className="tsw-loading-bar">
                <i></i>
              </div>
              <p>首次加载需下载约 84MB 游戏资源，请耐心等待；建议 Chrome / Edge 桌面端游玩</p>
            </div>
          )}
          {failed && (
            <div className="tsw-failed">
              游戏加载失败（游戏地址尚未部署或网络不可达）。请确认 GAME_URL 配置后刷新重试。
            </div>
          )}
          <iframe
            ref={frameRef}
            title="Tiny Pet Sand Wars WebGL"
            src={GAME_URL}
            className="tsw-frame"
            allow="fullscreen; autoplay"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          ></iframe>
        </div>

        <p className="tsw-foot">
          Unity WebGL 导出 · 首次加载较慢（84MB 资源按需传输）· 键盘 WASD / 方向键操作 · 独立游戏练习作品
        </p>
      </div>
    </>
  )
}
