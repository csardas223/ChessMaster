/* Can I MASTER Pawnbarian?  Second Pawnbarian episode: the Golem Fortress, seven floors on a 5x5 board (stills maxres2/3:
   "The Golem Fortress, Floor 3 / Floor 5", #dde8eb/#36355b). Transcript (g6b 2026-11-25, analyze_video; the spec had none):
   the hero plays piece cards (3 in hand, two actions a turn), monsters strike their targeted squares ("1 damage"), hearts,
   gold and a shop before every floor (another heart costs 9 gold, 11:11; "we gain one of our hearts back for moving forward",
   13:32; new cards: "pick up a bishop", 3:41), promotion on the back rank (10:44). Golem Fortress foes: Coil Golem, "vigilant:
   immune while the hero is not on any of the adjacent squares, so we have to strike from an adjacent tile" (1:15); Guard
   Golem, a brawler "incapable of getting attacked unless you're diagonally placed" (4:14, 21:15); Spark Imps (8:32), Knight
   Golems (11:33), Cappy Bear Golems (3:56), Spewer Golem (14:01). Engine: js/modes/g5_pawnbarian.js (hand, actions, hearts,
   threat notches, promotion, floors); this file adds the floors, the vigilant rule, gold + shop, hearts carried between
   floors and a tappable card hand. Inferred: floor armies, gold per floor (loot that decays: 8 minus turns, min 2), card
   prices (knight 3, bishop 5, rook 6), starting 4 of 6 hearts (the still shows 6 heart slots), which golem sprite is which
   (except the imp and the hero). */
