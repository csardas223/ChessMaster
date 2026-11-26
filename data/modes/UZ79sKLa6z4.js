/* 1 Chess Speedrunner vs 3 Hunters: Minecraft-manhunt parody. The speedrunner (purple king) races along a long map of
   four 8x8 boards while three hunters (Red Panda, ViperKing, Franchise, each a king on a later board) hunt him, 1 move
   against 3. Loose pieces on the map are collected into your hotbar by capturing them and placed again as a move, but
   only on the board your king stands on (6:19 / 18:37 Viper walks his king onto Red Panda's board "so he can place pieces
   further into the position"). Speedrunner wins by capturing the dragon egg at the far end; hunters win by capturing his
   king. A nuke you own blows up when you try to move it (8:27, 8:58). Shy Guy (SCP-096) eats any piece that attacks him
   and never comes back once taken (2:57, 3:56). The duck only quacks and never moves (19:37).
   Sources: research/modes/UZ79sKLa6z4.json, transcript (cm-recheck3), still maxres2 (boards staggered by 6 files, two
   files overlapping, tan board #ead3b4/#af8263, 2x4 hotbar, owner-coloured pieces, white neutral pieces). */
(function () {
  var ID = 'UZ79sKLa6z4';
  var NOHAND = { Brick: 1, Egg: 1, ShyGuy: 1, K: 1 };
  var BLAST = 2;   /* nuke blast radius (king distance); inferred: "he blew up all the pieces" (10:13) around Red Panda's king */
  /* the map: board k covers ranks 8k..8k+7 from the bottom; even boards files a-h, odd boards files g-n (still maxres2) */
  function section(g, i) { return Math.floor((g.ranks - 1 - g.row(i)) / 8); }
  function shySq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'ShyGuy') return i; return -1; }
  function kingOf(V, st, c) { var R = V.royals(st, c); return R.length ? R[0] : -1; }
  var H = {
    /* rule hooks (pure) */
    moves: function (V, st, out) {
      var me = st.turn, g = V.geo, k = kingOf(V, st, me), res = [];
      for (var i = 0; i < out.length; i++) {
        var m = out[i];
        if (m.drop) { if (k >= 0 && section(g, m.t) === section(g, k)) res.push(m); continue; }   /* place only on your king's board */
        if (m.cap && m.cap.t === 'Egg' && me !== 'p') continue;                                    /* only the speedrunner may take the egg */
        if (m.p === 'Nuke' && !m.neutral) { res.push(Object.assign({}, m, { nuke: 1, cap: null })); continue; }  /* trying to move it detonates it */
        res.push(m);
      }
      return res;
    },
    onMake: function (V, prev, m, n) {
      var g = V.geo;
      if (m.nuke) {
        n.b[m.t] = prev.b[m.t] || null; n.b[m.f] = null;               /* the nuke never arrives: it goes off where it stood */
        for (var j = 0; j < n.b.length; j++) {
          var q = n.b[j]; if (q && q.t !== 'Egg' && g.dist(j, m.f) <= BLAST) n.b[j] = null;
        }
        n.x.boom = m.f;
        return;
      }
      /* collect loose (neutral) pieces into the hotbar; captured enemy pieces go there through rules.drops */
      if (m.cap && m.cap.c === 'n' && !NOHAND[m.cap.t] && !m.cap.dead) {
        n.hands = Object.assign({}, n.hands); n.hands[m.c] = (n.hands[m.c] || []).concat([m.cap.t]);
      }
      /* Shy Guy eats a piece that MOVES to attack him (moves onto it); once captured he is gone for good. A piece placed from
         the hotbar does not trigger him: Franchise placed a camel-rider that then took him (3:56) */
      var s = shySq(n);
      if (s >= 0 && m.f >= 0 && n.b[m.t] && n.b[m.t].c === m.c) {
        var probe = []; V.genPiece(n, m.t, probe, true);
        if (probe.some(function (x) { return x.t === s; })) { n.b[m.t] = n.b[s]; n.b[s] = null; n.x.shy = m.t; }
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
      if (c === 'p') { if (pk < 0) return -100000; if (egg < 0) return 100000; if (pk >= 0 && egg >= 0) v -= g.dist(pk, egg) * 30; return v; }
      var k = kingOf(V, st, c); if (k < 0) return -100000;   /* a king lost to the nuke or to Shy Guy */
      if (egg < 0) return -100000; if (pk < 0) return 100000; v -= g.dist(k, pk) * 12;
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
      if (ctx.state.x && ctx.state.x.shy === m.t && !m.nuke) ctx.toast('Shy Guy saw that. He ate the piece that looked at him.', 2000);
      if (m.nuke) { ctx.fx({ type: 'explosion', at: ctx.name(m.f), radius: 2, sound: 'explosion' }); ctx.toast((info.by === 'player' ? 'You' : (ctx.game.profile(m.c).name || 'A hunter')) + ' touched the nuke. It detonated!', 2200); }
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
    description: 'You are the speedrunner (purple king) on the first of four 8x8 boards laid end to end in a zig-zag. Three hunters, each a king on a later board, move after every move of yours (1 move vs 3). Loose white pieces lie on the map, regular and fairy (nightrider, Alibaba rider, dabbaba, dabbaba-rider, camel, camel-rider, cannon, grasshopper, amazon, alfil, ferz, bazooka, duck, nuke): capture one to put it in your hotbar, then place it on the board your king stands on as a move. Bricks block the way but can be captured. Trying to move a nuke you own blows up everything around it. Shy Guy eats any piece that attacks him. The duck only quacks.',
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
    board: {
      files: 14, ranks: 32, light: '#ead3b4', dark: '#af8263',
      mask: ['xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........',
             '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx',
             'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........', 'xxxxxx........',
             '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx', '........xxxxxx'],
      viewport: { files: 9, ranks: 10, mobile: { files: 9, ranks: 10 }, follow: 'player_king' }
    },
    theme: { light: '#ead3b4', dark: '#af8263' },
    pieces: {
      Egg: { name: 'Dragon egg', moves: '', value: 0, img: 'assets/modes/UZ79sKLa6z4/egg.png' },
      Nuke: { name: 'Nuke', moves: 'K', value: 300, img: 'assets/modes/5m6UP0ghvdA/nuke_w.png' },          /* moving it = detonating it (hooks) */
      Duck: { name: 'Duck', moves: '', value: 10, img: 'assets/modes/UZ79sKLa6z4/duck.png' },                /* collectible, never moves (19:37) */
      ShyGuy: { name: 'Shy Guy (SCP-096)', moves: 'K', value: 0, img: 'assets/modes/-fax07t_o5s/shyguy.png' },
      Ali: { name: 'Alibaba rider', moves: 'DDAA', value: 500, glyph: 'R', img: { w: 'assets/modes/UZ79sKLa6z4/alibabarider_w.png' }, cls: 'pc--neutral' },                  /* 3:13 hops two squares any distance; 13:47 diagonally too */
      Brick: { name: 'Brick', moves: '', value: 0, img: 'assets/modes/UZ79sKLa6z4/brick.png' },
      Bazooka: { name: 'Bazooka', moves: 'QNNC', value: 1700, img: { w: 'assets/modes/7LBERB7y2hs/bazooka_w.png', b: 'assets/modes/7LBERB7y2hs/bazooka_b.png', n: 'assets/modes/7LBERB7y2hs/bazooka_w.png' } },
      Alfil: { name: 'Alfil', moves: 'A', value: 150, glyph: 'B', img: { w: 'assets/modes/UZ79sKLa6z4/alfil_w.png' }, cls: 'pc--neutral' },
      Dabbaba: { name: 'Dabbaba', moves: 'D', value: 150, glyph: 'R', img: { w: 'assets/modes/UZ79sKLa6z4/dabbaba_w.png' }, cls: 'pc--neutral' },
      DabRider: { name: 'Dabbaba-rider', moves: 'DD', value: 350, glyph: 'R', img: { w: 'assets/modes/UZ79sKLa6z4/dabbabarider_w.png' }, cls: 'pc--neutral' },
      CamelRider: { name: 'Camel-rider', moves: 'CC', value: 450, glyph: 'N', img: { w: 'assets/modes/UZ79sKLa6z4/camelrider_w.png' }, cls: 'pc--neutral' }   /* m-art: chess.com's variant art (as on the maxres3 map), was glyph+badge */
    },
    setup: {
      fen: '10[n:Egg]3/14/7[n:A]6/10[u:K]3/13[n:DabRider]/8[n:ShyGuy][n:P]1[n:P]2/12[n:R]1/14/[n:Brick][n:Brick]5[n:Brick]6/1[n:CamelRider]12/3[n:G]10/2[n:X]3[n:Duck]7/4[g:K]9/2[n:Nuke]11/5[n:Dabbaba]8/[n:Bazooka]13/8[n:Brick]3[n:Brick][n:Brick]/13[n:F]/7[n:I]6/10[n:P]3/9[r:K]4/14/12[n:X]1/11[n:M]2/[n:Brick][n:Brick]4[n:Brick]7/14/1[n:Ali]2[n:P]9/6[n:L]7/14/3[p:K]10/5[n:B]8/2[n:N]11',
      x: { egg: 1 }
    },
    rules: { check: 'none', castling: false, enPassant: false, drops: true, promotion: { choices: ['Q', 'R', 'B', 'N'] }, drawPlies: 400 },
    bot: { engine: 'search', depth: 2, time_ms: 450, min_ms: 250 },
    sounds: { quack: 'assets/modes/UZ79sKLa6z4/quack.wav' },
    hooks: H,
    source: {
      research: 'research/modes/UZ79sKLa6z4.json',
      confidence: 'medium',
      notes: 'cm-recheck3 2026-11-25 from the transcript + still maxres2: map = four 8x8 boards staggered by 6 files with two overlapping files (maxres2 shows two of them; the zig-zag for all four is inferred), tan board colours sampled from the still; placing hotbar pieces limited to your king\'s board (6:19, 18:37); a nuke you own detonates when moved (8:27-8:58; blast radius 2 inferred); Shy Guy eats attackers and is gone once captured (2:57-4:04); Alibaba rider = dabbaba + alfil rider (3:13, 13:47); duck collectible, never moves (19:37; its "blocks nothing" is not modelled). Piece positions on the map, the dog, the Barrelina and the bazooka\'s moves (reuses QNNC of 7LBERB7y2hs) are not established. The 5-minute clocks are omitted (clocks support 2 players only).'
    }
  });
})();
