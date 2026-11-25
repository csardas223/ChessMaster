/* Can I BEAT Martin with a Spinner Wheel?  Before each of Tony's moves a wheel picks a piece type (pawn, knight, bishop,
   rook, queen, king); he must move a piece of that type, and if he cannot (including in check when that type cannot
   help) he loses at once. He lost ~60 games and never won. Sources: research/modes/6YEM7m8owJ4.json (0:01, 1:46, 2:13,
   15:11, 29:13), frames visual_a (green board, purple/pink wheel with 6 piece-type segments beside the board).
   The thumbnail's RESIGN slice is treated as a thumbnail joke. Wheel art is original. */
CM.mode({
  id: '6YEM7m8owJ4',
  title: 'Can I BEAT Martin with a Spinner Wheel?',
  name: 'Spinner Wheel vs Martin',
  category: 'Variants & Games',
  description: 'Before each of your moves a wheel picks a piece type: pawn, knight, bishop, rook, queen or king. You must move a piece of that type. If none of them can move (for example a bishop on move one, or the wrong piece while in check) you lose immediately. Martin moves normally.',
  how_to_win: 'Checkmate Martin before the wheel picks a piece you cannot move.',
  player_side: 'white',
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.svg', tagline: 'chess.com beginner bot.' },
  board: { files: 8, ranks: 8, light: '#eaedd0', dark: '#749d54' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
  params: { wheel: 'piece', side: 'w' },
  hooks: 'g4_wheel',
  source: { research: 'research/modes/6YEM7m8owJ4.json', confidence: 'high' }
});
