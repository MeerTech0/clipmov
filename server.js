#!/usr/bin/env node
/* ============================================================
   CLIP — secure static server + TMDB proxy
   ------------------------------------------------------------
   • Serves the CLIP site (index.html, detail.html, ...)
   • Proxies /api/tmdb/* -> api.themoviedb.org/3/*
   • The API key/token is read from .env (server side only)
     and is NEVER sent to the browser.
   Run:  node server.js        (PORT=8080 by default)
   ============================================================ */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const zlib  = require('zlib');

/* ---------- tiny .env loader (no dependencies) ---------- */
(function loadEnv(){
  const file = path.join(__dirname, '.env');
  try{
    if(!fs.existsSync(file)) return;
    fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
      if(!line || /^\s*#/.test(line)) return;
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if(!m) return;
      let v = m[2].trim();
      if((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if(process.env[m[1]] === undefined) process.env[m[1]] = v;
    });
  }catch(e){ console.warn('[clip] .env read failed:', e.message); }
})();

const PORT        = Number(process.env.PORT || 8080);
const HOST        = process.env.HOST || '0.0.0.0';
const TMDB_TOKEN  = (process.env.TMDB_TOKEN || '').trim();     // v4 Bearer  (eyJ...)
const TMDB_KEY    = (process.env.TMDB_API_KEY || '').trim();   // v3 api_key (32 chars)
const HAS_KEY     = Boolean(TMDB_TOKEN || TMDB_KEY);
const CACHE_TTL   = Number(process.env.TMDB_CACHE_MS || 5 * 60 * 1000);
const ROOT        = __dirname;

/* ---------- small in-memory cache ---------- */
const cache = new Map(); // key -> { at, status, body, ctype }
function cacheGet(k){
  const hit = cache.get(k);
  if(!hit) return null;
  if(Date.now() - hit.at > CACHE_TTL){ cache.delete(k); return null; }
  return hit;
}
function cacheSet(k, v){
  if(cache.size > 400){
    const oldest = [...cache.entries()].sort((a,b) => a[1].at - b[1].at).slice(0, 100);
    oldest.forEach(([key]) => cache.delete(key));
  }
  cache.set(k, v);
}

/* ---------- helpers ---------- */
const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp',
  '.svg':'image/svg+xml', '.ico':'image/x-icon', '.mp4':'video/mp4', '.woff2':'font/woff2',
  '.txt':'text/plain; charset=utf-8', '.md':'text/plain; charset=utf-8', '.env':'text/plain; charset=utf-8'
};

function json(res, code, obj, extra){
  const body = JSON.stringify(obj);
  res.writeHead(code, Object.assign({
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store',
    'X-Content-Type-Options':'nosniff'
  }, extra || {}));
  res.end(body);
}

function isBlockedFile(p){
  const base = path.basename(p);
  // never serve secrets / server internals
  return base === '.env' || base === '.env.local' || base === 'server.js' ||
         base === 'package-lock.json' || /^\.env\./.test(base);
}

/* ---------- TMDB proxy ---------- */
function proxyTMDB(req, res){
  if(!HAS_KEY){
    return json(res, 503, {
      error: 'TMDB_KEY_MISSING',
      message: 'TMDB_TOKEN .env mein set nahi hai. Server par .env kholein aur token paste karke restart karein.'
    });
  }

  const incoming = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Two accepted shapes (same as the Vercel function):
  //   /api/tmdb?path=/movie/550&language=en   (Vercel-safe)
  //   /api/tmdb/movie/550?language=en         (legacy)
  let apiPath = incoming.searchParams.get('path');
  if(!apiPath) apiPath = incoming.pathname.replace(/^\/api\/tmdb/, '');
  if(!apiPath.startsWith('/')) apiPath = '/' + apiPath;
  // hard block path traversal / weird paths
  if(/\.\.|%2e%2e/i.test(apiPath)) return json(res, 400, { error:'BAD_PATH' });

  const params = new URLSearchParams(incoming.search);
  params.delete('path');                          // internal routing param
  params.delete('api_key');                       // client can never override auth
  if(TMDB_KEY && !TMDB_TOKEN) params.set('api_key', TMDB_KEY);

  const qs = params.toString();
  const cacheKey = apiPath + '?' + qs;

  const hit = cacheGet(cacheKey);
  if(hit){
    res.writeHead(hit.status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Cache': 'HIT'
    });
    return res.end(hit.body);
  }

  const targetPath = '/3' + apiPath + (qs ? '?' + qs : '');
  const headers = {
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
    'User-Agent': 'CLIP-Premium/1.0 (server proxy)'
  };
  if(TMDB_TOKEN) headers['Authorization'] = `Bearer ${TMDB_TOKEN}`;

  const upstream = https.request({
    hostname: 'api.themoviedb.org',
    port: 443,
    path: targetPath,
    method: 'GET',
    headers,
    timeout: 15000
  }, up => {
    const enc = (up.headers['content-encoding'] || '').toLowerCase();
    let stream = up;
    if(enc === 'gzip') stream = up.pipe(zlib.createGunzip());
    else if(enc === 'deflate') stream = up.pipe(zlib.createInflate());
    else if(enc === 'br') stream = up.pipe(zlib.createBrotliDecompress());

    const chunks = [];
    stream.on('data', c => chunks.push(c));
    stream.on('end', () => {
      const body = Buffer.concat(chunks);
      const status = up.statusCode || 502;
      // strip any auth-related headers, keep it clean
      if(status >= 200 && status < 300){
        cacheSet(cacheKey, { at: Date.now(), status, body });
      }
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': status < 400 ? 'public, max-age=300' : 'no-store',
        'X-Cache': 'MISS'
      });
      res.end(body);
    });
    stream.on('error', err => json(res, 502, { error:'UPSTREAM_STREAM', message: err.message }));
  });

  upstream.on('timeout', () => { upstream.destroy(new Error('TMDB request timed out')); });
  upstream.on('error', err => {
    console.error('[clip] TMDB proxy error:', err.message);
    json(res, 502, { error: 'UPSTREAM_ERROR', message: 'TMDB se connection nahi hua' });
  });
  upstream.end();
}

