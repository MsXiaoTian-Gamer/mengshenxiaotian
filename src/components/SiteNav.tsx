import { NavLink } from 'react-router-dom'
import { ThemeToggleButton } from './widgets'
import { primaryNavRoutes } from '../app/routes'

export default function SiteNav() {
  return (
    <nav className="site-nav" aria-label="主导航">
      <div className="site-nav-inner">
        <NavLink to="/" className="site-nav-brand">
          萌神小天
        </NavLink>
        <div className="site-nav-links">
          {primaryNavRoutes.map(({ path, navLabel }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {navLabel}
            </NavLink>
          ))}
        </div>
        <ThemeToggleButton className="site-nav-theme" />
      </div>
    </nav>
  )
}
