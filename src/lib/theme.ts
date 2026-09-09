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
}

const HLJS_THEMES: Record<'light' | 'dark', string> = {
  light: '/vendor/hljs/github.min.css',
  dark: '/vendor/hljs/github-dark.min.css',
}
const hljsCssLoading: Partial<Record<'light' | 'dark', Promise<void>>> = {}

/** 保证指定 hljs 主题 CSS 已注入（幂等，同主题只加载一次；并发安全） */
export function ensureHljsCss(theme: 'light' | 'dark'): Promise<void> {
  const link = document.querySelector<HTMLLinkElement>('link[data-hljs-theme]')
  if (link) {
    if (link.dataset.hljsTheme === theme) return Promise.resolve()
    // 已加载另一套主题，直接替换 href 即可（无需额外并发控制，避免同屏双主题）
    link.href = HLJS_THEMES[theme]
    link.dataset.hljsTheme = theme
    return Promise.resolve()
  }
  if (!hljsCssLoading[theme]) {
    hljsCssLoading[theme] = new Promise((resolve, reject) => {
      const el = document.createElement('link')
      el.rel = 'stylesheet'
      el.href = HLJS_THEMES[theme]
      el.dataset.hljsTheme = theme
      el.onload = () => resolve()
      el.onerror = () => {
        delete hljsCssLoading[theme]
        reject(new Error('hljs 主题 CSS 加载失败: ' + HLJS_THEMES[theme]))
      }
      document.head.appendChild(el)
    })
  }
  return hljsCssLoading[theme]!
}

export function toggleTheme(): 'light' | 'dark' {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem('blog_theme', next)
  } catch (e) {
    /* ignore */
  }
  applyTheme(next)
  // 若文章页已注入 hljs 主题，切主题时同步替换 href，避免代码块与页面配色错位
  const hl = document.querySelector<HTMLLinkElement>('link[data-hljs-theme]')
  if (hl) {
    hl.href = HLJS_THEMES[next]
    hl.dataset.hljsTheme = next
  }
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
