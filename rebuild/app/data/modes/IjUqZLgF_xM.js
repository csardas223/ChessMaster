/* Can I BEAT 4 Player Chess? (again)  chess.com 4 Player Chess FFA vs three humans (Red ~2000, Blue ~1500, Green ~2200); Tony plays Yellow and takes 1st place in game 1.
   Sources: research/modes/IjUqZLgF_xM.json (clockwise from Red, checkmate = 20, ranking 1st +3 / 2nd +1 / 3rd -1 / 4th -3), frames (grey 4PC board #dedede/#aeaeae). Board: chess.com 4 Player Chess (14x14, 3x3 corners cut), Red Kh1 Qg1, Blue Ka7 Qa8, Yellow Kg14
   Qh14, Green Kn8 Qn7, clockwise Red-Blue-Yellow-Green. Shared logic in js/modes/g5_4pc.js. The three other seats are
   bots (paranoid search). */
CM.mode({
  id: 'IjUqZLgF_xM',
  title: "Can I BEAT 4 Player Chess? (again)",
  name: "4 Player Chess (Yellow)",
  category: 'Variants & Games',
  description: "Free-for-all on the cross-shaped board. Four armies move clockwise (Red, Blue, Yellow, Green). Captures score points (pawn 1, knight 3, bishop 5, rook 5, queen 9, promoted queen 1); checkmating a player scores 20 and knocks them out, their army turns grey. Pawns promote on the centre line (8th rank from their side).",
  how_to_win: "Finish 1st on points. You play Yellow (third to move).",
  player_side: 'b',
  player: { name: 'You', rating: 1900 },
  opponent: { name: "Red", rating: 2000, tagline: "Red, Blue and Green are online humans (~1500-2200)." },
  players: [{"color": "r", "forward": "up", "name": "Red", "swatch": "#bf3b43", "base": "w", "rating": 2000}, {"color": "u", "forward": "right", "name": "Blue", "swatch": "#4185bf", "base": "w", "rating": 1500}, {"color": "b", "forward": "down", "name": "You", "swatch": "#c09526", "base": "w"}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w", "rating": 2200}],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#dedede', dark: '#aeaeae' },
  pieces: {"PQ": {"name": "Promoted Queen", "moves": "Q", "value": 880, "glyph": "Q", "badge": "1", "san": "Q", "points": 1}},
  setup: { fen: '3rnbkqbnr3/3pppppppp3/14/[u:R][u:P]10[g:P][g:R]/[u:N][u:P]10[g:P][g:N]/[u:B][u:P]10[g:P][g:B]/[u:Q][u:P]10[g:P][g:K]/[u:K][u:P]10[g:P][g:Q]/[u:B][u:P]10[g:P][g:B]/[u:N][u:P]10[g:P][g:N]/[u:R][u:P]10[g:P][g:R]/14/3[r:P][r:P][r:P][r:P][r:P][r:P][r:P][r:P]3/3[r:R][r:N][r:B][r:Q][r:K][r:B][r:N][r:R]3' },
  rules: {"castling": true, "enPassant": false, "promotion": {"auto": "PQ", "choices": ["PQ"], "zone": 7}, "drawPlies": 200, "win": [{"type": "points", "target": 9999, "values": {"P": 1, "N": 3, "B": 5, "R": 5, "Q": 9, "PQ": 1, "K": 0}}]},
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: {"ffa": true, "tintB": "y", "names": {"r": "Red", "u": "Blue", "b": "You", "g": "Green"}},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/IjUqZLgF_xM/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_4pc',
  source: { research: 'research/modes/IjUqZLgF_xM.json', confidence: 'high', notes: "Placement table (+3/+1/-1/-3) is shown only as the end result: winning = finishing 1st on points." }
});
