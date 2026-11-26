#!/usr/bin/env python3
"""Static path check for the Chess Master site tree (rebuild/app, or the repo root on main).

Every literal path in index.html, css/, js/ and data/ (comments stripped) that points at assets/, data/, js/, css/ must
  - be relative (no leading "/": GitHub Pages serves the project under /ChessMaster/),
  - stay inside the site (no ../research, ../tools or climbing out of the root),
  - match a real file with the exact case (GitHub Pages / Linux are case-sensitive).
css-relative "../assets/..." inside url() of a stylesheet or of a --mode-bg theme background is fine (resolved from css/).

  python3 check_site_paths.py <site_dir>        exit 1 on any problem
Dynamic paths built at runtime ('assets/modes/' + id + ...) are not visible here: smoke_site.py / a QA sweep covers them."""
import os, re, sys

root = sys.argv[1] if len(sys.argv) > 1 else '.'
files = set()
for d, dirs, fs in os.walk(root):
    dirs[:] = [x for x in dirs if x not in ('.git', 'node_modules')]
    for f in fs:
        files.add(os.path.relpath(os.path.join(d, f), root).replace(os.sep, '/'))
lower = {f.lower(): f for f in files}
PAT = re.compile(r"""(?<![\w./-])((?:\.\./|\./|/)*(?:assets|data|js|css|research|tools)/[A-Za-z0-9_\-./ %]+?\.(?:png|jpe?g|gif|webp|svg|mp3|wav|ogg|json|js|css|glb|gltf|woff2?|ttf))(?![\w])""")
problems, notes, n = [], [], 0
for f in sorted(files):
    if f.startswith(('tools/', 'docs/', 'js/vendor/')) or not f.endswith(('.js', '.css', '.html')):
        continue
    src = open(os.path.join(root, f), encoding='utf-8', errors='replace').read()
    src = re.sub(r'/\*.*?\*/', '', src, flags=re.S)
    src = re.sub(r'<!--.*?-->', '', src, flags=re.S)
    src = re.sub(r'(?m)(^|[^:\\"\'])//.*$', r'\1', src)
    for m in PAT.finditer(src):
        p = m.group(1); n += 1
        if p.startswith('/'):
            problems.append((f, p, 'absolute URL (breaks under a /ChessMaster/ subpath)')); continue
        before = src[max(0, m.start() - 5):m.start()]
        meta = f.startswith('data/modes/') and p.startswith(('research/', 'tools/'))
        if meta:   # spec provenance in source/notes text (build-data keeps it as metadata); never requested
            notes.append((f, p)); continue
        # stylesheets resolve from css/; a '../assets' url() in a mode theme background is a css custom property
        # (--mode-bg) used by css/game.css, so it also resolves from css/; everything else resolves from the page
        css_rel = f.endswith('.css') or ('url(' in before and p.startswith('../'))
        base = 'css' if css_rel else ''
        rp = os.path.normpath(os.path.join(base, p)).replace(os.sep, '/')
        if rp.startswith('..'):
            problems.append((f, p, 'climbs out of the site root')); continue
        if rp.startswith(('research/', 'tools/')):
            problems.append((f, p, 'runtime reference to a dev-only folder')); continue
        if rp in files:
            continue
        if rp.lower() in lower:
            problems.append((f, p, 'case mismatch, real file is ' + lower[rp.lower()]))
        else:
            problems.append((f, p, 'missing file'))
print(f'check_site_paths: {n} literal paths checked in {root}')
if notes:
    print(f'  info: {len(notes)} research/ or tools/ mentions in mode-file provenance text (metadata, not loaded)')
for p in problems:
    print('  PROBLEM', ' | '.join(p))
if not problems:
    print('  ok: all relative, inside the site, case-exact')
sys.exit(1 if problems else 0)
