/* Can I SURVIVE Giveaway Chess?  chess.com Giveaway (antichess) against ~1500 players: captures are compulsory, no check, the king is an ordinary piece, and being stalemated also wins. Sources: research/modes/9npKP-fqq9U.json, frames visual_d (ELIPLAYZO 1516). */
CM.mode({
  id: "9npKP-fqq9U",
  board: {
    files: 8,
    ranks: 8,
    light: "#ecf1d1",
    dark: "#7a9f57"
  },
  pieces: {
    K: {
      name: "King",
      moves: "K",
      royal: false,
      castle: false,
      value: 250
    }
  },
  rules: {
    check: "none",
    castling: false,
    forcedCapture: true,
    stalemate: "win",
    win: [
      {
        type: "eliminate",
        result: "win"
      }
    ],
    promotion: {
      choices: [
        "Q",
        "N",
        "R",
        "B",
        "K"
      ]
    }
  },
  bot: {
    engine: "search",
    depth: 4,
    time_ms: 700
  },
  name: "Giveaway Chess (Survive)",
  category: "Variants & Games",
  description: "Giveaway: the goal is to lose every piece. Capturing is compulsory, there is no check, and your king can be captured like anything else.",
  how_to_win: "Lose all your pieces, or get stalemated.",
  player_side: "white",
  opponent: {
    name: "ELIPLAYZO",
    rating: 1516,
    tagline: "Giveaway opponent on chess.com"
  },
  messages: {
    win: "you lost everything, which means you won"
  },
  source: {
    research: "research/modes/9npKP-fqq9U.json",
    confidence: "high"
  },
  title: "Can I SURVIVE Giveaway Chess?"
});
