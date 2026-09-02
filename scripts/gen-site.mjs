// 生成 public/sitemap.xml / public/feed.xml / public/robots.txt
// 由 articles.ts + src/content/*.md 驱动，构建前自动执行
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const SITE = 'https://msxiaotian.top'
const SITE_NAME = '萌神小天'

const src = fs.readFileSync(path.join(root, 'src/data/articles.ts'), 'utf8')
const re = /\{\s*title:\s*"([^"]*)",\s*date:\s*"([^"]*)",\s*tags:\s*\[([^\]]*)\],\s*path:\s*"([^"]*)",\s*slug:\s*"([^"]*)"/g

const posts = []
let m
while ((m = re.exec(src))) {
  const [, title, date, tagsRaw, mdPath, slug] = m
  const tags = [...tagsRaw.matchAll(/"([^"]*)"/g)].map(x => x[1])
  posts.push({ title, date, tags, path: mdPath, slug })
}
posts.sort((a, b) => b.date.localeCompare(a.date))

function xmlEscape(s) {
  return String(s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
}
function stripMd(raw) {
  let t = raw.replace(/^---[\s\S]*?---/, '').replace(/```[\s\S]*?```/g, ' ')
  return t.replace(/[#*`>_~\-\[\]()!|]/g, ' ').replace(/\s+/g, ' ').trim()
}

// sitemap.xml
const url = s => SITE + '/post/' + encodeURIComponent(s)
const sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
sm.push(`  <url><loc>${SITE}/</loc><lastmod>${posts[0]?.date || '2026-01-01'}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>`)
for (const p of posts) {
  sm.push(`  <url><loc>${url(p.slug)}</loc><lastmod>${p.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`)
}
sm.push('</urlset>')
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), sm.join('\n') + '\n')

// feed.xml (RSS 2.0)
const feed = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  '<channel>',
  `<title>${xmlEscape(SITE_NAME)}</title>`,
  `<link>${SITE}/</link>`,
  '<description>萌神小天的独立游戏开发博客，分享 Unity 学习、游戏开发与独立游戏心得</description>',
  '<language>zh-CN</language>',
  `<atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>`,
]
for (const p of posts) {
  const fp = path.join(root, 'src/content', p.path)
  const raw = fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : ''
  const clean = stripMd(raw)
  const desc = clean.slice(0, 300) + (clean.length > 300 ? '…' : '')
  const pub = new Date(p.date + 'T00:00:00+08:00').toUTCString()
  feed.push(
    '  <item>',
    `    <title>${xmlEscape(p.title)}</title>`,
    `    <link>${url(p.slug)}</link>`,
    `    <guid isPermaLink="true">${url(p.slug)}</guid>`,
    `    <pubDate>${pub}</pubDate>`,
    `    <description>${xmlEscape(desc)}</description>`,
    '  </item>'
  )
}
feed.push('</channel>', '</rss>')
fs.writeFileSync(path.join(root, 'public/feed.xml'), feed.join('\n') + '\n')

// robots.txt
fs.writeFileSync(
  path.join(root, 'public/robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n'
)

console.log('gen-site: ' + posts.length + ' posts -> public/sitemap.xml, feed.xml, robots.txt')
