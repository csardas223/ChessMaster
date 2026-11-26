"""Wire the v6 per-mode sounds into the mode files (idempotent; safe to re-run on a fresh main).
Usage (repo root): python3 tools/sfx/wire_v6.py [--check]
For each mode: merges entries into the spec's `sounds` map (adds the map when missing) and swaps the generic
ctx.sound('<core>') calls of that mode's own events for its designed sounds. A key that names a core event
(game-start, victory, defeat, jumpscare, explosion, capture ...) replaces that event for this mode only
(js/core/sound.js scope). --check reports what would change and exits 1 if anything is not wired."""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from modes_v6 import WIRE

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))


def snd_path(v):
    return v if '/' in v else None


def apply(mid, w, check=False):
    p = os.path.join(ROOT, 'data', 'modes', mid + '.js')
    src = open(p).read()
    out, notes = src, []
    for old, new in w.get('repl', []):
        if new in out and old not in out:
            continue
        n = out.count(old)
        if n == 0:
            notes.append('MISSING call: ' + old[:70]); continue
        out = out.replace(old, new)
    want = w['sounds']
    m = re.search(r'^([ \t]*)sounds:\s*\{([^}]*)\}', out, re.M)
    if m:
        have = dict(re.findall(r"""['"]?([\w-]+)['"]?\s*:\s*['"]([^'"]+)['"]""", m.group(2)))
        merged = dict(have); merged.update(want)
        if merged != have:
            body = ', '.join("'%s': '%s'" % (k, v) for k, v in merged.items())
            out = out[:m.start()] + m.group(1) + 'sounds: { ' + body + ' }' + out[m.end():]
    else:
        h = re.search(r'^([ \t]*)(hooks|source|_deferred|messages):', out, re.M)
        if not h:
            notes.append('NO anchor for sounds map'); h = None
        else:
            body = ', '.join("'%s': '%s'" % (k, v) for k, v in want.items())
            line = h.group(1) + "sounds: { " + body + " },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */\n"
            out = out[:h.start()] + line + out[h.start():]
    changed = out != src
    if changed and not check:
        open(p, 'w').write(out)
    return changed, notes


def main():
    check = '--check' in sys.argv
    bad = 0
    for mid, w in WIRE.items():
        ch, notes = apply(mid, w, check)
        print('%-14s %s %s' % (mid, ('would change' if check else 'wired') if ch else 'ok', '; '.join(notes)))
        bad += bool(notes) + (check and ch)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
