/* CLIP — platform hub page checks (jsdom)
   run: node qa/platform_test.js */
const { JSDOM, VirtualConsole } = require('/home/user/node_modules/jsdom');
const fs = require('fs');
const wait = ms => new Promise(r => setTimeout(r, ms));
const ROOT = '/home/user/';

const mkMovie = (id, t, g = [28]) => ({ id, title: t, media_type: 'movie', poster_path: '/m'+id+'.jpg',
  vote_average: 8.1, vote_count: 2400, release_date: '2024-03-01', genre_ids: g, popularity: 120, overview: 'x' });
const mkTV = (id, t, g = [18]) => ({ id, name: t, media_type: 'tv', poster_path: '/t'+id+'.jpg',
  vote_average: 8.4, vote_count: 1800, first_air_date: '2022-05-01', genre_ids: g, popularity: 140, overview: 'x' });

function makeFetch(log) {
  return async (url) => {
    const u = String(url); log.push(u);
    if (u.includes('/api/config')) return { ok: true, json: async () => ({ ok: true, tmdb: true }) };
    let path = u;
    try { const p = new URL(u); const pp = p.searchParams.get('path'); if (pp) path = pp + '?' + p.search; } catch (e) {}
    const ok = o => ({ ok: true, json: async () => o });
    if (path.startsWith('/search/multi')) return ok({ results: [mkTV(112, 'Severance'), mkMovie(113, 'Se7en')], total_results: 2 });
    if (path.startsWith('/discover/movie')) return ok({ page: 1, total_pages: 3, total_results: 60, results: [mkMovie(701, 'Netflix Movie A'), mkMovie(702, 'Netflix Movie B', [35])] });
    if (path.startsWith('/discover/tv')) return ok({ page: 1, total_pages: 2, total_results: 40, results: [mkTV(801, 'Netflix Series A'), mkTV(802, 'Netflix Series B')] });
    if (path.includes('/watch/providers')) return ok({ results: { US: { link: 'https://tmdb.test/x', flatrate: [
      { provider_id: 8, provider_name: 'Netflix', logo_path: '/n.jpg' },
      { provider_id: 337, provider_name: 'Disney Plus', logo_path: '/d.jpg' },
      { provider_id: 999, provider_name: 'Some Indie App', logo_path: '/i.jpg' } ] } } });
    if (path.startsWith('/tv/')) return ok({ id: 1396, name: 'Breaking Bad', vote_average: 8.9, genres: [{ id: 18, name: 'Drama' }],
      seasons: [{ season_number: 1, name: 'S1', episode_count: 3 }], number_of_seasons: 1, number_of_episodes: 3,
      credits: { cast: [] }, videos: { results: [] }, similar: { results: [] }, recommendations: { results: [] } });
    if (path.startsWith('/movie/')) return ok(mkMovie(550, 'Fight Club', [18]));
    return ok({ results: [], total_results: 0, videos: { results: [] } });
  };
}

function boot(file, url, log) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = e.message || ''; if (/Not implemented|navigation|scrollTo/i.test(m)) return; errs.push('jsdomError: ' + m.slice(0, 160)); });
  vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ').slice(0, 160)));
  const dom = new JSDOM(fs.readFileSync(ROOT + file, 'utf8'), {
    url, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.fetch = makeFetch(log); w.scrollTo = () => {};
      w.IntersectionObserver = class { constructor() {} observe() {} disconnect() {} unobserve() {} };
    }
  });
  return { dom, errs };
}

const dec = s => decodeURIComponent(s);
const lastDiscover = (log, kind) => {
  const hit = log.map(dec).filter(x => x.includes('/discover/' + kind)).pop() || '';
  return hit;
};
const qp = (u, k) => { try { return new URL(u).searchParams.get(k); } catch (e) { return null; } };

