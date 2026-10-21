import { useEffect, useMemo, useState } from 'react'
import { ARTICLES_SORTED } from '../data/articles'
import { filterArticles } from '../lib/archive'
import { getTagCounts } from '../lib/blog'
import { setPageMeta } from '../lib/seo'
import { fetchRemoteStats, reportSiteVisit, type RemoteStats } from '../lib/stats'
import HomeDashboard, { type DailyQuestion } from '../components/home/HomeDashboard'
import HomeSidebar from '../components/home/HomeSidebar'

const QUOTES = [
  '游戏是让人快乐的，做游戏也是。',
  'Bug 不是缺陷，是尚未被理解的特性。',
  '代码能跑就行，但能跑得优雅更好。',
  '独立开发是一场马拉松，不是百米冲刺。',
  '每一个伟大的游戏都从一个简单的想法开始。',
  '不要等待灵感，动手就是最好的灵感。',
  '学习 Unity 最好的方式就是做一个游戏。',
]

function getOnlineDays(): number {
  const launchDate = new Date('2025-10-11T00:00:00')
  return Math.max(1, Math.floor((Date.now() - launchDate.getTime()) / 86_400_000) + 1)
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const [remote, setRemote] = useState<RemoteStats | null>(null)
  const [question, setQuestion] = useState<DailyQuestion | null>(null)
  const [questionDay, setQuestionDay] = useState(0)

  const articles = useMemo(
    () => filterArticles(ARTICLES_SORTED, { kind: 'all', tag: selectedTag, query }),
    [query, selectedTag],
  )
  const tagCounts = useMemo(() => getTagCounts(ARTICLES_SORTED), [])
  const hotArticles = useMemo(() => {
    if (!remote) return []
    return ARTICLES_SORTED.map((article) => ({
      article,
      views: remote.articles[article.slug] || 0,
    }))
      .filter((item) => item.views > 0)
      .sort(
        (left, right) =>
          right.views - left.views || right.article.date.localeCompare(left.article.date),
      )
      .slice(0, 5)
      .map((item) => item.article)
  }, [remote])
  const quote = useMemo(() => {
    const today = new Date()
    return QUOTES[(today.getFullYear() + today.getMonth() + today.getDate()) % QUOTES.length]
  }, [])

  useEffect(() => {
    setPageMeta(
      '萌神小天 - 独立游戏开发博客',
      '萌神小天的独立游戏开发博客，分享 Unity 学习、游戏开发和独立游戏心得',
    )
  }, [])

  useEffect(() => {
    let active = true
    reportSiteVisit()
    fetchRemoteStats().then((stats) => {
      if (active) setRemote(stats)
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    import('../data/unityQuestions')
      .then((module) => {
        if (!active) return
        setQuestion(module.getDailyQuestion())
        setQuestionDay(Math.max(1, module.dayIndex() + 1))
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <button
        className="hamburger"
        id="hamburgerBtn"
        type="button"
        aria-label={menuOpen ? '关闭文章筛选菜单' : '打开文章筛选菜单'}
        aria-expanded={menuOpen}
        aria-controls="sidebar"
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="关闭文章筛选菜单"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className={'layout home-layout' + (menuOpen ? ' nav-open' : '')} id="layout">
        <HomeSidebar
          query={query}
          onQueryChange={setQuery}
          selectedTag={selectedTag}
          onTagSelect={handleTagSelect}
          tagCounts={tagCounts}
          articles={articles}
          hotArticles={hotArticles}
          remote={remote}
          onlineDays={getOnlineDays()}
        />
        <HomeDashboard
          articles={articles}
          query={query}
          selectedTag={selectedTag}
          quote={quote}
          question={question}
          questionDay={questionDay}
        />
      </div>
    </>
  )
}
