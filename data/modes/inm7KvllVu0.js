/* I Added Portals to Chess: standard chess vs Stockfish (3600), but you can place a linked pair of portals (blue +
   orange, Portal-game style) on any squares, for free, whenever it is your turn. A piece of yours that moves onto one
   portal comes out of the other (capturing there if an enemy stands on it). Stockfish plays normal chess and never uses
   portals. Sources: research/modes/inm7KvllVu0.json, frames visual_* (green #f1f4dd/#619045, magenta portal squares,
   pink arrows through portals). Controls match the other portal mode and the reference site: double-tap an empty square
   for blue, double-right-click one for orange. */
(function () {
  'use strict';
  function other(x, sq) { return x.pb === sq ? x.po : x.po === sq ? x.pb : -1; }
  /* pink arrows through the portals for the selected piece's teleport moves (legal-move preview, as in the video) */
  var _pv = '';
  function preview(ctx) {
    var g = ctx.game, sel = g.sel, key = sel + '|' + ctx.ply;
    if (key === _pv) return; _pv = key; ctx.clearFx('highlight');
    if (sel == null || sel < 0 || ctx.state.turn !== ctx.human) return;
    (g.moves || []).forEach(function (m, k) {
      if (m.f !== sel || m.tp == null) return;
      ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(m.t), color: 'rgba(224,95,179,.8)', duration_ms: 1600 });   /* arrows fade (vfx arrows are timed) */
      ctx.fx({ type: 'highlight', id: 'pv' + k, at: ctx.name(m.tp), color: 'rgba(224,95,179,.45)', duration_ms: 0 });      /* exit square stays marked while selected */
    });
  }
  /* touch controls (owner 2026-11-26: "make portal mode compatible with mobile"): a Blue / Orange bar under the board.
     Tap a button to arm that portal, then tap any empty square (the whole square is the target, armed squares show a
     tinted preview); tap the button again to disarm. Long-pressing an empty square places orange directly (board-view
     long-press -> doubleRightTap). Desktop keeps double-click / double-right-click. */
  var ARM = { k: null }, COL = { b: '#2f8cff', o: '#ff8a1f' };
  function bar(ctx) {
    var el = document.getElementById('game-controls'); if (!el) return;
    var G = ctx.game, x = ctx.state.x || {}, mine = ctx.state.turn === ctx.human && !ctx.over && !G.busy;
    var btn = function (k, label) {
      var on = ARM.k === k, has = (k === 'b' ? x.pb : x.po) >= 0;
      return '<button type="button" class="gctl' + (on ? ' gctl--primary' : '') + '" data-k="' + k + '" aria-pressed="' + on + '"' + (mine ? '' : ' disabled') +
        ' style="width:auto;min-width:128px;height:48px;padding:0 14px;font-weight:700;font-size:14px;display:flex;gap:8px;align-items:center;justify-content:center">' +
        '<span style="width:14px;height:22px;border-radius:50%;border:3px solid ' + COL[k] + ';box-shadow:0 0 6px ' + COL[k] + '"></span>' + (has ? 'Move ' : 'Place ') + label + '</button>';
    };
    var h = '<div class="grp">' + btn('b', 'blue') + btn('o', 'orange') + '</div>';
    if (el._h !== h || el.hidden) { el.innerHTML = h; el._h = h; el.hidden = false; CM.gameUI.layout(); }
    el.onpointerdown = el.onpointerup = el.onpointercancel = null;
    el.onclick = function (e) {
      var b = e.target.closest('[data-k]'); if (!b || b.disabled) return;
      ARM.k = ARM.k === b.dataset.k ? null : b.dataset.k; G.sel = -1; bar(ctx); G.render();
    };
  }
  function unbar() { var el = document.getElementById('game-controls'); if (!el) return; el.hidden = true; el.innerHTML = ''; el._h = ''; el.onclick = null; if (CM.gameUI && CM.gameUI.layout) CM.gameUI.layout(); }
  function place(ctx, which, i) {
    var G = ctx.game;
    if (i < 0 || !G.V.geo.valid[i] || G.state.b[i]) { CM.sound.play('illegal'); ctx.toast('Portals go on empty squares only.', 1400); return false; }
    var x = Object.assign({}, ctx.state.x), key = which === 'b' ? 'pb' : 'po', other = which === 'b' ? 'po' : 'pb';
    if (x[other] === i) x[other] = -1;
    x[key] = i; x.next = which === 'b' ? 'o' : 'b';
    ctx.state = Object.assign({}, ctx.state, { x: x });
    G.sel = -1; ARM.k = null; ctx.sound('notify');
    ctx.fx({ type: 'flash', at: ctx.name(i), color: COL[which], opacity: 0.6, duration_ms: 400 });
    ctx.refresh(); bar(ctx);
    return true;
  }
  function portalize(V, st, out) {
    var x = st.x || {}; if (x.pb == null || x.po == null || x.pb < 0 || x.po < 0) return out;
    var res = [];
    out.forEach(function (m) {
      if (m.c !== 'w' || m.f < 0 || m.castle) { res.push(m); return; }
      var B = other(x, m.t); if (B < 0) { res.push(m); return; }
      if (m.cap && (m.capSq == null || m.capSq === m.t)) { res.push(m); return; } /* capturing on a portal square: no teleport */
      var q = st.b[B];
      if (B === m.f) { res.push(m); return; }
      if (q && (q.c === 'w' || V.def(q.t).royal || !V.canCapture(st.b[m.f], q))) return;   /* exit blocked; the king cannot be pulled through a portal */
      res.push(Object.assign({}, m, { tp: B, cap: q || m.cap || null, capSq: q ? B : m.capSq, dbl: null, promo: m.promo }));
    });
    return res;
  }
  CM.mode({
    id: 'inm7KvllVu0',
    title: 'I Added Portals to Chess',
    name: 'Portal Chess',
    category: 'Variants & Games',
    description: 'Normal chess against Stockfish, but you own a pair of linked portals. Place them on empty squares: on a phone tap Place blue / Place orange under the board and then a square (or long-press a square for orange); on a computer double-click a square for blue and double-right-click for orange. Placing is free and you can move them every turn. Any of your pieces that moves onto a portal comes out of the other one, capturing an enemy there; a king cannot be pulled through, and a pawn that exits on the last rank queens. Stockfish never uses portals.',
    how_to_win: 'Checkmate Stockfish. Bonus: do it in under 15 moves.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/inm7KvllVu0/stockfish.png', tagline: 'Does not see your portals coming.' },
    board: { files: 8, ranks: 8, light: '#f1f4dd', dark: '#619045' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { pb: -1, po: -1, next: 'b' } },
    rules: { castling: true, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
    bot: { engine: 'auto', elo: 3600, depth: 3, time_ms: 700 },
    hooks: {
      stockfishOk: true,
      moves: function (V, st, out) { return portalize(V, st, out); },
      onMake: function (V, st, m, n) {
        if (m.tp == null) return;
        var p = n.b[m.t]; n.b[m.t] = null;
        /* a pawn that comes out on the last rank queens, as on the reference site */
        if (p && V.def(p.t).pawn && V.geo.relRow(m.tp, 'w') === V.geo.depth('w') - 1) p = Object.assign({}, p, { t: 'Q', promoted: 1 });
        n.b[m.tp] = p;
      },
      attacks: function (V, st, sq, by) {
        var x = st.x || {}; if (by !== 'w' || x.pb == null || x.pb < 0 || x.po < 0) return false;
        var A = other(x, sq); if (A < 0 || st.b[A]) return false;
        for (var i = 0; i < st.b.length; i++) {
          var p = st.b[i]; if (!p || p.c !== 'w' || V.def(p.t).pawn) continue;
          var out = []; V.genPiece(st, i, out, true);
          for (var k = 0; k < out.length; k++) if (out[k].t === A && !out[k].cap) return true;
        }
        return false;
      },
      /* the reference site's controls, shared with the other portal mode: double-click empty = blue,
         double-right-click empty = orange (placement is free and can be repeated every turn) */
      canDoubleTap: function (ctx, sq) {
        return !ctx.over && !ctx.busy && ctx.state.turn === ctx.human && ctx.game.sel < 0 && ctx.geo.valid[sq] && !ctx.state.b[sq];
      },
      doubleTap: function (ctx, sq) { return place(ctx, 'b', sq); },
      doubleRightTap: function (ctx, sq) { return place(ctx, 'o', sq); },
      /* armed portal button: the next tap on the board places it (a tap on a piece or an occupied square disarms) */
      onTap: function (ctx, sq) {
        if (!ARM.k || ctx.over || ctx.busy || ctx.state.turn !== ctx.human) return false;
        if (!ctx.geo.valid[sq] || ctx.state.b[sq]) { ARM.k = null; bar(ctx); ctx.refresh(); return false; }
        place(ctx, ARM.k, sq); return true;
      },
      onStart: function (ctx) { ARM.k = null; document.documentElement.style.setProperty('--lp-color', COL.o); bar(ctx); },
      onTurn: function (ctx) { bar(ctx); },
      onUndo: function (ctx) { ARM.k = null; ctx.after(30, function () { bar(ctx); }); },
      onGameOver: function (ctx) { ARM.k = null; bar(ctx); },
      onExit: function () { ARM.k = null; unbar(); document.documentElement.style.removeProperty('--lp-color'); },
      decorate: function (ctx, sq) {
        var x = ctx.state.x || {};
        if (sq === 0) preview(ctx);
        /* placement preview: while a portal button is armed every empty square shows a faint ring in that colour */
        if (ARM.k && sq !== x.pb && sq !== x.po && ctx.geo.valid[sq] && !ctx.state.b[sq] && !ctx.over && ctx.state.turn === ctx.human) return { cls: 'g4portal-pv', html: '<span class="sq-tint" style="background:' + COL[ARM.k] + ';opacity:.16"></span><span class="g4portal-pv__o" style="border-color:' + COL[ARM.k] + '"></span>' };
        /* the Portal-game ovals from the video (sprites inm7KvllVu0_portal_blue/orange.png) on the magenta portal square */
        if (sq === x.pb) return { cls: 'g4portal g4portal--b', html: '<img class="g4portal__ring" alt="" src="assets/modes/inm7KvllVu0/portal_blue.png">' };
        if (sq === x.po) return { cls: 'g4portal g4portal--o', html: '<img class="g4portal__ring" alt="" src="assets/modes/inm7KvllVu0/portal_orange.png">' };
        return null;
      },
      afterMove: function (ctx, m) {
        if (m.tp != null) {
          ctx.clearFx('highlight'); _pv = '';
          ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(m.t), color: '#e05fb3', duration_ms: 700 });
          ctx.fx({ type: 'flash', at: ctx.name(m.t), color: '#2f8cff', opacity: 0.6, duration_ms: 350 });   /* in through one portal ... */
          ctx.fx({ type: 'flash', at: ctx.name(m.tp), color: '#ff9a2e', opacity: 0.7, delay_ms: 120, duration_ms: 450 });  /* ... out of the other */
        }
      },
      init: function () {
        if (document.getElementById('g4portal-css')) return;
        var c = document.createElement('style'); c.id = 'g4portal-css';
        c.textContent = '.g4portal__ring{position:absolute;top:4%;bottom:4%;left:30%;width:40%;height:92%;object-fit:contain;pointer-events:none;z-index:1}' +
          '.g4portal--b{color:#2f8cff}.g4portal--o{color:#ff8a1f}' +
          '.sq.g4portal{background:#cd7cdf}' +
          '.g4portal-pv__o{position:absolute;left:34%;width:32%;top:14%;height:72%;border:3px dashed;border-radius:50%;opacity:.75;pointer-events:none;z-index:1}' +
          '';  /* pol-q3: flat magenta sampled from the video's portal square (old 33px crop had a blurry king baked in) */
        document.head.appendChild(c);
      },
      status: function (ctx) {
        var x = ctx.state.x || {}; if (ctx.over) return null;
        var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        if (ARM.k) return 'Tap an empty square for the ' + (ARM.k === 'b' ? 'blue' : 'orange') + ' portal.';
        if (x.pb < 0) return touch ? 'Tap Place blue, then an empty square, for your blue portal.' : 'Double-click an empty square for your blue portal (or use Place blue).';
        if (x.po < 0) return touch ? 'Tap Place orange (or long-press an empty square) for your orange portal.' : 'Double-right-click an empty square for your orange portal (or use Place orange).';
        return 'Portals: blue ' + ctx.name(x.pb) + ' · orange ' + ctx.name(x.po) + (touch ? ' (Move blue / Move orange to change them)' : ' (double-click / double-right-click to move them)');
      }
    },
    source: { research: 'research/modes/inm7KvllVu0.json', confidence: 'high', notes: 'Placement free and changeable each turn (inferred from the transcript). Capturing on a portal square does not teleport (inferred). Double-tap replaces double left/right click. Portal sprites (sprite-sweep): redrawn as clean transparent glowing ovals matching the blue/orange Portal rings in https://i.ytimg.com/vi/inm7KvllVu0/maxresdefault.jpg (old crops were clipped and had the green square baked in).' }
  });
})();
