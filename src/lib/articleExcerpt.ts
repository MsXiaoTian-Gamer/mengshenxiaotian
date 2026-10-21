import type { ArticleMeta } from '../data/articles'
import { POST_SUMMARY } from '../data/generated-meta'

/** 生成的摘要通常以标题开头；卡片和阅读页只显示正文预览。 */
export function getArticleExcerpt(article: ArticleMeta): string {
  const summary = (POST_SUMMARY[article.slug] || '').trim()
  return summary.startsWith(article.title) ? summary.slice(article.title.length).trim() : summary
}
