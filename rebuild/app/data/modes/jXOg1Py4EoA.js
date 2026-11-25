/* Can I BEAT Roblox Chess?  Normal 3-minute chess inside a Roblox chess game against Roblox players.
   Sources: research/modes/jXOg1Py4EoA.json (London System, 3 wins; one game was awarded on a pawn promotion, 7:19
   "that was not checkmate but I guess you win by pawn promotion"), frames: green 2D view, 'Victory!' banner.
   Inferred: promoting a pawn ends the game as a win for the promoter (as observed in that game). */
CM.mode({
  id: 'jXOg1Py4EoA',
  name: 'Roblox Chess',
  category: 'Variants & Games',
  description: 'Chess on a board floating in the sky, against random Roblox players with 3-minute clocks. Normal rules, except that this Roblox game ends the match as soon as a pawn promotes.',
  how_to_win: 'Checkmate, or be the first to promote a pawn.',
  player_side: 'white',
  opponent: { name: 'Roblox player', rating: null, avatar: null, tagline: 'A blocky avatar who accepted your challenge.' },
  board: { files: 8, ranks: 8, light: '#ebecd0', dark: '#739552' },
  theme: { background: '#8fc6ee' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 180, b: 180, inc: 0 },
  rules: { promotion: { auto: 'Q' } },
  bot: { engine: 'search', elo: 1200, depth: 3, time_ms: 500 },
  hooks: {
    onMake: function (V, prev, m, n) { if (m.promo) n.x = Object.assign({}, n.x, { promoted: m.c }); },
    checkWin: function (V, st) { return st.x && st.x.promoted ? { w: st.x.promoted, why: 'pawn promotion' } : null; }
  },
  messages: { win_title: 'Victory!' },
  source: { research: 'research/modes/jXOg1Py4EoA.json', confidence: 'medium', notes: 'Promotion-wins rule inferred from one game.' }
});
