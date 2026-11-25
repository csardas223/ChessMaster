/* Can I SURVIVE Setup Chess?  chess.com Setup Chess: before play each side spends 39 points of material (P1 N3 B3 R5
   Q9) building its own position on its first three ranks (pawns on the 2nd and 3rd only), so the centre starts open.
   Tony spams bishops and wins four games. Sources: research/modes/cxUz0IjYQMQ.json, frames (side pocket Q R B N P,
   placement dots on ranks 1-3, chat rule text "each player has 39 material points to spend; pieces can be placed on
   the first 3 ranks, pawns on 2nd and 3rd", JEREMSCH 1533). Simplifications: kings start on e1/e8; the opponent's
   setup is generated at the start (random 39-point army that does not attack your king square); you place your pieces
   one by one from the pocket (tap a piece, then a square), then White moves first. */
(function () {
  var COST = { Q: 9, R: 5, B: 3, N: 3, P: 1 };
  function zoneOk(V, sq, c, t) { var rr = V.geo.relRow(sq, c); return t === 'P' ? (rr === 1 || rr === 2) : rr <= 2; }
  CM.mode({
    id: 'cxUz0IjYQMQ',
    title: 'Can I SURVIVE Setup Chess?',
    name: 'Setup Chess',
    category: 'Variants & Games',
    description: 'Build your own army first: you have 39 points (pawn 1, knight 3, bishop 3, rook 5, queen 9) to place on your first three ranks; pawns only on the 2nd and 3rd. Tap a piece in your pocket, then a square. When the budget is spent, normal chess starts with White to move.',
    how_to_win: 'Checkmate. Open diagonals make bishops strong.',
    player_side: 'white',
    player: { name: 'You', rating: 1600 },
    opponent: { name: 'JEREMSCH', rating: 1533, tagline: 'Setup Chess opponent on chess.com.' },
    board: { files: 8, ranks: 8, light: '#eaf6d2', dark: '#7ea25a' },
    setup: { fen: '4k3/8/8/8/8/8/8/4K3', hands: { w: ['Q', 'R', 'B', 'N', 'P'], b: [] }, moved: ['e1', 'e8'], x: { budget: 39 } },
    rules: { drops: true, castling: false },
    bot: { engine: 'search', elo: 1533, depth: 4, time_ms: 700 },
    vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/cxUz0IjYQMQ/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
    hooks: {
      setup: function (ctx) {
        var V = ctx.V, g = ctx.geo, left = 39, guard = 0, ks = ctx.sq('e1');
        var bag = ['Q', 'R', 'R', 'B', 'B', 'N', 'N'];
        while (left > 0 && guard++ < 300) {
          var t = left >= 9 && bag.length ? bag.shift() : (left >= 3 && ctx.chance(0.5) ? ctx.pick(['B', 'N']) : 'P');
          if (COST[t] > left) { t = left >= 3 ? 'N' : 'P'; if (COST[t] > left) t = 'P'; }
          var sqs = ctx.emptySquares(function (i) { return zoneOk(V, i, 'b', t) && (t !== 'P' || g.relRow(i, 'b') === 1 || ctx.chance(0.2)); });
          if (!sqs.length) continue;
          var sq = ctx.pick(sqs); ctx.spawn(t, 'b', sq, { m: t === 'P' && g.relRow(sq, 'b') === 1 ? 0 : 1 });
          if (V.attacked(ctx.state, ks, 'b')) { ctx.remove(sq); continue; }
          left -= COST[t];
        }
      },
      moves: function (V, st, out) {
        var bud = (st.x || {}).budget || 0;
        if (bud > 0 && st.turn === 'w') {
          var res = [], b = st.b;
          ['Q', 'R', 'B', 'N', 'P'].forEach(function (t) {
            if (COST[t] > bud) return;
            for (var s = 0; s < b.length; s++) if (!b[s] && zoneOk(V, s, 'w', t)) res.push({ f: -1, t: s, p: t, c: 'w', cap: null, drop: t, setup: 1 });
          });
          return res;
        }
        return out.filter(function (m) { return !m.drop; });
      },
      onMake: function (V, st, m, n) {
        if (m.setup) {
          n.x.budget = (st.x.budget || 0) - COST[m.drop];
          if (m.drop === 'P' && V.geo.relRow(m.t, 'w') === 1) n.b[m.t] = Object.assign({}, n.b[m.t], { m: 0 });
          n.hands = n.x.budget > 0 ? { w: ['Q', 'R', 'B', 'N', 'P'].filter(function (t) { return COST[t] <= n.x.budget; }), b: [] } : { w: [], b: [] };
        } else if (st.x.budget <= 0 && (n.hands.w.length || n.hands.b.length)) n.hands = { w: [], b: [] };
      },
      afterMove: function (ctx, m) {
        if (m.setup) { var st = ctx.state; ctx.state = Object.assign({}, st, { turn: 'w' }); if (st.x.budget <= 0) ctx.toast('Setup complete. White to move!', 2200); }
      },
      status: function (ctx) { var b = ctx.x.budget || 0; return b > 0 ? 'Setup: ' + b + ' point' + (b === 1 ? '' : 's') + ' left. Tap a piece in your pocket, then a square on ranks 1-3 (pawns on 2-3).' : null; }
    },
    source: { research: 'research/modes/cxUz0IjYQMQ.json', confidence: 'high', notes: 'Opponent setup is generated, not placed move by move; setup timer omitted.' }
  });
})();
