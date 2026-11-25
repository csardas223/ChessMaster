"""levels (2026-11-25): Chessformer levels transcribed cell by cell from paused 1080p video frames
(research/frames/video_thumbs/<id>_frame_<s>.jpg; 16 x 10 play area + the green floor row), plus a solver
that proves every level solvable under the rules js/modes/g6_levels.js implements.

Legend: . empty  # green terrain/pipe/block  k red king  K Q R B N P blue  y key  L lock  p purple block
        ? choice slot (pick a piece)  o button tile (an empty square with the purple dome)
ledges: squares with a thin ledge under them: a falling piece stops on it; moves (sliding or stepping, any
        direction) pass through it (Level 37: the rook slides down off the ledge onto the purple block).

Rules (frames + transcripts): normal chess moves; after every move every piece falls straight down until it
rests on terrain / a piece / a ledge / the floor; keys and locks and purple blocks never fall. Capturing the
last key removes every lock. While any piece stands on a button the purple blocks are gone; when nobody
stands on a button they come back on their empty squares (falls + buttons repeat until nothing changes). A blue
piece that FALLS (>= 1 square) onto the red king captures it ('drop on the king's head', L45/L48 transcripts).
Every pawn may move two squares on its first move, from any rank (L42 transcript: 'Can they all move two
squares? Oh, they can'); a pawn that
reaches the top row promotes (Q/R/B/N). Capture the red king to clear the level.

Usage: python3 g6_cf_levels.py [--solve] [--json]  (--json prints {id: [level...]} with fen + tiles)"""
import sys, json, heapq
from collections import deque

W, H = 16, 10
CHOICE = ['R', 'B', 'N', 'K', 'P']
LEVELS = {
 'oAoik9Dj2qQ': [
  dict(name='Level 21', src='oAoik9Dj2qQ_frame_29 (0:29)', ledges=[(8, 0), (10, 0)], grid=[
   '......#y...y#...',
   '....#....#..#...',
   '.y.......L..#...',
   '.#BKy...RL......',
   '#####..LLLLLL...',
   '#k..............',
   '###......LL.....',
   '..#.......L..L..',
   '..#.......L..L..',
   '..#.......L..L..']),
  dict(name='Level 27', src='oAoik9Dj2qQ_frame_547 (9:07)', ledges=[(5, 1), (9, 1)], grid=[
   '................',
   '....#..#..#.....',
   '................',
   '................',
   '................',
   '..y....#....L...',
   '..#.........#...',
   '............#...',
   '............#.k.',
   '...R.R.R.R.R..#.']),
 ],
 'p6W3yDU-v88': [
  dict(name='Level 37', src='p6W3yDU-v88_frame_16 (0:16)', ledges=[(0, 1), (10, 1)], choice=CHOICE, grid=[
   '........k.......',
   '.......###p.##..',
   '.............o..',
   'p............#..',
   '................',
   '?.#...#...#...#.',
   '?...............',
   '#.#.#.#.#.#.#.#.',
   '................',
   '................']),
  dict(name='Level 38', src='p6W3yDU-v88_frame_77 (1:17)', ledges=[(5, 7)], grid=[
   '###..........###',
   '##............##',
   '#....#######...#',
   '.....#k....#....',
   '....######.#....',
   '....#......#....',
   '....#......#....',
   '....#......#....',
   '....#......#....',
   '....#BNQKRP#....']),
  dict(name='Level 39', src='p6W3yDU-v88_frame_149 (2:29)', ledges=[(0, 1), (3, 3), (0, 5)], choice=CHOICE, grid=[
   '#.........##.##.',
   '..........##.##.',
   '.#####....##....',
   '....##....######',
   '#...##.......k##',
   '..#.##....######',
   '...y##....##....',
   '.L.###....##.##.',
   '....##....##.##.',
   '....??????##....']),
  dict(name='Level 40', src='p6W3yDU-v88_frame_201 (3:21)', ledges=[], choice=CHOICE, grid=[
   '.............#.#',
   '.......###...#..',
   '#.#....#?#.....?',
   '...#...###...#.#',
   '.?.#........##.#',
   '#####........#.#',
   '######......####',
   '#.....#......#.#',
   '#.#####...?.....',
   '#k###.....#.....']),
  dict(name='Level 41', src='p6W3yDU-v88_frame_267 (4:27)', ledges=[(7, 0), (7, 1), (14, 1), (7, 2), (7, 3), (7, 4), (3, 6)], grid=[
   '...y..p.p....###',
   '...#..#B#..###k#',
   '......#.#..#.#.#',
   '##....#B#.##o#.#',
   '..#...L.L...##.#',
   '...........##.##',
   '.#..#..P.#.#.##.',
   '....#..#...#....',
   '#..P#......####.',
   '.K###..N........']),
  dict(name='Level 42', src='p6W3yDU-v88_frame_371 (6:11)', ledges=[(0, 0), (1, 0), (7, 0), (10, 0), (14, 0), (0, 2), (1, 2), (10, 2)], grid=[
   '..#..y#L##L#..p.',
   '..#.###.##.##...',
   'PP#..#.P##P#..P.',
   '...###.###.#..#.',
   '...###..##.##.#.',
   '#########.#####.',
   '####.#..#...#k#.',
   '...###..##.###..',
   '...###......###.',
   '.o.###......###.']),
  dict(name='Level 45', src='p6W3yDU-v88_frame_716 (11:56)', ledges=[], grid=[
   '....########....',
   '..#........#..#.',
   '.#..##.....#.#..',
   '..#..#.....#..#.',
   '.#...#.....#.#..',
   '..#k.#.....#..#.',
   '.#.#.#BBBBB#.#..',
   '..#..#BBBBB#..#.',
   '.#...#BBBBB#.#..',
   '.....#BBKBB#....']),
  dict(name='Level 47', src='p6W3yDU-v88_maxres3 (YouTube still; the bishop and rook shown there were the first two picks, all three slots start as ?)', ledges=[(9, 1), (3, 2)], choice=CHOICE, grid=[
   '................',
   '.............#..',
   '...y#.....#.....',
   '....#.....L.....',
   '....#ppppp#..k..',
   '....#.....#..#..',
   '...o#.....#.....',
   '...##.....#.....',
   '....#.....#.....',
   '....#?.?.?#.....']),
 ]}

