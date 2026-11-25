/* How Many Nukes to BEAT Gotham Baby?: king + Nuke vs Baby Gotham; every piece must be captured before checkmate. Sources: research/modes/patgvfwk5gA.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "patgvfwk5gA",
  title: "How Many Nukes to BEAT Gotham Baby?",
  name: "Nukes vs Baby Gotham",
  category: "Challenges & Odds",
  description: "You have a king and a Nuke (queen + nightrider) against Baby Gotham's full army. The video's extra rule: capture every one of his pieces and pawns before you deliver checkmate. Lose and you get another nuke.",
  how_to_win: "Take everything, then checkmate the bare king (one nuke was enough in the video).",
  player_side: "white",
  opponent: {
    "name": "Baby Gotham",
    "rating": 800,
    "avatar": "assets/modes/patgvfwk5gA/babygotham.svg",
    "tagline": "chess.com baby GothamChess bot"
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
    "Nuke": {
      "name": "Nuke",
      "moves": "QNN",
      "value": 1500,
      "img": {
        "w": "assets/modes/patgvfwk5gA/nuke_w.svg",
        "b": "assets/modes/patgvfwk5gA/nuke_b.svg"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/3[Nuke]K3",
    "x": {
      "capall": true
    }
  },
  params: {
    rangeDots: { types: ["Nuke"] },
    "g3": [
      "ladder",
      "capall"
    , "rangedots"],
    "levels": [
      {
        "label": "1 Nuke",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/3[Nuke]K3"
      },
      {
        "label": "2 Nukes",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/2[Nuke][Nuke]K3"
      },
      {
        "label": "3 Nukes",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/8/2[Nuke][Nuke]K[Nuke]2"
      }
    ],
    "advance": "fail",
    "unit": "Nukes",
    "pickerLabel": "Nukes"
  },
  hooks: "g3_odds",
  source: {
    "confidence": "high",
    "notes": "Baby Gotham rating (800) inferred; avatar is an original baby cartoon (no likeness). An early checkmate counts as a failed challenge.",
    "research": "research/modes/patgvfwk5gA.json"
  }
});
