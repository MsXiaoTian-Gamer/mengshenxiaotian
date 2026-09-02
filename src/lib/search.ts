// 全文搜索：Fuse.js 索引（标题/标签/正文/路径）
import Fuse from 'fuse.js'
import type { ArticleMeta } from '../data/articles'
import { getRawContent } from './content'
import { stripFrontMatter } from './blog'

/** 正文转纯文本（去 markdown 符号），作为搜索正文 */
function toPlainText(md: string): string {
  return stripFrontMatter(md)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*`>_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface SearchDoc {
  slug: string
  title: string
  tags: string[]
  body: string
}

let fuseCache: Fuse<SearchDoc> | null = null

function buildIndex(): Fuse<SearchDoc> {
  if (fuseCache) return fuseCache
  const docs = [...ARTICLES_ALL].map(a => ({
    slug: a.slug,
    title: a.title,
    tags: a.tags || [],
    body: toPlainText(getRawContent(a.path)),
  }))
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

/** 按 query 搜索，返回按相关度排序的文章 slug 列表 */
export function searchSlugs(query: string): string[] {
  const q = query.trim()
  if (!q) return []
  try {
    return buildIndex()
      .search(q)
      .map(r => r.item.slug)
  } catch (e) {
    return []
  }
}

// 延迟 import 数据避免循环依赖（search.ts 被 HomePage 引用即可）
import { ARTICLES as ARTICLES_ALL } from '../data/articles'
