/* Can I BEAT Clobber?  Clobber on a 5x6 board filled with alternating white and black stones: every move captures an orthogonally adjacent enemy stone; stones never move to empty squares; whoever cannot move loses. Sources: research/modes/8bnedvYyipA.json, frames visual_c (pawn icons, explainer with orthogonal targets). */
CM.mode({
  id: "8bnedvYyipA",
  name: "Clobber",
  category: "Variants & Games",
  description: "Every square starts filled with alternating white and black stones (drawn as pawns). A move is always a capture: move one of your stones onto an orthogonally adjacent enemy stone. Stones cannot move to empty squares.",
  how_to_win: "Make the last move: the player who cannot move loses.",
  player_side: "white",
  opponent: {
    name: "Clobber opponent",
    rating: null,
    tagline: "Online human"
  },
  board: {
    files: 5,
    ranks: 6,
    light: "#ECF2D1",
    dark: "#7B9F59"
  },
  pieces: {
    S: {
      name: "Stone",
      moves: "cW",
      value: 100,
      glyph: "P"
    }
  },
  setup: {
    fen: "sSsSs/SsSsS/sSsSs/SsSsS/sSsSs/SsSsS"
  },
  rules: {
    check: "none",
    castling: false,
    enPassant: false,
    promotion: false,
    stalemate: "loss"
  },
  bot: {
    engine: "search",
    style: "best",
    depth: 8,
    time_ms: 900
  },
  messages: {
    win: "your opponent has no moves left",
    loss: "you have no moves left"
  },
  source: {
    research: "research/modes/8bnedvYyipA.json",
    confidence: "medium"
  },
  title: "Can I BEAT Clobber?"
});
