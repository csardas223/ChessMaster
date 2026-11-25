/* Can I BEAT 4 Player Chess?  chess.com 4-Player FFA, points for captures, 20 for checkmate; he farms points aiming for first.
   Sources: research/modes/LK1gJhFKgwU.json, rules.jsonl (Red first, clockwise, 20 for mate, 1st=3 wins), frames (#b4b4b4/#999999, narrator at the bottom as Red). Board: chess.com 4 Player Chess (14x14, 3x3 corners cut), Red Kh1 Qg1, Blue Ka7 Qa8, Yellow Kg14
   Qh14, Green Kn8 Qn7, clockwise Red-Blue-Yellow-Green. Shared logic in js/modes/g5_4pc.js. The three other seats are
   bots (paranoid search). */
CM.mode({
  id: 'LK1gJhFKgwU',
  title: "Can I BEAT 4 Player Chess?",
  name: "4 Player Chess",
  category: 'Variants & Games',
  description: "Free-for-all on the cross-shaped board. Four armies move clockwise (Red, Blue, Yellow, Green). Captures score points (pawn 1, knight 3, bishop 5, rook 5, queen 9, promoted queen 1); checkmating a player scores 20 and knocks them out, their army turns grey. Pawns promote on the centre line (8th rank from their side).",
  how_to_win: "Finish 1st on points.",
  player_side: 'r',
  player: { name: 'You', rating: 1800, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: "Blue", rating: 1900, tagline: "Three online 4 Player Chess humans (one ~1900)." },
  players: [{"color": "r", "forward": "up", "name": "You", "swatch": "#bf3b43", "base": "w"}, {"color": "u", "forward": "right", "name": "Blue", "swatch": "#4185bf", "base": "w", "rating": 1900}, {"color": "y", "forward": "down", "name": "Yellow", "swatch": "#c09526", "base": "w", "rating": 1700}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w", "rating": 1750}],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#e0e0e0', dark: '#b4b4b4' },
  pieces: {"PQ": {"name": "Promoted Queen", "moves": "Q", "value": 880, "glyph": "Q", "badge": "1", "san": "Q", "points": 1}},
  setup: { fen: '3[y:R][y:N][y:B][y:K][y:Q][y:B][y:N][y:R]3/3[y:P][y:P][y:P][y:P][y:P][y:P][y:P][y:P]3/14/[u:R][u:P]10[g:P][g:R]/[u:N][u:P]10[g:P][g:N]/[u:B][u:P]10[g:P][g:B]/[u:Q][u:P]10[g:P][g:K]/[u:K][u:P]10[g:P][g:Q]/[u:B][u:P]10[g:P][g:B]/[u:N][u:P]10[g:P][g:N]/[u:R][u:P]10[g:P][g:R]/14/3[r:P][r:P][r:P][r:P][r:P][r:P][r:P][r:P]3/3[r:R][r:N][r:B][r:Q][r:K][r:B][r:N][r:R]3' },
  rules: {"castling": true, "enPassant": false, "promotion": {"auto": "PQ", "choices": ["PQ"], "zone": 7}, "drawPlies": 200, "win": [{"type": "points", "target": 9999, "values": {"P": 1, "N": 3, "B": 5, "R": 5, "Q": 9, "PQ": 1, "K": 0}}]},
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: {"ffa": true, "names": {"r": "You", "u": "Blue", "y": "Yellow", "g": "Green"}},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/LK1gJhFKgwU/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_4pc',
  source: { research: 'research/modes/LK1gJhFKgwU.json', confidence: 'high', notes: "Transcript says he moved third, frames show him at the bottom (Red); Red used. Opponent ratings other than the ~1900 are guesses." }
});
