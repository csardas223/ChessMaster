/* losing my mind over a niche chess variant is 100% free  (Cross Derby leaderboard climb, ~2000).
   Board and setup: Fairy-Stockfish variants.ini [crossderby] (https://www.chess.com/variants/cross-derby):
   startFen n-nnnn-k/--pppp--/pp4pp/8/8/PP4PP/--PPPP--/K-NNNN-N (written here with '-' for its missing squares), no queens/rooks/bishops,
   pawns promote to a knight, stalemate loses. Confirmed against the frame research/frames/sprites/7REcDCBnXZ8_board_layout.png
   (detached corner king squares, cut corners). Opponents in the video: LDD12211 (1786), KirMih (1684); 3-minute clocks. */
CM.mode({
  id: '7REcDCBnXZ8',
  name: 'Cross Derby',
  category: 'Other Videos',
  description: 'Each king sits alone on a corner square that is cut off from the rest of the board, so it can never move. Both armies are knights and pawns; pawns promote only to knights. Checks cannot be blocked, so the only defence is to capture the checking knight.',
  how_to_win: 'Checkmate the cornered king with your knights. Stalemating your opponent also wins.',
  player_side: 'white',
  player: { name: 'You', rating: 1970 },
  opponent: { name: 'LDD12211', rating: 1786, tagline: 'Cross Derby opponent on chess.com' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7b9e58',
    mask: ['.x....x.', 'xx....xx', '........', '........', '........', '........', 'xx....xx', '.x....x.'] },
  setup: { fen: 'n1nnnn1k/2pppp2/pp4pp/8/8/PP4PP/2PPPP2/K1NNNN1N' },
  rules: { castling: false, promotion: { choices: ['N'] }, stalemate: 'loss' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1786, depth: 4, time_ms: 700 },
  source: { research: 'research/frames/visual_*.jsonl (7REcDCBnXZ8), research/modes/YZjdissxTyA.json', confidence: 'high' }
});
