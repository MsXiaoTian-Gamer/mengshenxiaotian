import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { initTheme } from './lib/theme'
import { Mascot } from './components/Mascot'
import { FriendlyLinks } from './components/FriendlyLinks'
import { ProgressAndBackTop, Hearts } from './components/widgets'
import CommandPalette from './components/CommandPalette'
import CrtColorStrip from './components/CrtColorStrip'
import CrBoot from './components/CrBoot'
import HomePage from './pages/HomePage'

// 路由级代码分割：非首页页面按需加载（marked/highlight/fuse/题库数据均随之拆包）
const PostPage = lazy(() => import('./pages/PostPage'))
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
      <ScrollToTop />
      <Hearts />
      <ProgressAndBackTop />
      <Mascot />
      <FriendlyLinks />
      <CommandPalette />
      <CrtColorStrip />
      <CrBoot />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/play/pong" element={<PongPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}
