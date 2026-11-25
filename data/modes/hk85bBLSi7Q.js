/* Can I SURVIVE Seirawan Chess?  S-Chess: normal chess plus two reserve pieces per side, the Hawk (bishop + knight) and the
   Elephant (rook + knight). When a back-rank piece moves for the first time you may place a reserve piece on the square it
   just left. Once all original back-rank pieces have moved, unplaced reserves are lost. Sources: research/modes/hk85bBLSi7Q.json
   (London setup, hawk gated behind the bishop, elephant behind a knight, 3|2). Gating is offered through the picker on the
   moving piece's destination square: the piece itself = no placement, or the Hawk / Elephant. Gating while castling is
   not implemented. */
CM.mode({
  id: 'hk85bBLSi7Q',
  name: 'Seirawan Chess',
  category: 'Variants & Games',
  description: 'Normal chess plus a Hawk (moves as bishop + knight) and an Elephant (rook + knight) waiting in reserve. When one of your back-rank pieces moves for the first time, you may drop a reserve piece onto the square it left (the picker appears: choose the moving piece itself to skip). Reserves you never place are lost once every back-rank piece has moved.',
  how_to_win: 'Checkmate.',
  player_side: 'white',
  opponent: { name: 'largeEstate', rating: 1717, avatar: null, tagline: 'Higher-rated S-Chess player.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  pieces: {
    H: { name: 'Hawk', moves: 'BN', value: 760, img: { w: 'assets/modes/hk85bBLSi7Q/hawk_w.png', b: 'assets/modes/hk85bBLSi7Q/hawk_b.png' } },
    E: { name: 'Elephant', moves: 'RN', value: 860, glyph: 'R', badge: 'E' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { res: { w: 'HE', b: 'HE' } } },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'B', 'H', 'E'] } },
  clock: { w: 180, b: 180, inc: 2 },
  bot: { engine: 'search', elo: 1717, depth: 3, time_ms: 800 },
  hooks: {
    moves: function (V, st, out) {
      var res = (st.x.res || {})[st.turn] || ''; if (!res) return;
      var g = V.geo, add = [];
      for (var k = out.length - 1; k >= 0; k--) {
        var m = out[k], p = st.b[m.f];
        if (m.f < 0 || m.castle || m.promo || !p || p.m || V.def(p.t).pawn || g.relRow(m.f, m.c) !== 0) continue;
        out.splice(k, 1);
        add.push(Object.assign({}, m, { promo: m.p, gate: '' }));
        res.split('').forEach(function (t) { add.push(Object.assign({}, m, { promo: t, gate: t })); });
      }
      return out.concat(add);
    },
    onMake: function (V, prev, m, n) {
      if (m.gate == null) return;
      var p = prev.b[m.f];
      n.b[m.t] = Object.assign({}, p, { m: 1 });
      if (m.gate) {
        n.b[m.f] = V.piece(m.gate, m.c, { m: 1 });
        var r = Object.assign({}, n.x.res); r[m.c] = r[m.c].replace(m.gate, ''); n.x.res = r;
      }
    },
    evaluate: function (V, st) { var r = st.x.res || {}; return ((r.w || '').length - (r.b || '').length) * 300; },
    status: function (ctx) {
      var r = ctx.x.res || {}, n = function (s) { return s ? s.split('').map(function (t) { return t === 'H' ? 'Hawk' : 'Elephant'; }).join(' + ') : 'none'; };
      return 'Your reserve: ' + n(r.w) + ' · Opponent: ' + n(r.b);
    }
  },
  source: { research: 'research/modes/hk85bBLSi7Q.json', confidence: 'high', notes: 'Castling gating omitted; reserves silently lost when no back-rank piece is left unmoved. art-audit-b: white hawk recut at 256px from research/frames/sprites/hk85bBLSi7Q_hawk_thumb.png (black outline kept, magenta background removed; old cut had a green halo + stray line).' }
});
