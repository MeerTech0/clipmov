# 🎬 CLIP Premium

Premium movies / series / anime streaming UI — dark + gold, live TMDB data,
Vidly player, My List, Continue Watching and a full appearance settings panel.

## Quick start (local)

```bash
# 1. Add your TMDB token
cp .env.example .env
#    open .env → TMDB_TOKEN=eyJ...  (https://www.themoviedb.org/settings/api)

# 2. Start the server
node server.js        # → http://localhost:8080
```

## Deploy (Vercel)

Static pages + 2 serverless functions. The key lives in an **Environment Variable**.

1. Push to GitHub → [vercel.com/new](https://vercel.com/new) → Import
2. **Settings → Environment Variables** → `TMDB_TOKEN=eyJ...`
3. Redeploy

Full guide: **[DEPLOY.md](DEPLOY.md)** · Local setup + player docs: **[SETUP.md](SETUP.md)** · Run locally: **[RUN-LOCAL.md](RUN-LOCAL.md)**

## Features

| | |
|---|---|
| 🎞️ Home | Shuffleable hero carousel, 9 platform tabs (Netflix/Prime/Disney+…), Trending TV, Top Rated Series, Popular Genres (12 tiles), Top 10 |
| 🎬 Browse | Dedicated **Movies** and **Series** pages — genre chips, sort (popular / rating / newest / A–Z), infinite scroll + Load more, live counts |
| 📺 Platforms | Every platform chip (Netflix, Prime Video, Disney+, HBO Max, Apple TV+, Hulu, Paramount+, Peacock) opens its **own hub page** — real TMDB watch-provider catalog, Movies/Series switch, 19 genres, sort, 9 regions |
| 🔍 Search | Live suggestions dropdown (posters, year, rating, keyboard nav), recent searches, TMDB multi-search |
| 📄 Detail | Backdrop hero, cast, trailers, episodes + **premium season dropdown**, **genre-locked "More Like This"**, "Where to Watch" providers |
| ▶️ Watch | Vidly (movie/series/anime), Trailer, Custom embed · season selector · Up Next · progress tracking |
| ❤️ My List | Add/remove from anywhere, dedicated page, export JSON |
| ⏯️ Continue Watching | Auto progress, **auto-removes finished titles (95%)**, next-episode hand-off, per-title remove, clear all, hides when empty |
| ✨ Brand | CLIP logo chip in navbar → click reveals the slogan splash (`EVERY STORY. ONE CLIP.`) |
| 📱 Mobile | Dedicated phone layout: compact navbar, 2-column grid, swipeable rows, full-width player, full-height settings sheet, safe-area support |
| ⚙️ Settings | 7 themes, 8 accents, corner/text/density, motion, player prefs, data tools |
| 🔒 Security | TMDB key server-side only — never in HTML/JS/URLs |

## Requirements

- **Node.js 24.x** (pinned in `package.json` → `engines`; Vercel requires it for builds)
- A free TMDB key for live data (optional — the site falls back to a demo catalog)

## Tests

```bash
npm i jsdom --no-save      # once
node qa/regression.js      # 42 checks across all pages
node qa/platform_test.js   # 39 checks on the platform hub
python3 qa/syntaxcheck.py  # every inline <script> block parses
```

## Project layout

```
index.html  movies.html  series.html  platform.html  detail.html  watch.html  mylist.html  404.html
api/config.js  api/tmdb.js                        ← Vercel functions
vercel.json  package.json  .env.example  .vercelignore
server.js                                          ← local dev only
tmdb.js  clip.js  settings.js  player.js           ← reference modules (inlined in pages)
tools/make_platform.py                             ← regenerates platform.html from movies.html
qa/regression.js  qa/platform_test.js  qa/syntaxcheck.py
DEPLOY.md  SETUP.md  README.md
```

> Provider (Vidly) content is third-party — check licensing for your region.
