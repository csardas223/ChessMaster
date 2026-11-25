/* g5_troll: King of the Bridge ("the 11th edition of Advanced Troll Chess"). You play White against the Troll, who
   cheats. Press "Accuse" (or Space) right after a Troll move, then pick the rule it broke:
     correct -> the cheating piece is arrested (removed from the board)
     wrong   -> params.falseAccusation: 'lose' (you lose at once, Impatience run) | 'forfeit' (your turn is
                forfeited and the Troll's next move is a revenge cheat)
   An un-accused cheat stands once you move. Troll rules modelled (rule hooks, pure):
     Rule 4: pawns are small-minded: they step one square forward, sideways or back (double step from the start),
             and capture diagonally forward only
     Rule 9: only the knight can jump over other pieces          Rule 12: the queen may not capture the king
     Rule 11: when the Troll's king dies the crown passes to another Troll piece (the game goes on)
     Rule 10: if your king dies (checkmate) the Troll wins.     You win when every Troll piece is gone.
   Cheats the Troll uses (game hook botPick fabricates the move): rule 2 (moves one of YOUR pieces), rule 4 (pawn
   walks diagonally without capturing), rule 9 (a slider jumps over a piece), rule 13 (a bishop steps straight).
   Mode params: cheatChance (0.25), falseAccusation, goose: { after_ply, after_catches } (Goose ending: the goose
   swoops in and carries off one Troll piece per turn), timer: true (speedrun clock, Impatience < 15:00). */
