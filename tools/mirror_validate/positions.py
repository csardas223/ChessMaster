"""games.pgn -> positions.json: every ply's FEN before the move, the move (UCI), game and ply. Checks legality."""
import chess.pgn, json, os
D = os.path.dirname(os.path.abspath(__file__)); out = []
with open(os.path.join(D, 'games.pgn')) as f:
    while True:
        g = chess.pgn.read_game(f)
        if not g: break
        b = g.board(); moves = []
        for i, m in enumerate(g.mainline_moves()):
            out.append({'game': g.headers['Event'], 'ply': i, 'fen': b.fen(), 'uci': m.uci(), 'line': list(moves)})
            moves.append(m.uci()); b.push(m)
        if g.errors: raise SystemExit(f"{g.headers['Event']}: {g.errors}")
json.dump(out, open(os.path.join(D, 'positions.json'), 'w'))
print(len(out), 'plies')
