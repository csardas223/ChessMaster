/* Can I BEAT DougDoug's Chess Variant? (Choice Chess)  Normal 3+0 chess, but every few turns the player is offered three
   random effect cards and must pick one (70+ effects: instant, lasting, or kicking in after N moves). Sources:
   research/modes/rcFGwuREQFY.json, frames (#eaead2/#7ea25a; thumbnail cards "Sacrifice 1 point of material", "Delete your
   firstborn child"). PASS 1: every 4th move of yours three cards are drawn from an original pool of 10 effects and one
   is applied at random (the choice UI is pass 2); the bot gets a card after each of its 4th moves. */
CM.mode({
  id: 'rcFGwuREQFY',
  title: "Can I BEAT DougDoug's Chess Variant? (Choice Chess)",
  name: 'Choice Chess (DougDoug)',
  category: 'Variants & Games',
  description: 'Normal chess with a twist every few turns: three random effect cards are drawn and one of them happens. Effects can spawn, delete, upgrade or downgrade pieces.',
  how_to_win: 'Checkmate your opponent.',
  player_side: 'white',
  opponent: { name: 'chicken wing', rating: 1500, tagline: 'Online opponent on the Choice Chess site.' },
  board: { files: 8, ranks: 8, light: '#eaead2', dark: '#7ea25a' },
  rules: { castling: true, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  params: { every: 4 },
  hooks: {
    afterMove: function (ctx, mv, info) {
      if (ctx.over) return;
      var me = info.side, n = Math.ceil(info.ply / 2); if (n % (ctx.params.every || 4) !== 0) return;
      var foe = me === 'w' ? 'b' : 'w', V = ctx.V;
      var mine = function (f) { return ctx.pieces(function (p) { return p.c === me && !V.def(p.t).royal && (!f || f(p)); }); };
      var theirs = function (f) { return ctx.pieces(function (p) { return p.c === foe && !V.def(p.t).royal && (!f || f(p)); }); };
      var E = [
        ['Sacrifice 1 point of material', function () { var l = mine(function (p) { return p.t === 'P'; }); if (l.length) ctx.remove(ctx.pick(l)); }],
        ['Spawn a pawn on a random empty square of your half', function () { var e = ctx.emptySquares(function (i) { var r = V.geo.relRow(i, me); return r >= 1 && r <= 3; }); if (e.length) ctx.spawn('P', me, ctx.pick(e)); }],
        ['A random enemy pawn becomes a knight... for you', function () { var l = theirs(function (p) { return p.t === 'P'; }); if (l.length) ctx.transform(ctx.pick(l), { type: 'N', color: me }); }],
        ['Upgrade: a random knight or bishop of yours becomes a rook', function () { var l = mine(function (p) { return p.t === 'N' || p.t === 'B'; }); if (l.length) ctx.transform(ctx.pick(l), { type: 'R' }); }],
        ['Downgrade: a random enemy rook becomes a bishop', function () { var l = theirs(function (p) { return p.t === 'R'; }); if (l.length) ctx.transform(ctx.pick(l), { type: 'B' }); }],
        ['Delete a random enemy pawn', function () { var l = theirs(function (p) { return p.t === 'P'; }); if (l.length) ctx.remove(ctx.pick(l)); }],
        ['Promote your most advanced pawn to a queen', function () { var l = mine(function (p) { return p.t === 'P'; }); if (!l.length) return; l.sort(function (a, b) { return V.geo.relRow(b, me) - V.geo.relRow(a, me); }); ctx.transform(l[0], { type: 'Q' }); }],
        ['Swap: your queen and a random rook trade places', function () { var q = mine(function (p) { return p.t === 'Q'; }), r = mine(function (p) { return p.t === 'R'; }); if (q.length && r.length) { var a = q[0], b = ctx.pick(r), pa = ctx.at(a), pb = ctx.at(b); ctx.set(a, pb); ctx.set(b, pa); } }],
        ['Delete your firstborn child (your leftmost pawn)', function () { var l = mine(function (p) { return p.t === 'P'; }); if (l.length) { l.sort(function (a, b) { return V.geo.col(a) - V.geo.col(b); }); ctx.remove(l[0]); } }],
        ['Nothing happens. Suspicious.', function () {}]
      ];
      var draw = []; while (draw.length < 3) { var c = ctx.pick(E); if (draw.indexOf(c) < 0) draw.push(c); }
      var pick = ctx.pick(draw);
      ctx.toast((me === ctx.human ? 'Your cards: ' : 'Opponent cards: ') + draw.map(function (d) { return d[0]; }).join(' | ') + '  ->  ' + pick[0], 4200);
      pick[1](); ctx.fx({ type: 'flash', color: '#ffffff', opacity: 0.35 }); ctx.refresh();
    }
  },
  todo_pass2: ['card choice UI: three white rounded cards, pick one (player); bot picks', 'full 70+ effect pool incl. delayed and lasting effects', 'DougDoug site look and card art (original)'],
  source: { research: 'research/modes/rcFGwuREQFY.json', confidence: 'medium', notes: 'Effect pool is original; random pick instead of the player choice.' }
});
