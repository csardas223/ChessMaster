/* Can I BEAT Chess Survivors?  A turn-based Vampire-Survivors-style chess roguelike: you move the Joker one square any
   direction, abilities fire on their own, chess-piece enemies swarm the tiled arena. Sources: research/modes/spJibM5qaNQ.json
   (transcript: "our max health base is 350. Our melee damage is 60. We move one square in any direction"; Cribbage "shoots
   pegs in horizontal lines alternating direction"; movement coins (bishop / rook / king coin = queen moves); giant pawns
   carry keys -> golden chests with relics (Amulet of Slapjack -1 cooldown, Queen of Diamonds, Witch's Brew, Mini Magic
   Mushroom = level up twice); XP level-ups: Snow Day (freezes + damages), Bullseye (target around you when you move),
   Nightmare (knight-pattern tiles), +25 damage; Act 1 200 turns, Act 2 150, Act 3 100; Evil Joker boss), frames
   (#c5b9ac/#575758, damage numbers 79/89). Art: Joker, salmon enemy pieces, Evil Joker, peg, bullseye from the stills.
   g6b 2026-11-25: HP and damage, enemy HP (60 per hit), Cribbage, movement coins, XP + level-up picks, giant pawns ->
   chests -> relics, three acts and the Evil Joker. Inferred: acts shortened to 40/30/20 turns (the video's 200/150/100 at a
   fifth), enemy damage values (pawn 20 ... Evil Joker 80), enemy HP, spawn rates, ability numbers. */
