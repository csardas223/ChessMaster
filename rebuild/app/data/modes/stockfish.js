/* Play Stockfish: standard chess against Stockfish 19 (lite, WASM). Not tied to a video. */
CM.mode({
  id: 'stockfish',
  no_video: true,
  title: 'Play Stockfish',
  name: 'Stockfish',
  category: 'Play',
  description: 'Standard chess against Stockfish 19 at full strength.',
  how_to_win: 'Checkmate the engine. Good luck.',
  player_side: 'white',
  opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'The strongest chess engine in the world.' },
  board: { files: 8, ranks: 8 },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'stockfish', elo: 3600, time_ms: 700 }
});
