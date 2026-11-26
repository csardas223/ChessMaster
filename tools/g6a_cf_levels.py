# Build Chessformer level FENs from char grids. Legend: . empty, # green terrain, k red king, K Q R B N P blue,
# y key (neutral), L lock (neutral), p purple block (neutral), ? choice piece (white 'Ch'), o button tile (empty square)
import json, sys
def fen(grid):
    rows = []; tiles = {}
    R = len(grid); F = len(grid[0])
    for r, line in enumerate(grid):
        assert len(line) == F, (r, len(line))
        out = ''; e = 0
        def flush():
            nonlocal out, e
            if e: out += str(e); e = 0
        for c, ch in enumerate(line):
            sq = 'abcdefghijklmnop'[c] + str(R - r)
            if ch in '.o':
                e += 1
                if ch == 'o': tiles[sq] = 'button'
                continue
            flush()
            out += {'#': '*', 'k': 'k', 'y': '[n:Ky]', 'L': '[n:Lk]', 'p': '[n:Pb]', '?': '[Ch]'}.get(ch, ch)
        flush(); rows.append(out)
    return '/'.join(rows), tiles
def pad8(f8):
    """embed an 8x8 placeholder fen in a 16x11 board: everything around it is green terrain"""
    rows = f8.split('/'); out = ['*' * 16 for _ in range(3)]
    for r in rows: out.append('*' * 4 + r + '*' * 4)
    # compress '*' runs is not needed: '*' is one square each
    return '/'.join(out)
L39 = [
 '................',
 '.............#..',
 '...y#.....#.....',   # d9 key rests on a thin ledge (tile), j10 ledge above
 '....#.....L.....',
 '....#ppppp#..k..',
 '....#.....#..#..',
 '...o#.....#.....',
 '...##.....#.....',
 '....#.....#.....',
 '....#?.B.R#.....',
 '################',
]
if __name__ == '__main__':
    f, t = fen(L39); print(json.dumps({'fen': f, 'tiles': t}))
