/* Can I PODIUM in Cross Derby? (and become a knightmare)  Cross Derby leaderboard push against ~2000 players on 1-minute clocks. Board and start position as Fairy-Stockfish [crossderby] (see 7REcDCBnXZ8.js): kings and a knight on detached corner squares, knights and pawns only, pawns promote to knights, stalemate loses. Sources: research/modes/SJrOiyN2-HA.json, frames visual_c. */
CM.mode({
  id: "SJrOiyN2-HA",
  name: "Cross Derby (Podium)",
  category: "Other Videos",
  description: "Each king sits alone on a corner square cut off from the board, so it can never move. Both armies are only knights and pawns, and pawns promote to knights. A cornered king can only be mated by knights from two squares.",
  how_to_win: "Checkmate the cornered king with your knights. Stalemating your opponent also wins.",
  player_side: "white",
  opponent: {
    name: "Cross Derby rival",
    rating: 2000,
    tagline: "Top-10 Cross Derby player"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ECF2D1",
    dark: "#7B9F59",
    mask: [
      ".x....x.",
      "xx....xx",
      "........",
      "........",
      "........",
      "........",
      "xx....xx",
      ".x....x."
    ]
  },
  setup: {
    fen: "n1nnnn1k/2pppp2/pp4pp/8/8/PP4PP/2PPPP2/K1NNNN1N"
  },
  rules: {
    castling: false,
    promotion: {
      choices: [
        "N"
      ]
    },
    stalemate: "loss"
  },
  clock: {
    w: 60,
    b: 60,
    inc: 0,
    bot: false
  },
  bot: {
    engine: "search",
    elo: 2000,
    depth: 5,
    time_ms: 800
  },
  source: {
    research: "research/modes/SJrOiyN2-HA.json",
    confidence: "high"
  },
  title: "Can I PODIUM in Cross Derby? (and become a knightmare)"
});
