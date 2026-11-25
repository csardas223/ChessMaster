/* 1 Chess Speedrunner vs 3 Hunters: Minecraft-manhunt parody. The speedrunner (purple king) races up a long map of
   stacked 8x8 boards while three hunters (Red Panda, ViperKing, Franchise, each a king further up the map) hunt him,
   1 move against 3. Loose pieces on the map are collected into your hotbar by capturing them and dropped later.
   Speedrunner wins by capturing the dragon egg at the far end; hunters win by capturing his king. Moving the nuke
   detonates it. Sources: research/modes/UZ79sKLa6z4.json (transcript 0:01, 1:01, 8:56, 19:36), research/frames. */
(function () {
  var ID = 'UZ79sKLa6z4';
  var NOHAND = { Brick: 1, Egg: 1, Duck: 1, Nuke: 1, K: 1 };
  function kingOf(V, st, c) { var R = V.royals(st, c); return R.length ? R[0] : -1; }
  var H = {
    /* rule hooks (pure) */
    moves: function (V, st, out) {
      var me = st.turn, g = V.geo, b = st.b, k = kingOf(V, st, me), res = [];
      for (var i = 0; i < out.length; i++) {
        var m = out[i];
        if (m.drop) { if (k >= 0 && g.dist(m.t, k) <= 2) res.push(m); continue; }        /* hotbar drops land next to your king (inferred) */
        if (m.cap && m.cap.t === 'Egg' && me !== 'p') continue;                          /* only the speedrunner may take the egg */
        res.push(m);
      }
      /* the nuke: a side with a piece next to it may "move" it one step; that detonates it (blast around where it stood) */
      for (var s = 0; s < b.length; s++) {
        var q = b[s]; if (!q || q.t !== 'Nuke' || q.c !== 'n') continue;
        var near = false;
        for (var j = 0; j < b.length && !near; j++) if (b[j] && b[j].c === me && !b[j].dead && g.dist(j, s) === 1) near = true;
        if (!near) continue;
        for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
          if (!dc && !dr) continue; var t = g.step(s, dc, dr); if (t < 0 || b[t]) continue;
          res.push({ f: s, t: t, p: 'Nuke', c: me, cap: null, neutral: true, nuke: 1 });
        }
      }
      return res;
    },
    onMake: function (V, prev, m, n) {
      if (m.nuke) {
        var g = V.geo;
        n.b[m.t] = null;
        for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
          var j = g.step(m.f, dc, dr); if (j < 0) continue; var q = n.b[j];
          if (q && q.t !== 'Egg') n.b[j] = null;
        }
        n.x.boom = m.f;
        return;
      }
      /* collect loose (neutral) pieces into the hotbar; captured enemy pieces go there through rules.drops */
      if (m.cap && m.cap.c === 'n' && !NOHAND[m.cap.t] && !m.cap.dead) {
        n.hands = Object.assign({}, n.hands); n.hands[m.c] = (n.hands[m.c] || []).concat([m.cap.t]);
      }
    },
    checkWin: function (V, st) {
      if (st.x && st.x.egg && !st.b.some(function (p) { return p && p.t === 'Egg'; })) return { w: 'p', team: 1, why: 'the speedrunner captured the dragon egg' };
      if (st.out && st.out.p) return { w: 'r', team: 2, why: 'the hunters captured the speedrunner\'s king' };
      if (st.start && st.start.pRoyal && !V.royals(st, 'p').length) return { w: 'r', team: 2, why: 'the speedrunner\'s king is gone' };
      return null;
    },
    evaluate: function (V, st, c) {
      var g = V.geo, b = st.b, pk = kingOf(V, st, 'p'), v = 0, egg = -1;
      for (var i = 0; i < b.length; i++) if (b[i] && b[i].t === 'Egg') { egg = i; break; }
      (st.hands[c] || []).forEach(function (t) { v += V.def(t).value * 0.8; });
      if (c === 'p') { if (pk >= 0 && egg >= 0) v -= g.dist(pk, egg) * 30; return v; }
      var k = kingOf(V, st, c); if (k >= 0 && pk >= 0) v -= g.dist(k, pk) * 12;
      return v;
    },
    /* game hooks */
    init: function (ctx) {
      if (!document.getElementById('sr-css')) {
        var s = document.createElement('style'); s.id = 'sr-css';
        s.textContent = '.pc--tint-p{filter:sepia(1) saturate(5) hue-rotate(225deg) brightness(.82)}';
        document.head.appendChild(s);
      }
      if (!window._srQuack) {
        window._srQuack = 1;
        document.addEventListener('click', function (e) {
          var G = CM.gameUI && CM.gameUI.controller; if (!G || !G.spec || G.spec.id !== ID || !G.state) return;
          var q = e.target.closest && e.target.closest('#board .sq'); if (!q || q.dataset.i == null) return;
          var p = G.state.b[+q.dataset.i]; if (p && p.t === 'Duck' && G.sel < 0) CM.sound.play('quack');
        }, true);
      }
    },
    afterMove: function (ctx, m, info) {
      if (m.nuke) { ctx.fx({ type: 'explosion', at: ctx.name(m.f), radius: 1, sound: 'explosion' }); ctx.toast((info.by === 'player' ? 'You' : (ctx.game.profile(m.c).name || 'A hunter')) + ' touched the nuke. It detonated!', 2200); }
    },
    status: function (ctx) {
      var t = ctx.state.turn;
      return t === ctx.human ? 'Your move: run for the dragon egg at the top' : (ctx.game.profile(t).name || t) + ' is hunting...';
    },
    camera: function (ctx) { return ctx.resolveSquare('player_king'); }
  };
  CM.mode({
    id: ID,
    title: '1 Chess Speedrunner vs 3 Hunters',
    name: 'Speedrunner vs 3 Hunters',
    category: 'Challenges & Odds',
    description: 'You are the speedrunner (purple king) at the bottom of a long map of four stacked boards. Three hunters, each just a king further up, move after every move of yours (1 move vs 3). Loose pieces lie on the map, including fairy pieces (nightrider, camel, cannon, grasshopper, amazon, alfil, ferz, dabbaba, bazooka): capture one to put it in your hotbar, then drop it next to your king as a move. Bricks block the way but can be captured. Moving the nuke blows up everything around it. The duck only quacks.',
    how_to_win: 'Capture the dragon egg at the top of the map before the hunters capture your king.',
    player_side: 'p',
    player: { name: 'Speedrunner', rating: null, avatar: 'assets/modes/UZ79sKLa6z4/speedrunner.png' },
    opponent: { name: 'Red Panda', rating: null, avatar: 'assets/modes/UZ79sKLa6z4/redpanda.png', tagline: 'three hunters: Red Panda, ViperKing, Franchise' },
    players: [
      { color: 'p', forward: 'up', name: 'Speedrunner', base: 'w', swatch: '#7a3fa0', team: 1, avatar: 'assets/modes/UZ79sKLa6z4/speedrunner.png' },
      { color: 'r', forward: 'down', name: 'Red Panda', base: 'w', swatch: '#bf3b43', team: 2, avatar: 'assets/modes/UZ79sKLa6z4/redpanda.png' },
      { color: 'g', forward: 'down', name: 'ViperKing', base: 'w', swatch: '#4e9161', team: 2, avatar: 'assets/modes/UZ79sKLa6z4/viper.png' },
      { color: 'u', forward: 'down', name: 'Franchise', base: 'w', swatch: '#4185bf', team: 2, avatar: 'assets/modes/UZ79sKLa6z4/franchise.png' }
    ],
    board: { files: 8, ranks: 32, viewport: { files: 8, ranks: 10, mobile: { files: 8, ranks: 10 }, follow: 'player_king' } },
    theme: { light: '#e9d0b3', dark: '#af8365' },
    pieces: {
      Egg: { name: 'Dragon egg', moves: '', value: 0, img: 'assets/modes/UZ79sKLa6z4/egg.png' },
      Nuke: { name: 'Nuke', moves: '', value: 0, img: 'assets/modes/5m6UP0ghvdA/nuke_w.png' },
      Duck: { name: 'Duck', moves: '', value: 0, capturable: false, img: 'assets/modes/UZ79sKLa6z4/duck.png' },
      Brick: { name: 'Brick', moves: '', value: 0, img: 'assets/modes/UZ79sKLa6z4/brick.png' },
      Bazooka: { name: 'Bazooka', moves: 'QNNC', value: 1700, img: { w: 'assets/modes/7LBERB7y2hs/bazooka_w.png', b: 'assets/modes/7LBERB7y2hs/bazooka_b.png', n: 'assets/modes/7LBERB7y2hs/bazooka_w.png' } },
      Alfil: { name: 'Alfil', moves: 'A', value: 150, glyph: 'B', badge: 'AL' },
      Dabbaba: { name: 'Dabbaba', moves: 'D', value: 150, glyph: 'R', badge: 'DA' },
      DabRider: { name: 'Dabbaba-rider', moves: 'DD', value: 350, glyph: 'R', badge: 'DD' },
      CamelRider: { name: 'Camel-rider', moves: 'CC', value: 450, glyph: 'N', badge: 'CC' }
    },
    setup: {
      fen: '3[n:Egg]4/8/5[n:Bazooka]2/4[u:K]3/8/6[n:CamelRider]1/3[n:M]4/5[n:P]2/[n:Brick][n:Brick]4[n:Brick][n:Brick]/1[n:DabRider]6/4[g:K]3/8/2[n:Alfil]4[n:Duck]/8/2[n:Nuke]1[n:P]3/6[n:Dabbaba]1/[n:Brick][n:Brick]4[n:Brick][n:Brick]/[n:R]7/8/4[r:K]3/7[n:G]/[n:X]7/3[n:P]4/5[n:F]2/[n:Brick]1[n:Brick]4[n:Brick]/8/6[n:I]1/1[n:L]6/5[n:B]2/2[n:N]2[n:P]2/8/4[p:K]3',
      x: { egg: 1 }
    },
    rules: { check: 'none', castling: false, enPassant: false, drops: true, promotion: { choices: ['Q', 'R', 'B', 'N'] }, drawPlies: 400 },
    bot: { engine: 'search', depth: 2, time_ms: 450, min_ms: 250 },
    sounds: { quack: 'assets/modes/UZ79sKLa6z4/quack.wav' },
    hooks: H,
    source: {
      research: 'research/modes/UZ79sKLa6z4.json',
      confidence: 'low',
      notes: 'The real map layout (several boards in an L/stair shape), exact piece positions, the dog piece and the bazooka\'s moves are not established: map = 4 stacked 8x8 boards with an inferred layout, bazooka reuses the QNNC bazooka of 7LBERB7y2hs. Drops are limited to 2 squares from your king (inferred). The 5-minute clocks are omitted (clocks support 2 players only). The duck cannot move or be captured but does block lines.'
    }
  });
})();
