/* Stockfish, But It Alternates 250 ELO to 3600 ELO Every Capture. Sources: research/modes/Q6sj5N3oQjI.json (starts 3600, toggles only on the bot's own captures, -3350/+3350 popups). */
CM.mode({
  "id": "Q6sj5N3oQjI",
  "title": "Stockfish, But It Alternates 250 ELO to 3600 ELO Every Capture",
  "name": "Alternate Fish",
  "category": "Variant Bots",
  "description": "The bot starts as Stockfish (3600) and every time IT captures a piece it switches personality: Stockfish 3600 <-> Martin 250. Offer pawns to flip it to Martin.",
  "how_to_win": "Checkmate Alternate Fish while it is in Martin mode.",
  "player_side": "white",
  "opponent": {
    "name": "Alternate Fish",
    "rating": 3600,
    "avatar": "assets/modes/Q6sj5N3oQjI/alternatefish.svg",
    "tagline": "Now playing like Stockfish (3600)."
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
  "params": {
    "elo": {
      "start": 3600,
      "toggle": [
        3600,
        250
      ]
    }
  },
  "hooks": "g2_elofish",
  "source": {
    "research": "research/modes/Q6sj5N3oQjI.json",
    "confidence": "high"
  }
});
