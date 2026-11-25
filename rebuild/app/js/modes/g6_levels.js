/* g6_levels: group-6 runs of fixed rounds / puzzle levels (chess roguelikes such as Passant, Gambonanza, Shotgun King,
   Pawnbarian; practice menus such as Infinite Chess; puzzle platformers such as Chess with Gravity).
   Mode params:
     levels: [{ name, fen, turn, hint, x, opponent: {name, rating, avatar, tagline}, reward }]
     passColor: 'b'      that colour never moves (static target): it always gets one "pass" move
     passant: true       Passant victory conditions for White (any one wins the round), in addition to checkmate /
                         king capture: deliver check 6 of your turns in a row, capture every enemy piece except the
                         king, or gain +7 material (relative to the round's starting balance) and keep it for two of your turns. Shows the counters.
     run: 'Run'          label for the progress line ('Stage', 'Floor', 'Level', ...)
     money: true         show a $ total (each level's reward, default $8) earned across the run
     captureOnly: 'b'    that colour only ever captures (sentries that strike what enters their line); else it passes
     freezer: 'Ct'       piece type that freezes the enemy pieces next to it (Passant Courtisan)
     unlock: { key: 'Ky', lock: 'Lk' }  capturing a key piece removes every lock block (puzzle platformers)
     (state.x.passColor / state.x.captureOnly set in a level's x override the params for that level)
     slippy: true        Passant "Slippy" badge: a White piece that moved in a straight line slides one more square in
                         that direction if it is empty (off the board = lost); knight jumps do not slip
     levelSelect: true   a "Levels" button opens the level list (completion ticks, lv.tier labels); picking one
                         starts it (infinitechess.org practice menu)
     zoom: [8, 12, 24]   a "Zoom out" button cycles the visible window of a big board through these sizes
   Named generator: portal (any empty square, captures adjacent only).
   Winning a level moves you to the next one on New game; losing keeps you on it (roguelike retry). */
