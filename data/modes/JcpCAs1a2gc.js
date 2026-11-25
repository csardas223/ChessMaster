/* Can I BEAT Anarchy Chess? Normal chess vs chess.com's creator bot "Anarchy Bot" (made for r/AnarchyChess; its lines were
   voted by the subreddit). Transcript recheck 2026-11-25 (analyze_video): no special rules (normal chess; he plays the
   Bongcloud "anything else would be treason", 0:01), the bot plays like a meme (early king walks, 1:02 Kd8) and talks in
   subreddit lines quoted below (0:21-4:37), goes quiet once it is losing (4:58) and says "The chess speaks for itself"
   when it loses (6:27). Sources: research/modes/JcpCAs1a2gc.json, transcript, frames (green board, chat bubble). The old
   forced-en-passant rule was a guess and is removed. */
CM.mode({
  id: "JcpCAs1a2gc",
  name: "Anarchy Chess Bot",
  category: "Meme Chess",
  description: "Normal chess against chess.com's Anarchy Bot (1660), a creator bot for r/AnarchyChess whose every line was voted by the subreddit. It does not know how the horsey moves. Open with the Bongcloud: anything else would be treason.",
  how_to_win: "Checkmate the Anarchy Bot.",
  player_side: "white",
  player: {"name": "You", "rating": 2205, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { "avatar": "assets/modes/JcpCAs1a2gc/anarchy_bot_avatar.png","name": "Anarchy Bot", "rating": 1660, "tagline": "New response just dropped."},
  board: {"files": 8, "ranks": 8, "light": "#ebeed1", "dark": "#759f56"},
  bot: {"engine": "search", "elo": 1660, "depth": 3, "time_ms": 650},
  params: {
    hello: "Seriously, all they taught me were Reddit memes. I don't even know how the horsey moves.",
    chat: ["Please, I have children to feed. They don't pay me if I lose, but they literally didn't teach me anything about this game.",
      "Piece goes on vacation, never comes back.", "Is that how the horsey moves?", "Google il vaticano.",
      "I once met John Chess, inventor of chess.", "Literally 1984.", "I'm Magnus Carlsen. Ask me anything.",
      "Rook no longer in the corner, but still plotting world domination.", "King sacrifice anyone?",
      "Have you got 18,446,744,073,709,551,615 grains of rice I could borrow? I want to test something.",
      "Can anyone explain to me how the horsey moves?", "Bishop came back from vacation. You know where it's going.",
      "Chess 2 release date. Anyone?", "Did you know that there's a secret move that combines your knight and your rook into a new, more powerful piece? The Knook.",
      "Queen sacrifice anyone?"],
    lose: "The chess speaks for itself."
  },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/JcpCAs1a2gc/anarchy_knight.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    stockfishOk: true,
    onStart: function (ctx) { ctx.toast('Anarchy Bot: "' + ctx.params.hello + '"', 3200); },
    afterMove: function (ctx, m, info) {
      if (info.by !== 'bot') return;
      /* 4:58: the bot goes quiet once it is clearly losing */
      var ev = ctx.V.evaluate(ctx.state) * (ctx.bot === 'w' ? 1 : -1);
      if (ev > -400 && ctx.chance(0.35)) ctx.toast('Anarchy Bot: "' + ctx.pick(ctx.params.chat) + '"', 3000);
    },
    onGameOver: function (ctx, r) { if (r.w === ctx.human) ctx.toast('Anarchy Bot: "' + ctx.params.lose + '"', 3000); }
  },
  source: {"confidence": "high", "notes": "Rechecked against the transcript 2026-11-25: normal chess, bot lines quoted from the video. The rice number is ours (the narrator refuses to read it).", "research": "research/modes/JcpCAs1a2gc.json"}
});
