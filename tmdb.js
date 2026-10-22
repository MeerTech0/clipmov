// CLIP - TMDB API Helper
// Get your FREE API key from: https://www.themoviedb.org/settings/api
// 1. Create account on TMDB -> Settings -> API -> Request API Key (Developer)
// 2. Copy your "API Read Access Token" (Bearer Token - starts with eyJ...) OR your v3 API Key
// 3. Paste it in the website's API settings (top-right gear icon) - it saves in browser

/* Safe storage (sandboxed iframes / private mode may block localStorage) */
const CLIP_STORE = (function(){
  const mem = {};
  let ok = true;
  try { localStorage.setItem('clip_probe','1'); localStorage.removeItem('clip_probe'); }
  catch(e){ ok = false; }
  return {
    available: ok,
    get(k){ try{ return ok ? (localStorage.getItem(k) || '') : (mem[k] || ''); }catch(e){ return mem[k] || ''; } },
    set(k,v){ try{ if(ok) localStorage.setItem(k,v); else mem[k] = v; }catch(e){ mem[k] = v; } },
    del(k){ try{ if(ok) localStorage.removeItem(k); else delete mem[k]; }catch(e){ delete mem[k]; } }
  };
})();

const TMDB = {
  /* ---- secure server mode: key lives in the server .env, never in the browser ---- */
  serverMode: false,
  _detect: null,
  detect(){
    if(this._detect) return this._detect;
    this._detect = (async () => {
      try{
        if(typeof location === 'undefined' || location.protocol === 'file:') return false;
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 2500);
        const res = await fetch('/api/config', { signal: ctrl.signal, cache: 'no-store' });
        clearTimeout(to);
        if(!res.ok) return false;
        const data = await res.json();
        this.serverMode = !!(data && data.tmdb);
        return this.serverMode;
      }catch(e){ return false; }
    })();
    return this._detect;
  },
  // Default: no key - will show input prompt. User can paste their key which is saved to localStorage
  get token() {
    return CLIP_STORE.get('clip_tmdb_token');
  },
  get apiKey() {
    return CLIP_STORE.get('clip_tmdb_apikey');
  },
  setToken(token) {
    CLIP_STORE.set('clip_tmdb_token', token.trim());
    CLIP_STORE.del('clip_tmdb_apikey');
  },
  setApiKey(key) {
    CLIP_STORE.set('clip_tmdb_apikey', key.trim());
    CLIP_STORE.del('clip_tmdb_token');
  },
  hasKey() {
    return this.serverMode || !!(this.token || this.apiKey);
  },
  // Build URL with either v4 Bearer token or v3 api_key
  buildUrl(path, params = {}) {
    // Server mode: same-origin proxy "/api/tmdb?path=/movie/550" (works on Vercel
    // serverless + local node server). The API key never reaches the browser.
    const url = this.serverMode
      ? new URL('/api/tmdb', location.origin)
      : new URL(`https://api.themoviedb.org/3${path}`);
    if (this.serverMode) url.searchParams.set('path', path);
    if (!this.serverMode && this.apiKey) url.searchParams.set('api_key', this.apiKey);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    return url.toString();
  },
  headers() {
    if (!this.serverMode && this.token) return { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' };
    return { 'Content-Type': 'application/json' };
  },
  async fetch(path, params = {}) {
    if (!this.hasKey()) throw new Error('NO_KEY');
    const url = this.buildUrl(path, params);
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`TMDB ${res.status}: ${err}`);
    }
    return res.json();
  },
  img(path, size = 'w500') {
    if (!path) return 'https://via.placeholder.com/500x750/111113/8A8A90?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  },
  backdrop(path) {
    if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80';
    return `https://image.tmdb.org/t/p/original${path}`;
  },
  // API METHODS
  trending: (time = 'day') => TMDB.fetch(`/trending/all/${time}`),
  trendingTV: (time = 'day') => TMDB.fetch(`/trending/tv/${time}`),
  topRatedTV: (page = 1) => TMDB.fetch('/tv/top_rated', { page }),
  popularMovies: (page = 1) => TMDB.fetch('/movie/popular', { page }),
  popularTV: (page = 1) => TMDB.fetch('/tv/popular', { page }),
  topRatedMovies: (page = 1) => TMDB.fetch('/movie/top_rated', { page }),
  nowPlaying: (page = 1) => TMDB.fetch('/movie/now_playing', { page }),
  upcoming: (page = 1) => TMDB.fetch('/movie/upcoming', { page }),
  discoverMovies: (params = {}) => TMDB.fetch('/discover/movie', params),
  discoverTV: (params = {}) => TMDB.fetch('/discover/tv', params),
  searchMulti: (query, page = 1) => TMDB.fetch('/search/multi', { query, page, include_adult: false }),
  movieDetail: (id) => TMDB.fetch(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }),
  tvDetail: (id) => TMDB.fetch(`/tv/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }),
  movieCredits: (id) => TMDB.fetch(`/movie/${id}/credits`),
  tvCredits: (id) => TMDB.fetch(`/tv/${id}/credits`),
  movieVideos: (id) => TMDB.fetch(`/movie/${id}/videos`),
  tvVideos: (id) => TMDB.fetch(`/tv/${id}/videos`),
  tvSeason: (tvId, season) => TMDB.fetch(`/tv/${tvId}/season/${season}`),
  watchProviders: (id, type = 'movie') => TMDB.fetch(`/${type === 'series' || type === 'tv' ? 'tv' : 'movie'}/${id}/watch/providers`),
  genresMovie: () => TMDB.fetch('/genre/movie/list'),
  genresTV: () => TMDB.fetch('/genre/tv/list'),
};

// Helper to normalize TMDB item to CLIP format
function normalizeItem(item) {
  const isTV = item.media_type === 'tv' || !!item.name;
  return {
    id: item.id,
    tmdbId: item.id,
    type: isTV ? 'series' : 'movie',
    title: item.title || item.name || 'Untitled',
    year: (item.release_date || item.first_air_date || '').slice(0, 4) || '—',
    duration: isTV ? (item.number_of_seasons ? `S${item.number_of_seasons} • ${item.number_of_episodes||'?'} Ep` : 'Series') : (item.runtime ? `${Math.floor(item.runtime/60)}h ${item.runtime%60}m` : '—'),
    rating: Number((Number(item.vote_average) || 0).toFixed(1)),
    votes: Number(item.vote_count) || 0,
    genre_ids: item.genre_ids || [],
    genres: item.genres ? item.genres.map(g=>g.name) : [],
    overview: item.overview || 'No description available.',
    img: TMDB.img(item.poster_path),
    backdrop: TMDB.backdrop(item.backdrop_path),
    popularity: Number(item.popularity) || 0,
    res: item.vote_average >= 7.5 ? '4K HDR' : item.vote_average >= 6 ? 'HD' : 'HD',
    badge: item.vote_average >= 8 ? 'TOP 10' : item.popularity > 100 ? 'TRENDING' : '',
    _raw: item
  };
}

// Toast helper (if page has #toast)
function clipToast(msg, ms=2500){
  let t=document.getElementById('toast');
  if(!t){ t=document.createElement('div'); t.id='toast'; t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#fff;color:#07070A;padding:12px 18px;border-radius:99px;font-weight:800;font-size:13px;z-index:200;box-shadow:0 10px 30px rgba(0,0,0,0.4)'; document.body.appendChild(t); }
  t.textContent=msg; t.style.display='block';
  clearTimeout(t._tm); t._tm=setTimeout(()=>t.style.display='none', ms);
}

// Show API key prompt modal
function showApiKeyPrompt(){
  if(document.getElementById('clip-api-modal')) return;

  /* Secure server mode — the key is on the server, nothing to paste */
  if(TMDB.serverMode){
    const d=document.createElement('div');
    d.id='clip-api-modal';
    d.innerHTML=`
    <div style="position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);display:grid;place-items:center;padding:16px;font-family:Montserrat,sans-serif" onclick="if(event.target===this) this.remove()">
      <div style="background:#0F0F12;border:1px solid rgba(46,204,113,0.35);border-radius:20px;padding:28px;max-width:460px;width:100%;color:#fff">
        <div style="width:44px;height:44px;border-radius:12px;background:rgba(46,204,113,0.15);border:1px solid rgba(46,204,113,0.45);display:grid;place-items:center;color:#2ECC71;font-size:20px;margin-bottom:14px">🔒</div>
        <h2 style="font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:800;letter-spacing:-0.5px">Secure Connection Active</h2>
        <p style="color:#8A8A90;font-size:13px;line-height:1.65;margin:10px 0 16px">
          CLIP talks to TMDB through a <b style="color:#fff">server-side proxy</b>.
          The API key lives in the server's <code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:5px">.env</code> file —
          it never appears in the browser, network tab or page source.
        </p>
        <div style="background:rgba(46,204,113,0.08);border:1px solid rgba(46,204,113,0.25);border-radius:12px;padding:12px 14px;font-size:12.5px;color:rgba(255,255,255,0.78);line-height:1.6">
          <b style="color:#2ECC71">● Server</b> — Connected<br>
          Requests: <code>browser → /api/tmdb/* → server → TMDB</code><br>
          To rotate the key, just update <code>.env</code> and restart the server.
        </div>
        <div style="display:flex;gap:10px;margin-top:18px">
          <button onclick="document.getElementById('clip-api-modal').remove()" style="flex:1;background:linear-gradient(135deg,#C9A86A,#E8C99A);color:#07070A;font-weight:800;padding:12px;border-radius:99px;border:none;cursor:pointer">Got it</button>
          <a href="https://www.themoviedb.org/settings/api" target="_blank" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;font-weight:700;padding:12px 18px;border-radius:99px;text-decoration:none;font-size:13px;display:grid;place-items:center">TMDB</a>
        </div>
      </div>
    </div>`;
    document.body.appendChild(d);
    return;
  }

  const div=document.createElement('div');
  div.id='clip-api-modal';
  div.innerHTML=`
  <div style="position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);display:grid;place-items:center;padding:16px" onclick="if(event.target===this) this.remove()">
    <div style="background:#0F0F12;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;max-width:520px;width:100%;color:#fff;font-family:Montserrat,sans-serif">
      <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#C9A86A,#E8C99A);display:grid;place-items:center;color:#07070A;font-weight:900;font-size:20px;margin-bottom:14px">C</div>
      <h2 style="font-family:Space Grotesk,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.5px">Connect TMDB API</h2>
      <p style="color:#8A8A90;font-size:13px;line-height:1.6;margin:10px 0 16px">Real movies require a free TMDB API key. It is saved only in your browser, never on the server.</p>
      <div style="background:rgba(201,168,106,0.08);border:1px solid rgba(201,168,106,0.2);border-radius:12px;padding:12px 14px;margin-bottom:16px">
        <div style="font-weight:800;font-size:12px;letter-spacing:0.6px;text-transform:uppercase;color:#C9A86A;margin-bottom:6px"><i class="fa-solid fa-circle-info"></i> How to get one (2 min)</div>
        <ol style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7;padding-left:18px">
          <li><a href="https://www.themoviedb.org/signup" target="_blank" style="color:#E8C99A;text-decoration:underline">Create a TMDB account</a></li>
          <li><a href="https://www.themoviedb.org/settings/api" target="_blank" style="color:#E8C99A;text-decoration:underline">Settings → API</a> and open it</li>
          <li><b>API Read Access Token</b> (starts with eyJ...) and copy it</li>
          <li>Paste it below and press Save</li>
        </ol>
      </div>
      <label style="font-size:12px;font-weight:800;letter-spacing:0.6px;text-transform:uppercase;color:rgba(255,255,255,0.7)">Bearer Token (Recommended)</label>
      <input id="clip-token-input" placeholder="eyJhbGciOiJIUzI1NiJ9..." style="width:100%;margin:8px 0 12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:12px 14px;border-radius:12px;font-family:inherit;font-size:13px;outline:none" value="">
      <div style="text-align:center;color:#8A8A90;font-size:12px;margin:6px 0">— or —</div>
      <label style="font-size:12px;font-weight:800;letter-spacing:0.6px;text-transform:uppercase;color:rgba(255,255,255,0.7)">v3 API Key</label>
      <input id="clip-apikey-input" placeholder="32-char API Key..." style="width:100%;margin:8px 0 16px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:12px 14px;border-radius:12px;font-family:inherit;font-size:13px;outline:none">
      <div style="display:flex;gap:10px">
        <button onclick="saveClipApiKey()" style="flex:1;background:linear-gradient(135deg,#C9A86A,#E8C99A);color:#07070A;font-weight:800;padding:12px;border-radius:99px;border:none;cursor:pointer">Save & Load Movies</button>
        <button onclick="document.getElementById('clip-api-modal').remove()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;font-weight:700;padding:12px 18px;border-radius:99px;cursor:pointer">Later</button>
      </div>
      <p style="font-size:11px;color:#8A8A90;text-align:center;margin-top:12px">Your key is saved in localStorage only. <a href="https://developer.themoviedb.org/docs/getting-started" target="_blank" style="color:#E8C99A">Docs</a></p>
    </div>
  </div>`;
  document.body.appendChild(div);
  // preload existing
  setTimeout(()=>{
    const t=document.getElementById('clip-token-input');
    const k=document.getElementById('clip-apikey-input');
    if(TMDB.token) t.value=TMDB.token;
    if(TMDB.apiKey) k.value=TMDB.apiKey;
  },50);
}
function saveClipApiKey(){
  const t=document.getElementById('clip-token-input').value.trim();
  const k=document.getElementById('clip-apikey-input').value.trim();
  if(!t && !k){ clipToast('Please paste a token or API key'); return; }
  if(t) TMDB.setToken(t); else if(k) TMDB.setApiKey(k);
  document.getElementById('clip-api-modal').remove();
  clipToast('✓ API Key saved! Loading real movies...');
  setTimeout(()=>location.reload(), 800);
}
function clearClipApiKey(){
  CLIP_STORE.del('clip_tmdb_token');
  CLIP_STORE.del('clip_tmdb_apikey');
  clipToast('API key removed');
}

/* ============ PROVIDER BRAND MARKS (inline SVG, preview-safe) ============ */
const CLIP_PROVIDER_BRANDS = {
  8:    { name:'Netflix',     mark:`<span class="pmark" style="background:linear-gradient(135deg,#E50914,#7A0009)"><svg width="13" height="13" viewBox="0 0 24 24"><path fill="#fff" d="M4 2h4l7 12.5V2h5v20h-4L9 9.4V22H4z"/></svg></span>` },
  9:    { name:'Prime Video', mark:`<span class="pmark" style="background:#0F171E;border:1px solid rgba(255,255,255,0.08)"><svg width="15" height="15" viewBox="0 0 24 24"><path d="M3.4 14.2c4.4 3.2 9.9 4 15.2 1.7" stroke="#00A8E1" stroke-width="2.3" fill="none" stroke-linecap="round"/><path d="M16.1 15.1l4.3-1.2-.9 4.2z" fill="#00A8E1"/></svg></span>` },
  337:  { name:'Disney+',      mark:`<span class="pmark" style="background:linear-gradient(135deg,#1B3FA8,#07123D);color:#fff;font-size:10px">D+</span>` },
  1899: { name:'HBO Max',     mark:`<span class="pmark" style="background:#000;border:1px solid rgba(255,255,255,0.25);color:#fff;font-size:7.5px">MAX</span>` },
  350:  { name:'Apple TV+',   mark:`<span class="pmark" style="background:#000;border:1px solid rgba(255,255,255,0.2)"><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 12.54c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .9-3.78.9-.78 0-1.98-.88-3.26-.86-1.68.03-3.23.98-4.1 2.48-1.75 3.04-.45 7.54 1.26 10 .83 1.21 1.83 2.57 3.14 2.52 1.26-.05 1.73-.81 3.25-.81 1.51 0 1.94.81 3.26.79 1.35-.03 2.2-1.23 3.03-2.44.95-1.4 1.34-2.76 1.36-2.83-.03-.01-2.6-1-2.63-3.96z"/></svg></span>` },
  15:   { name:'Hulu',         mark:`<span class="pmark" style="background:#1CE783;color:#06131B;font-size:8.5px">hulu</span>` },
  531:  { name:'Paramount+',   mark:`<span class="pmark" style="background:linear-gradient(135deg,#0064FF,#00308F)"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 3l1.9 4.2 4.5.5-3.3 3.1 1 4.5L12 13.1l-4.1 2.2 1-4.5-3.3-3.1 4.5-.5z"/><path d="M3 19.5l3.6-5 2.8 3.3 1.7-2.2 1.9 2.4 2.6-3.4L21 19.5z" opacity=".92"/></svg></span>` },
  386:  { name:'Peacock',      mark:`<span class="pmark" style="background:#000;border:1px solid rgba(255,255,255,0.16)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round"><path d="M12 13L6 8.5" stroke="#F5C518"/><path d="M12 13L9.4 4.6" stroke="#FF7A00"/><path d="M12 13L13.6 3.4" stroke="#E50914"/><path d="M12 13L17.6 4.8" stroke="#8A2BE2"/><path d="M12 13L20.6 9.4" stroke="#00A8E1"/><path d="M12 13L20 16.2" stroke="#1CE783"/></svg></span>` },
};
function clipProviderMark(id, name, logoPath, size='pmark'){
  const b = CLIP_PROVIDER_BRANDS[id];
  if(b) return b.mark.replace('class="pmark"', `class="${size}"`);
  if(logoPath) return `<span class="${size}" style="background:#111"><img src="https://image.tmdb.org/t/p/w92${logoPath}" alt="${name||''}" style="width:100%;height:100%;object-fit:contain"></span>`;
  return `<span class="${size}" style="background:rgba(255,255,255,0.1);color:#fff;font-size:9px;font-weight:800">${(name||'?').slice(0,2).toUpperCase()}</span>`;
}


/* ============ OFFLINE-SAFE POSTER FALLBACK ============ */
function clipPosterFallback(title){
  const t = String(title || 'CLIP').slice(0, 26);
  const initials = t.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const esc = t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#15151A"/><stop offset="0.55" stop-color="#0C0C10"/><stop offset="1" stop-color="#1E1A12"/>
      </linearGradient>
      <radialGradient id="r" cx="0.75" cy="0.18" r="0.8">
        <stop offset="0" stop-color="#C9A86A" stop-opacity="0.35"/><stop offset="1" stop-color="#C9A86A" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="500" height="750" fill="url(#g)"/>
    <rect width="500" height="750" fill="url(#r)"/>
    <g opacity="0.14" stroke="#C9A86A" stroke-width="2" fill="none">
      <circle cx="250" cy="330" r="86"/><circle cx="250" cy="330" r="120"/>
    </g>
    <text x="250" y="352" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="78" font-weight="bold" fill="#C9A86A">${initials}</text>
    <text x="250" y="560" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="bold" fill="#FFFFFF">${esc}</text>
    <text x="250" y="596" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="14" letter-spacing="4" fill="#8A8A90">CLIP PREMIUM</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
