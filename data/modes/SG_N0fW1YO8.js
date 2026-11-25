/* Can I LOSE to DrawFish? Sources: research/modes/SG_N0fW1YO8.json (iwantcheckmate.com board #f2f5df/#668a4e, 'I offer draw.'). */
CM.mode({
  "id": "SG_N0fW1YO8",
  "title": "Can I LOSE to DrawFish?",
  "name": "Lose to DrawFish",
  "category": "Variant Bots",
  "description": "DrawFish plays whatever move keeps the evaluation closest to 0.00. Your goal is reversed: get it to checkmate you, when the only near-equal move is mate.",
  "how_to_win": "Get checkmated by DrawFish. (The video did not manage it.)",
  "player_side": "white",
  "opponent": {
    "name": "DrawFish",
    "rating": null,
    "avatar": "assets/modes/SG_N0fW1YO8/drawfish.png",
    "tagline": "I offer draw."
  },
  "board": {
    "files": 8,
    "ranks": 8,
    "light": "#f2f5df",
    "dark": "#668a4e"
  },
  "setup": {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  "bot": {
    "engine": "search",
    "depth": 3,
    "time_ms": 700
  },
  "params": {
    "pick": "drawish",
    "selfmate": "w",
    "bubble": {
      "text": "I offer draw.",
      "chance": 0.2
    }
  },
  "messages": {
    "win": "DrawFish checkmated you",
    "win_title": "You Lost! (You Win)",
    "loss": "you checkmated DrawFish"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/SG_N0fW1YO8.json",
    "confidence": "high",
    "art": "avatar from the video (research/frames/sprites), owner instruction 2026-11-24"
  }
});
