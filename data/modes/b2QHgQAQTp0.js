/* Chess, But SCP-4000 Steals Your Identity (video b2QHgQAQTp0, 13:26, 2026-11-28), by iwantcheckmate.
   Sources, both primary: the creator's own playable page iwantcheckmate.com/challenges/scp-4000/ ("Chess, But SCP-4000
   Tries to Steal Your Identity", game.js read 2026-11-28; rules reimplemented here, no code copied) and the video's full
   transcript + YouTube stills (research/modes/b2QHgQAQTp0.json). The two agree on every rule below.
   What the video does: standard chess vs Stockfish (3600) with a neutral rabbit from the SCP-4000 forest on e4 (0:14).
   After each of Stockfish's moves the rabbit makes its own move, then swaps places with a piece next to it and takes
   that piece's movement for its next move (0:01, 0:40-0:51). One game, won by a double check and capturing the king (12:52).
   Rules, each with its source:
   - the rabbit starts on e4 (0:14; site: rabbitSquare e4) and starts out moving like a white king (site: rabbitAbility
     'wK'; the video's first move is a one-square step, 0:40-0:51)
   - it is a solid obstacle: nothing can land on it, capture it or pass through it (site pseudo(): never a target; it
     blocks lines; video 9:06 "the knight is kind of trapped because it can't move onto whatever we want to call this")
   - it acts only after Black's move, once per round (site: `if (c === ENGINE) await rabbitTurn()`; video 1:25-1:37,
     2:35, 2:47 - every swap follows the engine's move)
   - step 1, move: a random move of the piece it copied, colour included (a white pawn goes up, a black pawn down; a
     pawn on its start rank may step two), to an EMPTY square only: it never captures, never castles or takes en passant
     (site rabbitMoves(); video 0:51 "it can now move like a white pawn, meaning its only available next move is up to
     D5", 4:54 queen move, 10:57 knight move). With no move it stays put (video 8:46-8:53 / 9:32 / 9:45: stuck in a loop)
   - step 2, swap: if any of the 8 squares around it holds a piece of either colour, kings included, it picks one at
     random and the two trade places (site neighbors()+pick(); video 0:01 "steals the identity of adjacent pieces,
     swapping places"; 4:10 the black queen; 4:28 "the king might get swapped with"); with no neighbour, nothing happens
     (video 10:36-10:47 "place a piece directly adjacent to it ... break it free")
   - it now moves like the piece it swapped with (site: rabbitAbility = piece; video 0:51, 4:54, 10:57)
   - a pawn swapped onto its own last rank becomes a queen (site: promotes -> color + 'Q'); a pawn swapped onto any
     other rank stays a pawn and may double-step if that is its start rank (site's pawn rule is rank-based); a king or rook
     that is swapped loses castling (site: castle rights cleared); en passant ends when the swap or hop spoils it
   - a swap can leave a king in check with the other side to move: that side may then capture the king (site: legal
     moves allow capturing the king, which ends the game; video 12:52-12:58 "this crazy double check ... we do in fact
     capture the king")
   - normal chess otherwise: checkmate, stalemate and draws as usual; promotion Q/R/B/N (site picker Q R B N)
   Pacing from the site: the hop slides (300 ms); 1 s pause; the rabbit and its target tremble together for 1 s (damped
   0 -6 6 -5 5 -4 3 -2 1 0 %); 1 s pause; both slide to each other's squares (300 ms). Our slides use the board's own slide.
   INFERRED: nothing about the rules. Only staging is ours: the sounds (CC0, nobody has listened), the hop/swap toasts and
   the status line naming what it moves like (neither the site nor the video draws the copied piece on the rabbit).
   Art: assets/modes/b2QHgQAQTp0/scp4000.png is the creator's own rabbit (iwantcheckmate.com/challenges/scp-4000/rabbit.png,
   the same drawing the video shows, maxres2/maxresdefault); pieces Staunty, the set the site and the video use; board
   #ebd4b5 / #ae8162 sampled from the video still maxres2 (the site's page today is a touch darker, #EACFAC / #AA7A5B). source.notes in that folder, LICENSES.md rows. */
