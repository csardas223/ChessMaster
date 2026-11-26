/* Chess, But SCP-4975 Is Trying to Crack You. A challenge from iwantcheckmate.com (/challenges/crack, studied
   2026-11-26; no video yet, so no_video). Standard chess vs Stockfish (3600) with a neutral SCP-4975 on e4. It is a
   solid obstacle: nothing can land on it or pass through it, and nobody can capture it.
   After every round (after Black's move) it crawls one square to a random empty square next to it (any of the 8
   directions; if all 8 are taken it stays and does nothing), then scans the 8 squares around it one by one, clockwise
   from the top-left. A piece it scans, of either colour, cracks. A piece that is already cracked shatters and is gone.
   Kings crack too; a cracked king that is scanned again shatters and its side loses. The crack stays with the piece
   when it moves and disappears with it when it is captured.
   Rules reimplemented from the site's own page (no code or art copied). Scan look: a grey (#808080) flash per square,
   200 ms apart, 0 -> 85% -> 0 over 900 ms, the hit landing 300 ms in. Art (SCP-4975 sprite) is original. */
(function () {
  var IMG = 'assets/modes/icm-scp4975/scp4975.png';
  /* the hairline crack drawn over a cracked piece (our own drawing) */
  var CRACK = '<svg class="g4975-crack" viewBox="0 0 100 100" aria-hidden="true" style="position:absolute;inset:8%;width:84%;height:84%;z-index:3;pointer-events:none;overflow:visible">' +
    '<path d="M54 6 L47 27 L58 39 L44 55 L52 68 L41 94 M47 27 L33 33 M58 39 L71 46 M44 55 L30 61 M52 68 L64 79" fill="none" stroke="#111" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" opacity=".82"/>' +
    '<path d="M54 6 L47 27 L58 39 L44 55 L52 68 L41 94" fill="none" stroke="#fff" stroke-width="1" stroke-linejoin="round" opacity=".55" transform="translate(1.4 .6)"/></svg>';
  function find(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'C75') return i; return -1; }
  function hit(ctx, sq) {
    var p = ctx.at(sq), V = ctx.V; if (!p || p.c === 'n' || ctx.over) return;
    var who = (p.c === 'w' ? 'white ' : 'black ') + (V.def(p.t).name || p.t).toLowerCase();
    if (p.crk) {
      var royal = V.def(p.t).royal;
      ctx.remove(sq); ctx.sound('capture');
      ctx.fx({ type: 'particles', kind: 'dust', at: sq, count: 14 });
      ctx.refresh({ instant: true });
      if (royal) { ctx.endGame(p.c === ctx.human ? 'bot' : 'player', p.c === ctx.human ? 'SCP-4975 shattered your king' : 'SCP-4975 shattered the Stockfish king'); return; }
      ctx.toast('The ' + who + ' on ' + ctx.name(sq) + ' shattered.', 1700);
      return;
    }
    ctx.transform(sq, { props: { crk: 1 } });
    ctx.sound('move-check');
    ctx.refresh({ instant: true });
    if (V.def(p.t).royal) ctx.toast('Your ' + (p.c === ctx.human ? '' : 'opponent\'s ') + 'king is cracked. One more scan shatters it.', 2000);
  }
  function crawl(ctx) {
    var AF = CM.abilityFx, s = find(ctx.state); if (s < 0 || ctx.over) return null;
    var opts = AF.ring(ctx, s).filter(function (j) { return !ctx.at(j); });
    if (!opts.length) return null;   /* boxed in: it neither moves nor scans this round */
    var to = ctx.pick(opts);
    return AF.wait(ctx, 400).then(function () {
      if (ctx.over) return null;
      ctx.move(s, to); ctx.sound('move-opponent'); ctx.refresh();
      return AF.wait(ctx, 320);
    }).then(function () {
      if (ctx.over) return null;
      return AF.sweep(ctx, AF.ring(ctx, to), { color: '#808080', peak: 0.85, duration_ms: 900, rise: 1 / 3, hold: 4 / 9, stagger_ms: 200 }, function (sq) {
        if (!ctx.over) hit(ctx, sq);
      });
    }).then(function () { if (!ctx.over) ctx.refresh(); });
  }
  CM.mode({
    id: 'icm-scp4975',
    no_video: true,
    lobby: { thumb: 'assets/modes/icm-scp4975/thumb.jpg' },
    title: 'Chess, But SCP-4975 Is Trying to Crack You',
    name: 'SCP-4975',
    category: 'Horror Chess',
    description: 'SCP-4975 starts on e4 and blocks its square. After every round it crawls one square in any direction, then scans the 8 squares around it: every piece there cracks, and a piece that is already cracked shatters. A king that is scanned twice shatters and loses.',
    how_to_win: 'Checkmate Stockfish, or let SCP-4975 shatter its king. Keep cracked pieces away from it.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Does not like the sound of cracking.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2b6', dark: '#af8164' },
    pieces: { C75: { name: 'SCP-4975', moves: '', value: 0, blocker: true, capturable: false, img: IMG, neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'C75', color: 'n', at: 'e4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot' || ctx.over) return null; return crawl(ctx); },
      /* pieces in reach of the next scan (king distance 2 of SCP-4975) are in danger, cracked ones much more */
      evaluate: function (V, st) {
        var s = find(st); if (s < 0) return 0;
        var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) {
          var p = st.b[i]; if (!p || p.c === 'n' || g.dist(i, s) > 2) continue;
          var royal = V.def(p.t).royal, w = p.crk ? (royal ? 4000 : V.def(p.t).value * 0.45) : (royal ? 120 : V.def(p.t).value * 0.08);
          v += p.c === 'w' ? -w : w;
        }
        return v;
      },
      decorate: function (ctx, sq, p) { return p && p.crk && p.c !== 'n' ? { html: CRACK } : null; },
      status: function (ctx) {
        var s = find(ctx.state), n = ctx.pieces(function (p) { return p.crk && p.c !== 'n'; }).length;
        return (s >= 0 ? 'SCP-4975 is on ' + ctx.name(s) + '. ' : '') + (n ? n + ' cracked piece' + (n === 1 ? '' : 's') + ' on the board.' : 'Nothing cracked yet.');
      }
    },
    source: { research: 'iwantcheckmate.com/challenges/crack (page JS read 2026-11-26)', confidence: 'high', notes: 'Rules are the site\'s; no video to compare yet. The site\'s king-of-either-colour loss on a second hit and the "boxed in: no move, no scan" rule are kept.' }
  });
})();
