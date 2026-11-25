/* Can I SURVIVE 4 Player Chess?  chess.com 4 Player Chess Free-For-All against three higher-rated humans (~2000-2300);
   clockwise Red, Blue, Yellow, Green; captures score points, checkmate +20; pawns promote on the centre line to a
   1-point queen. Sources: research/modes/h7UFq4r59tM.json (rules, 1st=3 wins ... 4th=3 losses), frames (14x14 cross,
   grey #dbdadb/#acacac, per-player scores and clocks). Shared 4PC logic: js/modes/g5_4pc.js (group 5 lib, used
   read-only). The other three seats are bots (paranoid search). */
CM.mode({
  id: 'h7UFq4r59tM',
  title: 'Can I SURVIVE 4 Player Chess?',
  name: '4 Player Chess (turtle vs 2000+)',
  category: 'Variants & Games',
  description: 'Free-for-all on the cross-shaped board: four armies move clockwise (Red, Blue, Yellow, Green). Captures score points (pawn 1, knight 3, bishop 5, rook 5, queen 9, promoted queen 1); checkmating a player scores 20 and knocks them out, their army turns grey. Pawns promote on the centre line.',
  how_to_win: 'Finish with the most points, above the higher-rated players.',
  player_side: 'r',
  player: { name: 'You', rating: 1900 },
  opponent: { name: 'Blue', rating: 2000, tagline: 'Three humans rated about 2000-2300.' },
  players: [{"color": "r", "forward": "up", "name": "You", "swatch": "#bf3b43", "base": "w"}, {"color": "u", "forward": "right", "name": "Blue", "swatch": "#4185bf", "base": "w", "rating": 2000}, {"color": "y", "forward": "down", "name": "Yellow", "swatch": "#c09526", "base": "w", "rating": 2300}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w", "rating": 2100}],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#dbdadb', dark: '#acacac' },
  pieces: { PQ: { name: 'Promoted Queen', moves: 'Q', value: 880, glyph: 'Q', badge: '1', san: 'Q', points: 1 } },
  setup: { fen: '3[y:R][y:N][y:B][y:K][y:Q][y:B][y:N][y:R]3/3[y:P][y:P][y:P][y:P][y:P][y:P][y:P][y:P]3/14/[u:R][u:P]10[g:P][g:R]/[u:N][u:P]10[g:P][g:N]/[u:B][u:P]10[g:P][g:B]/[u:Q][u:P]10[g:P][g:K]/[u:K][u:P]10[g:P][g:Q]/[u:B][u:P]10[g:P][g:B]/[u:N][u:P]10[g:P][g:N]/[u:R][u:P]10[g:P][g:R]/14/3[r:P][r:P][r:P][r:P][r:P][r:P][r:P][r:P]3/3[r:R][r:N][r:B][r:Q][r:K][r:B][r:N][r:R]3' },
  rules: { castling: true, enPassant: false, promotion: { auto: 'PQ', choices: ['PQ'], zone: 7 }, drawPlies: 200, win: [{ type: 'points', target: 9999, values: { P: 1, N: 3, B: 5, R: 5, Q: 9, PQ: 1, K: 0 } }] },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { ffa: true, clock4: { base: 60, inc: 7 }, names: { r: 'You', u: 'Blue', y: 'Yellow', g: 'Green' } },
  hooks: 'g6_4pc',
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/h7UFq4r59tM/four_kings.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/h7UFq4r59tM.json', confidence: 'medium', notes: 'Opponent ratings per seat inferred from the 2000-2300 range.' }
});
