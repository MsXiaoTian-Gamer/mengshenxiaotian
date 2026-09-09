// 萌神小天博客 PWA Service Worker 生成器
// 用法：vite build 之后执行，读取 dist 产物的实际资源清单，注入 public/sw.js 占位符，输出 dist/sw.js
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

const assetFiles = readdirSync(join(dist, 'assets')).filter(
  f => f.endsWith('.js') || f.endsWith('.css')
)

// 自托管 vendor（hljs/KaTeX/Mermaid）全部纳入预缓存，保证离线可用
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...walk(p))
    else out.push(p.slice(dist.length).replace(/\\/g, '/'))
  }
  return out
}
let vendorFiles = []
try {
  vendorFiles = walk(join(dist, 'vendor')).filter(f => /\.(js|css|woff2?|ttf)$/.test(f))
} catch {
  /* 无 vendor 目录时跳过 */
}

let fonts = []
try {
  fonts = readdirSync(join(dist, 'fonts'))
    .filter(f => f.endsWith('.woff2'))
    .map(f => '/fonts/' + f)
} catch {
  /* 未自托管字体时跳过 */
}
const precache = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/sitemap.xml',
  ...assetFiles.map(f => '/assets/' + f),
  ...fonts,
  ...vendorFiles,
]

const template = readFileSync(join(root, 'public', 'sw.js'), 'utf8')
const cacheName = 'msxt-blog-' + Date.now().toString(36)

const out = template
  .replace('__PRECACHE_LIST__', JSON.stringify(precache))
  .replace('__CACHE_NAME__', cacheName)

writeFileSync(join(dist, 'sw.js'), out)
console.log(`[gen-sw] 预缓存 ${precache.length} 项 -> dist/sw.js (cache=${cacheName})`)
