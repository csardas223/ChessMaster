/* Magnus Carlsen: king + N amazons vs a full army, one more after each loss. Sources: research/modes/G3Helsp7ytI.json, frames. Series format inferred from sister videos. */
CM.mode({
  id: "G3Helsp7ytI",
  title: "How Many Amazons to BEAT Magnus?",
  name: "How many Amazons?",
  category: "Challenges & Odds",
  description: "How Many Amazons to BEAT Magnus? King + Amazons (queen + knight in one piece) against Magnus's full army; one more Amazon after every loss.",
  how_to_win: "Checkmate Magnus with as few Amazons as possible.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {
    name: "Magnus Carlsen",
    rating: 2882,
    avatar: "assets/modes/t61xLLQbotM/magnus.png",
    tagline: "chess.com Magnus Carlsen bot"
  },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ffffde", dark: "#8aae66" },
  pieces: { M: { name: "Amazon", moves: "QN", value: 1200, img: { w: "assets/modes/G3Helsp7ytI/amazon_w.png", b: "assets/modes/G3Helsp7ytI/amazon_b.png" }, glyph: null, badge: null /* art copied from the video */ } },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3MK3" },
  params: {
    levels: [
      { label: "1 Amazon", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3MK3" },
      { label: "2 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3MKM2" },
      { label: "3 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2MMKM2" },
      { label: "4 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2MMKMM1" },
      { label: "5 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1MMMKMM1" },
      { label: "6 Amazons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1MMMKMMM" }
    ],
    advance: "fail",
    unit: "Amazons"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Series format inferred from sister videos.",
    research: "research/modes/G3Helsp7ytI.json"
  }
});
