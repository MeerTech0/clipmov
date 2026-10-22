/* ============================================================
   CLIP — Vercel Serverless: TMDB proxy
   Route: /api/tmdb?path=/movie/550&language=en
   The API key lives in Vercel Environment Variables and is
   never sent to the browser.
   ============================================================ */

const TMDB_BASE = 'https://api.themoviedb.org/3';

function env(name){
  return String(process.env[name] || '').trim();
}

function send(res, code, obj, extra){
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if(extra) Object.entries(extra).forEach(([k, v]) => res.setHeader(k, v));
  res.end(JSON.stringify(obj));
}

module.exports = async function handler(req, res){
  if(req.method === 'OPTIONS'){
    res.statusCode = 204;
    res.setHeader('Allow', 'GET, HEAD, OPTIONS');
    return res.end();
  }
  if(req.method !== 'GET' && req.method !== 'HEAD'){
    return send(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  }

  const token = env('TMDB_TOKEN');       // v4 Bearer (eyJ...)
  const apiKey = env('TMDB_API_KEY');    // v3 key (32 chars)
  if(!token && !apiKey){
    return send(res, 503, {
      error: 'TMDB_KEY_MISSING',
      message: 'Vercel → Project → Settings → Environment Variables mein TMDB_TOKEN add karein, phir Redeploy karein.'
    });
  }

  /* ---- resolve the TMDB path (works with or without Vercel's req.query helper) ---- */
  let query = req.query || {};
  if(!query || typeof query !== 'object' || Object.keys(query).length === 0){
    const qs = String(req.url || '').split('?')[1] || '';
    query = {};
    new URLSearchParams(qs).forEach((v, k) => { query[k] = v; });
  }
  let tmdbPath = typeof query.path === 'string' ? query.path : '';
  if(Array.isArray(query.path)) tmdbPath = '/' + query.path.join('/');
  if(!tmdbPath){
    // fallback: derive from the raw url (e.g. /api/tmdb/movie/550)
    const raw = String(req.url || '').split('?')[0];
    tmdbPath = raw.replace(/^\/api\/tmdb/, '') || '/';
  }
  if(!tmdbPath.startsWith('/')) tmdbPath = '/' + tmdbPath;
  if(/\.\.|%2e%2e/i.test(tmdbPath)) return send(res, 400, { error: 'BAD_PATH' });
  if(tmdbPath.length > 300) return send(res, 414, { error: 'PATH_TOO_LONG' });

  /* ---- forward params (never auth) ---- */
  const forward = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if(k === 'path' || k === 'api_key' || k === 'access_token') return;
    if(Array.isArray(v)) v = v[v.length - 1];
    if(v !== undefined && v !== null && v !== '') forward.set(k, String(v));
  });
  if(!token && apiKey) forward.set('api_key', apiKey);

  const target = `${TMDB_BASE}${tmdbPath}${forward.toString() ? '?' + forward.toString() : ''}`;

  const headers = { Accept: 'application/json', 'User-Agent': 'CLIP-Premium/1.0 (vercel)' };
  if(token) headers.Authorization = `Bearer ${token}`;

  /* ---- fetch upstream ---- */
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let upstream;
  try{
    upstream = await fetch(target, { headers, signal: controller.signal });
  }catch(err){
    clearTimeout(timeout);
    return send(res, 502, {
      error: 'UPSTREAM_ERROR',
      message: err && err.name === 'AbortError' ? 'TMDB request timed out' : 'TMDB se connection nahi hua'
    });
  }
  clearTimeout(timeout);

  const body = await upstream.text();

  // Good responses are cached at the edge for 5 minutes (fast + fewer TMDB calls)
  const cacheable = upstream.status >= 200 && upstream.status < 400;
  return send(res, upstream.status, safeJson(body), {
    'Cache-Control': cacheable
      ? 'public, s-maxage=300, stale-while-revalidate=900'
      : 'no-store'
  });
};

/* keep TMDB's JSON untouched, but never return a broken body */
function safeJson(text){
  try{ return JSON.parse(text); }
  catch(e){ return { error: 'BAD_UPSTREAM_RESPONSE', raw: String(text).slice(0, 300) }; }
}
