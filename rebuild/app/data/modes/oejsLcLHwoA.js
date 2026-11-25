/* Can I BEAT 4 Player Giveaway Chess?  chess.com 4 Player Giveaway on the 14x14 cross board (grey #A1A1A0/#818180):
   captures are compulsory, kings are ordinary pieces (no check), the goal is to lose all your pieces first.
   Sources: research/modes/oejsLcLHwoA.json (rules partly inferred), frames. Shared logic js/modes/g5_4pc.js
   (group 5 lib, read-only, giveaway bots). */
CM.mode({
  id: 'oejsLcLHwoA',
  title: 'Can I BEAT 4 Player Giveaway Chess?',
  name: '4 Player Giveaway (dark board)',
  category: 'Variants & Games',
  description: 'Antichess for four on the cross board. Capturing is compulsory whenever you can, kings are ordinary pieces that can be captured, and pawns promote on the centre line.',
  how_to_win: 'Be the first player to lose all of your pieces.',
  player_side: 'r',
  player: { name: 'You', rating: null },
  opponent: { name: 'Blue', rating: null, tagline: 'Three online giveaway players.' },
  players: [{"color": "r", "forward": "up", "name": "You", "swatch": "#bf3b43", "base": "w"}, {"color": "u", "forward": "right", "name": "Blue", "swatch": "#4185bf", "base": "w"}, {"color": "y", "forward": "down", "name": "Yellow", "swatch": "#c09526", "base": "w"}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w"}],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#a1a1a0', dark: '#818180' },
  pieces: { PQ: { name: 'Promoted Queen', moves: 'Q', value: 880, glyph: 'Q', badge: '1', san: 'Q', points: 1 }, K: { name: 'King', moves: 'K', value: 300, royal: false, castle: false } },
  setup: { fen: '3[y:R][y:N][y:B][y:K][y:Q][y:B][y:N][y:R]3/3[y:P][y:P][y:P][y:P][y:P][y:P][y:P][y:P]3/14/[u:R][u:P]10[g:P][g:R]/[u:N][u:P]10[g:P][g:N]/[u:B][u:P]10[g:P][g:B]/[u:Q][u:P]10[g:P][g:K]/[u:K][u:P]10[g:P][g:Q]/[u:B][u:P]10[g:P][g:B]/[u:N][u:P]10[g:P][g:N]/[u:R][u:P]10[g:P][g:R]/14/3[r:P][r:P][r:P][r:P][r:P][r:P][r:P][r:P]3/3[r:R][r:N][r:B][r:Q][r:K][r:B][r:N][r:R]3' },
  rules: { check: 'none', castling: false, enPassant: false, forcedCapture: true, promotion: { auto: 'PQ', choices: ['PQ'], zone: 7 }, win: [{ type: 'eliminate', result: 'win' }] },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { giveaway: true, names: { r: 'You', u: 'Blue', y: 'Yellow', g: 'Green' } },
  hooks: 'g5_4pc',
  todo_pass2: ['per-player score counters seen in frames'],
  source: { research: 'research/modes/oejsLcLHwoA.json', confidence: 'medium', notes: 'Giveaway rules inferred (spec: compulsory capture, no check).' }
});
