/* Hikaru: king + N knight rows vs a full army, one more after each loss. Sources: research/modes/D2B85mhGtT0.json, frames. Row sizes unclear in the video ("3x5-1"); rows here are full ranks: 2 rows = 15 knights, 3 rows = 23, 4 rows = 31. */
CM.mode({
  id: "D2B85mhGtT0",
  title: "How Many Knights to BEAT Hikaru?",
  name: "How many Knights?",
  category: "Challenges & Odds",
  description: "How Many Knights to BEAT Hikaru? Rows of knights around your king against Hikaru's full army; one more row after every loss.",
  how_to_win: "Checkmate Hikaru. The video won with the third row.",
  player_side: "white",
  opponent: { name: "Hikaru", rating: 2800, avatar: "assets/avatars/bot.svg", tagline: "chess.com Hikaru Nakamura bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#edd6b5", dark: "#b58566" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/NNNNNNNN/NNNNKNNN" },
  params: {
    levels: [
      { label: "2 rows (15 knights)", fen: "rnbqkbnr/pppppppp/8/8/8/8/NNNNNNNN/NNNNKNNN" },
      { label: "3 rows (23 knights)", fen: "rnbqkbnr/pppppppp/8/8/8/NNNNNNNN/NNNNNNNN/NNNNKNNN" },
      { label: "4 rows (31 knights)", fen: "rnbqkbnr/pppppppp/8/8/NNNNNNNN/NNNNNNNN/NNNNNNNN/NNNNKNNN" }
    ],
    advance: "fail"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "low",
    notes: "Row sizes unclear in the video (\"3x5-1\"); rows here are full ranks: 2 rows = 15 knights, 3 rows = 23, 4 rows = 31.",
    research: "research/modes/D2B85mhGtT0.json"
  }
});
