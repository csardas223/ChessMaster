/* Can I BEAT a 2000 ELO with 1 Pawn?: king + one pawn vs a ~2000 human's full army (collab video). Sources: research/modes/2er3r0JGeNg.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "2er3r0JGeNg",
  title: "Can I BEAT a 2000 ELO with 1 Pawn?",
  name: "1 Pawn vs 2000 Elo",
  category: "Challenges & Odds",
  description: "You have a king and a single pawn; your 2042-rated opponent has the whole army. Standard chess rules.",
  how_to_win: "Checkmate the opponent.",
  player_side: "white",
  opponent: {
    "name": "Username982374829834",
    "rating": 2042,
    "avatar": "assets/modes/uUXev8TPVak/human.svg",
    "tagline": "a 2042-rated online opponent"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eaf6d2",
    "dark": "#7ea266"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3"
  },
  todo_pass2: [
    "re-run transcript (429) to confirm the material in each game",
    "generic human avatar"
  ],
  source: {
    "confidence": "low",
    "notes": "Transcript unavailable (429); setup from the thumbnail (K+P). The pawn file (e2) is inferred.",
    "research": "research/modes/2er3r0JGeNg.json"
  }
});
