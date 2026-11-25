/* Can I BEAT Chaturaji Chess?  chess.com Chaturaji: four players each with half an army (boat, knight, bishop, king,
   four pawns) in the corners of one 8x8 board, clockwise from Red, capturing for points; the boat moves like a rook.
   Tony is Yellow (third) vs two ~1400s and a ~1900. Sources: research/modes/OVM-2QJ2NFQ.json, rules.jsonl, frames
   (#dbdbdb/#afaeae, on-screen values P1 N3 B5 boat 5 K3, four clocks, score counters). Kings can be captured (no
   check; capturing a king knocks that player out and scores 3). Inferred: pawns promote to a boat on the far edge.
   Yellow is colour 'b' so the board turns to show it at the bottom; shared logic in js/modes/g5_4pc.js. */
CM.mode({
  id: 'OVM-2QJ2NFQ',
  title: 'Can I BEAT Chaturaji Chess?',
  name: 'Chaturaji (4 Player)',
  category: 'Variants & Games',
  description: 'Four half-armies share one 8x8 board, one in each corner, and move clockwise: Red, Blue, Yellow (you), Green. The boat moves like a rook, the others as usual; each army\'s pawns march in its own direction. There is no check: kings can be captured, which knocks that player out.',
  how_to_win: 'Score the most points: pawn 1, knight 3, bishop 5, boat 5, king 3.',
  player_side: 'b',
  player: { name: 'You', rating: 1500 },
  opponent: { name: 'Red', rating: 1400, tagline: 'Two ~1400 players and a ~1900 (Green).' },
  players: [{"color": "r", "forward": "up", "name": "Red", "swatch": "#bf3b43", "base": "w", "rating": 1400}, {"color": "u", "forward": "right", "name": "Blue", "swatch": "#4185bf", "base": "w", "rating": 1400}, {"color": "b", "forward": "down", "name": "You", "swatch": "#c09526", "base": "w"}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w", "rating": 1900}],
  board: { files: 8, ranks: 8, light: '#dbdbdb', dark: '#afaeae' },
  pieces: { R: { img: { g: 'assets/modes/OVM-2QJ2NFQ/boat_green.png', b: 'assets/modes/OVM-2QJ2NFQ/boat_yellow.png', u: 'assets/modes/OVM-2QJ2NFQ/boat_blue.png', r: 'assets/modes/OVM-2QJ2NFQ/boat_red.png', }, name: 'Boat', moves: 'R', value: 500, castleRook: false, points: 5 }, K: { name: 'King', moves: 'K', value: 400, royal: true, castle: false }, P: { name: 'Pawn', value: 100, moves: 'fmWfcF', pawn: true, promote: true, enPassant: false, san: '' } },
  setup: { fen: '[u:R][u:P]2kbnr/[u:N][u:P]2pppp/[u:B][u:P]6/[u:K][u:P]6/6[g:P][g:K]/6[g:P][g:B]/[r:P][r:P][r:P][r:P]2[g:P][g:N]/[r:R][r:N][r:B][r:K]2[g:P][g:R]' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'R', choices: ['R'] }, win: [{ type: 'points', target: 9999, values: { P: 1, N: 3, B: 5, R: 5, K: 3 } }] },
  bot: { engine: 'search', depth: 2, time_ms: 350, min_ms: 260 },
  params: { ffa: true, tintB: 'y', names: { r: 'Red', u: 'Blue', b: 'You', g: 'Green' } },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/OVM-2QJ2NFQ/boat_red.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_4pc',
  source: { research: 'research/modes/OVM-2QJ2NFQ.json', confidence: 'medium', notes: 'Claim-win button not modelled; a knocked-out player scores no extra 20 here beyond the +20 rule shared with FFA.' }
});
