import { lazy, type ReactNode } from 'react'
import HomePage from '../pages/HomePage'

export interface AppRoute {
  path: string
  element: ReactNode
  navLabel?: string
}

const PostPage = lazy(() => import('../pages/PostPage'))
const LearnPage = lazy(() => import('../pages/LearnPage'))
const ArchivePage = lazy(() => import('../pages/ArchivePage'))
const AboutPage = lazy(() => import('../pages/AboutPage'))
const QuizPage = lazy(() => import('../pages/QuizPage'))
const PlayPage = lazy(() => import('../pages/PlayPage'))
const PongPage = lazy(() => import('../pages/PongPage'))
const StatsPage = lazy(() => import('../pages/StatsPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const ProjectsPage = lazy(() => import('../pages/ProjectsPage'))
/** The route table is the single source for page matching and primary navigation. */
export const appRoutes: AppRoute[] = [
  { path: '/', element: <HomePage /> },
  { path: '/post/:slug', element: <PostPage /> },
  { path: '/learn', element: <LearnPage />, navLabel: 'Unity 路线' },
  { path: '/archive', element: <ArchivePage />, navLabel: '文章' },
  { path: '/about', element: <AboutPage />, navLabel: '关于' },
  { path: '/projects', element: <ProjectsPage />, navLabel: '项目' },
  { path: '/quiz', element: <QuizPage />, navLabel: '题库' },
  { path: '/play', element: <PlayPage /> },
  { path: '/play/pong', element: <PongPage /> },
  { path: '/stats', element: <StatsPage /> },
  { path: '*', element: <NotFoundPage /> },
]

export const primaryNavRoutes = appRoutes.filter(
  (route): route is AppRoute & { navLabel: string } => Boolean(route.navLabel),
)
