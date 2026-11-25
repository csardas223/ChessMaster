/* Can I LOSE to Worstfish? Sources: research/modes/CRrPXR1WuDo.json (self-mate in 16 moves; Worstfish plays the single worst move, it mates only when forced). */
CM.mode({
  "id": "CRrPXR1WuDo",
  "title": "Can I LOSE to Worstfish?",
  "name": "Lose to Worstfish",
  "category": "Variant Bots",
  "description": "Worstfish always plays the worst move on the board. Your goal is reversed: get yourself checkmated. Walk your king into its camp and leave it only one legal move: mate.",
  "how_to_win": "Get checkmated by Worstfish. Checkmating it counts as a loss.",
  "player_side": "white",
  "opponent": {
    "name": "Worstfish",
    "rating": null,
    "avatar": "assets/modes/CRrPXR1WuDo/worstfish.svg",
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
  "bot": {
    "engine": "search",
    "depth": 3,
    "time_ms": 600
  },
  "params": {
    "pick": "worst",
    "selfmate": "w"
  },
  "messages": {
    "win": "Worstfish was forced to checkmate you",
    "win_title": "You Lost! (You Win)",
    "loss": "you checkmated Worstfish"
  },
  "hooks": "g2_fish",
  "source": {
    "research": "research/modes/CRrPXR1WuDo.json",
    "confidence": "medium"
  }
});
