import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const pages = JSON.parse(readFileSync('src/content/legacy-pages.json', 'utf8'))
const catalog = JSON.parse(readFileSync('src/content/catalog.json', 'utf8'))
const output = 'dist'
const check = (path) => { if (!existsSync(join(output, path))) throw new Error(`Missing built file: ${path}`) }
for (const path of Object.keys(pages)) check(path)
for (const path of ['CNAME', 'sitemap.xml', 'images/quanta-logo.png', 'images/gallery/1.jpg', 'files/hp5-paper.pdf']) check(path)
for (const category of catalog.circles) for (const item of category.items) check(item.href)
for (const item of catalog.news) { check(item.href); check(item.image) }
for (const item of catalog.gallery) check(item.src)
for (const entry of ['index.html', 'circles/Phys&Math/intro-quantum.html', 'news/01.html']) {
  const text = readFileSync(join(output, entry), 'utf8')
  if (!text.includes('type="module"') || !text.includes('src="')) throw new Error(`Missing Vite bundle in ${entry}`)
}
console.log(`Verified ${Object.keys(pages).length} routes, catalog links, CNAME, PDFs and images`)