(function () {
  'use strict';
  var CM = window.CM;
  var mem = {};
  function M(ctx) { var id = ctx.spec.id; return mem[id] || (mem[id] = { k: 0, cash: 0 }); }
  function L(ctx) { return ctx.params.levels || []; }
  function cur(ctx) { var l = L(ctx); return l[Math.min(M(ctx).k, l.length - 1)] || {}; }
  function mat(V, st, c) { var s = 0; st.b.forEach(function (p) { if (p && p.c === c && !p.dead) { var d = V.def(p.t); if (!d.royal && !d.blocker) s += d.value || 0; } }); return s; }
  /* impl-6 pass 2: tool buttons under the status line (level list, zoom), as the sites in the videos have them */
  function tools(ctx) {
    var old = document.getElementById('g6-tools'); if (old) old.remove();
    var P = ctx.params, st = document.getElementById('status'); if (!st || !st.parentNode || !(P.levelSelect || P.zoom)) return;
    var bar = document.createElement('div'); bar.id = 'g6-tools'; bar.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:6px';
    var btn = function (label, fn) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = label; b.onclick = fn; bar.appendChild(b); return b; };
    if (P.levelSelect) btn('Levels', function () { levelList(ctx); });
    if (P.zoom) zoomBtn(ctx, btn);
    st.parentNode.insertBefore(bar, st.nextSibling);
  }
  function zoomBtn(ctx, btn) {   // cycles the big board's visible window through params.zoom sizes (keeps the follow target)
    var Z = ctx.params.zoom, vp = ctx.spec.board.viewport || {}, cur = (vp.mobile && window.innerWidth < 900 ? vp.mobile.files : vp.files) || Z[0];
    var zi = Math.max(0, Z.indexOf(cur)), b = btn(zi === Z.length - 1 ? 'Zoom in' : 'Zoom out', function () {
      zi = (zi + 1) % Z.length; var n = Z[zi], nv = Object.assign({}, ctx.spec.board.viewport, { files: n, ranks: n, mobile: { files: n, ranks: n } });
      ctx.spec.board.viewport = nv; CM.gameUI.setViewport(nv); ctx.game.render({ instant: true }); b.textContent = zi === Z.length - 1 ? 'Zoom in' : 'Zoom out';
    });
  }
  function levelList(ctx) {
    var wrap = document.getElementById('board-wrap'); if (!wrap) return;
    var m = M(ctx), done = m.done || {}, el = document.createElement('div'); el.id = 'g6-levels';
    el.style.cssText = 'position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(38,37,34,.96);padding:12px;display:flex;flex-direction:column;gap:6px';
    el.innerHTML = '<b style="text-align:center;color:#fff;font-size:16px;margin-bottom:4px">' + (ctx.params.run || 'Level') + 's</b>' + L(ctx).map(function (lv, k) {
      return '<button type="button" class="btn" data-k="' + k + '" style="justify-content:space-between;text-align:left' + (k === m.k ? ';outline:2px solid #81b64c' : '') + '"><span>' + (k + 1) + '. ' + CM.util.esc(lv.name || '') + (lv.tier ? ' <i style="opacity:.7">(' + CM.util.esc(lv.tier) + ')</i>' : '') + '</span><span style="color:#81b64c">' + (done[k] ? '\u2713' : '') + '</span></button>';
    }).join('') + '<button type="button" class="btn" data-close="1">Close</button>';
    el.onclick = function (e) { var b = e.target.closest('[data-k],[data-close]'); if (!b) return; el.remove(); if (b.dataset.k != null) { m.k = +b.dataset.k; ctx.game.newGame(); } };
    wrap.appendChild(el);
  }
  function nonKing(V, st, c) { var n = 0; st.b.forEach(function (p) { if (p && p.c === c && !p.dead && !V.def(p.t).royal && !V.def(p.t).blocker) n++; }); return n; }
  CM.defineHooks('g6_levels', {
    setup: function (ctx) {
      var lv = cur(ctx), V = ctx.V, st = ctx.state;
      if (lv.fen) {
        st.b = CM.spec.parseSetup(V, lv.fen);
        st.b.forEach(function (p, i) { if (p && p.c !== 'n' && V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) st.b[i] = Object.assign({}, p, { m: 1 }); });
      }
      if (lv.turn) st.turn = lv.turn;
      st.x = Object.assign({}, st.x, { chk: 0, lead: 0, enemy0: 0 }, lv.x || {});
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
      st.x.enemy0 = nonKing(V, st, 'b'); st.x.diff0 = mat(V, st, 'w') - mat(V, st, 'b');
      var lst = document.getElementById('g6-levels'); if (lst) lst.remove();
      tools(ctx);
      if (lv.opponent) Object.assign(ctx.opponent, lv.opponent, lv.opponent.rating ? { elo: lv.opponent.rating } : {});
    },
    onStart: function (ctx) {
      var lv = cur(ctx), l = L(ctx), k = Math.min(M(ctx).k, l.length - 1);
      ctx.toast((ctx.params.run || 'Level') + ' ' + (k + 1) + '/' + l.length + (lv.name ? ': ' + lv.name : '') + (lv.hint ? '. ' + lv.hint : ''), 3600);
    },
    moves: function (V, st, out) {
      var P = V.cfg.params || {}, X = st.x || {}, pc = X.passColor || P.passColor, co = X.captureOnly || P.captureOnly;
      if (co && st.turn === co) {
        var caps = out.filter(function (m) { return m.cap; });
        if (caps.length) return caps;
        pc = co;
      }
      if (!pc || st.turn !== pc) return out;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === pc) return [{ f: i, t: i, p: p.t, c: pc, cap: null, pass: 1 }]; }
      return out;
    },
    filterMoves: function (V, st, legal) {
      var T = V.cfg.params && V.cfg.params.freezer; if (!T) return legal;
      var g = V.geo, fz = [];
      st.b.forEach(function (p, i) { if (p && p.t === T && p.c !== st.turn) fz.push(i); });
      if (!fz.length) return legal;
      var out = legal.filter(function (m) { return m.f < 0 || !fz.some(function (z) { return g.dist(z, m.f) === 1; }); });
      return out.length ? out : legal;
    },
    onMake: function (V, st, m, n) {
      var P = V.cfg.params || {}, g = V.geo;
      if (P.slippy && st.turn === 'w' && m.f >= 0 && m.f !== m.t && n.b[m.t] && n.b[m.t].c === 'w') {
        var dc = g.col(m.t) - g.col(m.f), dr = g.row(m.t) - g.row(m.f);
        if (dc === 0 || dr === 0 || Math.abs(dc) === Math.abs(dr)) {
          var s2 = g.step(m.t, Math.sign(dc), Math.sign(dr));
          if (s2 === -1 || s2 === -2) n.b[m.t] = null;
          else if (s2 >= 0 && !n.b[s2]) { n.b[s2] = n.b[m.t]; n.b[m.t] = null; }
        }
      }
      if (P.unlock) {
        var kc = st.b[m.capSq != null ? m.capSq : m.t];
        if (kc && kc.t === P.unlock.key && kc.c !== st.turn) for (var q = 0; q < n.b.length; q++) if (n.b[q] && n.b[q].t === P.unlock.lock) n.b[q] = null;
      }
      if (!P.passant || st.turn !== 'w') return;
      var bk = V.royals(n, 'b');
      var chk = bk.length && V.attacked(n, bk[0], 'w');
      n.x.chk = chk ? (st.x.chk || 0) + 1 : 0;
      n.x.lead = mat(V, n, 'w') - mat(V, n, 'b') - (st.x.diff0 || 0) >= 700 ? (st.x.lead || 0) + 1 : 0;
    },
    checkWin: function (V, st) {
      if (!(V.cfg.params && V.cfg.params.passant)) return null;
      var x = st.x || {};
      if ((x.chk || 0) >= 6) return { w: 'w', why: 'six checks in a row' };
      if ((x.lead || 0) >= 2) return { w: 'w', why: '+7 material for two turns' };
      if (x.enemy0 && nonKing(V, st, 'b') === 0 && V.royals(st, 'b').length) return { w: 'w', why: 'every enemy piece except the king was captured' };
      return null;
    },
    onGameOver: function (ctx, over) {
      var m = M(ctx), l = L(ctx), lv = cur(ctx);
      if (over.w === ctx.human) {
        (m.done || (m.done = {}))[Math.min(m.k, l.length - 1)] = 1;
        m.cash += lv.reward != null ? lv.reward : 8;
        if (m.k < l.length - 1) { m.k++; ctx.toast('Round cleared' + (ctx.params.money ? ' (+$' + (lv.reward != null ? lv.reward : 8) + ')' : '') + '! New game starts ' + (ctx.params.run || 'level').toLowerCase() + ' ' + (m.k + 1) + ': ' + (l[m.k].name || ''), 3600); }
        else { m.k = 0; ctx.toast('Run complete! Every ' + (ctx.params.run || 'level').toLowerCase() + ' cleared.', 4000); m.cash = 0; }
      } else if (over.w !== 'd') ctx.toast('Run over at ' + (ctx.params.run || 'level').toLowerCase() + ' ' + (m.k + 1) + '. New game retries it.', 3200);
    },
    status: function (ctx) {
      var l = L(ctx), m = M(ctx), k = Math.min(m.k, l.length - 1), lv = cur(ctx), x = ctx.state.x || {};
      var s = (ctx.params.run || 'Level') + ' ' + (k + 1) + '/' + l.length + (lv.name ? ': ' + lv.name : '');
      if (ctx.params.money) s += ' · $' + m.cash;
      if (ctx.params.passant) s += ' · checks ' + (x.chk || 0) + '/6 · lead turns ' + (x.lead || 0) + '/2';
      return s;
    },
    /* named generator (pieces.X.gen: 'portal'): Ouroboros King Portal Mage, moves to any empty square, kills only next to itself */
    portal: function (V, st, from, p, out) {
      var g = V.geo;
      for (var i = 0; i < st.b.length; i++) {
        if (i === from || !g.isValid(i)) continue; var q = st.b[i];
        if (!q) out.push({ f: from, t: i, p: p.t, c: p.c, cap: null });
        else if (q.c !== p.c && q.c !== 'n' && g.dist(from, i) === 1) out.push({ f: from, t: i, p: p.t, c: p.c, cap: q });
      }
    },
    onExit: function () { ['g6-tools', 'g6-levels'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); }); },
    camera: function (ctx) { var k = ctx.V.royals(ctx.state, ctx.bot)[0]; return k != null ? k : null; }
  });
})();
