/* I Played with Myself COMPETITIVELY (in chess): chess.com Solo Chess speedrun. Sources: research/modes/vvCAEWKttT4.json, frames visual_* (chess.com green
   #EBEED0/#759F55, Solo Chess side panel with level dots). Rules and level generator: js/modes/g4_solo.js. */
CM.mode({
  id: 'vvCAEWKttT4',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/vvCAEWKttT4/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'I Played with Myself COMPETITIVELY (in chess)',
  name: 'Solo Chess Speedrun',
  category: 'Other Videos',
  description: 'Solo Chess speedrun: clear levels 1-10 as fast as you can. Every move must capture one of your own pieces; each piece captures at most twice; the King can never be captured. The timer starts on your first move. His target: beat 4m 47s 430ms (#11) and break the top 10.',
  how_to_win: 'Leave exactly one piece on the board (the King, if there is one) on all 10 levels.',
  player_side: 'white',
  opponent: { name: 'Solo Chess', rating: null, avatar: 'assets/modes/vvCAEWKttT4/solo.png', tagline: 'Leaderboard: top 10 needs under 4m 47s.' },
  board: { files: 8, ranks: 8, light: '#ebeed0', dark: '#759f55' },
  setup: { fen: '8/8/8/8/8/8/8/8' },
  rules: { check: 'none', castling: false, enPassant: false, friendlyCapture: true, movesPerTurn: { w: 9999, b: 1 }, promotion: { auto: 'Q' }, drawPlies: 9999 },
  bot: { engine: 'random' },
  params: { speedrun: true },
  hooks: 'g4_solo',
  source: { research: 'research/modes/vvCAEWKttT4.json', confidence: 'high', notes: 'chess.com level layouts are not public; levels are generated backwards so each is solvable (level n = n+2 pieces).' },
  todo_pass2: ['Solo Chess side panel: level-progress dots and check-mark animation', 'grey capture-target dots (chess.com style)', 'leaderboard rows']
});
