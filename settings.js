/* ============================================================
   CLIP — Settings (appearance + preferences)
   Standalone. Persists in localStorage, applies on every page.
   Exposes: window.CLIP_SETTINGS
   ============================================================ */
(function () {
  const KEY = 'clip_settings_v1';
  const STORE = {
    read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } },
    write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  };

  const DEFAULTS = {
    theme: 'obsidian',
    accent: 'gold',
    radius: 'soft',
    density: 'comfortable',
    text: 'md',
    motion: true,
    badges: true,
    prov: true,
    emptyContinue: false,
    dim: 82,
    glass: true,
    heroAutoplay: true,
    heroSpeed: 7000,
    trailerAutoplay: true,
    source: 'vidly',
    playerTheme: 'aurora',
    playerAutoplay: true,
    playerNext: true,
    animeAudio: 'sub',
    customPlayer: '',
    region: 'US',
    platform: 'all',
    sort: 'popular'
  };

  const THEMES = {
    obsidian: { label: 'Obsidian', bg: '#07070A', card: '#111113', line: 'rgba(255,255,255,0.08)', muted: '#8A8A90', note: 'CLIP original' },
    midnight: { label: 'Midnight', bg: '#050A16', card: '#0C1424', line: 'rgba(130,175,255,0.12)', muted: '#8FA0BF', note: 'Deep blue' },
    espresso: { label: 'Espresso', bg: '#0B0705', card: '#171110', line: 'rgba(255,200,150,0.12)', muted: '#A3907F', note: 'Warm cinema' },
    forest:   { label: 'Forest',   bg: '#040A07', card: '#0C1613', line: 'rgba(120,255,190,0.12)', muted: '#8FA89B', note: 'Calm green' },
    violet:   { label: 'Violet',   bg: '#0A0612', card: '#150F22', line: 'rgba(190,150,255,0.14)', muted: '#A79AC0', note: 'Neon night' },
    slate:    { label: 'Slate',    bg: '#0B0C0F', card: '#16181D', line: 'rgba(255,255,255,0.10)', muted: '#9398A3', note: 'Studio grey' },
    oled:     { label: 'OLED Black', bg: '#000000', card: '#0A0A0B', line: 'rgba(255,255,255,0.07)', muted: '#7D7D85', note: 'Pure black' }
  };

  const ACCENTS = {
    gold:     { label: 'Gold',     c1: '#C9A86A', c2: '#E8C99A' },
    amber:    { label: 'Amber',    c1: '#F5A524', c2: '#FFD166' },
    crimson:  { label: 'Crimson',  c1: '#E50914', c2: '#FF6B6B' },
    emerald:  { label: 'Emerald',  c1: '#2ECC71', c2: '#7EF0A8' },
    sapphire: { label: 'Sapphire', c1: '#3B82F6', c2: '#93C5FD' },
    violet:   { label: 'Violet',   c1: '#8B5CF6', c2: '#C4B5FD' },
    rose:     { label: 'Rose',     c1: '#F43F5E', c2: '#FDA4AF' },
    cyan:     { label: 'Cyan',     c1: '#06B6D4', c2: '#67E8F9' }
  };

  const REGIONS = [['US','🇺🇸 US'],['PK','🇵🇰 PK'],['IN','🇮🇳 IN'],['GB','🇬🇧 UK'],['AE','🇦🇪 UAE'],['CA','🇨🇦 CA'],['AU','🇦🇺 AU']];
  const PLATFORMS = [['all','All Platforms'],['netflix','Netflix'],['prime','Prime'],['disney','Disney+'],['hbo','HBO Max'],['apple','Apple TV'],['hulu','Hulu'],['paramount','Paramount+'],['peacock','Peacock']];

  let state = Object.assign({}, DEFAULTS, STORE.read());

  /* ---------------- CSS ---------------- */
  function cssFor(s) {
    const t = THEMES[s.theme] || THEMES.obsidian;
    const a = ACCENTS[s.accent] || ACCENTS.gold;
    const radiusMap = { sharp: '6px', soft: '16px', round: '24px' };
    const r = radiusMap[s.radius] || '16px';
    const dim = (Number(s.dim) || 82) / 100;
    const textMap = {
      sm: '.card-title{font-size:12.5px!important}.card-meta,.card-genre{font-size:10.5px!important}.hero-desc{font-size:13.5px!important}.section-title{font-size:18px!important}',
      md: '',
      lg: '.card-title{font-size:15px!important}.card-meta{font-size:12.5px!important}.card-genre{font-size:12px!important}.hero-desc{font-size:16px!important}.section-title{font-size:22px!important}.btn-play,.btn-list{font-size:15px!important}',
      xl: '.card-title{font-size:16.5px!important}.card-meta{font-size:13.5px!important}.card-genre{font-size:12.5px!important}.hero-desc{font-size:17px!important}.hero-title{letter-spacing:-1px}.section-title{font-size:24px!important}.btn-play,.btn-list{font-size:16px!important}'
    };
    return `
:root{
  --bg:${t.bg};
  --card:${t.card};
  --line:${t.line};
  --muted:${t.muted};
  --gold:${a.c1};
  --gold2:${a.c2};
  --clip-r:${r};
  --clip-hero-dim:${dim};
  --clip-accent-soft:${hexA(a.c1, 0.16)};
}
html{background:${t.bg}}
body{background:${t.bg}!important;color:#fff}
nav,.platform-bar,.filter-bar,.tabs-bar,.topbar{background-color:${hexA(t.bg, 0.92)}!important}
.card,.continue-card,.card-body,.person,.episode,.trailer,.stat,.score,.mini-player{background-color:${t.card}}
.skeleton{background:linear-gradient(90deg, ${t.card} 25%, ${lighten(t.card)} 37%, ${t.card} 63%)!important;background-size:400% 100%!important}

.card,.card-thumb,.thumb,.continue-card,.continue-thumb,.poster,.trailer,.episode,.person,.stat,.score,.mini-player,.section-head .icon-btn{border-radius:var(--clip-r)!important}

.hero-layer{filter:brightness(var(--clip-hero-dim,0.82))!important}
${s.glass ? '' : '.hero-gradient{backdrop-filter:none!important}nav,.filter-bar,.platform-bar{backdrop-filter:none!important}'}

html[data-badges="off"] .card-top-badges,html[data-badges="off"] .card-prov{display:none!important}
html[data-prov="off"] .card-prov{display:none!important}

html[data-density="compact"] .grid{grid-template-columns:repeat(6,1fr)!important;gap:14px!important}
html[data-density="compact"] .card-thumb,html[data-density="compact"] .thumb{height:244px!important}
html[data-density="compact"] .rank-row .card,html[data-density="compact"] .row .card{min-width:196px!important;max-width:196px!important}
html[data-density="compact"] .coll-row .card{min-width:184px!important;max-width:184px!important}
html[data-density="dense"] .coll-row .card{min-width:158px!important;max-width:158px!important}
html[data-density="dense"] .grid{grid-template-columns:repeat(7,1fr)!important;gap:10px!important}
html[data-density="dense"] .card-thumb,html[data-density="dense"] .thumb{height:196px!important}
html[data-density="dense"] .card-body,html[data-density="dense"] .body{padding:9px!important}
html[data-density="dense"] .rank-row .card,html[data-density="dense"] .row .card{min-width:168px!important;max-width:168px!important}
@media(max-width:1100px){
  html[data-density="compact"] .grid,html[data-density="dense"] .grid{grid-template-columns:repeat(3,1fr)!important}
}
@media(max-width:720px){
  html[data-density="compact"] .grid,html[data-density="dense"] .grid{grid-template-columns:repeat(2,1fr)!important;gap:12px!important}
  html[data-density="compact"] .card-thumb,html[data-density="dense"] .card-thumb,
  html[data-density="compact"] .thumb,html[data-density="dense"] .thumb{height:210px!important}
}

${textMap[s.text] || ''}

html[data-motion="off"] *,html[data-motion="off"] *::before,html[data-motion="off"] *::after{
  animation-duration:0.001ms!important;animation-iteration-count:1!important;
  transition-duration:0.001ms!important;scroll-behavior:auto!important;
}
html[data-motion="off"] .card:hover{transform:none!important}
`;
  }

  function hexA(hex, a) {
    const h = String(hex).replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  function lighten(hex) {
    const h = String(hex).replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    const lift = (v) => Math.min(255, Math.round(v + (255 - v) * 0.09));
    const r = lift((n >> 16) & 255), g = lift((n >> 8) & 255), b = lift(n & 255);
    return `rgb(${r},${g},${b})`;
  }

  /* ---------------- apply ---------------- */
  function apply() {
    const root = document.documentElement;
    root.setAttribute('data-theme', state.theme);
    root.setAttribute('data-accent', state.accent);
    root.setAttribute('data-radius', state.radius);
    root.setAttribute('data-density', state.density);
    root.setAttribute('data-text', state.text);
    root.setAttribute('data-motion', state.motion ? 'on' : 'off');
    root.setAttribute('data-badges', state.badges ? 'on' : 'off');
    root.setAttribute('data-prov', state.prov ? 'on' : 'off');

    let el = document.getElementById('clip-settings-vars');
    if (!el) { el = document.createElement('style'); el.id = 'clip-settings-vars'; document.head.appendChild(el); }
    el.textContent = cssFor(state);

    // keep region/platform in the same keys the rest of the site already uses
    try {
      if (state.region) localStorage.setItem('clip_region', state.region);
      if (state.platform) localStorage.setItem('clip_platform', state.platform);
    } catch (e) {}

    document.dispatchEvent(new CustomEvent('clip:settings-changed', { detail: Object.assign({}, state) }));
  }

  function get(k) { return state[k]; }
  function set(k, v) { state[k] = v; STORE.write(state); apply(); if (panel) renderBody(); }
  function patch(obj) { Object.assign(state, obj); STORE.write(state); apply(); if (panel) renderBody(); }
  function reset() { state = Object.assign({}, DEFAULTS); STORE.write(state); apply(); if (panel) renderBody(); }

  /* ---------------- panel UI ---------------- */
  let overlay = null, panel = null, activeTab = 'appearance';

  function ensureCss() {
    if (document.getElementById('clip-settings-css')) return;
    const st = document.createElement('style');
    st.id = 'clip-settings-css';
    st.textContent = `
#clip-gear{position:fixed;right:20px;bottom:20px;z-index:140;width:52px;height:52px;border-radius:99px;
  background:linear-gradient(135deg,var(--gold,#C9A86A),var(--gold2,#E8C99A));color:#07070A;border:none;cursor:pointer;
  display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,0.55),0 0 0 1px rgba(255,255,255,0.12) inset;
  transition:transform .25s ease, box-shadow .25s ease}
#clip-gear:hover{transform:translateY(-3px) rotate(35deg);box-shadow:0 16px 38px rgba(0,0,0,0.6)}
#clip-gear svg{width:23px;height:23px;fill:currentColor}
#clip-gear::after{content:"";position:absolute;inset:-6px;border-radius:99px;border:1px solid rgba(201,168,106,0.35);opacity:0;animation:clipPulse 3.2s ease-out infinite}
@keyframes clipPulse{0%{opacity:.55;transform:scale(.9)}70%{opacity:0;transform:scale(1.18)}100%{opacity:0}}
html[data-motion="off"] #clip-gear::after{animation:none}

.cs-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.62);backdrop-filter:blur(6px);display:flex;justify-content:flex-end;opacity:0;pointer-events:none;transition:opacity .25s ease}
.cs-overlay.open{opacity:1;pointer-events:auto}
.cs-panel{width:min(440px,100%);height:100%;background:linear-gradient(180deg,#0D0D11,#08080B);border-left:1px solid rgba(255,255,255,0.09);
  display:flex;flex-direction:column;transform:translateX(24px);transition:transform .3s cubic-bezier(.2,.7,.3,1);color:#fff;
  font-family:Montserrat,system-ui,-apple-system,sans-serif;box-shadow:-30px 0 60px rgba(0,0,0,0.6)}
.cs-overlay.open .cs-panel{transform:none}
.cs-head{display:flex;align-items:center;gap:12px;padding:18px 20px 14px;border-bottom:1px solid rgba(255,255,255,0.08)}
.cs-head .cs-logo{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,var(--gold,#C9A86A),var(--gold2,#E8C99A));color:#07070A;display:grid;place-items:center;font-weight:900;font-family:'Space Grotesk',sans-serif}
.cs-head h3{font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:800;letter-spacing:-0.5px;line-height:1.1}
.cs-head small{display:block;color:#8A8A90;font-size:11px;font-weight:600;margin-top:2px}
.cs-close{margin-left:auto;width:34px;height:34px;border-radius:99px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;cursor:pointer;display:grid;place-items:center}
.cs-close:hover{background:rgba(255,255,255,0.14)}
.cs-close svg{width:14px;height:14px;fill:currentColor}
.cs-tabs{display:flex;gap:6px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.07);overflow-x:auto;scrollbar-width:none}
.cs-tabs::-webkit-scrollbar{display:none}
.cs-tab{white-space:nowrap;padding:8px 13px;border-radius:99px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);
  color:rgba(255,255,255,0.7);font-size:11.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;font-family:inherit}
.cs-tab.active{background:#fff;color:#07070A;border-color:#fff}
.cs-body{flex:1;overflow-y:auto;padding:18px 20px 26px}
.cs-body::-webkit-scrollbar{width:8px}
.cs-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.14);border-radius:99px}

@media (max-width:820px){
  .cs-panel{width:100%;border-left:none;transform:translateY(26px)}
  .cs-overlay.open .cs-panel{transform:none}
  .cs-head{padding:14px 16px 12px;gap:10px}
  .cs-head h3{font-size:16px}
  .cs-head small{font-size:10.5px}
  .cs-close{width:38px;height:38px}
  .cs-tabs{padding:10px 14px;gap:5px}
  .cs-tab{font-size:10.5px;padding:8px 12px}
  .cs-body{padding:14px 14px calc(26px + env(safe-area-inset-bottom))}
  .cs-card{padding:12px!important}
  .cs-lbl{font-size:12.5px!important}
  .cs-lbl small{font-size:10.5px!important;line-height:1.5}
  .cs-help{font-size:10.5px!important;line-height:1.55}
  .cs-row{gap:8px!important}
  .cs-theme{width:calc(50% - 4px)!important}
  .cs-acc{width:38px!important;height:38px!important}
  .cs-src{flex:1 1 100%!important;min-width:0!important}
  .cs-input{font-size:16px!important}
  .cs-btn{font-size:12px!important;padding:11px 14px!important}
}

.cs-sec{margin-bottom:22px}
.cs-sec h4{font-size:11px;letter-spacing:1.3px;text-transform:uppercase;color:#8A8A90;font-weight:800;margin-bottom:10px}
.cs-sec p.cs-help{font-size:11.5px;color:#77777f;line-height:1.5;margin:-4px 0 10px}
.cs-themes{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.cs-theme{border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:8px;background:rgba(255,255,255,0.03);cursor:pointer;text-align:left;font-family:inherit;color:#fff;transition:.18s}
.cs-theme:hover{transform:translateY(-2px);border-color:rgba(255,255,255,0.2)}
.cs-theme.on{border-color:var(--gold,#C9A86A);box-shadow:0 0 0 1px var(--gold,#C9A86A) inset}
.cs-sw{height:44px;border-radius:8px;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,0.08)}
.cs-sw i{position:absolute;border-radius:5px}
.cs-theme b{display:block;font-size:11px;margin-top:6px;font-weight:800}
.cs-theme small{display:block;font-size:9.5px;color:#8A8A90;margin-top:1px}
.cs-accents{display:flex;gap:9px;flex-wrap:wrap}
.cs-acc{width:34px;height:34px;border-radius:99px;border:2px solid transparent;cursor:pointer;position:relative;transition:.18s}
.cs-acc:hover{transform:scale(1.08)}
.cs-acc.on{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,0.12)}
.cs-acc.on::after{content:"✓";position:absolute;inset:0;display:grid;place-items:center;color:#07070A;font-weight:900;font-size:14px}
.cs-seg{display:flex;gap:6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:12px;padding:5px}
.cs-seg button{flex:1;padding:8px 6px;border-radius:8px;border:none;background:transparent;color:rgba(255,255,255,0.68);font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit}
.cs-seg button.on{background:#fff;color:#07070A}
.cs-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)}
.cs-row:last-child{border-bottom:none}
.cs-row .cs-lbl{font-size:12.5px;font-weight:700}
.cs-row .cs-lbl small{display:block;font-weight:500;font-size:11px;color:#7C7C85;margin-top:2px;line-height:1.4}
.cs-switch{position:relative;width:44px;height:25px;border-radius:99px;background:rgba(255,255,255,0.14);border:none;cursor:pointer;flex-shrink:0;transition:.2s}
.cs-switch::after{content:"";position:absolute;top:3px;left:3px;width:19px;height:19px;border-radius:99px;background:#fff;transition:.2s}
.cs-switch.on{background:var(--gold,#C9A86A)}
.cs-switch.on::after{left:22px;background:#07070A}
.cs-field{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0}
.cs-field label{font-size:12.5px;font-weight:700;color:rgba(255,255,255,0.9)}
.cs-select{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;padding:8px 10px;border-radius:9px;font-family:inherit;font-size:12px;cursor:pointer;min-width:130px}
.cs-select option{background:#111113}
.cs-range{width:100%;accent-color:var(--gold,#C9A86A);margin-top:6px}
.cs-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:11px;border-radius:11px;
  border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#fff;font-weight:800;font-size:12.5px;cursor:pointer;font-family:inherit;margin-top:8px;transition:.18s}
.cs-btn:hover{background:rgba(255,255,255,0.12)}
.cs-btn.gold{background:linear-gradient(135deg,var(--gold,#C9A86A),var(--gold2,#E8C99A));color:#07070A;border:none}
.cs-btn.danger{border-color:rgba(229,9,20,0.45);color:#FF8A8A;background:rgba(229,9,20,0.1)}
.cs-btn.danger:hover{background:rgba(229,9,20,0.2)}
.cs-foot{padding:12px 20px 16px;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:8px;align-items:center}
.cs-foot small{color:#6E6E76;font-size:10.5px;line-height:1.4}
.cs-mini{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;color:#8A8A90;background:rgba(255,255,255,0.05);
  border:1px solid rgba(255,255,255,0.08);padding:4px 9px;border-radius:99px;margin-top:6px}
.cs-sources{display:grid;gap:8px}
.cs-src{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:12px;cursor:pointer;
  background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;font-family:inherit;text-align:left;transition:.18s}
.cs-src:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2)}
.cs-src.on{border-color:var(--gold,#C9A86A);background:rgba(201,168,106,0.12)}
.cs-src-dot{width:9px;height:9px;border-radius:99px;flex-shrink:0;box-shadow:0 0 10px currentColor}
.cs-src b{display:block;font-size:12.5px;font-weight:800}
.cs-src small{display:block;font-size:11px;color:#8A8A90;margin-top:1px}
.cs-src-tick{margin-left:auto;color:var(--gold,#C9A86A);font-weight:900}
.cs-input{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#fff;
  padding:10px 12px;border-radius:10px;font-family:inherit;font-size:12px;outline:none;margin:4px 0 6px}
.cs-input:focus{border-color:rgba(201,168,106,0.55)}
.cs-preview{display:flex;gap:8px;align-items:center;margin-top:10px;padding:10px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.12)}
.cs-preview .p-card{width:54px;height:78px;border-radius:8px;background:linear-gradient(160deg,var(--gold,#C9A86A) 0%,rgba(0,0,0,0.6) 75%);position:relative;overflow:hidden;flex-shrink:0;border:1px solid rgba(255,255,255,0.12)}
.cs-preview .p-card::after{content:"";position:absolute;left:6px;right:6px;bottom:8px;height:4px;border-radius:2px;background:rgba(255,255,255,0.8)}
.cs-preview .p-body{font-size:11px;color:#8A8A90;line-height:1.45}
.cs-preview .p-body b{color:#fff;font-size:12px;display:block;margin-bottom:2px}
`;
    document.head.appendChild(st);
  }

  const svgGear = '<svg viewBox="0 0 24 24"><path d="M19.4 13a7.6 7.6 0 000-2l2.1-1.6-2-3.4-2.5 1c-.5-.4-1.1-.7-1.7-1L15 3H9l-.3 2.6c-.6.3-1.2.6-1.7 1l-2.5-1-2 3.4L4.6 11a7.6 7.6 0 000 2l-2.1 1.6 2 3.4 2.5-1c.5.4 1.1.7 1.7 1L9 21h6l.3-2.6c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.4L19.4 13zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/></svg>';

  function injectGear() {
    if (document.getElementById('clip-gear')) return;
    const b = document.createElement('button');
    b.id = 'clip-gear';
    b.type = 'button';
    b.title = 'Settings — appearance & preferences';
    b.setAttribute('aria-label', 'Open settings');
    b.innerHTML = svgGear;
    b.addEventListener('click', open);
    document.body.appendChild(b);
  }

  function build() {
    ensureCss();
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'cs-overlay';
    overlay.id = 'clip-settings-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.innerHTML = `
      <aside class="cs-panel" role="dialog" aria-modal="true" aria-label="CLIP settings">
        <div class="cs-head">
          <div class="cs-logo">C</div>
          <div><h3>Settings</h3><small>Customize your CLIP appearance</small></div>
          <button class="cs-close" aria-label="Close settings" onclick="CLIP_SETTINGS.close()">
            <svg viewBox="0 0 24 24"><path d="M18.3 5.7L12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>
          </button>
        </div>
        <div class="cs-tabs">
          <button class="cs-tab" data-tab="appearance">Appearance</button>
          <button class="cs-tab" data-tab="layout">Layout</button>
          <button class="cs-tab" data-tab="playback">Playback</button>
          <button class="cs-tab" data-tab="data">Data</button>
        </div>
        <div class="cs-body" id="cs-body"></div>
        <div class="cs-foot">
          <small>Settings are saved in this browser only</small>
          <button class="cs-btn" style="width:auto;margin:0 0 0 auto;padding:8px 12px" onclick="CLIP_SETTINGS.reset()">Reset</button>
        </div>
      </aside>`;
    document.body.appendChild(overlay);
    panel = overlay.querySelector('.cs-panel');
    overlay.querySelectorAll('.cs-tab').forEach(t => {
      t.addEventListener('click', () => { activeTab = t.dataset.tab; renderBody(); });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) close();
    });
  }

  function renderBody() {
    const body = document.getElementById('cs-body');
    if (!body) return;
    overlay.querySelectorAll('.cs-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === activeTab));

    if (activeTab === 'appearance') body.innerHTML = viewAppearance();
    else if (activeTab === 'layout') body.innerHTML = viewLayout();
    else if (activeTab === 'playback') body.innerHTML = viewPlayback();
    else body.innerHTML = viewData();
  }

  function swatch(t) {
    return `<div class="cs-sw" style="background:${t.bg}">
      <i style="left:6px;top:6px;width:22px;height:30px;background:${t.card};border:1px solid ${t.line}"></i>
      <i style="right:6px;top:6px;width:18px;height:14px;background:var(--gold,#C9A86A);opacity:.9"></i>
      <i style="left:6px;bottom:6px;width:34px;height:5px;background:${t.card}"></i>
    </div>`;
  }

  function viewAppearance() {
    return `
      <div class="cs-sec">
        <h4>Theme</h4>
        <p class="cs-help">Base color for the entire site. Changes apply instantly.</p>
        <div class="cs-themes">
          ${Object.entries(THEMES).map(([id, t]) => `
            <button class="cs-theme ${state.theme === id ? 'on' : ''}" onclick="CLIP_SETTINGS.set('theme','${id}')">
              ${swatch(t)}<b>${t.label}</b><small>${t.note}</small>
            </button>`).join('')}
        </div>
      </div>

      <div class="cs-sec">
        <h4>Accent colour</h4>
        <p class="cs-help">Color for buttons, badges, progress bars and highlights.</p>
        <div class="cs-accents">
          ${Object.entries(ACCENTS).map(([id, a]) => `
            <button class="cs-acc ${state.accent === id ? 'on' : ''}" title="${a.label}"
              style="background:linear-gradient(135deg,${a.c1},${a.c2})"
              onclick="CLIP_SETTINGS.set('accent','${id}')"></button>`).join('')}
        </div>
        <div class="cs-mini">Selected: ${(ACCENTS[state.accent] || ACCENTS.gold).label}</div>
      </div>

      <div class="cs-sec">
        <h4>Corner style</h4>
        <div class="cs-seg">
          ${[['sharp', 'Sharp'], ['soft', 'Soft'], ['round', 'Round']].map(([v, l]) => `
            <button class="${state.radius === v ? 'on' : ''}" onclick="CLIP_SETTINGS.set('radius','${v}')">${l}</button>`).join('')}
        </div>
      </div>

      <div class="cs-sec">
        <h4>Text size</h4>
        <div class="cs-seg">
          ${[['sm', 'S'], ['md', 'M'], ['lg', 'L'], ['xl', 'XL']].map(([v, l]) => `
            <button class="${state.text === v ? 'on' : ''}" onclick="CLIP_SETTINGS.set('text','${v}')">${l}</button>`).join('')}
        </div>
      </div>

      <div class="cs-sec">
        <h4>Backdrop brightness</h4>
        <p class="cs-help">Hero image kitni roshan ho (${state.dim}%)</p>
        <input class="cs-range" type="range" min="45" max="115" value="${state.dim}"
          oninput="CLIP_SETTINGS.set('dim', Number(this.value))">
      </div>

      <div class="cs-preview">
        <div class="p-card"></div>
        <div class="p-body"><b>Live preview</b>
          ${(THEMES[state.theme] || THEMES.obsidian).label} theme • ${(ACCENTS[state.accent] || ACCENTS.gold).label} accent<br>
          ${state.radius} corners • ${state.text.toUpperCase()} text
        </div>
      </div>`;
  }

  function viewLayout() {
    return `
      <div class="cs-sec">
        <h4>Card density</h4>
        <p class="cs-help">How many posters appear in each row.</p>
        <div class="cs-seg">
          ${[['comfortable', 'Comfortable'], ['compact', 'Compact'], ['dense', 'Dense']].map(([v, l]) => `
            <button class="${state.density === v ? 'on' : ''}" onclick="CLIP_SETTINGS.set('density','${v}')">${l}</button>`).join('')}
        </div>
      </div>

      <div class="cs-sec">
        <h4>Show / hide</h4>
        <div class="cs-row">
          <div class="cs-lbl">Badges<small>TOP 10, NEW, rating chips</small></div>
          <button class="cs-switch ${state.badges ? 'on' : ''}" onclick="CLIP_SETTINGS.set('badges', ${!state.badges})"></button>
        </div>
        <div class="cs-row">
          <div class="cs-lbl">Platform logos<small>Streaming service icon in the poster corner</small></div>
          <button class="cs-switch ${state.prov ? 'on' : ''}" onclick="CLIP_SETTINGS.set('prov', ${!state.prov})"></button>
        </div>
        <div class="cs-row">
          <div class="cs-lbl">Empty Continue Watching<small>Off = the section is hidden completely</small></div>
          <button class="cs-switch ${state.emptyContinue ? 'on' : ''}" onclick="CLIP_SETTINGS.set('emptyContinue', ${!state.emptyContinue})"></button>
        </div>
        <div class="cs-row">
          <div class="cs-lbl">Glass blur<small>Frosted effect on the navbar / overlays</small></div>
          <button class="cs-switch ${state.glass ? 'on' : ''}" onclick="CLIP_SETTINGS.set('glass', ${!state.glass})"></button>
        </div>
      </div>

      <div class="cs-sec">
        <h4>Defaults</h4>
        <div class="cs-field">
          <label>Streaming region</label>
          <select class="cs-select" onchange="CLIP_SETTINGS.set('region', this.value)">
            ${REGIONS.map(([v, l]) => `<option value="${v}" ${state.region === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="cs-field">
          <label>Default platform</label>
          <select class="cs-select" onchange="CLIP_SETTINGS.set('platform', this.value)">
            ${PLATFORMS.map(([v, l]) => `<option value="${v}" ${state.platform === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="cs-field">
          <label>Default sorting</label>
          <select class="cs-select" onchange="CLIP_SETTINGS.set('sort', this.value)">
            <option value="popular" ${state.sort === 'popular' ? 'selected' : ''}>Most Popular</option>
            <option value="rating" ${state.sort === 'rating' ? 'selected' : ''}>Top Rated</option>
            <option value="newest" ${state.sort === 'newest' ? 'selected' : ''}>Newest</option>
          </select>
        </div>
        <p class="cs-help" style="margin-top:8px">The site will use these defaults on the next reload.</p>
      </div>`;
  }

  function viewPlayback() {
    const src = state.source || 'vidly';
    return `
      <div class="cs-sec">
        <h4>Streaming source</h4>
        <p class="cs-help">Player for Movies / Series / Anime. Vidly streams directly from a TMDB ID.</p>
        <div class="cs-sources">
          ${[['vidly', 'Vidly', 'Movies • Series • Anime', '#C9A86A'],
             ['trailer', 'Trailer', 'Official trailer (YouTube)', '#E50914'],
             ['custom', 'Custom', 'Your embed URL', '#3B82F6']].map(([v, n, d, c]) => `
            <button class="cs-src ${src === v ? 'on' : ''}" onclick="CLIP_SETTINGS.set('source','${v}')">
              <span class="cs-src-dot" style="background:${c}"></span>
              <span><b>${n}</b><small>${d}</small></span>
              ${src === v ? '<span class="cs-src-tick">✓</span>' : ''}
            </button>`).join('')}
        </div>
      </div>

      <div class="cs-sec">
        <h4>Player theme</h4>
        <div class="cs-seg">
          ${[['aurora', 'Aurora'], ['slate', 'Slate'], ['retro', 'Retro']].map(([v, l]) => `
            <button class="${state.playerTheme === v ? 'on' : ''}" onclick="CLIP_SETTINGS.set('playerTheme','${v}')">${l}</button>`).join('')}
        </div>
        <p class="cs-help" style="margin-top:8px">Accent color is applied automatically from Settings → Appearance (${clipAccentHex ? clipAccentHex() : ''}).</p>
      </div>

      <div class="cs-sec">
        <h4>Player behaviour</h4>
        <div class="cs-row">
          <div class="cs-lbl">Autoplay<small>Start streaming as soon as the player opens</small></div>
          <button class="cs-switch ${state.playerAutoplay ? 'on' : ''}" onclick="CLIP_SETTINGS.set('playerAutoplay', ${!state.playerAutoplay})"></button>
        </div>
        <div class="cs-row">
          <div class="cs-lbl">Next episode button<small>Prompt for the next episode in series</small></div>
          <button class="cs-switch ${state.playerNext ? 'on' : ''}" onclick="CLIP_SETTINGS.set('playerNext', ${!state.playerNext})"></button>
        </div>
        <div class="cs-field">
          <label>Anime audio</label>
          <div class="cs-seg" style="min-width:150px">
            ${[['sub', 'Sub'], ['dub', 'Dub']].map(([v, l]) => `
              <button class="${state.animeAudio === v ? 'on' : ''}" onclick="CLIP_SETTINGS.set('animeAudio','${v}')">${l}</button>`).join('')}
          </div>
        </div>
      </div>

      <div class="cs-sec">
        <h4>Custom embed</h4>
        <p class="cs-help">Placeholders: <code>{id}</code> <code>{season}</code> <code>{episode}</code> <code>{anime}</code> <code>{audio}</code> <code>{type}</code></p>
        <input id="cs-custom-player" class="cs-input" placeholder="https://example.com/embed/{type}/{id}"
          value="${String(state.customPlayer || '').replace(/"/g, '&quot;')}"
          onchange="CLIP_SETTINGS.set('customPlayer', this.value.trim())">
        <button class="cs-btn" onclick="CLIP_SETTINGS.set('customPlayer','')">Clear custom URL</button>
      </div>

      <div class="cs-sec">
        <h4>Hero banner</h4>
        <div class="cs-row">
          <div class="cs-lbl">Autoplay slides<small>Hero rotates automatically</small></div>
          <button class="cs-switch ${state.heroAutoplay ? 'on' : ''}" onclick="CLIP_SETTINGS.set('heroAutoplay', ${!state.heroAutoplay})"></button>
        </div>
        <div class="cs-field">
          <label>Slide duration</label>
          <select class="cs-select" onchange="CLIP_SETTINGS.set('heroSpeed', Number(this.value))">
            <option value="4000" ${state.heroSpeed == 4000 ? 'selected' : ''}>4 sec</option>
            <option value="7000" ${state.heroSpeed == 7000 ? 'selected' : ''}>7 sec</option>
            <option value="10000" ${state.heroSpeed == 10000 ? 'selected' : ''}>10 sec</option>
            <option value="15000" ${state.heroSpeed == 15000 ? 'selected' : ''}>15 sec</option>
          </select>
        </div>
        <div class="cs-row">
          <div class="cs-lbl">Animations & motion<small>Off = tez, bina animation</small></div>
          <button class="cs-switch ${state.motion ? 'on' : ''}" onclick="CLIP_SETTINGS.set('motion', ${!state.motion})"></button>
        </div>
      </div>`;
  }

  function viewData() {
    const list = window.CLIP_MYLIST ? CLIP_MYLIST.count() : 0;
    const cont = window.CLIP_CONTINUE ? CLIP_CONTINUE.count() : 0;
    return `
      <div class="cs-sec">
        <h4>Aapka data</h4>
        <div class="cs-row"><div class="cs-lbl">My List<small>Saved titles</small></div><b>${list}</b></div>
        <div class="cs-row"><div class="cs-lbl">Continue Watching<small>In-progress titles</small></div><b>${cont}</b></div>
        <div class="cs-row"><div class="cs-lbl">Storage<small>Browser localStorage</small></div><b style="color:#2ECC71">● Local</b></div>
      </div>

      <div class="cs-sec">
        <h4>Manage</h4>
        <button class="cs-btn" onclick="CLIP_SETTINGS.exportList()">⬇ Export My List (JSON)</button>
        <button class="cs-btn danger" onclick="CLIP_SETTINGS.clearContinue()">Clear Continue Watching (${cont})</button>
        <button class="cs-btn danger" onclick="CLIP_SETTINGS.clearList()">Clear My List (${list})</button>
      </div>

      <div class="cs-sec">
        <h4>Reset</h4>
        <button class="cs-btn" onclick="if(confirm('Reset all settings to defaults?'))CLIP_SETTINGS.reset()">↺ Reset all settings</button>
        <p class="cs-help" style="margin-top:8px">This restores themes, colors and layout to defaults. Your My List stays safe.</p>
      </div>`;
  }

  /* ---------------- actions ---------------- */
  function open() {
    build();
    if (!overlay) return;
    renderBody();
    void overlay.offsetWidth;            // force reflow so the slide-in animates
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function exportList() {
    const data = window.CLIP_MYLIST ? CLIP_MYLIST.all() : [];
    if (!data.length) { if (window.clipToast) clipToast('My List is empty'); return; }
    const blob = new Blob([JSON.stringify({ app: 'CLIP Premium', exported: new Date().toISOString(), items: data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'clip-my-list.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    if (window.clipToast) clipToast('My List exported ✓');
  }
  function clearContinue() {
    if (!window.CLIP_CONTINUE) return;
    if (!confirm('Clear Continue Watching?')) return;
    CLIP_CONTINUE.clear();
    if (window.clipToast) clipToast('Continue Watching cleared');
    renderBody();
  }
  function clearList() {
    if (!window.CLIP_MYLIST) return;
    if (!confirm('Clear My List?')) return;
    CLIP_MYLIST.clear();
    if (window.clipToast) clipToast('My List cleared');
    renderBody();
  }

  window.CLIP_SETTINGS = {
    get, set, patch, reset, apply, open, close, exportList, clearContinue, clearList,
    all: () => Object.assign({}, state),
    themes: THEMES, accents: ACCENTS
  };

  /* ---------------- boot ---------------- */
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    injectGear();
  });
  if (document.readyState === 'interactive' || document.readyState === 'complete') injectGear();
})();
