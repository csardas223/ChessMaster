/* g1_mines: shared hooks for the two landmine videos (vQ3hLgU6jLA "I Can Place Mines", w15Ev7q2HmI "there are
   landmines..."). Settings come from the mode's params:
     mines: 3                    mines per side
     playerRanks: [3,4] | null   ranks the player may mine (null = any empty square)
     botMines: false | true      the bot also hides mines (placed at random on botRanks)
     botRanks: [5,6]
     destroy: true               an exploded square becomes a permanent hole (else a crater, still playable)
     bestOf: 0 | 3               keep a match score across games in this tab
   Rules: before move 1 the player taps empty squares to hide their mines (tap again to take one back). Any piece of
   either colour that lands on a mine explodes and is removed (passing over a mine, e.g. a pawn double step, is safe).
   A king that explodes loses. The engine is never told where the mines are: explosions are applied by the game
   (afterMove), not by the rules, so the search plays as if the board were normal; a bot with its own mines only
   avoids stepping on them (botPick). */
(function () {
  'use strict';
  var score = {};
  function P(ctx) { return Object.assign({ mines: 3, playerRanks: null, botMines: false, botRanks: [5, 6], destroy: true, bestOf: 0 }, ctx.params); }
  function okSquare(ctx, i) {
    var pr = P(ctx).playerRanks; if (!ctx.geo.valid[i] || ctx.at(i)) return false;
    return !pr || pr.indexOf(ctx.geo.rank(i)) >= 0;
  }
  function left(ctx) { return P(ctx).mines - (ctx.x.pm || []).length; }
  function boom(ctx, i, info) {
    var x = ctx.x, pm = (x.pm || []).slice(), bm = (x.bm || []).slice(), k = pm.indexOf(i), j = bm.indexOf(i);
    if (k < 0 && j < 0) return false;
    var p = ctx.at(i); if (!p) return false;
    if (k >= 0) pm.splice(k, 1); if (j >= 0) bm.splice(j, 1);
    ctx.setX('pm', pm); ctx.setX('bm', bm);
    var d = ctx.V.def(p.t), G = ctx.game;
    ctx.fx({ type: 'explosion', at: i, radius: 0.6, shake: false }); ctx.sound('explosion');
    var other = p.c === ctx.human ? ctx.bot : ctx.human;
    if (!d.royal) (G.cap[other] = G.cap[other] || []).push({ t: p.t, c: p.c });
    if (P(ctx).destroy) ctx.set(i, ctx.piece('Hole', 'n')); else { ctx.remove(i); ctx.setX('cr', (x.cr || []).concat([i])); }
    ctx.toast((p.c === ctx.human ? 'Your ' : 'The enemy ') + (d.name || p.t).toLowerCase() + ' stepped on a mine on ' + ctx.name(i) + '!', 1900);
    if (d.royal) ctx.endGame(p.c === ctx.human ? 'bot' : 'player', p.c === ctx.human ? 'your king stepped on a mine' : 'the enemy king stepped on a mine');
    return true;
  }
  function placeBot(ctx) {
    var o = P(ctx); if (!o.botMines) return;
    var cand = ctx.emptySquares(function (i) { return o.botRanks.indexOf(ctx.geo.rank(i)) >= 0; }), bm = [];
    for (var k = 0; k < o.mines && cand.length; k++) bm.push(cand.splice(ctx.random(cand.length), 1)[0]);
    ctx.setX('bm', bm);
  }
  CM.defineHooks('g1_mines', {
    init: function (ctx) {
      var G = ctx.game; if (G._g1mines) return; G._g1mines = 1;
      var tap = G.onTap;
      G.onTap = function (i, o) {
        if (!G.over && ctx.x.phase === 'place') {
          var pm = (ctx.x.pm || []).slice(), k = pm.indexOf(i);
          if (k >= 0) pm.splice(k, 1);
          else if (okSquare(ctx, i) && pm.length < P(ctx).mines) pm.push(i);
          else { CM.sound.play('illegal'); var pr = P(ctx).playerRanks; ctx.toast(pr ? 'Mines go on empty squares of ranks ' + pr.join(' and ') + '.' : 'Mines go on empty squares.', 1500); return; }
          ctx.setX('pm', pm); ctx.sound('flag');
          if (pm.length >= P(ctx).mines) { ctx.setX('phase', 'play'); ctx.toast('Mines hidden. Your move!', 1500); }
          G.sel = -1; ctx.refresh(); return;  /* refresh: legal moves carry state.x, so recompute after placing */
        }
        return tap.call(G, i, o);
      };
    },
    setup: function (ctx) { ctx.setX('phase', 'place'); ctx.setX('pm', []); ctx.setX('bm', []); ctx.setX('cr', []); placeBot(ctx); },
    onStart: function (ctx) { var pr = P(ctx).playerRanks; ctx.toast('Hide ' + P(ctx).mines + ' mines: tap empty squares' + (pr ? ' on ranks ' + pr.join('-') : '') + '.', 2600); },
    beforeMove: function (ctx) { if (ctx.x.phase === 'place') { ctx.toast('Place your mines first (' + left(ctx) + ' left).', 1400); return false; } return true; },
    afterMove: function (ctx, m) {
      if (ctx.x.phase === 'place') ctx.setX('phase', 'play');
      var sq = [m.t]; if (m.castle) sq.push(m.castle.rt);
      var hit = false; sq.forEach(function (i) { if (!ctx.over && boom(ctx, i)) hit = true; });
      if (hit && !ctx.over) ctx.refresh();
      return null;
    },
    botPick: function (ctx, ranked) {
      var bm = ctx.x.bm || [], safe = ranked.filter(function (r) { return bm.indexOf(r.m.t) < 0 && !(r.m.castle && bm.indexOf(r.m.castle.rt) >= 0); });
      if (!safe.length) return ranked[0];
      var el = ctx.opponent.elo != null ? ctx.opponent.elo : (ctx.spec.bot.elo || 1500);
      return el < 2000 && safe.length > 1 && ctx.chance(0.25) ? safe[1] : safe[0];
    },
    onGameOver: function (ctx, r) {
      var n = P(ctx).bestOf; if (!n) return;
      var s = score[ctx.spec.id] = score[ctx.spec.id] || { you: 0, opp: 0 };
      if (r.w === ctx.human) s.you++; else if (r.w !== 'd') s.opp++;
      var need = Math.ceil(n / 2);
      if (s.you >= need || s.opp >= need) { ctx.toast((s.you > s.opp ? 'You win the match ' : 'You lose the match ') + s.you + '-' + s.opp + '. New starts a fresh match.', 3600); score[ctx.spec.id] = null; }
      else ctx.toast('Match score ' + s.you + '-' + s.opp + ' (best of ' + n + ').', 2600);
    },
    decorate: function (ctx, sq, p) {
      var x = ctx.x;
      if (p && p.t === 'Hole') return { html: '<span class="sq-tint" style="background:#0b0a09"></span>' };
      var h = '';
      if ((x.cr || []).indexOf(sq) >= 0) h += '<img alt="" src="' + ctx.params.craterImg + '" style="position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none">';
      if ((x.pm || []).indexOf(sq) >= 0) h += '<img alt="" src="' + ctx.params.mineImg + '" style="position:absolute;inset:10%;width:80%;height:80%;z-index:3;pointer-events:none;opacity:' + (p ? '.75' : '1') + '">';
      if (ctx.over && (x.bm || []).indexOf(sq) >= 0) h += '<img alt="" src="' + (ctx.params.botMineImg || ctx.params.mineImg) + '" style="position:absolute;inset:10%;width:80%;height:80%;z-index:3;pointer-events:none;opacity:.8">';
      if (x.phase === 'place' && !p && okSquare(ctx, sq) && (x.pm || []).indexOf(sq) < 0) h += '<span class="sq-tint" style="background:rgba(214,60,200,.14)"></span>';
      return h ? { html: h } : null;
    },
    status: function (ctx) {
      if (ctx.x.phase === 'place') return 'Hide your mines: ' + left(ctx) + ' left to place.';
      var s = score[ctx.spec.id], n = P(ctx).bestOf;
      return (ctx.x.pm || []).length + ' of your mines still armed.' + (n && s ? ' Match ' + s.you + '-' + s.opp + '.' : '');
    }
  });
})();