CM.mode({
  id: 'spJibM5qaNQ',
  title: 'Can I BEAT Chess Survivors?',
  name: 'Chess Survivors',
  category: 'Variants & Games',
  description: 'You are the Joker (350 HP, 60 melee): step one square any direction; moving into an enemy hits it for your melee damage. Every enemy that could capture you at the end of its move hits you instead. Cribbage fires pegs along your row every second turn, alternating directions. Grab movement coins for a few turns of bishop, rook, queen or knight moves; kills give XP and level-ups; giant pawns drop keys for golden chests. Survive three acts and the Evil Joker.',
  how_to_win: 'Survive Act 1 (40 turns), Act 2 (30) and Act 3 (20).',
  player_side: 'white',
  player: { name: 'Joker', rating: null, avatar: 'assets/modes/spJibM5qaNQ/joker.png' },
  opponent: { name: 'The Horde', rating: null, avatar: 'assets/modes/spJibM5qaNQ/evil_joker.png', tagline: 'Waves of chess pieces and the Evil Joker.' },
  board: { files: 11, ranks: 11, light: '#c5b9ac', dark: '#575758', background: '#1c1b1d' },
  pieces: { /* art-g6: Joker hero + the salmon pixel enemy pieces cut from the video stills (tools/g6_art_pass2.py) */
    J: { name: 'Joker', moves: '', gen: 'joker', value: 2000, royal: true, img: 'assets/modes/spJibM5qaNQ/joker.png' },
    P: { name: 'Pawn', moves: 'mWcF', value: 100, img: { w: 'assets/pieces/cburnett/wP.svg', b: 'assets/modes/spJibM5qaNQ/pawn.png' } },   /* chases in any direction (inferred) */
    Gp: { name: 'Giant pawn', moves: 'mWcF', value: 300, img: 'assets/modes/spJibM5qaNQ/pawn.png', cls: 'cs-giant' },   /* cm-g6b: carries the video's orange key (drawn above it, decorate) */
    N: { img: { w: 'assets/pieces/cburnett/wN.svg', b: 'assets/modes/spJibM5qaNQ/knight.png' } }, B: { img: { w: 'assets/pieces/cburnett/wB.svg', b: 'assets/modes/spJibM5qaNQ/bishop.png' } },
    R: { img: { w: 'assets/pieces/cburnett/wR.svg', b: 'assets/modes/spJibM5qaNQ/rook.png' } }, Q: { img: { w: 'assets/pieces/cburnett/wQ.svg', b: 'assets/modes/spJibM5qaNQ/queen.png' } },
    Ej: { name: 'Evil Joker', moves: 'K', value: 900, img: 'assets/modes/spJibM5qaNQ/evil_joker.png' },
    /* cm-g6b: movement coins = the video's coin (bishop coin cut from maxres3); rook / knight / queen coins re-made from that disc with the
       video's own pixel silhouettes (tools/g6b_surv_art.py). The king coin (queen moves) uses the queen silhouette: no king sprite exists. */
    Mb: { name: 'Bishop coin', moves: '', value: 0, img: 'assets/modes/spJibM5qaNQ/coin_b.png', neutralGlow: false }, Mr: { name: 'Rook coin', moves: '', value: 0, img: 'assets/modes/spJibM5qaNQ/coin_r.png', neutralGlow: false },
    Mq: { name: 'King coin', moves: '', value: 0, img: 'assets/modes/spJibM5qaNQ/coin_q.png', neutralGlow: false }, Mn: { name: 'Knight coin', moves: '', value: 0, img: 'assets/modes/spJibM5qaNQ/coin_n.png', neutralGlow: false }
  },
  setup: { fen: '11/11/2p5p2/11/11/5[J]5/11/11/2p5p2/11/11', x: { hp: 350, max: 350, dmg: 60, xp: 0, lvl: 1, kills: 0, mv: null, abil: {}, relics: [] } },
  rules: { check: 'none', castling: false, enPassant: false, promotion: false, drawPlies: 9999, win: [] },
  bot: { engine: 'search', depth: 1, time_ms: 300 },
  params: { acts: [40, 30, 20] },
  hooks: (function () {
    var HP = { P: 60, Gp: 300, N: 120, B: 120, R: 180, Q: 240, Ej: 1200 }, HIT = { P: 20, Gp: 40, N: 30, B: 30, R: 40, Q: 60, Ej: 80 };
    var COIN = { Mb: 'B', Mr: 'R', Mq: 'Q', Mn: 'N' }, CNAME = { B: 'bishop', R: 'rook', Q: 'queen', N: 'knight' };
    var ABIL = {
      bullseye: { name: 'Bullseye', text: 'A target around you each time you move: 40 damage to every enemy next to where you land.' },
      snow: { name: 'Snow Day', text: 'A blizzard over a random enemy each turn: 30 damage and it is frozen for a turn.' },
      nightmare: { name: 'Nightmare', text: 'Strikes the knight-pattern tiles around you every turn for 50 damage.' },
      dmg: { name: '+25 Damage', text: 'Melee and ability damage +25.' },
      crib: { name: 'Cribbage+', text: 'Cribbage fires both directions.' }
    };
    var RELICS = [
      { id: 'slapjack', name: 'Amulet of Slapjack', text: 'Cribbage fires every turn.' },
      { id: 'diamonds', name: 'Queen of Diamonds', text: '+30% max HP, healed.' },
      { id: 'brew', name: "Witch's Brew", text: 'Heal 150 HP.' },
      { id: 'mushroom', name: 'Mini Magic Mushroom', text: 'Level up twice.' }
    ];
    function X(st) { return st.x || {}; }
    function hpOf(V, p) { return p.hp != null ? p.hp : (HP[p.t] || 60); }
    function acts(V) { return (V.cfg.params && V.cfg.params.acts) || [40, 30, 20]; }
    function actOf(V, ply) { var a = acts(V), t = Math.floor(ply / 2), s = 0; for (var k = 0; k < a.length; k++) { s += a[k]; if (t < s) return { k: k, left: s - t }; } return { k: a.length, left: 0 }; }
    function joker(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'J') return i; return -1; }
    function hitters(V, st, j) {   /* enemies whose capture pattern reaches the Joker */
      var dmg = 0, n = 0;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c !== 'b' || p.frozen) continue; var out = []; V.genPiece(st, i, out, true);
        for (var k = 0; k < out.length; k++) if (out[k].t === j && out[k].cap) { dmg += HIT[p.t] || 20; n++; break; } }
      return { dmg: dmg, n: n };
    }
    var api = {
      joker: function (V, st, i, p, out) {   /* king steps, plus the pattern of a movement coin while it lasts */
        var x = X(st), b = st.b, tmp = [], seen = {};
        var pat = function (t) { var b2 = b.slice(); b2[i] = { t: t, c: 'w', m: 1 }; V.genPiece(Object.assign({}, st, { b: b2 }), i, tmp, true); };
        pat('K'); if (x.mv && x.mv.left > 0) pat(x.mv.t);
        tmp.forEach(function (m) { if (seen[m.t]) return; seen[m.t] = 1; out.push({ f: i, t: m.t, p: 'J', c: 'w', cap: m.cap, capSq: m.capSq }); });
      },
      filterMoves: function (V, st, legal) { if (st.turn !== 'b') return legal; return legal.filter(function (m) { return !(m.cap && m.cap.t === 'J') && !(st.b[m.f] && st.b[m.f].frozen); }); },
      moves: function (V, st, out) {   /* a horde with nothing to do passes */
        if (st.turn !== 'b') return out; var ok = out.filter(function (m) { return !(m.cap && m.cap.t === 'J'); });
        if (ok.length) return out; for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].c === 'b') return out.concat([{ f: i, t: i, p: st.b[i].t, c: 'b', cap: null, pass: 1 }]);
        return out;
      },
      onMake: function (V, st, m, n) {
        var x = n.x = Object.assign({}, n.x);
        if (m.pass) { n.b[m.f] = st.b[m.f]; return; }
        if (st.turn === 'w') {
          if (x.mv) x.mv = x.mv.left > 1 ? { t: x.mv.t, left: x.mv.left - 1 } : null;
          var q = m.cap;
          if (q && COIN[q.t]) { x.mv = { t: COIN[q.t], left: 5 }; x.ev = 'coin:' + COIN[q.t]; }
          else if (q && q.c === 'b') {
            var h = hpOf(V, q) - (x.dmg || 60);
            if (h > 0) { n.b[m.f] = st.b[m.f]; n.b[m.t] = Object.assign({}, q, { hp: h }); x.ev = 'hit:' + m.t; }   /* melee: the Joker stays, the enemy is hurt */
            else { x.kills = (x.kills || 0) + 1; x.xp = (x.xp || 0) + 1; x.ev = 'kill:' + m.t; if (q.t === 'Gp') x.key = 1; if (q.t === 'Ej') x.boss = 2; }
          }
        } else {
          var j = joker(n); if (j < 0) return;
          var hh = hitters(V, n, j); if (hh.dmg) { x.hp = (x.hp || 0) - hh.dmg; x.hit = hh.dmg; } else x.hit = 0;
          for (var f = 0; f < n.b.length; f++) if (n.b[f] && n.b[f].frozen) n.b[f] = Object.assign({}, n.b[f], { frozen: 0 });
        }
      },
      checkWin: function (V, st) {
        var x = X(st); if ((x.hp || 0) <= 0) return { w: 'b', why: 'the Joker ran out of health' };
        if (actOf(V, st.ply).k >= acts(V).length) return { w: 'w', why: 'you survived all three acts' };
        return null;
      },
      evaluate: function (V, st) {
        var x = X(st), j = joker(st), v = (x.hp || 0) * 6; if (j < 0) return -99999;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'b') v -= 20 * Math.max(0, 6 - V.geo.dist(i, j)); }
        return v;
      },
      init: function () { if (!document.getElementById('cs-css')) { var s = document.createElement('style'); s.id = 'cs-css'; s.textContent = '.cs-giant{transform:scale(1.28)}.cs-coin{}'; document.head.appendChild(s); } }
    };
    /* ---- game-side (random) parts: abilities, spawns, level-ups, chests ---- */
    function dmgAt(ctx, i, d, kind) {
      var p = ctx.at(i); if (!p || p.c !== 'b') return false; var h = hpOf(ctx.V, p) - d;
      ctx.fx({ type: 'text', text: String(d), at: ctx.name(i), color: '#ffffff', size: 22, duration_ms: 700 });
      if (h > 0) { ctx.transform(i, { props: { hp: h } }); return false; }
      ctx.remove(i); var x = ctx.state.x; ctx.setX('kills', (x.kills || 0) + 1); ctx.setX('xp', (x.xp || 0) + 1);
      if (p.t === 'Gp') { ctx.setX('key', 1); ctx.fx({ type: 'overlay', image: 'assets/modes/spJibM5qaNQ/key.png', at: ctx.name(i), fit: 'contain', opacity: 1, duration_ms: 900, fade_ms: 300 }); } if (p.t === 'Ej') ctx.setX('boss', 2);
      return true;
    }
    function cribbage(ctx, turn) {
      var x = ctx.state.x, ab = x.abil || {}, every = (x.relics || []).indexOf('slapjack') >= 0 ? 1 : 2; if (turn % every) return;
      var V = ctx.V, g = V.geo, k = joker(ctx.state); if (k < 0) return;
      var dirs = ab.crib ? [1, -1] : [(Math.floor(turn / every) % 2) ? 1 : -1];
      dirs.forEach(function (dir) { var j = k; for (;;) { j = g.step(j, dir, 0); if (j < 0) break; var p = ctx.at(j); if (p && p.c === 'b') {
        ctx.fx({ type: 'overlay', image: 'assets/modes/spJibM5qaNQ/peg.png', fit: 'contain', at: g.name(j), duration_ms: 450, fade_ms: 200 }); dmgAt(ctx, j, x.dmg || 60); break; } } });
    }
    function abilities(ctx, m) {
      var x = ctx.state.x, ab = x.abil || {}, V = ctx.V, g = V.geo, k = joker(ctx.state), d = (x.dmg || 60) - 60; if (k < 0) return;
      if (ab.bullseye) { ctx.fx({ type: 'overlay', image: 'assets/modes/spJibM5qaNQ/bullseye.png', fit: 'contain', at: g.name(k), duration_ms: 500 });
        for (var i = 0; i < ctx.state.b.length; i++) if (g.dist(i, k) === 1) dmgAt(ctx, i, 40 + d); }
      if (ab.nightmare) [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(function (v) { var j = g.step(k, v[0], v[1]); if (j >= 0) { ctx.fx({ type: 'flash', color: '#5b2a86', at: g.name(j), opacity: 0.45, duration_ms: 300 }); dmgAt(ctx, j, 50 + d); } });
      if (ab.snow) { var en = ctx.pieces(function (p) { return p.c === 'b'; }); if (en.length) { var s = ctx.pick(en); ctx.fx({ type: 'flash', color: '#bfe8ff', at: g.name(s), opacity: 0.6, duration_ms: 500 }); if (!dmgAt(ctx, s, 30 + d)) ctx.transform(s, { props: { frozen: 1 } }); } }
    }
    function edgeSquare(ctx) {
      var g = ctx.V.geo, F = g.files, Rr = g.ranks, list = ctx.emptySquares().filter(function (i) { var c = g.col(i), r = g.row(i); return c === 0 || r === 0 || c === F - 1 || r === Rr - 1; });
      return list.length ? ctx.pick(list) : -1;
    }
    function spawns(ctx, turn) {
      var a = actOf(ctx.V, ctx.ply), pool = [['P'], ['P', 'P', 'B', 'N'], ['P', 'B', 'N', 'R', 'Q']][Math.min(a.k, 2)];
      var count = 1 + (turn % 3 === 0 ? 1 : 0) + a.k;
      for (var c = 0; c < count; c++) { var s = edgeSquare(ctx); if (s >= 0) ctx.spawn(ctx.pick(pool), 'b', s); }
      if (turn % 12 === 6) { var s2 = edgeSquare(ctx); if (s2 >= 0) { ctx.spawn('Gp', 'b', s2); ctx.toast('A giant pawn carrying a key!', 1600); } }
      if (turn % 9 === 4) { var e = ctx.emptySquares(); if (e.length) ctx.spawn(ctx.pick(['Mb', 'Mr', 'Mq', 'Mn']), 'n', ctx.pick(e)); }
    }
    function pickOverlay(ctx, title, items, cb) {
      var wrap = document.getElementById('board-wrap'); if (!wrap) { cb(items[0]); return; } var old = document.getElementById('cs-pick'); if (old) old.remove();
      var el = document.createElement('div'); el.id = 'cs-pick';
      el.style.cssText = 'position:absolute;inset:0;z-index:30;background:rgba(28,27,29,.94);padding:12px;display:flex;flex-direction:column;gap:8px;justify-content:center;color:#fff;font:14px/1.3 system-ui,sans-serif';
      el.innerHTML = '<b style="font-size:18px;text-align:center">' + title + '</b>' + items.map(function (it, k) { return '<button type="button" class="btn" data-k="' + k + '" style="flex-direction:column;align-items:flex-start;padding:10px;background:#3a3438;text-align:left"><b>' + it.name + '</b><small>' + it.text + '</small></button>'; }).join('');
      el.onclick = function (e) { var b = e.target.closest('[data-k]'); if (!b) return; el.remove(); cb(items[+b.dataset.k]); };
      wrap.appendChild(el);
    }
    function levelUp(ctx, done) {
      var ab = ctx.state.x.abil || {}, keys = Object.keys(ABIL).filter(function (k) { return k === 'dmg' || !ab[k]; }), offer = [];
      while (keys.length && offer.length < 3) offer.push(keys.splice(ctx.random(keys.length), 1)[0]);
      pickOverlay(ctx, 'Level up! Pick an ability', offer.map(function (k) { return Object.assign({ id: k }, ABIL[k]); }), function (it) {
        var a2 = Object.assign({}, ctx.state.x.abil); if (it.id === 'dmg') ctx.setX('dmg', (ctx.state.x.dmg || 60) + 25); else a2[it.id] = 1;
        ctx.setX('abil', a2); ctx.sound('promote'); done();
      });
    }
    function chest(ctx, done) {
      var have = ctx.state.x.relics || [], left = RELICS.filter(function (r) { return have.indexOf(r.id) < 0; }), offer = [];
      while (left.length && offer.length < 2) offer.push(left.splice(ctx.random(left.length), 1)[0]);
      if (!offer.length) { done(); return; }
      pickOverlay(ctx, 'Golden chest! Pick a relic', offer, function (r) {
        var x = ctx.state.x; ctx.setX('relics', have.concat([r.id]));
        if (r.id === 'diamonds') { var mx = Math.round((x.max || 350) * 1.3); ctx.setX('max', mx); ctx.setX('hp', mx); }
        if (r.id === 'brew') ctx.setX('hp', Math.min(x.max || 350, (x.hp || 0) + 150));
        if (r.id === 'mushroom') { ctx.setX('lvl', (x.lvl || 1) + 1); levelUp(ctx, function () { ctx.setX('lvl', (ctx.state.x.lvl || 1) + 1); levelUp(ctx, done); }); return; }
        done();
      });
    }
    api.afterMove = function (ctx, m, info) {
      if (ctx.over || !info) return null; var x = ctx.state.x, V = ctx.V;
      if (info.by === 'player') {
        var ev = x.ev || ''; ctx.setX('ev', null);
        if (ev.indexOf('coin:') === 0) ctx.toast('Movement coin: you move like a ' + CNAME[ev.slice(5)] + ' for 5 turns.', 2000);
        if (ev.indexOf('hit:') === 0) ctx.fx({ type: 'text', text: String(x.dmg || 60), at: ctx.name(+ev.slice(4)), color: '#ffffff', size: 22, duration_ms: 700 });
        var turn = Math.ceil(info.ply / 2); cribbage(ctx, turn); abilities(ctx, m);
        var steps = [];
        if (ctx.state.x.key) { ctx.setX('key', 0); steps.push(chest); }
        var need = (ctx.state.x.lvl || 1) * 4; if ((ctx.state.x.xp || 0) >= need) { ctx.setX('xp', ctx.state.x.xp - need); ctx.setX('lvl', (ctx.state.x.lvl || 1) + 1); steps.push(levelUp); }
        if (ctx.state.x.boss === 2) { ctx.setX('boss', 3); ctx.toast('The Evil Joker is down!', 2400); }
        ctx.refresh();
        if (!steps.length) return null;
        return new Promise(function (res) { var run = function () { var f = steps.shift(); if (!f) { ctx.refresh(); res(); return; } f(ctx, run); }; run(); });
      }
      /* horde turn: damage numbers, then spawns */
      if (x.hit) { var k = joker(ctx.state); ctx.fx({ type: 'text', text: '-' + x.hit, at: k >= 0 ? ctx.name(k) : 'board', color: '#ff5a5a', size: 26, duration_ms: 800 }); ctx.fx({ type: 'flash', color: '#ff0000', opacity: 0.18, duration_ms: 200 }); }
      var turn2 = Math.ceil(info.ply / 2), a = actOf(V, ctx.ply);
      if (a.k !== (x.act || 0)) { ctx.setX('act', a.k); if (a.k < acts(V).length) ctx.toast('Act ' + (a.k + 1) + ' begins: ' + acts(V)[a.k] + ' turns.', 2600); }
      if (a.k === 2 && !x.boss) { var s = edgeSquare(ctx); if (s >= 0) { ctx.spawn('Ej', 'b', s); ctx.setX('boss', 1); ctx.fx({ type: 'overlay', image: 'assets/modes/spJibM5qaNQ/evil_joker.png', fit: 'contain', at: 'board', opacity: 0.85, duration_ms: 1400, fade_ms: 300 }); ctx.toast('The Evil Joker arrives!', 2400); } }
      spawns(ctx, turn2); ctx.refresh();
      return null;
    };
    api.decorate = function (ctx, sq, p) { if (p && p.t === 'Gp') return { badge: p.hp != null ? String(p.hp) : null, html: '<img class="sq-label" alt="key" src="assets/modes/spJibM5qaNQ/key.png" style="position:absolute;left:30%;top:-6%;width:40%;image-rendering:pixelated;pointer-events:none;z-index:3">' }; if (p && p.c === 'b' && p.hp != null) return { badge: String(p.hp) }; if (p && p.frozen) return { cls: 'cs-frozen' }; return null; };
    api.status = function (ctx) {
      var x = ctx.state.x || {}, a = actOf(ctx.V, ctx.ply), ab = Object.keys(x.abil || {}).map(function (k) { return ABIL[k].name; });
      return 'HP ' + Math.max(0, x.hp || 0) + '/' + (x.max || 350) + ' \u00b7 Act ' + Math.min(a.k + 1, 3) + ' (' + a.left + ' turns left) \u00b7 Lv ' + (x.lvl || 1) + ' \u00b7 kills ' + (x.kills || 0) + (x.mv ? ' \u00b7 ' + CNAME[x.mv.t] + ' coin ' + x.mv.left : '') + (ab.length ? ' \u00b7 ' + ab.join(', ') : '');
    };
    api.onExit = function () { var e = document.getElementById('cs-pick'); if (e) e.remove(); };
    return api;
  })(),
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/spJibM5qaNQ/title.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  todo_pass2: ['the full act lengths (200/150/100 turns) as an option and the optional turn timer', 'more characters (tiny wizard, cat), Bubbles ability, wandering bot companion, endless mode'],
  source: { research: 'research/modes/spJibM5qaNQ.json', confidence: 'medium', notes: 'Act lengths shortened; damage, HP and spawn numbers inferred. cm-g6b art: coin + key cut from the stills (maxres3); rook/knight/queen coins re-made from the coin disc + the video pixel silhouettes; the golden chest is not on any repo still (maxres1-3, maxresdefault, 3 sprites) and the id has sprites, so no YouTube still: the chest stays a pick panel.' }
});
