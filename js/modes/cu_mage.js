/* cu_mage: shared hooks for the two "iwantcheckmage" Chess Ultimate videos (m-accuracy 2026-11-26):
     xRximnDlQtI "The New Mage is Terrifying (and he wants checkmate)"  and  4FRsSJoxMkE "RETURN of the iwantcheckmage...".
   Extends the Chess Ultimate character library js/modes/g4_cu.js (CM.defineHooks chain, js/engine/spec.js loadHooks).
   What the videos show (transcripts via analyze_video 2026-11-26, thumbnails i.ytimg.com hq1-3/maxres):
   - Unranked Chess Ultimate on an 8-file x 10-rank stone board (square notation A-H / 1-10: "G10", "F9", "A2 to H9",
     "D10"); you set up inside your first three ranks ("it has to be within these three ranks", xRxim 14:42) on the
     "MAKE A TEAM!" screen with 100 points ("we have 100 points to work with", xRxim 1:57; "All 100 points used", 4FRs 2:42).
   - The IWC Mage skin: the purple Mage with the IWC hat and a king orb in its staff (thumbnails); the Mage swaps places with
     any of your characters (UNIQUE MOVE). A pawn swapped onto the last rank promotes to the Queen Bee at once (xRxim 8:12-8:19).
   - Squids (the 2x2 Giant) cost 1 point in these videos ("nobody wants to take a squid cuz it's worth a single point",
     xRxim 12:38; pink "1" price tag over a squid in the 4FRs hq2 frame); the Bomb is "exactly 20 points" (4FRs 1:56).
   - ~60 s per turn (the "60" turn badge in the 4FRs hq3 frame; "I have 30 seconds", "10 seconds left").
   - Minions "only advance straight ahead" (4FRs 4:13) and can be pinned / take straight ahead.
   - Opponents rotate per game in the video's order; some of them move first (xRxim game 2, 4FRs games 2 and 3).
   Mode files pass params.cuMage = { turn, budget, presets: [{name, rows:[r1,r2,r3]}], games: {<opponent name>: {first, rows:
   [r10, r9, r8]}} } and params.series.opponents (spec-game rotates the opponent per game). Square-level lineups are
   reconstructed from the transcript's descriptions (inferred, see each mode's source.notes). */
