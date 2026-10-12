# Quanta website

Quanta is the Physics Study Circles website of students at Sharif University of Technology. The public site is English and left-to-right, matching its original content and links.

## Local development

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Open the URL Vite prints. For a production check:

```sh
npm run build
npm run test:build
npm run preview
```

The UI is React + Vite + Tailwind 4, with source-owned shadcn/ui primitives under `src/components/ui/`. `src/main.tsx` contains the home page and shared layout. The CSS theme is in `src/index.css`; custom site styles live in `src/site.css`.

## Content and URLs

This is a multi-page Vite build **not a client-only SPA fallback**. The original `.html` routes remain in place as small React entry points, including the exact `circles/Phys&Math/...` paths. Original images and PDFs have moved to `public/images/` and `public/files/`; Vite copies them to the same public URL paths. Existing English article bodies were extracted into `src/content/legacy-pages.json` and displayed inside the shared React layout. The extracted HTML is trusted repository content: review changes to it like changes to source code. Do not inject external/user-provided HTML. Searchable circle links, news and gallery live in `src/content/catalog.json`.

To publish a new news item, add an HTML entry at `news/<slug>.html` modeled on `news/02.html`, add its article body under that key in `src/content/legacy-pages.json` and its summary in `src/content/catalog.json`. Add images to `public/images/`. For a new study circle do the same under `circles/...` and register its link under `circles` in the catalog. No React routing changes are needed: Vite automatically discovers the HTML entry points under those folders. `npm run build` regenerates `public/sitemap.xml` from the content keys.

`src/content/legacy-pages.json` was generated once from the original HTML using `scripts/extract-content.py`; do not run that one-time migration script against the React HTML shells. The original CSS and JavaScript are retained for reference but no longer load in the new site.

## Deployment to GitHub Pages

`.github/workflows/deploy.yml` runs on a push to `main` (or manually) and builds `dist/` with `npm ci`, checks the routes and uploads it via GitHub Pages Actions. `public/CNAME` preserves `quantasc.ir` and Vite's relative `base` allows both the custom domain and the project Pages URL. GitHub Pages **Settings → Pages → Build and deployment → Source** must be switched from **Deploy from a branch** to **GitHub Actions**; only repo administrators can do this. Existing `main` branch assets stay online until the Actions deployment succeeds. Check the custom domain and HTTPS after switching. Do not hand-upload `dist/` to the repo.

Some PDFs and a portrait were already missing in the original repository; do not claim those historical links work until the missing source assets are supplied. `npm run test:build` checks all navigable catalog links and representative PDFs/images, but does not fabricate missing files.
