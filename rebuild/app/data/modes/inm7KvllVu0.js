/* I Added Portals to Chess: standard chess vs Stockfish (3600), but you can place a linked pair of portals (blue +
   orange, Portal-game style) on any squares, for free, whenever it is your turn. A piece of yours that moves onto one
   portal comes out of the other (capturing there if an enemy stands on it). Stockfish plays normal chess and never uses
   portals. Sources: research/modes/inm7KvllVu0.json, frames visual_* (green #f1f4dd/#619045, magenta portal squares,
   pink arrows through portals). Controls: double-tap a square to place the blue portal, double-tap again elsewhere to
   place the orange one (then they alternate). Uses the impl-4 hooks.onTap addition in js/game/spec-game.js. */
(function () {
  'use strict';
  function other(x, sq) { return x.pb === sq ? x.po : x.po === sq ? x.pb : -1; }
  function portalize(V, st, out) {
    var x = st.x || {}; if (x.pb == null || x.po == null || x.pb < 0 || x.po < 0) return out;
    var res = [];
    out.forEach(function (m) {
      if (m.c !== 'w' || m.f < 0 || m.castle) { res.push(m); return; }
      var B = other(x, m.t); if (B < 0) { res.push(m); return; }
      if (m.cap && (m.capSq == null || m.capSq === m.t)) { res.push(m); return; } /* capturing on a portal square: no teleport */
      var q = st.b[B];
      if (B === m.f) { res.push(m); return; }
      if (q && (q.c === 'w' || !V.canCapture(st.b[m.f], q))) return;   /* exit blocked */
      if (V.def(m.p).pawn && (V.geo.relRow(B, 'w') === 7 || V.geo.relRow(B, 'w') === 0)) return;
      res.push(Object.assign({}, m, { tp: B, cap: q || m.cap || null, capSq: q ? B : m.capSq, dbl: null, promo: m.promo }));
    });
    return res;
  }
  CM.mode({
    id: 'inm7KvllVu0',
    title: 'I Added Portals to Chess',
    name: 'Portal Chess',
    category: 'Variants & Games',
    description: 'Normal chess against Stockfish, but you own a pair of linked portals. Double-tap any square to place the blue portal, double-tap another to place the orange one (placing is free and you can move them every turn). Any of your pieces that moves onto a portal comes out of the other one, capturing there if an enemy piece stands on it. Stockfish never uses portals.',
    how_to_win: 'Checkmate Stockfish. Bonus: do it in under 15 moves.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Does not see your portals coming.' },
    board: { files: 8, ranks: 8, light: '#f1f4dd', dark: '#619045' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { pb: -1, po: -1, next: 'b' } },
    rules: { castling: true, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
    bot: { engine: 'auto', elo: 3600, depth: 3, time_ms: 700 },
    hooks: {
      stockfishOk: true,
      moves: function (V, st, out) { return portalize(V, st, out); },
      onMake: function (V, st, m, n) {
        if (m.tp == null) return;
        var p = n.b[m.t]; n.b[m.t] = null; n.b[m.tp] = p;
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
      onTap: function (ctx, i) {
        var g = ctx.game, now = performance.now(), last = g._ptap;
        g._ptap = { i: i, t: now };
        if (!last || last.i !== i || now - last.t > 420) return false;
        g._ptap = null;
        if (ctx.over || ctx.state.turn !== ctx.human || g.busy) return true;
        var x = Object.assign({}, ctx.state.x), which = x.next || 'b';
        if ((which === 'b' ? x.po : x.pb) === i) which = which === 'b' ? 'o' : 'b';
        if (which === 'b') { x.pb = i; x.next = 'o'; } else { x.po = i; x.next = 'b'; }
        var st = Object.assign({}, ctx.state, { x: x }); ctx.state = st;
        g.sel = -1; ctx.sound('notify'); ctx.refresh();
        return true;
      },
      decorate: function (ctx, sq) {
        var x = ctx.state.x || {};
        if (sq === x.pb) return { cls: 'g4portal g4portal--b', html: '<span class="g4portal__ring"></span>' };
        if (sq === x.po) return { cls: 'g4portal g4portal--o', html: '<span class="g4portal__ring"></span>' };
        return null;
      },
      afterMove: function (ctx, m) {
        if (m.tp != null) { ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(m.t), color: '#e05fb3', duration_ms: 700 }); ctx.fx({ type: 'flash', at: ctx.name(m.tp), color: '#ff9a2e', duration_ms: 450 }); }
      },
      init: function () {
        if (document.getElementById('g4portal-css')) return;
        var c = document.createElement('style'); c.id = 'g4portal-css';
        c.textContent = '.g4portal__ring{position:absolute;inset:6% 16%;border-radius:50%;border:4px solid currentColor;box-shadow:0 0 8px currentColor,inset 0 0 8px currentColor;pointer-events:none;z-index:1}' +
          '.g4portal--b{color:#2f8cff}.g4portal--o{color:#ff8a1f}' +
          '.sq.g4portal{background-image:url(assets/modes/inm7KvllVu0/portal_square.png);background-size:cover}';  /* magenta portal square cropped from the video */
        document.head.appendChild(c);
      },
      status: function (ctx) {
        var x = ctx.state.x || {}; if (ctx.over) return null;
        if (x.pb < 0) return 'Double-tap a square to place your blue portal';
        if (x.po < 0) return 'Double-tap another square to place your orange portal';
        return 'Portals: blue ' + ctx.name(x.pb) + ' · orange ' + ctx.name(x.po) + ' (double-tap to move them)';
      }
    },
    source: { research: 'research/modes/inm7KvllVu0.json', confidence: 'high', notes: 'Placement free and changeable each turn (inferred from the transcript). Capturing on a portal square does not teleport (inferred). Double-tap replaces double left/right click.' },
    todo_pass2: ['Portal-game swirl ring art + teleport VFX/sound', 'pink arrows through portals for legal-move preview']
  });
})();
