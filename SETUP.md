# 🔐 CLIP — Secure TMDB Setup

The API key lives **on the server**, never in the browser.

---

## 1. Add your key

Open `.env` and paste your **API Read Access Token**:

```
TMDB_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOi...
```

Using a v3 key (32 characters) instead?

```
TMDB_API_KEY=0123456789abcdef0123456789abcdef
```

> `.env` is never committed (it is in `.gitignore`) and the server never sends it to the browser.

---

## 2. Start

```bash
node server.js
```

You should see:

```
Server    : http://localhost:8080
TMDB      : ✓ connected (server-side, browser never sees the key)
Proxy     : /api/tmdb?path=...  →  https://api.themoviedb.org/3/...
```

---

## 3. Why it is secure

```
Browser  →  /api/tmdb?path=/trending/all/day  →  CLIP server (token from .env)  →  api.themoviedb.org
```

- The **Network tab** only shows `localhost:8080/api/tmdb?path=...`
- The key is not in the URL, HTML, JS or any response
- `GET /api/config` only reports `{ tmdb: true }` — never the key
- `.env` and `server.js` are **blocked** from static requests (404)
- Path traversal is rejected, non-GET methods get `405`

---

## 4. Hosting (Render / Railway / VPS / Fly.io / Vercel)

Set the key as an **environment variable** (you don't need to upload `.env`):

```
TMDB_TOKEN=eyJ...
```

Start command: `node server.js` — the platform provides `PORT` automatically.
On **Vercel** use the included `api/*.js` functions instead — see `DEPLOY.md`.

---

## 5. Rotating the key

Update `.env` → restart the server. That's it. No page changes needed.

---

## 6. No key at all?

The site runs in **demo mode** with sample titles, and users can paste their own key
in the API dialog (saved in localStorage). For the secure setup use `server.js` —
a single dependency-free file.

---

## Endpoints the proxy supports

```
GET /api/tmdb?path=/trending/all/day&language=en-US
GET /api/tmdb?path=/movie/550
GET /api/tmdb?path=/tv/1399/season/1
GET /api/tmdb?path=/search/multi&query=severance
GET /api/config
```

Legacy shape `/api/tmdb/movie/550` also works on the local server.

---

# Player providers

The CLIP player is **pluggable**. The watch page has three tabs: **Vidly · Trailer · Custom**.

| Provider | What it does |
|---|---|
| **Vidly** | Direct embed from a TMDB ID — the provider picks the server and quality |
| **Trailer** | Official YouTube trailer via TMDB |
| **Custom** | Your own embed URL template with `{type} {id} {season} {episode} {anime} {audio}` |

Vidly URL patterns:

```
Movie   /movie/{tmdb_id}
Series  /tv/{tmdb_id}/{season}/{episode}
Anime   /anime/{anilist_id}/{episode}/{sub|dub}
Anime   /anime/mal/{mal_id}/{episode}/{sub|dub}
```

Optional params: `theme=aurora|slate|retro`, `color=#hex`, `t=seconds`,
`autoplay=0|1`, `nextEpisode=0|1`, `audioPicker=0|1`.

**Where do I get an anime ID?** Watch page → sidebar **Details** tab → *Anime provider* box.
Paste an AniList/MAL URL (`https://anilist.co/anime/21`) or just the numeric ID.
It is stored in `localStorage`.

**Settings → Playback** controls:

- Default source (Vidly / Trailer / Custom)
- Player theme, autoplay, next-episode prompt, anime audio (sub / dub)
- Custom embed URL template
- Accent color is inherited automatically from Settings → Appearance

> **Note:** licensing of provider content is your responsibility — check the copyright
> rules of the region where you run the site. CLIP only embeds a third-party iframe.

---

# Navbar: CLIP logo + slogan

The old profile picture (pravatar avatar) has been removed and replaced with a **CLIP monogram button**:

- Gold-ringed **C** mark on the right side of the navbar
- Clicking it opens the **slogan splash**: *EVERY STORY. ONE CLIP.*
- Close it with `✕`, a click on the backdrop, or `Esc`

To change the slogan text, edit the `#sloganWrap` block on each page
(`.slogan-main`, `.slogan-ur`, `.slogan-sub`).

---

# Search suggestions

Typing 2+ letters in `#search` opens a dropdown:

- Top 7 results from TMDB `search/multi` (poster, title, year, rating, Movie/Series chip)
- Matched text highlighted in gold
- `↑` `↓` to navigate · `↵` to open · `Esc` to close · `Ctrl/⌘ + K` to focus search
- **Recent searches** on an empty input (localStorage `clip_recent_search_v1`, max 6)
- "View all" → full grid search
- In demo mode (no key) it filters the local catalog

---

# Mobile layout

Everything is tuned for phones:

- Compact navbar (search + settings + CLIP logo), no overflow
- Hero stacks with a readable title and full-width action buttons
- Two-column poster grid, swipeable rows with scroll snap
- Watch page: edge-to-edge 16:9 player, scrollable source tabs, sidebar below
- Detail page: smaller poster, sticky tabs, horizontal cast strip
- Settings opens as a full-height sheet
- 16px inputs (prevents iOS zoom), safe-area padding, 44px touch targets
- Breakpoints: **900px**, **430px** (plus the existing 1024/720 rules)

---

# Deploy on Vercel

Full guide: **`DEPLOY.md`** (step-by-step).

Short version:

1. `git push` → vercel.com/new → Import
2. Settings → Environment Variables → `TMDB_TOKEN=eyJ...`
3. Redeploy → check `"tmdb": true` at `/api/config`

Vercel does not need `server.js` — the `api/config.js` and `api/tmdb.js` functions replace it.
For local development `node server.js` works exactly as before.


---

# Season selector (premium dropdown)

The native `<select>` was replaced by a custom CLIP dropdown on both the watch page
(sidebar header) and the detail page (Episodes tab):

- Gold pill button showing `Season 2 • 10 Ep` with a rotating chevron
- Glass panel listing every season (`S1`, `S2`, …) with episode counts
- Active season highlighted in gold with a check mark
- Closes on click-outside, `Esc`, or after picking a season
- Mobile: turns into a bottom sheet (`< 640px`)

Markup: `#seasonPick` / `#seasonSelect` · CSS: `.ssel`, `.ssel-menu`, `.ssel-item`

---

# Finished titles leave Continue Watching

A title is marked **finished** at **95%** progress (`CLIP_DONE_PCT`) and is then
removed from Continue Watching automatically.

| Situation | What happens |
|---|---|
| Movie reaches 95% / ends | Removed from Continue Watching, added to the *watched* store |
| Series episode ends, more episodes exist | Continue Watching jumps to the next episode |
| Last episode of a season ends, another season exists | Continue Watching jumps to S(next) E1 |
| Last episode of the last season ends | Series removed from Continue Watching |
| Real `<video>` element (trailer / demo / custom mp4) | Completion detected automatically (`ended` + `timeupdate`) |
| Vidly iframe | A **Mark watched** button sits in the player bar; it also listens for `postMessage` progress/ended events from `vidly.pro` |
| A finished title is opened again | It does **not** jump back into Continue Watching (opening ≠ watching) |
| Real playback of a finished title starts again | It returns to Continue Watching as a re-watch |
| Click **Watched** again | Un-marks it and puts it back at 5% |

Storage:

```
clip_continue      -> active progress records (each has id, type, ep, season, progress)
clip_watched_v1    -> finished titles (max 200, oldest trimmed)
```

Reset from Settings → Data → *Clear Continue Watching* or in the browser console:
`CLIP_CONTINUE.clear()`.


---

# More Like This — genre locked

The recommendations grid on the detail page only shows titles from the **same genre**
as the title you opened.

How it resolves:

1. Reads the genre ids of the current title from TMDB (`genres[]` → ids).
2. Paints instantly with the genres-matched subset of TMDB's `similar` results.
3. Then calls `discover/movie` or `discover/tv` with `with_genres=<id(s)>` + `sort_by=popularity.desc`.
4. Fallback chain when a genre is niche: AND of both genres → primary genre only → vote filter relaxed.
5. Each card shows the genre chip, and the header badge reads e.g. `Drama • 10 titles`.

Demo mode (no TMDB key) filters the local catalog by genre and shows an empty state
if that genre has no other titles — it never shows a random genre.

Implementation: `renderMoreLikeThis(m, similar)` in `detail.html`.


---

# Browse pages — Movies & Series

The navbar tabs now open **dedicated pages** instead of filtering the home grid:

| Page | URL | Content |
|---|---|---|
| Movies | `/movies.html` | `discover/movie` — 19 genre chips, sort, load more |
| Series | `/series.html` | `discover/tv` — same controls, episodic only |

Features:

- **Genre chips** (`All`, Action, Adventure, Animation, Comedy, Crime, Documentary, Drama, Family,
  Fantasy, History, Horror, Music, Mystery, Romance, Sci-Fi, Thriller, War, Western) → `with_genres=`
- **Sort** → Most popular / Top rated / Newest first / Title A–Z
  (Series maps A–Z to `original_name.asc`)
- **Infinite scroll** (IntersectionObserver, 400px pre-load) plus a manual **Load more** button
- Live counters: *Showing*, *Loaded pages*, *Source* (Demo / TMDB Live)
- Navbar search + suggestions work on these pages and filter by page type (movies page → movies,
  series page → series)
- Empty states per genre, error state with Retry, skeleton loaders
- Mobile: 2-column grid, horizontal chip scroller, full-width sort, plus a **bottom tab bar**
  (Home / Movies / Series / My List) shown only under 900px

Cross-links: index *See all* rows → `series.html`, footer links, detail nav buttons,
watch page top bar pills, and the mobile tab bar.

# Platform hub — one page per service

Clicking a platform chip in the home platform bar no longer filters the home grid in place.
It opens a dedicated page:

| Platform | URL | TMDB provider |
|---|---|---|
| Netflix | `/platform?p=netflix` | 8 |
| Prime Video | `/platform?p=prime` | 9 |
| Disney+ | `/platform?p=disney` | 337 |
| HBO Max | `/platform?p=hbo` | 1899 |
| Apple TV+ | `/platform?p=apple` | 350 |
| Hulu | `/platform?p=hulu` | 15 |
| Paramount+ | `/platform?p=paramount` | 531 |
| Peacock | `/platform?p=peacock` | 386 |
| All Platforms | `/platform` | — (no provider filter) |

Requests are plain `discover` calls through the existing proxy:

```
/discover/movie?sort_by=popularity.desc&watch_region=US
  &with_watch_providers=8&with_watch_monetization_types=flatrate&vote_count.gte=30&page=1
```

- **Movies / Series switch** → `discover/movie` or `discover/tv` (genre ids are mapped per type)
- **19 genre chips**, **sort** (popular / top rated / newest / A–Z), **9 regions**
- **Load more** + IntersectionObserver, live counters, skeleton and empty states
- **Platform switcher pills** in the hero change the page without going home
- Provider logo on every card, card click → `detail.html` of the correct type
- Detail page *Where to Watch* chips now link straight into the matching hub (unknown services
  still go to TMDB/JustWatch)
- No TMDB key → per-platform demo catalog (28 titles) so the page never looks broken

`platform.html` is generated: edit `tools/platform_main.html` / `tools/platform_script.js`
(or the CSS in `tools/platform_css.txt`) and run `python3 tools/make_platform.py`.