(function () {
  'use strict';
  var CM = window.CM;
  var S = { team: null, preset: 0, uniq: false };
  var ROSTER = ['Checker', 'Giant', 'P', 'Turtle', 'Copycat', 'N', 'Mage', 'Fisherman', 'B', 'Jester', 'Sludge', 'R', 'Berserker', 'Ghost', 'Penguin', 'Parasite', 'Devil', 'Dragon', 'Q', 'Sniper', 'Bomb', 'Prince', 'Ninja', 'Angel'];

  function P(ctx) { return (ctx.spec.params && ctx.spec.params.cuMage) || {}; }
  function base(ctx) { return (ctx.hooks._base) || CM.hooks.g4_cu || {}; }
  function cost(ctx, t) { return t === 'K' ? 0 : ((ctx.spec.params.cost || {})[t] || 0); }
  function tok(t) { return t.length === 1 ? t : '[' + t + ']'; }
  function row(list, black) { var o = '', e = 0; list.forEach(function (t) { if (!t) { e++; return; } if (e) { o += e; e = 0; } var k = tok(t); o += black ? k.toLowerCase() : k; }); if (e) o += e; return o; }
  function nm(ctx, t) { var d = ctx.spec.pieces[t]; return d ? d.name.replace(/ \(.*\)/, '') : t; }
  function img(ctx, t) { var d = ctx.spec.pieces[t]; return d && d.img ? (d.img.w || d.img) : ''; }
  function special(m) { return !!(m.spawn || m.swap || m.attach || m.pull || m.stay); }
  function uniqueOf(m) { return m.spawn ? 'SPAWN MINION' : (m.swap || m.stay || m.pull || m.attach) ? 'UNIQUE MOVE' : null; }
  function presetTeam(ctx, k) {   /* 24 cells, index r*8+c, r=0 = rank 1 */
    var pr = (P(ctx).presets || [])[k] || (P(ctx).presets || [])[0], t = [];
    for (var r = 0; r < 3; r++) for (var c = 0; c < 8; c++) t.push(pr && pr.rows[r] ? pr.rows[r][c] || null : null);
    return t;
  }
  function team(ctx) { return S.team || presetTeam(ctx, S.preset); }
  function teamCost(ctx, t) { return t.reduce(function (a, x) { return a + (x ? cost(ctx, x) : 0); }, 0); }
  function game(ctx) { var g = P(ctx).games || {}, o = ctx.game && ctx.game.opponent; return (o && g[o.name]) || g[Object.keys(g)[0]] || { rows: [] }; }

  function css() {
    if (document.getElementById('cum-css')) return;
    var s = document.createElement('style'); s.id = 'cum-css';
    s.textContent = '.cum-bar{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin:2px 0 4px}' +
      '.cum-bar button,.cum-dlg button{border:0;border-radius:6px;background:#3d3a37;color:#fff;font:600 13px/1.1 system-ui,sans-serif;padding:7px 10px;cursor:pointer}' +
      '.cum-bar button{padding:5px 9px;font-size:12px}' +
      '.cum-dlg{position:fixed;inset:0;z-index:120;background:rgba(32,58,22,.94);overflow:auto;padding:12px 10px 18px;font:500 13px system-ui,sans-serif;color:#fff;animation:cumf .22s ease-out}' +
      '@keyframes cumf{from{opacity:0}to{opacity:1}}@media (prefers-reduced-motion:reduce){.cum-dlg{animation:none}}' +
      '.cum-dlg h3{margin:2px 0 6px;text-align:center;font:900 26px/1.05 "Arial Black",Impact,system-ui,sans-serif;color:#ffd23f;-webkit-text-stroke:1.5px #6b3d0c;text-shadow:0 3px 0 #6b3d0c;letter-spacing:.02em}' +
      '.cum-pts{text-align:center;margin:0 0 6px;font-weight:700}.cum-pts b{color:#ffd23f}' +
      '.cum-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:3px;max-width:420px;margin:0 auto 4px;background:#7a5634;padding:6px;border-radius:10px}' +
      '.cum-grid div{aspect-ratio:1;background:#878b8c;border-radius:4px;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer}' +
      '.cum-grid div.l{background:#acb0b0}.cum-grid div.sel{outline:3px solid #ffd23f;outline-offset:-3px}' +
      '.cum-grid div i{position:absolute;left:2px;top:1px;font:600 8px/1 system-ui;color:#2b2b2b;font-style:normal;opacity:.7}' +
      '.cum-grid img,.cum-ros img{width:88%;height:88%;object-fit:contain;pointer-events:none}' +
      '.cum-ros{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:5px;max-width:440px;margin:8px auto 0}' +
      '.cum-ros button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;background:#8a5a2b;box-shadow:0 2px 0 #5a3814}' +
      '.cum-ros button span{background:#5a3814;border-radius:4px;padding:1px 5px;font-weight:800;color:#ffd23f}' +
      '.cum-ros button img{width:38px;height:38px}.cum-ros button[disabled]{opacity:.35}' +
      '.cum-row{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:10px 0 0}.cum-row .go{background:#81b64c;color:#111}' +
      '.cum-act{display:flex;gap:6px;justify-content:center;margin:4px 0 0}.cum-act:empty{display:none}' +
      '.cum-act button{border:0;border-radius:6px;background:#ffd23f;color:#3a2405;font:800 13px/1 system-ui,sans-serif;padding:8px 12px;letter-spacing:.03em;box-shadow:0 3px 0 #b8860b;cursor:pointer}' +
      '.cum-act button.on{background:#81b64c;box-shadow:0 3px 0 #4e7a2a}';
    document.head.appendChild(s);
  }
  function closeDlg() { var o = document.querySelector('.cum-dlg'); if (o) o.remove(); }
  function bar(ctx) {
    css(); var old = document.querySelector('.cum-bar'); if (old) old.remove();
    var area = document.getElementById('board-area'); if (!area || !area.parentNode) return;
    var el = document.createElement('div'); el.className = 'cum-bar';
    el.innerHTML = '<button type="button" data-a="team">Make a team</button>';
    el.onclick = function (e) { if (e.target.closest('[data-a="team"]')) makeTeam(ctx); };
    area.parentNode.insertBefore(el, area);
    if (!document.querySelector('.cum-act')) { var act = document.createElement('div'); act.className = 'cum-act'; area.parentNode.insertBefore(act, area.nextSibling); }
  }
  /* the game's MAKE A TEAM! screen: your first three ranks, 100 points, one King */
  function makeTeam(ctx) {
    css(); closeDlg();
    var budget = P(ctx).budget || 100, t = team(ctx).slice(), sel = -1;
    var el = document.createElement('div'); el.className = 'cum-dlg'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Make a team'); document.body.appendChild(el);
    function used() { return teamCost(ctx, t); }
    function hasK() { return t.indexOf('K') >= 0; }
    function draw() {
      var h = '<h3>MAKE A TEAM!</h3><div class="cum-pts">Points <b>' + ('00' + used()).slice(-3) + '</b> / ' + budget + ' · tap a square, then a character</div><div class="cum-grid">';
      for (var r = 2; r >= 0; r--) for (var c = 0; c < 8; c++) {
        var q = r * 8 + c, x = t[q];
        h += '<div data-s="' + q + '" class="' + ((r + c) % 2 ? 'l' : '') + (q === sel ? ' sel' : '') + '"><i>' + 'ABCDEFGH'[c] + (r + 1) + '</i>' + (x ? '<img alt="' + nm(ctx, x) + '" src="' + img(ctx, x) + '">' : '') + '</div>';
      }
      h += '</div><div class="cum-ros">' + ['K'].concat(ROSTER).filter(function (x) { return ctx.spec.pieces[x]; }).map(function (x) {
        var off = sel < 0 || !!t[sel] || (x === 'K' ? hasK() : used() + cost(ctx, x) > budget);
        return '<button type="button" data-t="' + x + '"' + (off ? ' disabled' : '') + '><img alt="" src="' + img(ctx, x) + '">' + nm(ctx, x) + '<span>' + cost(ctx, x) + '</span></button>';
      }).join('') + '</div><div class="cum-row">' + (P(ctx).presets || []).map(function (p, k) { return '<button type="button" data-p="' + k + '">' + p.name + '</button>'; }).join('') +
        '<button type="button" data-x="clear">Clear square</button><button type="button" data-x="wipe">Clear board</button><button type="button" data-x="close">Cancel</button>' +
        '<button type="button" class="go" data-x="go"' + (hasK() ? '' : ' disabled') + '>Play</button></div>';
      el.innerHTML = h;
    }
    el.onclick = function (e) {
      var sq = e.target.closest('[data-s]'), tb = e.target.closest('[data-t]'), x = e.target.closest('[data-x]'), pb = e.target.closest('[data-p]');
      if (tb && tb.disabled) return;
      if (sq) { var k = +sq.dataset.s; if (sel >= 0 && t[sel] && !t[k]) { t[k] = t[sel]; t[sel] = null; sel = -1; } else sel = sel === k ? -1 : k; }
      else if (tb && sel >= 0 && !t[sel]) { t[sel] = tb.dataset.t; sel = -1; }
      else if (pb) { t = presetTeam(ctx, +pb.dataset.p); S.preset = +pb.dataset.p; sel = -1; }
      else if (x) {
        var a = x.dataset.x;
        if (a === 'close') return closeDlg();
        if (a === 'clear' && sel >= 0) t[sel] = null;
        if (a === 'wipe') { t = t.map(function () { return null; }); sel = -1; }
        if (a === 'go' && hasK()) { S.team = t; closeDlg(); ctx.game.newGame(); return; }
      }
      draw();
    };
    draw();
  }
  function actions(ctx) {
    var act = document.querySelector('.cum-act'), G = ctx.game; if (!act || !G) return;
    var sel = G.sel, label = null, sq = [];
    if (sel >= 0 && !ctx.over && ctx.state.turn === ctx.human) (G.moves || []).forEach(function (m) { if (m.f === sel) { var u = uniqueOf(m); if (u) { label = u; sq.push(m.t); } } });
    if (!label) S.uniq = false;
    var html = label ? '<button type="button" class="' + (S.uniq ? 'on' : '') + '">' + label + '</button>' : '';
    if (act.innerHTML !== html) act.innerHTML = html;
    act.onclick = function (e) {
      if (!e.target.closest('button')) return; S.uniq = !S.uniq; act.innerHTML = '';
      if (S.uniq) ctx.fx({ type: 'highlight', squares: sq.map(function (i) { return ctx.name(i); }), color: 'rgba(255,210,63,.6)', duration_ms: 1400 });
      actions(ctx);
    };
  }
  function resetClock(ctx) { var G = ctx.game, ms = (P(ctx).turn || 60) * 1000; if (G && G.clock) { G.clock.w = ms; G.clock.b = ms; G.clock.t = performance.now(); } }

  var H = {
    extends: 'g4_cu',
    setup: function (ctx) {
      S.uniq = false;
      var st = ctx.state, V = ctx.V, g = game(ctx), mine = team(ctx), opp = (g.rows || []).slice(0, 3);
      while (opp.length < 3) opp.push([]);
      var blank = function (n) { var o = []; for (var k = 0; k < n; k++) o.push(null); return o; };
      var fill = function (r) { var o = blank(8); (r || []).forEach(function (x, k) { o[k] = x || null; }); return o; };
      var ranks = V.geo.ranks, rows = [row(fill(opp[0]), true), row(fill(opp[1]), true), row(fill(opp[2]), true)];
      for (var k = 0; k < ranks - 6; k++) rows.push('8');
      rows.push(row(mine.slice(16, 24)), row(mine.slice(8, 16)), row(mine.slice(0, 8)));
      st.b = CM.spec.parseSetup(V, rows.join('/'));
      st.turn = g.first === 'b' ? 'b' : 'w';
      st.b.forEach(function (p, i) { if (p && V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) st.b[i] = Object.assign({}, p, { m: 1 }); });
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
      CM.g4cuGiant.expand(V, st.b);   /* squids grow into their 2x2 block */
    },
    onStart: function (ctx) {
      resetClock(ctx);
      CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'cu'); }).catch(function (e) { console.warn(e); });
      bar(ctx);
      var g = game(ctx), o = ctx.game.opponent || {};
      ctx.toast((o.name ? 'Paired with ' + o.name + '. ' : '') + (g.first === 'b' ? 'They move first. ' : '') + (g.note || ''), 3400);
    },
    onExit: function () { if (CM.view3d) CM.view3d.detach(); closeDlg(); ['.cum-bar', '.cum-act'].forEach(function (q) { var o = document.querySelector(q); if (o) o.remove(); }); },
    afterMove: function (ctx, m, info) {
      resetClock(ctx); S.uniq = false;
      if (m.swap && info && info.piece === 'Mage') { var q = ctx.state.b[m.f]; if (q && q.t === 'Q' && ctx.geo.relRow(m.f, q.c) === ctx.geo.depth(q.c) - 1) ctx.fx({ type: 'flash', at: ctx.name(m.f), color: '#ffd23f', duration_ms: 500 }); }
      return base(ctx).afterMove ? base(ctx).afterMove(ctx, m, info) : null;
    },
    onUndo: function (ctx) { resetClock(ctx); },
    onTick: function (ctx) {   /* Chess Ultimate never flags you: when the turn timer runs out a random legal move is played (inferred) */
      var G = ctx.game; if (!G.clock || ctx.over || G.busy) return;
      var c = ctx.state.turn; if (c !== ctx.human) return;
      if (G.clock[c] - (performance.now() - G.clock.t) > 250) return;
      var ms = G.moves || []; if (!ms.length) return;
      ctx.toast('Time is up: a random move was played.', 2200);
      resetClock(ctx);
      G.commit(ms[Math.floor(Math.random() * ms.length)], {});
    },
    pickMove: function (ctx, c) { return c.filter(function (m) { return special(m) === !!S.uniq; })[0] || null; },
    beforeMove: function (ctx, m) {
      if (S.uniq && !uniqueOf(m)) { ctx.toast('Unique move is on: pick a highlighted target (tap the button again to cancel).', 2200); return false; }
      return true;
    },
    status: function (ctx) { actions(ctx); return base(ctx).status ? base(ctx).status(ctx) : null; }
  };
  CM.defineHooks('cu_mage', H);
})();