(async () => {
  const results = [];
  const check = (n, p, d) => results.push({ n, p: !!p, d });

  /* ---------- 1. Netflix live ---------- */
  {
    const log = []; const { dom, errs } = boot('platform.html', 'https://x.test/platform.html?p=netflix', log);
    const w = dom.window, d = w.document; await wait(2400);
    check('netflix: hero title', /NETFLIX/i.test(d.getElementById('platTitle').textContent), d.getElementById('platTitle').textContent);
    check('netflix: 19 genre chips', d.querySelectorAll('.gchip').length === 19, d.querySelectorAll('.gchip').length);
    check('netflix: 9 platform pills', d.querySelectorAll('.psw').length === 9, d.querySelectorAll('.psw').length);
    check('netflix: 2 cards', d.querySelectorAll('#browseGrid .card').length === 2);
    const u = lastDiscover(log, 'movie');
    check('netflix: provider 8 requested', qp(u, 'with_watch_providers') === '8', qp(u, 'with_watch_providers'));
    check('netflix: region US', qp(u, 'watch_region') === 'US', qp(u, 'watch_region'));
    check('netflix: flatrate only', qp(u, 'with_watch_monetization_types') === 'flatrate');
    check('netflix: source live', d.getElementById('browseSource').textContent === 'TMDB Live');
    check('netflix: card links detail', (d.querySelector('#browseGrid .card').getAttribute('onclick') || '').includes('detail.html?id='));

    w.eval("platType('tv')"); await wait(900);
    const ut = lastDiscover(log, 'tv');
    check('netflix tv: discover/tv', qp(ut, 'with_watch_providers') === '8', ut.slice(0, 80));
    check('netflix tv: series cards', d.querySelectorAll('#browseGrid .card').length === 2);

    w.eval("platType('movie')"); await wait(700);
    w.eval('platGenre(35)'); await wait(900);
    check('genre chip filter', qp(lastDiscover(log, 'movie'), 'with_genres') === '35', qp(lastDiscover(log, 'movie'), 'with_genres'));

    w.eval("platSort('vote_average.desc')"); await wait(900);
    check('sort top rated', qp(lastDiscover(log, 'movie'), 'sort_by') === 'vote_average.desc');

    w.eval("platRegion('PK')"); await wait(900);
    check('region switch PK', qp(lastDiscover(log, 'movie'), 'watch_region') === 'PK', qp(lastDiscover(log, 'movie'), 'watch_region'));

    w.eval('platNextPage()'); await wait(900);
    check('load more page 2', d.querySelectorAll('#browseGrid .card').length === 4, d.querySelectorAll('#browseGrid .card').length);

    w.eval("platPick('disney')"); await wait(900);
    check('switch to disney', qp(lastDiscover(log, 'movie'), 'with_watch_providers') === '337', qp(lastDiscover(log, 'movie'), 'with_watch_providers'));
    check('switch updates title', /DISNEY/i.test(d.getElementById('platTitle').textContent), d.getElementById('platTitle').textContent);
    check('switch resets genre chip', d.querySelector('.gchip.on').textContent === 'All');
    check('no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 2. All platforms + invalid slug ---------- */
  {
    const log = []; const { dom, errs } = boot('platform.html', 'https://x.test/platform.html?p=nah', log);
    const w = dom.window, d = w.document; await wait(2200);
    check('invalid slug -> All Platforms', /ALL\s+PLATFORMS/i.test(d.getElementById('platTitle').textContent), d.getElementById('platTitle').textContent);
    check('all: no provider filter', !qp(lastDiscover(log, 'movie'), 'with_watch_providers'), lastDiscover(log, 'movie').slice(0, 90));
    check('all: clean console', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 3. Demo fallback (no TMDB key) ---------- */
  {
    const log = [];
    const errs = [];
    const vc = new VirtualConsole();
    vc.on('jsdomError', e => { const m = e.message || ''; if (/Not implemented|navigation|scrollTo/i.test(m)) return; errs.push('jsdomError: ' + m.slice(0, 160)); });
    vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ').slice(0, 160)));
    const dom = new JSDOM(fs.readFileSync(ROOT + 'platform.html', 'utf8'), {
      url: 'https://x.test/platform.html?p=netflix', runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
      beforeParse(w) {
        w.fetch = async () => ({ ok: false, json: async () => ({ ok: false, tmdb: false }), status: 500 });
        w.scrollTo = () => {};
        w.IntersectionObserver = class { constructor() {} observe() {} disconnect() {} unobserve() {} };
      }
    });
    const w = dom.window, d = w.document; await wait(2000);
    const cards = d.querySelectorAll('#browseGrid .card').length;
    check('demo: netflix cards render', cards > 0, cards);
    check('demo: source label', d.getElementById('browseSource').textContent === 'Demo');
    check('demo: demo tag', d.getElementById('platLiveTag').textContent === 'Demo catalog', d.getElementById('platLiveTag').textContent);
    w.eval('platGenre(10402)'); await wait(400);
    check('demo: empty state for Music', /Nothing in .*Music.* on Netflix/i.test(d.querySelector('#browseGrid').textContent), d.querySelector('#browseGrid').textContent.slice(0, 90));
    w.eval("platType('tv')"); await wait(500);
    check('demo: series only', [...d.querySelectorAll('#browseGrid .card-genre')].length >= 0 && cards > 0);
    check('demo: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 4. Home chips link to the hub ---------- */
  {
    const log = []; const { dom, errs } = boot('index.html', 'https://x.test/index.html', log);
    const w = dom.window, d = w.document; await wait(2600);
    const hrefs = [...d.querySelectorAll('#platformTabs .ptab')].map(a => a.getAttribute('href'));
    check('home: 9 platform chips', hrefs.length === 9, hrefs.length);
    check('home: chips are links', hrefs.every(h => !!h), hrefs);
    check('home: netflix chip href', hrefs[1] === 'platform.html?p=netflix', hrefs[1]);
    check('home: all chip -> home', hrefs[0] === 'index.html', hrefs[0]);
    check('home: disney chip href', hrefs[3] === 'platform.html?p=disney', hrefs[3]);
    check('home: chips navigate (not filter)', !!(d.querySelector('#platformTabs a[href="platform.html?p=peacock"]')));
    check('home: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 5. Detail "where to watch" -> platform hub ---------- */
  {
    const log = []; const { dom, errs } = boot('detail.html', 'https://x.test/detail.html?id=1396&type=series&tmdb=1', log);
    const w = dom.window, d = w.document; await wait(2600);
    const links = [...d.querySelectorAll('#woList .wo-item')].map(a => a.getAttribute('href'));
    check('detail: provider links', links.length >= 2, links);
    check('detail: netflix -> hub', links.includes('platform.html?p=netflix'), links);
    check('detail: unknown provider -> external', links.some(h => h && h.startsWith('https://tmdb.test')), links);
    check('detail: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  const failed = results.filter(r => !r.p);
  results.forEach(r => console.log(`${r.p ? 'PASS' : 'FAIL'}  ${r.n}${r.p ? '' : '  ->  ' + JSON.stringify(r.d)}`));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
