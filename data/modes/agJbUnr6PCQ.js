/* Chess, But SCP-956 Is After the Children (video agJbUnr6PCQ, about 10:00, 2026-11-27), by iwantcheckmate.
   Sources: research/modes/agJbUnr6PCQ.json (rules with transcript times), YouTube stills maxres1-3 (no other frames).
   What the video does: standard chess vs Stockfish (3600). SCP-956, the pinata, hides on an empty square and shows
   itself only to bonk every pawn next to it with a bat; each bonked pawn adds another hidden pinata. Three games, all
   won (two king-and-rook mates, then the "cheese": a queen lined up on the king through one pawn, 4:50, 9:10-9:37).
   Rules, each with its transcript time:
   - one hidden pinata on an unoccupied square at the start (0:17); it only targets pawns, of both colours (0:35; the
     video bonks c5 1:15, a7+b7 1:29, a2+b2 1:31, e4/d2/c2 1:42)
   - after every move, a pinata with a pawn on any of its 8 neighbours reveals itself and bonks all of them (0:01,
     6:39 "A7 and B7 get removed. C4 gets removed as well"); squares next to a pawn therefore never hold an
     undiscovered pinata (5:32-5:47, the third and sixth ranks are ruled out from the start)
   - every bonked pawn adds one more hidden pinata (0:09, 1:15 "at least two SCPs now", 6:18 "at least three")
   - a piece that lands on a pinata's square makes it reposition somewhere else on the board (6:07-6:18)
   - when no pawns are left, the pinatas are gone for the rest of the game (2:36)
   - a bonk can expose a king; the side to move may then take it (the cheese, 4:50 and 9:35 "the king is looking
     directly at us"); the engine allows king capture when a king is left attacked (js/engine/variant.js)
   INFERRED (the video shows no rule for these): the start pinata is placed uniformly on an empty square that touches
   no pawn (5:32 says those squares are ruled out); a new pinata from a bonk hides on a random empty square that touches
   no pawn (5:32-5:47: an undiscovered pinata is never next to a pawn; spawning anywhere made one bonk wipe every pawn
   in a single chain, which the video never does: game 1 loses its pawns over ~10 moves, 1:15-2:36); a repositioned
   pinata goes to any random empty square and bonks at once if that touches a pawn (6:07-6:18: f4 -> h6, g7+h7 gone);
   several pinatas act one after another in square order, each pawn one at a time (6:39 frame: b7 is hit after a7);
   promotion stays Q/R/B/N. The bat swing, the knock-off and the candy burst are our own staging (the video shows
   the pinata on the square, maxres2, but no frame of the hit).
   Art: assets/modes/agJbUnr6PCQ/ (pinata.png and bat.png are original art, source.notes; LICENSES.md rows). */
