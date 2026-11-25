/* Level 1 vs Level 25 Blindfolded Bots.  Blindfold chess against chess.com level bots: the board shows no pieces, only the last-move highlights. Sources: research/modes/D8olpXjblQ0.json, frames visual_b (Level 5 (250), Level 10 (700), Level 15 (1300)). Inferred: ratings for Levels 20 and 25. */
CM.mode({
  id: "D8olpXjblQ0",
  name: "Blindfold Bot Ladder",
  category: "Other Videos",
  description: "Blindfold chess: no pieces are drawn on the board, only the squares of the last move. Keep the position in your head and climb from Level 5 to Level 25.",
  how_to_win: "Checkmate each level without seeing the pieces. The pieces reappear when the game ends.",
  player_side: "white",
  opponent: {
    name: "Level 5",
    rating: 250,
    avatar: "assets/modes/D8olpXjblQ0/lvl5.png"
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
        name: "Level 5",
        rating: 250,
        avatar: "assets/modes/D8olpXjblQ0/lvl5.png"
      },
      {
        name: "Level 10",
        rating: 700,
        avatar: "assets/modes/D8olpXjblQ0/lvl10.png"
      },
      {
        name: "Level 15",
        rating: 1300,
        avatar: "assets/modes/D8olpXjblQ0/lvl15.png"
      },
      {
        name: "Level 20",
        rating: 1900,
        avatar: "assets/avatars/bot.svg"
      },
      {
        name: "Level 25",
        rating: 2500,
        avatar: "assets/modes/D8olpXjblQ0/lvl25.png"
      }
    ],
    chatChance: 0,
    blind: true
  },
  todo_pass2: ['Level 20 avatar (bot.svg fallback): not in any repo still (research/frames)'],
  source: {
    research: "research/modes/D8olpXjblQ0.json",
    confidence: "high",
    notes: "Ratings for Levels 20 and 25 are guesses."
  },
  title: "Level 1 vs Level 25 Blindfolded Bots",
  hooks: 'g4_ladder'
});