(function () {
  var DIR = 'assets/modes/b2QHgQAQTp0/';
  var IMG = DIR + 'scp4000.png';
  var NAMES = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' };
  var LINES = { B: [[1, 1], [-1, 1], [1, -1], [-1, -1]], R: [[1, 0], [-1, 0], [0, 1], [0, -1]] };
  LINES.Q = LINES.B.concat(LINES.R);
  var KING = LINES.Q, KNIGHT = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];

  function find(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'S40') return i; return -1; }
  function ability(p) { return (p && p.ab) || 'wK'; }   /* 'wK' = moves like a white king (the site's starting identity) */
  function abilityText(ab) { return (ab[0] === 'w' ? 'white ' : 'black ') + NAMES[ab[1]]; }

  /* the rabbit's own moves: the copied piece's moves from its square, onto empty squares only (geo.step: dr < 0 = up) */
  function rabbitMoves(ctx, s) {
    var g = ctx.geo, b = ctx.state.b, ab = ability(b[s]), c = ab[0], t = ab[1], out = [];
    var empty = function (j) { return j >= 0 && !b[j]; };
    if (t === 'P') {
      var dr = c === 'w' ? -1 : 1, one = g.step(s, 0, dr);
      if (empty(one)) {
        out.push(one);
        var startRank = c === 'w' ? 2 : g.ranks - 1, two = g.step(one, 0, dr);
        if (g.rank(s) === startRank && empty(two)) out.push(two);
      }
    } else if (t === 'N' || t === 'K') {
      (t === 'N' ? KNIGHT : KING).forEach(function (d) { var j = g.step(s, d[0], d[1]); if (empty(j)) out.push(j); });
    } else {
      LINES[t].forEach(function (d) { var j = g.step(s, d[0], d[1]); while (empty(j)) { out.push(j); j = g.step(j, d[0], d[1]); } });
    }
    return out;
  }

  /* en passant only survives when its square is still empty and the pawn that made it is still there */
  function fixEp(ctx) {
    var st = ctx.state; if (st.ep == null || st.ep < 0) return;
    var p = st.epv >= 0 ? st.b[st.epv] : null;
    if (st.b[st.ep] || !p || p.t !== 'P' || p.c === 'n') { st.ep = -1; st.epv = -1; }
  }

  function rabbitTurn(ctx) {
    var AF = CM.abilityFx, s = find(ctx.state); if (s < 0 || ctx.over) return null;
    var moves = rabbitMoves(ctx, s);
    return AF.wait(ctx, 350).then(function () {
      if (ctx.over || !moves.length) return;
      var to = ctx.pick(moves);
      ctx.move(s, to); s = to; fixEp(ctx);
      ctx.sound('s4000_hop'); ctx.refresh();
      return AF.wait(ctx, 320);
    }).then(function () {
      if (ctx.over) return;
      var near = AF.ring(ctx, s).filter(function (j) { var q = ctx.at(j); return q && q.t !== 'S40'; });
      if (!near.length) return;
      var target = ctx.pick(near);
      return AF.wait(ctx, 1000).then(function () {
        if (ctx.over) return;
        ctx.sound('s4000_tremor');
        return ctx.fx({ type: 'tremor', at: [s, target], duration_ms: 1000 });
      }).then(function () { return AF.wait(ctx, 1000); }).then(function () {
        if (ctx.over) return;
        var rab = ctx.at(s), q = ctx.at(target), V = ctx.V, g = ctx.geo;
        if (!rab || !q) return;
        var ab = q.c + q.t;
        /* the piece lands on the rabbit's old square: a pawn on its own last rank becomes a queen; a pawn keeps its double
           step only on its start rank (the site's pawn rule is by rank); kings and rooks lose castling */
        var nq = Object.assign({}, q, { m: 1 });
        if (q.t === 'P') {
          var last = q.c === 'w' ? g.ranks : 1, start = q.c === 'w' ? 2 : g.ranks - 1;
          if (g.rank(s) === last) nq = V.piece('Q', q.c, { m: 1 });
          else nq.m = g.rank(s) === start ? 0 : 1;
          ctx.state.half = 0;
        }
        ctx.set(target, Object.assign({}, rab, { ab: ab }));
        ctx.set(s, nq);
        fixEp(ctx);
        ctx.sound('s4000_swap');
        ctx.refresh();
        var foe = V.opp(ctx.state.turn);
        if (nq.t !== q.t) ctx.toast('The ' + abilityText(ab) + ' landed on the last rank and became a queen.', 2200);
        if (!ctx.over && ctx.state.turn === ctx.human && V.inCheck(ctx.state, foe)) ctx.toast('The swap left the Stockfish king in check. Take it!', 2600);
        return AF.wait(ctx, 320);
      });
    }).then(function () { if (!ctx.over) ctx.refresh(); });
  }

  CM.mode({
    id: 'b2QHgQAQTp0',
    title: 'Chess, But SCP-4000 Steals Your Identity',
    name: 'SCP-4000',
    category: 'Horror Chess',
    description: 'A rabbit from the SCP-4000 forest sits on e4 and blocks its square. After each of Stockfish\'s moves it makes a move of its own, then swaps places with a random piece next to it, of either colour, and from then on moves like that piece. It starts out moving like a white king.',
    how_to_win: 'Checkmate Stockfish. Keep your pieces next to the rabbit: a lucky swap can drop one onto a fork, or leave the black king in check so you can take it.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* purple king avatar (YouTube still maxres2) */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/inm7KvllVu0/stockfish.png',   /* "Stockfish (3600)" with the trout avatar (maxres2) */
      tagline: 'Refers to everything by its name.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ebd4b5', dark: '#ae8162', pieces: 'staunty' },   /* sampled from the video (maxres2: #ebd4b5 / #ae8162); the site today uses #EACFAC / #AA7A5B. Staunty is the site's and the video's set */
    pieces: { S40: { name: 'SCP-4000', moves: '', value: 0, blocker: true, capturable: false, img: IMG, neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'S40', color: 'n', at: 'e4' }] },
    rules: {},
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },   /* the site runs Fairy-Stockfish at full strength for 1 s with the rabbit as a wall; it never plans for the rabbit's turn either */
    sounds: { 's4000_hop': DIR + 's4000_hop.wav', 's4000_tremor': DIR + 's4000_tremor.wav', 's4000_swap': DIR + 's4000_swap.wav' },   /* tools/sfx/modes_scp4000.py, CC0 sources */
    hooks: {
      afterMove: function (ctx, m, info) { if (info.side !== 'b' || ctx.over) return null; return rabbitTurn(ctx); /* after Black's move only, as on the site */ },
      status: function (ctx) {
        var s = find(ctx.state); if (s < 0) return '';
        return 'SCP-4000 is on ' + ctx.name(s) + ' and moves like a ' + abilityText(ability(ctx.at(s))) + '.';
      }
    },
    source: { research: 'research/modes/b2QHgQAQTp0.json', confidence: 'high', notes: 'Rules from the creator\'s own page iwantcheckmate.com/challenges/scp-4000/ (read 2026-11-28), checked against the full transcript and the YouTube stills. Only the sounds, toasts and status line are ours.' }
  });
})();
