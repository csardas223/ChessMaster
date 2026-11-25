/* Chess But You Can't Go Offside. Standard chess vs Martin (250) with a football offside rule for your pieces only:
   in Martin's half (ranks 5-8) none of your pieces may move beyond the offside line, the rank of Martin's
   second-to-last unit (counting from his back rank, king excluded). Level with it is fine.
   Sources: research/modes/ucGhD2hC_6s.json (rules.jsonl offside summary, frames visual_*: FIFA "OFFSIDE" clips,
   red highlighted square, Martin (250), green #eaead2/#72a25a).
   Inferred: the exact line measure (rank of the second-highest black non-king unit, ties count), your own half is
   always onside, and the rule only restricts where a move ends. */
(function () {
  function line(V, st) {
    var g = V.geo, rs = [];
    for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'b' && !V.def(p.t).royal) rs.push(g.rank(i)); }
    rs.sort(function (a, b) { return b - a; });
    return rs.length >= 2 ? rs[1] : rs.length ? rs[0] : 1;
  }
  /* broadcast-style banner (original, CSS + flag.svg) */
  var BANNER = '<div style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%) skewX(-8deg);display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 0;background:linear-gradient(90deg,rgba(10,22,60,0) 0,#0a163c 18%,#0a163c 82%,rgba(10,22,60,0) 100%);border-top:3px solid #ffd400;border-bottom:3px solid #ffd400">' +
    '<img src="assets/modes/ucGhD2hC_6s/flag.svg" alt="" style="width:38px;height:38px;transform:skewX(8deg)">' +
    '<b style="font:900 34px/1 system-ui,sans-serif;letter-spacing:.12em;color:#fff;transform:skewX(8deg);text-shadow:0 2px 0 #000">OFFSIDE</b></div>';
  function offside(V, st, m) { var r = V.geo.rank(m.t); return r > 4 && r > line(V, st); }
  CM.mode({
    id: 'ucGhD2hC_6s',
    name: "Can't Go Offside",
    category: 'Powerups & Rule Twists',
    description: "Football rules for your army: in Martin's half you may not move a piece past his second-to-last defender (the offside line, king not counted). Level with the line is onside. Martin can go wherever he likes.",
    how_to_win: 'Checkmate Martin without ever going offside. Mates from long range work best.',
    player_side: 'white',
    opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.svg', tagline: 'Plays a very high defensive line.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#eaead2', dark: '#72a25a', background: 'repeating-linear-gradient(90deg,#1e4a2a 0 48px,#235431 48px 96px)' },
    assets: { flag: 'assets/modes/ucGhD2hC_6s/flag.svg' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
    hooks: {
      filterMoves: function (V, st, legal) { if (st.turn !== 'w') return legal; return legal.filter(function (m) { return !offside(V, st, m); }); },
      decorate: function (ctx, sq) {
        if (ctx.state.turn !== ctx.human || ctx.over) return null;
        var g = ctx.geo, L = line(ctx.V, ctx.state), r = g.rank(sq);
        if (r === L && L >= 4) return { html: '<span class="sq-tint" style="background:linear-gradient(to bottom,rgba(240,200,30,.85) 0 3px,transparent 3px)"></span>' };
        if (r > 4 && r > L) return { html: '<span class="sq-tint" style="background:rgba(220,40,40,.16)"></span>' };
        return null;
      },
      init: function (ctx) {
        var G = ctx.game; if (G._g1off) return; G._g1off = 1;
        var tm = G.tryMove;
        G.tryMove = function (f, t, d) {
          if (G.state.turn === G.human && !G.busy && !G.moves.some(function (m) { return m.f === f && m.t === t; })) {
            var raw = G.V.gen(G.state).filter(function (m) { return m.f === f && m.t === t; });
            if (raw.length && offside(G.V, G.state, raw[0])) {
              ctx.fx({ type: 'flash', at: t, color: '#e02828', opacity: 0.7, duration_ms: 500 });
              ctx.fx({ type: 'overlay', at: 'board', duration_ms: 1300, fade_ms: 180, html: BANNER });
              ctx.sound('illegal'); G.sel = -1; G.render(); return;
            }
          }
          return tm.call(G, f, t, d);
        };
      },
      status: function (ctx) { var L = line(ctx.V, ctx.state); return L > 4 ? 'Offside line: rank ' + L + '. Red squares are offside.' : 'Offside line: halfway. Everything past rank 4 is offside.'; }
    },
    todo_pass2: [],
    source: { research: 'research/modes/ucGhD2hC_6s.json', confidence: 'medium', notes: 'Offside line measure and own-half exemption inferred; transcript unavailable.' }
  });
})();