CM.mode({
  id: 'zP9TzlgA-W0',
  title: 'Can I MASTER Pawnbarian?',
  name: 'Pawnbarian',
  category: 'Variants & Games',
  description: 'The Golem Fortress: your Pawnbarian hero moves with piece cards. You hold three cards and take two actions a turn, each one a card (tap a card to choose it, or just move). Moving into a monster kills it. After your actions, monsters next to you strike for a heart. Coil Golems must be struck from an adjacent square; Guard Golems only diagonally. Reach the back row to promote your pawn cards to queens. Clear seven floors; spend gold between floors on hearts and new cards.',
  how_to_win: 'Clear all seven floors of the Golem Fortress.',
  player_side: 'white',
  player: { name: 'Pawnbarian', rating: null, avatar: 'assets/modes/zP9TzlgA-W0/hero.png' },
  opponent: { name: 'The Golem Fortress', rating: null, avatar: 'assets/modes/zP9TzlgA-W0/skull_enemy.png', tagline: 'High voltage, keep out.' },
  board: { files: 5, ranks: 5, light: '#dde8eb', dark: '#36355b', background: '#2f2d55' },
  pieces: { /* hero + Cappy Bears cut from the video frames (tools/g6_art_pass2.py); golems + imp from maxres2/3 (tools/g6b_art.py) */
    H: { name: 'Pawnbarian', moves: '', gen: 'hero', value: 1000, img: 'assets/modes/zP9TzlgA-W0/hero.png', badge: '' },
    C: { name: 'Cappy Bear Golem', moves: 'mK', value: 200, img: 'assets/modes/zP9TzlgA-W0/cappy_bear.png', badge: '' },
    Y: { name: 'Guard Golem', moves: 'mK', value: 280, img: 'assets/modes/zP9TzlgA-W0/guard_golem.png', badge: '' },   /* g5 rule: only attackable diagonally */
    O: { name: 'Coil Golem', moves: 'mK', value: 300, img: 'assets/modes/zP9TzlgA-W0/coil_golem.png', badge: '' },     /* vigilant (this file) */
    I: { name: 'Spark Imp', moves: 'mK', value: 220, img: 'assets/modes/zP9TzlgA-W0/spark_imp.png', badge: '' },
    G: { name: 'Knight Golem', moves: 'mN', value: 260, img: 'assets/modes/zP9TzlgA-W0/knight_golem.png', badge: '' },
    E: { name: 'Spewer Golem', moves: 'mK', value: 320, img: 'assets/modes/zP9TzlgA-W0/spewer_golem.png', badge: '' }
  },
  setup: { fen: 'g1o1g/5/5/5/2H2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { none: true }, movesPerTurn: { w: 2 }, drawPlies: 400, win: [] },
  bot: { engine: 'search', depth: 2, time_ms: 400, min_ms: 380 },
  params: {
    hearts: 4, deck: ['P', 'P', 'P', 'P', 'N', 'B', 'R', 'Q'],
    floors: [
      { name: 'The Golem Fortress - Floor 1', fen: 'g1o1c/5/5/5/2H2' },
      { name: 'Floor 2: coil golem and guard', fen: '1o1y1/2c2/5/5/2H2' },
      { name: 'Floor 3: spark imps', fen: 'i3i/5/1o3/5/2H2' },
      { name: 'Floor 4: four knight golems', fen: 'g1i1g/5/g3g/5/2H2' },
      { name: 'Floor 5: the spewer golem', fen: '1ie2/1o1y1/5/5/4H' },
      { name: 'Floor 6: spewer, guards, knights', fen: 'eyc1y/g3g/1o3/5/2H2' },
      { name: 'Floor 7: the last stand', fen: 'iey1i/1gog1/5/5/2H2' }
    ]
  },
  hooks: (function () {
    var NAME = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' }, PRICE = { N: 3, B: 5, R: 6 }, HEART = 9, MAXHP = 6;
    var R = null;
    function run(ctx) { return R || (R = { k: 0, gold: 0, hp: 4, deck0: ctx.params.deck.slice(), snapHp: 4 }); }
    function base() { return CM.hooks.g5_pawnbarian; }
    function close() { var e = document.getElementById('pb-run'); if (e) e.remove(); }
    function hand(ctx) {   /* the card hand under the board: tap a card to play your next action with it */
      var bar = document.getElementById('pb-hand'), st = document.getElementById('status');
      if (!bar && st && st.parentNode) { bar = document.createElement('div'); bar.id = 'pb-hand'; bar.style.cssText = 'display:flex;gap:6px;justify-content:center;margin:6px 0'; st.parentNode.insertBefore(bar, st); }
      if (!bar) return; var x = ctx.state.x || {}, h = x.hand || [];
      bar.innerHTML = h.map(function (c, k) { var on = x.sel === c; return '<button type="button" data-c="' + c + '" title="' + NAME[c] + '" style="width:58px;height:74px;border-radius:6px;border:3px solid ' + (on ? '#e3a72a' : '#fff') + ';background:#dde8eb;padding:4px;cursor:pointer"><img alt="' + NAME[c] + '" src="' + ctx.game.pieceImage({ t: c, c: 'w' }) + '" style="width:100%;height:100%;object-fit:contain"></button>'; }).join('');
      bar.onclick = function (e) { var b = e.target.closest('[data-c]'); if (!b || ctx.over || ctx.state.turn !== ctx.human) return; ctx.setX('sel', (ctx.state.x || {}).sel === b.dataset.c ? null : b.dataset.c); ctx.refresh(); hand(ctx); };
    }
    function shop(ctx) {
      var r = run(ctx), wrap = document.getElementById('board-wrap'); if (!wrap) return; close();
      var el = document.createElement('div'); el.id = 'pb-run';
      el.style.cssText = 'position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(47,45,85,.97);padding:10px;display:flex;flex-direction:column;gap:8px;color:#fff;font:14px/1.3 system-ui,sans-serif';
      var btn = function (a, v, label, cost) { return '<button type="button" class="btn" data-a="' + a + '" data-v="' + v + '"' + (r.gold < cost || (a === 'heart' && r.hp >= MAXHP) ? ' disabled' : '') + ' style="flex:1 1 30%;min-width:92px;flex-direction:column;gap:4px;padding:8px 4px;background:#45427a">' + label + '<b style="color:#ffd75a">' + cost + ' gold</b></button>'; };
      el.innerHTML = '<b style="font-size:18px">Shop</b><div><b style="color:#ffd75a;font-size:20px">' + r.gold + ' gold</b> \u00b7 ' + '\u2665'.repeat(r.hp) + '<span style="opacity:.35">' + '\u2665'.repeat(Math.max(0, MAXHP - r.hp)) + '</span></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' + btn('heart', 0, '<img alt="" src="assets/modes/zP9TzlgA-W0/heart.png" style="width:40px;height:40px;object-fit:contain"><span>Heart</span>', HEART) +
        Object.keys(PRICE).map(function (t) { return btn('card', t, '<img alt="" src="' + ctx.game.pieceImage({ t: t, c: 'w' }) + '" style="width:40px;height:40px;background:#dde8eb;border-radius:4px"><span>' + NAME[t] + ' card</span>', PRICE[t]); }).join('') + '</div>' +
        '<div style="font-size:12px;opacity:.85">Deck: ' + ctx.params.deck.map(function (c) { return NAME[c]; }).join(', ') + '</div>' +
        '<button type="button" class="btn" data-a="next" style="margin-top:auto;background:#e3a72a;color:#222;font-weight:700">Next floor &rarr;</button>';
      el.onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b || b.disabled) return; var a = b.dataset.a;
        if (a === 'heart') { r.gold -= HEART; r.hp = Math.min(MAXHP, r.hp + 1); }
        else if (a === 'card') { r.gold -= PRICE[b.dataset.v]; ctx.params.deck.push(b.dataset.v); }
        else if (a === 'next') { close(); ctx.params.hearts = r.hp; ctx.game.newGame(); return; }
        ctx.sound('notify'); shop(ctx); };
      wrap.appendChild(el);
    }
    return {
      extends: 'g5_pawnbarian',
      hero: function (V, st, i, p, out) {   /* a tapped card (x.sel) restricts the next action to that card */
        var tmp = []; base().hero(V, st, i, p, tmp); var s = st.x && st.x.sel;
        var f = s ? tmp.filter(function (m) { return m.card === s; }) : tmp;
        Array.prototype.push.apply(out, f.length ? f : tmp);
      },
      filterMoves: function (V, st, legal) {   /* Coil Golem (vigilant): only struck from an adjacent square */
        legal = base().filterMoves(V, st, legal);
        return legal.filter(function (m) { return !(st.turn === 'w' && m.cap && m.cap.t === 'O' && V.geo.dist(m.f, m.t) > 1); });
      },
      onMake: function (V, st, m, n) { base().onMake(V, st, m, n); if (n.x && n.x.sel) n.x = Object.assign({}, n.x, { sel: null }); },
      setup: function (ctx) { var r = run(ctx); close(); ctx.params.hearts = r.hp; base().setup(ctx); r.snapHp = r.hp; ctx.state.x.turns = 0; },
      onStart: function (ctx) { base().onStart(ctx); hand(ctx); },
      afterMove: function (ctx, m, info) { var v = base().afterMove(ctx, m, info); hand(ctx); return v; },
      onTurn: function (ctx) { hand(ctx); },
      onUndo: function (ctx) { hand(ctx); },
      onGameOver: function (ctx, over) {
        var r = run(ctx), last = ctx.params.floors.length - 1;
        base().onGameOver(ctx, over);
        if (over.w === ctx.human) {
          var turns = Math.ceil((ctx.ply || 0) / 2), loot = Math.max(2, 8 - turns);
          r.gold += loot; r.hp = Math.min(MAXHP, Math.max(1, ctx.state.x.hp || 0) + 1);   /* a heart back for moving forward */
          if (r.k >= last) { ctx.toast('We conquered the Golem Fortress!', 4200); R = null; ctx.params.deck = ctx.params.deck.slice(0, 8); return; }
          r.k++; ctx.toast('Floor cleared: +' + loot + ' gold, +1 heart.', 2600);
          ctx.after(1700, function () { shop(ctx); });
        } else { r.hp = r.snapHp; }
      },
      status: function (ctx) { var r = run(ctx); return base().status(ctx) + '  \u00b7  ' + r.gold + ' gold'; },
      onExit: function (ctx) { close(); var h = document.getElementById('pb-hand'); if (h) h.remove(); }
    };
  })(),
  todo_pass2: ['card upgrades (shield, diagonal/cardinal splash, cantrip extra action) and the spark traits that punish cantrips (Knight Golem aegis, Coil surge, Cappy spark-walk, Spewer blight/puppeteer, nimble)', 'per-monster targeted-square patterns with damage numbers (monsters strike adjacent squares here)', 'loot row art above the board, deck/discard piles'],
  source: { research: 'research/modes/zP9TzlgA-W0.json', confidence: 'medium', notes: 'Transcript fetched 2026-11-25; floor armies, gold amounts and some sprite names inferred.' }
});
