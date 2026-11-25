/* I Upgraded Knights to BEAT Stockfish. Your knights are Zebras: they leap like a knight (2,1) or like a camel (3,1). Standard chess vs Fairy-Stockfish (3000+) otherwise.
   Sources: research/modes/oWZa73IODRU.json (0:01 "moves like a knight and a camel in L shapes of length two and three", 0:19 develop to f4, 9:28 mated by a bishop under-promotion), frames visual_a (green #fdfede/#89af68, striped knight, Fairy Stockfish (3000+)).
   The frame note calls the dots a 3,2 pattern; the narrator explicitly says knight + camel, which is used. Art is original. */
CM.mode({
  id: 'oWZa73IODRU',
  name: 'Zebra Knights',
  category: 'Powerups & Rule Twists',
  description: 'Your knights are Zebras: they leap in short L-shapes like a knight (2+1) and in long L-shapes like a camel (3+1), jumping over everything. Everything else is normal chess.',
  how_to_win: 'Checkmate Fairy-Stockfish.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Fairy-Stockfish knows every fairy piece.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#fdfede', dark: '#89af68' },
  pieces: {
    Zb: { name: 'Zebra', moves: 'NC', value: 520, img: { w: 'assets/modes/oWZa73IODRU/zebra.png' }, san: 'Z' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R[Zb]BQKB[Zb]R' },
  bot: { engine: 'search', style: 'best', depth: 4, time_ms: 900 },
  source: { research: 'research/modes/oWZa73IODRU.json', confidence: 'high', notes: 'Zebra = knight + camel per narrator.' }
});
