/* ============================================================
   CLIP — Platform hub
   Netflix · Prime Video · Disney+ · HBO Max · Apple TV+ · Hulu ·
   Paramount+ · Peacock — real TMDB catalogs, filtered by the
   watch providers that actually stream them.
   ============================================================ */

const P_PLATS = [
  { id:'all', name:'All Platforms', provider:null, rgb:'201,168,106',
    tagline:'every major streaming service in one shelf',
    mark:'<span class="pmark" style="background:linear-gradient(135deg,#C9A86A,#E8C99A);color:#07070A;font-size:12px;font-weight:900">C</span>' },
  { id:'netflix', name:'Netflix', provider:8, rgb:'229,9,20',
    tagline:'originals, blockbusters and binge-worthy series',
    mark:'<span class="pmark" style="background:linear-gradient(135deg,#E50914,#7A0009)"><svg width="13" height="13" viewBox="0 0 24 24"><path fill="#fff" d="M4 2h4l7 12.5V2h5v20h-4L9 9.4V22H4z"/></svg></span>' },
  { id:'prime', name:'Prime Video', provider:9, rgb:'0,168,225',
    tagline:'Amazon Originals, big movies and live sport',
    mark:'<span class="pmark" style="background:#0F171E;border:1px solid rgba(255,255,255,0.08)"><svg width="15" height="15" viewBox="0 0 24 24"><path d="M3.4 14.2c4.4 3.2 9.9 4 15.2 1.7" stroke="#00A8E1" stroke-width="2.3" fill="none" stroke-linecap="round"/><path d="M16.1 15.1l4.3-1.2-.9 4.2z" fill="#00A8E1"/></svg></span>' },
  { id:'disney', name:'Disney+', provider:337, rgb:'26,63,176',
    tagline:'Marvel, Star Wars, Pixar and National Geographic',
    mark:'<span class="pmark" style="background:linear-gradient(135deg,#1B3FA8,#07123D);color:#fff;font-size:10px">D+</span>' },
  { id:'hbo', name:'HBO Max', provider:1899, rgb:'138,43,226',
    tagline:'prestige drama, DC and the HBO library',
    mark:'<span class="pmark" style="background:#000;border:1px solid rgba(255,255,255,0.25);color:#fff;font-size:7.5px;letter-spacing:0.2px">MAX</span>' },
  { id:'apple', name:'Apple TV+', provider:350, rgb:'154,163,174',
    tagline:'cinematic originals from Apple',
    mark:'<span class="pmark" style="background:#000;border:1px solid rgba(255,255,255,0.2)"><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 12.54c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .9-3.78.9-.78 0-1.98-.88-3.26-.86-1.68.03-3.23.98-4.1 2.48-1.75 3.04-.45 7.54 1.26 10 .83 1.21 1.83 2.57 3.14 2.52 1.26-.05 1.73-.81 3.25-.81 1.51 0 1.94.81 3.26.79 1.35-.03 2.2-1.23 3.03-2.44.95-1.4 1.34-2.76 1.36-2.83-.03-.01-2.6-1-2.63-3.96zM14.55 5.2c.69-.84 1.15-2 1.02-3.16-.99.04-2.19.66-2.9 1.49-.64.74-1.2 1.93-1.05 3.07 1.1.09 2.24-.56 2.93-1.4z"/></svg></span>' },
  { id:'hulu', name:'Hulu', provider:15, rgb:'28,231,131',
    tagline:'next-day TV, FX and Hulu Originals',
    mark:'<span class="pmark" style="background:#1CE783;color:#06131B;font-size:8.5px;letter-spacing:-0.2px">hulu</span>' },
  { id:'paramount', name:'Paramount+', provider:531, rgb:'0,100,255',
    tagline:'Star Trek, Showtime and Paramount classics',
    mark:'<span class="pmark" style="background:linear-gradient(135deg,#0064FF,#00308F)"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 3l1.9 4.2 4.5.5-3.3 3.1 1 4.5L12 13.1l-4.1 2.2 1-4.5-3.3-3.1 4.5-.5z"/><path d="M3 19.5l3.6-5 2.8 3.3 1.7-2.2 1.9 2.4 2.6-3.4L21 19.5z" opacity=".92"/></svg></span>' },
  { id:'peacock', name:'Peacock', provider:386, rgb:'245,197,24',
    tagline:'Universal films, WWE and Peacock Originals',
    mark:'<span class="pmark" style="background:#000;border:1px solid rgba(255,255,255,0.16)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round"><path d="M12 13L6 8.5" stroke="#F5C518"/><path d="M12 13L9.4 4.6" stroke="#FF7A00"/><path d="M12 13L13.6 3.4" stroke="#E50914"/><path d="M12 13L17.6 4.8" stroke="#8A2BE2"/><path d="M12 13L20.6 9.4" stroke="#00A8E1"/><path d="M12 13L20 16.2" stroke="#1CE783"/></svg></span>' }
];

