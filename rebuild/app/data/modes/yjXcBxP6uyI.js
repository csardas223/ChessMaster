/* Can I BEAT Martin with 1 Copycat?: king + a Copycat that must move like whatever piece Martin just moved. Sources: research/modes/yjXcBxP6uyI.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "yjXcBxP6uyI",
  title: "Can I BEAT Martin with 1 Copycat?",
  name: "Copycat vs Martin",
  category: "Challenges & Odds",
  description: "You have a king and one Copycat. The Copycat must move like the piece type Martin moved last (pawn, knight, bishop, rook, queen or king); on your first move it may copy anything. Its threats change with Martin's moves too.",
  how_to_win: "Checkmate Martin (the video mated by copying a queen move to g6).",
  player_side: "white",
  opponent: {
    "name": "Martin",
    "rating": 250,
    "avatar": "assets/avatars/bot.svg",
    "tagline": "chess.com beginner bot (250)"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#dee5e7",
    "dark": "#8ca4aa"
  },
  pieces: {
    "Cat": {
      "name": "Copycat",
      "moves": "",
      "gen": "copycat",
      "value": 700,
      "img": {
        "w": "assets/modes/yjXcBxP6uyI/copycat_w.png",
        "b": "assets/modes/yjXcBxP6uyI/copycat_b.png"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/3[Cat]K3"
  },
  params: {
    "g3": [
      "copycat"
    ],
    "copyOwner": "w"
  },
  hooks: "g3_odds",
  source: {
    "confidence": "high",
    "notes": "Pawn copies step forward like a white pawn and never promote; the copycat attacks as the type Martin moved last (inferred). Cat art is original.",
    "research": "research/modes/yjXcBxP6uyI.json"
  }
});
