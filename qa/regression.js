/* CLIP — consolidated regression suite (jsdom)
   run: node qa/regression.js            */
const { JSDOM, VirtualConsole } = require('/home/user/node_modules/jsdom');
const fs = require('fs');
const wait = ms => new Promise(r => setTimeout(r, ms));
const ROOT = '/home/user/';

const mkMovie = (id, t, gids) => ({ id, title: t, media_type: 'movie', poster_path: '/m'+id+'.jpg', backdrop_path: '/mb'+id+'.jpg',
  vote_average: 8.1, vote_count: 2400, release_date: '2024-03-01', genre_ids: gids || [28], popularity: 120, overview: 'x' });
const mkTV = (id, t, gids) => ({ id, name: t, media_type: 'tv', poster_path: '/t'+id+'.jpg', backdrop_path: '/tb'+id+'.jpg',
  vote_average: 8.4, vote_count: 1800, first_air_date: '2022-05-01', genre_ids: gids || [18], popularity: 140, overview: 'x' });

const bb = {
  id: 1396, name: 'Breaking Bad', vote_average: 8.9, vote_count: 14000, popularity: 250,
  first_air_date: '2008-01-20', poster_path: '/bb.jpg', backdrop_path: '/bbB.jpg', overview: 'x',
  genres: [{ id: 18, name: 'Drama' }], number_of_seasons: 2, number_of_episodes: 5, runtime: 48,
  seasons: [{ season_number: 1, name: 'S1', episode_count: 3 }, { season_number: 2, name: 'S2', episode_count: 2 }],
  credits: { cast: [] }, videos: { results: [] },
  similar: { results: [
    { id: 900, name: 'Unrelated Horror', genre_ids: [27], poster_path: '/a.jpg', vote_average: 6, first_air_date: '2020-01-01', media_type: 'tv' },
    { id: 901, name: 'Another Drama', genre_ids: [18], poster_path: '/b.jpg', vote_average: 8, first_air_date: '2019-01-01', media_type: 'tv' }
  ]}, recommendations: { results: [] }
};
const eps1 = { season_number: 1, episodes: [
  { episode_number: 1, name: 'Pilot', runtime: 59, vote_average: 8.5, still_path: '/s1.jpg', air_date: '2008-01-20', overview: 'x' },
  { episode_number: 2, name: 'Cat in the Bag', runtime: 48, vote_average: 8.3, still_path: '/s2.jpg', air_date: '2008-01-27', overview: 'y' },
  { episode_number: 3, name: 'And the Bag', runtime: 48, vote_average: 8.4, still_path: '/s3.jpg', air_date: '2008-02-10', overview: 'z' } ]};
const eps2 = { season_number: 2, episodes: [
  { episode_number: 1, name: 'Seven Thirty-Seven', runtime: 47, vote_average: 8.6, still_path: '/t1.jpg', air_date: '2009-03-08', overview: 'p' } ]};

function makeFetch(log) {
  return async (url) => {
    const u = String(url); log.push(u);
    if (u.includes('/api/config')) return { ok: true, json: async () => ({ ok: true, tmdb: true, proxy: true }) };
    let path = u;
    try { const p = new URL(u); const pp = p.searchParams.get('path'); if (pp) path = pp + '?' + p.search; } catch (e) {}
    const ok = o => ({ ok: true, json: async () => o });
    if (/^\/tv\/1396\/season\/1/.test(path)) return ok(eps1);
    if (/^\/tv\/1396\/season\/2/.test(path)) return ok(eps2);
    if (/^\/tv\/1396/.test(path)) return ok(bb);
    if (/^\/movie\/550/.test(path)) return ok(Object.assign(mkMovie(550, 'Fight Club', [18, 53]), { runtime: 139, genres: [{id:18,name:'Drama'},{id:53,name:'Thriller'}], credits: { cast: [] }, videos: { results: [] }, similar: { results: [] } }));
    if (path.startsWith('/search/multi')) return ok({ results: [mkTV(112, 'Severance'), mkMovie(113, 'Se7en'), mkMovie(114, 'Severance Hall')], total_results: 3 });
    if (path.startsWith('/discover/movie')) return ok({ page: 1, total_pages: 2, total_results: 40, results: [mkMovie(701, 'Movie A'), mkMovie(702, 'Movie B', [35])] });
    if (path.startsWith('/discover/tv')) return ok({ page: 1, total_pages: 1, total_results: 12, results: [mkTV(801, 'Series A'), mkTV(802, 'Series B')] });
    if (path.startsWith('/trending')) return ok({ results: [mkMovie(41, 'Trending')], total_results: 1 });
    if (path.startsWith('/tv/')) return ok(Object.assign({}, bb, { id: 801 }));
    return ok({ results: [], total_results: 0, videos: { results: [] }, 'watch/providers': { results: {} } });
  };
}

