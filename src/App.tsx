import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { initTheme } from './lib/theme'
import { Mascot } from './components/Mascot'
import { FriendlyLinks } from './components/FriendlyLinks'
import { ProgressAndBackTop, Hearts } from './components/widgets'
import HomePage from './pages/HomePage'
import PostPage from './pages/PostPage'
import ArchivePage from './pages/ArchivePage'
import AboutPage from './pages/AboutPage'
import QuizPage from './pages/QuizPage'
import NotFoundPage from './pages/NotFoundPage'

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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:slug" element={<PostPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