const P_BY = id => P_PLATS.find(p => p.id === id) || P_PLATS[0];

const P_REGIONS = [
  ['US','🇺🇸 United States'], ['PK','🇵🇰 Pakistan'], ['IN','🇮🇳 India'], ['GB','🇬🇧 United Kingdom'],
  ['AE','🇦🇪 UAE'], ['CA','🇨🇦 Canada'], ['AU','🇦🇺 Australia'], ['DE','🇩🇪 Germany'], ['FR','🇫🇷 France']
];

/* movie genre id -> tv genre id (null = not available on TV) */
const P_GENRES = [
  { id:0,     name:'All',       tv:0 },
  { id:28,    name:'Action',    tv:10759 },
  { id:12,    name:'Adventure', tv:10759 },
  { id:16,    name:'Animation', tv:16 },
  { id:35,    name:'Comedy',    tv:35 },
  { id:80,    name:'Crime',     tv:80 },
  { id:99,    name:'Documentary', tv:99 },
  { id:18,    name:'Drama',     tv:18 },
  { id:10751, name:'Family',    tv:10751 },
  { id:14,    name:'Fantasy',   tv:10765 },
  { id:36,    name:'History',   tv:null },
  { id:27,    name:'Horror',    tv:9648 },
  { id:10402, name:'Music',     tv:null },
  { id:9648,  name:'Mystery',   tv:9648 },
  { id:10749, name:'Romance',   tv:10766 },
  { id:878,   name:'Sci-Fi',    tv:10765 },
  { id:53,    name:'Thriller',  tv:9648 },
  { id:10752, name:'War',       tv:10768 },
  { id:37,    name:'Western',   tv:37 }
];

const P_STATE = {
  plat: 'all', type: 'movie', genre: 0, sort: 'popularity.desc',
  region: 'US', page: 0, items: [], total: 0, loading: false, done: true, query: ''
};

