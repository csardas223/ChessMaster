/* Chess, But the Locust Is In Your Computer. Standard chess vs Stockfish (3600). After every full turn (White + Black)
   there is a 66% chance the Locust appears on a random square (any square, empty or not). It stays one full turn as a
   warning, then deletes that square and any piece still on it for the rest of the game, and leaves to pick a new
   victim. Deleted squares are holes: nothing lands on them and sliders cannot cross them. An evaporated king loses.
   Sources: research/modes/PDCuJf3SdRY.json (transcript 00:01 66% per full turn, 00:57 warning then evaporation, 01:50
   bishops cannot cross "it would simply fall through", 02:42 rook trapped on a8, 16:23 draw), rules.jsonl, frames
   visual_a (black void squares, Locust face, brown #e8d3b3/#ae8265). Inferred: one Locust at a time (a new one may roll
   right after a deletion), the king rule, jumpscare only on the first appearance. Art is original. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function roundEnd(ctx) {
    var V = ctx.V, x = ctx.x, chain = Promise.resolve();
    if (x.locust != null && x.locust >= 0) {
      var at = x.locust;
      chain = wait(ctx, 450).then(function () {
        var victim = ctx.at(at);
        ctx.set(at, ctx.piece('Void', 'n')); ctx.setX('locust', -1);
        ctx.fx({ type: 'flash', at: at, color: '#000', opacity: 0.95, duration_ms: 500 });
        ctx.fx({ type: 'particles', kind: 'dust', at: at });
        ctx.sound(victim ? 'capture' : 'move-opponent');
        if (victim) {
          ctx.toast('The Locust evaporated the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + ' on ' + ctx.name(at) + '.', 1900);
          if (V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'the Locust evaporated your king' : 'the Locust evaporated the Stockfish king'); return; }
        }
        return wait(ctx, 300);
      });
    }
    return chain.then(function () {
      if (ctx.over || !ctx.chance(ctx.params.chance)) { ctx.refresh(); return; }
      var cand = ctx.geo.squares().filter(function (i) { var p = ctx.at(i); return !p || p.t !== 'Void'; });
      if (!cand.length) return;
      var at = ctx.pick(cand); ctx.setX('locust', at);
      if (!ctx.x.seen) { ctx.setX('seen', 1); ctx.fx({ type: 'jumpscare', image: 'assets/modes/PDCuJf3SdRY/locust.png', duration_ms: 700, shake: false, background: 'rgba(0,0,0,.85)' }); }
      else { ctx.fx({ type: 'flash', at: at, color: '#ff2a2a', opacity: 0.6, duration_ms: 450 }); ctx.sound('notify'); }
      ctx.toast('The Locust appeared on ' + ctx.name(at) + '. It deletes that square next turn.', 2000);
      ctx.refresh();
    });
  }
  CM.mode({
    id: 'PDCuJf3SdRY',
    name: 'The Locust',
    category: 'Horror Chess',
    description: 'After every full turn there is a 66% chance the Locust lands on a random square. One turn later it deletes that square, and any piece still on it, for the rest of the game. Deleted squares are holes: nothing can land on them and sliders cannot cross them.',
    how_to_win: 'Checkmate Stockfish. Get your pieces off the Locust\'s square in time.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Running on an infected computer.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e8d3b3', dark: '#ae8265' },
    pieces: { Void: { name: 'Deleted square', moves: '', value: 0, blocker: true, capturable: false, overlay: 'void' } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { locust: -1 } },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    params: { chance: 0.66 },
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return roundEnd(ctx); },
      evaluate: function (V, st) {
        var l = st.x && st.x.locust; if (l == null || l < 0) return 0;
        var p = st.b[l]; if (!p || p.c === 'n') return 0;
        return (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 5000 : V.def(p.t).value * 0.9);
      },
      decorate: function (ctx, sq, p) {
        if (p && p.t === 'Void') return { html: '<span class="sq-tint" style="background:#000"></span>' };
        if (sq === ctx.x.locust) return { html: '<span class="sq-tint" style="background:rgba(200,20,20,.35)"></span><img alt="" src="assets/modes/PDCuJf3SdRY/locust.png" style="position:absolute;inset:0;width:100%;height:100%;opacity:.55;z-index:3;pointer-events:none">' };
        return null;
      },
      status: function (ctx) { var l = ctx.x.locust; return l != null && l >= 0 ? 'The Locust is on ' + ctx.name(l) + '. It deletes that square after this turn.' : 'No Locust right now.'; }
    },
    source: { research: 'research/modes/PDCuJf3SdRY.json', confidence: 'high', notes: 'One Locust at a time; jumpscare only on its first appearance.' }
  });
})();
