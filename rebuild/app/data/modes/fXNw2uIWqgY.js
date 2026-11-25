/* Can I MASTER Blindfold Chess?  chess.com Blindfold: every piece of both colours is invisible on your board; you see only
   the empty board, the last-move highlight, your selection and the legal-move dots. Sources: research/modes/fXNw2uIWqgY.json
   (opponents ~1500-1560, five wins; the video edit adds a side board for viewers, which the app does not show). Pieces
   reappear when the game ends. */
CM.mode({
  id: 'fXNw2uIWqgY',
  name: 'Blindfold Chess',
  category: 'Variants & Games',
  description: 'Normal chess, but you cannot see any pieces: not yours, not your opponent’s. Only the last move highlight, your selected square and the legal-move dots appear. Keep the position in your head and click squares from memory.',
  how_to_win: 'Checkmate without ever seeing the board.',
  player_side: 'white',
  opponent: { name: 'combie', rating: 1557, avatar: null, tagline: 'Also playing blindfold. Probably.' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7a9f57' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'auto', elo: 1550, time_ms: 600 },
  hooks: { decorate: function (ctx, sq, p) { return p && !ctx.over ? { hidePiece: true } : null; } },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/fXNw2uIWqgY/blindfold_icon.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/fXNw2uIWqgY.json', confidence: 'high' }
});
