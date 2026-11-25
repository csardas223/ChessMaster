/* Chess, But I Can Place Mines On the Board. Minesweeper-style chess vs Stockfish (3600): before move 1 you secretly
   hide 3 mines on any empty squares. Any piece (either colour) that lands on a mine explodes and the square is
   destroyed for good (a hole nothing can enter or cross). Passing over a mine (pawn double step, knight jump) is safe.
   Stockfish does not know where the mines are. Shared logic: js/modes/g1_mines.js.
   Sources: research/modes/vQ3hLgU6jLA.json (transcript: mines on c6/d6/f6, bishop lost on d6, knight on f6, "pawn to
   D5, jumping directly over the mine"), frames visual_* (brown #ead2ba/#ae7e66, red flags, black destroyed squares).
   Inferred: a king that steps on a mine loses. */
CM.mode({
  id: 'vQ3hLgU6jLA',
  name: 'Place Mines',
  category: 'Powerups & Rule Twists',
  description: 'Before the game, tap 3 empty squares to hide mines (red flags, only you see them). Any piece that lands on a mine explodes and the square is destroyed for good. Jumping over a mine is safe. Stockfish has no idea where they are.',
  how_to_win: 'Checkmate Stockfish. Mine the squares its pieces like to develop to.',
  player_side: 'white',
  opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Never played Minesweeper.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#ead2ba', dark: '#ae7e66' },
  pieces: { Hole: { name: 'Destroyed square', moves: '', value: 0, blocker: true, capturable: false, overlay: 'void' } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
  params: { mines: 3, playerRanks: null, botMines: false, destroy: true, mineImg: 'assets/modes/vQ3hLgU6jLA/flag.svg' },
  sounds: { flag: 'assets/modes/vQ3hLgU6jLA/flag.wav' },
  hooks: 'g1_mines',
  todo_pass2: [],
  source: { research: 'research/modes/vQ3hLgU6jLA.json', confidence: 'high', notes: 'King on a mine loses (inferred).' }
});
