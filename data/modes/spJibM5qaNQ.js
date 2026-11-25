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
   fifth), enemy damage values (pawn 20 ... Evil Joker 80), enemy HP, spawn rates, ability numbers.
   surv2 2026-11-25 (pass 2, transcript + new paused 1080p frames 0:38 / 3:29 / 7:52 / 22:06, tools/surv2_art.py): a run-settings
   bar above the board like the game's Run settings + Character select: act lengths Short (40/30/20) / Full (the video's
   200/150/100) / Endless ("there's also an endless mode", 22:15); the optional turn timer ("if I don't do anything, the turn
   ends", 0:50: the green dashed ring around the hero at 0:38, it drains and the turn passes); a Wait button ("Skip this turn",
   9:50); characters Joker / Tiny Wizard / Cat, unlocked by surviving a run as at 22:06 (Wizard tooltip from that frame: +1
   bonus number of projectiles, -1 movement coin turn duration); Bubbles level-up ("blow bubbles at nearby enemy, dealing damage
   to any enemies they collide with", 6:50; three bubbles in the 7:52 frame); the Wandering Bot relic ("for the rest of the
   game, a friendly creature will wander around you dealing damage to enemies it collides with", 3:00; "it does 39 damage",
   12:30) and the Immunity Idol relic (10:20); act-start relic reward ("claim the reward before you move on", 10:15) and act
   modifiers (Act 2: +100% enemy health, +33% elite health, 10:05). Inferred: timer length 5 s, Wizard/Cat HP, melee and
   starting ability (Wizard starts with Bubbles, Cat with the Wandering Bot), bubble damage 35 every 2nd turn, bot range 3,
   act-3/endless health scaling. */
