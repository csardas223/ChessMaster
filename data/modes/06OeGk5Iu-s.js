/* Chess, But SCP-682 HATES Your Existence. Standard chess vs Stockfish (3600) with a neutral SCP-682 (the reptile) on
   d4. It lies dormant until a piece attacks it. After every round (after Black's move), if pieces attack it, it copies
   the movement of one attacker (random; a pawn keeps its colour's direction) and makes one move with it, always taking
   a piece when it can (kings first, then the most valuable piece, either colour). It cannot be captured. If it eats a
   king, that side loses.
   Sources: research/modes/06OeGk5Iu-s.json (transcript 00:01 rule and d4 start, 00:50 dormant, 01:15 copies the knight
   and wipes it out, 04:19 targets the king on e8, 06:36 game 2 knights only), frames visual_b (brown board
   #ead2ba/#ae7e66, green square under the reptile, Stockfish (3600)). Inferred: capture preference order and the
   "creep toward the nearest piece" move when no capture exists. Art is original. */
(function () {
  var NAMES = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' };
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function repSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Z') return i; return -1; }
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
  /* moves of the reptile with the copied ability: a fake colour ('x' moves up like White, 'y' down like Black) lets it
     take pieces of both colours */
  function reptileMoves(V, st, sq, type, color) {
    var b = st.b, saved = b[sq];
    b[sq] = { t: type, c: color === 'w' ? 'x' : 'y', m: 1 };
    var out = []; V.genPiece(st, sq, out, true);
    b[sq] = saved;
    return out.filter(function (m) { return !m.cap || V.def(m.cap.t).capturable !== false; });
  }
  function act(ctx) {
    var V = ctx.V, st = ctx.state, s = repSq(st); if (s < 0 || ctx.over) return null;
    var att = attackersOf(V, st, s);
    if (!att.length) { ctx.setX('ability', null); return null; }
    var src = ctx.pick(att), sp = ctx.at(src), type = sp.t;
    ctx.setX('ability', type);
    ctx.fx({ type: 'arrow', from: src, to: s, color: 'rgba(70, 160, 60, 0.85)', duration_ms: 800 });
    var ms = reptileMoves(V, st, s, type, sp.c);
    if (!ms.length) { ctx.toast('SCP-682 copied the ' + NAMES[type] + ' but cannot move.', 1600); return null; }
    var caps = ms.filter(function (m) { return m.cap; }), pick;
    if (caps.length) {
      caps.sort(function (a, b) { return (V.def(b.cap.t).royal ? 1e6 : V.def(b.cap.t).value) - (V.def(a.cap.t).royal ? 1e6 : V.def(a.cap.t).value); });
      var top = caps.filter(function (m) { return V.def(m.cap.t).value === V.def(caps[0].cap.t).value && !!V.def(m.cap.t).royal === !!V.def(caps[0].cap.t).royal; });
      pick = ctx.pick(top);
    } else {
      var g = ctx.geo, occ = ctx.pieces(function (p) { return p.c !== 'n'; });
      var near = function (t) { var d = 99; occ.forEach(function (i) { var x = g.dist(i, t); if (x < d) d = x; }); return d; };
      var best = Math.min.apply(null, ms.map(function (m) { return near(m.t); }));
      pick = ctx.pick(ms.filter(function (m) { return near(m.t) === best; }));
    }
    return wait(ctx, 700).then(function () {
      var victim = ctx.at(pick.t);
      ctx.fx({ type: 'arrow', from: s, to: pick.t, color: 'rgba(40, 140, 40, 0.9)', duration_ms: 700 });
      ctx.move(s, pick.t); ctx.sound(victim ? 'capture' : 'move-opponent');
      if (victim) ctx.fx({ type: 'particles', kind: 'blood', at: pick.t });
      ctx.toast('SCP-682 copied the ' + NAMES[type] + (victim ? ' and ate the ' + (victim.c === 'w' ? 'white ' : 'black ') + NAMES[victim.t] : ' and moved') + '.', 1800);
      if (victim && V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'SCP-682 ate your king' : 'SCP-682 ate the Stockfish king'); return; }
      ctx.refresh();
      return wait(ctx, 300);
    });
  }
  CM.mode({
    id: '06OeGk5Iu-s',
    name: 'SCP-682 Reptile',
    category: 'Horror Chess',
    description: 'SCP-682 lies dormant on d4. After each round, if any piece attacks it, it copies that piece\'s movement (random pick among attackers) and makes one move with it, eating a piece of either colour whenever it can. It cannot be captured.',
    how_to_win: 'Checkmate Stockfish, or steer SCP-682 into eating the black king.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'SCP-682 hates it too.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ba', dark: '#ae7e66' },
    pieces: { Z: { name: 'SCP-682', moves: '', value: 0, capturable: false, img: 'assets/modes/06OeGk5Iu-s/reptile.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Z', color: 'n', at: 'd4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      init: function (ctx) { ctx.geo.setDir('x', 'up'); ctx.geo.setDir('y', 'down'); },
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return act(ctx); },
      /* pieces next to the reptile are in danger; both sides keep a little distance */
      evaluate: function (V, st) {
        var s = repSq(st); if (s < 0) return 0;
        var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var d = g.dist(i, s); if (d <= 2) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 60 : V.def(p.t).value * 0.08) * (3 - d); }
        return v;
      },
      decorate: function (ctx, sq) {
        var s = repSq(ctx.state); if (sq !== s) return null;
        var ab = ctx.x.ability;
        return { html: '<span class="sq-tint" style="background:rgba(60,170,60,.55)"></span>', badge: ab ? ab : null };
      },
      status: function (ctx) { var ab = ctx.x.ability; return ab ? 'SCP-682 has the movement of a ' + NAMES[ab] + '.' : 'SCP-682 is dormant. Attack it and it copies your piece.'; }
    },
    source: { research: 'research/modes/06OeGk5Iu-s.json', confidence: 'high', notes: 'Capture preference (king, then value) and creeping move inferred.' }
  });
})();
