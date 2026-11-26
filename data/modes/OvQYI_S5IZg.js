/* Chess, But My Knights Are Trojan Horses. Standard chess vs Stockfish (3600), but your two knights are Trojan Horses:
   on your turn a Trojan can either move like a knight or disperse. Dispersing replaces it with white pawns on every
   vacant square of the 3x3 block centred on it (its own square included; occupied squares are skipped). It uses the
   turn and the knight is gone afterwards. Select a Trojan and tap it again to disperse (a dot marks its own square).
   Sources: research/modes/OvQYI_S5IZg.json (transcript 00:01 "knights can disperse into nine pawns", 00:51 vacant
   squares only, 01:19 nine pawns in its face, 12:11 ladder mate), frames visual_a (brown #e9d3b3/#ae8265, wooden horse
   knights, 3x3 pawn cluster, magenta dispersal preview).
   Inferred: dispersing costs the turn; no pawns are placed on the last rank; pawns from a Trojan count as moved. */
(function () {
  var T = 'Tj';
  function block(V, i) { var g = V.geo, o = []; for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { var j = (dc || dr) ? g.step(i, dc, dr) : i; if (j >= 0) o.push(j); } return o; }
  CM.mode({
    id: 'OvQYI_S5IZg',
    name: 'Trojan Horses',
    category: 'Powerups & Rule Twists',
    description: 'Your knights are Trojan Horses. On your turn a Trojan moves like a knight, or disperses: it bursts into white pawns on every empty square of the 3x3 block around it, its own square included. That uses your move and the horse is gone. Double-tap a Trojan to blow it open (or select it and tap it again).',
    how_to_win: 'Checkmate Stockfish. Ride a horse deep into its camp before opening it.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Let me in :)' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#ae8265' },
    pieces: { Tj: { name: 'Trojan Horse', moves: 'N', value: 330, img: { w: 'assets/modes/OvQYI_S5IZg/trojan.png' }, san: 'N' } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R[Tj]BQKB[Tj]R' },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    hooks: {
      /* owner request 2026-11-26: double-tap (or double-click) a Trojan to explode it open */
      onTap: function (ctx, i) {
        var G = ctx.game, p = G.state.b[i], now = Date.now(), last = G._tjTap;
        G._tjTap = { i: i, t: now };
        if (ctx.over || G.busy || G.state.turn !== G.human || !p || p.t !== T || p.c !== G.human) return false;
        if (!last || last.i !== i || now - last.t > 450) return false;
        var m = G.moves.filter(function (x) { return x.f === i && x.t === i && x.disperse; })[0];
        if (!m) return false;
        G._tjTap = null; G.justSelected = -1; G.commit(m, {}); return true;
      },
      init: function (ctx) {
        var G = ctx.game; if (G._g1tj) return; G._g1tj = 1;
        var tap = G.onTap;
        G.onTap = function (i, o) {
          if (!ctx.over && G.sel === i && G.state.turn === G.human && !G.busy) {
            var m = G.moves.filter(function (x) { return x.f === i && x.t === i && x.disperse; })[0];
            if (m) { G.justSelected = -1; return G.commit(m, {}); }
          }
          return tap.call(G, i, o);
        };
      },
      moves: function (V, st, out) {
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.t === T && p.c === st.turn) out.push({ f: i, t: i, p: T, c: p.c, cap: null, disperse: 1 }); }
        return out;
      },
      onMake: function (V, st, m, n) {
        if (!m.disperse) return;
        var g = V.geo;
        n.b[m.f] = null;
        block(V, m.f).forEach(function (j) { if (!n.b[j] && g.relRow(j, m.c) < g.depth(m.c) - 1) n.b[j] = { t: 'P', c: m.c, m: 1, troj: 1 }; });
        n.half = 0;
      },
      afterMove: function (ctx, m) {
        if (!m.disperse) return null;
        ctx.fx({ type: 'highlight', squares: block(ctx.V, m.f).map(ctx.name), color: 'rgba(214, 60, 200, 0.4)', duration_ms: 700 });
        ctx.fx({ type: 'explosion', at: m.f, intensity: 8 });
        ctx.fx({ type: 'particles', kind: 'dust', at: m.f, count: 22 });
        ctx.toast('The Trojan Horse opens: ' + ctx.pieces(function (p) { return p.troj; }).length + ' pawns pour out.', 1800);
        ctx.pieces(function (p) { return p.troj; }).forEach(function (i) { var p = ctx.at(i); delete p.troj; });
        return null;
      },
      decorate: function (ctx, sq, p) {
        var G = ctx.game;
        if (G.sel >= 0 && ctx.at(G.sel) && ctx.at(G.sel).t === T && ctx.state.turn === ctx.human && ctx.geo.dist(sq, G.sel) <= 1) return { html: '<span class="sq-tint" style="background:rgba(214,60,200,.22)"></span>' };
        return null;
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.t === T && p.c === ctx.human; }).length; return n ? 'Double-tap a Trojan Horse to blow it open.' : 'Both Trojan Horses are gone.'; }
    },
    source: { research: 'research/modes/OvQYI_S5IZg.json', confidence: 'high', notes: 'Dispersal costs the turn; no last-rank pawns (inferred).' }
  });
})();
