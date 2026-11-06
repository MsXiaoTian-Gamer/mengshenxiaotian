import { useEffect } from 'react'
import { setPageMeta } from '../lib/seo'
import news from '../data/unityNews.json'

interface NewsItem {
  title: string
  url: string
  source: string
  category: string
  publishedAt: string
}
const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })

export default function UnityDailyPage() {
  useEffect(() => {
    setPageMeta(
      'Unity 日报 - 萌神小天',
      '每日汇集 Unity 官方资讯、社区讨论、开发者分享与行业动态。',
    )
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
        发生了什么：官方资讯、社区讨论、开发者分享与行业动态。保留原文标题和来源，点击阅读原文。社区内容为作者观点，未经本站逐条核实。
      </p>
      <p>
        计划每天北京时间 09:00 同步，实际更新时间可能延迟。
        {news.updatedAt ? `最近同步：${dateLabel(news.updatedAt)}` : '首次同步尚未完成。'}
      </p>
      <p>
        来源：Unity 官方博客、Unity Discussions、Reddit Unity3D、Game Developer（仅收录 Unity
        相关内容）。单个来源暂时不可用时，保留历史内容并继续同步其他来源。
      </p>
      <div aria-label="来源同步状态">
        {news.sources.map((source) => (
          <p key={source.name}>
            {source.name}：
            {source.ok ? `本次收录 ${source.count} 条` : '本次未能同步，保留历史内容'}
          </p>
        ))}
      </div>
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
                <span className="project-status">
                  {item.category} · {item.source}
                </span>
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
