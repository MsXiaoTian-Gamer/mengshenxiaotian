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
      if (body.kind === 'article' && typeof body.slug === 'string' && body.slug.length <= 200) {
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
