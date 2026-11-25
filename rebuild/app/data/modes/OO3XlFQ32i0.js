/* Can I BEAT Passant? [Full Release]  Passant, a chess roguelike: he picks setup 4 'Slip and Push' (6 pawns, 2
   bishops and the king, with the Slippy and Push badges), takes Challenging matches and clears the three rounds of
   level 1 by capturing all enemy pieces ($8 per round). Sources: research/modes/OO3XlFQ32i0.json (victory list,
   badges, may move into check / king capture loses), frames visual (#b7def6/#146fab blue board, pink dots,
   'Unstable' tile, Game Over 'You made it to stage 1, round 1'). Logic in js/modes/g5_passant.js. PASS 1: enemy
   armies per round inferred (not legible); no shop/coins/undo charges. Pass 2 (impl-5, 7th session): pink move
   dots, red selected piece in a white box, smoke on capture, 'Player Turn' text, all from the video (js/modes/g5_passant.js).
   g5 art pass 6 (2026-11-25): 'Unstable' is the round-3 boss "Cracked Vase" (a piece status, not a tile) and the pink
   arrows are the last-move trail, both from the transcript + the 17:58 frame; arrow cut by tools/g5_art6.py. */
CM.mode({
  id: 'OO3XlFQ32i0',
  title: 'Can I BEAT Passant? [Full Release]',
  name: 'Passant: Slip and Push',
  category: 'Variants & Games',
  description: 'Setup 4 "Slip and Push": six pawns, two bishops and your king. Slippy: your moved piece slides one more square in the same direction if it is empty, and can slip off the board. Push: a non-capturing move shoves every adjacent piece (not kings) one square away, even off the edge. You may move into check; a captured king loses. Three rounds per level; round 3 is the Boss Round "Cracked Vase": a piece of yours that captures becomes Unstable and has a 1 in 3 chance to destroy itself on each later capture. Pink arrows mark the squares your last moved piece left.',
  how_to_win: 'Any of: capture the king, capture all pieces except the king, check the king 6 turns in a row, or be +7 material for two turns.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Passant AI', rating: null, tagline: 'Challenging match: a stronger enemy army each round.' },
  board: { files: 8, ranks: 8, light: '#b7def6', dark: '#146fab' },
  setup: { fen: '4k3/pppppppp/8/8/8/8/1PPPPPP1/2B1KB2' },
  pieces: {
    Y: { name: 'Rainbow Bishop', moves: 'B', value: 330, img: { w: 'assets/modes/1L_sxGgxX9M/rainbow_bishop.png', b: 'assets/modes/1L_sxGgxX9M/rainbow_bishop.png' } },   /* the rainbow bishop cut from the Passant conclusion video (same game) */
    Z: { name: 'Rainbow Pawn', moves: 'fmWfcFifmnD', pawn: true, promote: true, value: 110, glyph: 'P', cls: 'g5pas-rb' }
  },
  rules: { check: 'none', castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: {
    human: 'w',
    badges: { slippy: true, push: true },
    rounds: [
      { name: 'Challenging match', fen: '3nk3/2pppp2/8/8/8/8/1PPPPPP1/2B1KB2' },
      { name: 'Challenging match', fen: '2bnkn2/1pppppp1/8/8/8/8/1PPPPPP1/2B1KB2' },
      { name: 'Boss Round', fen: '1rbnkbr1/1pppppp1/8/8/8/8/1PPPPPP1/2B1KB2', boss: 'Cracked Vase' /* transcript 16:21-17:50, frame 17:58 */ }
    ]
  },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/OO3XlFQ32i0/passant_logo.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  vfx_timeline: [{ trigger: 'capture', effect: { type: 'particles', kind: 'smoke', at: 'to', count: 14 } }],
  hooks: (function () {
    /* g5 pass 2 (2026-11-25): the run between rounds, from the transcript/frames (research/modes/OO3XlFQ32i0.json:
       "Between rounds: SHOP (piece upgrades e.g. Rainbow Bishop/Pawn, Re-roll $2, Next Round), money rewards per round
       (e.g. $8); Undo charges ('Undo 1 turn (1 remain)')") and the sister video's shop frames (1L_sxGgxX9M: SHOP, Balance,
       Rainbow Bishop card 'when taken spawn a random piece with a value less than half of this one. Value 3').
       - Undo: 1 charge per round ('Undo 1 turn (1 remain)'); the toolbar Undo and the panel button both spend it.
       - Win a round: +$8, then the SHOP: three offers, Re-roll ($2, new offers), Next Round. Bought pieces join your army
         on your back two ranks for every later round of the run. Prices are inferred (the frames only show $2 re-roll and
         the balance). Rainbow pieces: when taken they leave a piece worth less than half of them for their owner
         (Rainbow Bishop -> a pawn; a Rainbow Pawn leaves nothing). Rainbow Bishop art = the sister video's card cut;
         the Rainbow Pawn is the standard pawn with the rainbow shimmer (no still shows its model: inferred).
       - Lose a round: the run is over ('You made it to stage 1, round N'); money and bought pieces reset. */
    var S = { money: 0, army: [], round: 0 }, A1 = 'assets/modes/1L_sxGgxX9M/';
    var GOODS = [{ t: 'P', name: 'Pawn', cost: 2 }, { t: 'Z', name: 'Rainbow Pawn', cost: 3 }, { t: 'N', name: 'Knight', cost: 5 }, { t: 'B', name: 'Bishop', cost: 5 },
      { t: 'Y', name: 'Rainbow Bishop', cost: 7 }, { t: 'R', name: 'Rook', cost: 8 }];
    function B() { return CM.hooks.g5_passant || {}; }
    function offers() { var o = GOODS.slice(), out = []; while (out.length < 3 && o.length) out.push(o.splice(Math.floor(Math.random() * o.length), 1)[0]); return out; }
    var CSS = '.g5pas-panel{display:flex;gap:8px;max-width:260px;margin:0 auto 10px}.g5pas-panel button{flex:1;min-height:48px;border:0;border-radius:8px;background:#2e3236;color:#fff;font:700 15px/1.1 system-ui,sans-serif;box-shadow:0 3px 0 #1b1e21;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer}' +
      '.g5pas-panel button.u:not([disabled]){background:#3fb6e0}.g5pas-panel small{font-size:10px;font-weight:500;opacity:.85}.g5pas-panel .bal{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#ffd23f;font:800 18px/1 system-ui,sans-serif}.g5pas-panel .bal small{color:#fff}' +
      '.g5pas-shop{position:fixed;inset:0;z-index:120;background:rgba(10,40,70,.88);display:flex;align-items:center;justify-content:center;padding:12px;animation:g5pasf .22s ease-out}@keyframes g5pasf{from{opacity:0}to{opacity:1}}' +
      '.g5pas-shop__box{width:min(94vw,420px);background:#b7def6;border-radius:10px;padding:14px;box-shadow:0 8px 30px rgba(0,0,0,.5);color:#0d3a5e;font:600 14px/1.3 system-ui,sans-serif}' +
      '.g5pas-shop h3{margin:0 0 4px;font:900 24px/1 system-ui,sans-serif;letter-spacing:.06em;color:#146fab;text-align:center}.g5pas-shop .bal{text-align:center;margin-bottom:10px}' +
      '.g5pas-shop__row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.g5pas-shop__row button{border:0;border-radius:8px;background:#fff;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:4px;font:700 12px/1.1 system-ui,sans-serif;color:#0d3a5e;cursor:pointer;box-shadow:0 3px 0 #7fb6da}' +
      '.g5pas-shop__row button img{width:52px;height:52px;object-fit:contain}.g5pas-shop__row button[disabled]{opacity:.4;cursor:default}.g5pas-shop__row button.sold{visibility:hidden}' +
      '.g5pas-shop__btns{display:flex;gap:8px;margin-top:12px}.g5pas-shop__btns button{flex:1;min-height:44px;border:0;border-radius:8px;font:800 14px/1 system-ui,sans-serif;color:#fff;background:#146fab;cursor:pointer;box-shadow:0 3px 0 #0b4470}.g5pas-shop__btns button.next{background:#e55f80;box-shadow:0 3px 0 #a83b58}.g5pas-shop__btns button[disabled]{opacity:.45}' +
      '.g5pas-rb{animation:g5pasrb 3s linear infinite}@keyframes g5pasrb{from{filter:hue-rotate(0deg) saturate(2.2)}to{filter:hue-rotate(360deg) saturate(2.2)}}@media (prefers-reduced-motion:reduce){.g5pas-rb{animation:none;filter:hue-rotate(200deg) saturate(2.2)}}';
    function img(ctx, t) { return ctx.game.pieceImage({ t: t, c: ctx.human }); }
    function panel(ctx) {
      var side = document.getElementById('side'); if (!side) return; var el = side.querySelector('.g5pas-panel');
      if (!el) { el = document.createElement('div'); el.className = 'g5pas-panel'; side.insertBefore(el, side.firstChild); }
      var z = ctx.game._g5pas || { undo: 0 };
      el.innerHTML = '<button type="button" class="u"' + (z.undo ? '' : ' disabled') + '>Undo 1 turn<small>(' + z.undo + ' remain)</small></button><div class="bal">$' + S.money + '<small>Balance</small></div>';
      el.querySelector('.u').onclick = function () { ctx.game.undo(); };
    }
    function shop(ctx) {
      var old = document.querySelector('.g5pas-shop'); if (old) old.remove();
      var list = offers(), el = document.createElement('div'); el.className = 'g5pas-shop'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Shop');
      function draw() {
        el.innerHTML = '<div class="g5pas-shop__box"><h3>SHOP</h3><div class="bal">Balance: $' + S.money + '</div><div class="g5pas-shop__row">' +
          list.map(function (g, k) { return '<button type="button" data-k="' + k + '"' + (g.sold ? ' class="sold"' : S.money < g.cost ? ' disabled' : '') + '><img alt="" src="' + img(ctx, g.t) + '"' + (g.t === 'Z' ? ' class="g5pas-rb"' : '') + '>' + g.name + '<span>$' + g.cost + '</span></button>'; }).join('') +
          '</div><div class="g5pas-shop__btns"><button type="button" data-a="roll"' + (S.money < 2 ? ' disabled' : '') + '>Re-roll $2</button><button type="button" class="next" data-a="next">Next Round</button></div></div>';
      }
      el.onclick = function (e) {
        var b = e.target.closest('button'); if (!b || b.disabled) return;
        if (b.dataset.k != null) { var g = list[+b.dataset.k]; if (g.sold || S.money < g.cost) return; S.money -= g.cost; g.sold = 1; S.army.push(g.t); ctx.sound('promote'); }
        else if (b.dataset.a === 'roll') { S.money -= 2; list = offers(); }
        else if (b.dataset.a === 'next') { el.remove(); var go = document.getElementById('gover'); if (go) go.classList.remove('is-open'); ctx.game.newGame(); return; }
        draw(); panel(ctx);
      };
      draw(); document.body.appendChild(el);
    }
    return {
      extends: 'g5_passant',
      init: function () { if (!document.getElementById('g5pas-css')) { var e = document.createElement('style'); e.id = 'g5pas-css'; e.textContent = CSS; document.head.appendChild(e); } },
      setup: function (ctx) {
        B().setup.call(B(), ctx);
        var G = ctx.game, V = ctx.V, g = V.geo, st = ctx.state, h = ctx.human;
        G._g5pas = { undo: 1 };
        if (!G._g5pasWrapped) {   /* the toolbar Undo spends the round's charge too */
          G._g5pasWrapped = true; var real = G.undo;
          G.undo = function () { var z = G._g5pas; if (!G.history.length) return; if (!z || z.undo <= 0) { ctx.toast('No undo charges left this round.', 1800); return; } z.undo--; real.call(G); panel(ctx); };
        }
        /* bought pieces stand on your back two ranks, nearest the king first */
        var k0 = V.royals(st, h)[0], free = [];
        for (var i = 0; i < st.b.length; i++) if (!st.b[i] && g.isValid(i) && g.relRow(i, h) <= 1) free.push(i);
        free.sort(function (a, b) { return g.relRow(a, h) - g.relRow(b, h) || (k0 != null ? g.dist(a, k0) - g.dist(b, k0) : 0) || a - b; });
        S.army.forEach(function (t, j) { if (free[j] != null) st.b[free[j]] = { t: t, c: h, m: 1 }; });
        panel(ctx);
      },
      onMake: function (V, st, m, n) {
        B().onMake.call(B(), V, st, m, n);
        var c = m.cap; if (!c || c.t !== 'Y') return;   /* Rainbow Bishop taken: its owner gets a pawn (value 1 < 3/2) */
        var g = V.geo, free = [];
        for (var i = 0; i < n.b.length; i++) if (!n.b[i] && g.isValid(i) && g.relRow(i, c.c) <= 1) free.push(i);
        if (free.length) n.b[free[(st.ply || 0) % free.length]] = { t: 'P', c: c.c, m: 1 };
      },
      decorate: function (ctx, sq, p) {
        var d = B().decorate.call(B(), ctx, sq, p);
        if (p && p.t === 'Z') { d = d || {}; d.cls = ((d.cls || '') + ' g5pas-rbsq').trim(); }
        return d;
      },
      onGameOver: function (ctx, over) {
        B().onGameOver.call(B(), ctx, over);
        if (over.w === ctx.human) { S.money += 8; S.round++; panel(ctx); setTimeout(function () { if (ctx.game && !document.querySelector('.g5pas-shop')) shop(ctx); }, 1500); }
        else { ctx.toast('Game Over: you made it to stage 1, round ' + (S.round + 1) + '. The run starts over.', 3200); S.money = 0; S.army = []; S.round = 0; panel(ctx); }
      },
      onExit: function (ctx) { B().onExit.call(B(), ctx); ['.g5pas-panel', '.g5pas-shop'].forEach(function (q) { var e = document.querySelector(q); if (e) e.remove(); }); }
    };
  })(),
  _art_notes: 'The red crowned piece in the stills is the selected king (red tint inside a white box), not an elite pawn. Passant 3D piece models: only pawns and the black king/knight are visible in the stills, so the standard set is kept.',
  source: { research: 'research/modes/OO3XlFQ32i0.json', confidence: 'medium', notes: 'Enemy armies per round invented to escalate (Challenging matches); badge rules from the transcript.' }
});
