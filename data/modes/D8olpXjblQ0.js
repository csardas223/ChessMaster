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
        rating: 2000,
        avatar: "assets/modes/D8olpXjblQ0/lvl20.png"  /* chess.com visualization-20 avatar (clean original); rating (2000) from the 18:07 frame */
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
  source: {
    research: "research/modes/D8olpXjblQ0.json",
    confidence: "high",
    notes: "Level 20 rating (2000) read from the 18:07 frame; Level 25 rating is a guess. Portraits lvl5/10/15/20 = exact chess.com Visualization bots (blindfolded Level 5/10/15/20, usernames visualization-5/-10/-15/-20: https://images.chesscomfiles.com/uploads/v1/user/525890483.cbd5248e.200x200o.71b545338bf5.png, https://images.chesscomfiles.com/uploads/v1/user/525893665.c241b9e2.200x200o.68d216ed588b.png, https://images.chesscomfiles.com/uploads/v1/user/525895263.8e783b1c.200x200o.42b3590c708c.png, https://images.chesscomfiles.com/uploads/v1/user/525897053.541f495e.200x200o.2b84e625a003.png) at 200px instead of the 66-74px video crops (lvl20 was a 256px upscale of the 18:07 bar avatar) (api.chess.com/pub/player/<user> avatar, 200px), figure registered + tone-matched onto the video crop's background (tools/art6_bot_portraits.py, 2026-11-25 PM ET); lvl25 keeps the thumbnail cut. fin-art-a 2026-11-26: all five are now the clean transparent chess.com originals at 512px (no baked background/frame halo): lvl25.png = visualization-25 https://images.chesscomfiles.com/uploads/v1/user/525897931.da927c36.200x200o.012911af7a7a.png (tool /workspace/work/fin-art-a-tools/up512.py)."
  },
  title: "Level 1 vs Level 25 Blindfolded Bots",
  hooks: 'g4_ladder'
});
