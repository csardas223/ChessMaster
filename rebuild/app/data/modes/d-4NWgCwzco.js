/* 3 Bombs vs. Stockfish: your queen is an explosive (grenade, bomb, nuke - one per game) that blows up when it captures or is captured. Sources: research/modes/d-4NWgCwzco.json, research/frames. Generated for impl group 3. */
CM.mode({
  id: "d-4NWgCwzco",
  title: "3 Bombs vs. Stockfish",
  name: "3 Bombs",
  category: "Challenges & Odds",
  description: "Your queen is replaced by an explosive that moves like a queen. When it captures, or is captured, it explodes and is used up. Grenade: destroys the pieces one square up, down, left and right (never kings or queens). Bomb: everything but kings in the 3x3 around it. Nuke: everything but kings in the 5x5. Your own pieces in range are destroyed too.",
  how_to_win: "Checkmate Fairy-Stockfish. One game per explosive (the video lost with the grenade, drew with the bomb and won with the nuke).",
  player_side: "white",
  opponent: {
    "name": "Fairy-Stockfish",
    "rating": 3000,
    "avatar": "assets/avatars/stockfish.svg",
    "tagline": "Fairy Stockfish (3000+), the variant engine"
  },
  board: {
    "files": 8,
    "ranks": 8
  },
  theme: {
    "light": "#eaf6d2",
    "dark": "#7ea25a"
  },
  pieces: {
    "Grenade": {
      "name": "Grenade",
      "moves": "Q",
      "value": 950,
      "img": {
        "w": "assets/modes/d-4NWgCwzco/grenade_w.png",
        "b": "assets/modes/d-4NWgCwzco/grenade_b.png"
      }
    },
    "Bomb": {
      "name": "Bomb",
      "moves": "Q",
      "value": 950,
      "img": {
        "w": "assets/modes/d-4NWgCwzco/bomb_w.png",
        "b": "assets/modes/d-4NWgCwzco/bomb_b.png"
      }
    },
    "Nuke": {
      "name": "Nuke",
      "moves": "Q",
      "value": 950,
      "img": {
        "w": "assets/modes/d-4NWgCwzco/nuke_w.png",
        "b": "assets/modes/d-4NWgCwzco/nuke_b.png"
      }
    }
  },
  setup: {
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Grenade]KBNR"
  },
  params: {
    explodeSound: { Grenade: "grenade", Bomb: "bomb", Nuke: "explosion" },
    "g3": [
      "ladder",
      "explode"
    ],
    "explode": {
      "Grenade": {
        "shape": "plus",
        "radius": 1,
        "spare": [
          "K",
          "Q"
        ]
      },
      "Bomb": {
        "shape": "square",
        "radius": 1,
        "spare": [
          "K"
        ]
      },
      "Nuke": {
        "shape": "square",
        "radius": 2,
        "spare": [
          "K"
        ]
      }
    },
    "levels": [
      {
        "label": "Grenade",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Grenade]KBNR",
        "note": "+ shaped blast, spares kings and queens"
      },
      {
        "label": "Bomb",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Bomb]KBNR",
        "note": "3x3 blast"
      },
      {
        "label": "Nuke",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNB[Nuke]KBNR",
        "note": "5x5 blast"
      }
    ],
    "advance": "any",
    "pickerLabel": "Explosive",
    "statusPrefix": "Explosive: "
  },
  hooks: "g3_odds",
  sounds: { grenade: "assets/modes/d-4NWgCwzco/grenade.wav", bomb: "assets/modes/d-4NWgCwzco/bomb.wav" },
  source: {
    "confidence": "high",
    "notes": "Own pieces inside the blast are destroyed (inferred). Explosion uses the shared explosion effect; grenade/bomb/nuke art copied from the video sprites.",
    "research": "research/modes/d-4NWgCwzco.json"
  }
});
