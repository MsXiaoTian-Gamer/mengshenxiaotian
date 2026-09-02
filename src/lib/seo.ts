// 轻量 SEO：路由变化时更新 title / description / canonical
export function setPageMeta(title: string, description?: string): void {
  document.title = title
  if (description) {
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', description)
  }
}
