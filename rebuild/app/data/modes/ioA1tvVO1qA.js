/* I Upgraded Bishops to BEAT Stockfish. Your bishops are Wizards: they move and capture 1 to 3 squares along any diagonal and jump over anything in between (Wf1-c4 over e2 on move one). Standard chess vs Fairy-Stockfish (3000+) otherwise.
   Sources: research/modes/ioA1tvVO1qA.json (0:03 "moves, captures, and jumps three squares in any diagonal direction", 0:09 jump to c4, threat Wb5#, 10:56 loss), frames visual_b (green #eaf6d2/#8aae66, Fairy Stockfish (3000+), wizard move dots).
   Inferred: the wizard may stop at 1 or 2 squares too (move dots in the frames). Art is original. */
CM.mode({
  id: 'ioA1tvVO1qA',
  name: 'Wizard Bishops',
  category: 'Powerups & Rule Twists',
  description: 'Your bishops are Wizards: they move and capture 1, 2 or 3 squares along any diagonal and leap over pieces in the way. Everything else is normal chess against Fairy-Stockfish.',
  how_to_win: 'Checkmate Fairy-Stockfish.',
  player_side: 'white',
  opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Fairy-Stockfish knows every fairy piece.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#eaf6d2', dark: '#8aae66' },
  pieces: {
    Wz: { name: 'Wizard', moves: 'FAG', value: 420, img: { w: 'assets/modes/ioA1tvVO1qA/wizard.png' }, san: 'W' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RN[Wz]QK[Wz]NR' },
  bot: { engine: 'search', style: 'best', depth: 4, time_ms: 900 },
  source: { research: 'research/modes/ioA1tvVO1qA.json', confidence: 'medium', notes: 'Wizard = F+A+G leaper (1-3 diagonal, jumping).' }
});
