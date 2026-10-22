# 🚀 CLIP — Vercel Deployment Guide

The site is 100% deploy-ready: static pages + 2 serverless functions (`/api/config`, `/api/tmdb`).
The TMDB key lives in a **Vercel Environment Variable** — it never reaches the browser.

---

## Option A — From GitHub (recommended)

### 1. Push to GitHub
```bash
cd clip
git init
git add .
git commit -m "CLIP premium streaming site"
git branch -M main
git remote add origin https://github.com/<username>/clip.git
git push -u origin main
```
> `.env` is **never** pushed (excluded in both `.gitignore` and `.vercelignore`).

### 2. Import in Vercel
1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → choose your repo
2. Framework Preset: **Other**
3. Build Command: *(leave empty)*
4. Output Directory: *(leave empty)*
5. Click **Deploy**

### 3. Add the TMDB key
**Project → Settings → Environment Variables**

| Name | Value | Environments |
|---|---|---|
| `TMDB_TOKEN` | `eyJhbGciOi...` (API Read Access Token) | Production, Preview, Development |

*(If you have a v3 key, add it as `TMDB_API_KEY` — either one is enough.)*

### 4. Redeploy
**Deployments → ⋯ → Redeploy** — the key is picked up.
Test: `https://your-app.vercel.app/api/config` → `{"ok":true,"tmdb":true,...}`

---

## Option B — Vercel CLI (no GitHub needed)

```bash
npm i -g vercel
vercel login
vercel                 # preview deploy
vercel env add TMDB_TOKEN production
vercel --prod          # production deploy
```

---

## Verify checklist

| Check | What to look for |
|---|---|
| `https://your-app.vercel.app/` | Home page live, hero + rows |
| `/api/config` | `"tmdb": true` |
| `/api/tmdb?path=/trending/all/day` | Real TMDB JSON |
| `/.env` | **404** (never served) |
| `/server.js` | 404 / not deployed (`.vercelignore`) |
| Browser → DevTools → Network | only `/api/tmdb?path=...` — no `api_key` anywhere |
| Watch page | Vidly player loads |

---

## Runtime

Node.js **24.x** is required (Vercel retired Node 18/20 for new builds).

`package.json` pins it:

```json
"engines": { "node": "24.x" }
```

If Vercel asks again, also set **Project → Settings → General → Node.js Version → 24.x** and Redeploy.

## Project structure

```
clip/
├── index.html          home (hero, platforms, rows, genres)
├── movies.html         movie browse page (genre filter, sort, load more)
├── series.html         series browse page (genre filter, sort, load more)
├── platform.html       platform hub — /platform?p=netflix|prime|disney|hbo|apple|hulu|paramount|peacock
├── detail.html         detail page
├── watch.html          player page (Vidly / Trailer / Custom)
├── mylist.html         My List
├── 404.html            branded not-found
├── api/
│   ├── config.js       /api/config  → booleans only
│   └── tmdb.js         /api/tmdb?path=... → TMDB proxy
├── vercel.json         cleanUrls, headers, function limits
├── .env.example        local dev template
├── .vercelignore       secrets + server.js excluded
├── server.js           local dev server (Vercel does not use it)
└── SETUP.md            local setup + player docs
```

`tmdb.js`, `clip.js`, `settings.js` and `player.js` are reference copies —
each HTML page runs an inlined version, so there are no extra requests.

---

## Custom domain

**Project → Settings → Domains → Add** → `clip.yourdomain.com`
DNS: `CNAME → cname.vercel-dns.com`

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `tmdb: false` | Add the env var and **Redeploy** (old deployments don't pick it up) |
| `TMDB_KEY_MISSING` | `TMDB_TOKEN` is not set — Settings → Environment Variables |
| `401 Invalid API key` | Token is wrong or expired — copy a fresh one from TMDB |
| Player blank | A TMDB id is required — without a key, demo titles use fake ids |
| Images slow | TMDB images come straight from `image.tmdb.org` — this is normal |

---

## Notes

- **Vercel Hobby**: 100 GB bandwidth/month, 10s–60s functions — this setup fits comfortably
- **Edge cache**: TMDB responses are cached for 5 min (`s-maxage=300`) → faster + fewer API calls
- **Key rotation**: update the env var and Redeploy
- Licensing of provider (Vidly) content is your responsibility — check your region's rules
