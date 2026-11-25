/* Chess, But I Lose Half My Time Every Move. Standard chess vs Martin (250): every move you make cuts your remaining
   clock in half, so a huge starting clock collapses toward zero. Martin's clock is normal.
   Sources: research/modes/p49nLVPVmws.json (frame: my clock 1:59:26, thumbnail 10:00.00 -> 00:00.05, Martin (250),
   green #EBF2D1/#7BA058; transcript unavailable, analyzer 404).
   Inferred: start 2:00:00 for both (the frame clock), halving applies after the move (before Martin replies), Martin
   never flags, no increment. */
(function () {
  CM.mode({
    id: 'p49nLVPVmws',
    name: 'Half Time Every Move',
    category: 'Powerups & Rule Twists',
    description: 'Normal chess against Martin, but every move you make cuts your remaining time in half. Two hours sounds like a lot until it is 14 seconds.',
    how_to_win: 'Checkmate Martin before your clock hits zero.',
    player_side: 'white',
    opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/9pHhqAbQS0s/martin.png', tagline: 'chess.com beginner bot. In no hurry at all.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ebf2d1', dark: '#7ba058' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    clock: { w: 7200, b: 7200, inc: 0, bot: false },
    bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
    messages: { loss: 'your clock ran out' },
    /* intro: the video's own clock-halving graphic (research/frames/sprites/p49nLVPVmws_clock_halving.png) */
    vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/p49nLVPVmws/clock_halving.png', fit: 'contain', duration_ms: 2200, fade_ms: 300 }],
    hooks: {
      afterMove: function (ctx, m, info) {
        var G = ctx.game; if (info.by !== 'player' || !G.clock) return null;
        var before = G.clock[ctx.human]; G.clock[ctx.human] = Math.max(0, before / 2);
        ctx.fx({ type: 'text', text: '÷2', at: 'board', color: '#e02828', size: 64, duration_ms: 650 });
        if (G.clock[ctx.human] < 1000) ctx.toast('Less than a second left!', 1400);
        return null;
      },
      status: function (ctx) { var G = ctx.game; return G.clock ? 'Your time halves after each move. Next move leaves ' + CM.util.fmtClock(G.clock[ctx.human] / 2) + '.' : ''; }
    },
    todo_pass2: ['big clock with hundredths display when time is short (owner: match the video clock style)'],
    source: { research: 'research/modes/p49nLVPVmws.json', confidence: 'medium', notes: 'Start time 2:00:00 from the frame clock; transcript missing.' }
  });
})();
