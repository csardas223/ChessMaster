/* 1 Nuke vs 10 Knights: king + Nuke vs Fairy-Stockfish's king and ten knights. Sources: research/modes/mvPXhAMcT7I.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "mvPXhAMcT7I",
  title: "1 Nuke vs 10 Knights",
  name: "Nuke vs 10 Knights",
  category: "Challenges & Odds",
  description: "You have a king and one Nuke (queen + nightrider, reaching almost every square). Fairy-Stockfish has a king and ten knights: a whole back rank of knights plus three more.",
  how_to_win: "Checkmate Fairy-Stockfish.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {
    "name": "Fairy-Stockfish",
    "rating": 3000,
    "avatar": "assets/modes/mvPXhAMcT7I/fairy_stockfish.png",
    "tagline": "Fairy Stockfish (3000+), the variant engine"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#feffdd",
    "dark": "#89ae67"
  },
  pieces: {
    "Nuke": {
      "name": "Nuke",
      "moves": "QNN",
      "value": 1500,
      "img": {
        "w": "assets/modes/mvPXhAMcT7I/nuke_w.png",
        "b": "assets/modes/mvPXhAMcT7I/nuke_b.png"
      }
    }
  },
  setup: {
    "fen": "nnnnknnn/3nnn2/8/8/8/8/8/3[Nuke]K3"
  },
  params: { g3: ["rangedots"], rangeDots: { types: ["Nuke"], color: "rgba(150,60,220,.55)" } },
  hooks: "g3_odds",
  source: {
    "confidence": "high",
    "notes": "Transcript 0:05: the nuke moves like a queen and a knight for any distance (queen + nightrider); it never explodes. Setup confirmed by the transcript (nuke on the first rank, knights a8-h8 except the e8 king, plus d7 e7 f7). The video highlights the nuke's squares, shown here as purple range dots.",
    "research": "research/modes/mvPXhAMcT7I.json"
  }
});
