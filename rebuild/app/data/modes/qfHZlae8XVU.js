/* Can I BEAT Cloister?  Each side has eight wazirs (one step orthogonally, move or capture). The capturing wazir turns
   into a brick on the capture square and its owner gains a wazir in hand; a turn is either a wazir move or a drop.
   Win by capturing the last wazir on the board or by leaving the opponent without a legal move. Sources:
   research/modes/qfHZlae8XVU.json (transcript 0:14, 0:26, 0:17, 1:18). Board size and start squares are not shown in
   the transcript (no frames): 8x8 with the wazirs on each back rank is our assumption. */
CM.mode({
  id: 'qfHZlae8XVU',
  name: 'Cloister',
  category: 'Variants & Games',
  description: 'Each side has eight wazirs that move or capture one square up, down, left or right. When a wazir captures, it turns into a brick on that square (nothing can enter or take a brick) and you gain a wazir in hand. On your turn either move a wazir or drop one from your hand on any empty square.',
  how_to_win: 'Capture the last enemy wazir on the board, or leave your opponent with no legal move.',
  player_side: 'white',
  opponent: { name: 'Variant-site player', rating: 1500, avatar: null, tagline: 'Bullet Cloister.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  pieces: {
    W: { name: 'Wazir', moves: 'W', value: 200, glyph: 'P', badge: 'W' },
    Z: { name: 'Brick', moves: '', value: 0, blocker: true, capturable: false, overlay: 'wall' }
  },
  setup: { fen: 'wwwwwwww/8/8/8/8/8/8/WWWWWWWW' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: false, drops: true, stalemate: 'loss', drawPlies: 300,
    win: [{ type: 'eliminate', result: 'loss', why: 'the last wazir was captured' }] },
  clock: { w: 120, b: 120, inc: 1 },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 700 },
  hooks: {
    onMake: function (V, prev, m, n) { if (m.cap && !m.drop) n.b[m.t] = V.piece('Z', 'n', { m: 1 }); }
  },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/qfHZlae8XVU/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/qfHZlae8XVU.json', confidence: 'medium', notes: 'Board size and starting squares assumed (8x8, back ranks).' }
});
