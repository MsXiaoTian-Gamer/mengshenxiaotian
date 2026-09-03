// Markdown 渲染与 DOM 后处理（对标旧站 renderArticle 管线）
import { marked } from 'marked'
import hljs from 'highlight.js/lib/common'
import { stripFrontMatter } from './blog'

interface ProtectedMath {
  text: string
  spans: string[]
}

/**
 * 渲染前保护数学公式：先把 ``` 代码块整体抽出占位，再匹配 $$...$$（块级）与
 * $...$（行内，不跨行），替换为占位符，避免 marked 破坏 ^ _ 等语法。
 */
export function protectMath(md: string): ProtectedMath {
  const fenced: string[] = []
  let text = md.replace(/```[\s\S]*?```/g, m => {
    fenced.push(m)
    return '\u0000F' + (fenced.length - 1) + '\u0000'
  })
  const spans: string[] = []
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr: string) => {
    spans.push('<span class="math-marker" data-disp="1" data-k="' + encodeURIComponent(expr.trim()) + '"></span>')
    return '\u0000M' + (spans.length - 1) + '\u0000'
  })
  text = text.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (_m, pre: string, expr: string) => {
    spans.push('<span class="math-marker" data-disp="0" data-k="' + encodeURIComponent(expr) + '"></span>')
    return pre + '\u0000M' + (spans.length - 1) + '\u0000'
  })
  text = text.replace(/\u0000F(\d+)\u0000/g, (_m, i: string) => fenced[Number(i)] ?? '')
  return { text, spans }
}

/** 渲染 markdown 为 HTML（standard marked 输出，后处理在 DOM 阶段完成） */
export function renderMarkdownHtml(md: string): string {
  const cleaned = stripFrontMatter(md)
  const p = protectMath(cleaned)
  let html = marked.parse(p.text, { gfm: true, breaks: true }) as string
  html = html.replace(/\u0000M(\d+)\u0000/g, (_m, i: string) => p.spans[Number(i)] ?? '')
  return html
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function langOf(codeEl: HTMLElement): string {
  const cls = (codeEl.className || '').split(/\s+/)
  for (const c of cls) {
    if (c.startsWith('language-')) return c.replace('language-', '')
  }
  return ''
}

const WEB_LANGS = ['html', 'css', 'js', 'javascript']
const LANG_NAMES: Record<string, string> = { python: 'Python', py: 'Python', cpp: 'C++', 'c++': 'C++', csharp: 'C#', cs: 'C#' }

/** 将 <!-- code-tabs --> ... <!-- end-code-tabs --> 注释区间转换为 LeetCode 风格 Tab */
export function convertCodeTabs(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT, null)
  const starts: Comment[] = []
  let node: Node | null
  while ((node = walker.nextNode())) {
    if (node.nodeValue && node.nodeValue.trim() === 'code-tabs') starts.push(node as Comment)
  }
  starts.forEach(start => {
    let el: Node | null = start.nextSibling
    let end: Comment | null = null
    const pres: HTMLElement[] = []
    while (el) {
      if (el.nodeType === Node.COMMENT_NODE && el.nodeValue && el.nodeValue.trim() === 'end-code-tabs') {
        end = el as Comment
        break
      }
      if (el.nodeType === Node.ELEMENT_NODE) {
        const tag = (el as HTMLElement).tagName
        if (tag === 'PRE' || ((el as HTMLElement).classList && (el as HTMLElement).classList.contains('code-block-wrapper'))) {
          pres.push(el as HTMLElement)
        }
      }
      el = el.nextSibling
    }
    if (!end || pres.length === 0) return

    const wrapper = document.createElement('div')
    wrapper.className = 'lc-tabs'
    const bar = document.createElement('div')
    bar.className = 'lc-bar'
    const panels: HTMLDivElement[] = []

    pres.forEach((pre, i) => {
      const code = pre.querySelector('code')
      let lang = ''
      if (code) lang = langOf(code as HTMLElement)
      const tab = document.createElement('span')
      tab.className = 'lc-tab' + (i === 0 ? ' active' : '')
      tab.textContent = LANG_NAMES[lang.toLowerCase()] || lang || '语言 ' + (i + 1)
      tab.addEventListener('click', () => {
        bar.querySelectorAll('.lc-tab').forEach((t, ti) => {
          t.classList.toggle('active', ti === i)
        })
        panels.forEach((p, pi) => {
          p.style.display = pi === i ? 'block' : 'none'
        })
      })
      bar.appendChild(tab)
      const panel = document.createElement('div')
      panel.className = 'lc-panel'
      panel.style.display = i === 0 ? 'block' : 'none'
      panel.appendChild(pre)
      panels.push(panel)
    })

    wrapper.appendChild(bar)
    panels.forEach(p => wrapper.appendChild(p))
    start.parentNode?.insertBefore(wrapper, start)
    // 移除开始/结束注释与区间内遗留文本节点
    let cursor: Node | null = wrapper.nextSibling
    while (cursor && cursor !== end) {
      const nx = cursor.nextSibling
      cursor.parentNode?.removeChild(cursor)
      cursor = nx
    }
    end.parentNode?.removeChild(end)
    start.parentNode?.removeChild(start)
  })
}

