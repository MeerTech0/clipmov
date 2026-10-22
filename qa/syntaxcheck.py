import re, subprocess, sys, tempfile, os
files = ['index.html','movies.html','series.html','platform.html','detail.html','watch.html','mylist.html','404.html']
bad = 0
for f in files:
    s = open(f, encoding='utf-8').read()
    blocks = re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', s, re.S)
    n_ok = 0
    for i, b in enumerate(blocks):
        if not b.strip():
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as t:
            t.write(b); p = t.name
        r = subprocess.run(['node', '--check', p], capture_output=True, text=True)
        os.unlink(p)
        if r.returncode != 0:
            bad += 1
            print(f'FAIL {f} block#{i}: {r.stderr.splitlines()[0] if r.stderr else "?"}')
        else:
            n_ok += 1
    print(f'{"OK  " if bad == 0 else "    "}{f}: {n_ok} inline script blocks parsed')
sys.exit(1 if bad else 0)
