/* Can I BEAT Chess Knightmare?  Indie Steam game: REAL-TIME chess with no turns, you control one white piece (mostly a
   knight) and race to capture the black king while the AI's pieces move on their own and take you if you linger in
   their range. Themed levels ('10 million rooks', all dark-squared bishops), a placeable invulnerable Rock.
   Sources: research/modes/zxRM5dD5b7w.json, frames (#42ba06/#723606 green/brown board). PASS 1: turn-based levels
   (each of your moves is answered by one enemy move) via js/modes/g6_levels.js; no check, the king is simply taken. */
CM.mode({
  id: 'zxRM5dD5b7w',
  title: 'Can I BEAT Chess Knightmare?',
  name: 'Chess Knightmare',
  category: 'Variants & Games',
  description: 'You have a single piece, usually a knight, against a whole enemy army. Dodge every square the enemy attacks and capture the black king. There is no check: the king is taken like any piece, and so is your knight.',
  how_to_win: 'Capture the black king in every level.',
  player_side: 'white',
  opponent: { name: 'Knightmare AI', rating: null, tagline: 'Enemy pieces wiggle before they move.' },
  board: { files: 8, ranks: 8, light: '#42ba06', dark: '#723606' },
  setup: { fen: '4k3/8/8/8/8/8/8/4K3' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  params: {
    run: 'Level',
    levels: [
      { name: 'Tutorial: king', fen: '4k3/8/8/3p4/8/8/8/4K3' },
      { name: 'Tutorial: pawn', fen: '4k3/8/8/8/8/8/3P4/8', hint: 'Promote, then hunt' },
      { name: 'First knight', fen: '4k3/2p2p2/8/8/8/8/8/1N6' },
      { name: '10 million rooks', fen: 'r3k2r/8/8/r6r/8/8/8/1N6', hint: 'Rooks everywhere: only the knight squares are safe' },
      { name: 'Dark-squared bishops', fen: '1b1kb3/8/1b3b2/8/3b4/8/8/6N1', hint: 'Stay on the light squares' }
    ]
  },
  bot: { engine: 'search', depth: 3, time_ms: 400 },
  hooks: 'g6_levels',
  todo_pass2: ['real-time play (enemy pieces move on their own timers, wiggle tell)', 'placeable invulnerable Rock power-up (right click)', 'overworld level map with padlocks, cow, trophy', 'knight-sequence memory minigame', 'original knight / rock art'],
  source: { research: 'research/modes/zxRM5dD5b7w.json', confidence: 'medium', notes: 'Turn-based approximation; level armies representative.' }
});