# levels transcribed later (tools/g6_cf_new_levels.py, NEW = {'L22': {...}}) merged in level order
def _merge():
    import os
    g = {}; exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'g6_cf_new_levels.py')).read(), g)
    for key, lv in g['NEW'].items():
        n = int(key[1:]); lv = dict(lv, name='Level %d' % n)
        vid = 'oAoik9Dj2qQ' if n <= 36 else 'p6W3yDU-v88'
        if not any(x['name'] == lv['name'] for x in LEVELS[vid]): LEVELS[vid].append(lv)
    for vid in LEVELS: LEVELS[vid].sort(key=lambda x: int(x['name'].split()[1]))
_merge()

FILES = 'abcdefghijklmnop'
def sqname(c, r): return FILES[c] + str(H + 1 - r)   # +1: the floor is rank 1

def to_fen(lv):
    rows = []
    for line in lv['grid']:
        out, e = '', 0
        for ch in line:
            if ch in '.o': e += 1; continue
            if e: out += str(e); e = 0
            out += {'#': '*', 'k': 'k', 'y': '[n:Ky]', 'L': '[n:Lk]', 'p': '[n:Pb]', '?': '[Ch]'}.get(ch, ch)
        if e: out += str(e)
        rows.append(out)
    rows.append('*' * W)   # floor
    tiles = {}
    for r, line in enumerate(lv['grid']):
        for c, ch in enumerate(line):
            if ch == 'o': tiles[sqname(c, r)] = 'button'
    for c, r in lv.get('ledges', []): tiles[sqname(c, r)] = 'ledge'
    return '/'.join(rows), tiles

# ---------------- solver ----------------
BLUE = set('KQRBNPA?')
SLIDE = {'R': [(1, 0), (-1, 0), (0, 1), (0, -1)], 'B': [(1, 1), (1, -1), (-1, 1), (-1, -1)]}
SLIDE['Q'] = SLIDE['R'] + SLIDE['B']
KN = [(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)]

