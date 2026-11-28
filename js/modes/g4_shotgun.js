/* g4_shotgun: Shotgun King: The Final Checkmate (group 4: AvZiSnngZjA, 9j7h5kF4X9s "RANK 4").
   You are the lone black King with a shotgun; the white army is led by the White King. Each turn either step one
   square (onto an empty square only: the King cannot capture by moving) or fire: tap any white piece within range to
   shoot a cone of pellets toward it. Every white piece inside the cone (up to params.range squares, about 27 degrees
   either side of the aim) takes damage: firepower at distance 1-2, firepower - 1 further out (min 1). Pieces have HP
   (pawn 1, knight/bishop 2, rook 3, queen 4, king 4). A shot uses one shell; a step reloads one shell.
   White moves one piece per turn by normal chess rules and captures you if you end a turn on a square it attacks
   (threatened squares next to you are marked "!"). Kill the White King to clear the floor; floors get bigger armies;
   after each floor you get an upgrade card and White gets a curse card. Clear params.floors floors to win the run.
   State x: { sh: shells, max: max shells, fp: firepower, rg: range, arc: firing arc in degrees, floor }.  Rule hooks are
   deterministic.
   PASS 2 (impl-4, 8th session; art from the stills via tools/g4_pass2.py): the player's king is the game's navy pixel king
   (tutorial still), the board keeps the game's cream/lavender tiles, floors have holes (navy gaps, more on later floors)
   as in the FLOOR 6 still, the side panel copies the game's HUD (shotgun + red shells row, FLOOR counter, POWER / RANGE /
   F.ARC stats; the stills show F.ARC 55 and 44 degrees) and its two card columns (left: your cards, right: the white
   army's curse cards) with the card faces cut from the stills. After each floor a draft overlay offers 2 of your card
   faces + shows the curse White draws. The card faces' effects are inferred (the stills show only the art). While the
   king is selected, hovering a target paints the red aim cone; every shot flashes the cone and a muzzle flash.
   White army sprites are not visible in any still: they keep the standard set. Sounds are the app's own.
   VIDEO CARDS (cm_acc 2026-11-26, params.cardSet: 'rank3', NK4Upb_s8Ok): the draft offers the card pairs the Rank 3 video
   reads out floor by floor (your card + the curse White gets with it) with their effects, souls of killed knights /
   bishops / rooks (one free move like that piece), grenades (Philanthropy / Workshop: a free throw that bounces 0-1
   square and blasts the 3x3 around it), card flips (Bloodless Coup, Cornered Desperado, Unfaithful Steed, Throne Rook),
   extra turn for a knight kill (Courteous Jousting), timed curses (Military Academy, Conclave, Drag Queen), and the
   floor-12 boss king (21 hearts). Everything is gated by run flags in state.x, so the other Shotgun King modes are
   unchanged. */
