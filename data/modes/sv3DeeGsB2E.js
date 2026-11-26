/* I gave Croissant 1 Dragon until I lose: black king + N dragons vs White army. Sources: research/modes/sv3DeeGsB2E.json, frames. */
CM.mode({
  id: "sv3DeeGsB2E",
  title: "I Gave a Chess YouTuber 1 Dragon Until I LOSE",
  name: "Extra Dragons",
  category: "Challenges & Odds",
  description: "Croissant has only a king and Dragons (a Dragon moves like a bishop or a knight); you have your normal army. Every win gives it one more; the run ends with your first loss.",
  how_to_win: "Checkmate Croissant each game. The video lost at 5 Dragons.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Croissant", rating: 1900, avatar: "assets/modes/FBrM-CLBZDA/croissant.png", tagline: "Chess YouTuber (rating inferred)" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#f0d9b5", dark: "#b58863", pieces: "cburnett" },   /* pol-q4: played on lichess (frames: "Create a game" dialog, cburnett set); thumbnail board = lichess brown. Old grey was a histogram of the webcam frames. */
  pieces: { D: { name: "Dragon", moves: "BN", value: 800, img: { w: "assets/modes/cR6r8NZz-CA/dragon_w.png", b: "assets/modes/cR6r8NZz-CA/dragon_b.png" } /* video sprite */ } },
  setup: { fen: "3dk3/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
  rules: { promotion: { choices: ["Q", "D", "R", "B", "N"] } },
  bot: { engine: "search", style: "elo", depth: 4, time_ms: 900 },
  clock: { w: 300, b: 300, inc: 0, bot: false },
  params: {
    levels: [
      { label: "1 Dragon", fen: "3dk3/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "2 Dragons", fen: "3dkd2/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "3 Dragons", fen: "2ddkd2/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "4 Dragons", fen: "2ddkdd1/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "5 Dragons", fen: "1dddkdd1/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "6 Dragons", fen: "1dddkddd/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "7 Dragons", fen: "ddddkddd/8/8/8/8/8/PPPPPPPP/RNBQKBNR" },
      { label: "8 Dragons", fen: "ddddkddd/4d3/8/8/8/8/PPPPPPPP/RNBQKBNR" }
    ],
    advance: "win",
    unit: "Dragons"
  },
  hooks: "g3_ladder",
  source: { confidence: "high", research: "research/modes/sv3DeeGsB2E.json" }
});
