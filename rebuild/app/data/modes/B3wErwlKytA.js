/* How Many Dragons to BEAT a Chess YouTuber (TwoNiche): king + N dragons vs TwoNiche's full army on PyChess.
   Transcript recheck 2026-11-25: "The dragon moves like a knight and a bishop and I will add one dragon each game" (0:01);
   game 1 (1 dragon) is a threefold-repetition draw, which "is not a win so it doesn't count" (3:49) -> 2 dragons;
   game 2 won (9:36); a courtesy game with 3 dragons is also won (10:21-14:02). TwoNiche plays in disguise as
   "100 Elo Chad" / "Goopy Chadson". Sources: research/modes/B3wErwlKytA.json, transcript, frames (5+0, brown board). */
CM.mode({
  id: "B3wErwlKytA",
  title: "How Many Dragons to BEAT a Chess YouTuber? (feat. two niche)",
  name: "How many Dragons?",
  category: "Odds / Challenge",
  description: "Your army is a king and Dragons (a Dragon moves like a knight or a bishop); TwoNiche keeps the full army. One more Dragon after every game you do not win (a draw does not count).",
  how_to_win: "Checkmate TwoNiche with as few Dragons as possible.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "TwoNiche", rating: 1500, avatar: "assets/modes/B3wErwlKytA/twoniche.png", tagline: "Chess YouTuber (also appearing as 100 Elo Chad)" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#eddab7", dark: "#ae8765" },
  pieces: { D: { name: "Dragon", moves: "BN", value: 800, img: { w: "assets/modes/cR6r8NZz-CA/dragon_w.png", b: "assets/modes/cR6r8NZz-CA/dragon_b.png" } /* video sprite */ } },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DK3" },
  rules: { promotion: { choices: ["Q", "D", "R", "B", "N"] } },
  bot: { engine: "search", style: "elo", depth: 4, time_ms: 900 },
  clock: { w: 300, b: 300, inc: 0, bot: false },
  params: {
    levels: [
      { label: "1 Dragon", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DK3" },
      { label: "2 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/3DKD2" },
      { label: "3 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2DDKD2" },
      { label: "4 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/2DDKDD1" },
      { label: "5 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1DDDKDD1" },
      { label: "6 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/1DDDKDDD" },
      { label: "7 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/8/DDDDKDDD" },
      { label: "8 Dragons", fen: "rnbqkbnr/pppppppp/8/8/8/8/4D3/DDDDKDDD" }
    ],
    advance: "fail",
    unit: "Dragons"
  },
  hooks: "g3_ladder",
  source: {
    confidence: "high",
    notes: "Transcript-confirmed: dragon = knight + bishop, +1 dragon per game not won (draws included). Opponent rating and the dragons' start squares are not stated (start squares ours); human opponent played by the built-in search. 5+0 clock (frames, bot not timed).",
    research: "research/modes/B3wErwlKytA.json"
  }
});
