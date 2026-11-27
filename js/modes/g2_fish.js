/* g2_fish: shared hooks for the "Variant Bots" videos (group 2): Stockfish / Martin bots whose rating moves during the
   game or that pick their move by a rule (2nd best, top 3, closest to 0.00, worst, mirror your move quality, ...).
   params (all optional):
     elo:   { start, starts: [g1, g2] (one per game, cycles), min (0), max (3600),
              botMove: d          after every bot move           (Tired Fish -50, Smarten +100)
              botCapCheck: d      when the bot captures or checks (Hungry Martin +1000)
              toggle: [a, b]      switch a <-> b when the BOT captures (Alternate Fish 3600 <-> 250)
              playerBest: d       when your move is the engine's best (Tiltfish -100)
              playerNotBest: d    when it is not (Martin +200)
              playerWorst: d      when it is the single worst legal move (Pity Fish -500)
              playerCheck: d      when your move gives check (Panic Fish -300)
              perMinute: d        rating grows with the game time
              turnRamp: { ms: 5000, to: 3600, step: 100 }  ClockFish as on iwantcheckmate.com: each time it is your
                                  move it drops to 0 and climbs to `to` over `ms` of your thinking time; it plays at
                                  the rating it had when you moved }
            The bot plays at its current rating: Stockfish (UCI_Elo) when >= 1320, the built-in search below.
     brains: { schedule: ['S','S','M'] (fixed cycle of bot moves, S = Stockfish 3600, M = Martin 250)
               p: 0.95 (chance of a Stockfish move, else Martin), show: true (status names the next brain) }
     pick:  'second' | 'top3' | 'geometric' | 'drawish' | 'worst' | 'blunder5' | 'mirror' | 'rooksac' | 'mustcheck'
            | 'zebra' | 'simp' | 'torture'      (move rule; uses the built-in search ranking)
     selfmate: 'w'    (your colour) you win when the bot checkmates you (Worstfish / DrawFish "can I lose" videos)
     spectate: { white: 'worst', black: 'zach', forfeitPly: 180 }  bot-vs-bot, no human moves
     side: ['w', 'b']  player colour per game (cycles)
     pass 2 look: lastMoveTint: 'rgba(..)' (magenta last-move squares), forcedHighlight: colour (square flash on a forced
              bot move), toggleAvatars: [stockfishImg, martinImg] (with elo.toggle), bubble: { text, chance } (speech text
              over the bot's move: DrawFish "I offer draw.")
   Quality checks (best / worst / mirror rank) rank your legal moves with the built-in search (about 0.35 s).
   MirrorFish (pick 'mirror') follows iwantcheckmate.com: your move's rank in Stockfish's top 5 (700 ms) is copied (ranks
   1-4, else the 5th). On top of that (ours, not the site's) a chess.com Classification V2 review badge (Brilliant ...
   Blunder, Book) is centred on the top-right corner of the square each move lands on (board-level overlay) and the
   from/to squares take its colour; options "Show move rank" / "Show move quality badges" (settings mqRank / mqBadges).
   Art in assets/ui/move-quality (tools/art_move_badges.py, CC0). */
