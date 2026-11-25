/* Can I LOSE to Zach?  Reverse challenge inspired by GothamChess failing to lose to Zach, chess.com's weakest bot (UI
   shows 100; transcript says "rated 1"). The player tries to GET CHECKMATED: weaken the king (clear the kingside back
   rank) and force Zach to deliver mate. Sources: research/modes/A0mFldyCgfw.json, frames (Zach 100, green board).
   Zach is modelled as nearly random and often missing mates (takes an available mate ~35% of the time). Avatar original. */
CM.mode({
  id: 'A0mFldyCgfw',
  title: 'Can I LOSE to Zach?',
  name: 'Lose to Zach',
  category: 'Other Videos',
  description: 'Reverse chess challenge: try to get checkmated by Zach, the weakest bot on chess.com. Normal rules apply, but Zach barely knows how the pieces work and keeps missing the mate you set up for him. Open up your own king and leave him no choice.',
  how_to_win: 'Get your own king checkmated by Zach. Checkmating him by accident counts as a loss.',
  player_side: 'white',
  opponent: { name: 'Zach', rating: 100, avatar: 'assets/modes/A0mFldyCgfw/zach.svg', tagline: 'The weakest bot on chess.com.' },
  board: { files: 8, ranks: 8, light: '#eaeed0', dark: '#759d54' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', elo: 100, depth: 1, time_ms: 200 },
  messages: { win_title: 'You Lost! (You Win)', win: 'Zach finally checkmated you.', loss: 'Oops, you checkmated Zach.' },
  hooks: {
    checkWin: function (V, st, moves) {
      if (moves.length) return null;
      if (V.inCheck(st, 'w')) return { w: 'w', why: 'Zach checkmated you: mission accomplished' };
      if (V.inCheck(st, 'b')) return { w: 'b', why: 'you checkmated Zach by accident' };
      return { w: 'd', why: 'stalemate' };
    },
    botPick: function (ctx, L) {
      var V = ctx.V, mates = L.filter(function (x) { var n = x.m.n || V.make(ctx.state, x.m); return V.inCheck(n, 'w') && !V.legal(n).length; });
      if (mates.length && ctx.chance(0.35)) return mates[0];
      var rest = L.filter(function (x) { return mates.indexOf(x) < 0; });
      return ctx.pick(rest.length ? rest : L);
    },
    status: function (ctx) { return ctx.over ? null : (ctx.V.inCheck(ctx.state, 'w') ? 'You are in check. Can Zach find the mate?' : 'Goal: get checkmated by Zach'); }
  },
  source: { research: 'research/modes/A0mFldyCgfw.json', confidence: 'high', notes: 'Zach mate-taking rate inferred from the video premise.' }
});
