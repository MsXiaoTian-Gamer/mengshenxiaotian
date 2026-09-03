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
  applyCrt(getCrt())
}

/* ===== CRT 终端多配色（三套磷光调色板） ===== */
export type CrtPalette = 'green' | 'amber' | 'blue'

export function getCrt(): CrtPalette {
  try {
    const saved = localStorage.getItem('blog_crt')
    if (saved === 'amber' || saved === 'blue' || saved === 'green') return saved
  } catch (e) {
    /* ignore */
  }
  return 'green'
}

/** green 为默认配色，不挂 data-crt 属性；amber/blue 显式设置 */
export function applyCrt(palette: CrtPalette) {
  const root = document.documentElement
  if (palette === 'green') root.removeAttribute('data-crt')
  else root.setAttribute('data-crt', palette)
}

export function setCrt(palette: CrtPalette) {
  try {
    localStorage.setItem('blog_crt', palette)
  } catch (e) {
    /* ignore */
  }
  applyCrt(palette)
  window.dispatchEvent(new CustomEvent('crt:change', { detail: palette }))
}
