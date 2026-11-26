/* Chess, But SCP-035 Mind Controls Your Pieces. Standard chess vs Stockfish (3600) with SCP-035 (the mask) on b4.
   At the end of each round the mask looks at its 8 neighbours (clockwise from the top-left); the first piece it finds
   (either colour, kings excepted) becomes its host: a neutral, mind-controlled piece. Each round after Black's move the
   host moves with its own movement pattern toward the nearest king, giving check and capturing anything. A host that
   captures is released back to its owner and the mask respawns; a host that gets captured also respawns the mask.
   Respawn prefers an empty square with no neighbours.
   Sources: research/modes/4XV3SBMQgXE.json (transcript 00:01 b4 start, 00:55 order White/Black/mask toward the enemy
   king, 02:11 the mask takes on d7 with check and respawns, preference for squares with no adjacent pieces, 09:18
   ladder mate), rules.jsonl, frames visual_b (brown #ead2ae/#ae7e66, purple arrows, Stockfish (3600)).
   Inferred: kings are never possessed; a host that captures returns to its owner (matches the d7 check in the video);
   the host gives check to both kings. Art is original. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function find(st, f) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && f(st.b[i])) return i; return -1; }
  var maskSq = function (st) { return find(st, function (p) { return p.t === 'Mask'; }); };
  var hostSq = function (st) { return find(st, function (p) { return p.host; }); };
  function hostMoves(V, st, sq) {
    var b = st.b, p = b[sq]; b[sq] = Object.assign({}, p, { c: p.own === 'w' ? 'x' : 'y', m: 1 });
    var out = []; V.genPiece(st, sq, out, true); b[sq] = p;
    return out.filter(function (m) { return !m.cap || (V.def(m.cap.t).capturable !== false && m.cap.t !== 'Mask'); });
  }
  function respawn(ctx) {
    var g = ctx.geo, best = 99, cand = [];
    ctx.emptySquares().forEach(function (i) {
      var n = 0; for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(i, dc, dr); if (j >= 0 && ctx.at(j)) n++; }
      if (n < best) { best = n; cand = [i]; } else if (n === best) cand.push(i);
    });
    if (!cand.length) return;
    var at = ctx.pick(cand); ctx.spawn('Mask', 'n', at);
    ctx.fx({ type: 'particles', kind: 'smoke', at: at });
    ctx.toast('SCP-035 respawned on ' + ctx.name(at) + '.', 1600);
  }
  var CW = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
  function possess(ctx) {
    var g = ctx.geo, s = maskSq(ctx.state); if (s < 0) return false;
    for (var k = 0; k < 8; k++) {
      var j = g.step(s, CW[k][0], CW[k][1]); if (j < 0) continue;
      var p = ctx.at(j); if (!p || p.c === 'n' || ctx.V.def(p.t).royal || ctx.V.def(p.t).blocker) continue;
      ctx.remove(s);
      ctx.set(j, Object.assign({}, p, { c: 'n', host: 1, own: p.c, img: CM.settings.pieceUrl(p.c, p.t) }));
      ctx.fx({ type: 'arrow', from: s, to: j, color: 'rgba(170, 70, 210, 0.85)', duration_ms: 800 });
      ctx.fx({ type: 'piece_transform', at: j, style: 'flash', color: '#c47be0' });
      ctx.toast('SCP-035 took the ' + (p.c === 'w' ? 'white ' : 'black ') + (ctx.V.def(p.t).name || p.t).toLowerCase() + ' as its host.', 1800);
      return true;
    }
    return false;
  }
  function hostTurn(ctx) {
    var V = ctx.V, g = ctx.geo, st = ctx.state, h = hostSq(st); if (h < 0) return null;
    var ms = hostMoves(V, st, h); if (!ms.length) return null;
    var kings = ctx.pieces(function (p) { return p.t === 'K'; });
    var dk = function (t) { var d = 99; kings.forEach(function (k) { d = Math.min(d, g.dist(k, t)); }); return d; };
    var score = function (m) { if (m.cap && V.def(m.cap.t).royal) return 1e6; return -dk(m.t) * 100 + (m.cap ? V.def(m.cap.t).value / 10 : 0) + Math.random(); };
    ms.sort(function (a, b) { return score(b) - score(a); });
    var mv = ms[0];
    ctx.fx({ type: 'arrow', from: mv.f, to: mv.t, color: 'rgba(170, 70, 210, 0.85)', duration_ms: 900 });
    return wait(ctx, 650).then(function () {
      var victim = ctx.at(mv.t), hp = ctx.at(mv.f);
      ctx.move(mv.f, mv.t); ctx.sound('scp035_possess');
      if (victim && V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'SCP-035\'s host took your king' : 'SCP-035\'s host took the Stockfish king'); return; }
      var np = ctx.at(mv.t);
      if (np && V.def(np.t).pawn && g.relRow(mv.t, np.own) === g.depth(np.own) - 1) ctx.transform(mv.t, { type: 'Q', props: { img: CM.settings.pieceUrl(np.own, 'Q') } });
      if (victim) {
        var freed = ctx.at(mv.t), back = Object.assign({}, freed, { c: freed.own }); delete back.host; delete back.own; delete back.img;
        ctx.set(mv.t, back);
        ctx.toast('The host took a ' + (V.def(victim.t).name || victim.t).toLowerCase() + ' and was released.', 1800);
        respawn(ctx);
      }
      ctx.refresh();
      return wait(ctx, 250);
    });
  }
  CM.mode({
    id: '4XV3SBMQgXE',
    name: 'SCP-035 Mask',
    category: 'Horror Chess',
    description: 'SCP-035 starts on b4. At the end of each round it possesses a piece next to it (either colour). After Black\'s move the host moves toward the nearest king with its own movement, giving check and capturing anything. A host that captures is released; if the host is captured or released, the mask respawns on a quiet square.',
    how_to_win: 'Checkmate Stockfish. Feed the mask pieces near the black king.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Keeps its pieces away from the mask.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ae', dark: '#ae7e66' },
    pieces: { Mask: { name: 'SCP-035', moves: '', value: 0, capturable: false, img: 'assets/modes/4XV3SBMQgXE/mask.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Mask', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 700 },
    sounds: { 'scp035_possess': 'assets/modes/4XV3SBMQgXE/scp035_possess.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
    hooks: {
      init: function (ctx) { ctx.geo.setDir('x', 'up'); ctx.geo.setDir('y', 'down'); },
      /* the host gives check to both kings */
      attacks: function (V, st, sq) {
        var h = -1; for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].host) { h = i; break; }
        if (h < 0 || h === sq) return false;
        var ms = hostMoves(V, st, h); for (var k = 0; k < ms.length; k++) if (ms[k].t === sq) return true;
        return false;
      },
      afterMove: function (ctx, m, info) {
        var st = ctx.state;
        if (hostSq(st) < 0 && maskSq(st) < 0) respawn(ctx);       /* the host was captured */
        if (info.by !== 'bot') return null;
        if (hostSq(ctx.state) >= 0) {
          return Promise.resolve(hostTurn(ctx)).then(function () { if (!ctx.over && hostSq(ctx.state) < 0) { if (maskSq(ctx.state) < 0) respawn(ctx); possess(ctx); ctx.refresh(); } });
        }
        if (possess(ctx)) ctx.refresh();
        return null;
      },
      decorate: function (ctx, sq, p) {
        if (p && p.host) return { html: '<span class="sq-tint" style="background:rgba(170,70,210,.35)"></span><img alt="" src="assets/modes/4XV3SBMQgXE/mask.png" style="position:absolute;right:2%;top:2%;width:42%;height:42%;z-index:3;pointer-events:none">' };
        return null;
      },
      status: function (ctx) { var h = hostSq(ctx.state); return h >= 0 ? 'SCP-035 controls the piece on ' + ctx.name(h) + '.' : 'SCP-035 is looking for a host.'; }
    },
    source: { research: 'research/modes/4XV3SBMQgXE.json', confidence: 'medium', notes: 'Kings never possessed and released-host rule inferred.' }
  });
})();
