/* Can I MASTER 3 Check Chess?  chess.com Three-Check: normal chess, but the first player to give check three times wins (checkmate also wins).
   Sources: research/modes/qTXES0F1MVQ.json (online opponents, check counters on the kings, short clocks). */
CM.mode({
  id: 'qTXES0F1MVQ',
  name: '3 Check',
  category: 'Variants & Games',
  description: 'Normal chess with one extra way to win: give check three times. Every move that checks the enemy king counts once, even a double check.',
  how_to_win: 'Give three checks, or checkmate.',
  player_side: 'white',
  opponent: { name: 'edforte78', rating: 1700, avatar: null, tagline: 'Online 3-Check player.' },
  board: { files: 8, ranks: 8, light: '#ECF2D1', dark: '#7B9F59' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { win: [{ type: 'checkmate' }, { type: 'nchecks', n: 3 }] },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1700, depth: 4, time_ms: 700 },
  hooks: { status: function (ctx) { var c = ctx.state.checks || {}; return 'Checks given: you ' + (c.w || 0) + '/3 · opponent ' + (c.b || 0) + '/3'; } },
  vfx_timeline: [ { trigger: 'check', effect: { type: 'flash', color: '#e03c31', opacity: 0.25, duration_ms: 260, at: 'board' } } ],
  source: { research: 'research/modes/qTXES0F1MVQ.json', confidence: 'high' }
});
