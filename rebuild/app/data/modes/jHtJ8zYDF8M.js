/* I Upgraded Pawns to BEAT Stockfish. Your pawns are Goblins: they move and capture 1 or 2 squares straight forward or diagonally forward, jumping over pieces (c2 over c3 to c4). They never move sideways or back. Standard chess vs Fairy-Stockfish (3000+) otherwise.
   Sources: research/modes/jHtJ8zYDF8M.json (0:03 "moves, and jumps two squares in any forward direction", 0:19 c2 over c3 to c4, 1:00 no sideways/backwards, 8:09 mate with a goblin), frames visual_a (green #fdfede/#89ae68, goblin move dots forward + diagonal).
   Inferred: goblins also stop at 1 square, capture on the squares they move to, and promote on the last rank (Q/R/B/N). Art is original. */
CM.mode({
  id: 'jHtJ8zYDF8M',
  name: 'Goblin Pawns',
  category: 'Powerups & Rule Twists',
  description: 'Your pawns are Goblins: they move or capture 1 or 2 squares straight ahead or diagonally ahead, leaping over anything in between. They can never go sideways or back, and they promote on the last rank.',
  how_to_win: 'Checkmate Fairy-Stockfish.',
  player_side: 'white',
  opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/avatars/stockfish.svg', tagline: 'Fairy-Stockfish knows every fairy piece.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#fdfede', dark: '#89ae68' },
  pieces: {
    Gb: { name: 'Goblin', moves: 'fWfFfDfA', value: 190, pawn: true, promote: true, img: { w: 'assets/modes/jHtJ8zYDF8M/goblin.png' }, san: 'G' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/[Gb][Gb][Gb][Gb][Gb][Gb][Gb][Gb]/RNBQKBNR' },
  bot: { engine: 'search', style: 'best', depth: 4, time_ms: 900 },
  source: { research: 'research/modes/jHtJ8zYDF8M.json', confidence: 'medium', notes: 'Goblin captures and promotion inferred.' }
});
