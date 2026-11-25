/* I Played With Myself (in chess): chess.com Solo Chess. Sources: research/modes/DoImibR93tA.json, frames visual_* (chess.com green
   #EBEED0/#759F55, Solo Chess side panel with level dots). Rules and level generator: js/modes/g4_solo.js. */
CM.mode({
  id: 'DoImibR93tA',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/DoImibR93tA/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'I Played With Myself (in chess)',
  name: 'Solo Chess',
  category: 'Other Videos',
  description: 'chess.com Solo Chess: only your own pieces are on the board. Every move must capture one of your own pieces. Each piece can capture at most twice (then it turns dark), and the King can never be captured.',
  how_to_win: 'Leave exactly one piece on the board (the King, if there is one) on all 10 levels.',
  player_side: 'white',
  opponent: { name: 'Solo Chess', rating: null, avatar: 'assets/modes/DoImibR93tA/solo.png', tagline: 'Levels 1-10.' },
  board: { files: 8, ranks: 8, light: '#ebeed0', dark: '#759f55' },
  setup: { fen: '8/8/8/8/8/8/8/8' },
  rules: { check: 'none', castling: false, enPassant: false, friendlyCapture: true, movesPerTurn: { w: 9999, b: 1 }, promotion: { auto: 'Q' }, drawPlies: 9999 },
  bot: { engine: 'random' },
  params: { speedrun: false },
  hooks: 'g4_solo',
  source: { research: 'research/modes/DoImibR93tA.json', confidence: 'medium', notes: 'chess.com level layouts are not public; levels are generated backwards so each is solvable (level n = n+2 pieces).' }
});
