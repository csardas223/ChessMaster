/* 1 Amazon vs 50 Pawns: 12x10, king + N amazons vs king + 50 pawns (Fairy-Stockfish). Sources: research/modes/nWEiDXSnEwc.json, frames. */
CM.mode({
  id: "nWEiDXSnEwc",
  title: "1 Amazon vs 50 Pawns",
  name: "Amazons vs 50 Pawns",
  category: "Challenges & Odds",
  description: "A 12x10 board: Fairy-Stockfish has a king behind a wall of 50 pawns, you have a king and Amazons (queen + knight). Pawns promote on your back rank. One more Amazon after every loss.",
  how_to_win: "Checkmate the pawn king. The video won with 4 Amazons.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Fairy-Stockfish", rating: 3000, avatar: "assets/modes/mvPXhAMcT7I/fairy_stockfish.png" },
  board: { files: 12, ranks: 10 },
  theme: { light: "#e8ddea", dark: "#a47cae" },
  pieces: { M: { name: "Amazon", moves: "QN", value: 1200, img: { w: "assets/modes/nWEiDXSnEwc/amazon_w.png", b: "assets/modes/nWEiDXSnEwc/amazon_b.png" }, glyph: null, badge: null /* art copied from the video */ } },
  setup: { fen: "5pkp4/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/12/12/12/12/4MK6" },
  bot: { engine: "search", style: "best", depth: 3, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Amazon", fen: "5pkp4/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/12/12/12/12/4MK6" },
      { label: "2 Amazons", fen: "5pkp4/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/12/12/12/12/4MKM5" },
      { label: "3 Amazons", fen: "5pkp4/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/12/12/12/12/3MMKM5" },
      { label: "4 Amazons", fen: "5pkp4/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/12/12/12/12/3MMKMM4" },
      { label: "5 Amazons", fen: "5pkp4/pppppppppppp/pppppppppppp/pppppppppppp/pppppppppppp/12/12/12/12/2MMMKMM4" }
    ],
    advance: "fail",
    unit: "Amazons"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Pawn block layout approximated from frames (ranks 6-9 full + 2 beside the king).",
    research: "research/modes/nWEiDXSnEwc.json"
  }
});
