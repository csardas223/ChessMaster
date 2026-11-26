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
    avatar: "assets/modes/vwJw6aaggn8/zach.png"
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
        avatar: "assets/modes/vwJw6aaggn8/zach.png"
      },
      {
        name: "June",
        rating: 100,
        avatar: "assets/modes/vwJw6aaggn8/june.png"
      },
      {
        name: "Pepe",
        rating: 150,
        avatar: "assets/modes/vwJw6aaggn8/pepe.png"
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
    notes: "The video speedruns five bots; the research names three of them. art-audit-b: chess.com bot avatars swapped for the exact same art at 200px from the chess.com API (api.chess.com/pub/player/<name>-bot avatar on images.chesscomfiles.com), on the video's dark avatar background. blurry-b 2026-11-26: pepe.png is the same chess.com bot avatar (api.chess.com/pub/player/pepe-bot avatar, 180px transparent, https://images.chesscomfiles.com/uploads/v1/user/560983753.50de7410.200x200o.43ba261aca5d.png), resized to 512px on the video dark avatar background like the other bots; also used by AdbO98Fa7cY."
  },
  title: "They Replaced Martin...",
  hooks: 'g4_martin'
});
