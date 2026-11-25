/* Can I BEAT Shotgun King? [RANK 2]  Roguelike: you are a black king who either steps one square or fires a shotgun
   instead of moving; white chess pieces hunt you and kill you if they can capture you. Kill the white king to clear the
   floor. Sources: research/modes/pzxXxIsKRRo.json (Rank 2 difficulty, floors, cards; shells/HP inferred from the game),
   frames (#f6eac6/#968aba). PASS 1: one floor; the shot hits one white piece within two squares in a clear line (pawns,
   knights and bishops die in one hit, rooks/queens/the king take two); you hold two shells and stepping reloads one. */
CM.mode({
  id: 'pzxXxIsKRRo',
  title: 'Can I BEAT Shotgun King? [RANK 2]',
  name: 'Shotgun King (Rank 2)',
  category: 'Variants & Games',
  description: 'You are the Shotgun King. Each turn either step one square like a king or fire your shotgun at a white piece up to two squares away in a straight or diagonal line. Small pieces die in one blast, rooks, queens and the white king need two. You hold two shells; every step reloads one. If any white piece can take you, you die.',
  how_to_win: 'Blast or capture the white king.',
  player_side: 'black',
  player: { name: 'Shotgun King', rating: null, avatar: 'assets/modes/pzxXxIsKRRo/shotgun_king.png' },
  opponent: { name: 'The White Army', rating: null, avatar: null, tagline: 'Rank 2: a bigger army every floor.' },
  board: { files: 8, ranks: 8, light: '#f6eac6', dark: '#968aba', background: '#1b1726' },
  pieces: { K: { name: 'King', moves: 'K', value: 2000, royal: true, castle: false } },
  setup: { fen: '4k3/8/8/8/8/2P2P2/1PPNBPP1/2R1K1R1' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q' } },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  hooks: {
    moves: function (V, st, out) {
      if (st.turn !== 'b' || (st.x.shells == null ? 2 : st.x.shells) <= 0) return out;
      var g = V.geo, k = V.royals(st, 'b')[0]; if (k == null) return out;
      [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function (d) {
        var j1 = g.step(k, d[0], d[1]); if (j1 < 0 || st.b[j1]) return;
        var j = g.step(j1, d[0], d[1]); if (j < 0) return; var p = st.b[j];
        if (p && p.c === 'w') out.push({ f: k, t: j, p: 'K', c: 'b', cap: p, shot: j });
      });
      return out;
    },
    onMake: function (V, st, m, n) {
      if (st.turn !== 'b') return;
      var sh = st.x.shells == null ? 2 : st.x.shells;
      if (m.shot != null) {
        var p = st.b[m.shot]; n.x.shells = sh - 1; n.b[m.f] = st.b[m.f];
        var big = p.t === 'R' || p.t === 'Q' || p.t === 'K', hp = (p.hp == null ? (big ? 2 : 1) : p.hp) - 1; n.b[m.shot] = hp <= 0 ? null : Object.assign({}, p, { hp: hp });
      } else n.x.shells = Math.min(2, sh + 1);
    },
    evaluate: function (V, st) { var v = 0; st.b.forEach(function (p) { if (p && p.c === 'w' && p.hp === 1) v -= 150; }); return v - ((st.x.shells == null ? 2 : st.x.shells) * 30); },
    setup: function (ctx) { ctx.state.x = Object.assign({}, ctx.state.x, { shells: 2 }); },
    afterMove: function (ctx, mv) { if (mv && mv.shot != null) { ctx.fx({ type: 'particles', kind: 'smoke', at: ctx.name(mv.shot), count: 14 }); ctx.sound('capture'); } },
    decorate: function (ctx, sq, p) { return p && p.hp === 1 && (p.t === 'R' || p.t === 'Q' || p.t === 'K') && p.c === 'w' ? { badge: '1HP' } : null; },
    status: function (ctx) { var s = ctx.state.x.shells == null ? 2 : ctx.state.x.shells; return 'Shells: ' + s + '/2 · shoot: tap your king, then a white piece two squares away in a clear line'; }
  },
  todo_pass2: ['shotgun aiming UI (click a target in the cone) and a cone spread of pellets', 'floors with escalating armies and the card choice between floors (your buff + a white buff)', 'shotgun king and white army art (original)', 'muzzle flash VFX and shotgun sound'],
  source: { research: 'research/modes/pzxXxIsKRRo.json', confidence: 'medium', notes: 'Shotgun simplified to a single-target shot; HP/shell values inferred.' }
});
