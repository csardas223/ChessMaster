/* Can I BEAT Cross Derby? (NEW Variant) Cross Derby vs humans up to ~2000, player Black.
   Sources: research/modes/YZjdissxTyA.json, Fairy-Stockfish variants.ini [crossderby], frame sprite 7REcDCBnXZ8_board_layout.png, still maxres1 + transcript (cm-recheck2). */
CM.mode({
  id: "YZjdissxTyA",
  name: "Cross Derby",
  category: "Variants & Games",
  description: "Each king sits alone on a corner square cut off from the rest of the board, so it can never move. Both armies are knights and pawns; pawns promote only to knights. Checks cannot be blocked, so the only defence is to capture the checking knight.",
  how_to_win: "Checkmate the cornered king. Stalemating your opponent also wins.",
  player_side: "black",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { "avatar": "assets/modes/YZjdissxTyA/opponent.png","name": "Cross Derby player", "rating": 2000, "tagline": "Up to ~2000 in the video"},
  board: {"files": 8, "ranks": 8, "light": "#eeeed2", "dark": "#769656", "mask": [".x....x.", "xx....xx", "........", "........", "........", "........", "xx....xx", ".x....x."]},
  setup: {"fen": "n1nnnn1k/2pppp2/pp4pp/8/8/PP4PP/2PPPP2/K1NNNN1N"},
  rules: {"castling": false, "promotion": {"choices": ["N"]}, "stalemate": "loss"},
  bot: {"engine": "search", "elo": 2000, "depth": 4, "time_ms": 700},
  clock: {"w": 180, "b": 180, "inc": 0},   /* cm-recheck3: 9:48 "almost a minute left" deep in game 4 rules out a 1-minute game; 3+0 as in the other Cross Derby videos (inferred) */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/YZjdissxTyA/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  source: {"confidence": "high", "notes": "Board and setup from Fairy-Stockfish [crossderby] (same as 7REcDCBnXZ8). cm-recheck2 2026-11-25: confirmed square by square against the video still maxres1 (start position: knights + pawns, kings a1/h8 cut off by holes b1/g1/a2/b2 etc.) and the transcript (0:01 king stuck in a corner, knights race to mate, pawns promote to knights; 1:39 squares out of the board = the holes; games as Black/White/Black/Black, 4 wins, last vs ~2000). cm-recheck3: clock 3+0 inferred (9:48 almost a minute left, 10:17 down to 50 seconds late in game 4).", "research": "research/modes/YZjdissxTyA.json"}
});
