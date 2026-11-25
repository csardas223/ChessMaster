/* Can I MASTER Chaturaji Chess?  chess.com Chaturaji: four half-armies (king, boat, knight, bishop, 4 pawns) in the corners of one 8x8 board,
   clockwise Red, Blue, Yellow, Green, capturing for points (pawn 1, knight 3, bishop 5, boat 5, king 3). The boat moves
   like a rook; pawns step one square (no double step) and promote to a boat. No check: kings can be captured, which
   knocks that player out. Series goal: +5 net wins vs players up to ~2100. Sources: research/modes/mZUViBNWt6E.json, frames (#dadada/#acacac, on-screen point
   values, score counters). Shared logic js/modes/g5_4pc.js (group 5 lib, used read-only). */
CM.mode({
  id: 'mZUViBNWt6E',
  title: 'Can I MASTER Chaturaji Chess?',
  name: 'Chaturaji (5 wins goal)',
  category: 'Variants & Games',
  description: 'Four half-armies share one 8x8 board, one in each corner, and move clockwise: Red, Blue, Yellow, Green. The boat moves like a rook, the others as usual; each army\'s pawns march in their own direction one square at a time and promote to a boat. There is no check: kings can be captured, which knocks that player out (their pieces turn grey).',
  how_to_win: 'Finish first on points: pawn 1, knight 3, bishop 5, boat 5, king 3.',
  player_side: 'r',
  player: { name: 'You', rating: 1700 },
  opponent: { name: 'Opponents', rating: 2100, tagline: 'Three online Chaturaji players.' },
  players: [{"color": "r", "forward": "up", "name": "You", "swatch": "#bf3b43", "base": "w"}, {"color": "u", "forward": "right", "name": "Blue", "swatch": "#4185bf", "base": "w", "rating": 1900}, {"color": "y", "forward": "down", "name": "Yellow", "swatch": "#c09526", "base": "w", "rating": 2100}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w", "rating": 1800}],
  board: { files: 8, ranks: 8, light: '#dadada', dark: '#acacac' },
  pieces: { R: { name: 'Boat', moves: 'R', value: 500, castleRook: false, points: 5, img: { r: 'assets/modes/mZUViBNWt6E/boat_r.png', u: 'assets/modes/mZUViBNWt6E/boat_u.png', y: 'assets/modes/mZUViBNWt6E/boat_y.png', g: 'assets/modes/mZUViBNWt6E/boat_g.png' } }, K: { name: 'King', moves: 'K', value: 400, royal: true, castle: false }, P: { name: 'Pawn', value: 100, moves: 'fmWfcF', pawn: true, promote: true, enPassant: false, san: '' } },
  setup: { fen: '[u:R][u:P]2[y:K][y:B][y:N][y:R]/[u:N][u:P]2[y:P][y:P][y:P][y:P]/[u:B][u:P]6/[u:K][u:P]6/6[g:P][g:K]/6[g:P][g:B]/[r:P][r:P][r:P][r:P]2[g:P][g:N]/[r:R][r:N][r:B][r:K]2[g:P][g:R]' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'R', choices: ['R'] }, win: [{ type: 'points', target: 9999, values: { P: 1, N: 3, B: 5, R: 5, K: 3 } }] },
  bot: { engine: 'search', depth: 2, time_ms: 350, min_ms: 260 },
  params: {"ffa": true, "names": {"r": "You", "u": "Blue", "y": "Yellow", "g": "Green"}},
  hooks: 'g6_4pc',
  source: { research: 'research/modes/mZUViBNWt6E.json', confidence: 'medium', notes: 'He was Blue in game 1; here you sit Red (first to move). Claim-win not modelled.' }
});
