/* Can I BEAT Magnus with 1 Piece: king + pawn / queen / amazon / nightrider / nuke vs Magnus. Sources: research/modes/RhncYQJA-FQ.json. */
CM.mode({
  id: "RhncYQJA-FQ",
  title: "Can I BEAT Magnus with 1 Piece?",
  name: "1 Piece vs Magnus",
  category: "Challenges & Odds",
  description: "A king and a single piece against Magnus's full army. Every loss upgrades the piece: pawn, queen, Amazon (queen + knight), Nightrider (repeated knight leaps), Nuke (queen + nightrider).",
  how_to_win: "Checkmate Magnus. The video lost all five.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Magnus", rating: 2800, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#e9edd0", dark: "#749d54" },
  pieces: {
    O: {
      name: "Nuke",
      moves: "QNN",
      value: 1500,
      img: { w: "assets/img/custom/nuke_w.png", b: "assets/img/custom/nuke_b.png" }
    },
    M: { name: "Amazon", moves: "QN", value: 1200, glyph: "Q", img: { w: "assets/img/fairy/amazon_w.png", b: "assets/img/fairy/amazon_b.png" } },   /* m-art: chess.com variant art (was glyph+badge) */
    L: { name: "Nightrider", moves: "NN", value: 600, glyph: "N", img: { w: "assets/img/fairy/nightrider_w.png", b: "assets/img/fairy/nightrider_b.png" } }   /* chess.com Knightrider, as at d1 in maxres2 */
  },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "Pawn", fen: "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3" },
      { label: "Queen", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3QK3" },
      { label: "Amazon", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3MK3" },
      { label: "Nightrider", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3LK3" },
      { label: "Nuke", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3OK3" }
    ],
    advance: "fail",
    unit: "Piece",
    pickerLabel: "Your piece",
    statusPrefix: "Your piece: "
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Squares inferred. Fairy pieces force the built-in search for the bot.",
    research: "research/modes/RhncYQJA-FQ.json"
  }
});
