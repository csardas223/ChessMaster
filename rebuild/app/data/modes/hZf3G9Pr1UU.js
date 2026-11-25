/* Can I BEAT 3D Glasses?  A normal rapid game as Black against a ~2000 player, played with the 3D piece set to earn the
   "3D Glasses" award (which never unlocks). Sources: research/modes/hZf3G9Pr1UU.json (Black vs pvz29 ~2034, 1.e4 e5,
   win after Bc5 wins the queen). The 3D set is not open-licensed, so the 'spatial' set from assets/pieces stands in. */
CM.mode({
  id: 'hZf3G9Pr1UU',
  name: '3D Glasses',
  category: 'Variants & Games',
  description: 'A normal 10-minute game as Black against a 2000-rated opponent, played with a 3D-looking piece set in an attempt to unlock the 3D Glasses award.',
  how_to_win: 'Checkmate your opponent (the award still will not unlock).',
  player_side: 'black',
  opponent: { name: 'pvz29', rating: 2034, avatar: null, tagline: 'Rapid opponent' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  theme: { pieces: 'spatial' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 600, b: 600, inc: 0 },
  bot: { engine: 'auto', elo: 2000, time_ms: 600 },
  messages: { win: 'you won, but the 3D Glasses award did not unlock' },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/hZf3G9Pr1UU/3d_board.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/hZf3G9Pr1UU.json', confidence: 'high', notes: 'Piece set substitution (spatial) for the chess.com 3D set.' }
});
