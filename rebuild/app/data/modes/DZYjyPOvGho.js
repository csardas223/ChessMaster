/* Can I BEAT 4 Player Giveaway Chess?  chess.com 4 Player Giveaway (antichess) on the 14x14 cross: captures are compulsory and the goal is to lose all your pieces.
   Sources: research/modes/DZYjyPOvGho.json, frames (#dadada/#acacac, big red king marking the user colour, scores, rules panel). Board: chess.com 4 Player Chess (14x14, 3x3 corners cut), Red Kh1 Qg1, Blue Ka7 Qa8, Yellow Kg14
   Qh14, Green Kn8 Qn7, clockwise Red-Blue-Yellow-Green. Shared logic in js/modes/g5_4pc.js. The three other seats are
   bots (paranoid search). */
CM.mode({
  id: 'DZYjyPOvGho',
  title: "Can I BEAT 4 Player Giveaway Chess?",
  name: "4 Player Giveaway",
  category: 'Variants & Games',
  description: "Antichess for four on the cross board. Capturing is compulsory whenever you can. Kings are ordinary pieces (no check) and can be captured. Pawns promote on the centre line.",
  how_to_win: "Be the first player to lose all of your pieces.",
  player_side: 'r',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: "Blue", rating: null, tagline: "Three online giveaway players." },
  players: [{"color": "r", "forward": "up", "name": "You", "swatch": "#bf3b43", "base": "w"}, {"color": "u", "forward": "right", "name": "Blue", "swatch": "#4185bf", "base": "w"}, {"color": "y", "forward": "down", "name": "Yellow", "swatch": "#c09526", "base": "w"}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w"}],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#dadada', dark: '#acacac' },
  pieces: {"PQ": {"name": "Promoted Queen", "moves": "Q", "value": 880, "glyph": "Q", "badge": "1", "san": "Q", "points": 1}, "K": {"name": "King", "moves": "K", "value": 300, "royal": false, "castle": false}},
  setup: { fen: '3[y:R][y:N][y:B][y:K][y:Q][y:B][y:N][y:R]3/3[y:P][y:P][y:P][y:P][y:P][y:P][y:P][y:P]3/14/[u:R][u:P]10[g:P][g:R]/[u:N][u:P]10[g:P][g:N]/[u:B][u:P]10[g:P][g:B]/[u:Q][u:P]10[g:P][g:K]/[u:K][u:P]10[g:P][g:Q]/[u:B][u:P]10[g:P][g:B]/[u:N][u:P]10[g:P][g:N]/[u:R][u:P]10[g:P][g:R]/14/3[r:P][r:P][r:P][r:P][r:P][r:P][r:P][r:P]3/3[r:R][r:N][r:B][r:Q][r:K][r:B][r:N][r:R]3' },
  rules: {"check": "none", "castling": false, "enPassant": false, "forcedCapture": true, "promotion": {"auto": "PQ", "choices": ["PQ"], "zone": 7}, "win": [{"type": "eliminate", "result": "win"}]},
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: {"giveaway": true, "names": {"r": "You", "u": "Blue", "y": "Yellow", "g": "Green"}},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/DZYjyPOvGho/red_king_overlay.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_4pc',
  source: { research: 'research/modes/DZYjyPOvGho.json', confidence: 'high', notes: "Per-player scores in the frames are not modelled; first player out of pieces wins." }
});
