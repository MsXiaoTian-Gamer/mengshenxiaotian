import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../lib/seo'
import { ThemeToggleButton } from '../components/widgets'

export default function AboutPage() {
  useEffect(() => {
    setPageMeta('关于 - 萌神小天')
  }, [])

  return (
    <>
      <nav className="about-nav">
        <Link to="/" title="回到首页">
          ← 萌神小天
        </Link>
        <span className="nav-divider"></span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>关于</span>
        <ThemeToggleButton className="theme-btn" />
      </nav>

      <div className="about-container">
        <div className="intro-card">
          <div className="intro-avatar">萌</div>
          <h1 className="intro-name">萌神小天</h1>
          <p className="intro-name-sub">独立游戏开发者</p>
          <p className="intro-role">Unity / C# / GameDev</p>
          <p className="intro-bio">
            一个热爱游戏开发的独立开发者，专注于 Unity 引擎。喜欢探索游戏设计的各种可能性，
            从 TapTap 聚光灯到 itch.io 独立发布，一直在学习和成长的路上。
          </p>
          <div className="intro-tags">
            <span className="intro-tag">Unity</span>
            <span className="intro-tag">C#</span>
            <span className="intro-tag">GameDev</span>
            <span className="intro-tag">独立游戏</span>
            <span className="intro-tag">TapTap</span>
          </div>
          <div
            className="intro-social"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              paddingTop: 20,
              borderTop: '1px solid var(--border-light)',
              flexWrap: 'wrap',
            }}
          >
            <a href="https://github.com/MsXiaoTian-Gamer" target="_blank" className="intro-social-btn" title="GitHub" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>
            <a href="https://www.taptap.cn/app/779424" target="_blank" className="intro-social-btn" title="TapTap" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">
                  T
                </text>
              </svg>
            </a>
            <a href="https://msxiaotian.itch.io/tiny-pet-sand-wars" target="_blank" className="intro-social-btn" title="itch.io" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="7" cy="9" r="2.5" />
                <circle cx="17" cy="9" r="2.5" />
                <circle cx="7" cy="16" r="2" />
                <circle cx="17" cy="16" r="2" />
                <rect x="3" y="13" width="18" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.8" fill="none" />
                <path d="M3 13 Q12 5 21 13" stroke="currentColor" strokeWidth="1.8" fill="none" />
              </svg>
            </a>
            <a href="mailto:msxiaotian@icloud.com" className="intro-social-btn" title="Email">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 6l10 7 10-7" />
              </svg>
            </a>
          </div>
        </div>

        <div
          className="about-contact-card"
          style={{
            marginTop: 28,
            padding: '18px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            lineHeight: 1.8,
          }}
        >
          <strong style={{ color: 'var(--text-heading)', display: 'block', marginBottom: 6 }}>联系方式</strong>
          邮箱：msxiaotian@icloud.com
          <br />
          GitHub：
          <a href="https://github.com/MsXiaoTian-Gamer" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
            MsXiaoTian-Gamer
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/archive" style={{ color: 'var(--brand)', fontSize: '0.9rem', textDecoration: 'none' }}>
            查看文章归档 →
          </Link>
        </div>
      </div>
    </>
  )
}
