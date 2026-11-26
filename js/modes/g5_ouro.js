/* g5_ouro: Ouroboros King (tactical chess roguelite). A run of battles (params.battles = [{ name, fen, boss }]) played
   in order on a small board; New game after a win starts the next battle. King capture (no check rule).
   Unit generators (pieces.X.gen):
     portal  Portal Mage: moves to ANY empty square; captures only on the 8 adjacent squares.
     reaper  Reaper: king step (move or capture); also kills any enemy standing on a tile of the Reaper's own colour
             that is not royal (it stays where it is: the victim just disappears).
   Rules:
     Prince (type params.princeType, default 'I'): your royals cannot be captured while within 3 squares of a Prince.
     The Finisher relic (params.finisher !== false): if the enemy has only royals left and you still have other units at
             the start of your turn, you win.
     Glass Queen (type params.glassType, default 'Q' of the player): once she dies she never returns in later battles
             of this run (session only).
   State x: lt = { w|b: type that colour moved last } (for the Fool). Run progress is module state keyed by mode id.
   g5 pass 2 (2026-11-25), the run layer (rules from the series transcript rf2HSTXTehE via the specs; HUD look from the still
   JAz_qMQpI1o maxres2 'Ridge of Ruin - 4' and _RFXN1Ye3sY 3:43):
     fool    Fool (gen 'fool'): "moves with the same pattern as the last enemy move": it moves like the type the enemy moved
             last (a royal or another Fool = a king step; before any enemy move: a king step). No Fool icon exists on any
             repo frame: standard bishop glyph + 'Fo' badge (as group 6 does).
     HUD under the board, as in the game: 'Relics' bar (Ouroboros Sigil = the snake-ring icon cut from the still; The
             Finisher and Alarm Bell as named chips: no frame identifies their icons) and 'Items' with the rewind arrow +
             rewinds left; gold bag + gold on the right.
     Rewinds: params.run.rewinds per battle (+1 with the Ouroboros Sigil: "+1 rewind at start of each battle"); Undo spends one.
     Alarm Bell: "alarm when your king is in danger": a bell toast + red flash on your king when an enemy can take it.
     The Finisher: as before (owned from the start).
     Node map between battles (params.run, the game's campaign map art shared from rf2HSTXTehE): Training Grounds (recruit:
             three unit cards with gold costs; Reaper 481 gold is from the video, the other prices are inferred), Ruins
             (discover a relic you do not own), Shop (a rewind for 120 gold: inferred), then the next battle. Recruits join
             your back two rows in every later battle of the run. Armory upgrades are not built: no source shows what the
             upgraded units (Mirror Queen, Quartermaster, Berserker) do.
     Boss intro dialogue: params.run.bossIntro { img, name, text } shown as the game's dialogue panel ('Click to continue')
             before a boss battle (the line itself is paraphrased: no transcript of these two videos). */
