#!/usr/bin/env python3
"""Generate platform.html (platform hub: Netflix / Prime / Disney+ / ...).

Reuses the proven head (all tokens + CSS) and the four shared modules
(settings, player, tmdb, clip) from movies.html, then swaps in the
platform-specific markup + script.
"""
import re, pathlib

ROOT = pathlib.Path('/home/user')
src = (ROOT / 'movies.html').read_text(encoding='utf-8')

head_end = src.index('</head>') + len('</head>')
head = src[:head_end]
head = head.replace('<title>CLIP — Movies</title>', '<title>CLIP — Platform</title>')
css = (ROOT / 'tools/platform_css.txt').read_text(encoding='utf-8')
head = head.replace('</head>', '<style>' + css + '</style>\n</head>', 1)

# ----- sprite + navbar -----
p0 = src.index('<!-- inline icon sprite')
p1 = src.index('</nav>') + len('</nav>')
prefix = src[p0:p1]
prefix = prefix.replace('<a class="active" href="movies.html">Movies</a>', '<a href="movies.html">Movies</a>')

# ----- footer + mobile bottom nav -----
f0 = src.index('<footer')
f1 = src.index('</footer>') + len('</footer>')
footer = src[f0:f1]
m0 = src.index('<nav class="mbn"')
m1 = src.index('</body>')
mbn = src[m0:m1]
mbn = mbn.replace('<a class="mbn-item on" href="movies.html">', '<a class="mbn-item" href="movies.html">')

# ----- the four shared module script blocks -----
blocks = [m.group(0) for m in re.finditer(r'<script\b[^>]*>.*?</script>', src, re.S)]
assert len(blocks) == 5, f'expected 5 script blocks, found {len(blocks)}'
# blocks 0 & 1 (settings, player) already live in the copied <head>;
# blocks 2 & 3 are the tmdb + clip modules that must be appended once.
modules = '\n\n'.join(blocks[2:4])

main = (ROOT / 'tools/platform_main.html').read_text(encoding='utf-8')
app_js = (ROOT / 'tools/platform_script.js').read_text(encoding='utf-8')

out = '\n'.join([
    head,
    '<body class="browse-page plat-page">',
    prefix,
    '',
    main.strip(),
    '',
    footer.strip(),
    '',
    mbn.strip(),
    '',
    modules,
    '',
    '<script>',
    app_js.strip(),
    '</script>',
    '</body>',
    '</html>',
    '',
])
(ROOT / 'platform.html').write_text(out, encoding='utf-8')
print(f'platform.html written: {len(out)/1024:.1f} KB, {out.count("<script")} script blocks')
