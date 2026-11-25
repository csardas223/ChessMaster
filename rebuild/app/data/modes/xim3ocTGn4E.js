/* Can I BEAT 3 Check Chess?  chess.com Three-Check: normal chess, but the first player to give check three times wins (checkmate also wins).
   Sources: research/modes/xim3ocTGn4E.json (online opponents, check counters on the kings, short clocks). */
CM.mode({
  id: 'xim3ocTGn4E',
  name: '3 Check',
  category: 'Variants & Games',
  description: 'Normal chess with one extra way to win: give check three times. Every move that checks the enemy king counts once, even a double check.',
  how_to_win: 'Give three checks, or checkmate.',
  player_side: 'white',
  opponent: { name: 'AlvinVinz168', rating: 1691, avatar: null, tagline: 'Online 3-Check player.' },
  board: { files: 8, ranks: 8, light: '#ebecd0', dark: '#739552' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { win: [{ type: 'checkmate' }, { type: 'nchecks', n: 3 }] },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1691, depth: 4, time_ms: 700 },
  hooks: { status: function (ctx) { var c = ctx.state.checks || {}; return 'Checks given: you ' + (c.w || 0) + '/3 · opponent ' + (c.b || 0) + '/3'; } },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/xim3ocTGn4E/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } },  { trigger: 'check', effect: { type: 'flash', color: '#e03c31', opacity: 0.25, duration_ms: 260, at: 'board' } } ],
  source: { research: 'research/modes/xim3ocTGn4E.json', confidence: 'high' }
});
