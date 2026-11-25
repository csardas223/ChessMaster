/* g1_dice: shared hooks for the Dice Chess videos (dicechess-style rules, used by 15 mode files).
   Rules (research/modes/*.json for the Dice Chess category, transcripts "double queen", "rolls nothing"):
   * at the start of each turn three dice are rolled; each face is a piece type (pawn, knight, bishop, rook, queen, king);
   * you make one move per die with a piece of that type, one after another (the same piece may use several dice of its
     type); a die with no legal move is skipped, and a roll with no usable die passes the turn;
   * castling needs a king and a rook die (it uses both);
   * there is no check: kings may be left en prise, capturing the enemy king wins;
   * pawns promote with the normal Q/R/B/N choice.
   Implementation: state.x.dice holds the dice still unused by the side to move (null = not rolled, which the bot's
   search treats as "any one move"). Variant.make is wrapped once per game (hooks.init) so the same side keeps the move
   while it has usable dice; that keeps the rule pure, so the search sees multi-move turns. Rolling is random and
   therefore happens only in the real game (setup / afterMove). */
(function () {
  'use strict';
  var FACES = ['P', 'N', 'B', 'R', 'Q', 'K'];
  var NAMES = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' };

  function fits(dice, m) {
    if (m.castle) return dice.indexOf('K') >= 0 && dice.indexOf('R') >= 0;
    return dice.indexOf(m.p) >= 0;
  }
  function useDie(dice, m) {
    var rest = dice.slice();
    var drop = function (t) { var k = rest.indexOf(t); if (k >= 0) rest.splice(k, 1); };
    if (m.castle) { drop('K'); drop('R'); } else drop(m.p);
    return rest;
  }
  function bothKings(V, st) { return V.royals(st, 'w').length && V.royals(st, 'b').length; }
  /* after a move: keep the turn while the remaining dice still have a move */
  function after(V, st, m, n) {
    var dice = st.x && st.x.dice;
    if (!dice) { n.x.dice = null; return n; }
    var me = st.turn, rest = useDie(dice, m);
    n.x.dice = null;
    if (rest.length && bothKings(V, n)) {
      var tmp = Object.assign({}, n, { turn: me }), ms = V.gen(tmp);
      for (var k = 0; k < ms.length; k++) if (fits(rest, ms[k])) { n.turn = me; n.sub = (st.sub || 0) + 1; n.x.dice = rest; break; }
    }
    if (n.turn !== me) n.sub = 0;
    return n;
  }
  function roll(ctx) { var d = []; for (var k = 0; k < 3; k++) d.push(FACES[ctx.random(6)]); return d; }
  function who(ctx, c) { return c === ctx.human ? 'You' : (ctx.opponent.name || 'Opponent'); }
  /* the red piece dice from the videos, in the roller's colour (black pieces on Black's dice, white on White's, as in
     the KJYUsRlj_34 / OcWzHqqeLNg frames; faces cut by tools/g1_sprites.py) */
  function face(c, t) { return 'assets/modes/B5LGzOEZSyo/face_' + c + t + '.png'; }
  /* the dice stay on screen beside the roller's clock (right of the board in the video, the player bar here); a die
     that has been used turns dark, like the dimmed die in the frames */
  function tray(ctx) {
    if (typeof document === 'undefined') return;
    ['card-top', 'card-bottom'].forEach(function (id) { var b = document.getElementById(id), o = b && b.querySelector('.g1-dtray'); if (o) o.remove(); });
    var x = ctx.state.x || {}, roll = x.roll, c = x.rollc; if (!roll || !c || ctx.over) return;
    var bar = document.getElementById(c === ctx.human ? 'card-bottom' : 'card-top'); if (!bar) return;
    var left = (x.dice || []).slice(), html = roll.map(function (t) {
      var k = left.indexOf(t), used = k < 0; if (!used) left.splice(k, 1);
      return '<img alt="' + NAMES[t] + (used ? ' (used)' : '') + '" src="' + face(c, t) + '" style="width:30px;height:30px;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.5)' + (used ? ';filter:brightness(.45) saturate(.7)' : '') + '">';
    }).join('');
    var el = document.createElement('span'); el.className = 'g1-dtray'; el.style.cssText = 'display:flex;gap:4px;flex:none;align-items:center;margin:0 6px';
    el.innerHTML = html;
    var clock = bar.querySelector('.clock'); bar.insertBefore(el, clock || null);
  }
  function showDice(ctx, dice, c) {
    var html = '<div style="display:flex;gap:10px;padding:10px 14px;border-radius:12px;background:rgba(20,16,12,.55)">' + dice.map(function (t) {
      return '<img alt="' + NAMES[t] + '" src="' + face(c, t) + '" style="width:56px;height:56px;border-radius:6px;box-shadow:0 3px 8px rgba(0,0,0,.4)">';
    }).join('') + (ctx.params.rollImg ? '<img alt="" src="' + ctx.params.rollImg + '" style="width:48px;height:48px;align-self:center">' : '') + '</div>';
    ctx.fx({ type: 'overlay', at: 'board', html: html, duration_ms: 1000, fade_ms: 180, id: 'dice' });
    ctx.sound('tick');
  }
  /* roll for the side to move; a roll with no usable die passes the turn (up to a few times) */
  function rollFor(ctx) {
    var V = ctx.V;
    for (var guard = 0; guard < 8; guard++) {
      var st = ctx.state, dice = roll(ctx);
      ctx.setX('dice', dice); ctx.setX('roll', dice.slice()); ctx.setX('rollc', st.turn);
      var ok = V.legal(ctx.state).length > 0;
      if (ok) { showDice(ctx, dice, st.turn); return; }
      ctx.toast(who(ctx, st.turn) + ' rolled ' + dice.map(function (t) { return NAMES[t]; }).join(', ') + ': nothing to move. Turn passes.', 2200);
      ctx.state.turn = V.opp(st.turn); ctx.state.sub = 0;
    }
  }

  CM.defineHooks('g1_dice', {
    init: function (ctx) {
      var V = ctx.V; if (V._g1dice) return; V._g1dice = 1;
      var mk = V.make;
      V.make = function (st, m) { return after(this, st, m, mk.call(this, st, m)); };
    },
    filterMoves: function (V, st, legal) {
      var dice = st.x && st.x.dice; if (!dice) return legal;
      return legal.filter(function (m) { return fits(dice, m); });
    },
    /* the bot likes kings it can reach and keeps its own king away from enemy pieces */
    evaluate: function (V, st) {
      var g = V.geo, b = st.b, k = { w: -1, b: -1 }, v = 0, i;
      for (i = 0; i < b.length; i++) if (b[i] && b[i].t === 'K') k[b[i].c] = i;
      ['w', 'b'].forEach(function (c) {
        var ek = k[c === 'w' ? 'b' : 'w']; if (ek < 0) return;
        var near = 0; for (var j = 0; j < b.length; j++) { var p = b[j]; if (p && p.c === c && p.t !== 'K') near += Math.max(0, 5 - g.dist(j, ek)); }
        v += (c === 'w' ? 1 : -1) * near * 6;
      });
      return v;
    },
    setup: function (ctx) { ctx.setX('dice', null); rollFor(ctx); },
    afterMove: function (ctx, m, info) {
      var st = ctx.state;
      if (!bothKings(ctx.V, st)) return;
      if (st.turn !== info.side || !(st.x && st.x.dice)) rollFor(ctx);
    },
    onGameOver: function (ctx, res) {   /* the video's YOU WIN popup, when this video has one */
      if (ctx.params.winImg && res && res.w === ctx.human) ctx.fx({ type: 'overlay', at: 'board', image: ctx.params.winImg, fit: 'contain', duration_ms: 1800, fade_ms: 250 });
    },
    decorate: function (ctx, sq, p) {
      var G = ctx.game; if (!p || p.c !== ctx.human || ctx.state.turn !== ctx.human || ctx.over || !G.moves) return null;
      for (var k = 0; k < G.moves.length; k++) if (G.moves[k].f === sq) return { html: '<span class="sq-tint" style="background:rgba(255,214,10,.28)"></span>' };
      return null;
    },
    onExit: function (ctx) { ['card-top', 'card-bottom'].forEach(function (id) { var b = document.getElementById(id), o = b && b.querySelector('.g1-dtray'); if (o) o.remove(); }); },
    status: function (ctx) {
      tray(ctx);
      var st = ctx.state, d = st.x && st.x.dice; if (ctx.over || !d) return '';
      return (st.turn === ctx.human ? 'Your dice: ' : (ctx.opponent.name || 'Opponent') + '\u2019s dice: ') + d.map(function (t) { return NAMES[t]; }).join(' \u00b7 ') + (d.length < 3 ? ' (' + (3 - d.length) + ' used)' : '');
    }
  });
})();