(function () {
  'use strict';
  var CM = window.CM;
  var HP = { P: 1, N: 2, B: 2, R: 3, Q: 4, K: 4 };
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function hp(p) { return p.hp != null ? p.hp : (HP[p.t] || 1); }
  /* squares hit by a shot from `from` aimed at `aim` */
  function cone(g, from, aim, range, arc) {
    var half = ((arc || 55) / 2) * Math.PI / 180;
    var fc = g.col(from), fr = g.row(from), ax = g.col(aim) - fc, ay = g.row(aim) - fr, al = Math.atan2(ay, ax), out = [];
    for (var j = 0; j < g.size; j++) {
      if (j === from || !g.valid[j]) continue;
      var dx = g.col(j) - fc, dy = g.row(j) - fr, d = Math.max(Math.abs(dx), Math.abs(dy)); if (d > range) continue;
      var a = Math.atan2(dy, dx) - al; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
      if (Math.abs(a) <= half + 1e-9) out.push({ sq: j, d: d });
    }
    return out;
  }
  function edge(g, i) { var c = g.col(i), r = g.row(i); return c === 0 || r === 0 || c === g.files - 1 || r === g.ranks - 1; }
  var SOUL = { N: { v: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]], ride: false }, B: { v: [[1, 1], [1, -1], [-1, 1], [-1, -1]], ride: true }, R: { v: [[1, 0], [-1, 0], [0, 1], [0, -1]], ride: true } };
  function soulMoves(g, st, i, p, t, out) {   /* a soul = one move like that piece, to an empty square */
    var S = SOUL[t]; if (!S) return;
    S.v.forEach(function (d) { var j = i; for (;;) { j = g.step(j, d[0], d[1]); if (j < 0 || st.b[j]) break; out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, soul: t }); if (!S.ride) break; } });
  }
  /* bookkeeping after your shot / grenade / hop killed pieces: souls, flips, rats, Courteous Jousting, Last Guardian */
  function afterKills(V, st, n, x, killed) {
    var b = n.b, g = V.geo;
    killed.forEach(function (t) {
      if (SOUL[t] && x.slots && (x.souls || []).length < x.slots) x.souls = (x.souls || []).concat([t]);
      if (t === 'P' && x.coup === 1) x.coup = 2;            /* Bloodless Coup flips once you kill a pawn */
      if (t === 'N' && x.joust) x.extra = 1;               /* Courteous Jousting: play an extra turn */
    });
    if (killed.length && x.rats) {   /* Ravenous Rats: a rat bites the nearest white piece for 1 */
      var me = -1; for (var i = 0; i < b.length; i++) if (b[i] && b[i].c === 'b' && b[i].t === 'K') { me = i; break; }
      var best = -1, bd = 99; for (var j = 0; j < b.length; j++) { var q = b[j]; if (q && q.c === 'w' && q.t !== '#' && me >= 0 && g.dist(me, j) < bd) { bd = g.dist(me, j); best = j; } }
      if (best >= 0) { var l = hp(b[best]) - 1; if (l > 0) b[best] = Object.assign({}, b[best], { hp: l }); else { b[best] = null; } }
    }
    if (x.guardian && killed.indexOf('P') >= 0) {   /* Last Guardian: the last pawn promotes */
      var pawns = []; b.forEach(function (q, k) { if (q && q.c === 'w' && q.t === 'P') pawns.push(k); });
      if (pawns.length === 1) b[pawns[0]] = Object.assign({}, b[pawns[0]], { t: 'Q', hp: HP.Q });
    }
  }
  var H = {
    skKing: function (V, st, i, p, out) {
      var g = V.geo, x = st.x || {};
      if (p.c !== 'b') { /* the White King moves like a normal king */
        D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j < 0) return; var q = st.b[j]; if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); else if (q.c !== p.c && V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j }); });
        return;
      }
      if (x.arm === 'nade' && x.nades > 0 && !x.nadeUsed) {   /* armed grenade: any square 2-5 away (a free action) */
        for (var k0 = 0; k0 < g.size; k0++) { if (!g.valid[k0] || k0 === i) continue; var dd = g.dist(i, k0); if (dd >= 2 && dd <= 5) out.push({ f: i, t: k0, p: p.t, c: p.c, cap: null, nade: 1 }); }
        return;
      }
      if (x.arm === 'soul' && x.souls && x.souls.length) { soulMoves(g, st, i, p, x.souls[0], out); return; }
      D8.forEach(function (d) {
        var j = g.step(i, d[0], d[1]); if (j < 0) return; var q = st.b[j];
        if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
        else if (x.blade && q.c === 'w' && hp(q) <= x.blade && q.t !== '#') out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j, blade: 1 });   /* Night Bane */
        if (x.steed === 1 && !q && st.b.some(function (z) { return z && z.c === 'w' && z.t === 'N'; })) {   /* Unfaithful Steed: move range +1 while White has a knight */
          var j2 = g.step(j, d[0], d[1]); if (j2 >= 0 && !st.b[j2]) out.push({ f: i, t: j2, p: p.t, c: p.c, cap: null });
        }
        if (x.hop && !x.hopUsed && q && q.t !== '#') { var j3 = g.step(j, d[0], d[1]); if (j3 >= 0 && !st.b[j3]) out.push({ f: i, t: j3, p: p.t, c: p.c, cap: null, hop: j }); }   /* Taunting Hop */
      });
      if (!(x.sh > 0)) return;
      var rg = x.rg || 3;
      for (var j = 0; j < st.b.length; j++) {
        var q = st.b[j]; if (!q || q.c !== 'w' || q.probe) continue;
        if (g.dist(i, j) > rg) continue;
        out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, shoot: 1 });
      }
    },
    onMake: function (V, st, m, n) {
      var x = n.x = Object.assign({}, st.x);
      if (m.c !== 'b') return;
      var g = V.geo, b = n.b, killed = [];
      if (m.nade) {   /* grenade: deterministic bounce 0-1 square (seeded by ply + target), 3x3 blast; off the board = wasted */
        b[m.f] = st.b[m.f]; b[m.t] = st.b[m.t];
        var sd = (st.ply * 7 + m.t * 13) % 9, bx = (sd % 3) - 1, by = Math.floor(sd / 3) - 1, land = g.step(m.t, bx, by);
        x.nades = (x.nades || 0) - 1; x.nadeUsed = 1; x.arm = null; x.boom = land;
        if (land >= 0 && g.valid[land]) [[0, 0]].concat(D8).forEach(function (d) {
          var j = g.step(land, d[0], d[1]); if (j < 0) return; var q = b[j]; if (!q || q.c !== 'w') return;
          var left = hp(q) - (x.nadeDmg || 3); if (left > 0) b[j] = Object.assign({}, q, { hp: left }); else { b[j] = null; killed.push(q.t); }
        });
        afterKills(V, st, n, x, killed); return;
      }
      if (x.slots) { x.nadeUsed = 0; x.boom = null; }   /* video-card runs only */
      if (m.soul) { x.souls = (x.souls || []).slice(1); x.arm = null; x.sh = Math.min(x.max || 2, (x.sh || 0) + 1); return; }
      if (x.hop) x.hopUsed = m.hop != null ? 1 : 0;
      if (m.hop != null) { var hq = b[m.hop]; if (hq && hq.c === 'w') { var hl = hp(hq) - 1; if (hl > 0) b[m.hop] = Object.assign({}, hq, { hp: hl }); else { b[m.hop] = null; killed.push(hq.t); } } x.extra = 1; afterKills(V, st, n, x, killed); return; }
      if (m.blade) { killed.push(m.cap.t); x.sh = Math.min(x.max || 2, (x.sh || 0) + 1); afterKills(V, st, n, x, killed); return; }
      if (!m.shoot) { x.sh = Math.min(x.max || 2, (x.sh || 0) + 1); if (x.gift === 1) x.gift = 2; return; }   /* a step reloads (Welcome Gift ends at the first reload) */
      b[m.f] = st.b[m.f]; b[m.t] = st.b[m.t];
      x.sh = (x.sh || 0) - 1;
      var fp = (x.fp || 2) + (x.desp && edge(g, m.f) ? 2 : 0) + (x.gift === 1 ? 4 : 0);   /* Cornered Desperado (only on the edge), Welcome Gift */
      cone(g, m.f, m.t, x.rg || 3, x.arc).forEach(function (h) {
        var q = b[h.sq]; if (!q || q.c !== 'w') return;
        var dmg = h.d <= 2 ? fp : Math.max(1, fp - 1);
        if (x.bleed && q.hurt) dmg++;   /* Caltrops: bleeding pieces take an extra damage */
        var left = hp(q) - dmg;
        if (left <= 0 && q.t === 'K' && x.guard && b.some(function (z) { return z && z.c === 'w' && z.t === 'N'; })) left = 1;   /* Bodyguard */
        if (left > 0) b[h.sq] = Object.assign({}, q, x.slots ? { hp: left, hurt: 1 } : { hp: left }); else { b[h.sq] = null; killed.push(q.t); }
        if (q.t === 'K' && x.ecall === 1) x.ecall = 2;   /* Emergency Call: first hit on the king */
      });
      afterKills(V, st, n, x, killed);
    },
    /* Bloodless Coup (pawns cannot take you until you kill one), Subtle Poison / King's Mistress (queen move limit) */
    moves: function (V, st, out) {
      var x = st.x || {}; if (st.turn !== 'w' || !(x.coup === 1 || x.qlim)) return out;
      return out.filter(function (m) {
        if (x.coup === 1 && m.p === 'P' && m.cap && m.cap.c === 'b') return false;
        if (x.qlim && m.p === 'Q' && V.geo.dist(m.f, m.t) > x.qlim) return false;
        return true;
      });
    },
    evaluate: function (V, st) { var s = 0; st.b.forEach(function (p) { if (p && p.c === 'w') s += hp(p) * 40; }); return s; },

    /* ---- game hooks ---- */
    setup: function (ctx) {
      ctx.game._sk = { floor: 1, cards: [], curses: [], aim: -1, flash: null, fx: [], turns: 0 };
      load(ctx, Object.assign({ sh: 2, max: 2, fp: 2, rg: 3, arc: 55 }, ctx.params.cardSet ? { slots: 1, souls: [], nades: 0, nadeDmg: 3 } : {}));
      document.body.classList.add('m-sk'); panel(ctx); aimer(ctx);
    },
    onExit: function () { document.body.classList.remove('m-sk'); ['.g4sk-panel', '.g4sk-draft'].forEach(function (q) { var e = document.querySelector(q); if (e) e.remove(); }); },
    onTurn: function (ctx) { panel(ctx); },
    afterMove: function (ctx, m, info) {
      var z = ctx.game._sk, st = ctx.state;
      if (m.shoot) {
        var x0 = st.x || {}; z.flash = cone(ctx.geo, m.f, m.t, x0.rg || 3, x0.arc).map(function (h) { return h.sq; });
        ctx.fx({ type: 'flash', at: ctx.name(m.f), color: '#ffe9a8', duration_ms: 220 });  /* muzzle flash */
        ctx.fx({ type: 'particles', kind: 'sparks', at: ctx.name(m.t), count: 26, duration_ms: 500 }); ctx.sound('explosion');
        ctx.after(380, function () { z.flash = null; ctx.game.render(); });
      }
      if (ctx.params.cardSet && info.by === 'player') { var r3 = videoAfter(ctx, m); if (r3) return r3; st = ctx.state; }
      panel(ctx);
      var wk = st.b.some(function (p) { return p && p.c === 'w' && p.t === 'K'; });
      if (!wk && info.by === 'player') {
        if (z.floor >= ctx.params.floors) return;
        var x = Object.assign({}, st.x);
        if (ctx.params.cardSet) {
          if (!VIDEO_OFFERS[z.floor - 1]) { z.floor++; load(ctx, x); panel(ctx); return; }   /* no draft after floor 11 */
          return videoDraft(ctx).then(function (o) {
            if (o.x) o.x(x); if (o.curse && o.curse.x) o.curse.x(x);
            z.cards.push(o); if (o.curse) z.curses.push(o.curse); z.floor++;
            load(ctx, x); panel(ctx); ctx.refresh();
          });
        }
        return draft(ctx).then(function (card) {
          card.apply(x); z.cards.push(card); z.curses.push(CURSES[(z.floor - 1) % CURSES.length]); z.floor++;
          load(ctx, x); panel(ctx); ctx.refresh();
        });
      }
    },
    decorate: function (ctx, sq, p) {
      var st = ctx.state, g = ctx.geo, me = -1, z = ctx.game._sk;
      if (p && p.c === 'b' && p.t === 'K') return { img: ctx.params.kingImg || KING };
      if (p && p.c === 'w' && p.boss) return { cls: 'g4sk-bosssq', html: '<span class="g4sk-hp">' + hp(p) + '</span>' };
      var hot = z && (z.flash || z.coneSq); if (hot && hot.indexOf(sq) >= 0) return { cls: 'g4sk-cone' + (p && p.c === 'w' && hp(p) > 1 ? '' : ''), html: p && p.c === 'w' && hp(p) > 1 ? '<span class="g4sk-hp">' + hp(p) + '</span>' : '' };
      for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].c === 'b' && st.b[i].t === 'K') { me = i; break; }
      if (p && p.c === 'w') { var h = hp(p); if (h > 1) return { html: '<span class="g4sk-hp">' + h + '</span>' }; return null; }
      if (me >= 0 && !p && g.dist(me, sq) === 1 && ctx.V.attacked(st, sq, 'w')) return { cls: 'g4sk-threat', html: '<span class="g4sk-bang">!</span>' };
      return null;
    },
    status: function (ctx) {
      var x = ctx.state.x || {}, z = ctx.game._sk; if (!z || ctx.over) return null;
      /* the HUD panel already shows floor, shells, power, range and arc (critic: duplicated stats); the line only prompts */
      return x.sh ? 'Move your king or tap a white piece to shoot' : 'Out of shells: move your king';
    },
    init: function () {
      if (document.getElementById('g4sk-css')) return;
      var c = document.createElement('style'); c.id = 'g4sk-css';
      c.textContent = '.g4sk-hp{position:absolute;right:4%;bottom:3%;font:700 11px/1 system-ui;color:#fff;background:#b33;border-radius:6px;padding:1px 4px;z-index:3;pointer-events:none}' +
        '.g4sk-bang{position:absolute;inset:0;display:grid;place-items:center;font:900 22px/1 system-ui;color:#e03a3a;pointer-events:none}.g4sk-threat{box-shadow:inset 0 0 0 999px rgba(224,58,58,.16)}' +
        '.g4sk-cone{box-shadow:inset 0 0 0 999px rgba(216,32,76,.45)}' +
        '#board .sq.g4sk-bosssq{overflow:visible;z-index:5}#board .sq.g4sk-bosssq .pc{transform:scale(1.7);transform-origin:50% 80%}' +
        '.g4sk-vc{display:flex;flex-direction:column;gap:3px;font-size:10px;line-height:1.15;letter-spacing:0;text-align:left}.g4sk-vc span{background:#2a2f58;border-radius:3px;padding:2px 4px;color:#e8e2ff}.g4sk-vc.w span{background:#3a1f35;color:#ffb3c4}.g4sk-vc span.off{opacity:.45;text-decoration:line-through}' +
        '.g4sk-acts{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.g4sk-acts button{min-height:36px;padding:0 10px;border:0;border-radius:8px;background:#3a3f6e;color:#e8e2ff;font:700 12px/1 ui-monospace,Menlo,monospace;box-shadow:0 3px 0 #151833;cursor:pointer}.g4sk-acts button[aria-pressed=true]{background:#d8204c;box-shadow:0 3px 0 #6e0f27}.g4sk-acts button:disabled{opacity:.4}' +
        '.g4sk-draft .vrow{display:flex;flex-direction:column;gap:10px;width:min(94%,420px)}.g4sk-draft .vrow button{width:auto;text-align:left;padding:8px 10px;font-size:12px;line-height:1.3;background:#232850;border-color:#8b86b8}.g4sk-draft .vrow b{color:#fff;font-size:13px}.g4sk-draft .vrow i{display:block;font-style:normal;color:#ff9fb5;margin-top:4px}' +
        '.m-sk #board .sq:has(.blk--wall){background:#1d2140!important;box-shadow:none}.m-sk .blk--wall{display:none}' +
        '.g4sk-panel{background:#1d2140;color:#b9b3e0;font:700 13px/1.25 ui-monospace,Menlo,monospace;padding:10px;border-radius:8px;margin-bottom:10px;letter-spacing:.04em}' +
        '.g4sk-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}.g4sk-top img{width:64px;image-rendering:pixelated}.g4sk-floor{color:#b9b3e0}.g4sk-floor b{color:#d8204c}' +
        '.g4sk-pips{display:flex;gap:3px;margin:2px 0 8px}.g4sk-pips i{width:7px;height:14px;background:#3a3f6e}.g4sk-pips i.on{background:#d8204c}' +
        '.g4sk-cols{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:start}.g4sk-cards{display:grid;grid-template-columns:repeat(2,40px);gap:4px}.g4sk-cards img,.g4sk-cards i{width:40px;height:53px;border:1px dashed #3a3f6e;border-radius:3px;display:block;image-rendering:pixelated}.g4sk-cards img{border:0}' +
        '.g4sk-stats{text-align:center;font-size:11px}.g4sk-stats b{display:block;color:#e8e2ff;font-size:13px;margin-bottom:6px}' +
        '.g4sk-draft{position:absolute;inset:0;z-index:30;background:rgba(17,19,42,.88);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#e8e2ff;font:700 14px/1.2 ui-monospace,Menlo,monospace;text-align:center;padding:8px}' +
        '.g4sk-draft .row{display:flex;gap:12px;justify-content:center}.g4sk-draft button{background:none;border:2px solid #b9b3e0;border-radius:6px;padding:4px;color:#e8e2ff;font:inherit;font-size:11px;width:104px;cursor:pointer}.g4sk-draft button img,.g4sk-draft .curse img{width:80px;image-rendering:pixelated;display:block;margin:0 auto 4px}.g4sk-draft .curse{font-size:11px;color:#d8204c;width:104px}';
      document.head.appendChild(c);
    }
  };
  var A = 'assets/modes/9j7h5kF4X9s/', KING = 'assets/modes/AvZiSnngZjA/king_b.png';
  /* card faces cut from the stills; their effects are inferred (only the art is visible) */
  var CARDS = [
    { img: 'card_u4', name: '+1 shell', apply: function (x) { x.max++; x.sh = x.max; } },
    { img: 'card_u0', name: '+1 power', apply: function (x) { x.fp++; } },
    { img: 'card_u1', name: '+1 range', apply: function (x) { x.rg++; } },
    { img: 'card_u2', name: 'Full reload', apply: function (x) { x.sh = x.max; } },
    { img: 'card_u3', name: 'Wider arc (+10\u00b0)', apply: function (x) { x.arc = (x.arc || 55) + 10; } },
    { img: 'card_u5', name: '+1 power', apply: function (x) { x.fp++; } },
    { img: 'card_u6', name: '+1 shell', apply: function (x) { x.max++; x.sh = x.max; } },
    { img: 'card_u7', name: '+1 range', apply: function (x) { x.rg++; } }
  ];
  var CURSES = ['card_c0', 'card_c1', 'card_c2', 'card_c3', 'card_c4', 'card_c5', 'card_c6'];
  function panel(ctx) {
    if (typeof document === 'undefined') return; var side = document.getElementById('side'), z = ctx.game._sk; if (!side || !z) return;
    var el = side.querySelector('.g4sk-panel'); if (!el) { el = document.createElement('div'); el.className = 'g4sk-panel'; side.insertBefore(el, side.firstChild); }
    var x = ctx.state.x || {}, pips = ''; for (var i = 0; i < (x.max || 2); i++) pips += '<i class="' + (i < (x.sh || 0) ? 'on' : '') + '"></i>';
    function col(list) { var h = ''; for (var k = 0; k < 6; k++) h += list[k] ? '<img alt="" src="' + A + list[k] + '.png">' : '<i></i>'; return '<div class="g4sk-cards">' + h + '</div>'; }
    if (ctx.params.cardSet) {
      var flip = { coup: x.coup === 2, desp: false, steed: !ctx.state.b.some(function (q) { return q && q.c === 'w' && q.t === 'N'; }) };
      var tl = function (list, w) { return '<div class="g4sk-vc' + (w ? ' w' : '') + '">' + list.map(function (c) { var off = (c.id === 'coup' && flip.coup) || (c.id === 'steed' && flip.steed); return '<span class="' + (off ? 'off' : '') + '" title="' + CM.util.esc(c.text) + '">' + CM.util.esc(c.name) + '</span>'; }).join('') + '</div>'; };
      el.innerHTML = '<div class="g4sk-top"><img alt="" src="' + A + 'hud.png"><span class="g4sk-floor">FLOOR: <b>' + z.floor + '/' + ctx.params.floors + '</b>' + (z.floor >= ctx.params.floors ? ' <b>BOSS</b>' : '') + '</span></div><div class="g4sk-pips">' + pips + '</div>' +
        '<div class="g4sk-cols">' + tl(z.cards, false) + '<div class="g4sk-stats">POWER<b>' + (x.fp || 2) + '</b>RANGE<b>' + (x.rg || 3) + '</b>F.ARC<b>' + (x.arc || 55) + '\u00b0</b></div>' + tl(z.curses, true) + '</div>' +
        '<div class="g4sk-acts"><button type="button" data-a="soul" aria-pressed="' + (x.arm === 'soul') + '"' + ((x.souls || []).length ? '' : ' disabled') + '>SOUL ' + ((x.souls || [])[0] ? ({ N: 'KNIGHT', B: 'BISHOP', R: 'ROOK' })[x.souls[0]] : '-') + ' ' + (x.souls || []).length + '/' + (x.slots || 1) + '</button>' +
        '<button type="button" data-a="nade" aria-pressed="' + (x.arm === 'nade') + '"' + (x.nades > 0 && !x.nadeUsed ? '' : ' disabled') + '>GRENADE x' + (x.nades || 0) + '</button></div>';
      el.onclick = function (e) {
        var bt = e.target.closest('[data-a]'); if (!bt || bt.disabled || ctx.game.busy || ctx.state.turn !== 'b') return;
        var cur = (ctx.state.x || {}).arm; ctx.setX('arm', cur === bt.dataset.a ? null : bt.dataset.a); ctx.refresh(); panel(ctx);
      };
      return;
    }
    el.innerHTML = '<div class="g4sk-top"><img alt="" src="' + A + 'hud.png"><span class="g4sk-floor">FLOOR: <b>' + z.floor + '/' + ctx.params.floors + '</b></span></div><div class="g4sk-pips">' + pips + '</div>' +
      '<div class="g4sk-cols">' + col(z.cards.map(function (c) { return c.img; })) + '<div class="g4sk-stats">POWER<b>' + (x.fp || 2) + '</b>RANGE<b>' + (x.rg || 3) + '</b>F.ARC<b>' + (x.arc || 55) + '\u00b0</b></div>' + col(z.curses) + '</div>';
  }
  function draft(ctx) {
    return new Promise(function (res) {
      var wrap = document.getElementById('board-wrap'), z = ctx.game._sk;
      var a = CARDS[(z.floor * 3) % CARDS.length], b = CARDS[(z.floor * 3 + 1) % CARDS.length], curse = CURSES[(z.floor - 1) % CURSES.length];
      if (!wrap) { res(a); return; }
      var d = document.createElement('div'); d.className = 'g4sk-draft';
      d.innerHTML = '<div>FLOOR ' + z.floor + ' CLEARED</div><div>PICK A CARD</div><div class="row"><button type="button" data-k="0"><img alt="" src="' + A + a.img + '.png">' + a.name + '</button><button type="button" data-k="1"><img alt="" src="' + A + b.img + '.png">' + b.name + '</button></div>' +
        '<div class="curse"><img alt="" src="' + A + curse + '.png">White draws a curse: +1 piece</div>';
      d.addEventListener('click', function (e) { var t = e.target.closest('button'); if (!t) return; d.remove(); res(t.dataset.k === '1' ? b : a); });
      wrap.appendChild(d);
    });
  }
  /* red aim cone while the king is selected and a target is hovered */
  function aimer(ctx) {
    var bd = document.getElementById('board'); if (!bd || bd._g4sk) return; bd._g4sk = 1;
    bd.addEventListener('pointermove', function (e) {
      var G = CM.app && CM.app.current, z = G && G._sk; if (!z) return;
      var q = e.target.closest && e.target.closest('.sq'), t = q && q.dataset.i != null ? +q.dataset.i : -1, sel = G.sel, cs = null;
      if (sel >= 0 && t >= 0 && G.state.b[sel] && G.state.b[sel].t === 'K' && G.state.b[sel].c === 'b' && G.moves.some(function (m) { return m.f === sel && m.t === t && m.shoot; })) {
        var x = G.state.x || {}; cs = cone(G.V.geo, sel, t, x.rg || 3, x.arc).map(function (h) { return h.sq; });
      }
      if (String(cs) !== String(z.coneSq)) { z.coneSq = cs; G.render(); }
    });
    bd.addEventListener('pointerleave', function () { var G = CM.app && CM.app.current, z = G && G._sk; if (z && z.coneSq) { z.coneSq = null; G.render(); } });
  }
  function army(n, rank) {
    var list = ['K']; var pawns = Math.min(8, 3 + n + (rank >= 4 ? 1 : 0));
    for (var i = 0; i < pawns; i++) list.push('P');
    if (n >= 1) list.push('R');           /* floor 1 already has an extra rook */
    if (n >= 2) list.push('N');
    if (n >= 3) list.push('B');
    if (n >= 5) list.push('N');
    if (n >= 6) list.push('Q');
    if (n >= 8) list.push('B');
    if (n >= 10) list.push('R');
    for (var c = 1; c < n; c++) list.push(['P', 'N', 'P', 'B', 'P', 'R', 'P'][(c - 1) % 7]); /* one curse piece per cleared floor */
    return list.slice(0, 22);
  }
  /* ---- VIDEO CARDS (params.cardSet 'rank3'): the pairs read out in "Can I BEAT Shotgun King? [RANK 3]" (NK4Upb_s8Ok),
     offered after floors 1-10 in the video's order. Each = your card + the curse White gets with it. Effects are the card
     text as read in the video; where a detail is not shown the simplest reading is used (marked inferred). ---- */
  function C(id, name, text, xfn, curse) { return { id: id, name: name, text: text, x: xfn, curse: curse }; }
  function W(id, name, text, xfn, floor, timed) { return { id: id, name: name, text: text, x: xfn, floor: floor, timed: timed }; }
  function addHp(st, f, n) { st.b.forEach(function (q, i) { if (q && q.c === 'w' && q.t !== '#' && f(q)) st.b[i] = Object.assign({}, q, { hp: Math.max(1, hp(q) + n) }); }); }
  var VIDEO_OFFERS = [
    [C('bane', 'Night Bane', '+3 blade: step onto a white piece with 3 HP or less to cut it down (inferred reading of "blade")', function (x) { x.blade = 3; },
        W('succ', 'Succubus', 'add one queen', null, function (ctx, st, sp) { sp('Q'); })),
     C('joust', 'Courteous Jousting', 'play an extra turn when you kill a knight; fire arc -10\u00b0', function (x) { x.joust = 1; x.arc = (x.arc || 55) - 10; },
        W('throne', 'Throne Rook', 'rooks +4 HP; flips if no pawn is on the board', null, function (ctx, st) { addHp(st, function (q) { return q.t === 'R'; }, 4); }))],
    [C('coup', 'Bloodless Coup', 'pawns cannot attack you; flips once you kill a pawn', function (x) { x.coup = 1; },
        W('plate', 'Full Plate Armor', 'all pieces +1 HP', null, function (ctx, st) { addHp(st, function () { return true; }, 1); })),
     C('mael', 'Egotic Maelstrom', 'every 10 turns +1 firepower', function (x) { x.mael = 1; },
        W('guard', 'Bodyguard', 'knights +1 HP; the king cannot be killed while a knight is alive', function (x) { x.guard = 1; }, function (ctx, st) { addHp(st, function (q) { return q.t === 'N'; }, 1); }))],
    [C('censer', 'Majestic Censer', '+1 ammo max, +1 soul slot', function (x) { x.max = (x.max || 2) + 1; x.slots = (x.slots || 1) + 1; }, null),
     C('poison', 'Subtle Poison', 'queen and king -1 HP; the queen moves one square at most for 15 turns', function (x) { x.poison = 1; }, null)],
    [C('aging', 'Golden Aging', '-1 HP for the queen and king again (inferred targets); every 10 turns -1 speed (not modelled)', function (x) { x.aging = 1; },
        W('academy', 'Military Academy', 'add one knight every 10 turns', null, null, { every: 10, add: 'N' })),
     C('barrel', 'Extra Barrel', '+1 shell, fire arc +7\u00b0', function (x) { x.max = (x.max || 2) + 1; x.arc = (x.arc || 55) + 7; },
        W('plume', 'Plumed Knight', 'one knight +3 HP', null, function (ctx, st) { var done = false; addHp(st, function (q) { if (done || q.t !== 'N') return false; done = true; return true; }, 3); }))],
    [C('phil', 'Philanthropy', '+2 grenades, -1 grenade damage (tap GRENADE, then a square 2-5 away; one per turn, it does not end your turn)', function (x) { x.nades = (x.nades || 0) + 2; x.nadeDmg = (x.nadeDmg || 3) - 1; },
        W('conclave', 'Conclave', 'add two bishops after 15 turns', null, null, { at: 15, add: 'BB' })),
     C('steed', 'Unfaithful Steed', 'move range +1; flips if White has no knight on the board', function (x) { x.steed = 1; },
        W('drag', 'Drag Queen', 'after 10 turns a bishop becomes a queen', null, null, { at: 10, swap: ['B', 'Q'] }))],
    [C('rats', 'Ravenous Rats', 'when you kill a piece, a rat bites the nearest piece for 1', function (x) { x.rats = 1; },
        W('heal', 'Divine Healing', 'bishops +1 HP (their healing is not modelled)', null, function (ctx, st) { addHp(st, function (q) { return q.t === 'B'; }, 1); })),
     C('blunder', 'Blunderbuss', '+2 firepower, fire arc +30\u00b0', function (x) { x.fp = (x.fp || 2) + 2; x.arc = (x.arc || 55) + 30; },
        W('cardinal', 'Cardinal', 'remove one pawn, add one bishop; you -1 ammo max', function (x) { x.max = Math.max(1, (x.max || 2) - 1); }, function (ctx, st, sp) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].c === 'w' && st.b[i].t === 'P') { st.b[i] = null; break; } sp('B'); }))],
    [C('desp', 'Cornered Desperado', '+2 firepower; flips when your king is not on the board edge', function (x) { x.desp = 1; },
        W('royal', 'Royal Vigor', 'queen +1 HP, king +2 HP (name not read in the video)', null, function (ctx, st) { addHp(st, function (q) { return q.t === 'Q'; }, 1); addHp(st, function (q) { return q.t === 'K'; }, 2); })),
     C('caltrops', 'Caltrops', 'bleeding pieces take an extra damage (pieces you already hit bleed; inferred)', function (x) { x.bleed = 1; },
        W('heir', 'Secret Heir', 'when the king dies, the nearest piece is crowned (once a floor)', null, function (ctx, st) { st.x.heir = 1; }))],
    [C('gift', 'Welcome Gift', '+4 firepower until your first reload of each floor', function (x) { x.giftCard = 1; },
        W('lastg', 'Last Guardian', 'after you kill a pawn, the last pawn promotes', function (x) { x.guardian = 1; }, null)),
     C('barrel2', 'Extra Barrel', '+1 shell, fire arc +7\u00b0 (the video does not read the second offer here)', function (x) { x.max = (x.max || 2) + 1; x.arc = (x.arc || 55) + 7; },
        W('plume2', 'Plumed Knight', 'one knight +3 HP', null, function (ctx, st) { var done = false; addHp(st, function (q) { if (done || q.t !== 'N') return false; done = true; return true; }, 3); }))],
    [C('workshop', 'Workshop', 'every 8 turns: +1 grenade and +2 shells', function (x) { x.workshop = 1; },
        W('mistress', "King's Mistress", 'add one queen; queens move 3 squares at most', null, function (ctx, st, sp) { sp('Q'); st.x.qlim = Math.min(st.x.qlim || 3, 3); })),
     C('hop', 'Taunting Hop', 'jump over a nearby piece without ending your turn; the hopped piece takes 1', function (x) { x.hop = 1; },
        W('court', 'Court of the King', 'add two knights, one bishop and one rook', null, function (ctx, st, sp) { sp('N'); sp('N'); sp('B'); sp('R'); }))],
    [C('blunder2', 'Blunderbuss', '+2 firepower, fire arc +30\u00b0', function (x) { x.fp = (x.fp || 2) + 2; x.arc = (x.arc || 55) + 30; },
        W('tag', 'Tag Team', 'bishops and rooks can swap places (not modelled)', null, null)),
     C('pierce', 'Piercing Truth', 'pellets have a 30% chance to pierce (the cone here already hits every piece in it)', function (x) { x.pierce = 1; },
        W('ecall', 'Emergency Call', 'add one pawn; the first time you hit the king the nearest pawn promotes', function (x) { x.ecallCard = 1; }, function (ctx, st, sp) { sp('P'); }))]
  ];
  function spawner(ctx, st, ranks) {
    var g = ctx.geo, bk = -1; st.b.forEach(function (q, i) { if (q && q.c === 'b' && q.t === 'K') bk = i; });
    return function (t) {
      var pool = []; for (var i = 0; i < g.size; i++) if (g.valid[i] && !st.b[i] && g.rank(i) <= (ranks || 3) && (t !== 'P' || g.rank(i) >= 2) && (bk < 0 || g.dist(i, bk) > 1)) pool.push(i);
      if (!pool.length) return -1; var s = pool[Math.floor(Math.random() * pool.length)]; st.b[s] = ctx.V.piece(t, 'w', { m: 1 }); return s;
    };
  }
  function videoLoad(ctx, st) {
    var z = ctx.game._sk, x = st.x, sp = spawner(ctx, st, 3);
    x.extra = 0; x.arm = null; x.nadeUsed = 0; x.hopUsed = 0; x.throneOff = 0; x.boom = null; x.heir = 0; x.qlim = 0; x.gift = x.giftCard ? 1 : 0; x.ecall = x.ecallCard ? 1 : 0;
    if (x.coup === 2) x.coup = 2;   /* a flipped Bloodless Coup stays flipped */
    z.turns = 0; z.timed = [];
    z.curses.forEach(function (w) { if (w.floor) w.floor(ctx, st, sp); if (w.timed) z.timed.push(Object.assign({ id: w.id }, w.timed)); });
    if (x.poison) { addHp(st, function (q) { return q.t === 'Q' || q.t === 'K'; }, -1); x.qlim = 1; x.poisonLeft = 15; }
    if (x.aging) addHp(st, function (q) { return q.t === 'Q' || q.t === 'K'; }, -1);
    if (z.curses.some(function (w) { return w.id === 'mistress'; })) x.qlim = x.qlim ? Math.min(x.qlim, 3) : 3;
    if (z.floor >= ctx.params.floors && ctx.params.boss) st.b.forEach(function (q, i) { if (q && q.c === 'w' && q.t === 'K') st.b[i] = Object.assign({}, q, { hp: ctx.params.boss, boss: 1 }); });   /* final boss: the humongous White King */
  }
  /* after each of your moves: free actions (grenade / hop / jousting extra turn), timed curses, card flips, Secret Heir */
  function videoAfter(ctx, m) {
    var z = ctx.game._sk, st = ctx.state, x = st.x || {}, g = ctx.geo;
    if (m.nade && x.boom != null) {
      if (x.boom >= 0) { ctx.fx({ type: 'flash', at: ctx.name(x.boom), color: '#ffb347', duration_ms: 260 }); ctx.fx({ type: 'particles', kind: 'sparks', at: ctx.name(x.boom), count: 30, duration_ms: 520 }); ctx.sound('explosion'); }
      else ctx.toast('The grenade bounced off the board.', 1600);
    }
    var keep = m.nade || x.extra;   /* a grenade throw, a hop or a jousting knight kill does not end your turn */
    if (!m.nade) {
      z.turns++;
      if (x.poisonLeft) { x = Object.assign({}, x, { poisonLeft: x.poisonLeft - 1 }); if (!x.poisonLeft && !z.curses.some(function (w) { return w.id === 'mistress'; })) x.qlim = 0; }
      if (x.mael && z.turns % 10 === 0) { x = Object.assign({}, x, { fp: (x.fp || 2) + 1 }); ctx.toast('Egotic Maelstrom: +1 firepower', 1400); }
      if (x.workshop && z.turns % 8 === 0) { x = Object.assign({}, x, { nades: (x.nades || 0) + 1, sh: Math.min((x.max || 2), (x.sh || 0) + 2) }); ctx.toast('Workshop: +1 grenade, +2 shells', 1400); }
      var b2 = st.b.slice(), st2 = Object.assign({}, st, { b: b2 }), sp = spawner(ctx, st2, 3);
      (z.timed || []).forEach(function (t) {
        if (t.every && z.turns % t.every === 0) { sp(t.add); ctx.toast('Military Academy: a new knight', 1400); }
        if (t.at && z.turns === t.at) {
          if (t.add) { t.add.split('').forEach(function (a) { sp(a); }); ctx.toast('Conclave: two bishops arrive', 1400); }
          if (t.swap) { for (var i = 0; i < b2.length; i++) if (b2[i] && b2[i].c === 'w' && b2[i].t === t.swap[0]) { b2[i] = Object.assign({}, b2[i], { t: t.swap[1], hp: HP[t.swap[1]] }); ctx.toast('Drag Queen: a bishop becomes a queen', 1400); break; } }
        }
      });
      st = st2;
    }
    if (x.ecall === 2) {   /* Emergency Call: the nearest pawn to the king promotes, once */
      var kk = -1; st.b.forEach(function (q, i) { if (q && q.c === 'w' && q.t === 'K') kk = i; });
      var best = -1, bd = 99; st.b.forEach(function (q, i) { if (q && q.c === 'w' && q.t === 'P' && kk >= 0 && g.dist(i, kk) < bd) { bd = g.dist(i, kk); best = i; } });
      if (best >= 0) st.b[best] = Object.assign({}, st.b[best], { t: 'Q', hp: HP.Q });
      x = Object.assign({}, x, { ecall: 3 });
    }
    /* Throne Rook flips (rooks lose the +4) once no pawn is left */
    if (!x.throneOff && z.curses.some(function (w) { return w.id === 'throne'; }) && !st.b.some(function (q) { return q && q.c === 'w' && q.t === 'P'; })) {
      st.b.forEach(function (q, i) { if (q && q.c === 'w' && q.t === 'R') st.b[i] = Object.assign({}, q, { hp: Math.max(1, hp(q) - 4) }); }); x = Object.assign({}, x, { throneOff: 1 });
    }
    /* Secret Heir: the king died, the nearest piece takes the crown (once a floor) */
    if (x.heir === 1 && !st.b.some(function (q) { return q && q.c === 'w' && q.t === 'K'; })) {
      var bk = -1; st.b.forEach(function (q, i) { if (q && q.c === 'b' && q.t === 'K') bk = i; });
      var h = -1, hd = 99; st.b.forEach(function (q, i) { if (q && q.c === 'w' && q.t !== '#' && g.dist(i, bk) < hd) { hd = g.dist(i, bk); h = i; } });
      if (h >= 0) { st.b[h] = Object.assign({}, st.b[h], { t: 'K', hp: Math.max(hp(st.b[h]), 2) }); x = Object.assign({}, x, { heir: 2 }); ctx.toast('Secret Heir: a new king is crowned', 1800); }
    }
    x = Object.assign({}, x, { extra: 0 });
    var wk = st.b.some(function (q) { return q && q.c === 'w' && q.t === 'K'; });
    ctx.state = Object.assign({}, st, { x: x, turn: keep && wk ? 'b' : st.turn });
    return null;
  }
  function videoDraft(ctx) {
    return new Promise(function (res) {
      var wrap = document.getElementById('board-wrap'), z = ctx.game._sk, offer = VIDEO_OFFERS[z.floor - 1];
      if (!wrap) { res(offer[1]); return; }
      var d = document.createElement('div'); d.className = 'g4sk-draft';
      var e = CM.util.esc, one = function (o, k) { return '<button type="button" data-k="' + k + '"><b>' + e(o.name) + '</b>: ' + e(o.text) + (o.curse ? '<i>White: ' + e(o.curse.name) + ': ' + e(o.curse.text) + '</i>' : '<i>White: (curse not read in the video)</i>') + '</button>'; };
      d.innerHTML = '<div>FLOOR ' + z.floor + ' CLEARED</div><div>PICK A CARD</div><div class="vrow">' + offer.map(one).join('') + '</div>';
      d.addEventListener('click', function (ev) { var t = ev.target.closest('button[data-k]'); if (!t) return; d.remove(); res(offer[+t.dataset.k]); });
      wrap.appendChild(d);
    });
  }
  function load(ctx, x) {
    var z = ctx.game._sk, V = ctx.V, g = V.geo, list = army(z.floor, ctx.params.rank || 1);
    var st = CM.spec.initialState(V, Object.assign({}, ctx.spec, { setup: { fen: '4k3/8/8/8/8/8/8/8', turn: 'b' } }));
    var free = []; for (var i = 0; i < g.size; i++) if (g.rank(i) <= 3 && g.valid[i]) free.push(i);
    var k = g.parse('e1'); st.b[k] = V.piece('K', 'w', { m: 1 }); free.splice(free.indexOf(k), 1);
    list.slice(1).forEach(function (t) {
      var pool = free.filter(function (s) { return t === 'P' ? g.rank(s) >= 2 : true; }); if (!pool.length) return;
      var s = pool[Math.floor(Math.random() * pool.length)]; st.b[s] = V.piece(t, 'w', { m: 1 }); free.splice(free.indexOf(s), 1);
    });
    /* holes in the floor (navy gaps as in the FLOOR 6 still): more on later floors, never next to the king or on rank 1 */
    var bk = g.parse('e8'), holes = Math.min(9, z.floor + 1), spots = [];
    for (var j = 0; j < g.size; j++) if (g.valid[j] && !st.b[j] && g.rank(j) >= 3 && g.rank(j) <= 7 && g.dist(j, bk) > 1) spots.push(j);
    for (var h = 0; h < holes && spots.length; h++) { var w = Math.floor(Math.random() * spots.length); st.b[spots[w]] = V.piece('#', 'n'); spots.splice(w, 1); }
    st.x = Object.assign({ arc: 55 }, x, { sh: Math.max(x.sh || 0, 1), floor: z.floor });
    if (ctx.params.cardSet) videoLoad(ctx, st, free);
    ctx.state = st;
  }
  CM.defineHooks('g4_shotgun', H);
})();
