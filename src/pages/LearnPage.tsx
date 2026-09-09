import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UNITY_LEARNING_PATH } from '../data/learningPath'
import { POST_MINUTES } from '../data/generated-meta'
import { setPageMeta } from '../lib/seo'
import { ThemeToggleButton } from '../components/widgets'

const CHECK_KEY = 'msxt-learn-checks-v1'

function loadChecks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(CHECK_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function LearnPage() {
  const [checks, setChecks] = useState<Record<string, boolean>>(loadChecks)

  useEffect(() => {
    setPageMeta(
      'Unity 学习路线 - 萌神小天',
      '从零开始到工程化的 Unity 学习地图：分阶段文章、配套练习与能力自检'
    )
  }, [])

  const total = UNITY_LEARNING_PATH.length
  const doneStages = UNITY_LEARNING_PATH.filter(s => s.status === 'done').length

  const totalChecks = UNITY_LEARNING_PATH.reduce((n, s) => n + (s.checks?.length || 0), 0)
  const doneChecks = UNITY_LEARNING_PATH.reduce(
    (n, s) => n + (s.checks?.filter((_, i) => checks[`${s.slug}:${i}`])?.length || 0),
    0
  )

  const toggleCheck = (key: string) => {
    setChecks(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try {
        localStorage.setItem(CHECK_KEY, JSON.stringify(next))
      } catch {
        /* ignore quota / privacy mode */
      }
      return next
    })
  }

  return (
    <>
      <nav className="archive-nav">
        <Link to="/" title="回到首页">
          ← 萌神小天
        </Link>
        <span className="nav-divider"></span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>学习路线</span>
        <ThemeToggleButton className="theme-btn" />
      </nav>

      <div className="learn-container">
        <h1 className="learn-title">Unity 学习路线</h1>
        <p className="learn-sub">
          文章阶段 {doneStages}/{total} 完成 · 能力自检 {doneChecks}/{totalChecks} 已勾选
        </p>

        <div className="learn-progress" aria-label="学习路线总进度">
          <div
            className="learn-progress-bar"
            style={{ width: `${Math.round((doneStages / total) * 100)}%` }}
          />
        </div>

        {UNITY_LEARNING_PATH.map((s, si) => (
          <section className="learn-stage" key={s.slug}>
            <div className="learn-stage-head">
              <span className="learn-stage-step">{s.step}</span>
              {s.status && (
                <span className={'lp-status is-' + s.status}>
                  {s.status === 'done' ? '已完成' : '更新中'}
                </span>
              )}
              <span className="learn-stage-idx">{si + 1}/{total}</span>
            </div>

            <div className="learn-stage-main">
              <Link to={'/post/' + s.slug} className="learn-article-link">
                <span className="learn-article-title">{s.title}</span>
                <span className="learn-article-meta">
                  📄 阅读约 {POST_MINUTES[s.slug] || 1} 分钟
                </span>
              </Link>
              <p className="learn-stage-desc">{s.desc}</p>

              {s.related && s.related.length > 0 && (
                <div className="learn-block">
                  <span className="learn-block-label">配套文章</span>
                  {s.related.map(r => (
                    <Link key={r.slug} to={'/post/' + r.slug} className="learn-related">
                      <span>{r.title}</span>
                      {r.note && <span className="learn-related-note">{r.note}</span>}
                    </Link>
                  ))}
                </div>
              )}

              {s.quizCat && (
                <div className="learn-block learn-block-row">
                  <span className="learn-block-label">练习</span>
                  <Link to="/quiz" className="learn-quiz-link">
                    八股自测 · {s.quizCat} 分类 →
                  </Link>
                </div>
              )}

              {s.checks && s.checks.length > 0 && (
                <div className="learn-block">
                  <span className="learn-block-label">能力自检</span>
                  <ul className="learn-checks">
                    {s.checks.map((c, i) => {
                      const key = `${s.slug}:${i}`
                      const on = !!checks[key]
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            className={'learn-check' + (on ? ' on' : '')}
                            onClick={() => toggleCheck(key)}
                            aria-pressed={on}
                          >
                            <span className="learn-check-box">{on ? '✔' : ''}</span>
                            <span>{c}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          </section>
        ))}

        <p className="learn-foot">
          // 学习路线会随博客文章更新持续补充。有疑问欢迎到{' '}
          <a
            href="https://github.com/MsXiaoTian-Gamer/mengshenxiaotian/discussions"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub 讨论区
          </a>{' '}
          交流。
        </p>
      </div>
    </>
  )
}
