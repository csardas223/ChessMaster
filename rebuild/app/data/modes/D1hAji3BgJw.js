/* Can I BEAT the Unicorn Attack? Normal rapid chess where White must open with the Unicorn (a4, h4, Na3, Nh3).
   Sources: research/modes/D1hAji3BgJw.json (0:01 knights behind the flank pawns, 1:40 attacking h4), frames: green board, Mrbunningsss (2073), 10-minute clocks. */
CM.mode({
  id: "D1hAji3BgJw",
  name: "Unicorn Attack",
  category: "Variants & Games",
  description: "Normal 10-minute chess, but White must open with Pietro's Unicorn: push the a- and h-pawns two squares and tuck both knights behind them (a4, h4, Na3, Nh3, in any order). After those four moves you play freely.",
  how_to_win: "Checkmate a ~2070 opponent after setting up the Unicorn.",
  player_side: "white",
  player: {"name": "You", "rating": 2089},
  opponent: {"name": "Mrbunningsss", "rating": 2073, "tagline": "Rapid opponent on chess.com (game 1)"},
  board: {"files": 8, "ranks": 8, "light": "#ebeed1", "dark": "#759f56"},
  clock: {"w": 600, "b": 600, "inc": 0},
  params: {"unicorn": ["a2a4", "h2h4", "b1a3", "g1h3"]},
  hooks: {
    filterMoves: function (V, st, legal) {
      if (st.turn !== 'w' || (st.x.uni || 0) >= 4) return legal;
      var g = V.geo, want = V.cfg.params.unicorn;
      var pawn = function (n) { var q = st.b[g.parse(n)]; return q && q.t === 'P' && q.c === 'w'; };
      var ok = legal.filter(function (m) { var u = g.name(m.f) + g.name(m.t); return !m.promo && want.indexOf(u) >= 0 && !(u === 'b1a3' && pawn('a2')) && !(u === 'g1h3' && pawn('h2')); });
      return ok.length ? ok : legal;
    },
    onMake: function (V, st, m, n) { if (m.c === 'w' && (st.x.uni || 0) < 4) n.x.uni = (st.x.uni || 0) + 1; },
    status: function (ctx) { var k = ctx.x.uni || 0; return k < 4 ? 'Unicorn setup: ' + k + '/4 (a4, h4, Na3, Nh3)' : null; },
    stockfishOk: true
  },
  source: {"confidence": "medium", "notes": "Exact Unicorn squares (a4/h4 + Na3/Nh3) inferred from \"tucking the knights behind the flank pawns\".", "research": "research/modes/D1hAji3BgJw.json"}
});
