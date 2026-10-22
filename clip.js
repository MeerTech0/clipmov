/* ============================================================
   CLIP — My List  +  Continue Watching (shared module)
   Depends on: CLIP_STORE, clipToast  (from tmdb.js)
   Storage: localStorage (falls back to in-memory when blocked)
   ============================================================ */

const CLIP_LIST_KEY = 'clip_mylist';
const CLIP_CONT_KEY = 'clip_continue';
const CLIP_CONT_SEEDED = 'clip_continue_seeded';
const CLIP_CONT_MAX = 12;
const CLIP_DONE_PCT = 95;              // progress >= this = finished
const CLIP_WATCHED_KEY = 'clip_watched_v1';   // finished titles (id -> timestamp)

const CLIP_BTN_ADD   = '<svg class="ic"><use href="#i-plus"/></svg>';
const CLIP_BTN_SAVED = '<svg class="ic" style="font-size:13px"><use href="#i-check"/></svg>';

function clipRead(key, def){
  try { const v = CLIP_STORE.get(key); return v ? JSON.parse(v) : def; }
  catch(e){ return def; }
}
function clipWrite(key, val){
  try { CLIP_STORE.set(key, JSON.stringify(val)); } catch(e){}
}
function clipUid(it){ return String(it.type || 'movie') + '_' + String(it.id); }

/* ---------- "finished" store (Continue Watching auto-clean) ---------- */
function clipWatchedMap(){ return clipRead(CLIP_WATCHED_KEY, {}) || {}; }
function clipWatchedKey(id, type){ return clipNormType(type) + '_' + String(id); }
function clipMarkWatched(id, type){
  if(id === undefined || id === null) return;
  const m = clipWatchedMap();
  m[clipWatchedKey(id, type)] = Date.now();
  const keys = Object.keys(m);
  if(keys.length > 200){                       // keep the store small
    keys.sort((a,b) => (m[a]||0) - (m[b]||0)).slice(0, keys.length - 200).forEach(k => delete m[k]);
  }
  clipWrite(CLIP_WATCHED_KEY, m);
}
function clipIsWatched(id, type){
  return !!clipWatchedMap()[clipWatchedKey(id, type)];
}
function clipUnwatch(id, type){
  const m = clipWatchedMap();
  delete m[clipWatchedKey(id, type)];
  clipWrite(CLIP_WATCHED_KEY, m);
}
function clipNormType(t){ return (t === 'tv' || t === 'series') ? 'series' : 'movie'; }
function clipAttr(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;');
}

/* ---------- data-attribute string for any card ---------- */
function clipCardData(m, isTMDB){
  return `data-clip-id="${clipAttr(m.id)}" data-clip-type="${clipAttr(clipNormType(m.type))}" `
       + `data-clip-title="${clipAttr(m.title)}" data-clip-year="${clipAttr(m.year)}" `
       + `data-clip-rating="${clipAttr(m.rating)}" data-clip-img="${clipAttr(m.img)}" `
       + `data-clip-backdrop="${clipAttr(m.backdrop || m.img)}" data-clip-tmdb="${isTMDB ? 1 : 0}"`;
}

/* ============================================================
   MY LIST
   ============================================================ */
const CLIP_MYLIST = {
  all(){
    return clipRead(CLIP_LIST_KEY, []);
  },
  has(id, type){
    const t = clipNormType(type);
    return this.all().some(x => String(x.id) === String(id) && clipNormType(x.type) === t);
  },
  add(item){
    if(!item || item.id === undefined || item.id === null) return false;
    const rec = {
      id: item.id,
      type: clipNormType(item.type),
      title: item.title || 'Untitled',
      year: item.year || '',
      rating: item.rating || 0,
      img: item.img || '',
      backdrop: item.backdrop || item.img || '',
      tmdb: !!item.tmdb,
      added: Date.now()
    };
    const list = this.all().filter(x => clipUid(x) !== clipUid(rec));
    list.unshift(rec);
    clipWrite(CLIP_LIST_KEY, list.slice(0, 150));
    clipSyncListUI();
    return true;
  },
  remove(id, type){
    const before = this.all();
    const t = type ? clipNormType(type) : null;
    const list = before.filter(x => !(String(x.id) === String(id) && (!t || clipNormType(x.type) === t)));
    clipWrite(CLIP_LIST_KEY, list);
    clipSyncListUI();
    return before.length !== list.length;
  },
  toggle(item){
    if(this.has(item.id, item.type)){ this.remove(item.id, item.type); return false; }
    this.add(item); return true;
  },
  clear(){ clipWrite(CLIP_LIST_KEY, []); clipSyncListUI(); },
  count(){ return this.all().length; },
  byType(type){
    const t = clipNormType(type);
    return this.all().filter(x => clipNormType(x.type) === t);
  }
};

/* ============================================================
   CONTINUE WATCHING
   ============================================================ */
