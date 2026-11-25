/* Can I BEAT Secret Queen Chess? First Secret Queen episode: online 3-minute blitz against ~1500-1650 humans
   (EduNel 1518 in the frames). Each player secretly picks one pawn that can also move like a queen; it is revealed
   when it gives check, promotes, or makes a move a pawn cannot. Your pick is marked with a purple star only you see.
   Sources: research/modes/I_TbJqRHtf4.json (transcript 00:01 rule + pawn on f2 + confirm, 00:53 1633 opponent, 01:43
   reveal conditions), frames visual_a (brown #eddab7/#b08467, purple star on the secret pawn, 3:00 clocks).
   Shared rules in js/modes/g1_secretq.js. Inferred: the opponent picks its pawn at random; it plays at ~1500 strength. */
CM.mode({
  id: 'I_TbJqRHtf4',
  name: 'Secret Queen',
  category: 'Powerups & Rule Twists',
  description: 'Before your first move, tap one of your pawns: it is secretly a queen. It moves like a pawn or like a queen, and stays hidden until it gives check, promotes, or makes a move no pawn could. Your opponent has a secret queen too, and you do not know which pawn it is.',
  how_to_win: 'Checkmate your opponent (or flag them) in a 3 minute game.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'EduNel', rating: 1518, tagline: 'An online player. One of their pawns is secretly a queen.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#eddab7', dark: '#b08467' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', style: 'elo', depth: 1, time_ms: 40, min_ms: 900, blind_depth: 3, blind_ms: 600 },
  params: { choose: 'tap', botSecret: true, marker: 'assets/modes/I_TbJqRHtf4/marker.png' },   /* video sprites (tools/g1_sprites.py) */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/I_TbJqRHtf4/secret_queen.png', fit: 'contain', duration_ms: 1400, fade_ms: 250 }],
  hooks: 'g1_secretq',
  source: { research: 'research/modes/I_TbJqRHtf4.json', confidence: 'high', notes: 'Opponent secret pick random; bot strength ~1500.' }
});
