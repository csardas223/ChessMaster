/* Can I MASTER Tiny Chess?  More Tiny Chess on a 4x4 chess.com-style board vs ~1480 humans with very short clocks.
   Sources: research/modes/gY9DNg9xDUM.json (low confidence: transcript failed), frames visual (4x4 board, White back row
   pawn-like / knight / bishop-like / king). The army is inferred from the frames: R N B K behind one pawn, mirrored. */
CM.mode({
  id: 'gY9DNg9xDUM',
  name: 'Tiny Chess',
  category: 'Variants & Games',
  description: 'Chess squeezed onto a 4x4 board: each side has a rook, knight, bishop, king and one pawn. Pieces move as usual, pawns step one square and promote on the far row. Clocks are tiny.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  opponent: { name: 'Tristanfail', rating: 1482, avatar: null, tagline: 'Tiny Chess regular.' },
  board: { files: 4, ranks: 4, light: '#ecf1d1', dark: '#7aa058' },
  setup: { fen: 'kbnr/p3/3P/RNBK', moved: ['a3', 'd2'] },
  rules: { castling: false, enPassant: false },
  pieces: { P: { name: 'Pawn', moves: 'fmWfcF', pawn: true, promote: true, value: 100 } },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1480, depth: 5, time_ms: 600 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/gY9DNg9xDUM/ornate_knight.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/gY9DNg9xDUM.json', confidence: 'low', notes: 'Exact army not legible in frames; ornate/ringed piece icons treated as standard pieces.' }
});
