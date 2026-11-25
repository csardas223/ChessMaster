/* How Many Minions to STEAL the Moon: Gru + N minions (commoners) vs Vector + Moon (queen), Fairy-Stockfish. Sources: research/modes/goDcorwxJnA.json. Minion and Vector art copied from the video; the Moon is drawn as a queen (no Moon sprite). */
CM.mode({
  id: "goDcorwxJnA",
  title: "How Many Minions to STEAL the Moon?",
  name: "Minions vs the Moon",
  category: "Challenges & Odds",
  description: "Gru (your king) and his Minions against Vector (Black's king) and the Moon (a queen). A Minion moves one square in any direction. Add Minions when a game cannot be won.",
  how_to_win: "Steal the Moon, then checkmate Vector. The video won with 3 Minions.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {
    name: "Vector",
    rating: 3000,
    avatar: "assets/modes/goDcorwxJnA/vector.png",
    tagline: "Fairy-Stockfish playing Vector and the Moon"
  },
  board: { files: 8, ranks: 8 },
  theme: { light: "#dedeea", dark: "#8aa2ae" },
  pieces: {
    U: {
      name: "Minion",
      moves: "K",
      value: 300,
      img: { w: "assets/modes/goDcorwxJnA/minion_w.png", b: "assets/modes/goDcorwxJnA/minion_w.png" },
      glyph: null,
      badge: null
    },
    Moon: { name: "The Moon", moves: "Q", value: 900, glyph: "Q" }
  },
  setup: { fen: "3[moon]k3/8/8/8/8/8/3U4/4K3" },
  bot: { engine: "search", style: "best", depth: 4, time_ms: 900 },
  params: {
    levels: [
      { label: "1 Minion", fen: "3[moon]k3/8/8/8/8/8/3U4/4K3" },
      { label: "2 Minions", fen: "3[moon]k3/8/8/8/8/8/3UU3/4K3" },
      { label: "3 Minions", fen: "3[moon]k3/8/8/8/8/8/3UUU2/4K3" },
      { label: "4 Minions", fen: "3[moon]k3/8/8/8/8/8/3UUU2/3UK3" },
      { label: "5 Minions", fen: "3[moon]k3/8/8/8/8/8/3UUU2/3UKU2" }
    ],
    advance: "fail",
    unit: "Minions"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "medium",
    notes: "Minion squares inferred (d2/e2/f2 first). The video went 1 -> 3 minions.",
    research: "research/modes/goDcorwxJnA.json"
  }
});
