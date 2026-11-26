/* Chess, But the Locust Is In Your Computer. Standard chess vs Stockfish (3600). After every full turn (White + Black)
   there is a 66% chance the Locust appears on a random square (any square, empty or not). It stays one full turn as a
   warning, then deletes that square and any piece still on it for the rest of the game, and leaves to pick a new
   victim. Deleted squares are holes: nothing lands on them and sliders cannot cross them. An evaporated king loses.
   Sources: research/modes/PDCuJf3SdRY.json (transcript 00:01 66% per full turn, 00:57 warning then evaporation, 01:50
   bishops cannot cross "it would simply fall through", 02:42 rook trapped on a8, 16:23 draw), rules.jsonl, frames
   visual_a (black void squares, Locust face, brown #e8d3b3/#ae8265). One Locust at a time; no new roll in a round with a deletion, and never on
   Stockfish's king's square (both from iwantcheckmate.com/challenges/locust, 2026-11-26). Inferred: the king rule. Animations follow iwantcheckmate.com/challenges/locust (2026-11-25). Art is original. */
(function () {
  var LOCUST = 'assets/modes/PDCuJf3SdRY/locust.png';
  /* As on iwantcheckmate.com/challenges/locust: the Locust fades in on its square over 1 s, beneath the piece standing
     there; nothing else marks it. A turn later the square cracks into shards that drop out of sight (with any piece on
     it) while the Locust trembles, then the Locust fades out over 1 s and the square is a hole. */
  function roundEnd(ctx) {
    var V = ctx.V, x = ctx.x, chain = Promise.resolve(), AF = CM.abilityFx, struck = false;
    if (x.locust != null && x.locust >= 0) {
      struck = true;   /* as on iwantcheckmate.com/challenges/locust: a round with a deletion rolls no new Locust */
      var at = x.locust;
      chain = AF.wait(ctx, 450).then(function () {
        var victim = ctx.at(at), g = ctx.geo, light = g.isLight(at);
        var sqColor = getComputedStyle(document.documentElement).getPropertyValue(light ? '--sq-light' : '--sq-dark').trim() || (light ? '#e8d3b3' : '#ae8265');
        /* drawn over the (now empty) hole: shards, then the Locust, then the falling piece */
        var fall = ctx.fx({ type: 'shatter', at: at, color: sqColor, piece: victim ? ctx.game.pieceImage(victim) : null });
        ctx.fx({ type: 'sprite', id: 'locust', at: at, src: LOCUST });
        ctx.set(at, ctx.piece('Void', 'n')); ctx.setX('locust', -1);
        ctx.refresh({ instant: true });
        ctx.sound(victim ? 'capture' : 'move-opponent');
        ctx.fx({ type: 'sprite_tremor', id: 'locust', duration_ms: 1050 });
        if (victim) {
          ctx.toast('The Locust evaporated the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + ' on ' + ctx.name(at) + '.', 1900);
          if (V.def(victim.t).royal) { return Promise.resolve(fall).then(function () { ctx.fx({ type: 'sprite_out', id: 'locust', fade_ms: 1000 }); ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'the Locust evaporated your king' : 'the Locust evaporated the Stockfish king'); }); }
        }
        return Promise.resolve(fall).then(function () { return ctx.fx({ type: 'sprite_out', id: 'locust', fade_ms: 1000 }); });
      });
    }
    return chain.then(function () {
      if (ctx.over || struck || !ctx.chance(ctx.params.chance)) { ctx.refresh(); return; }
      /* any square that is not a hole, except the one Stockfish's king stands on (the site never targets it) */
      var cand = ctx.geo.squares().filter(function (i) { var p = ctx.at(i); return !p || (p.t !== 'Void' && !(p.c === ctx.bot && V.def(p.t).royal)); });
      if (!cand.length) return;
      var at = ctx.pick(cand); ctx.setX('locust', at);
      ctx.game._locustT = performance.now();
      ctx.sound('notify');
      ctx.toast('The Locust appeared on ' + ctx.name(at) + '. It deletes that square next turn.', 2000);
      ctx.refresh();
      return AF.wait(ctx, 1000);
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
        if (sq === ctx.x.locust) {   /* beneath the piece; fades in over its first second (negative delay keeps re-renders in step) */
          var age = performance.now() - (ctx.game._locustT || 0), fade = age < 1000 ? ' fx-fadein" style="animation-delay:-' + Math.round(age) + 'ms' : '';
          return { html: '<img alt="" class="fx-locust' + fade + '" src="' + LOCUST + '">' };
        }
        return null;
      },
      status: function (ctx) { var l = ctx.x.locust; return l != null && l >= 0 ? 'The Locust is on ' + ctx.name(l) + '. It deletes that square after this turn.' : 'No Locust right now.'; }
    },
    source: { research: 'research/modes/PDCuJf3SdRY.json', confidence: 'high', notes: 'One Locust at a time. Appear / break animation follows iwantcheckmate.com/challenges/locust (no jumpscare, 2026-11-25).' }
  });
})();
