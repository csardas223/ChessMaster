/* Can I BEAT Passant? [Conclusion]  Final Passant runs: shop upgrades between rounds (Rainbow pieces, re-roll),
   escalating enemy armies and a Boss Round against the Rainbow Bishop, whose blue laser beams sweep down files.
   Sources: research/modes/1L_sxGgxX9M.json (frames: SHOP, Balance $12/$10, Boss Round panel "Rainbow Bishop", blue
   laser beam on a file, Undo/Recycle, 'Player Turn'; pink/white + dark brown board), rules shared with the full
   release video OO3XlFQ32i0 (js/modes/g5_passant.js, reused read-only: Slippy + Push badges, four victory
   conditions, may move into check, captured king loses). PASS 1: the shop is represented by the upgraded army each
   round starts with (a Rainbow Bishop bought after round 2); enemy armies and the Rainbow Bishop's move
   (bishop + one orthogonal step) are inferred, the boss's laser is an event that clears a random file of pawns.
   PASS 2 (impl-4, 8th session, art from the stills maxres1..3, tools/g4_pass2.py): the Rainbow Bishop card in the frame
   shows a plain bishop move pattern and 'Rainbow: when taken spawn a random piece with a value less than half of this
   one. Value 3', so Y now moves like a bishop and leaves a pawn (the only piece worth < 1.5) on a random empty square of
   its owner's back two ranks when taken (square inferred). Rainbow Bishop piece = the rainbow bishop cut from the
   frame; side panel shows the frame's Rainbow Bishop / Boss Round cards and Undo (3 remaining) / Recycle buttons; shop
   panel from the frame shown before rounds 2+ (buying itself is represented by the preset armies); blue laser beam
   (cut from the frame) drawn down the hit file only in the Boss Round. */
