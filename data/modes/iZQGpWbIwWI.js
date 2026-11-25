/* Can I DESTROY Cross Derby?  chess.com Cross Derby: kings sit alone on detached corner squares, each side has five knights and eight pawns, pawns
   promote only to knights and stalemate loses. Sources: research/modes/iZQGpWbIwWI.json (void squares b1 g1 a2 b2 g2 h2 a7 b7 g7
   h7 b8 g8; opponent play4ustod ~1521) and the same layout as 7REcDCBnXZ8 (Fairy-Stockfish [crossderby]). */
CM.mode({
  id: 'iZQGpWbIwWI',
  name: 'Cross Derby',
  category: 'Variants & Games',
  description: 'Each king sits alone on a corner square cut off from the rest of the board, so it can never move. Both armies are knights and pawns; pawns promote only to knights. A cornered king can only be checked by a knight from two squares, so the race is to land a knight there first.',
  how_to_win: 'Checkmate the cornered king with a knight. Stalemating your opponent also wins.',
  player_side: 'white',
  player: { name: 'You', rating: 1840 },
  opponent: { name: 'play4ustod', rating: 1521, avatar: null, tagline: 'Cross Derby player on chess.com' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7a9e58',
    mask: ['.x....x.', 'xx....xx', '........', '........', '........', '........', 'xx....xx', '.x....x.'] },
  setup: { fen: 'n1nnnn1k/2pppp2/pp4pp/8/8/PP4PP/2PPPP2/K1NNNN1N' },
  rules: { castling: false, promotion: { choices: ['N'] }, stalemate: 'loss' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1521, depth: 4, time_ms: 700 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/iZQGpWbIwWI/knight_horde.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/iZQGpWbIwWI.json', confidence: 'high' }
});
