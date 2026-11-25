/* WorstFish vs Zach. Sources: research/modes/SsOtn3iDkv8.json (spectator game, past move 90, WorstFish forfeits). The board is shown from Zach's side; your moves are disabled. */
CM.mode({
  "id": "SsOtn3iDkv8",
  "title": "WorstFish vs Zach",
  "name": "WorstFish vs Zach",
  "category": "Variant Bots",
  "description": "Bot versus bot: WorstFish (white) plays the worst move every turn, Zach (black, 1 Elo, Martin's nephew) moves at random, dodges captures and never gives mate. Sit back and watch.",
  "how_to_win": "Watch-only. In the video Zach wins when WorstFish leaves the game.",
  "player_side": "black",
  "player": {
    "name": "Zach",
    "rating": 1,
    "avatar": "assets/modes/SsOtn3iDkv8/zach.png"
  },
  "opponent": {
    "name": "WorstFish",
    "rating": null,
    "avatar": "assets/modes/SsOtn3iDkv8/worstfish.png",
    "tagline": "Always plays the worst move."
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#eeeed2",
    "dark": "#769656"
  },
  "setup": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  "rules": {
    "drawPlies": 100
  },
  "bot": {
    "engine": "search",
    "depth": 2,
    "time_ms": 400,
    "min_ms": 500
  },
  "params": {
    "spectate": {
      "white": "worst",
      "forfeitPly": 184,
      "forfeitWhy": "WorstFish left the game (forfeit)",
      "title": "WorstFish vs Zach",
      "delay": 650
    }
  },
  "messages": {
    "win": "Zach wins: WorstFish left the game",
    "win_title": "Zach Wins!"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/SsOtn3iDkv8.json",
    "confidence": "medium",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