/** 为普通 pre 代码块包装 language/copy/run 等（tab 面板内的不重复包装） */
export function decorateCodeBlocks(root: HTMLElement): void {
  const pres = root.querySelectorAll('pre')
  pres.forEach(preRaw => {
    const pre = preRaw as HTMLPreElement
    if (pre.closest('.lc-panel, .code-block-wrapper')) return
    const code = pre.querySelector('code') as HTMLElement | null
    if (!code) return
    const lang = langOf(code)
    if (lang.toLowerCase() === 'mermaid') return // mermaid 图不套代码块外壳，交给图表渲染

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'
    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    if (lang) {
      const label = document.createElement('div')
      label.className = 'code-lang-label'
      label.textContent = lang
      wrapper.insertBefore(label, pre)
    }

    const copyBtn = document.createElement('button')
    copyBtn.type = 'button'
    copyBtn.className = 'copy-btn'
    copyBtn.textContent = '复制'
    copyBtn.setAttribute('aria-label', '复制代码')
    copyBtn.addEventListener('click', () => {
      copyText(code.textContent || '')
    })
    wrapper.appendChild(copyBtn)

    // 长代码自动折叠：超过 44 行默认收起，点击展开
    const lineCount = (code.textContent || '').split('\n').length
    if (lineCount > 44) {
      wrapper.classList.add('cf-folded')
      const foldBtn = document.createElement('button')
      foldBtn.type = 'button'
      foldBtn.className = 'code-fold-btn'
      foldBtn.textContent = `展开 ${lineCount} 行代码`
      foldBtn.addEventListener('click', () => {
        const folded = wrapper.classList.toggle('cf-folded')
        foldBtn.textContent = folded ? `展开 ${lineCount} 行代码` : '收起 ▲'
      })
      wrapper.appendChild(foldBtn)
    }

    const lower = lang.toLowerCase()
    if (WEB_LANGS.includes(lower)) {
      const runBtn = document.createElement('button')
      runBtn.type = 'button'
      runBtn.className = 'code-run-btn'
      runBtn.textContent = '▶ 运行'
      runBtn.addEventListener('click', () => {
        runCodePreview(code.textContent || '', lower)
      })
      wrapper.appendChild(runBtn)
    }
  })
}

export function highlightCode(root: HTMLElement): void {
  root.querySelectorAll('pre code').forEach(el => {
    try {
      hljs.highlightElement(el as HTMLElement)
    } catch (e) {
      /* 未知语言时忽略 */
    }
  })
}

/** 图片点击放大 lightbox */
export function bindLightbox(root: HTMLElement): void {
  root.querySelectorAll('img').forEach(imgRaw => {
    const img = imgRaw as HTMLImageElement
    if (img.closest('.code-block-wrapper, .lc-panel, .lightbox-overlay')) return
    img.style.cursor = 'pointer'
    img.addEventListener('click', () => {
      const overlay = document.createElement('div')
      overlay.className = 'lightbox-overlay'
      const lbImg = document.createElement('img')
      lbImg.src = img.src
      lbImg.className = 'lightbox-img'
      overlay.appendChild(lbImg)
      overlay.addEventListener('click', () => overlay.remove())
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          overlay.remove()
          document.removeEventListener('keydown', onKey)
        }
      }
      document.addEventListener('keydown', onKey)
      document.body.appendChild(overlay)
    })
  })
}

export function copyText(text: string): void {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  try {
    document.execCommand('copy')
  } catch (e) {
    /* ignore */
  }
  document.body.removeChild(ta)
}

/** 代码运行预览（HTML/CSS/JS 通过 sandbox iframe 执行） */
export function runCodePreview(code: string, lang: string): void {
  const modal = document.createElement('div')
  modal.className = 'code-preview-modal'
  const container = document.createElement('div')
  container.className = 'code-preview-container'
  const header = document.createElement('div')
  header.className = 'code-preview-header'
  const title = document.createElement('span')
  title.textContent = '代码预览 (' + lang.toUpperCase() + ')'
  const closeBtn = document.createElement('button')
  closeBtn.textContent = '×'
  closeBtn.addEventListener('click', () => modal.remove())
  header.appendChild(title)
  header.appendChild(closeBtn)

  const iframe = document.createElement('iframe')
  iframe.className = 'code-preview-iframe'
  iframe.sandbox = 'allow-scripts allow-same-origin'

  let htmlContent = code
  if (lang === 'js' || lang === 'javascript') {
    htmlContent =
      '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><script>' + code + '<\/script></body></html>'
  } else if (lang === 'html') {
    if (!/<html/i.test(code) && !/<body/i.test(code) && !/<head/i.test(code)) {
      htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' + code + '</body></html>'
    }
  } else if (lang === 'css') {
    htmlContent =
      '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' +
      code +
      '</style></head><body><div style="padding:20px;font-family:sans-serif;">CSS 预览（请查看样式效果）</div></body></html>'
  }
  iframe.srcdoc = htmlContent

  container.appendChild(header)
  container.appendChild(iframe)
  modal.appendChild(container)
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove()
  })
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      modal.remove()
      document.removeEventListener('keydown', onKey)
    }
  }
  document.addEventListener('keydown', onKey)
  document.body.appendChild(modal)
}

