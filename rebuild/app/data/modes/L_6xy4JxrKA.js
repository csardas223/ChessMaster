/* How Much is a Grasshopper Worth?: 27-second explainer Short on the grasshopper (queen lines, must hop the first
   piece and land right behind it). No game in the video, so the playable mode is a normal game where both queens are
   grasshoppers. Sources: research/modes/L_6xy4JxrKA.json, research/frames (frame text '9 points' unclear). */
CM.mode({
  id: 'L_6xy4JxrKA',
  title: 'How Much is a Grasshopper Worth?',
  name: 'Grasshopper Chess',
  category: 'Challenges & Odds',
  description: 'Both queens are replaced by grasshoppers. A grasshopper moves along queen lines but must hop over the first piece in that line and land on the square directly behind it (capturing an enemy there). Strong on a crowded board with x-ray forks and checks, weak in the endgame.',
  how_to_win: 'Checkmate the bot.',
  player_side: 'white',
  opponent: { name: 'Grasshopper Bot', rating: 1500, avatar: 'assets/avatars/bot.svg', tagline: 'explainer Short: no opponent in the video' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#f2dab7', dark: '#b38a69' },
  pieces: {
    G: { name: 'Grasshopper', moves: 'gQ', value: 330,
      img: { w: 'assets/modes/L_6xy4JxrKA/grasshopper_w.png', b: 'assets/modes/L_6xy4JxrKA/grasshopper_b.png' } }
  },
  setup: { fen: 'rnbgkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBGKBNR' },
  rules: { promotion: { choices: ['Q', 'G', 'R', 'B', 'N'] } },
  bot: { engine: 'search', elo: 1500, depth: 3 },
  source: {
    research: 'research/modes/L_6xy4JxrKA.json',
    confidence: 'medium',
    notes: 'Explainer only (no game); queens-as-grasshoppers setup, bot and promotion to grasshopper are inferred. Grasshopper art is an original SVG.'
  }
});
