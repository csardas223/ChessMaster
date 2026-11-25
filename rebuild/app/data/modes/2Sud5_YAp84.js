/* Can I Beat a GOOSE at Chess?  Normal chess against chess.com's Valentine's Day bot line-up in order, ending with the ~3000 Goose that only honks. Sources: research/modes/2Sud5_YAp84.json, frames visual_b (Ghosted 875, DJ Ron Passant 1350, Trisha 1675, Goose '2999'). Chat lines are paraphrased/original; avatars are original art. */
CM.mode({
  id: "2Sud5_YAp84",
  name: "Valentine Bots + Goose",
  category: "Variants & Games",
  description: "Normal chess against five Valentine's Day bots in a row: the Bachelor, Ghosted, DJ Ron Passant, Trisha and finally the Goose, who plays at about 3000 and only says honk. Beat a bot to move on to the next one.",
  how_to_win: "Checkmate each bot in turn. The Goose is the final boss.",
  player_side: "white",
  opponent: {
    name: "The Bachelor",
    rating: 275,
    avatar: "assets/modes/2Sud5_YAp84/bachelor.png"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ebecd0",
    dark: "#739552"
  },
  params: {
    levels: [
      {
        name: "The Bachelor",
        rating: 275,
        avatar: "assets/modes/2Sud5_YAp84/bachelor.png",
        hello: "Definitely not Martin. Will you accept this rose?",
        chat: [
          "Is this a date or a game?",
          "I brought roses, not opening theory.",
          "Smooth move. Not as smooth as me."
        ],
        win: "Well, there is always next Valentine's."
      },
      {
        name: "Ghosted",
        rating: 875,
        avatar: "assets/modes/2Sud5_YAp84/ghosted.png",
        hello: "Back from the dead. I coach pickleball now.",
        chat: [
          "Boo.",
          "I would have left you on read.",
          "Pickleball is easier than this."
        ],
        win: "...seen."
      },
      {
        name: "DJ Ron Passant",
        rating: 1350,
        avatar: "assets/modes/2Sud5_YAp84/djron.png",
        hello: "Drop the beat. And maybe en passant.",
        chat: [
          "Turn it up!",
          "That move was a banger.",
          "Red Bull gives you pawn wings."
        ],
        win: "Mic drop. You win this set."
      },
      {
        name: "Trisha",
        rating: 1675,
        avatar: "assets/modes/2Sud5_YAp84/trisha.png",
        hello: "Hi! Let's keep this friendly.",
        chat: [
          "Interesting choice.",
          "Oh, I like that one.",
          "Hmm, careful now."
        ],
        win: "Good game!"
      },
      {
        name: "Goose",
        rating: 3000,
        avatar: "assets/modes/2Sud5_YAp84/goose.png",
        hello: "HONK.",
        chat: [
          "Honk.",
          "HONK!",
          "honk honk",
          "Honk. (angry)",
          "A most delightful afternoon for a honk, would you not agree?"
        ],
        win: "...honk.",
        loss: "HONK HONK HONK (goose laughter)"
      }
    ],
    chatChance: 0.3,
    doneText: "You beat the Goose! Honk honk."
  },
  source: {
    research: "research/modes/2Sud5_YAp84.json",
    confidence: "high",
    notes: "Ghosted/DJ Ron ratings from frames; Bachelor 275 and Goose ~3000 from transcript. Bot strength: Stockfish limited by Elo (>=1320) or the built-in search below that."
  },
  title: "Can I Beat a GOOSE at Chess?",
  hooks: 'g4_ladder'
});
