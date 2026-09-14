import { NavLink } from 'react-router-dom'

const links = [
  ['/', '首页'],
  ['/archive', '文章'],
  ['/learn', 'Unity 路线'],
  ['/projects', '项目'],
  ['/quiz', '题库'],
  ['/about', '关于'],
]

export default function SiteNav() {
  return <nav className="site-nav" aria-label="主导航">
    <div className="site-nav-inner">
      <NavLink to="/" className="site-nav-brand">萌神小天</NavLink>
      <div className="site-nav-links">
        {links.slice(1).map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'is-active' : ''}>{label}</NavLink>)}
      </div>
    </div>
  </nav>
}
