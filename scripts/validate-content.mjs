import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'src/data/articles.ts'), 'utf8')
const re = /path:\s*"([^"]+)"[\s\S]*?slug:\s*"([^"]+)"/g
const declared = new Map()
let match
while ((match = re.exec(source))) declared.set(match[1], match[2])

const contentDir = path.join(root, 'src/content')
const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'))
const missingFiles = [...declared.keys()].filter(file => !files.includes(file))
const unregisteredFiles = files.filter(file => !declared.has(file))
const duplicateSlugs = [...declared.values()].filter((slug, index, all) => all.indexOf(slug) !== index)

if (missingFiles.length || unregisteredFiles.length || duplicateSlugs.length) {
  if (missingFiles.length) console.error('Missing content files:\n- ' + missingFiles.join('\n- '))
  if (unregisteredFiles.length) console.error('Unregistered content files:\n- ' + unregisteredFiles.join('\n- '))
  if (duplicateSlugs.length) console.error('Duplicate slugs:\n- ' + [...new Set(duplicateSlugs)].join('\n- '))
  process.exit(1)
}

console.log(`validate-content: ${files.length} Markdown files match article metadata`)
