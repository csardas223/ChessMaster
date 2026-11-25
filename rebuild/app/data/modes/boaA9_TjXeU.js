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
  name: 'Thermopylae',
  category: 'Variants & Games',
  description: "You are Red: a horde of kings (ordinary, non-royal), queens, bishops, Nightriders (repeat a knight jump in a line), Wildebeests (leap (1,2) or (1,3)) and Archbishops (bishop + knight). Your royal piece is a Ferz trapped on d1: every time Yellow's rook checks it costs a life, 72 and you lose. Green defends a narrow pass with its General (king + knight), Soldiers (forward only) and Sergeants (forward and diagonally forward). Blue and Yellow are random bots that love giving checks. There is no check rule: royals are captured.",
  how_to_win: "Red: capture Green's General yourself before 72 moves pass. Green (pick it under Play as): survive 72 Red moves, or get a bot to capture your General.",
  player_side: 'r',
  player: { name: 'You', rating: 2150, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { avatar: 'assets/modes/boaA9_TjXeU/bot_icon.png', name: 'Green (online)', rating: 2100, tagline: 'Online human (2100-2200); Blue and Yellow are random bots.' },
  players: [
    { color: 'r', forward: 'up', name: 'You', swatch: '#bf3b43', base: 'w' },
    { color: 'u', forward: 'right', name: 'Blue bot', swatch: '#4185bf', base: 'w', rating: null, avatar: 'assets/modes/boaA9_TjXeU/bot_icon.png' },   /* chess.com bot icon from the video's Ways to Win card */
    { color: 'y', forward: 'down', name: 'Yellow bot', swatch: '#c09526', base: 'w', rating: null, avatar: 'assets/modes/boaA9_TjXeU/bot_icon.png' },
    { color: 'g', forward: 'left', name: 'Green (online)', swatch: '#4e9161', base: 'w', rating: 2100 }
  ],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#dedede', dark: '#aeaeae' },
  pieces: {
    F: { name: 'Royal Ferz', moves: 'F', value: 2000, royal: true, capturable: false },
    J: { name: 'King', moves: 'K', value: 320, glyph: 'K', castle: false },
    Y: { name: 'Wildebeest', moves: 'NC', value: 450, glyph: 'N', img: { r: 'assets/modes/boaA9_TjXeU/wildebeest_r.png' } },   /* the video's red bull-head piece (thumbnail) */
    L: { name: 'Nightrider', moves: 'NN', value: 560, glyph: 'N', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/nightrider_r.png', g: 'assets/modes/boaA9_TjXeU/nightrider_g.png' } },   /* double-headed knight from the thumbnail (green); red = hue-shifted copy, inferred */
    O: { name: 'General', moves: 'KN', value: 2000, royal: true, glyph: 'K', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/general_r.png', g: 'assets/modes/boaA9_TjXeU/general_g.png' } },   /* piece cards at 1:05-1:38, recut with the video's dark outline (tools/art6_thermo_recut.py); green = red card recoloured to the video's green General icon (Ways to Win card) */
    A: { name: 'Archbishop', moves: 'BN', value: 750, glyph: 'B', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/archbishop_r.png' } },
    S: { name: 'Sergeant', moves: 'fWfF', value: 160, glyph: 'P', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/sergeant_r.png', g: 'assets/modes/boaA9_TjXeU/sergeant_g.png' } },
    T: { name: 'Soldier', moves: 'fW', value: 110, glyph: 'P', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/soldier_r.png', g: 'assets/modes/boaA9_TjXeU/soldier_g.png' } }
  },
  setup: { fen: '3[y:R]2[y:B][y:J]6/6[y:P][y:P]6/14/10*3/10*3/10*3/[u:J][u:P]10[g:T][g:S]/[u:R][u:P]9[g:T][g:T][g:O]/[u:N]9*1[g:T][g:S]/5[r:Q]2[r:Q]1*3/4[r:J][r:J][r:J][r:J][r:J][r:J]*3/4[r:B][r:J][r:B][r:J][r:B][r:J][r:B]3/4*[r:L][r:Y][r:A][r:A][r:Y][r:L]3/3[r:F][r:J][r:Q][r:J][r:Q][r:J][r:B][r:J]3' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { none: true }, drawPlies: 9999, win: [] },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { limit: 72 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/boaA9_TjXeU/ways_to_win.jpg', fit: 'contain', duration_ms: 2400, id: 'g5intro' /* video art */ }],
  hooks: {
    /* pass 2: play as Red or Green (the video plays both: Red first, then Green). Stored per device; the side picker sits in
       the info pane. As Green, Red becomes the online opponent (search bot that marches on the General). */
    setup: function (ctx) {
      var side = CM.store.get('g5thermo.side', 'r') === 'g' ? 'g' : 'r', G = ctx.game, sp = ctx.spec;
      G.human = side; G.botColor = side === 'r' ? 'g' : 'r'; sp.player_side = side;
      sp.players[0].name = side === 'r' ? 'You' : 'Red (online)'; sp.players[0].rating = side === 'r' ? null : 2150;
      sp.players[3].name = side === 'g' ? 'You' : 'Green (online)'; sp.players[3].rating = side === 'g' ? null : 2100;
      sp.player.rating = side === 'r' ? 2150 : 2100;
      Object.assign(G.opponent, side === 'r' ? { name: 'Green (online)', rating: 2100 } : { name: 'Red (online)', rating: 2150, tagline: 'Online human with the big army; Blue and Yellow are random bots.' });
      var pane = document.getElementById('pane-info'), box = pane && pane.querySelector('.g5thermo');
      if (pane && !box) {
        var h = document.createElement('h2'); h.className = 'info__h g5thermo-h'; h.textContent = 'Play as';
        box = document.createElement('div'); box.className = 'gpicker g5thermo'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Play as'); box.style.padding = '8px 0 4px';
        var info = pane.querySelector('.info') || pane; info.appendChild(h); info.appendChild(box);
      }
      if (box) {
        box.innerHTML = ['r', 'g'].map(function (c) { return '<button type="button" data-side="' + c + '" aria-pressed="' + (c === side) + '">' + (c === 'r' ? 'Red' : 'Green') + '</button>'; }).join('');
        box.onclick = function (e) { var b = e.target.closest('[data-side]'); if (!b || b.dataset.side === side) return; CM.store.set('g5thermo.side', b.dataset.side); G.newGame(); };
      }
    },
    onStart: function (ctx) { ctx.toast(ctx.human === 'g' ? "You are Green: survive 72 Red moves, or let a bot capture your General." : "You are Red: capture Green's General before 72 moves.", 3200); },
    onExit: function () { var pane = document.getElementById('pane-info'); if (pane) Array.prototype.forEach.call(pane.querySelectorAll('.g5thermo, .g5thermo-h'), function (n) { n.remove(); }); },
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
  source: { research: 'research/modes/boaA9_TjXeU.json', confidence: 'low', notes: 'Army squares, wall layout and the d-file check line reconstructed; only the piece list and ways to win are from the video. Art 2026-11-25 PM ET: General/Sergeant/Soldier/Archbishop recut from the 1080p piece cards (frames 65/70/75/98) keeping the dark outline (old cut had lost it and showed a light halo); Green copies recoloured to the green of the video\'s Ways to Win General icon (maxres1), tools/art6_thermo_recut.py.' }
});