(function () {
  'use strict';
  var CM = window.CM;
  var RULES = [
    { n: 2, t: 'You may only move your own coloured pieces.' },
    { n: 4, t: 'Pawns are small-minded: one step forward, sideways or back; they only capture diagonally forward.' },
    { n: 9, t: 'Only the knight (horse guy) can jump over other pieces.' },
    { n: 12, t: 'Royal affair: the queen may not capture the king.' },
    { n: 13, t: 'The bishop travels in an X (diagonals only).' }
  ];
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  function css() {
    if (document.getElementById('g5-troll-css')) return;
    var s = document.createElement('style'); s.id = 'g5-troll-css';
    s.textContent = '.g5troll{display:flex;gap:8px;justify-content:center;align-items:center;margin:2px 0 6px;flex-wrap:wrap}' +
      '.g5troll button{font:600 14px system-ui,sans-serif;padding:8px 14px;border-radius:6px;border:0;background:#c64a3b;color:#fff;cursor:pointer;box-shadow:0 3px 0 #8a2f25}' +
      '.g5troll button:active{transform:translateY(2px);box-shadow:0 1px 0 #8a2f25}' +
      '.g5troll__book{position:fixed;inset:auto 0 0 0;z-index:80;background:#2b2926;color:#eee;border-radius:12px 12px 0 0;padding:14px 14px 18px;box-shadow:0 -6px 24px rgba(0,0,0,.5);max-height:70vh;overflow:auto;animation:g5tb .22s ease-out}' +
      '@keyframes g5tb{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}' +
      '.g5troll__book h3{margin:0 0 8px;font:700 16px system-ui,sans-serif;color:#e8c547}' +
      '.g5troll__book button{display:block;width:100%;text-align:left;margin:6px 0;padding:10px 12px;border-radius:6px;border:1px solid #3d3a36;background:#3a3733;color:#eee;font:500 14px/1.3 system-ui,sans-serif;cursor:pointer}' +
      '.g5troll__book button:hover{background:#4a4642}.g5troll__book .x{background:transparent;border:0;text-align:center;color:#aaa}' +
      '.g5goose{position:absolute;width:34%;pointer-events:none;z-index:5}';
    document.head.appendChild(s);
  }
  function bar() { return document.querySelector('.g5troll'); }
  function closeBook() { var b = document.querySelector('.g5troll__book'); if (b) b.remove(); }
  function dirs(V, i, j) { var g = V.geo, dc = g.col(j) - g.col(i), dr = g.row(j) - g.row(i); return { dc: dc, dr: dr, sx: Math.sign(dc), sy: Math.sign(dr) }; }
  function fmt(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }

  /* fabricate a cheat for the Troll (colour b) in the current state; returns a move or null */
  function makeCheat(ctx) {
    var V = ctx.V, g = V.geo, st = ctx.state, b = st.b, me = st.turn, opts = [];
    b.forEach(function (p, i) {
      if (!p || p.c === 'n') return;
      if (p.c === me && p.t === 'P') {   /* rule 4: diagonal step onto an empty square */
        [-1, 1].forEach(function (dc) { var j = g.step(i, dc, me === 'b' ? 1 : -1); if (j >= 0 && !b[j]) opts.push({ rule: 4, m: { f: i, t: j, p: 'P', c: me, cap: null } }); });
      }
      if (p.c === me && p.t === 'B') {   /* rule 13: a bishop steps straight */
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && (!b[j] || (b[j].c !== me && b[j].c !== 'n' && b[j].t !== 'K'))) opts.push({ rule: 13, m: { f: i, t: j, p: 'B', c: me, cap: b[j] || null, capSq: b[j] ? j : undefined } }); });
      }
      if (p.c === me && (p.t === 'R' || p.t === 'B' || p.t === 'Q')) {   /* rule 9: jump exactly one piece */
        var D = p.t === 'R' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : p.t === 'B' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        D.forEach(function (d) {
          var j = g.step(i, d[0], d[1]); if (j < 0 || !b[j]) return; var k = g.step(j, d[0], d[1]);
          if (k >= 0 && (!b[k] || (b[k].c !== me && b[k].c !== 'n' && b[k].t !== 'K'))) opts.push({ rule: 9, m: { f: i, t: k, p: p.t, c: me, cap: b[k] || null, capSq: b[k] ? k : undefined } });
        });
      }
      if (p.c !== me && p.t !== 'K') {   /* rule 2: shove one of your pieces one square back toward you */
        var j2 = g.step(i, 0, 1); if (j2 >= 0 && !b[j2]) opts.push({ rule: 2, m: { f: i, t: j2, p: p.t, c: me, cap: null, foreign: 1 } });
      }
    });
    if (!opts.length) return null;
    /* prefer cheats that win material, else any */
    opts.sort(function (a, b2) { return ((b2.m.cap ? VAL[b2.m.cap.t] || 0 : 0) - (a.m.cap ? VAL[a.m.cap.t] || 0 : 0)); });
    var top = opts.filter(function (o) { return o.m.cap; });
    var o = top.length && Math.random() < 0.6 ? top[0] : ctx.pick(opts);
    o.m.cheat = o.rule; return o.m;
  }
  function crownTransfer(V, b) {
    var best = -1, bv = -1;
    for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === 'b' && p.t !== 'K') { var v = VAL[p.t] != null ? VAL[p.t] : 1; if (v > bv) { bv = v; best = i; } } }
    if (best >= 0) b[best] = Object.assign({}, b[best], { t: 'K', crowned: 1 });
    return best;
  }
  function accuse(ctx, rule) {
    closeBook();
    var x = ctx.state.x, ch = x.cheat, P = ctx.params;
    if (ctx.over || ctx.state.turn !== ctx.human || ctx.game.busy) return;
    if (ch && ch.rule === rule) {
      var at = ch.to, p = ctx.at(at);
      if (p && p.c === ctx.bot) {
        if (p.t === 'K') { ctx.remove(at); var nb = ctx.state.b, k = crownTransfer(ctx.V, nb); if (k >= 0) ctx.set(k, nb[k]); }
        else ctx.remove(at);
      }
      ctx.setX('cheat', null); ctx.setX('caught', (x.caught || 0) + 1);
      ctx.sound('notify'); ctx.toast('Rule ' + rule + '! Officer, arrest him. The cheating piece is taken away.', 2600);
      ctx.fx({ type: 'flash', color: '#e8c547', opacity: 0.35, at: at });
      ctx.refresh(); return;
    }
    ctx.setX('cheat', null);
    if ((P.falseAccusation || 'forfeit') === 'lose') { ctx.sound('illegal'); ctx.endGame('bot', 'false accusation (rule ' + rule + ')'); return; }
    ctx.sound('illegal'); ctx.toast('False accusation! Your turn is forfeited and the Troll cheats as revenge.', 2800);
    ctx.setX('revenge', 1);
    var st = ctx.state; st.turn = ctx.bot; ctx.refresh(); ctx.game.afterChange();
  }
  function openBook(ctx) {
    css(); closeBook(); if (ctx.over) return;
    var el = document.createElement('div'); el.className = 'g5troll__book'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Rule book');
    el.innerHTML = '<h3>Rule book: which rule did the Troll break?</h3>' + RULES.map(function (r) { return '<button type="button" data-r="' + r.n + '"><b>Rule ' + r.n + '.</b> ' + r.t + '</button>'; }).join('') +
      '<button type="button" class="x" data-r="0">Close</button>';
    el.onclick = function (e) { var b = e.target.closest('[data-r]'); if (!b) return; var n = +b.dataset.r; if (!n) return closeBook(); accuse(ctx, n); };
    document.body.appendChild(el);
  }
  var keyH = null, T0 = 0;
  function mount(ctx) {
    css(); var old = bar(); if (old) old.remove();
    var st = document.getElementById('status'); if (!st || !st.parentNode) return;
    var d = document.createElement('div'); d.className = 'g5troll';
    d.innerHTML = '<button type="button" data-a="acc" title="Space">Accuse (Space)</button>';
    d.onclick = function (e) { if (e.target.closest('[data-a]')) openBook(ctx); };
    st.parentNode.insertBefore(d, st.nextSibling);
    if (keyH) document.removeEventListener('keydown', keyH);
    keyH = function (e) { if (e.code === 'Space' && CM.app.view === 'game' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { e.preventDefault(); openBook(ctx); } };
    document.addEventListener('keydown', keyH);
  }
  function unmount() { var b = bar(); if (b) b.remove(); closeBook(); if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; } var g = document.querySelector('.g5goose'); if (g) g.remove(); }

  CM.defineHooks('g5_troll', {
    init: function (ctx) { css(); },
    setup: function (ctx) { mount(ctx); T0 = performance.now(); },
    onExit: function () { unmount(); },
    onUndo: function (ctx) { closeBook(); },
    filterMoves: function (V, st, legal) {
      /* rule 12: the queen never captures the king */
      return legal.filter(function (m) { return !(m.p === 'Q' && m.cap && m.cap.t === 'K'); });
    },
    onMake: function (V, st, m, n) {
      /* rule 11: the Troll's crown passes on */
      if (m.cap && m.cap.t === 'K' && m.cap.c === 'b') crownTransfer(V, n.b);
    },
    checkWin: function (V, st) {
      var left = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'b') left++; }
      if (!left) return { w: 'w', why: "every Troll piece is gone: you cross the bridge" };
      if (!V.royals(st, 'w').length) return { w: 'b', why: 'your king died (rule 10)' };
      return null;
    },
    botPick: function (ctx, ranked) {
      var P = ctx.params, x = ctx.state.x, chance = P.cheatChance == null ? 0.25 : P.cheatChance;
      if (ctx.state.ply < 4 && !x.revenge) return null;
      if (x.revenge || Math.random() < chance) { var c = makeCheat(ctx); if (c) return c; }
      return null;
    },
    afterMove: function (ctx, m, info) {
      if (info.by === 'bot') {
        if (m.cheat) { ctx.setX('cheat', { rule: m.cheat, to: m.t }); ctx.setX('revenge', 0); ctx.setX('cheats', (ctx.state.x.cheats || 0) + 1); }
        else ctx.setX('cheat', null);
      } else ctx.setX('cheat', null);
      var G = ctx.params.goose;
      if (G && !ctx.state.x.goose && ((ctx.state.ply >= (G.after_ply || 60)) || (ctx.state.x.caught || 0) >= (G.after_catches || 3))) {
        ctx.setX('goose', 1); ctx.toast('HONK. A goose rises from the water behind the bridge...', 3000); ctx.sound('notify');
        ctx.fx({ type: 'text', text: 'HONK!', color: '#f5f1e6', size: 48, duration_ms: 1400 });
      }
      if (ctx.state.x.goose && info.by === 'player') {
        var bs = ctx.pieces(function (p) { return p.c === ctx.bot; });
        if (bs.length) {
          var vic = bs.sort(function (a, b) { return (VAL[ctx.at(b).t] || 0) - (VAL[ctx.at(a).t] || 0); })[ctx.state.x.goose % 2 ? 0 : bs.length - 1];
          ctx.fx({ type: 'flash', color: '#f5f1e6', opacity: 0.5, at: vic }); ctx.remove(vic); ctx.setX('goose', ctx.state.x.goose + 1);
          ctx.toast('The goose carries off a Troll piece!', 1600);
        }
      }
      return null;
    },
    onTick: function (ctx) {
      if (!ctx.params.timer || ctx.over) return;
      var s = document.getElementById('status'); if (s) s.textContent = ctx.hooks.status(ctx);
    },
    onGameOver: function (ctx, over) {
      closeBook();
      if (ctx.params.timer && over.w === ctx.human) { var t = performance.now() - T0; ctx.toast(t < 15 * 60000 ? 'Impatience award: finished in ' + fmt(t) + ' (under 15:00)!' : 'Finished in ' + fmt(t) + ': too slow for the Impatience award (15:00).', 4200); }
    },
    status: function (ctx) {
      var x = ctx.state.x, t = ctx.params.timer ? fmt(performance.now() - T0) + '  ·  ' : '';
      return t + 'Cheats caught ' + (x.caught || 0) + (x.goose ? '  ·  the Goose is here' : '');
    }
  });
})();
