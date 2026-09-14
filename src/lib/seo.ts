// SEO：路由变化时更新 title / description / canonical / Open Graph
const SITE_URL = 'https://msxiaotian.top'
const SITE_NAME = '萌神小天'
const OG_IMAGE = SITE_URL + '/og-banner.png'

function ensureMeta(attr: 'name' | 'property', key: string): HTMLElement {
  const sel = attr === 'name' ? 'meta[name="' + key + '"]' : 'meta[property="' + key + '"]'
  let meta = document.querySelector<HTMLElement>(sel)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, key)
    document.head.appendChild(meta)
  }
  return meta
}

function ensureCanonical(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  return link
}

export interface PageMetaOptions {
  path?: string // 相对路径，如 /post/slug
  image?: string // og:image 绝对 URL
}

export function setPageMeta(title: string, description?: string, opts?: PageMetaOptions): void {
  document.title = title
  const url = SITE_URL + (opts?.path || (typeof location !== 'undefined' ? location.pathname : '/'))

  ensureCanonical().setAttribute('href', url)
  ensureMeta('property', 'og:title').setAttribute('content', title)
  ensureMeta('property', 'og:site_name').setAttribute('content', SITE_NAME)
  ensureMeta('property', 'og:url').setAttribute('content', url)
  ensureMeta('property', 'og:type').setAttribute('content', opts?.path ? 'article' : 'website')
  ensureMeta('property', 'og:image').setAttribute('content', opts?.image || OG_IMAGE)
  ensureMeta('property', 'og:locale').setAttribute('content', 'zh_CN')
  ensureMeta('name', 'twitter:card').setAttribute('content', 'summary_large_image')

  if (description) {
    ensureMeta('name', 'description').setAttribute('content', description)
    ensureMeta('property', 'og:description').setAttribute('content', description)
    ensureMeta('name', 'twitter:title').setAttribute('content', title)
    ensureMeta('name', 'twitter:description').setAttribute('content', description)
    ensureMeta('name', 'twitter:image').setAttribute('content', opts?.image || OG_IMAGE)
  }

  let schema = document.querySelector<HTMLScriptElement>('script[data-page-schema="article"]')
  if (!schema) {
    schema = document.createElement('script')
    schema.type = 'application/ld+json'
    schema.dataset.pageSchema = 'article'
    document.head.appendChild(schema)
  }
  schema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': opts?.path ? 'TechArticle' : 'WebSite',
    headline: title,
    description: description || '',
    url,
    image: opts?.image || OG_IMAGE,
    inLanguage: 'zh-CN',
    author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL + '/about' },
    publisher: { '@type': 'Person', name: SITE_NAME },
  })
}
