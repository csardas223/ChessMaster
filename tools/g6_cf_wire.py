"""cf-2 (2026-11-25): wire the transcribed Chessformer levels (tools/g6_cf_levels.py LEVELS + g6_cf_new_levels.py NEW) into
data/modes/oAoik9Dj2qQ.js (levels 21-36) and data/modes/p6W3yDU-v88.js (levels 37-48). Idempotent: re-run after adding or fixing
a transcription. Board 16 x 11 (10 play rows + the green floor), lib-side gravity with thin ledges + fall-onto-king capture,
purple buttons/blocks, '?' choice slots (R/B/N/K/P, no queen), every pawn may double-step once.
Run: python3 tools/g6_cf_wire.py"""
import os, re, json, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import g6_cf_levels as S
HINTS = {'Level 21': 'Pieces fall after every move. Capture the red king, or drop a piece onto its head',
         'Level 37': 'Pick a piece for each ? slot. Standing on the purple button removes the purple blocks',
         'Level 42': 'Every pawn may move two squares on its first move and promote at the top'}
def levels(vid):
    out = []
    for lv in S.LEVELS[vid]:
        f, t = S.to_fen(lv); d = {'name': lv['name'], 'fen': f}
        if t: d['tiles'] = t
        if lv.get('choice'): d['choice'] = lv['choice']
        if lv['name'] in HINTS: d['hint'] = HINTS[lv['name']]
        out.append(d)
    return out
for vid in ['oAoik9Dj2qQ', 'p6W3yDU-v88']:
    p = os.path.join(HERE, '..', 'data', 'modes', vid + '.js'); s = open(p).read(); L = levels(vid)
    A = 'assets/modes/p6W3yDU-v88/'
    s = re.sub(r"\n  board: \{[^\n]*\n", "\n  board: { files: 16, ranks: 11, light: '#c4a06e', dark: '#a98549' /* 16 x 10 play area + the green floor row, colours sampled from the frames */ },\n", s)
    s = re.sub(r"\n  setup: \{[^\n]*\n", "\n  setup: { fen: '%s' },\n" % L[0]['fen'], s)
    s = re.sub(r"\n  rules: \{[^\n]*\n", "\n  rules: { check: 'none', castling: false, enPassant: false, gravity: null, promotion: { choices: ['Q', 'R', 'B', 'N'] } },\n", s)
    params = ("{ passColor: 'b', run: 'Level', unlock: { key: 'Ky', lock: 'Lk' }, gravity: { dir: 'down', exempt: ['Ky', 'Lk', 'Pb'], fallCapture: true }, "
              "ledges: true, pawnDoubleAnyRank: true, buttons: { block: 'Pb', img: '" + A + "button.png' }, choicePiece: 'Ch', levelSelect: true, fallAnim: true, dissolve: true, levels: " + json.dumps(L) + " }")
    s = re.sub(r"\n  params: \{[^\n]*\n", "\n  params: " + params + ",\n", s)
    s = re.sub(r"\n  todo_pass2: \[[^\n]*\n", "\n", s)
    if "Pb:" not in s:
        s = s.replace("    Ky: {", "    Pb: { name: 'Purple block', moves: '', value: 0, blocker: true, overlay: null, img: '" + A + "purple_block.png' },\n"
                      "    Ch: { name: 'Choice slot', moves: '', value: 0, img: { w: '" + A + "choice.png' } },\n    Ky: {", 1)
    open(p, 'w').write(s)
    print(vid, len(L), 'levels:', ' '.join(x['name'].split()[1] for x in L))
