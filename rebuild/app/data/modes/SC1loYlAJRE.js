/* Can I BEAT GothamChess? Normal chess as Black vs the GothamChess bot (2500).
   Sources: research/modes/SC1loYlAJRE.json, frames: brown board, GothamChess (2500). */
CM.mode({
  id: "SC1loYlAJRE",
  name: "GothamChess Bot",
  category: "Variants & Games",
  description: "A rematch against the GothamChess bot (2500), this time with the black pieces.",
  how_to_win: "Checkmate the GothamChess bot (the video game ended in a draw).",
  player_side: "black",
  player: {"name": "You", "rating": 2182},
  opponent: { "avatar": "assets/modes/SC1loYlAJRE/opponent.png","name": "GothamChess", "rating": 2500, "tagline": "chess.com personality bot"},
  board: {"files": 8, "ranks": 8, "light": "#ebd9b6", "dark": "#b58566"},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/SC1loYlAJRE/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  source: {"notes": "Thumbnail \"FREE ROOOOKS\" is not reflected in the frames; standard setup used.", "research": "research/modes/SC1loYlAJRE.json", "confidence": "high"}
});
