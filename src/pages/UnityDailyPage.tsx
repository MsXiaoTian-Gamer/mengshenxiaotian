import { useEffect } from 'react'
import { setPageMeta } from '../lib/seo'
import news from '../data/unityNews.json'

interface NewsItem {
  title: string
  url: string
  publishedAt: string
}
const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })

export default function UnityDailyPage() {
  useEffect(() => {
    setPageMeta('Unity 日报 - 萌神小天', '每日同步 Unity 官方动态，关注引擎、开发技术和社区作品。')
  }, [])
  const groups = new Map<string, NewsItem[]>()
  for (const item of news.items as NewsItem[]) {
    const date = dateLabel(item.publishedAt)
    groups.set(date, [...(groups.get(date) || []), item])
  }
  return (
    <main className="projects-page" id="mainContent">
      <p className="projects-kicker">UNITY / DAILY</p>
      <h1>Unity 日报</h1>
      <p className="projects-intro">
        每天看看 Unity
        发生了什么：官方新闻、开发技术、社区作品。保留原文标题，点击即可阅读官方全文。
      </p>
      <p>
        计划每天北京时间 09:00 同步，实际更新时间可能延迟。
        {news.updatedAt ? `最近同步：${dateLabel(news.updatedAt)}` : '首次同步尚未完成。'}
      </p>
      <p>
        <a href="https://unity.com/blog" target="_blank" rel="noopener noreferrer">
          Unity 官方博客 ↗
        </a>
      </p>
      {groups.size === 0 && (
        <div className="project-card">
          <h2>等待第一期动态</h2>
          <p>同步完成后，这里将按原文发布日期展示资讯。没有新消息的日期不会生成日报。</p>
        </div>
      )}
      {Array.from(groups, ([date, items]) => (
        <section key={date} aria-label={`${date}动态`}>
          <h2>{date}</h2>
          <div className="project-grid">
            {items.map((item) => (
              <article className="project-card" key={item.url}>
                <span className="project-status">Unity 官方动态</span>
                <h3>{item.title}</h3>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  阅读原文 ↗
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
