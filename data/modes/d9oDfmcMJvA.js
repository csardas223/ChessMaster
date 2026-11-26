/* Chess, But Archangel Gabriel Knows What You Are. Standard chess vs Stockfish (3600) with a neutral Archangel Gabriel
   (Mandela Catalogue) on b4. Each round after Black's move: every piece next to Gabriel (8 neighbours, either colour)
   becomes an "alternate", a piece controlled by no one; then Gabriel steps one square in a random orthogonal direction
   (never capturing; no empty square, no move); then every alternate makes a random move with its own movement (pawns
   keep their direction) and may capture anything.
   Sources: research/modes/d9oDfmcMJvA.json (transcript turn order White, Black, Gabriel, alternates; b4 start),
   rules.jsonl, frames (pink square under Gabriel, magenta lines, #e9d3b3/#af8264). Inferred: alternates can be captured
   like any piece, an alternate king (or a captured king) loses, alternate pawns promote to queens, greyed look.
   Art is original. */
(function () {
  var O4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function gabSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Gab') return i; return -1; }
  function altMoves(V, st, i) {
    var p = st.b[i], out = [];
    st.b[i] = { t: p.t, c: p.own === 'b' ? 'y' : 'x', m: 1 }; V.genPiece(st, i, out, true); st.b[i] = p;
    return out.filter(function (m) { return !m.cap || V.def(m.cap.t).capturable !== false; });
  }
  var EASE = 'cubic-bezier(.22,.61,.36,1)';
  function glide(ctx, f, t) { return Promise.resolve(ctx.fx({ type: 'slide', moves: [{ f: f, t: t }], duration_ms: 300, easing: EASE })); }
  /* one-shot ability effect (no standing ring): the squares of the pieces Gabriel is about to take glow magenta beneath
     them (up 0.3 s, hold 0.3 s, down 0.3 s) with one short glitch; at the peak they turn into alternates.
     Resolves { king } (a converted king ends the game) once the glow is gone. */
  function convert(ctx) {
    var V = ctx.V, s = gabSq(ctx.state); if (s < 0) return Promise.resolve({});
    var hit = CM.abilityFx.ring(ctx, s).filter(function (j) { var p = ctx.at(j); return p && p.c !== 'n' && !V.def(p.t).blocker; });
    if (!hit.length) return Promise.resolve({});
    var glow = ctx.fx({ type: 'pulse', squares: hit, color: '#ec48be', peak: 0.6, duration_ms: 900, rise: 1 / 3, hold: 2 / 3, under: true });
    return wait(ctx, 300).then(function () {
      var king = null;
      hit.forEach(function (j) {
        var p = ctx.at(j); if (V.def(p.t).royal) king = p;
        ctx.set(j, Object.assign({}, p, { c: 'n', own: p.c, alt: 1, img: CM.settings.pieceUrl(p.c, p.t), cls: 'pc--dead g1-alt' }));
      });
      ctx.fx({ type: 'glitch', intensity: 3, duration_ms: 260 });
      ctx.toast(hit.length + ' piece' + (hit.length === 1 ? '' : 's') + ' became alternate' + (hit.length === 1 ? '' : 's') + '.', 1500);
      if (king) return { king: king };
      ctx.refresh({ instant: true });
      return Promise.resolve(glow).then(function () { return { king: king }; });
    });
  }
  function round(ctx) {
    var V = ctx.V, g = ctx.geo;
    return convert(ctx).then(function (r) {
    if (r.king) { var king = r.king; ctx.endGame(king.c === ctx.human ? 'bot' : 'player', king.c === ctx.human ? 'your king became an alternate' : 'the Stockfish king became an alternate'); return null; }
    var s = gabSq(ctx.state), chain = wait(ctx, 150);
    if (s >= 0) {
      var steps = O4.map(function (d) { return g.step(s, d[0], d[1]); }).filter(function (j) { return j >= 0 && !ctx.at(j); });
      if (steps.length) chain = chain.then(function () { var to = ctx.pick(steps); return glide(ctx, s, to).then(function () { ctx.move(s, to); ctx.sound('gabriel_step'); ctx.refresh({ instant: true }); return wait(ctx, 250); }); });
    }
    return chain.then(function () {
      var alts = CM.util.shuffle(ctx.pieces(function (p) { return p.alt; })), c2 = Promise.resolve();
      alts.forEach(function (a) {
        c2 = c2.then(function () {
          if (ctx.over) return; var p = ctx.at(a); if (!p || !p.alt) return;
          var ms = altMoves(V, ctx.state, a); if (!ms.length) return;
          var mv = ctx.pick(ms);
          return glide(ctx, mv.f, mv.t).then(function () {
            var victim = ctx.at(mv.t); ctx.move(mv.f, mv.t); ctx.sound(victim ? 'gabriel_take' : 'gabriel_alt');
            var np = ctx.at(mv.t);
            if (V.def(np.t).pawn && g.relRow(mv.t, np.own) === g.depth(np.own) - 1) ctx.set(mv.t, Object.assign({}, np, { t: 'Q', img: CM.settings.pieceUrl(np.own, 'Q') }));
            if (victim && V.def(victim.t).royal && victim.c !== 'n') { ctx.refresh({ instant: true }); ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'an alternate took your king' : 'an alternate took the Stockfish king'); return; }
            ctx.refresh({ instant: true });
            return wait(ctx, 120);
          });
        });
      });
      return c2;
    });
    });
  }
  CM.mode({
    id: 'd9oDfmcMJvA',
    name: 'Archangel Gabriel',
    category: 'Horror Chess',
    description: 'Gabriel starts on b4. After each round every piece next to him, yours or Stockfish\'s, becomes an alternate that nobody controls. Then Gabriel steps one square up, down, left or right at random (he never captures), and every alternate makes a random move that can capture anything.',
    how_to_win: 'Checkmate Stockfish. Lead Gabriel into its camp.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Knows what it is.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#af8264' },
    pieces: { Gab: { name: 'Gabriel', moves: '', value: 0, capturable: false, img: 'assets/modes/d9oDfmcMJvA/gabriel.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Gab', color: 'n', at: 'b4' }] },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 700 },
    sounds: { 'gabriel_step': 'assets/modes/d9oDfmcMJvA/gabriel_step.wav', 'gabriel_alt': 'assets/modes/d9oDfmcMJvA/gabriel_alt.wav', 'gabriel_take': 'assets/modes/d9oDfmcMJvA/gabriel_take.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
    hooks: {
      init: function (ctx) { ctx.geo.setDir('x', 'up'); ctx.geo.setDir('y', 'down'); },
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      evaluate: function (V, st) {
        var s = gabSq(st); if (s < 0) return 0; var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var d = g.dist(i, s); if (d === 1) v += (p.c === 'w' ? -1 : 1) * (V.def(p.t).royal ? 5000 : V.def(p.t).value * 0.8); }
        return v;
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.alt; }).length; return n ? n + ' alternate' + (n === 1 ? '' : 's') + ' roam the board.' : 'Pieces next to Gabriel become alternates after this round.'; }
    },
    source: { research: 'research/modes/d9oDfmcMJvA.json', confidence: 'high', notes: 'Alternates capturable; alternate king loses (inferred).' }
  });
})();
