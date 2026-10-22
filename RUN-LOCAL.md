# 💻 Run CLIP on your own computer

You only need two things: **Node.js** and a **TMDB key**.

---

## Step 1 — Install Node.js (one time)

1. Open [nodejs.org](https://nodejs.org)
2. Click the big **"LTS"** button (Recommended)
3. Run the installer → Next → Next → Finish
4. **Close and reopen your terminal** (this matters)

Check it:
```bash
node -v      # v24.x recommended (v20+ minimum to run the local server)
```
> Already installed? Skip this step.

---

## Step 2 — Get the project folder

Download the ZIP and extract it, for example to:
```
C:\Users\<you>\Desktop\clip
```
The folder should contain `server.js`, `index.html`, `.env.example` and `start.bat`.

> ⚠️ Don't run the site from inside the ZIP — use **Extract All** first.

---

## Step 3 — Get a free TMDB key (2 minutes)

1. Create an account at [themoviedb.org](https://www.themoviedb.org) and sign in
2. Avatar → **Settings** → **API** in the left menu
3. Click **Create** / **Request an API Key** → choose **Developer**
4. Fill the form (Type: Personal, App: `CLIP`, URL can be blank)
5. Open the **"API Read Access Token"** section
6. Copy that long **`eyJhbGciOi...`** value
   *(a 32-character v3 key also works, but the Bearer token is recommended)*

---

## Step 4 — Add your key

### Windows (easiest — double-click)
1. Double-click **`start.bat`**
2. On first run it creates `.env` and opens Notepad
3. Paste your key after `TMDB_TOKEN=`:
   ```
   TMDB_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOi...
   ```
4. Press **Ctrl+S** → close Notepad → double-click `start.bat` again
5. Your browser opens automatically: **http://localhost:8080** 🎉

### Manual (any OS)
```bash
cd path/to/clip

# create the env file
cp .env.example .env          # Windows CMD: copy .env.example .env

# open it and paste your key
notepad .env                  # Windows
nano .env                     # macOS / Linux

# start the server
node server.js
```

### macOS / Linux shortcut
```bash
chmod +x start.sh
./start.sh
```

---

## Step 5 — Test it

Open **http://localhost:8080**

| Check | How |
|---|---|
| TMDB connected | Top-right status reads **● LIVE • Secure Server** |
| API | `http://localhost:8080/api/config` → `"tmdb": true` |
| Search | Type any movie name and watch the suggestions |
| Player | Open a title → **Watch** → Vidly tab |
| Phone test | On the same Wi-Fi: `http://<PC-IP>:8080` |

**Find your PC IP:** `ipconfig` (Windows) / `ifconfig` (macOS) — the `192.168.x.x` address.

---

## Stopping the server

- In the `start.bat` window press `Ctrl + C`, or just close the window
- Port already in use? Run `PORT=8081 node server.js` (Windows CMD: `set PORT=8081 && node server.js`)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `node` is not recognized | Reopen the terminal after installing Node; restart the PC if needed |
| `● Demo • no TMDB key` | The `.env` file must be named exactly `.env` (not `.env.txt`) |
| Notepad saves `.env.txt` | In the Save dialog set *Save as type* to **All Files**, name it `.env` |
| `401 Invalid API key` | The key was copied incompletely or expired — copy it again, no spaces after `TMDB_TOKEN=` |
| `EADDRINUSE` on port 8080 | Something else is using the port — `set PORT=8081 && node server.js` |
| Player stays blank | Demo titles use fake IDs; open a real title, and make sure your key is set |
| Windows Firewall prompt | Click **Allow access** (private networks only) |
| Page looks outdated | Hard refresh with `Ctrl + F5` |

---

## What you can test

- ✅ Home: hero, platform tabs, rows, genre tiles, Top 10
- ✅ Search with live suggestions, detail page, cast, episodes + season picker
- ✅ Watch: Vidly / Trailer / Custom tabs, season switch, Up Next
- ✅ My List, Continue Watching, saved progress
- ✅ Settings: themes, accents, layout, motion, playback
- ✅ Mobile and tablet layout (resize the window or open it on your phone)

**Zero dependencies** — no `npm install` needed. Just `node server.js`.
