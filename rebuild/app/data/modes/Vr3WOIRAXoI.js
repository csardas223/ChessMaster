/* Can I BEAT Stockfish in a Maze?  Fairy-Stockfish on a 12x10 board with randomly placed stone blocks forming a maze.
   Blocks cannot be entered or passed (knights jump them), so pawns are nearly useless and sliders are hampered; the
   video ends in a knight-vs-rook draw. Sources: research/modes/Vr3WOIRAXoI.json (12 files x 10 ranks, Fairy-Stockfish
   3000), frames (cobblestone wall squares, tan/brown thumbnail board). Inferred: armies on the 8 central files (c-j),
   18 walls placed at random in point-symmetric pairs on ranks 3-8 each game (exact layout not recoverable). */
CM.mode({
  id: 'Vr3WOIRAXoI',
  title: 'Can I BEAT Stockfish in a Maze?',
  name: 'Stockfish in a Maze',
  category: 'Variants & Games',
  description: 'A 12x10 board full of stone blocks. Nothing can stop on or slide through a block; only knights can jump over them. Normal chess otherwise, against Fairy-Stockfish.',
  how_to_win: 'Checkmate Fairy-Stockfish (even a draw is an achievement).',
  player_side: 'white',
  opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/avatars/stockfish.svg', tagline: 'Fairy-Stockfish, the variant engine.' },
  board: { files: 12, ranks: 10, light: '#f0d9b5', dark: '#b58863' },
  setup: { fen: '2rnbqkbnr2/2pppppppp2/12/12/12/12/12/12/2PPPPPPPP2/2RNBQKBNR2' },
  rules: {},
  bot: { engine: 'search', elo: 3000, depth: 5, time_ms: 1100 },
  params: { walls: 9 },
  hooks: {
    setup: function (ctx) {
      var g = ctx.geo, n = ctx.params.walls || 9, tries = 0;
      while (n > 0 && tries++ < 400) {
        var c = ctx.random(g.files), r = 2 + ctx.random(3), i = g.idx(c, r), j = g.idx(g.files - 1 - c, g.ranks - 1 - r);
        if (ctx.at(i) || ctx.at(j) || i === j) continue;
        ctx.spawn('#', 'n', i); ctx.spawn('#', 'n', j); n--;
      }
    }
  },
  source: { research: 'research/modes/Vr3WOIRAXoI.json', confidence: 'medium', notes: 'Wall layout randomised per game (the video says the blocks are random).' }
});
