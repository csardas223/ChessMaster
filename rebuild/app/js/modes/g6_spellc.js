/* g6_spellc: chess.com Spell Chess. Each side has Jump spells (default 2) and Freeze spells (default 5).
   Jump: a rook, bishop or queen may pass through exactly one piece on its line this move (the jumped piece stays);
         offered automatically as extra legal moves while you have a Jump charge ready.
   Freeze: before moving, cast on a square: every piece in the 3x3 area around it cannot move on the opponent's next
         turn. Use the Freeze button under the board, then tap the centre square. The bot casts it too.
   A spell recharges for three turns before it can be used again (so the same spell is never used twice in a row).
   King capture decides the game (rules.check: 'none').
   params: { jump: 2, freeze: 5, cooldown: 3 }  state.x.sp = { w: {J, F, jr, fr}, b: ... } (jr/fr = ply when ready) */
(function () {
  'use strict';
  var DIRS = { R: [[1, 0], [-1, 0], [0, 1], [0, -1]], B: [[1, 1], [1, -1], [-1, 1], [-1, -1]] };
  DIRS.Q = DIRS.R.concat(DIRS.B);
  function P(V) { return V.cfg.params || {}; }
  function sp(st, c) { return (st.x.sp || {})[c] || { J: 0, F: 0, jr: 0, fr: 0 }; }
  function jumpReady(st, c) { var s = sp(st, c); return s.J > 0 && st.ply >= s.jr; }
  function freezeReady(st, c) { var s = sp(st, c); return s.F > 0 && st.ply >= s.fr; }
  function area(g, i) { var o = []; for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { var j = g.step(i, dc, dr); if (j >= 0) o.push(j); } return o; }
  function css() {
    if (document.getElementById('g6-spell-css')) return;
    var s = document.createElement('style'); s.id = 'g6-spell-css';
    s.textContent = '.g6-spells{display:flex;gap:6px;align-items:center;margin-left:auto;margin-right:8px}' +
      '.g6-spells button{display:flex;align-items:center;gap:4px;border:0;border-radius:6px;padding:4px 8px;background:#3a3835;color:#e8e6e1;font:600 12px/1 system-ui,sans-serif;cursor:pointer;transition:background .12s ease-out}' +
      '.g6-spells button[aria-pressed=true]{background:#5d9be0;color:#fff}.g6-spells button:disabled{opacity:.45;cursor:default}' +
      '.g6-spells svg{width:16px;height:16px}.sq.g6-frozen::after{content:"";position:absolute;inset:0;background:rgba(120,190,255,.38);box-shadow:inset 0 0 0 2px rgba(255,160,40,.9);pointer-events:none;z-index:2}';
    document.head.appendChild(s);
  }
  var POT = function (col) { return '<svg viewBox="0 0 24 24"><path d="M9 2h6v2h-1v4.2l4.6 7.6A3.5 3.5 0 0 1 15.6 21H8.4a3.5 3.5 0 0 1-3-5.2L10 8.2V4H9z" fill="' + col + '" stroke="#111" stroke-width="1"/></svg>'; };
  function castFreeze(ctx, center, by) {
    var V = ctx.V, st = ctx.state, s = Object.assign({}, sp(st, by)), cd = (ctx.params.cooldown || 3) * 2;
    s.F--; s.fr = st.ply + cd;
    var all = Object.assign({}, st.x.sp); all[by] = s;
    var x = Object.assign({}, st.x, { sp: all, frz: { c: V.opp(by), sq: area(V.geo, center) } });
    ctx.state = Object.assign({}, st, { x: x });
    ctx.fx({ type: 'flash', at: center, color: '#7cc0ff', opacity: 0.6, duration_ms: 500 });
    ctx.sound('notify');
  }
  var armed = false, onBoard = null;
  function disarm() { armed = false; var b = document.getElementById('board'); if (b && onBoard) b.removeEventListener('click', onBoard, true); onBoard = null; }
  function bar(ctx) {
    css();
    var host = document.getElementById('card-bottom'); if (!host) return;
    var el = host.querySelector('.g6-spells');
    if (!el) { el = document.createElement('div'); el.className = 'g6-spells'; host.insertBefore(el, document.getElementById('clock-bottom')); }
    var me = ctx.human, s = sp(ctx.state, me), myTurn = ctx.state.turn === me && !ctx.over && !ctx.game.busy;
    var html = '<button type="button" data-s="F" aria-pressed="' + armed + '"' + (myTurn && freezeReady(ctx.state, me) ? '' : ' disabled') + ' title="Freeze a 3x3 area">' + POT('#6fb6ff') + '×' + s.F + (s.F && ctx.state.ply < s.fr ? ' (' + Math.ceil((s.fr - ctx.state.ply) / 2) + ')' : '') + '</button>' +
      '<button type="button" data-s="J" disabled title="Jump moves are shown as extra legal moves while ready">' + POT('#6fd38a') + '×' + s.J + (s.J && ctx.state.ply < s.jr ? ' (' + Math.ceil((s.jr - ctx.state.ply) / 2) + ')' : '') + '</button>';
    if (el._h !== html) { el.innerHTML = html; el._h = html; }
    el.onclick = function (e) {
      var b = e.target.closest('[data-s="F"]'); if (!b || b.disabled) return;
      if (armed) { disarm(); ctx.game.render(); return; }
      armed = true; ctx.toast('Tap the centre of the 3x3 area to freeze.', 2000);
      onBoard = function (ev) {
        var sq = ev.target.closest('[data-i]'); if (!sq) return;
        ev.stopPropagation(); ev.preventDefault(); disarm();
        castFreeze(ctx, +sq.dataset.i, me); ctx.refresh();
      };
      document.getElementById('board').addEventListener('click', onBoard, true);
      ctx.game.render();
    };
  }
  CM.defineHooks('g6_spellc', {
    setup: function (ctx) {
      var p = ctx.params, mk = function () { return { J: p.jump != null ? p.jump : 2, F: p.freeze != null ? p.freeze : 5, jr: 0, fr: 0 }; };
      ctx.setX('sp', { w: mk(), b: mk() }); ctx.setX('frz', null); disarm();
    },
    moves: function (V, st, out) {
      var c = st.turn; if (!jumpReady(st, c)) return;
      var g = V.geo, b = st.b;
      for (var i = 0; i < b.length; i++) {
        var p = b[i]; if (!p || p.c !== c || p.dead || !DIRS[p.t]) continue;
        DIRS[p.t].forEach(function (d) {
          var j = i, hopped = false;
          for (var s = 0; s < 32; s++) {
            j = g.step(j, d[0], d[1]); if (j < 0) break;
            var q = b[j];
            if (!hopped) { if (q) { if (V.def(q.t).blocker) break; hopped = true; } continue; }
            if (q) { if (V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: c, cap: q, capSq: j, jump: 1 }); break; }
            out.push({ f: i, t: j, p: p.t, c: c, cap: null, jump: 1 });
          }
        });
      }
    },
    filterMoves: function (V, st, legal) {
      var f = st.x.frz; if (!f || f.c !== st.turn) return legal;
      var ok = legal.filter(function (m) { return m.drop || f.sq.indexOf(m.f) < 0; });
      return ok;
    },
    onMake: function (V, prev, m, n) {
      if (n.x.frz && n.x.frz.c === m.c) n.x.frz = null;
      if (m.jump) {
        var all = Object.assign({}, n.x.sp), s = Object.assign({}, all[m.c]); s.J--; s.jr = prev.ply + 1 + ((V.cfg.params || {}).cooldown || 3) * 2; all[m.c] = s; n.x.sp = all;
      }
    },
    evaluate: function (V, st) { var w = sp(st, 'w'), b = sp(st, 'b'); return (w.J - b.J) * 40 + (w.F - b.F) * 15; },
    afterMove: function (ctx, mv, info) {
      if (mv.jump) { ctx.toast((info.by === 'player' ? 'You' : ctx.opponent.name) + ' cast Jump.', 1600); ctx.fx({ type: 'flash', at: 'to', color: '#6fd38a', opacity: 0.55, duration_ms: 450 }); }
      /* the bot may freeze the player's attackers before its own move */
      var bot = ctx.bot, st = ctx.state;
      if (info.by !== 'player' || ctx.over || !freezeReady(st, bot) || !ctx.chance(ctx.params.botFreeze || 0.4)) return;
      var V = ctx.V, threats = V.gen(Object.assign({}, st, { turn: ctx.human })).filter(function (m) { return m.cap && m.cap.c === bot; });
      if (!threats.length) return;
      threats.sort(function (a, b) { return (V.def(b.cap.t).royal ? 9999 : V.def(b.cap.t).value) - (V.def(a.cap.t).royal ? 9999 : V.def(a.cap.t).value); });
      castFreeze(ctx, threats[0].f, bot);
      ctx.toast(ctx.opponent.name + ' cast Freeze.', 1600);
    },
    decorate: function (ctx, sq) { var f = ctx.x.frz; if (f && f.sq.indexOf(sq) >= 0) return { cls: 'g6-frozen' }; return null; },
    status: function (ctx) {
      bar(ctx);
      var o = sp(ctx.state, ctx.bot), f = ctx.x.frz;
      return (f ? (f.c === ctx.human ? 'Some of your pieces are frozen this turn. ' : 'Opponent pieces frozen this turn. ') : '') + ctx.opponent.name + ': Freeze ×' + o.F + ', Jump ×' + o.J + '.';
    },
    onExit: function () { disarm(); var el = document.querySelector('.g6-spells'); if (el) el.remove(); },
    onGameOver: function () { disarm(); }
  });
})();