(function () {
  'use strict';
  var CM = window.CM, pos = {}, lost = {};
  var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function prm(V) { return V.cfg.params || {}; }
  function B(ctx) { return ctx.params.battles || []; }
  function idx(ctx) { var l = B(ctx); return Math.min(pos[ctx.spec.id] || 0, l.length - 1); }
  function sqColor(g, i) { return (g.col(i) + g.row(i)) & 1; }
  /* ---------- run layer (params.run) ---------- */
  var RUN = {}, OA = 'assets/modes/JAz_qMQpI1o/';
  var NAMES = { finisher: 'The Finisher', bell: 'Alarm Bell', sigil: 'Ouroboros Sigil' };
  var DESC = { finisher: 'If the enemy leader stands alone and you have other units at the start of your turn, you win.', bell: 'Alarm when your king is in danger.', sigil: '+1 rewind at the start of each battle.' };
  function run(ctx) {
    var R0 = ctx.params.run; if (!R0) return null; var id = ctx.spec.id;
    return RUN[id] || (RUN[id] = { gold: R0.gold || 0, relics: Object.assign({ finisher: 1 }, R0.relics || {}), army: [], rw: 0, extraRw: 0 });
  }
  function ocss() {
    if (document.getElementById('g5-ob-run')) return; var s = document.createElement('style'); s.id = 'g5-ob-run';
    s.textContent = '.g5ob-hud{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:4px 8px;margin:6px 0 2px;padding:0 16px;box-sizing:border-box;color:#e8eaf2;font:16px/1.1 Georgia,"Times New Roman",serif}' +
      '.g5ob-hud .lb{opacity:.9}.g5ob-hud .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.g5ob-hud img{width:28px;height:28px;object-fit:contain}' +
      '.g5ob-hud .chip{font:600 11px/1 system-ui,sans-serif;border:1px solid rgba(232,234,242,.55);border-radius:12px;padding:5px 8px;white-space:nowrap}.g5ob-hud .it{position:relative}.g5ob-hud .it b{position:absolute;right:-6px;bottom:-4px;font:600 11px/1 Georgia,serif}' +
      '.g5ob-hud .gold{grid-row:1/3;grid-column:3;display:flex;align-items:center;gap:6px;font-size:22px}.g5ob-hud .gold img{width:34px;height:34px}' +
      '.g5ob-dlg{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(10,16,26,.86);animation:g5obf .25s ease-out;color:#e8eaf2;font:16px/1.35 Georgia,"Times New Roman",serif}@keyframes g5obf{from{opacity:0}to{opacity:1}}' +
      '.g5ob-box{width:min(94vw,460px);max-height:92vh;overflow:auto;background:#1b2433;border:2px solid #e8eaf2;padding:14px;text-align:center}.g5ob-box h3{margin:0 0 8px;font:400 24px/1.1 Georgia,serif;letter-spacing:.04em}' +
      '.g5ob-map{position:relative;background:#101826 center/cover no-repeat;min-height:150px;margin:0 -4px 10px;display:flex;flex-direction:column;gap:6px;justify-content:center;padding:10px}' +
      '.g5ob-btn{display:flex;align-items:center;gap:10px;width:100%;border:1px solid #e8eaf2;background:rgba(27,36,51,.92);color:#e8eaf2;padding:9px 10px;font:15px/1.2 Georgia,serif;text-align:left;cursor:pointer;transition:background .15s ease-out}.g5ob-btn:hover{background:#2c3a52}.g5ob-btn[disabled]{opacity:.38;cursor:default}' +
      '.g5ob-btn small{display:block;font-size:12px;opacity:.8}.g5ob-btn img{width:34px;height:34px;object-fit:contain}.g5ob-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}' +
      '.g5ob-card{border:1px solid #e8eaf2;background:#c2c7da;color:#1b2433;padding:8px 4px;cursor:pointer;font:13px/1.2 Georgia,serif;display:flex;flex-direction:column;align-items:center;gap:4px}.g5ob-card img{width:48px;height:48px;object-fit:contain;background:#323f55;border-radius:2px}.g5ob-card[disabled]{opacity:.45;cursor:default}.g5ob-card b{font-size:14px}' +
      '.g5ob-boss{display:flex;gap:12px;align-items:flex-start;text-align:left}.g5ob-boss img{width:110px;max-height:150px;object-fit:contain}.g5ob-cont{margin-top:10px;opacity:.75;font-style:italic;font-size:14px}';
    document.head.appendChild(s);
  }
  function hud(ctx) {
    var r = run(ctx); if (!r) return; ocss();
    var el = document.querySelector('.g5ob-hud'), stl = document.getElementById('status');
    if (!el && stl && stl.parentNode) { el = document.createElement('div'); el.className = 'g5ob-hud'; stl.parentNode.insertBefore(el, stl); }
    if (!el) return;
    var rel = Object.keys(NAMES).filter(function (k) { return r.relics[k]; }).map(function (k) { return k === 'sigil' ? '<img src="' + OA + 'relic_sigil.png" alt="Ouroboros Sigil" title="Ouroboros Sigil: ' + DESC.sigil + '">' : '<span class="chip" title="' + DESC[k] + '">' + NAMES[k] + '</span>'; }).join('');
    el.innerHTML = '<span class="lb">Relics</span><div class="row">' + (rel || '<span class="chip">none</span>') + '</div><span class="gold"><img src="' + OA + 'gold.png" alt="gold">' + r.gold + '</span>' +
      '<span class="lb">Items</span><div class="row"><span class="it" title="Rewinds left this battle"><img src="' + OA + 'rewind.png" alt="Rewind"><b>' + r.rw + '</b></span></div>';
  }
  function dlg(html) { closeDlg(); ocss(); var el = document.createElement('div'); el.className = 'g5ob-dlg'; el.setAttribute('role', 'dialog'); el.innerHTML = '<div class="g5ob-box">' + html + '</div>'; document.body.appendChild(el); return el; }
  function closeDlg() { var o = document.querySelector('.g5ob-dlg'); if (o) o.remove(); }
  function unitImg(ctx, t) { return ctx.game.pieceImage({ t: t, c: ctx.human }); }
  function nodeMap(ctx, done) {
    var r = run(ctx), R0 = ctx.params.run, l = B(ctx), k = idx(ctx), nb = l[k] || {}; done = done || {};
    var el = dlg('<h3>' + (nb.region || 'Campaign') + '</h3><div class="g5ob-map" style="background-image:linear-gradient(rgba(16,24,38,.55),rgba(16,24,38,.55)),url(' + (R0.mapImg || 'assets/modes/rf2HSTXTehE/campaign_map.png') + ')">' +
      '<button type="button" class="g5ob-btn" data-n="train"' + (done.train ? ' disabled' : '') + '><img src="' + unitImg(ctx, 'R') + '" alt="">Training Grounds<small>Recruit a unit</small></button>' +
      '<button type="button" class="g5ob-btn" data-n="ruins"' + (done.ruins || Object.keys(NAMES).every(function (x) { return r.relics[x]; }) ? ' disabled' : '') + '><img src="' + OA + 'relic_sigil.png" alt="">Ruins<small>Discover a relic</small></button>' +
      '<button type="button" class="g5ob-btn" data-n="shop"' + (done.shop ? ' disabled' : '') + '><img src="' + OA + 'gold.png" alt="">Shop<small>A rewind for 120 gold</small></button>' +
      '<button type="button" class="g5ob-btn" data-n="go"><img src="' + unitImg(ctx, 'K') + '" alt="">' + (nb.name || 'Next battle') + '<small>' + (nb.boss ? 'Boss battle' : 'Battle') + '</small></button></div>' +
      '<div style="font-size:14px;opacity:.85">Gold: ' + r.gold + '</div>');
    el.onclick = function (e) {
      var b = e.target.closest('[data-n]'); if (!b || b.disabled) return; var n = b.dataset.n;
      if (n === 'go') { closeDlg(); var go = document.getElementById('gover'); if (go) go.classList.remove('is-open'); ctx.game.newGame(); return; }
      if (n === 'train') return training(ctx, done);
      if (n === 'ruins') { var miss = Object.keys(NAMES).filter(function (x) { return !r.relics[x]; }), got = miss[Math.floor(Math.random() * miss.length)]; r.relics[got] = 1; done.ruins = 1; ctx.sound('notify'); ctx.toast('Relic discovered: ' + NAMES[got] + '. ' + DESC[got], 3200); hud(ctx); return nodeMap(ctx, done); }
      if (n === 'shop') { if (r.gold >= 120) { r.gold -= 120; r.extraRw++; done.shop = 1; ctx.sound('notify'); hud(ctx); } else ctx.toast('Not enough gold.', 1500); return nodeMap(ctx, done); }
    };
  }
  function training(ctx, done) {
    var r = run(ctx), pool = (ctx.params.run.recruits || []).slice(), offer = [];
    while (offer.length < 3 && pool.length) offer.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    var el = dlg('<h3>Training Grounds</h3><div>Select a piece to recruit. Gold: ' + r.gold + '</div><div class="g5ob-cards">' + offer.map(function (u, i) {
      var d = ctx.spec.pieces[u.t] || { name: u.t };
      return '<button type="button" class="g5ob-card" data-i="' + i + '"' + (r.gold < u.cost ? ' disabled' : '') + '><img src="' + unitImg(ctx, u.t) + '" alt=""><span>' + d.name + '</span><b>' + u.cost + ' gold</b></button>';
    }).join('') + '</div><button type="button" class="g5ob-btn" data-x="1" style="justify-content:center">Back to the map</button>');
    el.onclick = function (e) {
      var c = e.target.closest('[data-i]'), x = e.target.closest('[data-x]');
      if (c && !c.disabled) { var u = offer[+c.dataset.i]; r.gold -= u.cost; r.army.push(u.t); done.train = 1; ctx.sound('promote'); ctx.toast((ctx.spec.pieces[u.t] || {}).name + ' recruited.', 1800); hud(ctx); return nodeMap(ctx, done); }
      if (x) nodeMap(ctx, done);
    };
  }
  function bossIntro(ctx, b) {
    var bi = ctx.params.run && ctx.params.run.bossIntro; if (!bi) return;
    var el = dlg('<div class="g5ob-boss"><img src="' + bi.img + '" alt=""><div><h3 style="text-align:left">' + (bi.name || b.boss) + '</h3><div>' + bi.text + '</div></div></div><div class="g5ob-cont">Click to continue</div>');
    el.onclick = closeDlg;
  }
  CM.defineHooks('g5_ouro', {
    setup: function (ctx) {
      var l = B(ctx), k = idx(ctx), V = ctx.V, st = ctx.state, glass = ctx.params.glassType || 'Q';
      if (l[k]) st.b = CM.spec.parseSetup(V, l[k].fen);
      st.b = st.b.map(function (p, i) {
        if (!p) return p;
        if (lost[ctx.spec.id] && p.c === ctx.human && p.t === glass) return null;   /* the Glass Queen never returns */
        if (V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) return Object.assign({}, p, { m: 1 });
        return p;
      });
      var r = run(ctx);
      if (r) {   /* recruits stand on your back two rows, nearest the king first; rewinds refill each battle */
        var g = V.geo, h = ctx.human, k0 = V.royals(st, h)[0], free = [];
        for (var i = 0; i < st.b.length; i++) if (!st.b[i] && g.valid[i] && g.relRow(i, h) <= 2) free.push(i);
        free.sort(function (a, c) { return g.relRow(a, h) - g.relRow(c, h) || (k0 != null ? g.dist(a, k0) - g.dist(c, k0) : 0) || a - c; });
        r.army.forEach(function (t, j) { if (free[j] != null) st.b[free[j]] = { t: t, c: h, m: 1 }; });
        r.rw = (ctx.params.run.rewinds || 3) + (r.relics.sigil ? 1 : 0) + r.extraRw; r.extraRw = 0;
        var G = ctx.game;
        if (!G._g5obWrapped) { G._g5obWrapped = true; var real = G.undo; G.undo = function () { var rr = run(ctx); if (!G.history.length) return; if (rr && rr.rw <= 0) { ctx.toast('No rewinds left.', 1600); return; } if (rr) rr.rw--; real.call(G); hud(ctx); }; }
      }
      st.turn = 'w';
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
    },
    onStart: function (ctx) {
      var l = B(ctx), k = idx(ctx), b = l[k] || {};
      ctx.toast((b.region ? b.region + ' - ' : '') + 'Battle ' + (k + 1) + '/' + l.length + (b.name ? ': ' + b.name : '') + (b.boss ? '. Boss!' : ''), 3400);
      if (b.boss) { ctx.setOpponent({ name: b.boss, rating: null }); bossIntro(ctx, b); }
      hud(ctx);
    },
    onExit: function () { closeDlg(); var h = document.querySelector('.g5ob-hud'); if (h) h.remove(); },
    portal: function (V, st, i, p, out) {
      var b = st.b, g = V.geo;
      for (var j = 0; j < b.length; j++) if (j !== i && !b[j] && g.valid[j]) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
      D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && b[j] && b[j].c !== p.c && b[j].c !== 'n') out.push({ f: i, t: j, p: p.t, c: p.c, cap: b[j], capSq: j }); });
    },
    reaper: function (V, st, i, p, out) {
      var b = st.b, g = V.geo, own = sqColor(g, i), near = {};
      D8.forEach(function (d) {
        var j = g.step(i, d[0], d[1]); if (j < 0) return; near[j] = 1; var q = b[j];
        if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
        else if (q.c !== p.c && q.c !== 'n') out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j });
      });
      for (var j = 0; j < b.length; j++) {
        var q = b[j]; if (!q || q.c === p.c || q.c === 'n' || near[j] || V.def(q.t).royal || V.def(q.t).blocker) continue;
        if (sqColor(g, j) === own) out.push({ f: i, t: i, p: p.t, c: p.c, cap: q, capSq: j, reap: 1 });
      }
    },
    fool: function (V, st, i, p, out) {
      var e = p.c === 'w' ? 'b' : 'w', t = st.x && st.x.lt && st.x.lt[e];
      if (!t || t === p.t || V.def(t).royal || V.def(t).blocker) {   /* nothing to copy: a king step */
        D8.forEach(function (dd) { var j = V.geo.step(i, dd[0], dd[1]); if (j < 0) return; var q = st.b[j]; if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); else if (q.c !== p.c && q.c !== 'n' && !V.def(q.t).blocker) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j }); });
        return;
      }
      var b = st.b.slice(), tmp = []; b[i] = Object.assign({}, p, { t: t });
      V.genPiece(Object.assign({}, st, { b: b }), i, tmp, true);
      tmp.forEach(function (m) { if (!m.promo) out.push(Object.assign({}, m, { p: p.t })); });
    },
    onMake: function (V, st, m, n) {
      if (m.p && !m.pass) { var lt = Object.assign({}, st.x && st.x.lt); lt[m.c] = m.p; n.x = Object.assign({}, n.x, { lt: lt }); }
      if (!m.reap) return;
      n.b[m.f] = st.b[m.f]; n.b[m.capSq] = null;   /* the Reaper stays put; the victim vanishes */
    },
    filterMoves: function (V, st, legal) {
      var pt = prm(V).princeType || 'I', g = V.geo;
      return legal.filter(function (m) {
        if (!m.cap || !V.def(m.cap.t).royal) return true;
        var sq = m.capSq != null ? m.capSq : m.t;
        for (var i = 0; i < st.b.length; i++) { var q = st.b[i]; if (q && q.c === m.cap.c && q.t === pt && g.dist(i, sq) <= 3) return false; }
        return true;
      });
    },
    checkWin: function (V, st) {
      if (prm(V).finisher === false) return null;
      var me = st.turn, opp = me === 'w' ? 'b' : 'w', mine = 0, theirs = 0, theirR = 0;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var r = V.def(p.t).royal; if (p.c === me && !r) mine++; if (p.c === opp) { if (r) theirR++; else theirs++; } }
      if (theirR && !theirs && mine && V.royals(st, me).length) return { w: me, why: 'The Finisher: the enemy leader stands alone' };
      return null;
    },
    afterMove: function (ctx, m) {
      if (m && m.reap) { ctx.fx({ type: 'flash', color: '#9b5cff', opacity: 0.5, at: m.capSq, duration_ms: 300 }); ctx.sound(ctx.spec.sounds && ctx.spec.sounds.reap ? 'reap' : 'capture'); }
      var r = run(ctx);
      if (r && r.relics.bell && !ctx.over && ctx.state.turn !== ctx.human) {   /* Alarm Bell: checked when the enemy is about to move */
        var V = ctx.V, st = ctx.state, kq = V.royals(st, ctx.human);
        var danger = ctx.game.moves && ctx.game.moves.some(function (mm) { return mm.cap && V.def(mm.cap.t).royal && mm.cap.c === ctx.human; });
        if (danger) { ctx.sound('notify'); kq.forEach(function (i) { ctx.fx({ type: 'flash', color: '#e0505f', opacity: 0.55, at: i, duration_ms: 600 }); }); ctx.toast('Alarm Bell: your king is in danger!', 1800); }
      }
      if (r) hud(ctx);
      return null;
    },
    decorate: function (ctx, sq) {
      var zone = ctx.params.enemyRows || 2, g = ctx.V.geo;
      if (g.relRow(sq, ctx.bot) < zone) return { cls: 'g5ob-zone' };
      return null;
    },
    init: function () { if (!document.getElementById('g5-ob-css')) { var s = document.createElement('style'); s.id = 'g5-ob-css'; s.textContent = '.g5ob-zone{box-shadow:inset 0 0 0 999px rgba(214,96,150,.22)}'; document.head.appendChild(s); } },
    onGameOver: function (ctx, over) {
      var id = ctx.spec.id, l = B(ctx), k = pos[id] || 0, glass = ctx.params.glassType || 'Q', human = ctx.human;
      var hasGlass = ctx.state.b.some(function (p) { return p && p.c === human && p.t === glass; });
      if (over.w === human) {
        if (ctx.params.victoryImg) ctx.fx({ type: 'overlay', at: 'board', image: ctx.params.victoryImg, fit: 'contain', duration_ms: 2200, fade_ms: 250, id: 'g5victory' });
        if (!hasGlass && ctx.state.b && l[k] && /Q/.test(l[k].fen)) lost[id] = 1;
        pos[id] = k < l.length - 1 ? k + 1 : 0;
        if (pos[id] === 0) lost[id] = 0;
        ctx.toast(k < l.length - 1 ? 'VICTORY! New game starts battle ' + (k + 2) + '.' + (lost[id] ? ' Your Glass Queen shattered for good.' : '') : 'The Ouroboros is defeated: run complete!', 3600);
        var r = run(ctx);
        if (r) {
          if (pos[id] === 0) { delete RUN[id]; }
          else { r.gold += ctx.params.run.reward || 200; hud(ctx); setTimeout(function () { if (!ctx.game || ctx.game.over == null) return; nodeMap(ctx); }, 2400); }
        }
      } else { pos[id] = 0; lost[id] = 0; delete RUN[id]; ctx.toast('Your king fell. The run starts over.', 3000); }
    },
    status: function (ctx) { var l = B(ctx), k = idx(ctx), b = l[k] || {}; return (b.region ? b.region + ' - ' : '') + 'Battle ' + (k + 1) + '/' + l.length + (b.name ? ': ' + b.name : ''); }
  });
})();
