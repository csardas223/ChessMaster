/* I Turned LaPeace into a Chess.com Bot.  Each side has an immovable piece of Lapis on a random empty square in its own half (White ranks 3-4, Black ranks 5-6). Capture the enemy Lapis to win; lose yours and you lose. Checkmate still works. Sources: research/modes/sPNWgAzFzxM.json, frames visual_b (blue gem tokens, LaPeace avatar). Lapis = Minecraft lapis lazuli item sprite (owner request 2026-11-26, see LICENSES.md); avatar from the video; bot strength inferred (weak-moderate). */
CM.mode({
  id: "sPNWgAzFzxM",
  name: "LaPeace Bot (Lapis)",
  category: "Other Videos",
  description: "Each side gets a piece of Lapis, an immovable blue gem, on a random empty square in its own half. Capturing the enemy Lapis wins on the spot, so guard yours. Checkmate also wins.",
  how_to_win: "Capture LaPeace's Lapis or checkmate him.",
  player_side: "white",
  opponent: {
    name: "LaPeace",
    rating: null,
    avatar: "assets/modes/sPNWgAzFzxM/lapeace.png",
    tagline: "That's LaPeace, twin."
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ead2ae",
    dark: "#ae7e66"
  },
  pieces: {
    L: {
      name: "Lapis",
      moves: "",
      value: 1500,
      img: {
        w: "assets/modes/sPNWgAzFzxM/lapis.png",
        b: "assets/modes/sPNWgAzFzxM/lapis.png"
      },
      san: "L"
    }
  },
  setup: {
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
    place: [
      {
        type: "L",
        color: "w",
        at: "random_empty",
        rows: [
          3,
          4
        ]
      },
      {
        type: "L",
        color: "b",
        at: "random_empty",
        rows: [
          5,
          6
        ]
      }
    ]
  },
  rules: {
    win: [
      {
        type: "capture",
        piece: "L",
        why: "the Lapis was captured"
      },
      {
        type: "checkmate"
      }
    ]
  },
  bot: {
    engine: "search",
    elo: 1200,
    depth: 4,
    time_ms: 700
  },
  messages: {
    win: "you captured the Lapis",
    loss: "LaPeace took your Lapis"
  },
  source: {
    research: "research/modes/sPNWgAzFzxM.json",
    confidence: "medium"
  },
  title: "I Turned LaPeace into a Chess.com Bot"
});
