/* ============================================================
   CLIP — Player providers (Vidly / Trailer / Custom)
   Depends on: CLIP_STORE, clipToast (tmdb.js)
   ============================================================ */

const CLIP_ANIME_KEY = 'clip_anime_ids';

function clipQs(obj){
  const p = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k,v]) => {
    if(v !== undefined && v !== null && v !== '') p.set(k, v);
  });
  const s = p.toString();
  return s ? '?' + s : '';
}

/* accent hex used by the external player theme */
function clipAccentHex(){
  const map = {
    gold:'#C9A86A', amber:'#F5A524', crimson:'#E50914', emerald:'#2ECC71',
    sapphire:'#3B82F6', violet:'#8B5CF6', rose:'#F43F5E', cyan:'#06B6D4'
  };
  try{
    const s = JSON.parse(localStorage.getItem('clip_settings_v1') || '{}');
    return map[s.accent] || '#C9A86A';
  }catch(e){ return '#C9A86A'; }
}

function clipAnimeIds(){
  try{ return JSON.parse(CLIP_STORE.get(CLIP_ANIME_KEY) || '{}') || {}; }catch(e){ return {}; }
}
function clipGetAnimeId(key){ return clipAnimeIds()[key] || ''; }
function clipSetAnimeId(key, val){
  const all = clipAnimeIds();
  if(!val) delete all[key]; else all[key] = String(val).trim();
  CLIP_STORE.set(CLIP_ANIME_KEY, JSON.stringify(all));
  return all[key] || '';
}

/* ---------------- providers ---------------- */
const CLIP_PLAYER = {
  vidly: {
    id: 'vidly',
    name: 'Vidly',
    note: 'Movies • Series • Anime',
    build(o){
      const q = clipQs({
        theme: o.theme || 'aurora',
        color: o.color || clipAccentHex(),
        t: o.t || '',
        autoplay: o.autoplay ? 1 : 0,
        nextEpisode: o.next ? 1 : 0,
        audioPicker: o.audioPicker ? 1 : 0
      });
      if(o.kind === 'anime' && o.animeId){
        const scope = o.animeScope === 'mal' ? 'mal/' : '';
        return `https://vidly.pro/anime/${scope}${o.animeId}/${o.episode || 1}/${o.audio || 'sub'}${q}`;
      }
      if(o.kind === 'tv') return `https://vidly.pro/tv/${o.id}/${o.season || 1}/${o.episode || 1}${q}`;
      return `https://vidly.pro/movie/${o.id}${q}`;
    }
  },
  trailer: {
    id: 'trailer',
    name: 'Trailer',
    note: 'YouTube via TMDB',
    build(){ return null; }          // handled by the watch page with the TMDB video key
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    note: 'Your own embed URL',
    build(o){
      let tpl = (window.CLIP_SETTINGS && CLIP_SETTINGS.get('customPlayer')) || '';
      if(!tpl) return null;
      return tpl
        .replace(/\{id\}/g, o.id || '')
        .replace(/\{season\}/g, o.season || 1)
        .replace(/\{episode\}/g, o.episode || 1)
        .replace(/\{anime\}/g, o.animeId || '')
        .replace(/\{audio\}/g, o.audio || 'sub')
        .replace(/\{type\}/g, o.kind || 'movie');
    }
  }
};

/* Resolve which URL to load for a given title */
function clipBuildPlayerUrl(o){
  const srcId = (o.source && CLIP_PLAYER[o.source]) ? o.source : 'vidly';
  if(srcId === 'trailer') return { provider: 'trailer', url: null };
  const provider = CLIP_PLAYER[srcId];
  let url = null;
  try{ url = provider.build(o); }catch(e){ url = null; }
  return { provider: srcId, url };
}

function clipPlayerIframe(url, title){
  return `<iframe src="${url}" title="${String(title || 'CLIP player').replace(/"/g,'')}"
    width="100%" height="100%" frameborder="0" allowfullscreen
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
    referrerpolicy="origin" style="width:100%;height:100%;border:none;background:#000"></iframe>`;
}

window.CLIP_PLAYER = CLIP_PLAYER;
window.clipBuildPlayerUrl = clipBuildPlayerUrl;
window.clipPlayerIframe = clipPlayerIframe;
window.clipAccentHex = clipAccentHex;
window.clipGetAnimeId = clipGetAnimeId;
window.clipSetAnimeId = clipSetAnimeId;
