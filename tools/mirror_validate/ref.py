"""Reference scores from a native Stockfish (python-chess): for every ply in positions.json, MultiPV 2 at --depth on the
position before the move, plus the played move alone (searchmoves) at the same depth when it is not one of the two
lines. Scores are from the mover's view ({cp} or {mate}). Resumable: run again until it prints 'done'.
  python3 ref.py --sf /path/to/stockfish [--depth 18] [--budget 100]"""
import chess, chess.engine, json, os, time, argparse
D = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument('--sf', default=os.environ.get('SF', 'stockfish')); ap.add_argument('--depth', type=int, default=18)
ap.add_argument('--budget', type=float, default=100); ap.add_argument('--out', default=os.path.join(D, 'ref.json')); a = ap.parse_args()
P = json.load(open(os.path.join(D, 'positions.json')))
R = json.load(open(a.out)) if os.path.exists(a.out) else {}
def sc(s):
    s = s.relative
    return {'mate': s.mate()} if s.is_mate() else {'cp': s.score()}
e = chess.engine.SimpleEngine.popen_uci(a.sf); e.configure({'Threads': 1, 'Hash': 64}); t0 = time.time()
for p in P:
    k = f"{p['game']}#{p['ply']}"
    if k in R: continue
    if time.time() - t0 > a.budget: break
    b = chess.Board(p['fen']); m = chess.Move.from_uci(p['uci'])
    info = e.analyse(b, chess.engine.Limit(depth=a.depth), multipv=2)
    L = [(i['pv'][0].uci(), sc(i['score'])) for i in info if 'pv' in i]
    r = {'best': L[0][1], 'second': L[1][1] if len(L) > 1 else None, 'bestUci': L[0][0], 'playedIsBest': L[0][0] == p['uci']}
    hit = [s for u, s in L if u == p['uci']]
    if hit: r['played'] = hit[0]
    else:
        i2 = e.analyse(b, chess.engine.Limit(depth=a.depth), root_moves=[m]); r['played'] = sc(i2['score'])
    R[k] = r; json.dump(R, open(a.out, 'w'))
e.quit()
print(len(R), '/', len(P), 'done' if len(R) == len(P) else 'partial')