CM.mode({
  id: '1L_sxGgxX9M',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/1L_sxGgxX9M/shop.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'Can I BEAT Passant? [Conclusion]',
  name: 'Passant: The Conclusion',
  category: 'Variants & Games',
  description: 'The full Passant run: six rounds against stronger and stronger armies, ending in the Boss Round against the Rainbow Bishop. Your Slippy badge makes moved pieces slide one extra square (even off the edge); Push shoves adjacent pieces away after a quiet move. You may move into check; a captured king loses. Rainbow Bishops move like bishops; when one is taken, a pawn of its colour spawns on its side.',
  how_to_win: 'Win each round by any of: capture the king, capture all pieces except the king, check the king 6 turns in a row, or be +7 material for two turns. Beat the boss to finish the run.',
  player_side: 'white',
  opponent: { name: 'Passant AI', rating: null, tagline: 'Level 2, level 3, then the Rainbow Bishop boss.' },
  board: { files: 8, ranks: 8, light: '#e8b8c8', dark: '#70361c' },
  theme: { background: '#a26535' },
  pieces: {
    Y: { name: 'Rainbow Bishop', moves: 'B', value: 330, img: { w: 'assets/modes/1L_sxGgxX9M/rainbow_bishop.png', b: 'assets/modes/1L_sxGgxX9M/rainbow_bishop.png' } }
  },
  setup: { fen: '4k3/pppppppp/8/8/8/8/1PPPPPP1/2B1KB2' },
  rules: { check: 'none', castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: {
    human: 'w',
    badges: { slippy: true, push: true },
    rounds: [
      { name: 'Level 2: Standard match', fen: '2bnkn2/1pppppp1/8/8/8/8/1PPPPPP1/2B1KB2' },
      { name: 'Level 2: Challenging match', fen: '1rbnkbr1/1pppppp1/8/8/8/8/1PPPPPP1/2Y1KB2' },
      { name: 'Level 3: Standard match', fen: 'r1bqk1nr/1pppppp1/8/8/8/8/1PPPPPP1/2Y1KY2' },
      { name: 'Level 3: Challenging match', fen: 'rnbqkbnr/1pppppp1/8/8/8/8/PPPPPPPP/2Y1KY2' },
      { name: 'BOSS ROUND: Rainbow Bishop', fen: 'ryyqkyyr/pppppppp/8/8/8/8/PPPPPPPP/2Y1KY2' }
    ]
  },
  vfx_timeline: [{ trigger: 'capture', effect: { type: 'particles', kind: 'smoke', at: 'to', count: 14 } }],  /* grey smoke puff on every capture, as in the stills */
  hooks: (function () {
    var A = 'assets/modes/1L_sxGgxX9M/';
    function B() { return CM.hooks.g5_passant || {}; }
    function boss(ctx) { return ctx.state.b.some(function (p) { return p && p.t === 'Y' && p.c !== ctx.human; }); }
    function roundOf(ctx) {
      var R = ctx.params.rounds || [], key = ctx.state.b.map(function (p) { return p ? p.c + p.t : '.'; }).join();
      for (var k = 0; k < R.length; k++) { var b = CM.spec.parseSetup(ctx.V, R[k].fen); if (b.map(function (p) { return p ? p.c + p.t : '.'; }).join() === key) return k; }
      return 0;
    }
    function panel(ctx) {
      var side = document.getElementById('side'); if (!side) return; var el = side.querySelector('.g4pas-panel');
      if (!el) { el = document.createElement('div'); el.className = 'g4pas-panel'; side.insertBefore(el, side.firstChild); }
      var z = ctx.game._g4pas, left = z.undo;
      el.innerHTML = '<img src="' + A + (z.boss ? 'boss_card.png' : 'rainbow_card.png') + '" alt="Rainbow Bishop: moves like a bishop; when taken it spawns a random piece worth less than half of it (value 3)">' +
        '<div class="g4pas-btns"><button type="button" class="u"' + (left ? '' : ' disabled') + '>Undo<small>(' + left + ' remaining)</small></button><button type="button" class="r" disabled>Recycle<small>-</small></button></div>';
      el.querySelector('.u').onclick = function () { if (!z.undo || !ctx.game.history.length || ctx.over) return; z.undo--; ctx.game.undo(); panel(ctx); };
    }
    function beam(ctx, file) {
      var fx = document.getElementById('board-fx'), g = ctx.geo, top = document.querySelector('#board .sq[data-i="' + g.idx(file, g.ranks - 1) + '"]'), bot = document.querySelector('#board .sq[data-i="' + g.idx(file, 0) + '"]');
      if (!fx || !top || !bot) return;
      var F = fx.getBoundingClientRect(), a = top.getBoundingClientRect(), b = bot.getBoundingClientRect(), y0 = Math.min(a.top, b.top), y1 = Math.max(a.bottom, b.bottom);
      var d = document.createElement('div'); d.className = 'g4pas-beam';
      d.style.cssText = 'position:absolute;left:' + (a.left - F.left + a.width * 0.38) + 'px;top:' + (y0 - F.top) + 'px;width:' + a.width * 0.24 + 'px;height:' + (y1 - y0) + 'px;background:url(' + A + 'beam.png) center/100% auto repeat-y;opacity:0;transition:opacity .2s;pointer-events:none;z-index:6';
      fx.appendChild(d); requestAnimationFrame(function () { d.style.opacity = '1'; });
      ctx.after(900, function () { d.style.opacity = '0'; ctx.after(250, function () { d.remove(); }); });
    }
    var CSS = '.g4pas-panel img{display:block;width:100%;max-width:240px;border-radius:8px;margin:0 auto 8px}' +
      '.g4pas-btns{display:flex;gap:8px;max-width:240px;margin:0 auto 10px}.g4pas-btns button{flex:1;min-height:52px;border:0;border-radius:8px;background:#2e3236;color:#fff;font:700 15px/1.1 system-ui,sans-serif;box-shadow:0 3px 0 #1b1e21;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}' +
      '.g4pas-btns button.u:not([disabled]){background:#3fb6e0}.g4pas-btns small{font-size:10px;font-weight:500;opacity:.85}.g4pas-btns button[disabled]{cursor:default}';
    return {
      extends: 'g5_passant',
      onMake: function (V, st, m, n) {
        B().onMake.call(B(), V, st, m, n);
        var c = m.cap; if (!c || c.t !== 'Y') return;
        var g = V.geo, free = [];  /* 'Rainbow': a taken Rainbow Bishop leaves a pawn (value 1 < 3/2) for its owner */
        for (var i = 0; i < n.b.length; i++) if (!n.b[i] && g.isValid(i) && g.relRow(i, c.c) <= 1) free.push(i);
        if (free.length) n.b[free[(st.ply || st.b.length + free.length) % free.length]] = { t: 'P', c: c.c, m: 1 };
      },
      init: function () { if (!document.getElementById('g4pas-css')) { var e = document.createElement('style'); e.id = 'g4pas-css'; e.textContent = CSS; document.head.appendChild(e); } },
      setup: function (ctx) { B().setup.call(B(), ctx); ctx.game._g4pas = { undo: 3, boss: boss(ctx), round: roundOf(ctx) }; panel(ctx); },
      onStart: function (ctx) {
        B().onStart.call(B(), ctx); var z = ctx.game._g4pas;
        if (z.round > 0) ctx.fx({ type: 'overlay', at: 'board', image: A + 'shop_full.png', fit: 'contain', duration_ms: 1500, fade_ms: 300 });
      },
      afterMove: function (ctx, m, info) {
        var z = ctx.game._g4pas; if (!z || !z.boss || ctx.over || info.ply % 8) return;
        var pw = ctx.pieces(function (p) { return p.c === ctx.human && p.t === 'P'; }); if (!pw.length) return;
        var i = ctx.pick(pw); beam(ctx, ctx.geo.col(i)); ctx.sound('explosion'); ctx.toast('Boss: the Rainbow Bishop\'s laser hits file ' + ctx.name(i)[0] + '!');
        ctx.remove(i); ctx.refresh();
      },
      onExit: function (ctx) { B().onExit.call(B(), ctx); var e = document.querySelector('.g4pas-panel'); if (e) e.remove(); }
    };
  })(),
  source: { research: 'research/modes/1L_sxGgxX9M.json', confidence: 'medium', notes: 'Own transcript unavailable (429); rules from OO3XlFQ32i0. Armies, Rainbow Bishop move and laser rate inferred.' }
});
