import { Component, lazy, Suspense, useEffect, type ErrorInfo, type ReactNode } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { initTheme } from './lib/theme'
import { Mascot } from './components/Mascot'
import { FriendlyLinks } from './components/FriendlyLinks'
import { CmdHint } from './components/CmdHint'
import { ProgressAndBackTop, Hearts } from './components/widgets'
import CommandPalette from './components/CommandPalette'
import CrtColorStrip from './components/CrtColorStrip'
import CrBoot from './components/CrBoot'
import HomePage from './pages/HomePage'

// 路由级代码分割：非首页页面按需加载（marked/highlight/fuse/题库数据均随之拆包）
const PostPage = lazy(() => import('./pages/PostPage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const ArchivePage = lazy(() => import('./pages/ArchivePage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const PlayPage = lazy(() => import('./pages/PlayPage'))
const PongPage = lazy(() => import('./pages/PongPage'))
const StatsPage = lazy(() => import('./pages/StatsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function RouteFallback() {
  return (
    <div className="route-fallback" role="status">
      <span className="route-fallback-cursor">█</span> LOADING...
    </div>
  )
}

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('App render error', error, info) }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="app-error" role="alert"><p className="app-error-code">SYSTEM ERROR</p><h1>页面暂时无法显示</h1><p>可以刷新页面重试；如果问题持续，请到 GitHub 讨论区反馈。</p><button type="button" onClick={() => window.location.reload()}>重新加载</button></main>
  }
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  useEffect(() => {
    initTheme()
  }, [])

  return (
    <>
      <a className="skip-link" href="#mainContent">跳到主要内容</a>
      <ScrollToTop />
      <Hearts />
      <ProgressAndBackTop />
      <Mascot />
      <FriendlyLinks />
      <CmdHint />
      <CommandPalette />
      <CrtColorStrip />
      <CrBoot />
      <AppErrorBoundary><Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/play/pong" element={<PongPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense></AppErrorBoundary>
    </>
  )
}
