/* Can I BEAT Martin with NO Pieces?: a full game vs Martin with blindfold pieces (your board shows no pieces). Sources: research/modes/pbtCSkxUg9Y.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "pbtCSkxUg9Y",
  title: "Can I BEAT Martin with NO Pieces?",
  name: "Blindfold vs Martin",
  category: "Challenges & Odds",
  description: "The trick: chess.com's blindfold piece set. Your board shows no pieces at all, for either side; play a normal game against Martin from memory. Legal-move dots and the move list still help. Everything reappears when the game ends.",
  how_to_win: "Checkmate Martin without seeing the pieces.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/modes/XuvZCCFk42k/martin.png",
    "tagline": "chess.com beginner bot (250)"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eadeae",
    "dark": "#ae8a66"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  params: {
    "g3": [
      "blind", "peek"
    ],
    "sf": true
  },
  hooks: "g3_odds",
  source: {
    "confidence": "high",
    "notes": "The video's viewer mini board + eval bar is an optional Viewer board toggle (static material eval, not an engine); the post-game review is a blindfold summary card rather than chess.com accuracy.",
    "research": "research/modes/pbtCSkxUg9Y.json"
  }
});
