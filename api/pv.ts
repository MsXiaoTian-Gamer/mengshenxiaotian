// Vercel Serverless Function：全站访问 / 文章阅读计数（存储于 Upstash Redis）
// 环境变量（在 Vercel Project Settings -> Environment Variables 配置，亦可在本地 .env 提供）：
//   UPSTASH_REDIS_REST_URL   https://xxxx.upstash.io
//   UPSTASH_REDIS_REST_TOKEN 一段用于 REST API 的只读/读写 Token
//
// API:
//   GET  /api/pv  ->  { site: number, articles: { [slug]: number } }
//   POST /api/pv  ->  body: { kind: 'site' } | { kind: 'article', slug: string }

const UPSTASH_URL = (process.env.UPSTASH_REDIS_REST_URL || '').replace(/\/+$/, '')
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || ''

const KEY_SITE = 'pv:site'
const KEY_ARTICLES = 'pv:articles'

const KNOWN_SLUGS = new Set([
  '2026-09-22-wuhan-weipai-phone-interview',
  '2026-09-11-PathFinding-Unity-网格寻路算法可视化',
  '2026-08-28-Unity-第二阶段-设计模式与代码结构',
  '2026-09-08-Unity-第三阶段-项目架构与工程化实践',
  '2026-09-08-cpp-and-co-baguwen',
  '2026-08-19-gbits-unity-client-interview',
  '2026-08-17-mihoyo-game-client-interview',
  '2026-08-11-Unity-基础入门与核心概念',
  '2026-07-31-Unity-零基础入门指南',
  '2026-07-14-Tiny-Pet-Sand-Wars-更新',
  '2026-06-15-Tiny-Pet-Sand-Wars-更',
  '2026-05-31-小宠沙暴大战12-游戏更新啦',
  '2026-05-10-游戏发布itch啦',
  '2025-11-15-腾讯游戏客户端一面凉经',
  '2025-10-30-TapTap聚光灯开发日志Day7',
  '2025-10-27-TapTap聚光灯开发日志Day6',
  '2025-10-24-TapTap聚光灯开发日志Day5',
  '2025-10-20-Unity新手学习推荐',
  '2025-10-19-TapTap聚光灯开发日志Day4',
  '2025-10-19-Unity资源分享',
  '2025-10-17-TapTap聚光灯开发日志Day3',
  '2025-10-14-TapTap聚光灯开发日志Day2',
  '2025-10-11-TapTap聚光灯开发日志Day1',
])

function configured(): boolean {
  return Boolean(UPSTASH_URL && UPSTASH_TOKEN)
}

async function pipeline(commands: Array<Array<string | number>>): Promise<Array<{ result?: unknown }>> {
  const res = await fetch(UPSTASH_URL + '/pipeline', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + UPSTASH_TOKEN,
      'content-type': 'application/json',
    },
    body: JSON.stringify(commands),
  })
  if (!res.ok) {
    throw new Error('upstash http ' + res.status)
  }
  return res.json()
}

async function readStats() {
  const out = await pipeline([
    ['GET', KEY_SITE],
    ['HGETALL', KEY_ARTICLES],
  ])
  const site = Number(out[0] && out[0].result) || 0
  const articles: Record<string, number> = {}
  const h = out[1] && out[1].result
  if (Array.isArray(h)) {
    for (let i = 0; i + 1 < h.length; i += 2) {
      articles[String(h[i])] = Number(h[i + 1]) || 0
    }
  }
  return { site, articles }
}

function send(res: any, status: number, payload: unknown) {
  res.status(status).json(payload)
}

export default async function handler(req: any, res: any) {
  res.setHeader('cache-control', 'no-store')

  if (!configured()) {
    // 尚未配置 Upstash 环境变量：返回空数据但保持可用，避免前端报错
    return send(res, 200, { ok: false, site: 0, articles: {} })
  }

  try {
    if (req.method === 'GET') {
      const stats = await readStats()
      return send(res, 200, { ok: true, ...stats })
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'object' && req.body !== null ? req.body : {}
      if (body.kind === 'article' && typeof body.slug === 'string' && KNOWN_SLUGS.has(body.slug)) {
        await pipeline([
          ['HINCRBY', KEY_ARTICLES, body.slug, 1],
        ])
        return send(res, 200, { ok: true })
      }
      if (body.kind === 'site') {
        await pipeline([['INCR', KEY_SITE]])
        return send(res, 200, { ok: true })
      }
      return send(res, 400, { ok: false, error: 'bad request' })
    }

    return send(res, 405, { ok: false, error: 'method not allowed' })
  } catch (e) {
    return send(res, 502, { ok: false, error: 'upstream error' })
  }
}
