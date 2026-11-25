/* Chess, But SCP-2774 Is Inside Your Head. Standard chess vs Stockfish (3600) with a neutral SCP-2774 "sloth" on b4.
   After every Black move the sloth steps one square, then checks its 8 neighbours clockwise starting at the top-left
   (from White's view); every piece it finds, of either colour, is forced to make a random move (check is ignored, so a
   king can be left capturable; capturing a king wins). A piece forced onto a neighbour not yet checked moves again.
   Sources: research/modes/JUlTxosCXuk.json (transcript 00:01 b4 start, 00:58 clockwise scan + chain, 03:10 pieces
   cannot move onto the sloth, 06:56 move order White, Black, sloth, 07:19 queen captures king), frames: brown board
   #ead2b5/#ae8163, red danger squares around the sloth, pink arrows for each forced move, "Stockfish (3600)".
   Inferred: how the sloth picks its step (random, drawn toward pieces), pause lengths. Sloth art is original. */
CM.mode({
  id: 'JUlTxosCXuk',
  name: 'SCP-2774',
  category: 'Horror Chess',
  description: 'SCP-2774 sits on b4 and takes the free will of every piece next to it. After each of Stockfish\'s moves it steps one square, then checks its neighbours clockwise from the top-left: each piece it finds, yours or Stockfish\'s, makes a random move. Random moves ignore check, so kings can be left hanging. Nothing can capture or land on SCP-2774.',
  how_to_win: 'Checkmate Stockfish, or capture its king when SCP-2774 leaves it exposed.',
  player_side: 'white',
  opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Plays perfect chess. SCP-2774 does not.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#ead2b5', dark: '#ae8163' },
  pieces: {
    S: { name: 'SCP-2774', moves: '', value: 0, capturable: false, img: 'assets/modes/JUlTxosCXuk/scp2774.png', neutralGlow: false }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'S', color: 'n', at: 'b4' }] },
  bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
  params: { stepMs: 520, moveMs: 640 },
  messages: { win: 'you captured the Stockfish king' },
  hooks: {
    afterMove: function (ctx, m, info) {
      if (info.by !== 'bot' || ctx.over) return;
      return slothTurn(ctx);
    },
    decorate: function (ctx, sq) {
      var s = slothSq(ctx); if (s < 0 || sq === s) return null;
      if (ctx.geo.dist(sq, s) === 1) return { html: '<span class="sq-tint" style="background:rgba(214,40,40,.42)"></span>' };
      return null;
    }
  },
  source: { research: 'research/modes/JUlTxosCXuk.json', confidence: 'high' }
});

function slothSq(ctx) { var b = ctx.state.b; for (var i = 0; i < b.length; i++) if (b[i] && b[i].t === 'S') return i; return -1; }

/* one sloth round: step, then the clockwise scan with forced random moves (returns a Promise) */
function slothTurn(ctx) {
  var g = ctx.geo, V = ctx.V, slow = ctx.game && CM.settings.reducedMotion() ? 0.5 : 1;
  var STEP = ctx.params.stepMs * slow, MOVE = ctx.params.moveMs * slow;
  var CW = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
  var wait = function (ms) { return new Promise(function (r) { ctx.after(ms, r); }); };
  var s = slothSq(ctx); if (s < 0) return null;
  /* 1. the sloth wanders one square, drawn toward crowded squares */
  var steps = [];
  CW.forEach(function (d) {
    var j = g.step(s, d[0], d[1]); if (j < 0 || ctx.at(j)) return;
    var crowd = 0; CW.forEach(function (e) { var k = g.step(j, e[0], e[1]); if (k >= 0 && ctx.at(k) && k !== s) crowd++; });
    for (var w = 0; w <= crowd; w++) steps.push(j);
  });
  var chain = wait(STEP);
  if (steps.length) {
    var to = ctx.pick(steps);
    chain = chain.then(function () { ctx.move(s, to); s = to; ctx.sound('move-opponent'); ctx.refresh(); return wait(STEP); });
  }
  /* 2. clockwise scan from the top-left neighbour */
  CW.forEach(function (d) {
    chain = chain.then(function () {
      if (ctx.over) return;
      var i = g.step(s, d[0], d[1]); if (i < 0) return;
      var p = ctx.at(i); if (!p || p.t === 'S' || V.def(p.t).blocker) return;
      var out = []; V.genPiece(ctx.state, i, out, true);
      out = out.filter(function (mv) { return mv.t !== s && mv.f === i; });
      if (!out.length) return;
      var mv = ctx.pick(out);
      ctx.fx({ type: 'arrow', from: mv.f, to: mv.t, color: 'rgba(232, 72, 190, 0.85)', duration_ms: MOVE + 200 });
      return wait(MOVE).then(function () {
        var victim = ctx.at(mv.t);
        ctx.move(mv.f, mv.t);
        var moved = ctx.at(mv.t), last = moved && V.def(moved.t).pawn && g.relRow(mv.t, moved.c) === g.depth(moved.c) - 1;
        if (last) ctx.transform(mv.t, { type: 'Q' });
        ctx.sound(victim ? 'capture' : 'move-opponent');
        ctx.toast('SCP-2774 forced ' + (V.def(p.t).name || p.t).toLowerCase() + ' ' + g.name(mv.f) + ' to ' + g.name(mv.t) + '.', 1800);
        if (victim && V.def(victim.t).royal) { ctx.refresh(); ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'SCP-2774 handed your king to Stockfish' : 'SCP-2774 handed you the Stockfish king'); return; }
        ctx.refresh();
        return wait(STEP * 0.6);
      });
    });
  });
  return chain;
}
