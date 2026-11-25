/* Can I BEAT Stockfish with a Secret Queen? Standard chess vs Fairy-Stockfish where a spinning wheel picks one of your
   pawns to be secretly a queen. Fairy-Stockfish treats it as a pawn until it makes a queen-only move (or checks or
   promotes); then it is revealed as an ordinary queen. Only you have a secret queen.
   Sources: research/modes/U_irVoLjtNI.json (0:01-0:04 rules, 0:13-0:21 the wheel picks f2, 2:21-2:36 reveal and
   Qxf7#, 2:59 f2 removed from the wheel and b2 chosen, 4:24-4:36 game 2 win), frames visual_c (spinner wheel "Click to
   spin" with the pawn squares; brown board from the thumbnail). Shared rules in js/modes/g1_secretq.js. */
CM.mode({
  id: 'U_irVoLjtNI',
  name: 'Secret Queen vs Stockfish',
  category: 'Powerups & Rule Twists',
  description: 'A wheel picks one of your pawns to be secretly a queen. It can move like a pawn or a queen. Fairy-Stockfish thinks it is a normal pawn until it makes a move no pawn could, gives check or promotes; then it becomes a revealed queen.',
  how_to_win: 'Checkmate Fairy-Stockfish before it works out which pawn is the queen.',
  player_side: 'white',
  opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Treats every pawn as a pawn.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#f0d9b5', dark: '#b58863' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', style: 'best', depth: 1, time_ms: 40, blind_depth: 4, blind_ms: 800 },
  params: { choose: 'wheel', botSecret: false },
  hooks: 'g1_secretq',
  source: { research: 'research/modes/U_irVoLjtNI.json', confidence: 'high', notes: 'Wheel over all eight pawns (the video removes f2 for game 2).' }
});