/** 在 markdown 渲染后的容器内执行完整增强管线 */
export function enhanceMarkdownDom(root: HTMLElement): void {
  convertCodeTabs(root)
  decorateCodeBlocks(root)
  highlightCode(root)
  bindLightbox(root)
}

/** 从正文提取前 N 行生成 meta description（供 SEO） */
export function buildDescription(md: string, max = 160): string {
  const text = stripFrontMatter(md)
    .replace(/[#*`\-_>\[\]()!|~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.substring(0, max)
}

/** 安全转义（用于拼接 attr） */
export { escapeHtml }

/* ============ 异步增强：KaTeX 数学公式 & Mermaid 图表（CDN 按需加载） ============ */

const CDN_KATEX = 'https://cdnjs.cloudflare.com/ajax/libs/katex/0.16.11'
const CDN_MERMAID = 'https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js'

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) {
      resolve()
      return
    }
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('加载失败: ' + src))
    document.head.appendChild(s)
  })
}

function loadCss(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('link[href="' + href + '"]')) {
      resolve()
      return
    }
    const l = document.createElement('link')
    l.rel = 'stylesheet'
    l.href = href
    l.onload = () => resolve()
    l.onerror = () => reject(new Error('加载失败: ' + href))
    document.head.appendChild(l)
  })
}

let katexPromise: Promise<void> | null = null
function loadKatex(): Promise<void> {
  if (katexPromise) return katexPromise
  katexPromise = Promise.all([
    loadCss(CDN_KATEX + '/katex.min.css'),
    loadScript(CDN_KATEX + '/katex.min.js'),
  ]).then(() => {
    if (!(window as unknown as Record<string, unknown>).katex) throw new Error('katex 未就绪')
  })
  return katexPromise
}

/** 渲染 .math-marker 占位符为 KaTeX 公式（内联/块级） */
export function renderMathMarkers(root: HTMLElement): void {
  const markers = root.querySelectorAll<HTMLElement>('.math-marker')
  if (markers.length === 0) return
  loadKatex()
    .then(() => {
      const katex = (window as unknown as { katex: { render: (expr: string, el: HTMLElement, opts?: unknown) => void } }).katex
      markers.forEach(el => {
        const expr = decodeURIComponent(el.getAttribute('data-k') || '')
        const displayMode = el.getAttribute('data-disp') === '1'
        try {
          katex.render(expr, el, { displayMode, throwOnError: false })
        } catch (e) {
          el.textContent = expr
        }
      })
    })
    .catch(() => {
      markers.forEach(el => {
        el.textContent = decodeURIComponent(el.getAttribute('data-k') || '')
      })
    })
}

let mermaidPromise: Promise<unknown> | null = null
function loadMermaid(): Promise<unknown> {
  if (mermaidPromise) return mermaidPromise
  mermaidPromise = loadScript(CDN_MERMAID).then(() => (window as unknown as Record<string, unknown>).mermaid)
  return mermaidPromise
}

function prefersDark(): boolean {
  return (
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
}

/** 将 ```mermaid 代码块渲染为 SVG 图 */
export async function renderMermaidBlocks(root: HTMLElement): Promise<void> {
  const codeBlocks = root.querySelectorAll<HTMLElement>('pre > code.language-mermaid')
  if (codeBlocks.length === 0) return
  try {
    const mermaid = (await loadMermaid()) as {
      initialize: (opts: Record<string, unknown>) => void
      render: (id: string, text: string) => Promise<{ svg: string }>
    }
    mermaid.initialize({ startOnLoad: false, theme: prefersDark() ? 'dark' : 'default', securityLevel: 'loose' })
    let i = 0
    for (const code of Array.from(codeBlocks)) {
      const pre = code.parentElement as HTMLPreElement | null
      const text = code.textContent || ''
      const holder = document.createElement('div')
      holder.className = 'mermaid-box'
      try {
        const { svg } = await mermaid.render('mmd-' + Date.now() + '-' + i++, text)
        holder.innerHTML = svg
      } catch (e) {
        holder.className = 'mermaid-box mermaid-error'
        holder.textContent = '图表渲染失败，请检查 Mermaid 语法'
      }
      if (pre) pre.parentNode?.replaceChild(holder, pre)
    }
  } catch (e) {
    /* CDN 不可用时保持原代码块 */
  }
}