CM.mode({
  id: 'spJibM5qaNQ',
  title: 'Can I BEAT Chess Survivors?',
  name: 'Chess Survivors',
  category: 'Variants & Games',
  description: 'You are the Joker (350 HP, 60 melee): step one square any direction; moving into an enemy hits it for your melee damage. Every enemy that could capture you at the end of its move hits you instead. Cribbage fires pegs along your row every second turn, alternating directions. Grab movement coins for a few turns of bishop, rook, queen or knight moves; kills give XP and level-ups; giant pawns drop keys for golden chests. Survive three acts and the Evil Joker. The bar above the board sets act lengths (short, the full 200/150/100, or endless), the turn timer and your character (Tiny Wizard and Cat unlock when you survive a run); Wait skips a turn.',
  how_to_win: 'Survive Act 1, Act 2 and Act 3 (40/30/20 turns, or 200/150/100 on Full); Endless runs until you fall.',
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
    /* surv2: run settings (persisted), characters, act lengths */
    var ACTS = { short: [40, 30, 20], full: [200, 150, 100], endless: [40, 30, 20] };
    var CHARS = {
      J: { name: 'Joker', img: 'assets/modes/spJibM5qaNQ/joker.png', hp: 350, dmg: 60, start: 'cribbage', coin: 5, proj: 0, text: '350 HP, 60 melee, Cribbage' },
      W: { name: 'Tiny Wizard', img: 'assets/modes/spJibM5qaNQ/wizard.png', hp: 300, dmg: 45, start: 'bubbles', coin: 4, proj: 1, text: '+1 projectile, -1 coin turn, Bubbles' },
      C: { name: 'Cat', img: 'assets/modes/spJibM5qaNQ/cat.png', hp: 320, dmg: 50, start: 'bot', coin: 5, proj: 0, text: 'starts with the Wandering Bot' }
    };
    var TIMER_S = 5;
    function cfg() { var c = CM.store.get('surv.cfg', null) || {}; return { acts: ACTS[c.acts] ? c.acts : 'short', timer: !!c.timer, ch: CHARS[c.ch] ? c.ch : 'J' }; }
    function unlocked() { return !!CM.store.get('surv.unlocked', 0); }
    var COIN = { Mb: 'B', Mr: 'R', Mq: 'Q', Mn: 'N' }, CNAME = { B: 'bishop', R: 'rook', Q: 'queen', N: 'knight' };
    var ABIL = {
      bullseye: { name: 'Bullseye', text: 'A target around you each time you move: 40 damage to every enemy next to where you land.' },
      snow: { name: 'Snow Day', text: 'A blizzard over a random enemy each turn: 30 damage and it is frozen for a turn.' },
      nightmare: { name: 'Nightmare', text: 'Strikes the knight-pattern tiles around you every turn for 50 damage.' },
      dmg: { name: '+25 Damage', text: 'Melee and ability damage +25.' },
      crib: { name: 'Cribbage+', text: 'Cribbage fires both directions.' },
      bubbles: { name: 'Bubbles', text: 'Blow bubbles at nearby enemies every second turn, 35 damage to each enemy they hit.' }
    };
    var RELICS = [
      { id: 'slapjack', name: 'Amulet of Slapjack', text: 'Cribbage fires every turn.' },
      { id: 'diamonds', name: 'Queen of Diamonds', text: '+30% max HP, healed.' },
      { id: 'brew', name: "Witch's Brew", text: 'Heal 150 HP.' },
      { id: 'mushroom', name: 'Mini Magic Mushroom', text: 'Level up twice.' },
      { id: 'bot', name: 'Wandering Bot', text: 'For the rest of the game a friendly bot wanders around you, hitting enemies it bumps into (39 damage).' },
      { id: 'idol', name: 'Immunity Idol', text: 'When you would die, heal to 50% of your max HP instead (once).' }
    ];
    function X(st) { return st.x || {}; }
    function hpOf(V, p) { return p.hp != null ? p.hp : (HP[p.t] || 60); }
    function acts(V, st) { return (st && st.x && st.x.acts) || (V.cfg.params && V.cfg.params.acts) || [40, 30, 20]; }
    function actOf(V, st) { var a = acts(V, st), t = Math.floor(st.ply / 2), s = 0; for (var k = 0; k < a.length; k++) { s += a[k]; if (t < s) return { k: k, left: s - t }; } return { k: a.length, left: 0, over: t - s }; }
    function hpMul(k, x) { return k <= 0 ? 1 : k === 1 ? 2 : k === 2 ? 3 : 3 + Math.floor(((x && x.endlessT) || 0) / 50); }
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
        if (m.pass) { n.b[m.f] = st.b[m.f]; if (st.turn === 'w' && x.mv) x.mv = x.mv.left > 1 ? { t: x.mv.t, left: x.mv.left - 1 } : null; if (st.turn === 'w') return; }
        if (st.turn === 'w') {
          if (x.mv) x.mv = x.mv.left > 1 ? { t: x.mv.t, left: x.mv.left - 1 } : null;
          var q = m.cap;
          if (q && COIN[q.t]) { x.mv = { t: COIN[q.t], left: x.coinT || 5 }; x.ev = 'coin:' + COIN[q.t]; }
          else if (q && q.c === 'b') {
            var h = hpOf(V, q) - (x.dmg || 60);
            if (h > 0) { n.b[m.f] = st.b[m.f]; n.b[m.t] = Object.assign({}, q, { hp: h }); x.ev = 'hit:' + m.t; }   /* melee: the Joker stays, the enemy is hurt */
            else { x.kills = (x.kills || 0) + 1; x.xp = (x.xp || 0) + 1; x.ev = 'kill:' + m.t; if (q.t === 'Gp') x.key = 1; if (q.t === 'Ej') x.boss = 2; }
          }
        } else {
          var j = joker(n); if (j < 0) return;
          var hh = hitters(V, n, j); if (hh.dmg) { x.hp = (x.hp || 0) - hh.dmg; x.hit = hh.dmg; } else x.hit = 0;
          if (x.hp <= 0 && (x.relics || []).indexOf('idol') >= 0 && !x.idolUsed) { x.hp = Math.round((x.max || 350) / 2); x.idolUsed = 1; x.ev = 'idol'; }   /* surv2: Immunity Idol */
          for (var f = 0; f < n.b.length; f++) if (n.b[f] && n.b[f].frozen) n.b[f] = Object.assign({}, n.b[f], { frozen: 0 });
        }
      },
      checkWin: function (V, st) {
        var x = X(st); if ((x.hp || 0) <= 0) return { w: 'b', why: (x.cname || 'the Joker') + ' ran out of health after ' + Math.floor(st.ply / 2) + ' turns' + (x.endless ? ' (endless mode)' : '') };
        if (!x.endless && actOf(V, st).k >= acts(V, st).length) return { w: 'w', why: 'you survived all three acts' };
        return null;
      },
      evaluate: function (V, st) {
        var x = X(st), j = joker(st), v = (x.hp || 0) * 6; if (j < 0) return -99999;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'b') v -= 20 * Math.max(0, 6 - V.geo.dist(i, j)); }
        return v;
      },
      init: function () { if (!document.getElementById('cs-css')) { var s = document.createElement('style'); s.id = 'cs-css'; s.textContent = '.cs-giant{transform:scale(1.28)}.cs-coin{}' +
        '.cs-bar{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin:2px 0 4px}.cs-bar button{border:0;border-radius:6px;background:#3a3438;color:#fff;font:600 12px/1.1 system-ui,sans-serif;padding:6px 9px;cursor:pointer;display:inline-flex;align-items:center;gap:4px}' +
        '.cs-bar button.on{background:#81b64c;color:#111}.cs-bar img{width:18px;height:18px;image-rendering:pixelated}.cs-bar button[aria-disabled=true]{opacity:.45}' +
        '.cs-ring{position:absolute;inset:-4%;width:108%;height:108%;pointer-events:none;z-index:4}.cs-ring line{stroke:#3fdc4a;stroke-width:3;stroke-linecap:butt}' +
        '.cs-bot{position:absolute;left:14%;top:14%;width:72%;height:72%;image-rendering:pixelated;pointer-events:none;z-index:3}' +
        '.cs-frozen .pc{filter:saturate(.4) brightness(1.15) hue-rotate(160deg)}'; document.head.appendChild(s); } }
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
      if (x.start && x.start !== 'cribbage' && !ab.crib) return;   /* surv2: Cribbage is the Joker's starting ability */
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
    /* surv2: Bubbles: nearby enemies (within 4) get a bubble each, nearest first; 3 bubbles (+1 per bonus projectile) */
    function bubbles(ctx, turn) {
      var x = ctx.state.x, ab = x.abil || {}; if (!ab.bubbles || turn % ((x.relics || []).indexOf('slapjack') >= 0 ? 1 : 2)) return;
      var g = ctx.V.geo, k = joker(ctx.state); if (k < 0) return;
      var en = ctx.pieces(function (p, i) { return p.c === 'b' && g.dist(i, k) <= 4; }).sort(function (a, b) { return g.dist(a, k) - g.dist(b, k); });
      en.slice(0, 3 + (x.proj || 0)).forEach(function (i, n) {
        ctx.fx({ type: 'overlay', image: 'assets/modes/spJibM5qaNQ/bubble.png', fit: 'contain', at: g.name(i), opacity: 0.95, duration_ms: 420, fade_ms: 220, delay_ms: n * 80 });
        dmgAt(ctx, i, 35 + (x.dmg || 60) - 60);
      });
    }
    /* surv2: the Wandering Bot (relic): wanders within 3 squares of you; bumping into an enemy hits it for 39 (+ ability bonus) */
    function wanderBot(ctx) {
      var x = ctx.state.x; if ((x.relics || []).indexOf('bot') < 0) return;
      var g = ctx.V.geo, k = joker(ctx.state); if (k < 0) return;
      var b = x.bot; if (b == null || b < 0 || ctx.state.b[b] || g.dist(b, k) > 4) {
        var near = ctx.emptySquares(function (i) { return g.dist(i, k) === 1; }); b = near.length ? ctx.pick(near) : -1; ctx.setX('bot', b); return;
      }
      var steps = []; for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(b, dc, dr); if (j >= 0 && j !== k && g.dist(j, k) <= 3) steps.push(j); }
      var foes = steps.filter(function (j) { var p = ctx.at(j); return p && p.c === 'b'; });
      if (foes.length) { var f = ctx.pick(foes); ctx.fx({ type: 'flash', color: '#ffa13d', at: g.name(f), opacity: 0.45, duration_ms: 260 }); dmgAt(ctx, f, 39 + (x.dmg || 60) - 60); return; }
      var free = steps.filter(function (j) { return !ctx.at(j); }); if (!free.length) return;
      var en = ctx.pieces(function (p) { return p.c === 'b'; });
      var score = function (j) { var d = 99; en.forEach(function (i) { d = Math.min(d, g.dist(i, j)); }); return d; };
      free.sort(function (a, c) { return score(a) - score(c); });
      ctx.setX('bot', ctx.chance(0.7) ? free[0] : ctx.pick(free));
    }
    function edgeSquare(ctx) {
      var g = ctx.V.geo, F = g.files, Rr = g.ranks, list = ctx.emptySquares().filter(function (i) { var c = g.col(i), r = g.row(i); return c === 0 || r === 0 || c === F - 1 || r === Rr - 1; });
      return list.length ? ctx.pick(list) : -1;
    }
    function spawns(ctx, turn) {
      var a = actOf(ctx.V, ctx.state), pool = [['P'], ['P', 'P', 'B', 'N'], ['P', 'B', 'N', 'R', 'Q']][Math.min(a.k, 2)], x = ctx.state.x;
      var count = 1 + (turn % 3 === 0 ? 1 : 0) + Math.min(a.k, 2) + (a.k >= 3 ? Math.floor((x.endlessT || 0) / 40) : 0), mul = hpMul(a.k, x);
      for (var c = 0; c < count; c++) { var s = edgeSquare(ctx); if (s >= 0) { var t = ctx.pick(pool); ctx.spawn(t, 'b', s, mul > 1 ? { hp: HP[t] * mul } : null); } }
      if (turn % 12 === 6) { var s2 = edgeSquare(ctx); if (s2 >= 0) { ctx.spawn('Gp', 'b', s2, a.k ? { hp: Math.round(HP.Gp * (1 + 0.33 * a.k)) } : null); ctx.toast('A giant pawn carrying a key!', 1600); } }
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
      /* art-g6b: the video's golden chest + white down-arrow marker (20:15 frame, tools/g6b_chest_art.py) */
      pickOverlay(ctx, '<span style="display:flex;flex-direction:column;align-items:center;gap:2px"><img alt="" src="assets/modes/spJibM5qaNQ/chest_arrow.png" style="width:26px;image-rendering:pixelated"><img alt="Golden chest" src="assets/modes/spJibM5qaNQ/chest.png" style="width:72px;image-rendering:pixelated">Golden chest! Pick a relic</span>', offer, function (r) {
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
        if (ev === 'idol') ctx.toast('Immunity Idol: back to half health!', 2200);
        var turn = Math.ceil(info.ply / 2); cribbage(ctx, turn); abilities(ctx, m); bubbles(ctx, turn); wanderBot(ctx);
        var steps = [];
        if (ctx.state.x.key) { ctx.setX('key', 0); steps.push(chest); }
        var need = (ctx.state.x.lvl || 1) * 4; if ((ctx.state.x.xp || 0) >= need) { ctx.setX('xp', ctx.state.x.xp - need); ctx.setX('lvl', (ctx.state.x.lvl || 1) + 1); steps.push(levelUp); }
        if (ctx.state.x.boss === 2) { ctx.setX('boss', 3); ctx.toast('The Evil Joker is down!', 2400); }
        if (ctx.state.x.actReward) { ctx.setX('actReward', 0); steps.unshift(chest); }   /* "claim the reward before you move on" */
        ctx.refresh();
        if (!steps.length) return null;
        return new Promise(function (res) { var run = function () { var f = steps.shift(); if (!f) { ctx.refresh(); res(); return; } f(ctx, run); }; run(); });
      }
      /* horde turn: damage numbers, then spawns */
      if (x.hit) { var k = joker(ctx.state); ctx.fx({ type: 'text', text: '-' + x.hit, at: k >= 0 ? ctx.name(k) : 'board', color: '#ff5a5a', size: 26, duration_ms: 800 }); ctx.fx({ type: 'flash', color: '#ff0000', opacity: 0.18, duration_ms: 200 }); }
      if (x.ev === 'idol') { ctx.setX('ev', null); ctx.toast('Immunity Idol: back to half health!', 2200); }
      var turn2 = Math.ceil(info.ply / 2), a = actOf(V, ctx.state), AL = acts(V, ctx.state);
      if (a.k >= AL.length) ctx.setX('endlessT', a.over || 0);
      if (a.k !== (x.act || 0)) { ctx.setX('act', a.k); ctx.setX('actReward', 1);
        if (a.k < AL.length) ctx.toast('Act ' + (a.k + 1) + ' begins: ' + AL[a.k] + ' turns. Enemy health x' + hpMul(a.k, x) + '.', 2800); else ctx.toast('Endless mode: survive as long as you can.', 2600); }
      if (a.k === 2 && !x.boss) { var s = edgeSquare(ctx); if (s >= 0) { ctx.spawn('Ej', 'b', s); ctx.setX('boss', 1); ctx.fx({ type: 'overlay', image: 'assets/modes/spJibM5qaNQ/evil_joker.png', fit: 'contain', at: 'board', opacity: 0.85, duration_ms: 1400, fade_ms: 300 }); ctx.toast('The Evil Joker arrives!', 2400); } }
      spawns(ctx, turn2); ctx.refresh();
      return null;
    };
    api.decorate = function (ctx, sq, p) {
      var x = ctx.state.x || {}, o = null;
      if (p && p.t === 'Gp') o = { badge: p.hp != null ? String(p.hp) : null, html: '<img class="sq-label" alt="key" src="assets/modes/spJibM5qaNQ/key.png" style="position:absolute;left:30%;top:-6%;width:40%;image-rendering:pixelated;pointer-events:none;z-index:3">' };
      else if (p && p.c === 'b' && p.hp != null) o = { badge: String(p.hp) };
      if (p && p.frozen) { o = o || {}; o.cls = 'cs-frozen'; }
      if (!p && x.bot === sq) { o = o || {}; o.html = (o.html || '') + '<img class="cs-bot" alt="Wandering bot" src="assets/modes/spJibM5qaNQ/bot.png">'; }
      if (p && p.t === 'J' && x.timer) {   /* the video's green dashed turn-timer ring (0:38 frame) */
        var h = '<svg class="cs-ring" id="cs-ring" viewBox="0 0 40 40" aria-hidden="true">';
        for (var k = 0; k < 24; k++) { var a0 = (k / 24) * Math.PI * 2 - Math.PI / 2, a1 = a0 + Math.PI * 2 / 24 * 0.55;
          h += '<line x1="' + (20 + 17 * Math.cos(a0)).toFixed(2) + '" y1="' + (20 + 17 * Math.sin(a0)).toFixed(2) + '" x2="' + (20 + 17 * Math.cos(a1)).toFixed(2) + '" y2="' + (20 + 17 * Math.sin(a1)).toFixed(2) + '"/>'; }
        o = o || {}; o.html = (o.html || '') + h + '</svg>';
      }
      return o;
    };
    api.status = function (ctx) {
      var x = ctx.state.x || {}, a = actOf(ctx.V, ctx.state), AL = acts(ctx.V, ctx.state), ab = Object.keys(x.abil || {}).map(function (k) { return ABIL[k] ? ABIL[k].name : k; });
      var act = a.k < AL.length ? 'Act ' + (a.k + 1) + ' (' + a.left + ' turns left)' : 'Endless \u00b7 turn ' + Math.floor(ctx.ply / 2);
      return (x.cname || 'Joker') + ' \u00b7 HP ' + Math.max(0, x.hp || 0) + '/' + (x.max || 350) + ' \u00b7 ' + act + ' \u00b7 Lv ' + (x.lvl || 1) + ' \u00b7 kills ' + (x.kills || 0) + (x.mv ? ' \u00b7 ' + CNAME[x.mv.t] + ' coin ' + x.mv.left : '') + (ab.length ? ' \u00b7 ' + ab.join(', ') : '') + ((x.relics || []).length ? ' \u00b7 relics ' + x.relics.length : '');
    };
    /* ---- surv2: run settings bar, character setup, turn timer, Wait ---- */
    function waitTurn(ctx) {
      var G = ctx.game; if (!G || G.over || G.busy || ctx.state.turn !== 'w' || document.getElementById('cs-pick')) return;
      var k = joker(ctx.state); if (k < 0) return;
      G.commit({ f: k, t: k, p: 'J', c: 'w', cap: null, pass: 1 }, {});
    }
    function bar(ctx) {
      var old = document.querySelector('.cs-bar'); if (old) old.remove();
      var area = document.getElementById('board-area'); if (!area || !area.parentNode) return;
      var c = cfg(), un = unlocked(), el = document.createElement('div'); el.className = 'cs-bar'; el.setAttribute('role', 'toolbar'); el.setAttribute('aria-label', 'Run settings');
      var ch = CHARS[c.ch];
      el.innerHTML = '<button type="button" data-a="acts">Acts: ' + ({ short: 'Short', full: 'Full 200/150/100', endless: 'Endless' })[c.acts] + '</button>' +
        '<button type="button" data-a="timer" class="' + (c.timer ? 'on' : '') + '" aria-pressed="' + c.timer + '">Turn timer: ' + (c.timer ? TIMER_S + ' s' : 'off') + '</button>' +
        '<button type="button" data-a="ch"><img alt="" src="' + ch.img + '">' + ch.name + '</button>' +
        '<button type="button" data-a="wait">Wait</button>';
      el.onclick = function (e) {
        var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a, n = cfg();
        if (a === 'wait') { waitTurn(ctx); return; }
        if (a === 'acts') n.acts = n.acts === 'short' ? 'full' : n.acts === 'full' ? 'endless' : 'short';
        if (a === 'timer') n.timer = !n.timer;
        if (a === 'ch') {
          if (!unlocked()) { ctx.toast('Survive a run to unlock the Tiny Wizard and the Cat.', 2400); return; }
          var order = ['J', 'W', 'C']; n.ch = order[(order.indexOf(n.ch) + 1) % 3];
        }
        CM.store.set('surv.cfg', n); ctx.game.newGame();
        if (a === 'ch') ctx.toast(CHARS[n.ch].name + ': ' + CHARS[n.ch].text + '.', 2400);
      };
      void un; area.parentNode.insertBefore(el, area);
    }
    api.setup = function (ctx) {
      var c = cfg(), ch = CHARS[c.ch], k = joker(ctx.state);
      ctx.setX('acts', ACTS[c.acts]); ctx.setX('endless', c.acts === 'endless' ? 1 : 0); ctx.setX('timer', c.timer ? TIMER_S : 0);
      ctx.setX('hp', ch.hp); ctx.setX('max', ch.hp); ctx.setX('dmg', ch.dmg); ctx.setX('cname', ch.name); ctx.setX('coinT', ch.coin); ctx.setX('proj', ch.proj);
      ctx.setX('start', ch.start); ctx.setX('abil', ch.start === 'bubbles' ? { bubbles: 1 } : {}); ctx.setX('relics', ch.start === 'bot' ? ['bot'] : []); ctx.setX('bot', -1);
      if (k >= 0) ctx.transform(k, { props: { img: ch.img } });
      ctx.spec.player.name = ch.name; ctx.spec.player.avatar = ch.img;
      TM.ply = -1;
    };
    api.onStart = function (ctx) { bar(ctx); if (ctx.state.x.start === 'bot') wanderBot(ctx); ctx.refresh(); };
    var TM = { ply: -1, start: 0 };
    api.onTick = function (ctx, now) {
      var x = ctx.state.x || {}, G = ctx.game; if (!x.timer) return;
      var ring = document.getElementById('cs-ring');
      if (!G || G.busy || ctx.state.turn !== 'w' || document.getElementById('cs-pick')) { TM.ply = -1; return; }
      if (TM.ply !== ctx.ply) { TM.ply = ctx.ply; TM.start = now; }
      var f = 1 - (now - TM.start) / (x.timer * 1000);
      if (ring) { var ls = ring.querySelectorAll('line'), on = Math.ceil(Math.max(0, f) * ls.length); for (var i = 0; i < ls.length; i++) ls[i].style.opacity = i < on ? '1' : '0'; }
      if (f <= 0) { TM.ply = -2; waitTurn(ctx); }
    };
    api.onGameOver = function (ctx, res) {
      if (res && res.w === 'w') { if (!unlocked()) { CM.store.set('surv.unlocked', 1); ctx.toast('Unlocked: the Tiny Wizard and the Cat!', 3000); } }
      var x = ctx.state.x || {}; if (x.endless) { var best = CM.store.get('surv.bestEndless', 0), t = Math.floor(ctx.ply / 2); if (t > best) CM.store.set('surv.bestEndless', t); }
    };
    api.onExit = function () { var e = document.getElementById('cs-pick'); if (e) e.remove(); var b = document.querySelector('.cs-bar'); if (b) b.remove(); };
    return api;
  })(),
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/spJibM5qaNQ/title.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/spJibM5qaNQ.json', confidence: 'medium', notes: 'surv2 (pass 2): run-settings bar (Short 40/30/20 default, Full = the video 200/150/100, Endless), optional 5 s turn timer (green dashed ring from the 0:38 frame; length inferred), Wait, characters Joker / Tiny Wizard / Cat unlocked by surviving a run (art cut from the 22:06 Unlocks frame, spJibM5qaNQ_frame_1326; the cursor over the wizard robe hem was painted out, inferred pixels), Wizard stats from its tooltip (+1 projectile, -1 coin turn) with HP/melee/start ability inferred, Cat entirely inferred (starts with the Wandering Bot), Bubbles + Wandering Bot (bot cut and bubble redrawn from the 7:52 frame, spJibM5qaNQ_frame_472; bot damage 39 from the transcript 12:30), Immunity Idol, act-start relic reward and act health multipliers (Act 2 from 10:05; Act 3 / endless inferred). Earlier: Act lengths shortened; damage, HP and spawn numbers inferred. cm-g6b art: coin + key cut from the stills (maxres3); rook/knight/queen coins re-made from the coin disc + the video pixel silhouettes; art-g6b: the golden chest + its white arrow marker cut from the 20:15 frame (video_thumbs/spJibM5qaNQ_frame_1215), shown on the relic pick panel.' }
});
