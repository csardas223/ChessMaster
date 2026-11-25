/* Can I BEAT Chessformer?  Puzzle-platformer by Robert Alvarez: side-view levels where chess pieces have gravity. Move
   your (blue) pieces with normal chess moves; after every move each piece falls straight down until it lands on
   something. Capture the static red king to clear a level. Sources: research/modes/RDl-EmbTRWc.json, rules.jsonl
   (gravity after each move, bishops change colour by falling), frames (~12x10 grid, tan/brown #c4a16e/#ab864d,
   green pipe platforms, black void squares, "Level 12"). PASS 1: two hand-made levels (the video's level layouts are
   not recoverable), walls stand in for platforms; the red king never moves (g5_levels passColor). */
CM.mode({
  id: 'RDl-EmbTRWc',
  title: 'Can I BEAT Chessformer?',
  name: 'Chessformer',
  category: 'Variants & Games',
  description: 'Chess pieces with gravity. Your pieces move like normal chess pieces, then fall straight down until they land on a platform or another piece. Plan around the fall: a bishop can change square colour by dropping.',
  how_to_win: 'Capture the red king to clear each level.',
  player_side: 'white',
  opponent: { name: 'Red King', rating: null, tagline: 'The static red king waiting at the end of each level.' },
  board: { files: 12, ranks: 10, light: '#c4a16e', dark: '#ab864d' },
  setup: { fen: '12/12/12/12/12/12/12/12/1K8k1/************' },
  rules: { check: 'none', castling: false, enPassant: false, gravity: { dir: 'down' }, promotion: false },
  params: {
    passColor: 'b',
    levels: [
      { name: 'The king walks', fen: '12/12/12/12/12/12/12/12/1K8k1/************', hint: 'Walk over and take the red king' },
      { name: 'Rook drop', fen: '12/12/12/12/12/R11/*10k/11*/12/************', hint: 'The rook falls after it moves' },
      { name: 'Two pieces', fen: '12/12/12/k11/***9/12/12/12/2K3R5/************', hint: 'Build a step with one piece for the other' }
    ]
  },
  bot: { engine: 'random' },
  hooks: 'g5_levels',
  todo_pass2: ['blue/red piece tint (blue player pieces, red king)', 'green pipe platform art instead of wall squares, black void holes', 'real Chessformer level layouts (12+ levels)', 'falling animation', 'undo/restart buttons styled like the game', 'title screen "Chessformer by Robert Alvarez"'],
  source: { research: 'research/modes/RDl-EmbTRWc.json', confidence: 'medium', notes: 'Gameplay rules exact; levels are original placeholders.' }
});
