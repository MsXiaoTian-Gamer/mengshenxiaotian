// 全文搜索：Fuse.js 索引（标题/标签/正文/路径）
// 2A：正文不再 eager 内联；索引改为 build 期生成的 public/search-index.json，运行时按需 fetch 后建 Fuse
import Fuse from 'fuse.js'

export interface SearchDoc {
  slug: string
  title: string
  tags: string[]
  body: string
}

let indexCache: SearchDoc[] | null = null
let fuseCache: Fuse<SearchDoc> | null = null
let loading: Promise<SearchDoc[]> | null = null

async function loadIndex(): Promise<SearchDoc[]> {
  if (indexCache) return indexCache
  if (loading) return loading
  loading = fetch('/search-index.json')
    .then(r => {
      if (!r.ok) throw new Error('search index fetch failed: ' + r.status)
      return r.json() as Promise<SearchDoc[]>
    })
    .then(docs => {
      indexCache = docs
      return docs
    })
    .finally(() => {
      loading = null
    })
  return loading
}

async function buildIndex(): Promise<Fuse<SearchDoc>> {
  if (fuseCache) return fuseCache
  const docs = await loadIndex()
  fuseCache = new Fuse(docs, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'tags', weight: 2 },
      { name: 'body', weight: 1 },
      { name: 'slug', weight: 0.5 },
    ],
    threshold: 0.45,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 1,
  })
  return fuseCache
}

/** 按 query 搜索，返回按相关度排序的文章 slug 列表（异步：首次会拉取 search-index.json） */
export async function searchSlugs(query: string): Promise<string[]> {
  const q = query.trim()
  if (!q) return []
  try {
    const fuse = await buildIndex()
    return fuse.search(q).map(r => r.item.slug)
  } catch (e) {
    return []
  }
}
