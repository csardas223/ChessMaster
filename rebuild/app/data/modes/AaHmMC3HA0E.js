/* Can I BEAT Trash Talking Chess Bots?  chess.com Trash Talker bots in rising order: Wally Jr (400), The Hustler (950), Samantha (1300), Trash Bot 1999 (1700), The Master (2100). Sources: research/modes/AaHmMC3HA0E.json, frames visual_a. Chat lines are original paraphrases of each persona; avatars are original. */
CM.mode({
  id: "AaHmMC3HA0E",
  name: "Trash Talker Bots",
  category: "Variants & Games",
  description: "Normal chess against five bots that trash talk you while they play: Wally Jr, The Hustler, Samantha, Trash Bot 1999 and The Master. Beat one to face the next.",
  how_to_win: "Checkmate all five bots, from 400 up to 2100.",
  player_side: "white",
  opponent: {
    name: "Wally Jr.",
    rating: 400,
    avatar: "assets/modes/AaHmMC3HA0E/wally.png"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ecd9b3",
    dark: "#b28567"
  },
  params: {
    levels: [
      {
        name: "Wally Jr.",
        rating: 400,
        avatar: "assets/modes/AaHmMC3HA0E/wally.png",
        hello: "My dad is a super duper Grandmaster!",
        chat: [
          "My dad would have seen that.",
          "You play like my dad's little toe.",
          "I'm telling my dad!"
        ],
        win: "I'm telling my dad..."
      },
      {
        name: "The Hustler",
        rating: 950,
        avatar: "assets/modes/AaHmMC3HA0E/hustler.png",
        hello: "Five bucks a game? Easy money.",
        chat: [
          "Speed it up, I got other marks waiting.",
          "You call that a move?",
          "Cash only, pal."
        ],
        win: "Double or nothing next time."
      },
      {
        name: "Samantha",
        rating: 1300,
        avatar: "assets/modes/AaHmMC3HA0E/samantha.png",
        hello: "I have a lecture in twenty minutes, so let's be quick.",
        chat: [
          "I've read about this opening. In week one.",
          "Cute.",
          "I could write an essay on that mistake."
        ],
        win: "Fine. I'll add it to my study list."
      },
      {
        name: "Trash Bot 1999",
        rating: 1700,
        avatar: "assets/avatars/bot.svg",
        hello: "BOOTING... Y2K READY. YOUR LOSS: IMMINENT.",
        chat: [
          "ERROR: GOOD MOVE NOT FOUND.",
          "PROCESSING YOUR BLUNDER...",
          "DIAL-UP SPEED DETECTED."
        ],
        win: "SYSTEM FAILURE."
      },
      {
        name: "The Master",
        rating: 2100,
        avatar: "assets/avatars/bot.svg",
        hello: "I once played Spassky, you know. Lovely fellow.",
        chat: [
          "Ah, a fine idea.",
          "In my day we castled earlier.",
          "Patience, young one."
        ],
        win: "Well played. Truly."
      }
    ],
    chatChance: 0.4
  },
  source: {
    research: "research/modes/AaHmMC3HA0E.json",
    confidence: "high"
  },
  title: "Can I BEAT Trash Talking Chess Bots?",
  hooks: 'g4_ladder'
});