class Level:
    def __init__(self, lv):
        g = [list(l) for l in lv['grid']]
        self.btn = set(); self.purple = []
        for r in range(H):
            for c in range(W):
                if g[r][c] == 'o': self.btn.add(r * W + c); g[r][c] = '.'
                if g[r][c] == 'p': self.purple.append(r * W + c)
        self.ledge = set(r * W + c for c, r in lv.get('ledges', []))
        self.start = self.settle(list(''.join(''.join(x) for x in g)))
    def settle(self, b):
        for _ in range(8):
            ch = False
            for r in range(H - 2, -1, -1):
                for c in range(W):
                    i = r * W + c
                    if b[i] not in BLUE and b[i] != 'k': continue
                    j = i
                    while j not in self.ledge and j + W < W * H and b[j + W] == '.': j += W
                    if (j != i and b[i] in BLUE and j not in self.ledge and j + W < W * H and b[j + W] == 'k'):
                        b[j + W] = b[i]; b[i] = '.'; return ''.join(b)   # fell onto the red king's head: captured (win)
                    if j != i: b[j] = b[i]; b[i] = '.'; ch = True
            if self.purple:
                pressed = any(b[i] != '.' for i in self.btn)
                for i in self.purple:
                    if pressed and b[i] == 'p': b[i] = '.'; ch = True
                    elif not pressed and b[i] == '.': b[i] = 'p'; ch = True
            if not ch: break
        return ''.join(b)
    def targets(self, b, i, t):
        c, r = i % W, i // W; out = []
        def ok(j): return b[j] in '.ky'
        if t in SLIDE:
            for dx, dy in SLIDE[t]:
                x, y, cur = c, r, i
                while True:
                    x += dx; y += dy
                    if not (0 <= x < W and 0 <= y < H): break
                    j = y * W + x
                    if b[j] == '.': out.append(j); cur = j; continue
                    if b[j] in 'ky': out.append(j)
                    break
        elif t == 'K':
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    if not (dx or dy): continue
                    x, y = c + dx, r + dy
                    if 0 <= x < W and 0 <= y < H and ok(y * W + x): out.append(y * W + x)
        elif t == 'N':
            for dx, dy in KN:
                x, y = c + dx, r + dy
                if 0 <= x < W and 0 <= y < H and ok(y * W + x): out.append(y * W + x)
        elif t in 'PA':
            if r > 0 and b[i - W] == '.':
                out.append(i - W)
                if t == 'P' and r > 1 and b[i - 2 * W] == '.': out.append(i - 2 * W)
            for dx in (-1, 1):
                x = c + dx
                if r > 0 and 0 <= x < W and b[(r - 1) * W + x] in 'ky': out.append((r - 1) * W + x)
        return out
    def succ(self, s):
        for i, ch in enumerate(s):
            if ch not in BLUE: continue
            types = CHOICE if ch == '?' else [ch]
            for t in types:
                for j in self.targets(s, i, t):
                    if s[j] == 'k': yield ((i, j, t), None); continue
                    nt = t
                    if t == 'P' or t == 'A': nt = 'A'
                    promos = ['Q', 'R', 'B', 'N'] if nt == 'A' and j < W else [nt]
                    for pt in promos:
                        b = list(s); cap = b[j]; b[j] = pt; b[i] = '.'
                        if cap == 'y' and 'y' not in b: b = ['.' if x == 'L' else x for x in b]
                        ns = self.settle(b)
                        yield ((i, j, t if pt == nt else t + '=' + pt), None if 'k' not in ns else ns)   # None = level won

def solve(lv, limit=2_000_000, greedy=False, assign=None):
    L = Level(lv); start = L.start
    if assign:   # fix the '?' picks (reading order) to prove one choice works; the game lets you pick any
        it = iter(assign); start = ''.join(next(it) if ch == '?' else ch for ch in start)
    par = {start: None}
    kpos = start.index('k')
    def h(s):   # best-first: blue pieces closer to the king first
        kc, kr = kpos % W, kpos // W
        return min((abs(i % W - kc) + abs(i // W - kr)) for i, ch in enumerate(s) if ch in BLUE)
    if greedy:
        heap = [(h(start), 0, start)]; n = 0
        while heap and len(par) < limit:
            _, d, s = heapq.heappop(heap)
            for mv, ns in L.succ(s):
                if ns is None: return path(par, s) + [mv], len(par)
                if ns not in par: par[ns] = (s, mv); n += 1; heapq.heappush(heap, (h(ns) + d * 0.05, d + 1, ns))
        return None, len(par)
    q = deque([start])
    while q and len(par) < limit:
        s = q.popleft()
        for mv, ns in L.succ(s):
            if ns is None: return path(par, s) + [mv], len(par)
            if ns not in par: par[ns] = (s, mv); q.append(ns)
    return None, len(par)

def path(par, s):
    out = []
    while par[s]: s, mv = par[s]; out.append(mv)
    return out[::-1]

def fmt(mv):
    i, j, t = mv; return t + ':' + sqname(i % W, i // W) + '-' + sqname(j % W, j // W)

if __name__ == '__main__':
    if '--grids' in sys.argv:   # raw transcriptions for tools/g6_cf_solve.mjs (fast BFS in node)
        print(json.dumps({vid: [dict(name=lv['name'], grid=lv['grid'], ledges=lv.get('ledges', []), choice=lv.get('choice'))
                                for lv in lvs] for vid, lvs in LEVELS.items()})); sys.exit()
    if '--json' in sys.argv:
        out = {}
        for vid, lvs in LEVELS.items():
            out[vid] = []
            for lv in lvs:
                f, t = to_fen(lv); d = {'name': lv['name'], 'fen': f}
                if t: d['tiles'] = t
                if lv.get('choice'): d['choice'] = lv['choice']
                out[vid].append(d)
        print(json.dumps(out)); sys.exit()
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    for vid, lvs in LEVELS.items():
        for lv in lvs:
            if only and lv['name'] not in only and lv['name'].replace('Level ', 'L') not in only: continue
            for row in lv['grid']: assert len(row) == W, (lv['name'], row)
            assert len(lv['grid']) == H
            asg = [a.split('=')[1] for a in sys.argv if a.startswith('--assign=')]
            sol, n = solve(lv, greedy='--greedy' in sys.argv, assign=(asg[0] if asg else lv.get('intended')))
            print(vid, lv['name'], 'states', n, 'SOLVED in %d moves: ' % len(sol) + ' '.join(fmt(m) for m in sol) if sol else 'NOT SOLVED', flush=True)