(function () {
  var DIR = 'assets/modes/agJbUnr6PCQ/';
  var PINATA = DIR + 'pinata.png', BAT = DIR + 'bat.png';
  var CANDY = ['#ff4fa3', '#ffd23f', '#3fbf5f', '#8a4fd8', '#ff8a2a', '#ffffff'];

  function pins(st) { return (st.x && st.x.p956) || []; }
  function isPawn(ctx, p) { return !!p && p.c !== 'n' && (p.t === 'P' || !!ctx.V.def(p.t).pawn); }
  function pawnsNear(ctx, s) { return CM.abilityFx.ring(ctx, s).filter(function (j) { return isPawn(ctx, ctx.at(j)); }); }
  function anyPawn(ctx) { return ctx.pieces(function (p) { return isPawn(ctx, p); }).length > 0; }
  /* a random empty square with no pinata on it (and not `not`); hidden: only squares that touch no pawn, so the new
     pinata really is hidden (falls back to any free square when none is left) */
  function freeSquare(ctx, list, not, hidden) {
    var opts = ctx.emptySquares(function (i) { return list.indexOf(i) < 0 && i !== not; });
    if (hidden) { var safe = opts.filter(function (i) { return !pawnsNear(ctx, i).length; }); if (safe.length) opts = safe; }
    return opts.length ? ctx.pick(opts) : -1;
  }
  function save(ctx, list) { ctx.setX('p956', list.slice().sort(function (a, b) { return a - b; })); }

  /* one pinata shows itself and bonks every pawn next to it, one after another */
  function bonkAll(ctx, s, list, tally) {
    var AF = CM.abilityFx, id = 'p956_' + s;
    ctx.fx({ type: 'sprite', id: id, at: s, src: PINATA, fade_in_ms: 160 });
    ctx.sound('pinata_reveal');
    var chain = AF.wait(ctx, 300);
    pawnsNear(ctx, s).forEach(function (j) {
      chain = chain.then(function () {
        if (ctx.over) return;
        var p = ctx.at(j); if (!isPawn(ctx, p)) return;
        ctx.fx({ type: 'swing', at: s, toward: j, src: BAT, duration_ms: 240 });
        return AF.wait(ctx, 170).then(function () {
          if (ctx.over) return;
          var img = CM.settings.pieceUrl(p.c, p.t);
          ctx.remove(j); ctx.refresh({ instant: true });
          ctx.sound('pinata_bonk');
          ctx.fx({ type: 'knock', at: j, from: s, piece: img, duration_ms: 520 });
          ctx.fx({ type: 'particles', kind: 'confetti', at: j, count: 12, colors: CANDY });
          tally.n++;
          var add = freeSquare(ctx, list, -1, true);
          if (add >= 0) list.push(add);
          save(ctx, list);
          return AF.wait(ctx, 330);
        });
      });
    });
    return chain.then(function () { ctx.fx({ type: 'sprite_out', id: id, fade_ms: 260 }); return AF.wait(ctx, 200); });
  }

  /* after every move: pinatas under a piece reposition, then every pinata next to a pawn bonks; new pinatas can
     chain into more bonks in the same move. With no pawns left the pinatas are gone. */
  function resolve(ctx, info) {
    var AF = CM.abilityFx, list = pins(ctx.state).slice(), tally = { n: 0 };
    if (!list.length || ctx.over) return null;
    var moved = false;
    list.forEach(function (s, k) {
      if (!ctx.at(s)) return;
      var to = freeSquare(ctx, list, s);
      list[k] = to; moved = true;
    });
    list = list.filter(function (s) { return s >= 0; });
    if (moved) save(ctx, list);
    var waves = 0;
    function wave() {
      if (ctx.over || waves++ > 64) return null;
      var act = list.filter(function (s) { return pawnsNear(ctx, s).length; });
      if (!act.length) return null;
      var chain = Promise.resolve();
      act.forEach(function (s) { chain = chain.then(function () { if (!ctx.over && pawnsNear(ctx, s).length) return bonkAll(ctx, s, list, tally); }); });
      return chain.then(wave);
    }
    var w = wave();
    if (!w) return null;
    return w.then(function () {
      if (ctx.over) return;
      if (!anyPawn(ctx)) { save(ctx, []); ctx.toast('Every pawn is gone, so the pinatas are gone for the rest of the game.', 2600); }
      else if (tally.n) ctx.toast(tally.n === 1 ? 'SCP-956 bonked a pawn. Another pinata is hiding.' : 'SCP-956 bonked ' + tally.n + ' pawns. ' + tally.n + ' more pinatas are hiding.', 1900);
      ctx.refresh();
      /* a bonk can leave a king attacked with its opponent to move: tell the player when it is their win */
      var V = ctx.V, st = ctx.state, foe = V.opp(st.turn);
      if (!ctx.over && st.turn === ctx.human && V.inCheck(st, foe)) ctx.toast('The pawn in front of the Stockfish king is gone. Take the king!', 2600);
      return AF.wait(ctx, 120);
    });
  }

  CM.mode({
    id: 'agJbUnr6PCQ',
    title: 'Chess, But SCP-956 Is After the Children',
    name: 'SCP-956',
    category: 'Horror Chess',
    description: 'SCP-956, the pinata, hides on an empty square. Whenever a pawn of either colour stands next to it, it shows itself and bonks that pawn off the board with its bat, and every bonked pawn adds another hidden pinata. A piece that lands on a pinata makes it move somewhere else. Once every pawn is gone, so are the pinatas.',
    how_to_win: 'Checkmate Stockfish, or line a piece up on its king through one pawn and let the pinata clear the way.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* purple king avatar, as in the video (maxres2) */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/inm7KvllVu0/stockfish.png',   /* "Stockfish (3600)" with the trout avatar (maxres2) */
      tagline: 'Has never been to a birthday party.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2b6', dark: '#af8164' },   /* sampled from maxres2: #ead3b4 / #ae8162 */
    pieces: {},
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    rules: {},
    bot: { engine: 'auto', style: 'best', depth: 4, time_ms: 700 },   /* Stockfish when the position is standard (the video plays Fairy-Stockfish, 8:01), CM.Search otherwise; it never knows where the pinatas are */
    sounds: { 'pinata_reveal': DIR + 'pinata_reveal.wav', 'pinata_bonk': DIR + 'pinata_bonk.wav' },   /* tools/sfx/modes_scp956.py, CC0 sources */
    hooks: {
      setup: function (ctx) {
        var opts = ctx.emptySquares(function (i) { return !pawnsNear(ctx, i).length; });
        ctx.setX('p956', opts.length ? [ctx.pick(opts)] : []);
      },
      afterMove: function (ctx, m, info) { return resolve(ctx, info); },
      status: function (ctx) {
        var n = pins(ctx.state).length;
        if (!n) return anyPawn(ctx) ? 'No pinatas left.' : 'No pawns left, so no pinatas either.';
        return n === 1 ? '1 pinata is hiding on an empty square.' : n + ' pinatas are hiding on empty squares.';
      }
    },
    source: { research: 'research/modes/agJbUnr6PCQ.json', confidence: 'medium', notes: 'Rules from the full transcript; board, players and the revealed pinata from the YouTube stills (no gameplay video frames could be fetched). Placement randomness, cascade order and the hit animation are inferred; see the header.' }
  });
})();