const CLIP_CONTINUE = {
  all(){
    return clipRead(CLIP_CONT_KEY, []).sort((a,b) => (b.updated || 0) - (a.updated || 0));
  },
  touch(item, percent, extra){
    if(!item || item.id === undefined || item.id === null) return;
    if(Math.round(Number(percent) || 0) >= CLIP_DONE_PCT){   // finished -> never stays in Continue Watching
      this.complete(item.id, item.type);
      return null;
    }
    const rec = {
      id: item.id,
      type: clipNormType(item.type),
      title: item.title || 'Untitled',
      year: item.year || '',
      rating: item.rating || 0,
      img: item.img || '',
      backdrop: item.backdrop || item.img || '',
      tmdb: !!item.tmdb,
      progress: Math.max(1, Math.min(99, Math.round(Number(percent) || 5))),
      ep: (extra && extra.ep) || null,
      season: (extra && extra.season) || null,
      updated: Date.now()
    };
    const prev = this.all().find(x => clipUid(x) === clipUid(rec));
    if(prev && prev.progress > 90 && rec.progress < 10) rec.progress = 1; // re-watch
    const list = this.all().filter(x => clipUid(x) !== clipUid(rec));
    list.unshift(rec);
    clipWrite(CLIP_CONT_KEY, list.slice(0, CLIP_CONT_MAX));
    clipSyncListUI();
    return rec;
  },
  progress(id, type, percent){
    const pct = Math.round(Number(percent) || 0);
    // 95%+ counts as finished -> drop it from Continue Watching automatically
    if(pct >= CLIP_DONE_PCT){
      const n = this.complete(id, type);
      return n ? 'completed' : false;
    }
    const list = this.all();
    const t = clipNormType(type);
    let hit = false;
    list.forEach(x => {
      if(String(x.id) === String(id) && clipNormType(x.type) === t){
        x.progress = Math.max(1, Math.min(CLIP_DONE_PCT - 1, pct));
        x.updated = Date.now();
        hit = true;
      }
    });
    if(hit) clipWrite(CLIP_CONT_KEY, list);
    return hit ? 'updated' : false;
  },
  /* finished watching -> remove from Continue Watching + remember it */
  complete(id, type, silent){
    const before = this.all();
    const t = type ? clipNormType(type) : null;
    const list = before.filter(x => !(String(x.id) === String(id) && (!t || clipNormType(x.type) === t)));
    const removed = before.length !== list.length;
    if(removed) clipWrite(CLIP_CONT_KEY, list);
    if(removed) clipMarkWatched(id, t || (before.find(x => String(x.id) === String(id)) || {}).type);
    if(removed) clipSyncListUI();
    return removed;
  },
  /* is this title already finished? */
  isWatched(id, type){
    return clipIsWatched(id, type);
  },
  /* finished again? user wants it back in Continue Watching */
  unwatch(id, type){
    clipUnwatch(id, type);
    clipSyncListUI();
  },
  remove(id, type){
    const before = this.all();
    const t = type ? clipNormType(type) : null;
    const list = before.filter(x => !(String(x.id) === String(id) && (!t || clipNormType(x.type) === t)));
    clipWrite(CLIP_CONT_KEY, list);
    clipSyncListUI();
    return before.length !== list.length;
  },
  clear(){ clipWrite(CLIP_CONT_KEY, []); clipSyncListUI(); },
  count(){ return this.all().length; }
};

/* ============================================================
   UI SYNC
   ============================================================ */
function clipSyncListUI(){
  document.querySelectorAll('[data-clip-id]').forEach(card => {
    const saved = CLIP_MYLIST.has(card.dataset.clipId, card.dataset.clipType);
    card.querySelectorAll('.js-list-btn').forEach(btn => {
      btn.classList.toggle('in-list', saved);
      btn.innerHTML = saved ? CLIP_BTN_SAVED : CLIP_BTN_ADD;
      btn.title = saved ? 'Remove from My List' : 'Add to My List';
      btn.setAttribute('aria-label', btn.title);
    });
  });
  const n = CLIP_MYLIST.count();
  document.querySelectorAll('[data-list-count]').forEach(el => { el.textContent = n; });
  document.dispatchEvent(new CustomEvent('clip:list-changed', { detail: { count: n } }));
}

function clipToggleCard(btn, ev){
  if(ev){ ev.preventDefault(); ev.stopPropagation(); }
  const card = btn.closest('[data-clip-id]');
  if(!card) return;
  const item = {
    id: card.dataset.clipId,
    type: card.dataset.clipType,
    title: card.dataset.clipTitle,
    year: card.dataset.clipYear,
    rating: card.dataset.clipRating,
    img: card.dataset.clipImg,
    backdrop: card.dataset.clipBackdrop,
    tmdb: card.dataset.clipTmdb === '1'
  };
  const added = CLIP_MYLIST.toggle(item);
  clipToast(added ? '✓ Added to My List' : 'Removed from My List');
  clipSyncListUI();
}

function clipRemoveContinue(ev, id, type, title){
  if(ev){ ev.preventDefault(); ev.stopPropagation(); }
  CLIP_CONTINUE.remove(id, type);
  clipToast('“' + (title || 'Title') + '” removed from Continue Watching');
  clipSyncListUI();
}

function clipClearContinue(){
  CLIP_CONTINUE.clear();
  clipToast('Continue Watching cleared');
  clipSyncListUI();
}

/* record progress from a watch page */
function clipTrackWatch(item, percent, extra){
  return CLIP_CONTINUE.touch(item, percent, extra);
}

/* optional demo seeding (only when there is no TMDB connection) */
function clipSeedContinueDemo(items){
  if(CLIP_STORE.get(CLIP_CONT_SEEDED)) return false;
  CLIP_STORE.set(CLIP_CONT_SEEDED, '1');
  if(CLIP_CONTINUE.count() > 0) return false;
  const percents = [72, 34, 58];
  (items || []).slice(0, 3).forEach((m, i) => {
    CLIP_CONTINUE.touch({
      id: m.id, type: m.type, title: m.title, year: m.year,
      rating: m.rating, img: m.img, backdrop: m.backdrop, tmdb: false
    }, percents[i] || 25);
  });
  return true;
}

window.CLIP_MYLIST = CLIP_MYLIST;
window.CLIP_CONTINUE = CLIP_CONTINUE;
document.addEventListener('DOMContentLoaded', () => { try{ clipSyncListUI(); }catch(e){} });
