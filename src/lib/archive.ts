import type { ArticleKind, ArticleMeta } from '../data/articles'

export interface ArchiveFilters {
  kind: ArticleKind | 'all' | string
  tag: string
  query: string
}

export interface ArchiveYearGroup {
  year: string
  items: ArticleMeta[]
}

export function filterArticles(articles: ArticleMeta[], filters: ArchiveFilters): ArticleMeta[] {
  const query = filters.query.trim().toLocaleLowerCase()

  return articles.filter((article) => {
    if (filters.kind !== 'all' && article.kind !== filters.kind) return false
    if (filters.tag !== 'all' && !article.tags.includes(filters.tag)) return false
    if (!query) return true

    const searchableText = [article.title, ...article.tags, article.slug]
      .join(' ')
      .toLocaleLowerCase()
    return searchableText.includes(query)
  })
}

export function groupArticlesByYear(articles: ArticleMeta[]): ArchiveYearGroup[] {
  const groups = new Map<string, ArticleMeta[]>()

  for (const article of articles) {
    const year = article.date.slice(0, 4)
    const items = groups.get(year) ?? []
    items.push(article)
    groups.set(year, items)
  }

  return [...groups.entries()]
    .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
    .map(([year, items]) => ({ year, items }))
}
