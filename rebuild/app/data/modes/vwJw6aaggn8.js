/* They Replaced Martin...  Speedrun: checkmate chess.com's new beginner bots rated below Martin in under five minutes total. Sources: research/modes/vwJw6aaggn8.json, frames visual_b (Pepe 150, June 100), transcript (Zach 100, 'five bots', 'they never miss mate in one'). Only the three named bots are included; the timer starts on your first move. */
CM.mode({
  id: "vwJw6aaggn8",
  name: "New Beginner Bots Speedrun",
  category: "Other Videos",
  description: "chess.com replaced Martin with even weaker bots: Zach, June and Pepe. Checkmate them one after another before the five-minute speedrun clock runs out. They still never miss a mate in one.",
  how_to_win: "Beat every bot with less than 5:00 on the combined speedrun timer.",
  player_side: "white",
  opponent: {
    name: "Zach",
    rating: 100,
    avatar: "assets/modes/vwJw6aaggn8/zach.svg"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#eaead2",
    dark: "#72a25a"
  },
  params: {
    levels: [
      {
        name: "Zach",
        rating: 100,
        avatar: "assets/modes/vwJw6aaggn8/zach.svg"
      },
      {
        name: "June",
        rating: 100,
        avatar: "assets/modes/vwJw6aaggn8/june.svg"
      },
      {
        name: "Pepe",
        rating: 150,
        avatar: "assets/modes/vwJw6aaggn8/pepe.svg"
      }
    ],
    chatChance: 0,
    speedrun: {
      ms: 300000
    },
    doneText: "Speedrun complete!"
  },
  source: {
    research: "research/modes/vwJw6aaggn8.json",
    confidence: "high",
    notes: "The video speedruns five bots; the research names three of them."
  },
  title: "They Replaced Martin...",
  hooks: 'g4_martin'
});
