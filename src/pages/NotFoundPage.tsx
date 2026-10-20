import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../lib/seo'

export default function NotFoundPage() {
  useEffect(() => {
    setPageMeta('404 - 萌神小天')
  }, [])
  return (
    <>
      <main className="art-container" style={{ textAlign: 'center', padding: '80px 16px' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--brand)', marginBottom: 8 }}>404</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>页面不存在或已被移动</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
            回到首页
          </Link>
          <span style={{ color: 'var(--text-faint)' }}>|</span>
          <Link to="/archive" style={{ color: 'var(--brand)', textDecoration: 'none' }}>
            文章归档
          </Link>
        </div>
      </main>
    </>
  )
}
