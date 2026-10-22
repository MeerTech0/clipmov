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

/* ---------- locate the folder that actually holds index.html ----------
   Works whether the pages sit next to server.js (normal repo layout) or one
   level deeper (clip/, public/, site/, dist/, www/, app/) — which is exactly
   what happens when a project is uploaded as a zip. Without this, every page
   returned {"error":"NOT_FOUND","path":"/index.html"}. */
function findSiteRoot(base){
  const hasIndex = dir => {
    try { return fs.existsSync(path.join(dir, 'index.html')); } catch(e){ return false; }
  };
  if(hasIndex(base)) return base;

  const named = ['clip', 'public', 'site', 'dist', 'www', 'app', 'src'];
  for(const n of named){
    const dir = path.join(base, n);
    if(hasIndex(dir)) return dir;
  }
  try{
    const skip = /^(node_modules|\.git|\.vercel|uploads|qa|tools|api|assets|images|img)$/i;
    const subs = fs.readdirSync(base, { withFileTypes: true })
      .filter(e => e.isDirectory() && !skip.test(e.name))
      .map(e => e.name);
    for(const name of subs) if(hasIndex(path.join(base, name))) return path.join(base, name);
  }catch(e){}

  /* also look UPWARDS — some hosts start the server from a nested folder */
  let dir = base;
  for(let up = 0; up < 3; up++){
    const parent = path.dirname(dir);
    if(!parent || parent === dir) break;
    dir = parent;
    if(hasIndex(dir)) return dir;
    for(const n of named){
      const sub = path.join(dir, n);
      if(sub !== base && hasIndex(sub)) return sub;
    }
  }
  return base;
}
const SITE_ROOT = findSiteRoot(ROOT);

/* page-name -> file check, used by /health and the boot log */
const CORE_FILES = ['index.html','movies.html','series.html','platform.html','detail.html','watch.html','mylist.html','404.html'];
function missingPages(){
  return CORE_FILES.filter(f => {
    try { return !fs.existsSync(path.join(SITE_ROOT, f)); } catch(e){ return true; }
  });
}

/* ---------- when the pages are not on this machine at all ---------- */
function siteMissingPage(){
  const missing = missingPages();
  const root = SITE_ROOT.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CLIP — pages not found on this server</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{min-height:100vh;display:grid;place-items:center;padding:24px;background:#07070A;color:#fff;
       font-family:system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6}
  .card{width:min(560px,100%);background:linear-gradient(170deg,#151519,#0B0B0E);
        border:1px solid rgba(201,168,106,.28);border-radius:20px;padding:30px 26px;
        box-shadow:0 30px 80px rgba(0,0,0,.7)}
  .mark{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-weight:900;font-size:24px;
        color:#07070A;background:linear-gradient(135deg,#C9A86A,#E8C99A);margin-bottom:16px}
  h1{font-size:20px;letter-spacing:-.4px;margin-bottom:8px}
  p{color:#9A9AA2;font-size:13.5px;margin-bottom:14px}
  code{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);border-radius:6px;
       padding:2px 6px;font-size:12px;color:#E8C99A;word-break:break-all}
  ul{margin:0 0 16px 18px;color:#9A9AA2;font-size:13px}
  li{margin-bottom:7px}
  .box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;
       padding:12px 14px;font-size:12px;color:#B4B4BC;margin-top:14px}
  a{color:#E8C99A}
</style></head><body>
<div class="card">
  <div class="mark">C</div>
  <h1>Pages not found on this server</h1>
  <p>The Node server is running, but <code>index.html</code> is not inside it:</p>
  <p><code>${root}</code></p>
  <ul>
    <li>Push the HTML files to the repository root (index, movies, series, platform, detail, watch, mylist, 404)</li>
    <li>On the host, leave <b>Root Directory</b> empty, then <b>Redeploy</b></li>
    <li>Missing right now: <code>${missing.join(', ') || '—'}</code></li>
  </ul>
  <div class="box">Diagnostics: <a href="/health">/health</a> — shows the detected folder and the missing files.</div>
</div>
</body></html>`;
}

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
    const clean = path.join(SITE_ROOT, path.normalize(pathname + '.html').replace(/^(\.\.[/\\])+/, ''));
    try { if(clean.startsWith(SITE_ROOT) && fs.existsSync(clean)) pathname += '.html'; } catch(e){}
  }

  const filePath = path.join(SITE_ROOT, path.normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
  if(!filePath.startsWith(SITE_ROOT)) return json(res, 403, { error:'FORBIDDEN' });
  if(isBlockedFile(filePath)) return json(res, 404, { error:'NOT_FOUND' });

  fs.stat(filePath, (err, st) => {
    if(err || !st.isFile()){
      const wantsHtml = /\.html?$/i.test(pathname) || !path.extname(pathname);
      /* whole site missing? explain it in the browser instead of throwing JSON */
      if(wantsHtml && !fs.existsSync(path.join(SITE_ROOT, 'index.html'))){
        res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        return res.end(siteMissingPage());
      }
      const fallback = path.join(SITE_ROOT, '404.html');
      if(wantsHtml && fs.existsSync(fallback)){
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
        return fs.createReadStream(fallback).pipe(res);
      }
      return json(res, 404, { error:'NOT_FOUND', path: pathname, siteRoot: path.basename(SITE_ROOT) });
    }
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

  if(pathname === '/health' || pathname === '/api/health'){
    const missing = missingPages();
    return json(res, missing.length ? 503 : 200, {
      ok: missing.length === 0,
      runtime: 'node',
      node: process.version,
      siteRoot: SITE_ROOT,
      indexFound: fs.existsSync(path.join(SITE_ROOT, 'index.html')),
      pages: CORE_FILES.length,
      missing,
      tmdb: HAS_KEY
    });
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
  const _missing = missingPages();
  console.log(`  Site root : ${SITE_ROOT}`);
  console.log(`  Pages     : ${_missing.length ? '✗ missing ' + _missing.join(', ') : '✓ all ' + CORE_FILES.length + ' found'}`);
  console.log('');
});