(function () {
  'use strict';
  var CM = window.CM;
  var RUN = {};
  function run(ctx) { var id = ctx.spec.id; return RUN[id] || (RUN[id] = { game: 0 }); }
  function P(ctx) { return ctx.params || {}; }
  function clampElo(ctx, e) { var E = P(ctx).elo || {}; return Math.max(E.min == null ? 0 : E.min, Math.min(E.max == null ? 3600 : E.max, Math.round(e))); }
  function sameMove(a, b) { return a && b && a.f === b.f && a.t === b.t && (a.promo || null) === (b.promo || null) && (a.drop || null) === (b.drop || null); }
  function prevState(ctx) { var h = ctx.game.history; return h.length ? h[h.length - 1].state : null; }
  function rankFor(V, st, ms) {
    var S = new CM.Search(V, {});
    return S.rank(st, { moves: ms, maxDepth: 3, timeMs: 350, noise: 0 });
  }
  function isMateNow(V, n) { var l = V.legal(n); return !l.length && V.inCheck(n, n.turn); }
  function hasType(st, c, t) { return st.b.some(function (p) { return p && p.c === c && p.t === t; }); }
  /* how many of the opponent's (not colour h's) pieces could capture colour h's queen in st. st is the position after
     the bot's move, so it is h's turn there: look at it with the bot to move (m-qa: the old version bailed out when
     st.turn === h, i.e. always, so SimpFish never chased the queen) */
  function queenPressure(V, st, h) {
    var q = -1; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === h && p.t === 'Q') { q = i; break; } }
    if (q < 0) return 0;
    var n = 0, look = V.clone(st);
    look.turn = h === 'w' ? 'b' : 'w';
    for (var j = 0; j < look.b.length; j++) {
      var a = look.b[j]; if (!a || a.c !== look.turn) continue;
      var ms = []; V.genPiece(look, j, ms, true);
      if (ms.some(function (m) { return m.t === q && m.cap; })) n++;
    }
    return n;
  }
  /* ---- MirrorFish move-quality review (owner 2026-11-26; our add-on: iwantcheckmate.com shows no grades) ----
     Chess.com Classification V2 (expected points): the drop in the mover's expected points from the engine's best move
     to the played move, both from Fairy-Stockfish at the same fixed depth. Best (the top move) / Excellent <= 0.02 /
     Good <= 0.05 / Inaccuracy <= 0.10 / Mistake <= 0.20 / Blunder; Great (the only good move), Brilliant (sound piece
     sacrifice), Miss (did not punish the opponent's error), Book (a position of the opening table below). It never
     changes what the fish plays: the mirror mechanic is the site's rank rule (mirrorRankOf / mirrorPlan below).
     Unit tests: test/mirror-review.test.mjs; validation against native Stockfish: tools/mirror_validate/. */
  var QLABEL = { brilliant: 'Brilliant', great: 'Great move', best: 'Best move', excellent: 'Excellent', good: 'Good', book: 'Book move',
    inaccuracy: 'Inaccuracy', mistake: 'Mistake', miss: 'Miss', blunder: 'Blunder' };
  /* chess.com review square colours (semi-transparent over the square), keyed like the badges */
  var QTINT = { brilliant: 'rgba(38, 194, 163, 0.55)', great: 'rgba(92, 139, 176, 0.6)', best: 'rgba(129, 182, 76, 0.55)', excellent: 'rgba(129, 182, 76, 0.55)',
    good: 'rgba(149, 183, 118, 0.45)', book: 'rgba(168, 136, 101, 0.55)', inaccuracy: 'rgba(247, 198, 49, 0.55)', mistake: 'rgba(255, 167, 38, 0.55)',
    miss: 'rgba(250, 65, 45, 0.5)', blunder: 'rgba(250, 65, 45, 0.5)' };
  var QLEVEL = { brilliant: 0, great: 0, best: 0, book: 0, excellent: 1, good: 2, inaccuracy: 3, mistake: 4, miss: 5, blunder: 5 };
  /* opening book, UCI from the standard start (castling = king move). Every position on these lines is Book. */
  var BOOK = [
    'e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7', 'e2e4 e7e5 g1f3 b8c6 f1b5 g8f6 e1g1 f6e4', 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3',
    'e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 d2d3 f8e7', 'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 b2b4', 'e2e4 e7e5 g1f3 b8c6 d2d4 e5d4 f3d4 g8f6',
    'e2e4 e7e5 g1f3 b8c6 b1c3 g8f6', 'e2e4 e7e5 g1f3 g8f6 f3e5 d7d6 e5f3 f6e4', 'e2e4 e7e5 g1f3 d7d6 d2d4 e5d4',
    'e2e4 e7e5 b1c3 g8f6 f2f4', 'e2e4 e7e5 b1c3 b8c6', 'e2e4 e7e5 f2f4 e5f4 g1f3', 'e2e4 e7e5 f1c4 g8f6', 'e2e4 e7e5 d2d4 e5d4 d1d4',
    'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6', 'e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 g7g6', 'e2e4 c7c5 g1f3 b8c6 d2d4 c5d4 f3d4 g8f6 b1c3 e7e5',
    'e2e4 c7c5 g1f3 e7e6 d2d4 c5d4 f3d4 a7a6', 'e2e4 c7c5 g1f3 b8c6 f1b5', 'e2e4 c7c5 b1c3 b8c6 g2g3 g7g6', 'e2e4 c7c5 c2c3 g8f6 e4e5 f6d5', 'e2e4 c7c5 d2d4 c5d4 c2c3',
    'e2e4 e7e6 d2d4 d7d5 b1c3 g8f6 c1g5', 'e2e4 e7e6 d2d4 d7d5 b1c3 f8b4 e4e5', 'e2e4 e7e6 d2d4 d7d5 e4e5 c7c5 c2c3 b8c6', 'e2e4 e7e6 d2d4 d7d5 b1d2 g8f6', 'e2e4 e7e6 d2d4 d7d5 e4d5 e6d5',
    'e2e4 c7c6 d2d4 d7d5 b1c3 d5e4 c3e4 c8f5', 'e2e4 c7c6 d2d4 d7d5 e4e5 c8f5', 'e2e4 c7c6 d2d4 d7d5 e4d5 c6d5', 'e2e4 c7c6 b1c3 d7d5 g1f3',
    'e2e4 d7d5 e4d5 d8d5 b1c3 d5a5', 'e2e4 d7d5 e4d5 g8f6', 'e2e4 d7d6 d2d4 g8f6 b1c3 g7g6', 'e2e4 g7g6 d2d4 f8g7 b1c3 d7d6', 'e2e4 g8f6 e4e5 f6d5 d2d4 d7d6', 'e2e4 b8c6 d2d4 d7d5',
    'd2d4 d7d5 c2c4 e7e6 b1c3 g8f6 c1g5 f8e7', 'd2d4 d7d5 c2c4 e7e6 g1f3 g8f6 b1c3', 'd2d4 d7d5 c2c4 d5c4 g1f3 g8f6 e2e3 e7e6', 'd2d4 d7d5 c2c4 c7c6 g1f3 g8f6 b1c3 d5c4',
    'd2d4 d7d5 c2c4 c7c6 b1c3 g8f6', 'd2d4 d7d5 g1f3 g8f6 c1f4 e7e6 e2e3', 'd2d4 d7d5 c1f4 g8f6 e2e3 e7e6', 'd2d4 d7d5 e2e3 g8f6', 'd2d4 d7d5 c2c4 b8c6',
    'd2d4 g8f6 c2c4 e7e6 b1c3 f8b4 e2e3', 'd2d4 g8f6 c2c4 e7e6 g1f3 b7b6 g2g3', 'd2d4 g8f6 c2c4 e7e6 g1f3 d7d5', 'd2d4 g8f6 c2c4 e7e6 g2g3 d7d5 f1g2',
    'd2d4 g8f6 c2c4 g7g6 b1c3 f8g7 e2e4 d7d6 g1f3 e8g8', 'd2d4 g8f6 c2c4 g7g6 b1c3 d7d5 c4d5 f6d5 e2e4', 'd2d4 g8f6 c2c4 c7c5 d4d5 b7b5', 'd2d4 g8f6 c2c4 c7c5 d4d5 e7e6',
    'd2d4 g8f6 g1f3 g7g6 g2g3 f8g7', 'd2d4 g8f6 g1f3 e7e6 c1g5', 'd2d4 g8f6 c1f4 d7d5 e2e3', 'd2d4 g8f6 c1g5 e7e6', 'd2d4 f7f5 c2c4 g8f6 g2g3 e7e6', 'd2d4 f7f5 g1f3 g8f6',
    'd2d4 e7e6 c2c4 g8f6', 'd2d4 d7d6 e2e4 g8f6', 'd2d4 g7g6 c2c4 f8g7', 'd2d4 c7c5 d4d5 e7e5',
    'c2c4 e7e5 b1c3 g8f6 g1f3 b8c6 g2g3', 'c2c4 g8f6 b1c3 e7e6 g1f3', 'c2c4 g8f6 b1c3 e7e5', 'c2c4 c7c5 b1c3 b8c6 g2g3 g7g6 f1g2 f8g7', 'c2c4 e7e6 b1c3 d7d5',
    'c2c4 c7c6 e2e4 d7d5', 'c2c4 g7g6 b1c3 f8g7',
    'g1f3 d7d5 g2g3 g8f6 f1g2 e7e6 e1g1 f8e7', 'g1f3 d7d5 c2c4 e7e6', 'g1f3 d7d5 d2d4 g8f6', 'g1f3 g8f6 c2c4 g7g6 b1c3 f8g7', 'g1f3 g8f6 g2g3 g7g6',
    'g1f3 c7c5 c2c4 b8c6', 'g1f3 c7c5 e2e4', 'g1f3 f7f5', 'g2g3 d7d5 f1g2 g8f6', 'g2g3 e7e5 f1g2', 'b2b3 e7e5 c1b2 b8c6', 'b2b3 d7d5 c1b2',
    'f2f4 d7d5 g1f3 g8f6', 'f2f4 e7e5', 'b1c3 d7d5 e2e4', 'b1c3 e7e5', 'e2e3 e7e5', 'd2d3 e7e5', 'c2c3 e7e5', 'b2b4 e7e5 c1b2'
  ];
  var START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
  function posKey(st) { return st.b.map(function (p) { return p ? p.t + p.c : '.'; }).join('') + st.turn; }
  function uciOf(V, m) { return V.geo.name(m.f) + V.geo.name(m.t); }
  /* the set of book positions for this variant (built once per V; empty unless it is standard chess from the start) */
  function bookSet(V, st0) {
    if (V._mqBook) return V._mqBook;
    var set = {}, bad = [];
    try {
      if (V.geo.files === 8 && V.geo.ranks === 8 && V.toFEN && String(V.toFEN(st0)).split(' ')[0] === START) {
        BOOK.forEach(function (line) {
          var s = st0;
          line.split(' ').some(function (u) {
            var m = V.legal(s).filter(function (x) { return uciOf(V, x) === u && (!x.promo || x.promo === 'Q'); })[0];
            if (!m) { bad.push(line + ' @' + u); return true; }
            s = m.n || V.make(s, m); set[posKey(s)] = 1; return false;
          });
        });
      }
    } catch (e) { bad.push(String(e)); }
    V._mqBook = set; V._mqBookBad = bad;
    return set;
  }
  function isBook(V, st, m, st0) { if (st.ply > 24 || !st0) return false; var B = bookSet(V, st0); return !!B[posKey(m.n || V.make(st, m))]; }
  /* expected points (0..1) for the side whose score s is ({ cp } or { mate }, that side's view): lichess win curve, mates 0 / 1 */
  function ep(s) {
    if (!s) return 0.5;
    if (s.mate != null) return s.mate > 0 ? 1 : s.mate < 0 ? 0 : (s.cp != null && s.cp > 0 ? 1 : 0);
    var cp = Math.max(-1500, Math.min(1500, s.cp || 0));
    return 1 / (1 + Math.exp(-0.00368208 * cp));
  }
  function winPct(cp) { var M = CM.MATE || 100000; return 100 * ep(cp >= M / 2 ? { mate: 1 } : cp <= -M / 2 ? { mate: -1 } : { cp: cp }); }
  /* piece sacrifice: after move m a piece of the mover worth >= a minor (not the king, not a pawn) can be taken at a profit
     (no defender, or a cheaper attacker) and it was not already hanging before the move; what the move captured is netted */
  function enPrise(V, st, sq, owner) {
    var p = st.b[sq]; if (!p) return false;
    var opp = owner === 'w' ? 'b' : 'w', look = V.clone(st), cheapest = Infinity;
    look.turn = opp;
    for (var j = 0; j < look.b.length; j++) {
      var a = look.b[j]; if (!a || a.c !== opp) continue;
      var ms = []; V.genPiece(look, j, ms, true);
      if (ms.some(function (x) { return x.t === sq && x.cap; })) cheapest = Math.min(cheapest, (V.def(a.t) || {}).value || 0);
    }
    if (cheapest === Infinity) return false;
    var val = (V.def(p.t) || {}).value || 0;
    if (cheapest < val - 50) return true;
    var probe = V.clone(st); probe.b = probe.b.slice(); probe.b[sq] = Object.assign({}, p, { c: opp });
    return !V.attacked(probe, sq, owner);   /* undefended */
  }
  function isSacrifice(V, st, m) {
    var me = st.turn, n = m.n || V.make(st, m), cv = m.cap ? (V.def(m.cap.t) || {}).value || 0 : 0;
    if (m.promo) return false;
    for (var i = 0; i < n.b.length; i++) {
      var p = n.b[i]; if (!p || p.c !== me) continue;
      var d = V.def(p.t) || {}; if (d.royal || d.pawn || (d.value || 0) < 300) continue;
      if ((d.value || 0) - cv < 200) continue;
      if (!enPrise(V, n, i, me)) continue;
      if (i !== m.t && st.b[i] && st.b[i].c === me && enPrise(V, st, i, me)) continue;   /* it was already hanging */
      return true;
    }
    return false;
  }
  /* Chess.com Classification V2 (support.chess.com/en/articles/8572705), expected-points model. g = {
       best, second (null with one legal move), played: scores from the mover's view at the same depth;
       playedIsBest, book, sac (isSacrifice), recapture (takes back on the square the opponent just captured on),
       oppLoss: expected points the opponent's previous move lost (null if unknown) }
     -> { k: class, loss } */
  function grade(g) {
    if (g.book) return { k: 'book', loss: 0 };
    var eb = ep(g.best), epl = g.playedIsBest ? eb : ep(g.played), loss = g.playedIsBest ? 0 : Math.max(0, eb - epl);
    var es = g.second ? ep(g.second) : null, k;
    if (g.playedIsBest || loss < 0.005) k = 'best';   /* chess.com shows expected points to 2 decimals: a 0.00 loss is Best */
    else if (loss <= 0.02) k = 'excellent';
    else if (loss <= 0.05) k = 'good';
    else if (loss <= 0.10) k = 'inaccuracy';
    else if (loss <= 0.20) k = 'mistake';
    else k = 'blunder';
    /* Brilliant: best or near-best, a sound piece sacrifice, not bad afterwards, and not already completely winning */
    if ((k === 'best' || k === 'excellent') && g.sac && epl >= 0.5 && eb < 0.97) return { k: 'brilliant', loss: loss };
    /* Great: the critical move - the only good one (every other move drops >= 0.10, i.e. a Mistake), so it holds a
       lost-looking position or wins an equal one; plain recaptures are not Great */
    if (k === 'best' && es != null && eb - es >= 0.10 && !g.recapture) return { k: 'great', loss: loss };
    /* Miss: the opponent just erred (>= 0.10), a winning continuation existed, and this move leaves it equal or worse */
    if ((k === 'inaccuracy' || k === 'mistake' || k === 'blunder') && g.oppLoss != null && g.oppLoss >= 0.10 && eb >= 0.70 && epl <= 0.60) return { k: 'miss', loss: loss };
    return { k: k, loss: loss };
  }
  CM.mirrorReview = { LEVEL: QLEVEL, grade: grade, ep: ep, winPct: winPct, isSacrifice: isSacrifice, isBook: isBook, bookSet: bookSet, BOOK: BOOK, TINT: QTINT, LABEL: QLABEL };
  /* ---- evaluators ----
     Grading (our add-on, iwantcheckmate.com has none): Stockfish 18 lite NNUE (js/bot/stockfish.js; Fairy-Stockfish if it
     cannot load), full strength, MultiPV 2 at a
     fixed depth on the position before the move (best + second best), and the played move searched on its own at the same
     depth (searchmoves) unless it is one of those two lines. Without the engine: the built-in search ranking, same rules. */
  var GRADE_DEPTH = 16;   /* tools/mirror_validate: depth 16 matched the native reference best (README there) */
  var ENTRY = { variant: 'chess' };
  function score(l) { return l ? (l.mate != null ? { mate: l.mate } : { cp: l.cp }) : null; }
  function fenOf(V, st) { return CM.fairy && CM.fairy.toFEN ? CM.fairy.toFEN(V, st, ENTRY) : null; }
  var SF_VERSION = '18';   /* iwantcheckmate.com runs stockfish-18-lite-single */
  function sfOk() { return !!(CM.stockfish && CM.stockfish.analyse && CM.stockfish.state(SF_VERSION) !== 'failed'); }
  function fairyOk() { return !!(CM.fairy && CM.fairy.analyse && CM.fairy.state() !== 'failed'); }
  function engineOk() { return typeof Worker !== 'undefined' && (sfOk() || fairyOk()); }
  /* Stockfish 18 lite (NNUE, js/bot/stockfish.js), else Fairy-Stockfish (classical, vendored), else null */
  function analyseAny(o) {
    var fair = function () {
      if (!fairyOk()) return null;
      return CM.fairy.analyse(Object.assign({ variant: 'chess' }, o)).then(function (r) { if (r) CM.mirrorReview.engine = 'Fairy-Stockfish'; return r; });
    };
    if (!sfOk()) return Promise.resolve(fair());
    return CM.stockfish.analyse(o.fen, Object.assign({ version: SF_VERSION }, o)).then(function (r) {
      if (r && r.lines.length) { CM.mirrorReview.engine = 'Stockfish ' + SF_VERSION; return r; }
      return fair();
    });
  }
  /* the grading search on a FEN for the played move u (UCI) -> Promise<{ best, second, played, playedIsBest, bestUci } | null>;
     tools/mirror_validate runs this same function against native Stockfish */
  function evalFen(fen, u, o) {
    o = o || {}; var depth = o.depth || GRADE_DEPTH, mt = o.movetime || null;
    var go = function (x) { return Object.assign({ fen: fen }, mt ? { movetime: mt } : { depth: depth }, x); };
    return analyseAny(go({ multipv: 2 })).then(function (r) {
      if (!r || !r.lines.length) return null;
      var L = r.lines, hit = L.filter(function (l) { return l.uci === u; })[0];
      var out = { best: score(L[0]), second: score(L[1]), bestUci: L[0].uci, playedIsBest: L[0].uci === u };
      if (hit) { out.played = score(hit); return out; }
      return analyseAny(go({ multipv: 1, searchmoves: [u] })).then(function (r2) {
        if (!r2 || !r2.lines.length) return null;
        out.played = score(r2.lines[0]); return out;
      });
    });
  }
  function evalMove(V, st, m) {
    var u = uciOf(V, m) + (m.promo ? m.promo.toLowerCase() : ''), fen = fenOf(V, st);
    if (!engineOk() || !fen) return Promise.resolve(null);
    return evalFen(fen, u);
  }
  function evalMoveBuiltin(V, st, m) {
    var L = new CM.Search(V, {}).rank(st, { maxDepth: 4, timeMs: 900, noise: 0 }); if (!L.length) return null;
    var mine = L.filter(function (x) { return sameMove(x.m, m); })[0] || L[L.length - 1], sc = function (v) { var M = CM.MATE || 100000; return v >= M / 2 ? { mate: 1 } : v <= -M / 2 ? { mate: -1 } : { cp: v }; };
    return { best: sc(L[0].v), second: L[1] ? sc(L[1].v) : null, played: sc(mine.v), playedIsBest: mine === L[0] || Math.abs(mine.v - L[0].v) < 1 };
  }
  /* full review of move m played in st (prev = the move before it, for recapture; oppLoss for Miss) -> Promise<{k, loss}> */
  function review(V, st, m, st0, prevMove, oppLoss) {
    var book = isBook(V, st, m, st0);
    if (book) return Promise.resolve({ k: 'book', loss: 0 });
    return evalMove(V, st, m).then(function (e) { return e || evalMoveBuiltin(V, st, m); }).then(function (e) {
      if (!e) return null;
      return grade({ best: e.best, second: e.second, played: e.played, playedIsBest: e.playedIsBest, book: false, sac: isSacrifice(V, st, m),
        recapture: !!(m.cap && prevMove && prevMove.cap && prevMove.t === m.t), oppLoss: oppLoss });
    });
  }
  CM.mirrorReview.review = review; CM.mirrorReview.evalMove = evalMove; CM.mirrorReview.evalFen = evalFen; CM.mirrorReview.DEPTH = function (d) { if (d) GRADE_DEPTH = d; return GRADE_DEPTH; };
  /* ---- the mirror mechanic, exactly as iwantcheckmate.com (assets/main-*.js, jt() and the mirrorfish branch):
     after your move, Stockfish MultiPV 5 at movetime 700 on the position before it; your move's index n gives
     M = n in 0..3 ? n + 1 : 5 (not in the top 5, or 5th -> 5). The fish plays rankedMoves(fen, M, 700)[M - 1], else the
     last line, else bestMove(350 ms). Without the engine the built-in search ranking stands in. */
  function rankedMoves(V, st, n, ms) {
    var fen = fenOf(V, st);
    if (!engineOk() || !fen) return Promise.resolve(null);
    return analyseAny({ fen: fen, multipv: n, movetime: ms }).then(function (r) { return r && r.lines.length ? r.lines.map(function (l) { return l.uci; }) : null; });
  }
  function mirrorRankOf(V, st, m) {
    var u = uciOf(V, m) + (m.promo ? m.promo.toLowerCase() : '');
    return rankedMoves(V, st, 5, 700).then(function (L) {
      var n;
      if (L) n = L.slice(0, 5).indexOf(u);
      else { var R = new CM.Search(V, {}).rank(st, { maxDepth: 3, timeMs: 700, noise: 0 }); n = -1; for (var i = 0; i < Math.min(5, R.length); i++) if (sameMove(R[i].m, m)) { n = i; break; } }
      return n >= 0 && n < 4 ? n + 1 : 5;
    });
  }
  function mirrorPlan(V, st, M) {
    return rankedMoves(V, st, M, 700).then(function (L) {
      if (L && L.length) return L[M - 1] || L[L.length - 1];
      if (engineOk()) return analyseAny({ fen: fenOf(V, st), multipv: 1, movetime: 350 }).then(function (r) { return r && r.best; });
      var R = new CM.Search(V, {}).rank(st, { maxDepth: 3, timeMs: 700, noise: 0 });
      return R.length ? uciOf(V, R[Math.min(M, R.length) - 1].m) + (R[Math.min(M, R.length) - 1].m.promo || '').toLowerCase() : null;
    });
  }
  CM.mirrorReview.rankOf = mirrorRankOf; CM.mirrorReview.plan = mirrorPlan;
  function startState(ctx) { var h = ctx.game.history; return h.length ? h[0].state : ctx.state; }
  /* setX does not schedule a render: async badge changes redraw the board themselves (no slide: pieces did not move) */
  function redraw(ctx) { var G = ctx.game; if (G && CM.gameUI && CM.gameUI.controller === G && !G.busy) G.render(); else if (G) G._dirty = true; }
  function showBadges() { return !CM.settings || CM.settings.get('mqBadges') !== false; }
  /* review move m (played in st, after the move prevMove) and show its badge if it is still the last move; the loss is
     kept per ply for the next move's Miss check */
  function gradeInto(ctx, st, m, prevMove, plyAfter, t0) {
    var G = ctx.game, losses = G._mqLoss || (G._mqLoss = {});
    var oppLoss = losses[st.ply] != null ? losses[st.ply] : null;
    return review(ctx.V, st, m, startState(ctx), prevMove, oppLoss).then(function (r) {
      if (!r) return;
      losses[plyAfter] = r.loss; G._mqGrades = (G._mqGrades || []).concat([{ ply: plyAfter, k: r.k, loss: r.loss }]);
      if (ctx.state.ply === plyAfter && showBadges()) { setBadge(ctx, m.t, r.k, t0, m.f); redraw(ctx); }
    }, function (e) { console.warn('MirrorFish review', e); });
  }
  /* the badge waits for the slide to land: it pops in at `at` (performance.now() ms) */
  function setBadge(ctx, sq, kind, t0, f) {
    var ms = (CM.settings && CM.settings.animMs && CM.settings.animMs()) || 0;
    ctx.setX('qbadge', kind ? { sq: sq, f: f == null ? -1 : f, k: kind, at: Math.max(performance.now(), t0 + ms + (ms ? 60 : 0)) } : null);   /* +60 ms: the board starts the slide on the render after this hook */
  }
  /* the badge in the board-level overlay (js/ui/game-ui.js setBoardOverlay): its centre on the destination square's
     top-right corner point, half overhanging the square, above pieces, highlights and the board edge */
  function badgeOverlay(ctx, o) {
    var b = ctx.x && ctx.x.qbadge; if (!b || b.sq < 0 || b.gone) return null;
    var g = ctx.geo, flip = o.flip, dr = flip ? g.ranks - 1 - g.row(b.sq) : g.row(b.sq), dc = flip ? g.files - 1 - g.col(b.sq) : g.col(b.sq);
    var delay = Math.round(b.at - performance.now());
    var html = '<img class="mq-badge" src="assets/ui/move-quality/' + b.k + '.svg" alt="' + QLABEL[b.k] + '" title="' + QLABEL[b.k] + '" draggable="false" data-sq="' + b.sq +
      '" style="left:' + ((dc + 1) / g.files * 100) + '%;top:' + (dr / g.ranks * 100) + '%;--mq-files:' + g.files + ';--mq-d:' + delay + 'ms">';
    return { key: [b.sq, b.k, b.at, flip ? 1 : 0].join('|'), html: html };
  }
  function nonKing(st, c, V) { var k = 0; st.b.forEach(function (p) { if (p && p.c === c && !V.def(p.t).royal) k++; }); return k; }

  function setElo(ctx, e, popup) {
    var old = ctx.opponent.elo != null ? ctx.opponent.elo : ctx.opponent.rating;
    e = clampElo(ctx, e);
    var hide = P(ctx).hideRating;
    ctx.setOpponent({ elo: e, rating: hide ? null : e });
    if (popup !== false && old != null && e !== old && !hide) {
      var d = e - old;
      /* fin-sprites-a vfx: game-like score popup (js/fx/game-fx.js) instead of plain text */
      ctx.fx({ type: 'popup', at: 'board', text: (d > 0 ? '+' : '') + d, color: d > 0 ? '#8fd14f' : '#ff6b5b', size: '30px', duration_ms: 1300 });
    }
  }
  function brainFor(ctx, k) {
    var B = P(ctx).brains; if (!B) return null;
    if (B.schedule) return B.schedule[k % B.schedule.length];
    return Math.random() < (B.p == null ? 0.5 : B.p) ? 'S' : 'M';
  }
  function applyBrain(ctx, b) {
    var B = P(ctx).brains || {};
    ctx.setX('brain', b);
    ctx.setOpponent({ elo: b === 'M' ? (B.martin || 250) : (B.stockfish || 3600) });
  }

  /* move policies over the search ranking L ([{m, v}] best first, v from the bot's view) */
  function geometric(L) {
    var w = [0.5, 0.25, 0.12, 0.06, 0.04, 0.03], n = Math.min(L.length, w.length), r = Math.random(), acc = 0;
    for (var i = 0; i < n; i++) { acc += w[i]; if (r < acc || i === n - 1) return L[i]; }
    return L[0];
  }
  var PICK = {
    second: function (ctx, L) { return L[Math.min(1, L.length - 1)]; },
    top3: function (ctx, L) { return L[Math.floor(Math.random() * Math.min(3, L.length))]; },
    geometric: function (ctx, L) { return geometric(L); },
    drawish: function (ctx, L) { var b = L[0]; L.forEach(function (x) { if (Math.abs(x.v) < Math.abs(b.v) - 0.5) b = x; }); return b; },
    worst: function (ctx, L) { return L[L.length - 1]; },
    blunder5: function (ctx, L) { if (L.length > 1 && Math.random() < 0.05) { ctx.setX('blundered', 1); return L[1 + Math.floor(Math.random() * (L.length - 1))]; } return L[0]; },
    mirror: function (ctx, L) {   /* the move mirrorPlan chose after your move (site rule); else the M-th of this ranking */
      var pl = ctx.game._mqPlan, V = ctx.V; ctx.game._mqPlan = null; ctx.game._mqLastPlan = pl;
      if (pl && pl.ply === ctx.state.ply && pl.uci) {
        var hit = L.filter(function (x) { return uciOf(V, x.m) + (x.m.promo ? x.m.promo.toLowerCase() : '') === pl.uci; })[0];
        if (!hit) { var mv = CM.fairy && CM.fairy.fromUCI ? CM.fairy.fromUCI(V, L.map(function (x) { return x.m; }), pl.uci, ENTRY) : null; hit = mv && L.filter(function (x) { return x.m === mv; })[0]; }
        if (hit) return hit;
      }
      return L[Math.min(ctx.x.mirrorK || 0, L.length - 1)];
    },
    rooksac: function (ctx, L) {
      var V = ctx.V, me = ctx.bot, h = ctx.human;
      var sac = L.filter(function (x) { return x.m.p === 'R' && !x.m.promo && V.attacked(x.m.n || V.make(ctx.state, x.m), x.m.t, h); });
      if (sac.length) { ctx.setX('forced', { f: sac[0].m.f, t: sac[0].m.t }); return sac[0]; }
      return L[0];
    },
    mustcheck: function (ctx, L) {
      var V = ctx.V, h = ctx.human;
      var chk = L.filter(function (x) { return V.inCheck(x.m.n || V.make(ctx.state, x.m), h); });
      if (chk.length) { ctx.setX('forced', { f: chk[0].m.f, t: chk[0].m.t }); return chk[0]; }
      return L[0];
    },
    zebra: function (ctx, L) {
      var g = ctx.geo, last = ctx.x.zlast;
      if (last == null) last = (g.row(0) + g.col(0)) % 2 === 0 ? 1 : 0;   /* first move: a light square (iwantcheckmate.com ZebraFish) */
      var want = 1 - last, ok = L.filter(function (x) { return ((g.row(x.m.t) + g.col(x.m.t)) % 2) === want; });
      return ok.length ? ok[0] : L[0];
    },
    simp: function (ctx, L) {
      var V = ctx.V, h = ctx.human;
      var q = L.filter(function (x) { return x.m.cap && x.m.cap.t === 'Q' && x.m.cap.c === h; });
      if (q.length) { ctx.setX('forced', { f: q[0].m.f, t: q[0].m.t }); return q[0]; }  /* pass 2: pink arrow on the queen hunt */
      if (hasType(ctx.state, h, 'Q')) {
        var nm = L.filter(function (x) { return !isMateNow(V, x.m.n || V.make(ctx.state, x.m)); });
        if (!nm.length) return L[0];
        /* as on iwantcheckmate.com SimpFish: among sound moves (within 80 cp of its best) it plays the one that puts the
           most pieces on your queen; ties go to the engine's order */
        var top = nm[0].v, ok = nm.filter(function (x) { return top - x.v <= 80; });
        var best = null, bp = -1;
        ok.forEach(function (x) { var pr = queenPressure(V, x.m.n || V.make(ctx.state, x.m), h); if (pr > bp) { bp = pr; best = x; } });
        if (best && bp > 0 && best !== nm[0]) ctx.setX('forced', { f: best.m.f, t: best.m.t });
        return best || nm[0];
      }
      return L[0];
    },
    torture: function (ctx, L) {
      var V = ctx.V, h = ctx.human;
      if (nonKing(ctx.state, h, V) > 0) {
        var nm = L.filter(function (x) { return !isMateNow(V, x.m.n || V.make(ctx.state, x.m)); });
        /* recheck2 (transcript 4:35): it is not allowed to deliver mate while you have pieces, so it plays the next
           best move that is not mate; it is "not actually programmed to actively capture pieces" (old capture bias removed) */
        if (nm.length) return nm[0];
      }
      return L[0];
    }
  };
  /* Zach (1 Elo, "Martin's nephew"): random moves that avoid captures and avoid giving mate */
  function zachMove(V, st) {
    var ms = V.legal(st); if (!ms.length) return null;
    var calm = ms.filter(function (m) { return !m.cap && !isMateNow(V, m.n || V.make(st, m)); });
    var pool = calm.length ? calm : ms.filter(function (m) { return !isMateNow(V, m.n || V.make(st, m)); });
    if (!pool.length) pool = ms;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  var H = {
    stockfishOk: true,
    setup: function (ctx) {
      var p = P(ctx), r = run(ctx), E = p.elo;
      if (p.side) { var side = p.side[r.game % p.side.length]; ctx.game.human = side; ctx.game.botColor = side === 'w' ? 'b' : 'w'; }
      if (E) {
        var start = E.starts ? E.starts[r.game % E.starts.length] : (E.start != null ? E.start : (ctx.spec.opponent.rating || 1500));
        setElo(ctx, start, false);
        if (p.toggleAvatars) ctx.setOpponent({ avatar: p.toggleAvatars[0] });
      }
      ctx.setX('botMoves', 0); ctx.setX('t0', 0);
      if (p.pick === 'mirror') { ctx.game.boardGutter = 14; if (CM.gameUI && CM.gameUI.layout && CM.gameUI.controller === ctx.game) CM.gameUI.layout(); }   /* room for the half of a right-file badge that overhangs the board */
      if (E && E.turnRamp) { setElo(ctx, 0, false); ctx.game._rampT0 = 0; }
      if (p.brains) applyBrain(ctx, brainFor(ctx, 0));
    },
    onStart: function (ctx) {
      var p = P(ctx), r = run(ctx);
      if (p.elo && p.elo.starts && p.elo.starts.length > 1) ctx.toast('Game ' + (r.game % p.elo.starts.length + 1) + ': ' + ctx.opponent.name + ' starts at ' + ctx.opponent.elo + ' Elo', 2400);
      if (p.spectate) ctx.toast('Spectator game: ' + (p.spectate.title || 'sit back and watch'), 2600);
      if (p.intro) ctx.after(400, function () { ctx.toast(p.intro, 2800); });
    },
    beforeMove: function (ctx) { if (P(ctx).spectate) { ctx.toast('This one is bot vs bot. Just watch.', 1600); return false; } return true; },
    onTurn: function (ctx, c) {
      var p = P(ctx);
      if (p.elo && p.elo.turnRamp && !ctx.over && c === ctx.human) { ctx.game._rampT0 = performance.now(); if (ctx.opponent.elo !== 0) ctx.setOpponent({ elo: 0, rating: 0 }); }
      if (!p.spectate || ctx.over) return;
      var st = ctx.state, ply = st.ply;
      ctx.after(p.spectate.delay || 700, function () {
        if (ctx.over || ctx.state !== st || ctx.state.ply !== ply) return;
        var m = zachMove(ctx.V, st); if (m) ctx.game.commit(m, {});
      });
    },
    onTick: function (ctx, now) {
      var p = P(ctx), E = p.elo;
      /* MirrorFish: the badge is removed once it has faded (pop at `at`, 1 s up, 300 ms fade); its square tint stays */
      var qb = p.pick === 'mirror' && ctx.x && ctx.x.qbadge;
      if (qb && !qb.gone && now > qb.at + 280 + 1000 + 320) { ctx.setX('qbadge', Object.assign({}, qb, { gone: true })); redraw(ctx); }
      if (!E || ctx.over) return;
      if (E.turnRamp) {
        var R = E.turnRamp, r0 = ctx.game._rampT0; if (!r0 || ctx.state.turn !== ctx.human || ctx.game.busy) return;
        var st = R.step || 100, to = R.to || 3600, e2 = Math.min(to, Math.floor((now - r0) / (R.ms || 5000) * (to / st)) * st);
        if (e2 !== ctx.opponent.elo) ctx.setOpponent({ elo: e2, rating: e2 });
        return;
      }
      if (!E.perMinute) return;
      var t0 = ctx.x.t0; if (!t0) { if (ctx.state.ply > 0) ctx.setX('t0', now); return; }
      var r = run(ctx), start = E.starts ? E.starts[r.game % E.starts.length] : E.start;
      var e = clampElo(ctx, start + (now - t0) / 60000 * E.perMinute);
      var shown = ctx.opponent.elo;
      if (Math.abs(e - shown) >= 10) ctx.setOpponent({ elo: e, rating: e });
    },
    afterMove: function (ctx, m, info) {
      var p = P(ctx), E = p.elo || {}, V = ctx.V, self = this;
      if (ctx.over) return;
      if (p.spectate) {
        if (p.spectate.forfeitPly && ctx.state.ply >= p.spectate.forfeitPly) ctx.after(300, function () { ctx.endGame(ctx.human, (p.spectate.forfeitWhy || 'WorstFish left the game')); });
        return;
      }
      if (info.by === 'bot') {
        var k = (ctx.x.botMoves || 0) + 1; ctx.setX('botMoves', k);
        var cur = ctx.opponent.elo;
        if (E.botMove) setElo(ctx, cur + E.botMove);
        if (E.botCapCheck && (info.capture || V.inCheck(ctx.state, ctx.human))) setElo(ctx, ctx.opponent.elo + E.botCapCheck);
        if (E.toggle && info.capture) {
          var nx = ctx.opponent.elo === E.toggle[0] ? E.toggle[1] : E.toggle[0];
          setElo(ctx, nx); var who = nx <= 1000 ? (p.toggleNames || ['Stockfish', 'Martin'])[1] : (p.toggleNames || ['Stockfish', 'Martin'])[0];
          ctx.setOpponent(Object.assign({ tagline: 'Now playing like ' + who + ' (' + nx + ').' }, p.toggleAvatars ? { avatar: p.toggleAvatars[nx === E.toggle[0] ? 0 : 1] } : {}));  /* pass 2: avatar swap */
          ctx.toast(ctx.opponent.name + ' switches to ' + who + ' mode', 1800);
        }
        if (p.pick === 'zebra') ctx.setX('zlast', (ctx.geo.row(m.t) + ctx.geo.col(m.t)) % 2);
        if (p.pick === 'mirror') {   /* grade the fish's reply with the same evaluator (does not hold up your next move) */
          var hb = ctx.game.history, prevB = prevState(ctx), plyB = ctx.state.ply, pmB = hb.length ? hb[hb.length - 1].last : null;
          setBadge(ctx, -1, null, performance.now());
          if (prevB && showBadges()) gradeInto(ctx, prevB, m, pmB, plyB, performance.now());
        }
        var forced = ctx.x.forced;
        if (forced && forced.f === m.f && forced.t === m.t) {
          ctx.fx({ type: 'arrow', from: m.f, to: m.t, color: 'rgba(214, 64, 168, 0.85)', duration_ms: 1400 });
          if (p.forcedHighlight) ctx.fx({ type: 'highlight', at: m.t, color: p.forcedHighlight, duration_ms: 1400 });  /* pass 2 */
        }
        if (p.bubble && (k === 1 || Math.random() < (p.bubble.chance == null ? 0.2 : p.bubble.chance)))  /* pass 2: speech bubble */
          ctx.fx({ type: 'text', text: p.bubble.text, color: p.bubble.color || '#fff', size: '18px', at: m.t, duration_ms: 1600 });
        ctx.setX('forced', null);
        if (ctx.x.blundered) { ctx.setX('blundered', 0); if (p.announceBlunder) ctx.toast(ctx.opponent.name + ' blundered!', 1600); }
        return;
      }
      /* the player moved */
      if (E.playerCheck && V.inCheck(ctx.state, ctx.bot)) setElo(ctx, ctx.opponent.elo + E.playerCheck);
      if (p.brains) applyBrain(ctx, brainFor(ctx, ctx.x.botMoves || 0));
      if (p.pick === 'mirror') {   /* site rule: rank of your move in Stockfish's top 5 (700 ms) -> the fish's plan; then your badge */
        var tM = performance.now(), prevM = prevState(ctx), hm = ctx.game.history, plyM = ctx.state.ply, pmM = hm.length ? hm[hm.length - 1].last : null;
        setBadge(ctx, -1, null, tM);   /* the previous badge clears as soon as you move */
        if (!prevM) return;
        return mirrorRankOf(V, prevM, m).then(function (M) {
          ctx.setX('mirrorK', M - 1);
          if (!CM.settings || CM.settings.get('mqRank') !== false)
            ctx.toast(M === 1 ? 'You played the best move. MirrorFish will too.' : M < 5 ? 'Your move ranked #' + M + '. MirrorFish will play its #' + M + '.' : 'Your move was not in the top 4. MirrorFish will play its #5.', 1700);
          return mirrorPlan(V, ctx.state, M).then(function (u) { ctx.game._mqPlan = { ply: plyM, uci: u }; });
        }).then(function () { if (showBadges()) return gradeInto(ctx, prevM, m, pmM, plyM, tM); })
          .catch(function (e) { console.warn('MirrorFish', e); });
      }
      var needRank = E.playerBest || E.playerNotBest || E.playerWorst;
      if (!needRank) return;
      var prev = prevState(ctx); if (!prev) return;
      return new Promise(function (res) {
        setTimeout(function () {
          try {
            var ms = V.legal(prev), L = rankFor(V, prev, ms), idx = -1;
            for (var i = 0; i < L.length; i++) if (sameMove(L[i].m, m)) { idx = i; break; }
            /* moves tied with the best (same score) count as best */
            var best = idx === 0 || (idx > 0 && Math.abs(L[idx].v - L[0].v) < 1);
            var worst = idx === L.length - 1 || (idx >= 0 && Math.abs(L[idx].v - L[L.length - 1].v) < 1);
            if (E.playerBest && best) { setElo(ctx, ctx.opponent.elo + E.playerBest); ctx.toast('Best move! ' + ctx.opponent.name + ' loses ' + (-E.playerBest) + ' Elo', 1500); }
            if (E.playerNotBest && !best) setElo(ctx, ctx.opponent.elo + E.playerNotBest);
            if (E.playerWorst && worst && L.length > 1) { setElo(ctx, ctx.opponent.elo + E.playerWorst); ctx.toast('The worst move on the board. ' + ctx.opponent.name + ' feels sorry for you.', 1700); }
          } catch (e) { console.warn('g2_fish quality check', e); }
          res();
        }, 30);
      });
    },
    botPick: null,
    /* pass 2: the video's magenta last-move squares (params.lastMoveTint) */
    /* MirrorFish: the review badge sits in the piece's attached layer (decorate takes p, so it rides with the slide and
       follows board flip); a tinted square with a badge keeps both on the square instead */
    /* MirrorFish: the last move's from/to squares take the badge's review colour (chess.com) instead of the yellow
       last-move highlight (.sq.mq-q-<kind> in css/board.css, only on .is-last squares); no highlight while your move
       is still being judged. The badge itself is in boardOverlay. */
    decorate: function (ctx, sq) {
      var pp = P(ctx), t = pp.lastMoveTint, l = ctx.last;
      if (pp.pick === 'mirror') {
        if (!showBadges() || !l || (l.f !== sq && l.t !== sq)) return null;
        var b = ctx.x && ctx.x.qbadge;
        return { cls: b && b.sq === l.t ? 'mq-q mq-q-' + b.k : 'mq-q mq-q-wait' };
      }
      if (!t || !l || (l.f !== sq && l.t !== sq)) return null;
      return { html: '<span class="sq-tint" style="background:' + t + '"></span>', follow: false };
    },
    boardOverlay: function (ctx, o) { return P(ctx).pick === 'mirror' && showBadges() ? badgeOverlay(ctx, o) : null; },
    status: function (ctx) {
      var p = P(ctx), bits = [];
      if (p.brains && p.brains.show && !ctx.over && ctx.x.brain) bits.push('Next bot move: ' + (ctx.x.brain === 'M' ? 'Martin (250)' : 'Stockfish (3600)'));
      if (p.elo && !p.hideRating && ctx.opponent.elo != null) bits.push(ctx.opponent.name + ' is playing at ' + ctx.opponent.elo + ' Elo');
      if (p.pick === 'torture') bits.push('Your pieces left: ' + nonKing(ctx.state, ctx.human, ctx.V) + '/15');
      if (p.pick === 'zebra' && ctx.x.zlast != null) bits.push('ZebraFish must move to a ' + (ctx.x.zlast === 0 ? 'dark' : 'light') + ' square next');
      if (p.selfmate && !ctx.over) bits.push('Goal: get checkmated');
      if (p.spectate && !ctx.over) bits.push('Move ' + (Math.floor(ctx.state.ply / 2) + 1) + ': ' + (ctx.state.turn === 'w' ? 'WorstFish' : 'Zach') + ' to move');
      return bits.join(' · ');
    },
    onGameOver: function (ctx, over) { run(ctx).game++; },
    checkWin: function (V, st, moves) {
      var p = V.cfg.params || {};
      if (!p.selfmate || moves.length) return null;
      if (V.inCheck(st, st.turn)) return { w: st.turn, why: st.turn === p.selfmate ? 'you got yourself checkmated' : 'you checkmated the bot, which is the opposite of the goal' };
      return null;
    }
  };
  /* botPick only when a move rule is set (otherwise the bot plays Stockfish / the search at its current rating) */
  CM.defineHooks('g2_fish', Object.assign({}, H, {
    botPick: function (ctx, L) {
      var p = P(ctx); if (!L.length) return null;
      var pick = p.spectate ? (p.spectate.white || 'worst') : p.pick;
      if (!pick || !PICK[pick]) return null;
      return PICK[pick](ctx, L);
    }
  }));
  /* same hooks without botPick, so Stockfish plays (rating-changing bots and Martinfish) */
  var noPick = Object.assign({}, H); delete noPick.botPick;
  CM.defineHooks('g2_elofish', noPick);
  /* g2_elofish.js is a byte-identical copy of this file (the loader maps a hooks name to a file name) */
})();
