/* Can I BEAT Thermopylae?  A 2-human puzzle variant on a chess.com 4-player board: Red (a huge army of kings,
   queens, bishops and fairy pieces) must capture Green's General; Green (a General with Soldiers and Sergeants) wins
   if a bot takes its General or by surviving 72 moves, because Yellow's rook keeps checking Red's trapped royal Ferz
   and 72 checks = Red loses. Blue and Yellow are random bots that prefer giving checks. He wins as both colours.
   Sources: research/modes/boaA9_TjXeU.json (ways to win, piece list), frames visual ('Ways to Win' card, grey blocked
   regions, #dedede/#aeaeae). PASS 1: you play Red; exact army squares were not legible, so the layout is
   reconstructed: Red fills its arm, the Ferz is boxed in on d1 under Yellow's rook, and a wall line on the k-file
   leaves a 2-square pass (the Hot Gates) to Green's camp. Kings other than the General are ordinary (non-royal). */
CM.mode({
  id: 'boaA9_TjXeU',
  title: 'Can I BEAT Thermopylae?',
  name: 'Thermopylae (Red)',
  category: 'Variants & Games',
  description: "You are Red: a horde of kings (ordinary, non-royal), queens, bishops, Nightriders (repeat a knight jump in a line), Wildebeests (leap (1,2) or (1,3)) and Archbishops (bishop + knight). Your royal piece is a Ferz trapped on d1: every time Yellow's rook checks it costs a life, 72 and you lose. Green defends a narrow pass with its General (king + knight), Soldiers (forward only) and Sergeants (forward and diagonally forward). Blue and Yellow are random bots that love giving checks. There is no check rule: royals are captured.",
  how_to_win: "Capture Green's General yourself before 72 moves pass. If a bot takes the General, Green wins.",
  player_side: 'r',
  player: { name: 'You', rating: 2150 },
  opponent: { name: 'Green (online)', rating: 2100, tagline: 'Online human (2100-2200); Blue and Yellow are random bots.' },
  players: [
    { color: 'r', forward: 'up', name: 'You', swatch: '#bf3b43', base: 'w' },
    { color: 'u', forward: 'right', name: 'Blue bot', swatch: '#4185bf', base: 'w', rating: null },
    { color: 'y', forward: 'down', name: 'Yellow bot', swatch: '#c09526', base: 'w', rating: null },
    { color: 'g', forward: 'left', name: 'Green (online)', swatch: '#4e9161', base: 'w', rating: 2100 }
  ],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#dedede', dark: '#aeaeae' },
  pieces: {
    F: { name: 'Royal Ferz', moves: 'F', value: 2000, royal: true, capturable: false },
    J: { name: 'King', moves: 'K', value: 320, glyph: 'K', castle: false },
    Y: { name: 'Wildebeest', moves: 'NC', value: 450, glyph: 'N', badge: 'W' },
    O: { name: 'General', moves: 'KN', value: 2000, royal: true, glyph: 'K', badge: 'G' },
    S: { name: 'Sergeant', moves: 'fWfF', value: 160, glyph: 'P', badge: 'S' },
    T: { name: 'Soldier', moves: 'fW', value: 110, glyph: 'P', badge: 'T' }
  },
  setup: { fen: '3[y:R]2[y:B][y:J]6/6[y:P][y:P]6/14/10*3/10*3/10*3/[u:J][u:P]10[g:T][g:S]/[u:R][u:P]9[g:T][g:T][g:O]/[u:N]9*1[g:T][g:S]/5[r:Q]2[r:Q]1*3/4[r:J][r:J][r:J][r:J][r:J][r:J]*3/4[r:B][r:J][r:B][r:J][r:B][r:J][r:B]3/4*[r:L][r:Y][r:A][r:A][r:Y][r:L]3/3[r:F][r:J][r:Q][r:J][r:Q][r:J][r:B][r:J]3' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { none: true }, drawPlies: 9999, win: [] },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { limit: 72 },
  hooks: {
    onMake: function (V, st, m, n) {
      var x = n.x = Object.assign({}, n.x);
      if (m.cap && m.cap.t === 'O') x.genBy = m.c;
      if (st.turn === 'r') x.redMoves = (st.x.redMoves || 0) + 1;
      if (st.turn === 'y') { var F = V.royals(n, 'r')[0]; if (F != null && V.attacked(n, F, 'y')) x.ferzChecks = (st.x.ferzChecks || 0) + 1; }
    },
    checkWin: function (V, st) {
      var x = st.x || {}, lim = (V.cfg.params || {}).limit || 72;
      if (x.genBy) return x.genBy === 'r' ? { w: 'r', why: "Red captured Green's General" } : { w: 'g', why: "a bot captured Green's General" };
      if ((x.ferzChecks || 0) >= lim) return { w: 'g', why: "Yellow checked Red's Ferz " + lim + ' times' };
      if ((x.redMoves || 0) >= lim) return { w: 'g', why: 'Green survived ' + lim + ' moves' };
      return null;
    },
    evaluate: function (V, st, c) {
      if (c !== 'r') return 0;
      var O = null; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.t === 'O') { O = i; break; } }
      if (O == null) return 0; var v = 0;
      for (var j = 0; j < st.b.length; j++) { var q = st.b[j]; if (q && q.c === 'r' && q.t !== 'F') v -= 4 * V.geo.dist(j, O); }
      return v;
    },
    /* Blue and Yellow: random moves, but any move that checks a royal (Red's Ferz or Green's General) first */
    botPick: function (ctx, ranked) {
      var V = ctx.V, me = ctx.state.turn;
      if (me !== 'u' && me !== 'y') return null;
      var checks = ranked.filter(function (r) {
        var n = r.m.n || V.make(ctx.state, r.m); return ['r', 'g'].some(function (c) { return V.royals(n, c).some(function (s) { return V.attacked(n, s, me); }); });
      });
      return ctx.pick(checks.length ? checks : ranked);
    },
    decorate: function (ctx, sq, p) { if (p && p.t === 'F' && p.c === 'r') return { badge: String(Math.max(0, (ctx.params.limit || 72) - (ctx.state.x.ferzChecks || 0))) }; return null; },
    status: function (ctx) { var x = ctx.state.x, lim = ctx.params.limit || 72; return 'Moves ' + (x.redMoves || 0) + '/' + lim + '  ·  Ferz checks ' + (x.ferzChecks || 0) + '/' + lim; }
  },
  todo_pass2: ["'Ways to Win' card art", 'Nightrider (Frankenstein knight), Wildebeest and General piece art', 'play as Green option', 'chess.com 4PC bot icons for Blue/Yellow'],
  source: { research: 'research/modes/boaA9_TjXeU.json', confidence: 'low', notes: 'Army squares, wall layout and the d-file check line reconstructed; only the piece list and ways to win are from the video.' }
});