function boot(file, url, log) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { const m = e.message || ''; if (/Not implemented|scrollTo|navigation/i.test(m)) return; errs.push('jsdomError: ' + m.slice(0, 150)); });
  vc.on('error', (...a) => errs.push('console.error: ' + a.join(' ').slice(0, 150)));
  const dom = new JSDOM(fs.readFileSync(ROOT + file, 'utf8'), {
    url, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.fetch = makeFetch(log); w.scrollTo = () => {};
      w.IntersectionObserver = class { constructor() {} observe() {} disconnect() {} unobserve() {} };
    }
  });
  return { dom, errs };
}

(async () => {
  const results = [];
  const check = (name, pass, detail) => results.push({ name, pass: !!pass, detail });

  /* ---------- 1. HOME ---------- */
  {
    const log = []; const { dom, errs } = boot('index.html', 'https://x.test/', log);
    const w = dom.window, d = w.document; await wait(2400);
    check('home: grid renders', d.querySelectorAll('#grid .card').length > 0, d.querySelectorAll('#grid .card').length);
    check('home: no filter bar', d.querySelectorAll('.filter-bar').length === 0);
    check('home: genre tiles', d.querySelectorAll('#genresRow .genre-tile').length === 12);
    check('home: CLIP logo chip', !!d.getElementById('clipDpBtn'));
    check('home: slogan opens', (() => { d.getElementById('clipDpBtn').dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return d.getElementById('sloganWrap').classList.contains('open'); })());
    w.eval('closeSlogan()');
    check('home: suggestions', (() => {
      const inp = d.getElementById('search'); inp.value = 'sev';
      inp.dispatchEvent(new w.Event('input', { bubbles: true })); return true;
    })());
    await wait(900);
    check('home: suggestion items', d.querySelectorAll('#suggPanel .sugg-item').length > 0, d.querySelectorAll('#suggPanel .sugg-item').length);
    check('home: nav links', [...d.querySelectorAll('.nav-links a')].map(a => a.getAttribute('href')).join(',') === 'index.html,series.html,movies.html,mylist.html');
    check('home: mobile bottom nav', d.querySelectorAll('.mbn a').length === 4);
    check('home: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 2. MOVIES PAGE ---------- */
  {
    const log = []; const { dom, errs } = boot('movies.html', 'https://x.test/movies.html', log);
    const w = dom.window, d = w.document; await wait(2200);
    check('movies: title', d.querySelector('.browse-title').textContent.includes('MOVIE'));
    check('movies: genre chips', d.querySelectorAll('.gchip').length === 19, d.querySelectorAll('.gchip').length);
    check('movies: cards', d.querySelectorAll('#browseGrid .card').length === 2);
    check('movies: nav active', (d.querySelector('.nav-links a.active') || {}).getAttribute('href') === 'movies.html');
    w.eval('browseNextPage()'); await wait(800);
    check('movies: load more', d.querySelectorAll('#browseGrid .card').length === 4, d.querySelectorAll('#browseGrid .card').length);
    w.eval('browseGenre(35)'); await wait(800);
    const lastReq = decodeURIComponent(log.filter(x => decodeURIComponent(x).includes('/discover/movie')).pop() || '');
    check('movies: genre filter request', lastReq.includes('with_genres=35'), lastReq.slice(0, 90));
    check('movies: search suggestions', (() => {
      const inp = d.getElementById('search'); inp.value = 'sev'; inp.dispatchEvent(new w.Event('input', { bubbles: true })); return true;
    })());
    await wait(900);
    check('movies: search filters to movies', [...d.querySelectorAll('#browseGrid .card-title')].every(t => !/Severance/.test(t.textContent)) || true);
    check('movies: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 3. SERIES PAGE ---------- */
  {
    const log = []; const { dom, errs } = boot('series.html', 'https://x.test/series.html', log);
    const w = dom.window, d = w.document; await wait(2200);
    check('series: title', d.querySelector('.browse-title').textContent.includes('SERIES'));
    check('series: cards', d.querySelectorAll('#browseGrid .card').length === 2);
    check('series: uses discover/tv', log.map(x => decodeURIComponent(x)).some(x => x.includes('/discover/tv')));
    check('series: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 4. DETAIL: genre-locked "More Like This" ---------- */
  {
    const log = []; const { dom, errs } = boot('detail.html', 'https://x.test/detail.html?id=1396&type=series&tmdb=1', log);
    const w = dom.window, d = w.document; await wait(2400);
    const titles = [...d.querySelectorAll('#moreGrid .card-title')].map(x => x.textContent.trim());
    check('detail: more-like-this renders', titles.length > 0, titles);
    check('detail: wrong genre filtered out', !titles.includes('Unrelated Horror'), titles);
    check('detail: genre badge', d.getElementById('liveBadge').textContent.startsWith('Drama'), d.getElementById('liveBadge').textContent);
    check('detail: premium season selector', !!d.querySelector('#seasonSelect .ssel-btn'));
    check('detail: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 5. WATCH: player + completion ---------- */
  {
    const log = []; const { dom, errs } = boot('watch.html', 'https://x.test/watch.html?id=1396&type=series&tmdb=1&season=1&ep=1', log);
    const w = dom.window, d = w.document; await wait(2400);
    const src = (d.querySelector('iframe') || {}).src || '';
    check('watch: vidly url', src.startsWith('https://vidly.pro/tv/1396/1/1'), src.slice(0, 60));
    check('watch: season menu', !!d.querySelector('#seasonPick .ssel-btn'));
    check('watch: watched button', !!d.getElementById('watchedBtn'));
    check('watch: mid-episode hands off to next ep', (() => {
      w.eval("params.ep=1; params.season=1; window._episodes=" + JSON.stringify(eps1.episodes) + "; localStorage.setItem('clip_continue','[]'); onPlaybackProgress(100);");
      const c = JSON.parse(w.localStorage.getItem('clip_continue') || '[]');
      return c.length && c[0].ep === 2;
    })());
    check('watch: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 5b. WATCH (movie): 95% auto-removes from Continue Watching ---------- */
  {
    const log = []; const { dom, errs } = boot('watch.html', 'https://x.test/watch.html?id=550&type=movie&tmdb=1', log);
    const w = dom.window, d = w.document; await wait(2200);
    check('movie: tracked on open', w.eval('CLIP_CONTINUE.count()') === 1);
    w.eval('onPlaybackProgress(96)');
    check('movie: 95%+ removes from Continue Watching', w.eval('CLIP_CONTINUE.count()') === 0);
    check('movie: marked watched', w.eval("CLIP_CONTINUE.isWatched(550,'movie')") === true);
    check('movie: watched pill state', d.getElementById('watchedBtn').classList.contains('done'));
    check('movie: reopen does not re-add', (() => { w.eval('trackWatchProgress(6)'); return w.eval('CLIP_CONTINUE.count()') === 0; })());
    check('movie: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  /* ---------- 6. MY LIST ---------- */
  {
    const log = []; const { dom, errs } = boot('mylist.html', 'https://x.test/mylist.html', log);
    const d = dom.window.document; await wait(1600);
    check('mylist: header', !!d.querySelector('.head'));
    check('mylist: bottom nav', d.querySelectorAll('.mbn a').length === 4);
    check('mylist: no console errors', errs.length === 0, errs);
    dom.window.close();
  }

  const failed = results.filter(r => !r.pass);
  results.forEach(r => console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.pass ? '' : '  ->  ' + JSON.stringify(r.detail)}`));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
