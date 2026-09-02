// 主题管理：localStorage blog_theme + html[data-theme]，与旧站保持一致
export function getTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem('blog_theme')
    if (saved === 'dark' || saved === 'light') return saved
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  } catch (e) { /* ignore */ }
  return 'light'
}

export function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark') root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')

  // 切换 highlight.js 两套 CDN 主题
  const lightCss = document.getElementById('hljs-light') as HTMLLinkElement | null
  const darkCss = document.getElementById('hljs-dark') as HTMLLinkElement | null
  if (lightCss) lightCss.disabled = theme === 'dark'
  if (darkCss) darkCss.disabled = theme !== 'dark'
}

export function toggleTheme(): 'light' | 'dark' {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  try { localStorage.setItem('blog_theme', next) } catch (e) { /* ignore */ }
  applyTheme(next)
  return next
}

export function initTheme() {
  applyTheme(getTheme())
}
