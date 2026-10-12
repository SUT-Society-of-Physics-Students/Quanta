import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { readdirSync } from 'node:fs'

function legacyEntries(directory: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const entry of readdirSync(resolve(__dirname, directory), { withFileTypes: true })) {
    if (entry.isDirectory()) Object.assign(result, legacyEntries(`${directory}/${entry.name}`))
    else if (entry.name.endsWith('.html')) {
      const name = `${directory}/${entry.name}`
      result[name] = resolve(__dirname, name)
    }
  }
  return result
}

export default defineConfig({
  // Custom domain quantasc.ir lives at the origin root. GitHub's project URL
  // additionally works because all bundled links/assets use relative paths.
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        'all-news': resolve(__dirname, 'all-news.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        people: resolve(__dirname, 'people.html'),
        ...legacyEntries('circles'),
        ...legacyEntries('news'),
      },
    },
  },
})
