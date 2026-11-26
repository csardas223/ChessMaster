/* Can I BEAT Pawnbarian?  First Pawnbarian episode: a chess-themed roguelike deck-builder. Cards move the hero like
   chess pieces, promotion in the top row, monsters strike targeted squares, loot decays, shop between floors; he
   clears Tutorial Island and the first area to its boss. Sources: research/modes/Kzt9ItpGtYg.json (2 actions from 3
   cards, red notches = targeted squares, Horned Cappy Bear only hit diagonally), frames (5x5 grid #646786/#36355b).
   Logic in js/modes/g5_pawnbarian.js. PASS 1: no loot row / gold / shop; 4 floors ending in a boss. */
CM.mode({
  id: 'Kzt9ItpGtYg',
  title: 'Can I BEAT Pawnbarian?',
  name: 'Pawnbarian',
  category: 'Variants & Games',
  description: 'You are the Pawnbarian (H). Each turn you hold 3 piece cards and take 2 actions: tap the hero, then a square it can reach with any card in your hand (pawn, knight, bishop, rook, queen, king); moving onto a monster kills it. Reaching the top row turns your pawn cards into queens. After your actions, every monster next to you hits for one heart (red-notched squares), then a monster moves. Horned Cappy Bears (Y) can only be attacked diagonally; the boss (X) needs 3 hits. Promoted queens give diagonal splash. The Goblin Blightvessel must be the last monster standing, dodges the first hit and calls a Blightsack whenever another monster dies.',
  how_to_win: 'Kill every monster on each floor and beat the boss without losing all 3 hearts.',
  player_side: 'white',
  player: { name: 'Pawnbarian', rating: null, avatar: 'assets/modes/Kzt9ItpGtYg/hero_avatar.png' },
  opponent: { name: 'Monsters', rating: null, avatar: 'assets/modes/Kzt9ItpGtYg/lion.png', tagline: 'Cappy Bears, Horned Cappy Bears and the island boss.' },
  board: { files: 5, ranks: 5, light: '#646786', dark: '#36355b' },
  theme: { background: '#1e1d33' },
  pieces: {
    H: { name: 'Pawnbarian', moves: '', gen: 'hero', value: 1000, img: 'assets/modes/Kzt9ItpGtYg/hero.png', badge: '' },
    C: { name: 'Cappy Bear', moves: 'mK', value: 200, img: 'assets/modes/Kzt9ItpGtYg/cappy.png', badge: '' },
    Y: { name: 'Horned Cappy Bear', moves: 'mK', value: 260, img: 'assets/modes/Kzt9ItpGtYg/horned_cappy.png', badge: '' },
    X: { name: 'Island Boss', moves: 'mK', value: 900, img: 'assets/modes/Kzt9ItpGtYg/lion.png', badge: '' },
    /* Goblin Caves monsters, round tokens cut from the 11:43 / 15:40 / 22:20 video frames (tools/g5_art5.py) */
    S: { name: 'Spidertoad', moves: 'mK', value: 240, img: 'assets/modes/Kzt9ItpGtYg/spidertoad.png', badge: '' },
    M: { name: 'Champion Goblin Shaman', moves: 'mK', value: 320, img: 'assets/modes/Kzt9ItpGtYg/goblin_shaman.png', badge: '' },
    J: { name: 'Blightsack', moves: '', value: 120, img: 'assets/modes/Kzt9ItpGtYg/blightsack.png', badge: '' },   /* never moves; spawned by the Blightvessel (g5_pawnbarian blight caller); a lone sack side passes */
    V: { name: 'Goblin Blightvessel', moves: 'mK', value: 700, img: 'assets/modes/Kzt9ItpGtYg/blightvessel.png', badge: '' }   /* champion + nimble + blight caller (transcript 22:19-24:19), token from the 22:20 frame */
  },
  setup: { fen: '1c1c1/5/5/5/2H2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { none: true }, movesPerTurn: { w: 2 }, drawPlies: 400, win: [] },
  bot: { engine: 'search', depth: 2, time_ms: 400, min_ms: 380 },
  params: {
    hearts: 3, bossHp: 3, deck: ['P', 'P', 'P', 'P', 'N', 'B', 'P', 'R'],
    floors: [
      { name: 'Tutorial Island', fen: '1c1c1/5/5/5/2H2' },
      { name: 'Island shore', fen: 'c1y1c/5/5/5/2H2' },
      { name: 'Island cliffs', fen: 'cy1yc/2c2/5/5/2H2' },
      { name: 'Boss: the Island King', fen: '1cxc1/5/5/5/2H2' },
      { name: 'The Goblin Caves', fen: 's1m1s/1y1y1/5/5/2H2' },
      { name: 'Goblin Caves: the Blightvessel', fen: 'j1v1j/1s1m1/5/5/2H2' }   /* layout inferred; units from the 22:20 frame */
    ]
  },
  sounds: { 'capture': 'assets/modes/Kzt9ItpGtYg/slash.wav', 'coin': 'assets/modes/Kzt9ItpGtYg/coin.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
  hooks: (function () {
    /* g5 pass 2 (2026-11-25), look from the 11:43 frame (research/frames/video_thumbs/Kzt9ItpGtYg_frame_703.jpg):
       - the card hand under the board: three pale cards with the white piece, the chosen card raised in an orange frame; tap a
         card to play your next action with it (tap again to free the choice); the hearts row sits above the cards.
       - the loot row above the board: gold bag with your gold, the red gem, then a row of gold nuggets that loses one nugget
         every turn you take (min 2: inferred); clearing the floor banks the nuggets left as gold.
       - a shop between floors: a heart for 9 gold (price from the sister video zP9TzlgA-W0 11:11), Knight / Bishop / Rook cards
         for 3 / 5 / 6 gold (inferred) added to your deck for the rest of the run; hearts carry over between floors.
       Bag, gem, nugget and heart are cut from that frame (tools/g5_art7.py). */
    var NAME = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' }, PRICE = { N: 3, B: 5, R: 6 }, HEART = 9, MAXHP = 6, LOOT = 10;
    var A = 'assets/modes/Kzt9ItpGtYg/', R = null;
    function run(ctx) { return R || (R = { gold: 0, hp: ctx.params.hearts || 3, deck0: ctx.params.deck.slice(), snapHp: ctx.params.hearts || 3 }); }
    function base() { return CM.hooks.g5_pawnbarian; }
    function loot(ctx) { return Math.max(2, LOOT - Math.floor((ctx.ply || 0) / 3)); }   /* 2 hero actions + 1 monster move = one turn */
    var CSS = '#pb5-loot{display:flex;align-items:center;gap:2px;justify-content:center;margin:2px 0 4px;min-height:34px}' +
      '#pb5-loot .bag{position:relative;width:34px;height:34px}#pb5-loot .bag img{width:100%;height:100%;object-fit:contain}#pb5-loot .bag b{position:absolute;left:0;right:0;bottom:3px;text-align:center;font:700 14px/1 Georgia,serif;color:#2a2340}' +
      '#pb5-loot .gem{width:24px;height:24px;object-fit:contain;margin:0 2px}#pb5-loot .nug{width:17px;height:17px;object-fit:contain;transition:opacity .2s ease-out,transform .2s ease-out}#pb5-loot .nug.gone{opacity:0;transform:translateY(-6px)}' +
      '#pb5-hand{display:flex;flex-direction:column;align-items:center;gap:4px;margin:6px 0}#pb5-hand .hp{display:flex;gap:0}#pb5-hand .hp img{width:22px;height:30px;object-fit:contain;margin-right:-2px}#pb5-hand .hp img.lost{opacity:.22;filter:grayscale(1)}' +
      '#pb5-hand .cards{display:flex;gap:6px}#pb5-hand button{width:64px;height:84px;border-radius:4px;border:3px solid #dde8eb;background:#dde8eb;padding:6px 4px 2px;cursor:pointer;transition:transform .2s ease-out,border-color .2s ease-out}' +
      '#pb5-hand button img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 1px #222)}#pb5-hand button.on{border-color:#f5a623;transform:translateY(-6px)}#pb5-hand button.q{background:#fff2c8}' +
      '#pb5-shop{position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(54,53,91,.97);padding:12px;display:flex;flex-direction:column;gap:10px;color:#fff;font:15px/1.3 Georgia,serif;animation:pb5f .22s ease-out}@keyframes pb5f{from{opacity:0}to{opacity:1}}' +
      '#pb5-shop h3{margin:0;font:700 22px/1 Georgia,serif;letter-spacing:.08em;font-variant:small-caps}#pb5-shop .row{display:flex;flex-wrap:wrap;gap:8px}#pb5-shop .it{flex:1 1 28%;min-width:84px;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 4px;border:0;border-radius:6px;background:#4a4878;color:#fff;font:600 13px/1.1 system-ui,sans-serif;cursor:pointer}' +
      '#pb5-shop .it img{width:42px;height:42px;object-fit:contain}#pb5-shop .it .pc{background:#dde8eb;border-radius:4px;padding:3px}#pb5-shop .it b{color:#f5b041}#pb5-shop .it[disabled]{opacity:.4;cursor:default}' +
      '#pb5-shop .next{margin-top:auto;min-height:46px;border:0;border-radius:6px;background:#f5a623;color:#2a2340;font:800 15px/1 system-ui,sans-serif;cursor:pointer}';
    function css() { if (!document.getElementById('pb5-css')) { var e = document.createElement('style'); e.id = 'pb5-css'; e.textContent = CSS; document.head.appendChild(e); } }
    function hud(ctx) {
      css(); var r = run(ctx), area = document.getElementById('board-area'), stl = document.getElementById('status');
      var top = document.getElementById('pb5-loot');
      if (!top && area && area.parentNode) { top = document.createElement('div'); top.id = 'pb5-loot'; area.parentNode.insertBefore(top, area); }
      var bar = document.getElementById('pb5-hand');
      if (!bar && stl && stl.parentNode) { bar = document.createElement('div'); bar.id = 'pb5-hand'; stl.parentNode.insertBefore(bar, stl); }
      if (top) { var n = loot(ctx), h = '<span class="bag"><img alt="" src="' + A + 'gold_bag.png"><b>' + r.gold + '</b></span><img class="gem" alt="" src="' + A + 'gem.png">';
        for (var k = 0; k < LOOT; k++) h += '<img class="nug' + (k >= n ? ' gone' : '') + '" alt="" src="' + A + 'nugget.png">';
        top.innerHTML = h; top.setAttribute('aria-label', r.gold + ' gold, loot ' + n); }
      if (!bar) return; var x = ctx.state.x || {}, hand = x.hand || [], hp = Math.max(0, x.hp || 0), mx = Math.max(hp, r.snapHp, ctx.params.hearts || 3);
      var hh = ''; for (var j = 0; j < mx; j++) hh += '<img alt="" src="' + A + 'heart.png"' + (j >= hp ? ' class="lost"' : '') + '>';
      bar.innerHTML = '<div class="hp" aria-label="' + hp + ' hearts">' + hh + '</div><div class="cards">' + hand.map(function (c, k) { return '<button type="button" data-c="' + c + '" class="' + (x.sel === c && hand.indexOf(c) === k ? 'on' : '') + (c === 'Q' ? ' q' : '') + '" title="' + NAME[c] + '"><img alt="' + NAME[c] + '" src="' + ctx.game.pieceImage({ t: c, c: 'w' }) + '"></button>'; }).join('') + '</div>';
      bar.onclick = function (e) { var b = e.target.closest('[data-c]'); if (!b || ctx.over || ctx.state.turn !== ctx.human) return; ctx.setX('sel', (ctx.state.x || {}).sel === b.dataset.c ? null : b.dataset.c); ctx.refresh(); hud(ctx); };
    }
    function close() { var e = document.getElementById('pb5-shop'); if (e) e.remove(); }
    function shop(ctx) {
      var r = run(ctx), wrap = document.getElementById('board-wrap'); if (!wrap) return; close();
      var el = document.createElement('div'); el.id = 'pb5-shop'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Shop');
      var it = function (a, v, icon, label, cost) { return '<button type="button" class="it" data-a="' + a + '" data-v="' + v + '"' + (r.gold < cost || (a === 'heart' && r.hp >= MAXHP) ? ' disabled' : '') + '>' + icon + '<span>' + label + '</span><b>' + cost + ' gold</b></button>'; };
      el.innerHTML = '<h3>Shop</h3><div><img alt="" src="' + A + 'gold_bag.png" style="width:26px;vertical-align:middle"> <b style="color:#f5b041;font-size:20px">' + r.gold + ' gold</b></div>' +
        '<div class="row">' + it('heart', 0, '<img alt="" src="' + A + 'heart.png">', 'Heart', HEART) +
        Object.keys(PRICE).map(function (t) { return it('card', t, '<img class="pc" alt="" src="' + ctx.game.pieceImage({ t: t, c: 'w' }) + '">', NAME[t] + ' card', PRICE[t]); }).join('') + '</div>' +
        '<div style="font-size:13px;opacity:.85">Deck: ' + ctx.params.deck.map(function (c) { return NAME[c]; }).join(', ') + '</div>' +
        '<button type="button" class="next" data-a="next">Next floor &rarr;</button>';
      el.onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b || b.disabled) return; var a = b.dataset.a;
        if (a === 'heart') { r.gold -= HEART; r.hp = Math.min(MAXHP, r.hp + 1); }
        else if (a === 'card') { r.gold -= PRICE[b.dataset.v]; ctx.params.deck.push(b.dataset.v); }
        else if (a === 'next') { close(); var go = document.getElementById('gover'); if (go) go.classList.remove('is-open'); ctx.game.newGame(); return; }
        ctx.sound('coin'); shop(ctx); };
      wrap.appendChild(el);
    }
    return {
      extends: 'g5_pawnbarian',
      hero: function (V, st, i, p, out) {   /* a tapped card (x.sel) restricts the next action to that card */
        var tmp = []; base().hero(V, st, i, p, tmp); var s = st.x && st.x.sel;
        var f = s ? tmp.filter(function (m) { return m.card === s; }) : tmp;
        Array.prototype.push.apply(out, f.length ? f : tmp);
      },
      onMake: function (V, st, m, n) { base().onMake(V, st, m, n); if (n.x && n.x.sel) n.x = Object.assign({}, n.x, { sel: null }); },
      setup: function (ctx) { var r = run(ctx); close(); ctx.params.hearts = r.hp; base().setup(ctx); r.snapHp = r.hp; },
      onStart: function (ctx) { base().onStart(ctx); hud(ctx); },
      afterMove: function (ctx, m, info) { var v = base().afterMove(ctx, m, info); hud(ctx); return v; },
      onTurn: function (ctx) { hud(ctx); },
      onUndo: function (ctx) { hud(ctx); },
      onGameOver: function (ctx, over) {
        var r = run(ctx), fm = /Floor (\d+)\/(\d+)/.exec(base().status(ctx) || ''), wasLast = !!fm && +fm[1] >= +fm[2];
        base().onGameOver(ctx, over);
        if (over.w === ctx.human) {
          var got = loot(ctx); r.gold += got; r.hp = Math.min(MAXHP, Math.max(1, ctx.state.x.hp || 0));
          ctx.toast('Floor cleared: +' + got + ' gold.', 2400); hud(ctx);
          if (wasLast) { R = null; ctx.params.deck = ctx.params.deck.slice(0, 8); return; }
          ctx.after(1700, function () { shop(ctx); });
        } else { R = null; ctx.params.deck = ctx.params.deck.slice(0, 8); ctx.params.hearts = 3; }
      },
      status: function (ctx) { var r = run(ctx); return base().status(ctx) + '  \u00b7  ' + r.gold + ' gold'; },
      onExit: function (ctx) { close(); ['pb5-hand', 'pb5-loot'].forEach(function (id) { var h = document.getElementById(id); if (h) h.remove(); }); }
    };
  })(),
  vfx_timeline: [{ trigger: 'player_capture', effects: [
    { type: 'overlay', at: 'to', image: 'assets/modes/Kzt9ItpGtYg/splash.png', fit: 'contain', duration_ms: 520 },   /* the pink diagonal slash cut from the video still (tools/g5_art4.py) */
    { type: 'overlay', at: 'to', image: 'assets/modes/Kzt9ItpGtYg/zap.png', fit: 'contain', duration_ms: 380 },   /* the cantrip zap burst (11:43 frame) */
    { type: 'text', text: '1 damage', at: 'to', color: '#ff4d6d', duration_ms: 900 } ] }],
  source: { research: 'research/modes/Kzt9ItpGtYg.json', confidence: 'medium', notes: 'Floor layouts, deck and boss HP invented; monster attack = adjacent to the hero at the end of your turn.' }
});
