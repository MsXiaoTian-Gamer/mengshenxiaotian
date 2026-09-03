import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { setPageMeta } from '../lib/seo'
import { ThemeToggleButton } from '../components/widgets'
import {
  UNITY_QUESTIONS,
  getDailyQuestion,
  dayIndex,
  QUESTION_CATEGORIES,
  type QuestionCategory,
} from '../data/unityQuestions'

const DIFF_TEXT = ['', '简单', '中等', '较难']
const BATCH = 28

export default function QuizPage() {
  const [cat, setCat] = useState<'全部' | QuestionCategory>('全部')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [todayOpen, setTodayOpen] = useState(false)
  const [visible, setVisible] = useState(BATCH)
  const [offline, setOffline] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPageMeta('Unity 八股每日一题 - 萌神小天', 'Unity 客户端面试八股题库：每日一题 + 全题库刷题复习')
    const on = () => setOffline(!navigator.onLine)
    setOffline(!navigator.onLine)
    window.addEventListener('online', on)
    window.addEventListener('offline', on)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', on)
    }
  }, [])

  const today = useMemo(() => getDailyQuestion(), [])
  const dayNo = dayIndex() + 1

  const list = useMemo(() => {
    if (cat === '全部') return UNITY_QUESTIONS
    return UNITY_QUESTIONS.filter(q => q.category === cat)
  }, [cat])

  // 分批渲染：接近底部时自动追加一批（虚拟滚动的轻量替代，兼容所有既有交互）
  useEffect(() => {
    setVisible(BATCH)
  }, [cat])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisible(v => (v >= list.length ? v : Math.min(list.length, v + BATCH)))
        }
      },
      { rootMargin: '400px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [list.length, cat])

  const showMore = useCallback(() => {
    setVisible(v => Math.min(list.length, v + BATCH * 2))
  }, [list.length])

  const renderPoints = (q: { points: string[] }) => (
    <ul className="quiz-points">
      {q.points.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  )

  const shown = list.slice(0, visible)
  const rest = list.length - shown.length

  return (
    <>
      <nav className="archive-nav">
        <Link to="/" title="回到首页">
          ← 萌神小天
        </Link>
        <span className="nav-divider"></span>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Unity 八股题库</span>
        <ThemeToggleButton className="theme-btn" />
      </nav>

      {offline && (
        <div className="quiz-offline-banner">
          📡 离线模式：题库已随站点缓存，可继续刷题（PWA Service Worker）
        </div>
      )}

      <div className="quiz-container">
        {/* ===== 今日题 ===== */}
        <section className="quiz-today">
          <div className="quiz-window-bar">
            <span className="quiz-dots">
              <i></i>
              <i></i>
              <i></i>
            </span>
            <span className="quiz-window-title">~/dev/unity-interview — 每日一题</span>
          </div>
          <div className="quiz-today-body">
            <div className="quiz-today-head">
              <span className="quiz-day-no">DAY {String(Math.max(1, dayNo)).padStart(3, '0')}</span>
              <span className="quiz-tag">{today.category}</span>
              <span className="quiz-diff">难度 {DIFF_TEXT[today.difficulty]}</span>
            </div>
            <h1 className="quiz-today-question">{today.question}</h1>
            <div className="quiz-actions">
              <button className="quiz-btn" onClick={() => setTodayOpen(v => !v)}>
                {todayOpen ? '收起答案' : '查看答案 / 要点'}
              </button>
              <Link className="quiz-link" to="/archive">
                文章归档 →
              </Link>
            </div>
            {todayOpen && <div className="quiz-answer">{renderPoints(today)}</div>}
          </div>
        </section>

        {/* ===== 全部题库 ===== */}
        <section className="quiz-bank">
          <div className="quiz-bank-head">
            <h2 className="quiz-bank-title">全部题库</h2>
            <span className="quiz-bank-count">共 {UNITY_QUESTIONS.length} 题 · 点击题目展开答案</span>
          </div>
          <div className="quiz-cats">
            <button
              className={'quiz-cat' + (cat === '全部' ? ' active' : '')}
              onClick={() => setCat('全部')}
            >
              全部 ({UNITY_QUESTIONS.length})
            </button>
            {QUESTION_CATEGORIES.map(c => {
              const n = UNITY_QUESTIONS.filter(q => q.category === c).length
              return (
                <button
                  key={c}
                  className={'quiz-cat' + (cat === c ? ' active' : '')}
                  onClick={() => {
                    setCat(c)
                    setExpanded(null)
                  }}
                >
                  {c} ({n})
                </button>
              )
            })}
          </div>
          <div className="quiz-list">
            {shown.map((q, i) => {
              const open = expanded === q.id
              return (
                <div className={'quiz-item' + (open ? ' open' : '')} key={q.id}>
                  <button className="quiz-item-head" onClick={() => setExpanded(open ? null : q.id)}>
                    <span className="quiz-item-no">{String(i + 1).padStart(2, '0')}</span>
                    <span className="quiz-item-q">{q.question}</span>
                    <span className="quiz-item-diff">{DIFF_TEXT[q.difficulty]}</span>
                    <span className="quiz-item-arrow">{open ? '−' : '+'}</span>
                  </button>
                  {open && <div className="quiz-item-body">{renderPoints(q)}</div>}
                </div>
              )
            })}
          </div>
          {rest > 0 && (
            <div className="quiz-more-hint">
              已加载 {shown.length} / {list.length} 题
              <button className="quiz-more-btn" onClick={showMore}>
                展开剩余 {rest} 题 ↓
              </button>
            </div>
          )}
          <div ref={sentinelRef} className="quiz-sentinel" aria-hidden="true"></div>
        </section>
      </div>
    </>
  )
}
