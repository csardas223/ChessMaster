/* Chess, But You Can't Look at SCP-096. Standard chess vs Stockfish (3600) with a neutral SCP-096 "Shy Guy" on a4.
   Any piece of either colour that attacks ("looks at") his square is eaten: he moves onto it. Several attackers: he
   picks one at random. He then waits on the new square and reacts again to whatever attacks him there.
   Sources: research/modes/-fax07t_o5s.json (transcript 00:01 rule, 00:27 1.c4 would let him take the queen, 03:29 he
   eats the queen on d7, "Shy Guy does randomly choose", 09:54 game 2 once per full round), frames visual_a (brown
   board #e8d3b3/#ae8265, purple arrows, Stockfish (3600)). Timing: game 1 (after every ply) is the default; the
   "Once per round" option in params.timing reproduces game 2. Inferred: scream flash/shake length. Art is original. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function shySq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'S') return i; return -1; }
  /* pieces (either colour) that attack square sq: generate their captures with a probe on sq */
  function attackersOf(V, st, sq) {
    var b = st.b, saved = b[sq], out = [];
    b[sq] = { t: '?', c: '?', m: 1, probe: 1 };
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!p || i === sq || p.c === 'n' || p.probe || V.def(p.t).blocker) continue;
      var ms = []; V.genPiece(st, i, ms, true);
      for (var k = 0; k < ms.length; k++) if (ms[k].t === sq && ms[k].cap) { out.push(i); break; }
    }
    b[sq] = saved; return out;
  }
  function react(ctx) {
    var V = ctx.V, s = shySq(ctx.state); if (s < 0 || ctx.over) return null;
    var att = attackersOf(V, ctx.state, s); if (!att.length) return null;
    var a = ctx.pick(att), victim = ctx.at(a);
    ctx.fx({ type: 'arrow', from: s, to: a, color: 'rgba(160, 60, 220, 0.85)', duration_ms: 900 });
    ctx.fx({ type: 'flash', color: '#ffffff', opacity: 0.35, duration_ms: 260, at: 'screen' });
    ctx.fx({ type: 'shake', intensity: 6, duration_ms: 320 });
    ctx.sound('jumpscare');
    return wait(ctx, 650).then(function () {
      ctx.move(s, a); ctx.sound('capture');
      ctx.fx({ type: 'particles', kind: 'blood', at: a });
      ctx.toast('SCP-096 saw the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + ' looking at it.', 1800);
      if (V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'SCP-096 ate your king' : 'SCP-096 ate the Stockfish king'); return; }
      ctx.refresh();
      return wait(ctx, 250);
    });
  }
  CM.mode({
    id: '-fax07t_o5s',
    name: 'SCP-096 Shy Guy',
    category: 'Horror Chess',
    description: 'SCP-096 sits on a4. Any piece, yours or Stockfish\'s, that attacks his square gets eaten: he moves onto it and waits there. With several attackers he picks one at random. He cannot be captured. He reacts after every move.',
    how_to_win: 'Checkmate Stockfish, or lure SCP-096 into eating the black king.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Never looks at SCP-096 on purpose.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e8d3b3', dark: '#ae8265' },
    pieces: { S: { name: 'SCP-096', moves: '', value: 0, capturable: false, img: 'assets/modes/-fax07t_o5s/shyguy.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'S', color: 'n', at: 'a4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    params: { timing: 'ply' },
    hooks: {
      afterMove: function (ctx, m, info) {
        if (ctx.params.timing === 'round' && info.by !== 'bot') return null;
        return react(ctx);
      },
      /* both sides avoid looking at him (pure: uses attack tables only) */
      evaluate: function (V, st) {
        var s = shySq(st); if (s < 0) return 0;
        var v = 0;
        if (V.attacked(st, s, 'w')) v -= 260;
        if (V.attacked(st, s, 'b')) v += 260;
        return v;
      },
      decorate: function (ctx, sq) {
        var s = shySq(ctx.state); if (s < 0 || sq !== s) return null;
        return { html: '<span class="sq-tint" style="background:rgba(150,60,210,.28)"></span>' };
      },
      status: function (ctx) { var s = shySq(ctx.state); return s < 0 ? '' : 'SCP-096 is on ' + ctx.name(s) + '. Don\'t look at him.'; }
    },
    source: { research: 'research/modes/-fax07t_o5s.json', confidence: 'high', notes: 'Game 1 timing (every ply). Random choice among attackers.' }
  });
})();
