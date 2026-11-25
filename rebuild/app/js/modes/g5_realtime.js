/* g5_realtime: "no turns" chess for the real-time videos of group 5 (impl-5, pass 2):
     d8pJkdxtXAA Hyper Chess          - a MOVES meter (the blue bar in the video) limits how many moves you can make
                                         in a burst; it refills over time. Best-of-five match, king capture.
     Obcl5GCtNHc 1 Million Chessboards - two boards side by side, everyone moves whenever they like; captures only
                                         inside one board; capture both enemy kings.
     TsA-ro0GZ0I 10,000 Player Chess   - an .io board: you hunt the other players' pieces while they move on their own.
   How it works on top of the turn-based SpecGame: after your move the turn is handed straight back to you, and the
   other side moves on its own clock (params.rt.bot_ms [min, max] between its moves), so both sides move at any time.
   Pieces glide (the board's slide animation) and a moving bot piece can't be answered until it lands.
   Not reproduced: intercepting a piece mid-path (needs continuous positions; the engine moves square to square).
   Mode params: rt: { meter: 4, refill_ms: 1600, bot_ms: [1100, 2300] }, rtMode: 'hyper' | '1m' | '10k'. */
(function () {
  'use strict';
  var CM = window.CM;
  var match = { you: 0, them: 0, games: 0 };
  var rt = { next: 0, meter: 0, refillAt: 0, el: null };
  function P(ctx) { return Object.assign({ meter: 0, refill_ms: 1600, bot_ms: [1100, 2300] }, ctx.params.rt || {}); }
  function schedule(ctx, now) { var b = P(ctx).bot_ms; rt.next = now + b[0] + Math.random() * (b[1] - b[0]); }
  function css() {
    if (document.getElementById('g5rt-css')) return;
    var s = document.createElement('style'); s.id = 'g5rt-css';
    /* the Hyper Chess MOVES meter: a blue segmented bar with the count and MOVES label (frame maxres2) */
    s.textContent = '.g5rt-meter{position:absolute;left:1.5%;bottom:2%;top:30%;width:5.5%;display:flex;flex-direction:column-reverse;gap:3%;pointer-events:none;z-index:6}' +
      '.g5rt-meter i{flex:1;background:#1f47d8;border:2px solid #0b1c63;border-radius:3px;transition:opacity .25s ease-out}.g5rt-meter i.off{opacity:.18}' +
      '.g5rt-meter b{position:absolute;left:115%;bottom:0;color:#fff;font:italic 900 clamp(14px,4.2vw,30px)/1 system-ui,sans-serif;text-shadow:0 2px 0 #0b1c63;white-space:nowrap}' +
      '.g5rt-meter b small{display:block;font-size:45%;letter-spacing:.06em}' +
      '.g5-tint-p{filter:sepia(1) saturate(5) hue-rotate(235deg) brightness(.85)}';
    document.head.appendChild(s);
  }
  function drawMeter(ctx) {
    var max = P(ctx).meter; if (!max) return;
    var layer = CM.gameUI && CM.gameUI.vfx && CM.gameUI.vfx.layer; if (!layer) return;
    css();
    if (!rt.el || !rt.el.isConnected) { rt.el = document.createElement('div'); rt.el.className = 'g5rt-meter'; layer.appendChild(rt.el); rt.shown = -1; }
    if (rt.shown === rt.meter) return; rt.shown = rt.meter;
    var h = ''; for (var k = 0; k < max; k++) h += '<i class="' + (k < rt.meter ? '' : 'off') + '"></i>';
    rt.el.innerHTML = h + '<b>' + rt.meter + '<small>MOVES</small></b>';
  }
  var TINTS = ['pc--tint-r', 'g5-tint-p', 'pc--tint-u', 'pc--tint-g', 'pc--tint-y'];
  function tintPlayers(ctx) {
    var b = ctx.state.b, bot = ctx.bot, todo = [];
    for (var i = 0; i < b.length; i++) if (b[i] && b[i].c === bot && !b[i].cls) todo.push(i);
    if (!todo.length) return;
    var G = ctx.game, st = Object.assign({}, G.state, { b: b.slice() });
    /* pieces that join together form one player's squad: same colour for each batch */
    var tint = TINTS[Math.floor(Math.random() * TINTS.length)];
    todo.forEach(function (i, k) { if (todo.length > 6 && k % 4 === 0) tint = TINTS[(k / 4) % TINTS.length]; st.b[i] = Object.assign({}, b[i], { cls: tint }); });
    G.state = st; G._dirty = false; G.moves = ctx.V.legal(st); G.render({ instant: true });
  }
  /* hand the turn to colour c and recompute the legal moves */
  function give(ctx, c) {
    var G = ctx.game, st = ctx.state;
    if (st.turn === c) return true;
    G.state = Object.assign({}, st, { turn: c, ep: -1, epv: -1 }); G._dirty = false;
    G.moves = ctx.V.legal(G.state);
    return G.moves.length > 0;
  }

  CM.defineHooks('g5_realtime', {
    /* ---- rules shared with the bot's search ---- */
    filterMoves: function (V, st, legal) {
      if (((V.cfg && V.cfg.params) || {}).rtMode !== '1m') return legal;
      var g = V.geo;   /* 1 Million Chessboards: no capture across a board edge */
      return legal.filter(function (m) { return !m.cap || m.f < 0 || (g.col(m.f) < 8) === (g.col(m.capSq != null ? m.capSq : m.t) < 8); });
    },
    /* ---- game ---- */
    init: function (ctx) {
      css();
      if (ctx.params.rtMode === '1m' && !document.getElementById('g5-1m-css')) { var s = document.createElement('style'); s.id = 'g5-1m-css'; s.textContent = '.g5-edge-r{box-shadow:inset -3px 0 0 #2b2926}'; document.head.appendChild(s); }
    },
    setup: function (ctx) {
      var p = P(ctx);
      rt.meter = p.meter; rt.refillAt = 0; if (rt.el) { rt.el.remove(); rt.el = null; }
      if (ctx.params.rtMode === 'hyper' && (match.you >= ctx.params.need || match.them >= ctx.params.need || match.games >= ctx.params.games)) match = { you: 0, them: 0, games: 0 };
    },
    onStart: function (ctx) {
      schedule(ctx, performance.now() + 1200);
      var v = document.getElementById('view-game');
      if (v && ctx.params.bgImage) { v.style.backgroundImage = 'url("' + ctx.params.bgImage + '")'; v.style.backgroundSize = '400px auto'; }
      drawMeter(ctx);
      if (ctx.params.rtMode === 'hyper') ctx.toast('Game ' + (match.games + 1) + ' of ' + ctx.params.games + ': no turns, capture the king!', 2800);
      else ctx.toast('No turns: move whenever you like. The others do too.', 2600);
      /* the bot may be asked to move first (player is Black in Hyper Chess): turn goes straight back to you */
      if (ctx.state.turn !== ctx.human && !ctx.game.busy) { if (give(ctx, ctx.human)) ctx.game.render(); }
    },
    beforeMove: function (ctx) {
      if (P(ctx).meter && rt.meter <= 0) { ctx.toast('No MOVES left: wait for the bar to refill.', 1400); CM.sound.play('illegal'); return false; }
      return true;
    },
    afterMove: function (ctx, m, info) {
      if (info.by === 'player') {
        if (P(ctx).meter) { if (rt.meter === P(ctx).meter) rt.refillAt = performance.now() + P(ctx).refill_ms; rt.meter = Math.max(0, rt.meter - 1); drawMeter(ctx); }
        if (!ctx.over) ctx.state = Object.assign({}, ctx.state, { turn: ctx.human, ep: -1, epv: -1 });
      }
      return null;
    },
    onTick: function (ctx, now) {
      var G = ctx.game, p = P(ctx);
      if (!G || ctx.over) return;
      if (ctx.params.rtMode === '10k' && !G.busy) tintPlayers(ctx);
      if (p.meter && rt.meter < p.meter && now >= rt.refillAt) { rt.meter++; rt.refillAt = now + p.refill_ms; drawMeter(ctx); }
      if (G.busy || now < rt.next || (CM.gameUI.isPromoting && CM.gameUI.isPromoting())) return;
      /* fairness: while your king is in check the others wait for your answer (10,000 Player Chess keeps check rules) */
      if (ctx.V.checkRule(ctx.human) !== 'none' && ctx.state.turn === ctx.human && ctx.V.inCheck(ctx.state, ctx.human)) return;
      schedule(ctx, now);
      if (!give(ctx, ctx.bot)) { give(ctx, ctx.human); G.render(); return; }
      G.afterChange();   /* the SpecGame's own bot move; the turn comes back to you when it lands */
    },
    decorate: function (ctx, sq, p) {
      if (ctx.params.rtMode === '1m') return ctx.geo.col(sq) === 7 ? { cls: 'g5-edge-r' } : null;
      /* 10,000 Player Chess: every other player has their own colour (red, purple, blue, green, yellow in the frames);
         the colour rides on the piece (p.cls) and is drawn on the white piece image */
      if (ctx.params.rtMode === '10k' && p && p.c === ctx.bot && p.cls) return { img: CM.settings.pieceUrl('w', p.t) };
      return null;
    },
    onGameOver: function (ctx, over) {
      if (ctx.params.rtMode !== 'hyper') return;
      match.games++;
      if (over.w === ctx.human) { match.you++; ctx.toast('You win! +$' + ctx.params.reward + '. Match ' + match.you + '-' + match.them + (match.you >= ctx.params.need ? ': three wins, match won!' : ''), 3600); }
      else if (over.w !== 'd') { match.them++; ctx.toast('Match ' + match.you + '-' + match.them + (match.them >= ctx.params.need ? ': match lost.' : ''), 3200); }
    },
    onExit: function () { if (rt.el) { rt.el.remove(); rt.el = null; } var v = document.getElementById('view-game'); if (v) { v.style.backgroundImage = ''; v.style.backgroundSize = ''; } },
    status: function (ctx) {
      var m = ctx.params.rtMode;
      if (m === 'hyper') return 'Match ' + match.you + '-' + match.them + ' (game ' + Math.min(match.games + 1, ctx.params.games) + '/' + ctx.params.games + ', first to ' + ctx.params.need + ')  ·  MOVES ' + rt.meter + '/' + P(ctx).meter;
      if (m === '10k') { var s = ctx.state.score || {}; return 'Captured: ' + (s[ctx.human] || 0) + ' / 20  ·  players on board: ' + ctx.pieces(function (p) { return p.c === ctx.bot; }).length; }
      return 'No turns: capture both enemy kings.';
    }
  });
})();
