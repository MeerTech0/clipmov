/* ============================================================
   CLIP — Vercel Serverless: public config
   Route: /api/config
   Returns only booleans — never the key, token or auth type.
   ============================================================ */

module.exports = function handler(req, res){
  if(req.method === 'OPTIONS'){
    res.statusCode = 204;
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.end();
  }

  const token = String(process.env.TMDB_TOKEN || '').trim();
  const apiKey = String(process.env.TMDB_API_KEY || '').trim();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify({
    ok: true,
    tmdb: Boolean(token || apiKey),
    proxy: true,
    runtime: 'vercel',
    cache: 300
  }));
};