/* ---------------- demo catalog (per platform) ---------------- */
const P_MOCK = [
  {id:1, title:'The Night Protocol', year:2025, rating:9.2, type:'movie', genre:'action', platforms:['netflix','prime'], img:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'},
  {id:2, title:'Echoes of Tomorrow', year:2025, rating:8.9, type:'series', genre:'sci-fi', platforms:['disney','apple'], img:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80'},
  {id:3, title:'Midnight Crown', year:2024, rating:8.7, type:'movie', genre:'drama', platforms:['hbo','prime'], img:'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963d?w=500&q=80'},
  {id:4, title:'Shadow Division', year:2025, rating:8.5, type:'movie', genre:'thriller', platforms:['netflix','hulu'], img:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80'},
  {id:5, title:'Lahore Nights', year:2024, rating:9.0, type:'series', genre:'drama', platforms:['prime','peacock'], img:'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80'},
  {id:6, title:'Quantum Heist', year:2025, rating:8.8, type:'movie', genre:'sci-fi', platforms:['paramount','prime'], img:'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=500&q=80'},
  {id:7, title:'The Hollow House', year:2025, rating:7.9, type:'movie', genre:'horror', platforms:['netflix','hbo'], img:'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=500&q=80'},
  {id:8, title:'Monsoon Letters', year:2025, rating:8.6, type:'movie', genre:'romance', platforms:['netflix','prime'], img:'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&q=80'},
  {id:9, title:'Neon District', year:2025, rating:8.7, type:'series', genre:'action', platforms:['netflix','disney','prime'], img:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80'},
  {id:10, title:'Empire of Dust', year:2023, rating:8.5, type:'movie', genre:'drama', platforms:['paramount','prime','apple'], img:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80'},
  {id:11, title:'Silent Frequency', year:2025, rating:8.6, type:'series', genre:'thriller', platforms:['netflix','paramount'], img:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80'},
  {id:12, title:'Orbit Zero', year:2025, rating:8.8, type:'series', genre:'sci-fi', platforms:['apple','peacock'], img:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80'},
  {id:13, title:'Beyond Eternity', year:2025, rating:9.1, type:'movie', genre:'sci-fi', platforms:['disney','hbo','apple'], img:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80'},
  {id:14, title:'Neon Hunter', year:2025, rating:8.9, type:'movie', genre:'sci-fi', platforms:['netflix','hulu','peacock'], img:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80'},
  {id:15, title:'The Last Monsoon', year:2024, rating:8.4, type:'movie', genre:'drama', platforms:['prime','disney'], img:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80'},
  {id:16, title:'Crimson Line', year:2025, rating:8.3, type:'movie', genre:'action', platforms:['hulu','hbo'], img:'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80'},
  {id:17, title:'Sky Pirates', year:2025, rating:8.4, type:'movie', genre:'animation', platforms:['disney','apple'], img:'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80'},
  {id:18, title:'The Paper Kingdom', year:2025, rating:8.7, type:'series', genre:'animation', platforms:['netflix','prime'], img:'https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=500&q=80'},
  {id:19, title:'Weekend Warriors', year:2025, rating:8.1, type:'movie', genre:'comedy', platforms:['netflix','apple'], img:'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=500&q=80'},
  {id:20, title:'Chai, Toast & Chaos', year:2024, rating:8.3, type:'series', genre:'comedy', platforms:['netflix','prime','paramount'], img:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80'},
  {id:21, title:'Whisper in the Dark', year:2024, rating:8.2, type:'series', genre:'horror', platforms:['hulu','netflix'], img:'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=500&q=80'},
  {id:22, title:'Coffee at Midnight', year:2024, rating:8.0, type:'movie', genre:'romance', platforms:['apple','disney'], img:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'},
  {id:23, title:'Vault of Kings', year:2025, rating:8.6, type:'movie', genre:'adventure', platforms:['disney','paramount','peacock'], img:'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&q=80'},
  {id:24, title:'The Quiet Ward', year:2024, rating:8.2, type:'series', genre:'mystery', platforms:['hbo','hulu'], img:'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80'},
  {id:25, title:'Iron Harvest', year:2023, rating:8.4, type:'movie', genre:'war', platforms:['paramount','hbo'], img:'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=500&q=80'},
  {id:26, title:'Frontier Gold', year:2024, rating:8.0, type:'movie', genre:'western', platforms:['peacock','prime'], img:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80'},
  {id:27, title:'Deep Blue Vault', year:2025, rating:8.5, type:'series', genre:'documentary', platforms:['disney','apple','peacock'], img:'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80'},
  {id:28, title:'Family Rules', year:2024, rating:8.1, type:'series', genre:'family', platforms:['disney','netflix'], img:'https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=500&q=80'}
];

const pEl = id => document.getElementById(id);
const pEsc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function pGenreChip(){ return P_GENRES.find(g => g.id === P_STATE.genre) || P_GENRES[0]; }
function pGenreId(){
  const g = pGenreChip();
  if(!g.id) return 0;
  return P_STATE.type === 'tv' ? (g.tv || 0) : g.id;
}
function pSortValue(){
  if(P_STATE.sort === 'title.asc')   return P_STATE.type === 'tv' ? 'name.asc' : 'title.asc';
  if(P_STATE.sort === 'newest')      return P_STATE.type === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc';
  return P_STATE.sort;
}

/* ---------------- hero + controls ---------------- */
function pHero(){
  const p = P_BY(P_STATE.plat);
  document.title = 'CLIP — ' + p.name;
  const hero = pEl('platHero');
  if(hero){ hero.style.setProperty('--pa-rgb', p.rgb); }
  const logo = pEl('platLogo');
  if(logo) logo.innerHTML = p.mark;
  const ttl = pEl('platTitle');
  if(ttl){
    const words = p.name.replace(/\s+/g,' ').trim().toUpperCase().split(' ');
    ttl.innerHTML = words.length > 1
      ? words.slice(0,-1).join(' ') + ' <em>' + words[words.length-1] + '</em>'
      : '<em>' + words[0] + '</em>';
  }
  const sub = pEl('platSub');
  if(sub){
    const where = (P_REGIONS.find(r => r[0] === P_STATE.region) || P_REGIONS[0])[1].replace(/^\S+\s/, '');
    sub.textContent = p.id === 'all'
      ? 'Everything streaming right now across ' + (P_PLATS.length - 1) + ' major services — filter by genre, sort it your way and press play.'
      : 'Everything streaming on ' + p.name + ' in ' + where + ' — ' + p.tagline + '.';
  }
  const kick = pEl('platKicker');
  if(kick) kick.textContent = p.id === 'all' ? 'All platforms' : 'Platform hub';
  const tags = pEl('platTags');
  if(tags){
    tags.innerHTML =
      '<span class="plat-tag">' + (p.id === 'all' ? '8 services' : 'Provider #' + p.provider) + '</span>' +
      '<span class="plat-tag">' + P_STATE.region + '</span>' +
      '<span class="plat-tag" id="platLiveTag">Checking TMDB…</span>';
  }
  const note = pEl('platRegionNote');
  if(note) note.textContent = P_STATE.region;
}

function pRenderSwitch(){
  const box = pEl('platSwitch');
  if(!box) return;
  box.innerHTML = P_PLATS.map(p => '<button class="psw ' + (p.id === P_STATE.plat ? 'on' : '') + '" onclick="platPick(\'' + p.id + '\')" title="' + pEsc(p.name) + '">' +
    p.mark + '<span>' + pEsc(p.name.replace('Prime Video','Prime').replace('Apple TV+','Apple TV')) + '</span></button>').join('');
}

function pRenderTabs(){
  const box = pEl('ptypeTabs');
  if(!box) return;
  box.querySelectorAll('.ptype-btn').forEach(b => {
    const on = b.getAttribute('data-type') === P_STATE.type;
    b.classList.toggle('on', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  const sel = pEl('pSort');
  if(sel) sel.value = P_STATE.sort;
}

function pRenderRegions(){
  const sel = pEl('pRegion');
  if(!sel) return;
  sel.innerHTML = P_REGIONS.map(r => '<option value="' + r[0] + '"' + (r[0] === P_STATE.region ? ' selected' : '') + '>' + r[1] + '</option>').join('');
}

function pRenderChips(){
  const box = pEl('genreChips');
  if(!box) return;
  const list = P_GENRES.filter(g => g.id === 0 || P_STATE.type !== 'tv' || g.tv);
  box.innerHTML = list.map(g => '<button class="gchip ' + (g.id === P_STATE.genre ? 'on' : '') + '" onclick="platGenre(' + g.id + ')">' + g.name + '</button>').join('');
}

function pSkeletons(n){
  return Array.from({ length: n || 12 }).map(() => '<div class="skeleton browse-skel"></div>').join('');
}

function pStatus(html){ const el = pEl('browseLine'); if(el) el.innerHTML = html; }
function pRefreshCount(){
  const c = pEl('browseCount'), pg = pEl('browsePages');
  if(c) c.textContent = P_STATE.items.length || '0';
  if(pg) pg.textContent = String(P_STATE.page || 0);
}

function pCard(m){
  const t = m.type === 'series' ? 'series' : 'movie';
  const link = 'detail.html?id=' + m.id + '&type=' + t + (m.tmdb ? '&tmdb=1' : '');
  const safeTitle = String(m.title || '').replace(/'/g, '');
  const plat = P_BY(P_STATE.plat);
  const showProv = plat.id !== 'all';
  return `<div class="card" ${typeof clipCardData === 'function' ? clipCardData(m, !!m.tmdb) : ''} onclick="location.href='${link}'">
    <div class="card-thumb">
      <img src="${m.img}" loading="lazy" alt="${safeTitle}" onerror="this.onerror=null;this.src=clipPosterFallback('${safeTitle}')">
      <div class="card-top-badges">
        ${m.rating ? `<span class="mini-badge" style="background:rgba(0,0,0,0.7);color:#F5C518"><svg class='ic' style='font-size:9px;color:#F5C518'><use href='#i-star'/></svg> ${m.rating}</span>` : ''}
        ${m.badge ? `<span class="mini-badge ${m.badge === 'TOP 10' ? 'red' : m.badge === 'NEW' ? '' : 'gold'}">${m.badge}</span>` : ''}
      </div>
      ${showProv ? `<div class="card-prov" title="${pEsc(plat.name)}">${plat.mark.replace('class="pmark"', 'class="pmark sm"')}</div>` : ''}
      <div class="card-overlay">
        <button class="overlay-btn play"><svg class="ic"><use href="#i-play"/></svg></button>
        <button class="overlay-btn plus js-list-btn" onclick="clipToggleCard(this,event)" title="Add to My List"><svg class="ic"><use href="#i-plus"/></svg></button>
      </div>
    </div>
    <div class="card-body">
      <div class="card-title">${m.title}</div>
      <div class="card-meta">
        <span>${m.year || '—'}</span><span class="dot" style="background:rgba(255,255,255,0.2)"></span>
        <span>${t === 'series' ? 'Series' : 'Movie'}</span>
        <span class="card-rating" style="margin-left:auto"><svg class="ic" style="font-size:10px"><use href="#i-star"/></svg> ${m.rating || '—'}</span>
      </div>
      <div class="card-genre">${(m.genres && m.genres[0] ? m.genres[0] : (t === 'series' ? 'SERIES' : 'MOVIE')).toString().toUpperCase()}</div>
    </div>
  </div>`;
}

function pNormalize(raw){
  const n = (typeof normalizeItem === 'function') ? normalizeItem(raw) : null;
  if(n) return Object.assign(n, { tmdb: true, badge: n.rating >= 8.4 ? 'TOP 10' : (n.votes > 5000 ? 'TRENDING' : '') });
  return raw;
}

/* ---------------- data ---------------- */
async function pLoad(reset){
  if(P_STATE.loading) return;
  if(!reset && P_STATE.done) return;
  P_STATE.loading = true;

  const grid = pEl('browseGrid');
  if(reset){
    P_STATE.page = 0; P_STATE.items = []; P_STATE.done = false;
    if(grid) grid.innerHTML = pSkeletons(12);
  }
  const btn = pEl('loadMoreBtn');
  if(btn){ btn.disabled = true; btn.innerHTML = 'Loading…'; }

  await TMDB.detect();
  const live = TMDB.hasKey();
  const plat = P_BY(P_STATE.plat);
  const isTV = P_STATE.type === 'tv';
  const gid = pGenreId();
  const gChip = pGenreChip();

  const liveTag = pEl('platLiveTag');
  if(liveTag){
    liveTag.className = 'plat-tag ' + (live ? 'live' : 'demo');
    liveTag.textContent = live ? 'TMDB live' : 'Demo catalog';
  }

  if(!live){                                     /* ---------- demo ---------- */
    const slug = gChip.id ? gChip.name.toLowerCase().replace('sci-fi','sci-fi') : '';
    let list = P_MOCK.filter(x => (plat.id === 'all' || (x.platforms || []).includes(plat.id)));
    list = list.filter(x => x.type === (isTV ? 'series' : 'movie'));
    if(slug) list = list.filter(x => x.genre === slug || (slug === 'science fiction' && x.genre === 'sci-fi'));
    if(P_STATE.sort === 'vote_average.desc') list = list.slice().sort((a,b) => b.rating - a.rating);
    else if(P_STATE.sort === 'title.asc') list = list.slice().sort((a,b) => String(a.title).localeCompare(String(b.title)));
    else if(P_STATE.sort === 'newest') list = list.slice().sort((a,b) => (b.year||0) - (a.year||0));
    else list = list.slice().sort((a,b) => b.rating - a.rating);

    P_STATE.items = list.map(x => ({
      id:x.id, type:x.type, title:x.title, year:x.year, rating:x.rating,
      img:x.img, tmdb:false, genres:[x.genre], badge:x.rating >= 8.8 ? 'TOP 10' : ''
    }));
    P_STATE.total = P_STATE.items.length;
    P_STATE.page = 1;
    P_STATE.done = true;
    pPaint(true);
    P_STATE.loading = false;
    const src = pEl('browseSource');
    if(src){ src.textContent = 'Demo'; src.style.color = '#F5C518'; }
    if(btn){ btn.disabled = false; btn.innerHTML = '<svg class="ic" style="font-size:12px"><use href="#i-plus"/></svg> Load more'; }
    return;
  }

  /* ---------- live TMDB ---------- */
  const params = {
    page: (P_STATE.page || 0) + 1,
    sort_by: pSortValue(),
    include_adult: false,
    language: 'en-US',
    'vote_count.gte': 30
  };
  if(plat.provider){
    params.watch_region = P_STATE.region;
    params.with_watch_providers = String(plat.provider);
    params.with_watch_monetization_types = 'flatrate';
  }
  if(gid) params.with_genres = String(gid);
  if(P_STATE.sort === 'newest'){
    const d = new Date(); d.setMonth(d.getMonth() - 3);
    params[isTV ? 'first_air_date.gte' : 'primary_release_date.gte'] = d.toISOString().slice(0, 10);
    params['vote_count.gte'] = 5;
  }

  try{
    const res = isTV ? await TMDB.discoverTV(params) : await TMDB.discoverMovies(params);
    const items = (res.results || []).map(pNormalize);
    P_STATE.page = (P_STATE.page || 0) + 1;
    P_STATE.total = res.total_results || items.length;
    P_STATE.done = P_STATE.page >= Math.min(res.total_pages || 1, 20) || !items.length;
    P_STATE.items = reset ? items : P_STATE.items.concat(items);
    pPaint(reset);
    const src = pEl('browseSource');
    if(src){ src.textContent = 'TMDB Live'; src.style.color = '#2ECC71'; }
    const st = pEl('apiStatus');
    if(st) st.textContent = '● LIVE • SECURE';
  } catch(e){
    console.error(e);
    if(!P_STATE.items.length){
      if(grid) grid.innerHTML = `<div class="browse-empty">
        <b>Could not load ${pEsc(plat.name)}</b>
        <p>${pEsc(String(e.message || 'Network error'))} — check your TMDB key or try again.</p>
        <button onclick="pLoad(true)">Retry</button></div>`;
      pStatus('Error');
    }
  } finally {
    P_STATE.loading = false;
    if(btn){ btn.disabled = false; btn.innerHTML = '<svg class="ic" style="font-size:12px"><use href="#i-plus"/></svg> Load more'; }
    pRefreshCount();
  }
}

function pPaint(reset){
  const grid = pEl('browseGrid');
  const more = pEl('browseMore');
  if(!grid) return;
  const plat = P_BY(P_STATE.plat);
  const isTV = P_STATE.type === 'tv';
  const gName = pGenreChip().name;

  if(!P_STATE.items.length){
    grid.innerHTML = `<div class="browse-empty">
      <b>Nothing in “${pEsc(gName)}” on ${pEsc(plat.name)} right now</b>
      <p>${P_STATE.genre ? 'Try another genre, or pick “All” to see everything.' : 'Try another region from the dropdown — catalogs differ by country.'}</p>
      ${P_STATE.genre ? '<button onclick="platGenre(0)">Show all</button>' : '<button onclick="pLoad(true)">Refresh</button>'}</div>`;
    if(more) more.style.display = 'none';
    pStatus('<b>0</b> ' + (isTV ? 'series' : 'movies'));
    pRefreshCount();
    return;
  }

  grid.innerHTML = P_STATE.items.map(pCard).join('');
  if(more) more.style.display = P_STATE.done ? 'none' : 'flex';
  pStatus('<b>' + P_STATE.items.length + '</b> of ' + (P_STATE.total || P_STATE.items.length) + ' ' +
    (isTV ? 'series' : 'movies') + ' on ' + pEsc(plat.name) + (P_STATE.genre ? ' • ' + pEsc(gName) : ''));
  const hint = pEl('browseHint');
  if(hint) hint.innerHTML = P_STATE.region + ' · ' + (plat.provider ? 'subscription (flatrate)' : 'all rights');
  pRefreshCount();
  try{ clipSyncListUI(); }catch(e){}
  if(reset){ try{ const root = pEl('browseRoot'); if(root && root.scrollIntoView) root.scrollIntoView({ behavior:'smooth', block:'start' }); }catch(e){} }
}

/* ---------------- controls ---------------- */
function pSyncUrl(){
  try{
    const q = 'platform.html?p=' + encodeURIComponent(P_STATE.plat) + (P_STATE.type === 'tv' ? '&type=series' : '');
    history.replaceState(null, '', q);
  }catch(e){}
}

function platPick(id){
  const p = P_BY(id);
  if(p.id === P_STATE.plat){ return; }
  P_STATE.plat = p.id;
  P_STATE.genre = 0;
  pHero(); pRenderSwitch(); pRenderChips(); pSyncUrl();
  pLoad(true);
  try{ window.scrollTo({ top:0, behavior:'smooth' }); }catch(e){}
}

function platType(t){
  if(t !== 'movie' && t !== 'tv') return;
  if(P_STATE.type === t) return;
  P_STATE.type = t;
  const max = P_STATE.type === 'tv' ? 9648 : 0;
  if(P_GENRES.find(g => g.id === P_STATE.genre && (g.id === 0 || P_STATE.type !== 'tv' || g.tv))){ /* keep */ }
  else P_STATE.genre = 0;
  pRenderTabs(); pRenderChips(); pSyncUrl();
  if(P_STATE.query){ pSearch(); return; }
  pLoad(true);
}

function platGenre(id){
  if(P_STATE.genre === id) return;
  P_STATE.genre = id;
  pRenderChips();
  if(P_STATE.query){ pSearch(); return; }
  pLoad(true);
}

function platSort(v){
  P_STATE.sort = v;
  if(P_STATE.query){ pSearch(); return; }
  pLoad(true);
}

function platRegion(r){
  P_STATE.region = r;
  try{ if(typeof CLIP_STORE !== 'undefined') CLIP_STORE.set('clip_region', r); }catch(e){}
  pHero();
  const note = pEl('platRegionNote'); if(note) note.textContent = r;
  pLoad(true);
}

function platNextPage(){ if(P_STATE.done || P_STATE.loading) return; pLoad(false); }

let _pObs = null;
function pInitInfinite(){
  const more = pEl('browseMore');
  if(!more || !('IntersectionObserver' in window)) return;
  _pObs = new IntersectionObserver(es => { if(es.some(e => e.isIntersecting)) platNextPage(); }, { rootMargin:'400px' });
  _pObs.observe(more);
}

/* ---------------- search (navbar) ---------------- */
const P_SUGG_KEY = 'clip_recent_search_v1';
let _pTimer = null, _pSeq = 0, _pSugg = [], _pSel = -1;

function pSuggPanel(){ return pEl('suggPanel'); }
function pSuggShow(){ const p = pSuggPanel(); if(p) p.classList.add('show'); }
function pSuggHide(){ const p = pSuggPanel(); if(p) p.classList.remove('show'); _pSel = -1; }
function pMarkText(t, q){
  const safe = pEsc(t), n = String(q || '').toLowerCase();
  if(!n) return safe;
  const i = safe.toLowerCase().indexOf(n);
  if(i < 0) return safe;
  return safe.slice(0, i) + '<mark>' + safe.slice(i, i + n.length) + '</mark>' + safe.slice(i + n.length);
}
function pRecGet(){ try{ const a = JSON.parse(localStorage.getItem(P_SUGG_KEY) || '[]'); return Array.isArray(a) ? a.slice(0, 6) : []; }catch(e){ return []; } }
function pRecAdd(q){
  q = String(q || '').trim(); if(q.length < 2) return;
  const l = pRecGet().filter(x => x.toLowerCase() !== q.toLowerCase()); l.unshift(q);
  try{ localStorage.setItem(P_SUGG_KEY, JSON.stringify(l.slice(0, 6))); }catch(e){}
}

function queueSearch(){ clearTimeout(_pTimer); _pTimer = setTimeout(pSearch, 420); }

async function pSearch(){
  const inp = pEl('search');
  const q = inp ? inp.value.trim() : '';
  P_STATE.query = q;
  if(!q){ pLoad(true); return; }
  pSuggHide();

  const grid = pEl('browseGrid');
  const plat = P_BY(P_STATE.plat);
  const isTV = P_STATE.type === 'tv';
  if(grid) grid.innerHTML = pSkeletons(10);
  pStatus('Searching “' + pEsc(q) + '”…');

  await TMDB.detect();
  if(!TMDB.hasKey()){
    const list = P_MOCK.filter(x => x.type === (isTV ? 'series' : 'movie') && x.title.toLowerCase().includes(q.toLowerCase()))
      .map(x => ({ id:x.id, type:x.type, title:x.title, year:x.year, rating:x.rating, img:x.img, tmdb:false, genres:[x.genre] }));
    P_STATE.items = list; P_STATE.total = list.length; P_STATE.page = 1; P_STATE.done = true;
    pPaint(false);
    pStatus('<b>' + list.length + '</b> result' + (list.length === 1 ? '' : 's') + ' for “' + pEsc(q) + '” · demo catalog');
    return;
  }

  try{
    const res = await TMDB.searchMulti(q);
    const want = isTV ? 'tv' : 'movie';
    const items = (res.results || []).filter(r => r.media_type === want).map(pNormalize);
    P_STATE.items = items; P_STATE.total = items.length; P_STATE.page = 1; P_STATE.done = true;
    pPaint(false);
    pStatus('<b>' + items.length + '</b> result' + (items.length === 1 ? '' : 's') + ' for “' + pEsc(q) + '” · all platforms');
    const hint = pEl('browseHint');
    if(hint) hint.textContent = 'searched across every platform';
  }catch(e){
    pStatus('Search failed: ' + pEsc(e.message || 'error'));
    if(grid) grid.innerHTML = '<div class="browse-empty"><b>Search failed</b><p>' + pEsc(e.message || '') + '</p><button onclick="pSearch()">Retry</button></div>';
    return;
  }
}

function clearSearch(){
  const inp = pEl('search');
  if(inp) inp.value = '';
  const wrap = document.querySelector('.search-wrap'); if(wrap) wrap.classList.remove('has-q');
  P_STATE.query = '';
  pSuggHide();
  pLoad(true);
}

function pSuggRecent(){
  const p = pSuggPanel(); if(!p) return;
  const rec = pRecGet();
  if(!rec.length){
    p.innerHTML = '<div class="sugg-head"><span>Search CLIP</span></div><div class="sugg-empty">Type at least <b>2 letters</b> for live suggestions.</div>';
  } else {
    p.innerHTML = '<div class="sugg-head"><span>Recent searches</span></div><div class="sugg-list">' +
      rec.map(q => '<div class="sugg-item" onclick="pUseRecent(this.dataset.q)" data-q="' + pEsc(q) + '">' +
        '<div class="sugg-thumb ph"><svg class="ic" style="font-size:13px"><use href="#i-search"/></svg></div>' +
        '<div class="sugg-info"><div class="sugg-t">' + pEsc(q) + '</div><div class="sugg-m">recent search</div></div></div>').join('') +
      '</div>';
  }
  pSuggShow();
}

function pUseRecent(q){
  const inp = pEl('search'); if(!inp) return;
  inp.value = q; pSuggHide(); pSearch();
}

function suggFocus(){
  const inp = pEl('search'); if(!inp) return;
  if(!inp.value.trim()) pSuggRecent();
}

function suggInput(){
  const inp = pEl('search'); if(!inp) return;
  const q = inp.value.trim();
  const wrap = document.querySelector('.search-wrap');
  if(wrap) wrap.classList.toggle('has-q', !!q);
  clearTimeout(_pTimer);
  _pTimer = setTimeout(pSearch, 420);
  if(q.length < 2){ if(!q.length) pSuggRecent(); else pSuggHide(); return; }
  pSuggFetch(q);
}

async function pSuggFetch(q){
  const seq = ++_pSeq;
  const p = pSuggPanel(); if(!p) return;
  p.innerHTML = '<div class="sugg-head"><span>Searching “' + pEsc(q) + '”</span></div><div class="sugg-load"><span class="sugg-spin"></span> Fetching results from TMDB…</div>';
  pSuggShow();

  await TMDB.detect();
  const isTV = P_STATE.type === 'tv';
  const want = isTV ? 'tv' : 'movie';
  let raw = [];
  if(TMDB.hasKey()){
    try{
      const res = await TMDB.searchMulti(q);
      raw = (res.results || []).filter(r => r.media_type === want).slice(0, 7);
    }catch(e){ raw = []; }
  } else {
    raw = P_MOCK.filter(x => x.type === (isTV ? 'series' : 'movie') && x.title.toLowerCase().includes(q.toLowerCase())).slice(0, 7);
  }
  if(seq !== _pSeq) return;
  _pSugg = raw;

  if(!raw.length){
    p.innerHTML = '<div class="sugg-head"><span>Suggestions</span></div><div class="sugg-empty"><b>No results</b>Nothing for “' + pEsc(q) + '”. Press Enter to search again.</div>';
    pSuggShow(); return;
  }
  p.innerHTML = '<div class="sugg-head"><span>Top results</span></div><div class="sugg-list">' +
    raw.map((x, i) => {
      const title = x.title || x.name || 'Untitled';
      const year = String(x.release_date || x.first_air_date || x.year || '').slice(0, 4);
      const rating = Number(x.vote_average || x.rating || 0);
      const path = x.poster_path || x.img || '';
      const src = path ? (String(path).startsWith('http') ? path : 'https://image.tmdb.org/t/p/w92' + path) : '';
      return '<div class="sugg-item" data-i="' + i + '" onclick="suggPick(' + i + ')">' +
        (src ? '<img class="sugg-thumb" src="' + pEsc(src) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">'
             : '<div class="sugg-thumb ph"></div>') +
        '<div class="sugg-info"><div class="sugg-t">' + pMarkText(title, q) + '</div><div class="sugg-m">' +
        '<span class="sugg-chip ' + (isTV ? 'tv' : '') + '">' + (isTV ? 'Series' : 'Movie') + '</span>' + (year ? '<span>' + year + '</span>' : '') +
        (rating ? '<span class="sugg-star"><svg class="ic" style="font-size:9px"><use href="#i-star"/></svg>' + rating.toFixed(1) + '</span>' : '') +
        '</div></div><svg class="ic sugg-go" style="font-size:11px"><use href="#i-chevR"/></svg></div>';
    }).join('') + '</div>';
  pSuggShow();
}

function suggPick(i){
  const x = _pSugg[i]; if(!x) return;
  pRecAdd((pEl('search') || {}).value || (x.title || x.name || ''));
  const t = (x.media_type === 'tv' || x.type === 'series' || x.name) ? 'series' : 'movie';
  location.href = 'detail.html?id=' + x.id + '&type=' + t + (TMDB.hasKey() ? '&tmdb=1' : '');
}

function suggKey(ev){
  if(ev.key === 'Escape'){ pSuggHide(); if(ev.target) ev.target.blur(); return; }
  if(ev.key === 'Enter'){
    const q = (ev.target && ev.target.value || '').trim();
    if(q){ ev.preventDefault(); pRecAdd(q); pSuggHide(); pSearch(); }
  }
}

document.addEventListener('click', e => {
  if(!(e.target && e.target.closest && e.target.closest('.search-wrap'))) pSuggHide();
});

/* ---------------- boot ---------------- */
function pBoot(){
  const qs = new URLSearchParams(location.search);
  const pid = qs.get('p') || qs.get('platform') || 'all';
  P_STATE.plat = P_BY(pid).id;
  const t = qs.get('type') || qs.get('t');
  if(t === 'tv' || t === 'series') P_STATE.type = 'tv';
  try{
    const saved = (typeof CLIP_STORE !== 'undefined' && CLIP_STORE.get('clip_region')) || '';
    if(saved && P_REGIONS.some(r => r[0] === saved)) P_STATE.region = saved;
  }catch(e){}

  pHero();
  pRenderSwitch();
  pRenderTabs();
  pRenderRegions();
  pRenderChips();
  pLoad(true);
  pInitInfinite();
}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pBoot);
else pBoot();