/* ---------- basic rate limit (per IP, proxy only) ---------- */
const hits = new Map();
function rateLimited(ip){
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, reset: now + 60000 };
  if(now > rec.reset){ rec.count = 0; rec.reset = now + 60000; }
  rec.count++;
  hits.set(ip, rec);
  return rec.count > 240; // 240 requests / minute / IP
}

/* ---------- static files ---------- */
function serveStatic(req, res){
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
  catch(e){ return json(res, 400, { error:'BAD_URL' }); }

  if(pathname === '/') pathname = '/index.html';
  if(pathname === '/my-list' || pathname === '/mylist') pathname = '/mylist.html';
  /* clean URLs (vercel.json cleanUrls) — /movies -> movies.html, /platform?p=netflix */
  if(!path.extname(pathname)){
    const clean = path.join(ROOT, path.normalize(pathname + '.html').replace(/^(\.\.[/\\])+/, ''));
    try { if(clean.startsWith(ROOT) && fs.existsSync(clean)) pathname += '.html'; } catch(e){}
  }

  const filePath = path.join(ROOT, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
  if(!filePath.startsWith(ROOT)) return json(res, 403, { error:'FORBIDDEN' });
  if(isBlockedFile(filePath)) return json(res, 404, { error:'NOT_FOUND' });

  fs.stat(filePath, (err, st) => {
    if(err || !st.isFile()) return json(res, 404, { error:'NOT_FOUND', path: pathname });
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': st.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------- server ---------- */
const server = http.createServer((req, res) => {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'local';

  if(req.method === 'OPTIONS'){
    res.writeHead(204, { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' });
    return res.end();
  }
  if(req.method !== 'GET' && req.method !== 'HEAD'){
    return json(res, 405, { error:'METHOD_NOT_ALLOWED' });
  }

  const pathname = (req.url || '/').split('?')[0];

  if(pathname === '/api/config'){
    return json(res, 200, {
      ok: true,
      tmdb: HAS_KEY,
      proxy: true,
      cache: Math.round(CACHE_TTL / 1000)
      // NOTE: intentionally no key, no token, no auth type exposed
    });
  }

  if(pathname === '/api/tmdb' || pathname.startsWith('/api/tmdb/')){
    if(rateLimited(ip)) return json(res, 429, { error:'RATE_LIMITED', message:'Bohat zyada requests — thodi der baad try karein' });
    return proxyTMDB(req, res);
  }

  if(pathname.startsWith('/api/')) return json(res, 404, { error:'NOT_FOUND' });

  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  ██████╗██╗     ██╗██████╗ ');
  console.log('  ██╔════╝██║     ██║██╔══██╗');
  console.log('  ██║     ██║     ██║██████╔╝');
  console.log('  ██║     ██║     ██║██╔═══╝ ');
  console.log('  ╚██████╗███████╗██║██║     ');
  console.log('   ╚═════╝╚══════╝╚═╝╚═╝     PREMIUM');
  console.log('');
  console.log(`  Server    : http://localhost:${PORT}`);
  console.log(`  TMDB      : ${HAS_KEY ? '✓ connected (server-side, browser never sees the key)' : '✗ no key — add TMDB_TOKEN to .env'}`);
  console.log(`  Auth type : ${TMDB_TOKEN ? 'v4 Bearer token' : TMDB_KEY ? 'v3 api_key' : '—'}`);
  console.log(`  Proxy     : /api/tmdb/*  →  https://api.themoviedb.org/3/*`);
  console.log('');
});
