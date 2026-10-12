import { readFileSync, writeFileSync } from 'node:fs'
const pages = Object.keys(JSON.parse(readFileSync('src/content/legacy-pages.json', 'utf8')))
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...pages].map(path => `  <url><loc>https://quantasc.ir/${path.replaceAll('&', '&amp;')}</loc></url>`).join('\n')}\n</urlset>\n`
writeFileSync('public/sitemap.xml', xml)
console.log(`Generated sitemap for ${pages.length + 1} URLs`)
