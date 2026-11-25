/* Can I BEAT YouTube Chess?  The chess game in YouTube Playables: normal chess against six AI levels, shown as a head whose brain grows from level 1 to level 6. Sources: research/modes/Cs6knoD0INQ.json, frames visual_b (wooden board #dec696/#965a1e). Inferred: the Elo used for each level (the game shows no ratings; every level plays 'beginner-ish'). The video picks a random colour each game; here you always play White. */
CM.mode({
  id: "Cs6knoD0INQ",
  name: "YouTube Chess",
  category: "Variants & Games",
  description: "Normal chess against the six AI levels of YouTube's built-in chess game. Its avatar's brain grows bigger every level. Beat a level to unlock the next one.",
  how_to_win: "Checkmate all six levels in order.",
  player_side: "white",
  opponent: {
    name: "YouTube AI Level 1",
    rating: null,
    avatar: "assets/modes/Cs6knoD0INQ/brain1.svg"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#dec696",
    dark: "#965a1e"
  },
  params: {
    levels: [
      {
        name: "YouTube AI Level 1",
        rating: null,
        elo: 300,
        avatar: "assets/modes/Cs6knoD0INQ/brain1.svg",
        tagline: "Level 1: the brain gets bigger every level."
      },
      {
        name: "YouTube AI Level 2",
        rating: null,
        elo: 500,
        avatar: "assets/modes/Cs6knoD0INQ/brain2.svg",
        tagline: "Level 2: the brain gets bigger every level."
      },
      {
        name: "YouTube AI Level 3",
        rating: null,
        elo: 700,
        avatar: "assets/modes/Cs6knoD0INQ/brain3.svg",
        tagline: "Level 3: the brain gets bigger every level."
      },
      {
        name: "YouTube AI Level 4",
        rating: null,
        elo: 900,
        avatar: "assets/modes/Cs6knoD0INQ/brain4.svg",
        tagline: "Level 4: the brain gets bigger every level."
      },
      {
        name: "YouTube AI Level 5",
        rating: null,
        elo: 1150,
        avatar: "assets/modes/Cs6knoD0INQ/brain5.svg",
        tagline: "Level 5: the brain gets bigger every level."
      },
      {
        name: "YouTube AI Level 6",
        rating: null,
        elo: 1400,
        avatar: "assets/modes/Cs6knoD0INQ/brain6.svg",
        tagline: "Level 6: the brain gets bigger every level."
      }
    ],
    chatChance: 0
  },
  source: {
    research: "research/modes/Cs6knoD0INQ.json",
    confidence: "medium",
    notes: "Level strengths are guesses; colour is fixed to White."
  },
  title: "Can I BEAT YouTube Chess?",
  hooks: 'g4_ladder'
});
