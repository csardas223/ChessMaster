/* Chess, But One of My Pawns is Secretly a Queen. Second Secret Queen episode: online blitz as Black against
   ~1400-1600 humans (oessamelsayed1 1613 in the frames). Each player secretly picks a pawn that also moves like a
   queen; revealed on check, promotion, or a non-pawn move. The narrator picks g7 in game 1.
   Sources: research/modes/JPDYufARCQU.json (transcript 00:01 rule + "choose my secret queen to be G7" as Black vs
   1415, 00:30 placeholder 1600, 03:09 ~50 s left each), frames visual_c (brown #EDDAB7/#AE8666, star badge, blue
   clocks, oessamelsayed1 (1613)). Shared rules in js/modes/g1_secretq.js. Inferred: 3+0 clock, random enemy pick. */
CM.mode({
  id: 'JPDYufARCQU',
  name: 'Secret Queen (Black)',
  category: 'Powerups & Rule Twists',
  description: 'You play Black. Tap one of your pawns before your first move: it is secretly a queen, moving like a pawn or a queen and staying hidden until it gives check, promotes, or makes a move no pawn could. Your opponent has hidden one too.',
  how_to_win: 'Checkmate your opponent (or flag them) in a 3 minute game.',
  player_side: 'black',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'oessamelsayed1', rating: 1613, tagline: 'An online player. One of their pawns is secretly a queen.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#eddab7', dark: '#ae8666' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', style: 'elo', depth: 1, time_ms: 40, min_ms: 900, blind_depth: 3, blind_ms: 600 },
  params: { choose: 'tap', botSecret: true, marker: 'assets/modes/JPDYufARCQU/star_pawn.png' },   /* video sprites (tools/g1_sprites.py) */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/JPDYufARCQU/star_pawn.png', fit: 'contain', duration_ms: 1400, fade_ms: 250 }],
  hooks: 'g1_secretq',
  source: { research: 'research/modes/JPDYufARCQU.json', confidence: 'high', notes: '3+0 clock and random enemy pick inferred.' }
});
