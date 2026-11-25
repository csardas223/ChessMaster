/* 1 Magnus vs Infinite Pawns: king + 1 pawn vs the Magnus bot; after every move you place a new pawn anywhere except the back rank. Sources: research/modes/iAwhIiexojg.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "iAwhIiexojg",
  title: "1 Magnus vs ∞ Pawns",
  name: "Infinite Pawns vs Magnus",
  category: "Challenges & Odds",
  description: "You start with a king and one pawn against the Magnus bot's full army. Every turn you make a move, then place a new pawn on any empty square except the back rank (no dropped promotions). Game 2 adds the video's self-imposed rule: capture every one of Magnus's pieces before mating.",
  how_to_win: "Checkmate Magnus (the video wins both games).",
  player_side: "white",
  opponent: {
    "name": "Magnus",
    "rating": 2850,
    "avatar": "assets/modes/iAwhIiexojg/magnus_bot.svg",
    "tagline": "chess.com Magnus bot"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#e9d3b3",
    "dark": "#ae8265"
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/4P3/4K3",
    "x": {
      "mode": "and"
    }
  },
  params: {
    "g3": [
      "ladder",
      "spawn",
      "capall"
    ],
    "sf": true,
    "spawn": {
      "noRanks": [
        1,
        8
      ],
      "promote": false
    },
    "levels": [
      {
        "label": "Game 1",
        "x": {
          "mode": "and"
        },
        "note": "Move, then place a pawn"
      },
      {
        "label": "Game 2: take everything first",
        "x": {
          "mode": "and",
          "capall": true
        },
        "note": "Capture all of Magnus's pieces before mating"
      }
    ],
    "advance": "win",
    "pickerLabel": "Game"
  },
  hooks: "g3_odds",
  vfx_timeline: [{ trigger: "bot_move", effect: { type: "arrow", color: "rgba(150,60,220,.75)", duration_ms: 1400 } }],
  source: {
    "confidence": "medium",
    "notes": "Magnus avatar is the generic bot icon (no likeness). Rank 1 placement is also disabled so Stockfish always gets a valid position (inferred; the video only names the back rank).",
    "research": "research/modes/iAwhIiexojg.json"
  }
});
