/* g2_drawback: shared hooks for the "Drawback Chess" videos (group 2). Each side is dealt one drawback (a handicap
   rule); the game uses king-capture rules (no check, no checkmate: kings may stand or move into attack and
   capturing the king wins). Breaking a "you lose if ..." drawback, or having no move your drawback allows, loses.
   Your own drawback is shown on a card (or hidden / flashed, depending on the video); the opponent's is revealed
   when the game ends ("Your opponent's drawback was ...").

   params:
     games: [{ you: 'lame_duck', opp: 'true_gentleman', side: 'w'|'b', opp_name: 'angry indigo bear' }, ...]
            one entry per game of the video; New game moves to the next one (cycles unless `pool` is set; a missing
            you/opp key is dealt at random from the pool, e.g. drawbacks whose text the video never shows).
     pool:  ['key', ...]  drawbacks dealt at random once `games` is empty (default: every catalogue entry)
     view:  'see' (default: you see your drawback) | 'hidden' (you never see it, deduce it from the blocked moves)
            | 'flash' (shown for ~2 s at the start, then hidden)
     goal:  5     wins the video aims for (shown in the status line)
     hard:  true  label only ("Hard drawbacks")
   Everything inside the rule hooks is pure (it also runs in the bot's search). Random drawbacks (Unlucky, Winds of
   Fate, Colorblind) draw from a per-game seed and the ply number, so they are re-rolled every move but stay
   deterministic for the search. Two drawbacks need the engine's own move ranking and are handled at game level:
   "Stockfish" (you may not play the engine's top move) and "Devil on Your Shoulder" (after 7 ignored suggestions
   you must play the devil's move). Sources: research/modes/<id>.json of every Drawback Chess video. */
(function () {
  'use strict';
  var CM = window.CM;
  var RUN = {};
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  function val(t) { return VAL[t] != null ? VAL[t] : 3; }
  var LADDER = { P: 0, N: 1, B: 1, R: 2, Q: 3, K: 4 };
  function opp(c) { return c === 'w' ? 'b' : 'w'; }
  function hrand(seed, a, b) {
    var h = (seed | 0) ^ Math.imul(a + 0x9e37, 0x85ebca6b) ^ Math.imul((b || 0) + 0x27d4, 0xc2b2ae35);
    h = Math.imul(h ^ (h >>> 16), 0x7feb352d); h = Math.imul(h ^ (h >>> 15), 0x846ca68b); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  /* a square named from White's view, seen from colour c (Black gets the 180-degree rotation) */
  function sqFor(g, c, name) { var i = g.parse(name); if (c === 'w' || i < 0) return i; return g.size - 1 - i; }
  function rec0() { return { n: 0, last: null, fwdRun: 0, sinceCap: 0, lastCapN: -9, kingN: -9, visited: [], capOn: [], capT: '', capWith: '', lostMax: 0, lostN: 0, r7: 0, taint: [], lastLR: 0 }; }
  function recOf(st, c) { return (st.x && st.x.L && st.x.L[c]) || rec0(); }
  function count(st, c, f) { var n = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === c && (!f || f(p, i))) n++; } return n; }
  function find(st, c, t) { for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === c && p.t === t) return i; } return -1; }
  function rim(g, i) { var c = g.col(i), r = g.row(i); return c === 0 || r === 0 || c === g.files - 1 || r === g.ranks - 1; }
  function center(g, i) { var c = g.col(i), r = g.row(i); return (c === 3 || c === 4) && (r === 3 || r === 4); }
  function adjOwn(st, g, sq, c, skip, f) {
    for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
      if (!dc && !dr) continue; var j = g.step(sq, dc, dr); if (j < 0 || j === skip) continue;
      var p = st.b[j]; if (p && p.c === c && (!f || f(p))) return true;
    }
    return false;
  }
  /* geometry of a move in the mover's own frame: dy > 0 forward, dx > 0 to the mover's right */
  function shape(g, m, c) {
    var f = m.f, t = m.t;
    var dy = c === 'w' ? g.row(f) - g.row(t) : g.row(t) - g.row(f);
    var dx = c === 'w' ? g.col(t) - g.col(f) : g.col(f) - g.col(t);
    return { dx: dx, dy: dy, len: Math.max(Math.abs(dx), Math.abs(dy)) };
  }
  /* devil's suggestion: the move with the worst one-ply score for the mover (pure, so the search agrees) */
  function devilPick(V, st, list) {
    var c = st.turn, best = null, bv = Infinity;
    for (var k = 0; k < list.length; k++) { var m = list[k]; if (!m.n) m.n = V.make(st, m); var v = V.evalFor(m.n, c); if (v < bv) { bv = v; best = m; } }
    return best;
  }
  var unluckyCache = {};
  function unluckySet(seed, ply, size) {
    var key = seed + ':' + ply; if (unluckyCache[key]) return unluckyCache[key];
    var a = []; for (var i = 0; i < size; i++) a.push(i);
    for (var k = size - 1; k > 0; k--) { var j = Math.floor(hrand(seed, ply, k) * (k + 1)); var tmp = a[k]; a[k] = a[j]; a[j] = tmp; }
    var set = {}; a.slice(0, size >> 1).forEach(function (s) { set[s] = 1; });
    var ks = Object.keys(unluckyCache); if (ks.length > 400) unluckyCache = {};
    return (unluckyCache[key] = set);
  }
  function fishNum(D) { return D.me.n + 1; }  /* the holder's current move number (1-based) */

  /* ------------------------------------------------------------------------------------------------------------
     Catalogue. D = { V, g, st, c (holder), o (opponent), me, op (their records), out (all legal moves) }
       ban(D, m)    true = the move is not allowed
       must(D, m)   if any allowed move satisfies it, only those moves remain ("if you can ..., you must")
       strict       with must: when no move satisfies it you have no legal move and lose ("... or lose")
       when(D)      must/strict only applies when this is true
       lose(D)      a reason string = the holder loses now (checked after every move, for both sides)
       turnLose(D)  same, but only checked when the holder is about to move ("start your turn")
       zone(D)      squares tinted on the board for the holder (the site's pink squares)
       promo        promotion choices
       info(D)      live text for the status line
     ------------------------------------------------------------------------------------------------------------ */
  var DB = {
    vacation: { name: 'Vacation', text: 'You have no drawback. Enjoy the holiday.' },
    horse_eats_first: { name: 'Horse Eats First', text: 'As long as you have a knight, you can only capture with knights.',
      ban: function (D, m) { return m.cap && m.p !== 'N' && find(D.st, D.c, 'N') >= 0; } },
    stockfish: { name: 'Stockfish', text: "You can't make the move Stockfish would make.", game: 'stockfish',
      ban: function (D, m) { var s = D.st.x.sfBan; return !!(s && s.ply === D.st.ply && s.f === m.f && s.t === m.t); } },
    sibling_rivalry: { name: 'Sibling Rivalry', text: "You can't move a piece to a square adjacent to an opponent's piece of the same type.",
      ban: function (D, m) { var t = m.promo || m.p; return adjOwn(m.n, D.g, m.t, D.o, -1, function (p) { return p.t === t; }); } },
    friendly_fire: { name: 'Friendly Fire', text: 'You can only move to squares defended by your other pieces.',
      ban: function (D, m) { if (m.castle) return false; var b = D.st.b.slice(); b[m.f] = null; return !D.V.attacked({ b: b, x: D.st.x }, m.t, D.c); } },
    unlucky: { name: 'Unlucky', text: "You can't move to half of the squares (re-randomized every move).",
      ban: function (D, m) { return !!unluckySet(D.st.x.seed || 1, D.st.ply, D.g.size)[m.t]; },
      zone: function (D) { var s = unluckySet(D.st.x.seed || 1, D.st.ply, D.g.size); return Object.keys(s).map(Number); } },
    rook_seventh: { name: 'Rook on the Seventh', text: 'By move 15 you must move one of your rooks onto the seventh rank, or lose.',
      turnLose: function (D) { return D.me.n >= 15 && !D.me.r7 ? 'no rook reached the seventh rank by move 15' : null; },
      info: function (D) { return D.me.r7 ? 'done' : 'move ' + fishNum(D) + ' of 15'; } },
    cowering_in_fear: { name: 'Cowering in Fear', text: "You can't move a piece worth less than the most valuable piece your opponent has taken from you.",
      ban: function (D, m) { return m.p !== 'K' && val(m.p) < D.me.lostMax; } },
    torpedoes: { name: 'Torpedoes', text: 'If you made a non-capturing pawn move last turn and can move that pawn again, you must.',
      when: function (D) { var l = D.me.last; return !!(l && l.pawn && !l.cap); }, must: function (D, m) { return m.f === D.me.last.t; } },
    edgelord: { name: 'Edgelord', text: 'You must always have at least as many pieces on the rim as your opponent.',
      ban: function (D, m) { var g = D.g; return count(m.n, D.c, function (p, i) { return rim(g, i); }) < count(m.n, D.o, function (p, i) { return rim(g, i); }); },
      info: function (D) { var g = D.g; return 'Yours: ' + count(D.st, D.c, function (p, i) { return rim(g, i); }) + ', Theirs: ' + count(D.st, D.o, function (p, i) { return rim(g, i); }); } },
    bishop_fan_club: { name: 'Bishop Fan Club', text: 'You must promote to bishops.', promo: ['B'] },
    rook_fan_club: { name: 'Rook Fan Club', text: 'You must promote to rooks.', promo: ['R'] },
    elephants_fear_mice: { name: 'Elephants Fear Mice', text: "Your non-pawn pieces can't capture pawns.",
      ban: function (D, m) { return m.cap && m.cap.t === 'P' && m.p !== 'P'; } },
    true_gentleman: { name: 'True Gentleman', text: "You can't capture queens.", ban: function (D, m) { return m.cap && m.cap.t === 'Q'; } },
    jumpy: { name: 'Jumpy', text: 'When possible, you must move a piece that is being attacked.',
      must: function (D, m) { return D.V.attacked(D.st, m.f, D.o); } },
    eye_for_an_eye: { name: 'Eye for an Eye', text: 'If your opponent captures, you must capture on your next move or lose.', strict: true,
      when: function (D) { return !!(D.op.last && D.op.last.cap); }, must: function (D, m) { return !!m.cap; } },
    messy_divorce: { name: 'Messy Divorce', text: "Your pieces can't move from the queenside to the kingside or vice versa.",
      ban: function (D, m) { return (D.g.col(m.f) < 4) !== (D.g.col(m.t) < 4); } },
    gorilla_tactics: { name: 'Gorilla Tactics', text: 'After capturing, the capturing piece must return to its previous square if possible.',
      when: function (D) { var l = D.me.last; return !!(l && l.cap); }, must: function (D, m) { return m.f === D.me.last.t && m.t === D.me.last.f; } },
    even_keeled: { name: 'Even-Keeled', text: 'You can only capture on even-numbered moves.',
      ban: function (D, m) { return m.cap && fishNum(D) % 2 === 1; }, info: function (D) { return 'move ' + fishNum(D) + (fishNum(D) % 2 ? ': no captures' : ': captures allowed'); } },
    pack_mentality: { name: 'Pack Mentality', text: 'Your pieces must move to squares adjacent to another of your pieces.',
      ban: function (D, m) { return !adjOwn(m.n, D.g, m.t, D.c, -1); } },
    expedition: { name: 'Expedition', text: 'On move 13 you must move a piece to a8 (h1 as Black), or lose.', strict: true,
      when: function (D) { return fishNum(D) === 13; }, must: function (D, m) { return m.t === sqFor(D.g, D.c, 'a8'); },
      zone: function (D) { return [sqFor(D.g, D.c, 'a8')]; } },
    active_volcano: { name: 'Active Volcano', text: "You can't move onto or orthogonally adjacent to d5.",
      ban: function (D, m) { return volcano(D.g).indexOf(m.t) >= 0; }, zone: function (D) { return volcano(D.g); } },
    outflanked: { name: 'Outflanked', text: "Except for capturing kings, you can't capture on the rim.",
      ban: function (D, m) { return m.cap && m.cap.t !== 'K' && rim(D.g, m.t); } },
    my_kingdom_for_a_horse: { name: 'My Kingdom for a Horse', text: 'If your opponent captures one of your knights, you lose.',
      lose: function (D) { return D.me.lostN ? 'a knight was captured' : null; } },
    scent_of_blood: { name: 'The Scent of Blood', text: "You can't make non-capturing moves with pieces that could capture.",
      ban: function (D, m) { if (m.cap) return false; for (var k = 0; k < D.out.length; k++) if (D.out[k].cap && D.out[k].f === m.f) return true; return false; } },
    spread_out: { name: 'Spread Out', text: "You can't move a non-pawn piece adjacent to another of your non-pawn pieces, and you can't castle.",
      ban: function (D, m) { if (m.castle) return true; if (m.p === 'P' && !m.promo) return false; return adjOwn(m.n, D.g, m.t, D.c, -1, function (p) { return p.t !== 'P'; }); } },
    inside_the_lines: { name: 'Inside the Lines', text: "You can't move onto the rim.", ban: function (D, m) { return rim(D.g, m.t); } },
    rising_water: { name: 'Rising Water', text: "Every 10 turns the water rises one rank from your side. You can't move pieces that are underwater or move to underwater squares.",
      ban: function (D, m) { var lv = Math.floor(D.me.n / 10); return D.g.relRow(m.f, D.c) < lv || D.g.relRow(m.t, D.c) < lv; },
      zone: function (D) { var lv = Math.floor(D.me.n / 10), o = []; for (var i = 0; i < D.g.size; i++) if (D.g.relRow(i, D.c) < lv) o.push(i); return o; },
      tint: 'rgba(60,140,230,.38)', info: function (D) { return 'water level ' + Math.floor(D.me.n / 10) + ', rises in ' + (10 - D.me.n % 10) + ' moves'; } },
    true_love: { name: 'True Love', text: "Your king can only move to squares adjacent to your queen (it can't move without one), and your queen can only move to squares adjacent to your king.",
      ban: function (D, m) {
        if (m.p === 'K') { var q = find(D.st, D.c, 'Q'); return q < 0 || D.g.dist(m.t, q) !== 1; }
        if (m.p === 'Q') { var k = find(D.st, D.c, 'K'); return k < 0 || D.g.dist(m.t, k) !== 1; }
        return false; } },
    fischer_random: { name: 'Fischer Random', text: 'On or before move 20, all your remaining non-pawn pieces must be on your home row, on squares they could not have started on, or you lose.',
      turnLose: function (D) { return D.me.n >= 20 && !fischerOk(D) ? 'the pieces were not rearranged by move 20' : null; } },
    enormous: { name: 'Enormous', text: 'On or before move 20, all your remaining non-pawn pieces must be on your home row, on squares they could not have started on, or you lose.',
      turnLose: function (D) { return D.me.n >= 20 && !fischerOk(D) ? 'the pieces were not rearranged by move 20' : null; } },
    boxing_with_shadows: { name: 'Boxing with Shadows', text: 'When your opponent moves a piece, if you can move to the square they moved from, you must.',
      when: function (D) { return !!D.op.last; }, must: function (D, m) { return m.t === D.op.last.f; } },
    lame_duck: { name: 'Lame Duck', text: "You can't move your king.", ban: function (D, m) { return m.p === 'K'; } },
    quit_horsing_around: { name: 'Quit Horsing Around', text: "If you moved a knight on your last move, you can't move a knight.",
      ban: function (D, m) { return m.p === 'N' && D.me.last && D.me.last.p === 'N'; } },
    eat_your_vegetables: { name: 'Eat Your Vegetables', text: "You can't capture non-pawns until your opponent has only four pawns remaining.",
      ban: function (D, m) { return m.cap && m.cap.t !== 'P' && count(D.st, D.o, function (p) { return p.t === 'P'; }) > 4; },
      info: function (D) { return 'their pawns: ' + count(D.st, D.o, function (p) { return p.t === 'P'; }); } },
    scorched_earth: { name: 'Scorched Earth', text: "You can't move to a square you've moved from.",
      ban: function (D, m) { return D.me.visited.indexOf(m.t) >= 0; }, zone: function (D) { return D.me.visited; }, tint: 'rgba(214,72,52,.38)' },
    farsighted: { name: 'Farsighted', text: "Your pieces can't capture adjacent pieces.",
      ban: function (D, m) { return m.cap && D.g.dist(m.f, m.capSq != null ? m.capSq : m.t) <= 1; } },
    scouting_ahead: { name: 'Scouting Ahead', text: "As long as you have a pawn, you can't move non-pawns ahead of your most advanced pawn.",
      ban: function (D, m) { if (m.p === 'P') return false; var a = advanced(D, 'P'); return a >= 0 && D.g.relRow(m.t, D.c) > a; } },
    leading_the_charge: { name: 'Leading the Charge', text: "As long as you have a knight, you can't move non-knights ahead of your most advanced knight.",
      ban: function (D, m) { if (m.p === 'N') return false; var a = advanced(D, 'N'); return a >= 0 && D.g.relRow(m.t, D.c) > a; } },
    absolution: { name: 'Absolution', text: 'When one of your non-bishop pieces captures, it must start a turn adjacent to one of your bishops before it can capture again.',
      ban: function (D, m) { return m.cap && D.me.taint.indexOf(m.f) >= 0 && !adjOwn(D.st, D.g, m.f, D.c, -1, function (p) { return p.t === 'B'; }); } },
    savior_complex: { name: 'Savior Complex', text: 'When in check, you must move your queen or lose.', strict: true,
      when: function (D) { return D.V.attackedByEnemy(D.st, find(D.st, D.c, 'K'), D.c); }, must: function (D, m) { return m.p === 'Q'; } },
    skittish: { name: 'Skittish', text: 'While in check, you must move your king.', strict: true,
      when: function (D) { return D.V.attackedByEnemy(D.st, find(D.st, D.c, 'K'), D.c); }, must: function (D, m) { return m.p === 'K'; } },
    noblesse_oblige: { name: 'Noblesse Oblige', text: 'Your royal pieces (king and queen) can only capture other royal pieces.',
      ban: function (D, m) { return m.cap && (m.p === 'K' || m.p === 'Q') && m.cap.t !== 'K' && m.cap.t !== 'Q'; } },
    checkers: { name: 'Checkers', text: 'If you can capture, you must.', must: function (D, m) { return !!m.cap; } },
    pacman: { name: 'Pac-Man', text: 'If you can capture a pawn, you must.', must: function (D, m) { return m.cap && m.cap.t === 'P'; } },
    gloomstalker: { name: 'Gloomstalker', text: 'You can only capture from dark squares.', ban: function (D, m) { return m.cap && D.g.isLight(m.f); } },
    shell_shocked: { name: 'Shell Shocked', text: "When your opponent captures, your pieces adjacent to the capture can't move for one turn.",
      ban: function (D, m) { var l = D.op.last; return !!(l && l.cap && D.g.dist(m.f, l.t) === 1); } },
    comfort_zone: { name: 'Comfort Zone', text: 'If you can move to f5 (c4 as Black), you must.',
      must: function (D, m) { return m.t === sqFor(D.g, D.c, 'f5'); }, zone: function (D) { return [sqFor(D.g, D.c, 'f5')]; } },
    obsession: { name: 'Obsession', text: 'If you can move to your obsession square, you must.',
      must: function (D, m) { return m.t === obsSq(D); }, zone: function (D) { return [obsSq(D)]; },
      info: function (D) { return 'obsession: ' + D.g.name(obsSq(D)); } },
    pawn_battle: { name: 'Pawn Battle', text: 'You lose if you have fewer pawns than your opponent.',
      lose: function (D) { var P = function (p) { return p.t === 'P'; }; return count(D.st, D.c, P) < count(D.st, D.o, P) ? 'fewer pawns than the opponent' : null; },
      info: function (D) { var P = function (p) { return p.t === 'P'; }; return 'pawns ' + count(D.st, D.c, P) + ' vs ' + count(D.st, D.o, P); } },
    stop_stalling: { name: 'Stop Stalling', text: "Your pieces can't move laterally (sideways).",
      ban: function (D, m) { return D.g.row(m.f) === D.g.row(m.t); } },
    fixation: { name: 'Fixation', text: 'If you can move the piece you moved last turn, you must.',
      when: function (D) { return !!D.me.last; }, must: function (D, m) { return m.f === D.me.last.t; } },
    closed_book: { name: 'Closed Book', text: "You lose if you ever start your turn while there's an open file.",
      turnLose: function (D) { var f = openFile(D); return f >= 0 ? 'the ' + D.g.fileName(f) + '-file is open' : null; } },
    boastful: { name: 'Boastful', text: 'You lose if you have fewer pieces than your opponent.',
      lose: function (D) { return count(D.st, D.c) < count(D.st, D.o) ? 'fewer pieces than the opponent' : null; },
      info: function (D) { return 'pieces ' + count(D.st, D.c) + ' vs ' + count(D.st, D.o); } },
    diplomatic_immunity: { name: 'Diplomatic Immunity', text: "You can't capture a piece that just moved, unless that move was a capture.",
      ban: function (D, m) { var l = D.op.last; return !!(m.cap && l && !l.cap && (m.capSq != null ? m.capSq : m.t) === l.t); } },
    hopscotch: { name: 'Hopscotch', text: 'You must alternate moving to light and dark squares.',
      ban: function (D, m) { var l = D.me.last; return !!(l && D.g.isLight(m.t) === D.g.isLight(l.t)); } },
    bloodthirsty: { name: 'Bloodthirsty', text: 'After the first three turns, if you go two turns without capturing, you must capture on the third or lose.', strict: true,
      when: function (D) { return D.me.n >= 3 && D.me.sinceCap >= 2; }, must: function (D, m) { return !!m.cap; } },
    flatterer: { name: 'Flatterer', text: 'If your opponent moves a pawn, you must move a pawn. If they move a non-pawn, you must move a non-pawn.', strict: true,
      when: function (D) { return !!D.op.last; }, must: function (D, m) { return (m.p === 'P') === !!D.op.last.pawn; } },
    snipers: { name: 'Snipers', text: 'Your bishops can only capture from at least four diagonal squares away.',
      ban: function (D, m) { return m.cap && m.p === 'B' && D.g.dist(m.f, m.t) < 4; } },
    leaps_and_bounds: { name: 'Leaps and Bounds', text: "You can't move a piece to a square adjacent to where it was.",
      ban: function (D, m) { return D.g.dist(m.f, m.t) === 1; } },
    truant: { name: 'Truant', text: "You can't move the same piece twice in a row.", ban: function (D, m) { return !!(D.me.last && m.f === D.me.last.t); } },
    cowardly: { name: 'Cowardly', text: 'When your opponent captures, you must move backwards or lose.', strict: true,
      when: function (D) { return !!(D.op.last && D.op.last.cap); }, must: function (D, m) { return shape(D.g, m, D.c).dy < 0; } },
    forward_march: { name: 'Forward March', text: "Your pieces can't move backwards.", low: true,
      ban: function (D, m) { return shape(D.g, m, D.c).dy < 0; } },
    remorseful: { name: 'Remorseful', text: "You can't capture twice in a row.", ban: function (D, m) { return !!(m.cap && D.me.last && D.me.last.cap); } },
    separation_of_church_and_state: { name: 'Separation of Church and State', text: "You can't move your bishops next to a king, and you can't move your king next to a bishop.",
      ban: function (D, m) {
        if (m.p === 'B') return adjOwn(m.n, D.g, m.t, D.c, -1, isK) || adjOwn(m.n, D.g, m.t, D.o, -1, isK);
        if (m.p === 'K') return adjOwn(m.n, D.g, m.t, D.c, -1, isB) || adjOwn(m.n, D.g, m.t, D.o, -1, isB);
        return false; } },
    peons_first: { name: 'Peons First', text: "You can't move pieces that are one square behind one of your pawns.",
      ban: function (D, m) { if (m.p === 'P') return false; var j = D.g.step(m.f, 0, D.g.fwd(D.c)); var p = j >= 0 ? D.st.b[j] : null; return !!(p && p.c === D.c && p.t === 'P'); } },
    crusade: { name: 'Crusade', text: 'For four consecutive moves starting on move 13, you must end your turn occupying f6 (c3 as Black), or lose.', strict: true,
      when: function (D) { var k = fishNum(D); return k >= 13 && k <= 16; }, must: function (D, m) { var p = m.n.b[sqFor(D.g, D.c, 'f6')]; return !!(p && p.c === D.c); },
      zone: function (D) { return [sqFor(D.g, D.c, 'f6')]; } },
    shapeshifter: { name: 'Shapeshifter', text: 'Your queen starts as a bishop. Whenever you capture a non-pawn piece, your queen becomes a copy of it.', shapeshift: true },
    haunted: { name: 'Haunted', text: "You can't move to a square you have captured on.", ban: function (D, m) { return D.me.capOn.indexOf(m.t) >= 0; },
      zone: function (D) { return D.me.capOn; }, tint: 'rgba(120,90,200,.36)' },
    superstitious: { name: 'Superstitious', text: "You can't move to a square your opponent has captured on.", ban: function (D, m) { return D.op.capOn.indexOf(m.t) >= 0; },
      zone: function (D) { return D.op.capOn; } },
    lethal_attraction: { name: 'Lethal Attraction', text: "You can't make moves that place the moving piece farther from your opponent's king than it started.",
      ban: function (D, m) { var k = find(D.st, D.o, 'K'); return k >= 0 && D.g.dist(m.t, k) > D.g.dist(m.f, k); } },
    krenolations: { name: 'Krenolations', text: 'Your pawns can only move to light squares.', ban: function (D, m) { return m.p === 'P' && !D.g.isLight(m.t); } },
    colorblind: { name: 'Colorblind', text: "You can't move to squares of one colour (re-randomized every turn).",
      ban: function (D, m) { return D.g.isLight(m.t) === (hrand(D.st.x.seed || 1, D.st.ply, 7) < 0.5); },
      info: function (D) { return 'no ' + (hrand(D.st.x.seed || 1, D.st.ply, 7) < 0.5 ? 'light' : 'dark') + ' squares this turn'; } },
    separation_anxiety: { name: 'Separation Anxiety', text: "Pawns adjacent to your king can't make moves that leave the squares adjacent to him.",
      ban: function (D, m) { if (m.p !== 'P') return false; var k = find(D.st, D.c, 'K'); return k >= 0 && D.g.dist(m.f, k) === 1 && D.g.dist(m.t, k) !== 1; } },
    bongcloud: { name: 'Bongcloud', text: 'When your king is on the back rank, you can only move pawns and kings.',
      ban: function (D, m) { var k = find(D.st, D.c, 'K'); return k >= 0 && D.g.relRow(k, D.c) === 0 && m.p !== 'P' && m.p !== 'K'; } },
    theocracy: { name: 'Theocracy', text: 'On even-numbered moves, you can only capture with bishops.', ban: function (D, m) { return m.cap && fishNum(D) % 2 === 0 && m.p !== 'B'; } },
    simplifier: { name: 'Simplifier', text: 'If you can capture a piece with a piece of lesser or equal value, you must.',
      must: function (D, m) { return m.cap && m.p !== 'K' && val(m.p) <= val(m.cap.t) && m.cap.t !== 'K'; } },
    irresistible: { name: 'Irresistible', text: "If you can move a piece adjacent to your opponent's king that isn't already, you must.",
      must: function (D, m) { var k = find(D.st, D.o, 'K'); return k >= 0 && D.g.dist(m.f, k) > 1 && D.g.dist(m.t, k) === 1; } },
    chivalry: { name: 'Chivalry', text: 'You can only capture rooks and queens with knights.', ban: function (D, m) { return m.cap && (m.cap.t === 'R' || m.cap.t === 'Q') && m.p !== 'N'; } },
    paranoid: { name: 'Paranoid', text: 'Your king must always be defended, or you lose.',
      lose: function (D) { var k = find(D.st, D.c, 'K'); return k >= 0 && !D.V.attacked(D.st, k, D.c) ? 'the king was left undefended' : null; } },
    helicopter_parent: { name: 'Helicopter Parent', text: 'You lose if you have an undefended pawn.', lose: undefendedPawn },
    undefended: { name: 'Undefended', text: 'You lose if you have an undefended pawn.', lose: undefendedPawn },
    stage_fright: { name: 'Stage Fright', text: "You can't move to the center four squares.", ban: function (D, m) { return center(D.g, m.t); },
      zone: function (D) { return ['d4', 'e4', 'd5', 'e5'].map(function (s) { return D.g.parse(s); }); } },
    ivory_tower: { name: 'Ivory Tower', text: 'You lose if an opposing piece is adjacent to your king.',
      lose: function (D) { var k = find(D.st, D.c, 'K'); return k >= 0 && adjOwn(D.st, D.g, k, D.o, -1) ? 'an enemy piece stood next to the king' : null; } },
    wind_up_toys: { name: 'Wind-up Toys', text: "After the first 12 moves, you can't move your knights and bishops.",
      ban: function (D, m) { return D.me.n >= 12 && (m.p === 'N' || m.p === 'B'); } },
    triple_play: { name: 'Triple Play', text: 'You can only capture their king if you have three knights.',
      ban: function (D, m) { return m.cap && m.cap.t === 'K' && count(D.st, D.c, function (p) { return p.t === 'N'; }) < 3; } },
    triple_play_bishops: { name: 'Triple Play', text: 'You can only capture their king if you have three bishops.',
      ban: function (D, m) { return m.cap && m.cap.t === 'K' && count(D.st, D.c, function (p) { return p.t === 'B'; }) < 3; } },
    femme_fatale: { name: 'Femme Fatale', text: 'You can only capture the enemy king with a queen.', ban: function (D, m) { return m.cap && m.cap.t === 'K' && m.p !== 'Q'; } },
    no_knight_captures: { name: 'Horse Lover', text: "You can't capture knights.", low: true, ban: function (D, m) { return m.cap && m.cap.t === 'N'; } },
    moving_day: { name: 'Moving Day', text: "From move 21 on, none of your pieces may be on your home row, or you lose.",
      turnLose: function (D) { var g = D.g, c = D.c; return D.me.n >= 20 && count(D.st, c, function (p, i) { return g.relRow(i, c) === 0; }) ? 'pieces were still on the home row on move 21' : null; } },
    death_wish: { name: 'Death Wish', text: "If you can move your king into check (and you aren't in check), you must.",
      when: function (D) { return !D.V.attackedByEnemy(D.st, find(D.st, D.c, 'K'), D.c); },
      must: function (D, m) { return m.p === 'K' && D.V.attackedByEnemy(m.n, m.t, D.c); } },
    bottled_lightning: { name: 'Bottled Lightning', text: 'If you can move your king, you must.', must: function (D, m) { return m.p === 'K'; } },
    devil: { name: 'Devil on Your Shoulder', text: 'A devil suggests a terrible move every turn. If you ignore it 7 turns in a row, you must obey on the 8th.', game: 'devil',
      info: function (D) { var k = (D.st.x.devilMiss || {})[D.c] || 0; return k >= 7 ? 'you must obey the devil now' : 'ignored ' + k + ' of 7'; } },
    religious_dispute: { name: 'Religious Dispute', text: 'If your opponent moves a bishop, you must move a bishop, or lose.', strict: true,
      when: function (D) { return !!(D.op.last && D.op.last.p === 'B'); }, must: function (D, m) { return m.p === 'B'; } },
    cheerleaders: { name: 'Cheerleaders', text: 'Your non-pawn pieces can only capture when adjacent to one of your pawns.',
      ban: function (D, m) { return m.cap && m.p !== 'P' && !adjOwn(D.st, D.g, m.f, D.c, -1, function (p) { return p.t === 'P'; }); } },
    two_steps_forward: { name: 'Two Steps Forward, One Step Back', text: 'If you move forward two times in a row, you must move backwards next.', strict: true,
      when: function (D) { return D.me.fwdRun >= 2; }, must: function (D, m) { return shape(D.g, m, D.c).dy < 0; } },
    leveling_up: { name: 'Leveling Up', text: "You can't capture a piece until you've captured its predecessor: pawn, then knight or bishop, then rook, then queen, then king.",
      ban: function (D, m) { if (!m.cap) return false; var r = LADDER[m.cap.t]; if (!r) return false; var got = D.me.capT; return !got.split('').some(function (t) { return LADDER[t] === r - 1; }); },
      info: function (D) { return 'captured so far: ' + (D.me.capT || 'nothing'); } },
    spice_of_life: { name: 'Spice of Life', text: "You can't move the same piece type twice in a row.", ban: function (D, m) { return !!(D.me.last && D.me.last.p === m.p); } },
    winds_of_fate: { name: 'Winds of Fate', text: 'Every turn you are randomly unable to move either left or right.',
      ban: function (D, m) { var dx = shape(D.g, m, D.c).dx; return windRight(D) ? dx > 0 : dx < 0; },
      info: function (D) { return windRight(D) ? "Can't move right" : "Can't move left"; } },
    bipartisanship: { name: 'Bipartisanship', text: "You can't move left twice in a row or right twice in a row.",
      ban: function (D, m) { var dx = shape(D.g, m, D.c).dx; return dx !== 0 && D.me.lastLR !== 0 && Math.sign(dx) === D.me.lastLR; } },
    simon_says: { name: 'Simon Says', text: "You must move onto the same colour square as your opponent's last move.", strict: true,
      when: function (D) { return !!D.op.last; }, must: function (D, m) { return D.g.isLight(m.t) === D.g.isLight(D.op.last.t); } },
    social_distancing: { name: 'Social Distancing', text: "You can't make non-capturing moves to squares adjacent to your opponent's pieces.",
      ban: function (D, m) { return !m.cap && adjOwn(D.st, D.g, m.t, D.o, -1); } },
    just_passing_through: { name: 'Just Passing Through', text: "You can't capture on the fourth rank.", ban: function (D, m) { return m.cap && D.g.relRow(m.t, D.c) === 3; } },
    relay_race: { name: 'Relay Race', text: 'If you can move a piece to a square adjacent to the destination of your last move, you must.',
      when: function (D) { return !!D.me.last; }, must: function (D, m) { return D.g.dist(m.t, D.me.last.t) === 1; } },
    going_the_distance: { name: 'Going the Distance', text: "You must move at least as far as your opponent's last move, or lose.", strict: true,
      when: function (D) { return !!D.op.last; }, must: function (D, m) { return shape(D.g, m, D.c).len >= D.op.last.len; } },
    alternator: { name: 'Alternator', text: 'You must alternate between pawn moves and non-pawn moves.', strict: true,
      when: function (D) { return !!D.me.last; }, must: function (D, m) { return (m.p === 'P') !== !!D.me.last.pawn; } },
    hipster: { name: 'Hipster', text: "You can't move the same piece type as your opponent's last move.", ban: function (D, m) { return !!(D.op.last && D.op.last.p === m.p); } },
    secret_garden: { name: 'Secret Garden', text: "A hidden garden square sits in front of your pawns. You can't move onto it, and if your opponent tramples it, you lose.",
      ban: function (D, m) { return m.t === gardenSq(D); }, zone: function (D) { return [gardenSq(D)]; }, tint: 'rgba(90,170,80,.45)',
      lose: function (D) { var p = D.st.b[gardenSq(D)]; return p && p.c === D.o ? 'the opponent trampled the secret garden' : null; } },
    turn_the_other_cheek: { name: 'Turn the Other Cheek', text: "You can't recapture.", ban: function (D, m) { var l = D.op.last; return !!(m.cap && l && l.cap && m.t === l.t); } },
    hedonic_treadmill: { name: 'Hedonic Treadmill', text: "You must move a piece at least as valuable as your opponent's last-moved piece.", strict: true,
      when: function (D) { return !!D.op.last; }, must: function (D, m) { return m.p === 'K' || val(m.p) >= val(D.op.last.p); } },
    botez_gambit: { name: 'Botez Gambit', text: 'At the start of turn 11 you must not have a queen, and your opponent must have one, or you lose.',
      turnLose: function (D) { if (D.me.n !== 10) return null; var Q = function (p) { return p.t === 'Q'; }; return count(D.st, D.c, Q) || !count(D.st, D.o, Q) ? 'the queens were wrong on turn 11' : null; } },
    botvinnik_gambit: { name: "Botvinnik's Gambit", text: 'At the start of turn 11 you must not have a queen, and your opponent must have one, or you lose.',
      turnLose: function (D) { if (D.me.n !== 10) return null; var Q = function (p) { return p.t === 'Q'; }; return count(D.st, D.c, Q) || !count(D.st, D.o, Q) ? 'the queens were wrong on turn 11' : null; } },
    medusa: { name: 'Medusa', text: "Your pieces attacked by the opponent's queen are turned to stone and can't move.",
      ban: function (D, m) { return queenHits(D, m.f); } },
    trophy_wife: { name: 'Trophy Wife', text: "Your queen can't capture.", ban: function (D, m) { return m.cap && m.p === 'Q'; } },
    warlord: { name: 'Warlord', text: 'From the start of move 12 on, your king must not be on your first two ranks, or you lose.',
      turnLose: function (D) { var k = find(D.st, D.c, 'K'); return D.me.n >= 11 && k >= 0 && D.g.relRow(k, D.c) <= 1 ? 'the king was still on the first two ranks' : null; } },
    blinded_by_the_sun: { name: 'Blinded by the Sun', text: "You can't end your turn attacking e5 (d4 as Black).",
      ban: function (D, m) { return D.V.attacked(m.n, sqFor(D.g, D.c, 'e5'), D.c); }, zone: function (D) { return [sqFor(D.g, D.c, 'e5')]; } },
    centralized_command: { name: 'Centralized Command', text: "You can only capture if you've moved your king in the last three turns.",
      ban: function (D, m) { return m.cap && m.p !== 'K' && D.me.n - D.me.kingN >= 3; } },
    stand_your_ground: { name: 'Stand Your Ground', text: 'Your pieces can only capture if they are attacked.', ban: function (D, m) { return m.cap && !D.V.attacked(D.st, m.f, D.o); } },
    conscientious_objectors: { name: 'Conscientious Objectors', text: "You can't capture with pawns.", ban: function (D, m) { return m.cap && m.p === 'P'; } },
    simp: { name: 'Simp', text: 'You lose if you have no queen.', lose: function (D) { return find(D.st, D.c, 'Q') < 0 ? 'the queen is gone' : null; } },
    number_of_the_beast: { name: 'Number of the Beast', text: "You can't move to the sixth rank.", ban: function (D, m) { return D.g.relRow(m.t, D.c) === 5; },
      zone: function (D) { var o = []; for (var i = 0; i < D.g.size; i++) if (D.g.relRow(i, D.c) === 5) o.push(i); return o; } },
    monkey_see: { name: 'Monkey See', text: 'You can only capture with piece types your opponent has captured with.', ban: function (D, m) { return m.cap && D.op.capWith.indexOf(m.p) < 0; } },
    nimble_feet: { name: "Can't Move Backwards", text: "Your pieces can't move backwards.", ban: function (D, m) { return shape(D.g, m, D.c).dy < 0; } }
  };
  function isK(p) { return p.t === 'K'; }
  function isB(p) { return p.t === 'B'; }
  function volcano(g) { return ['d5', 'c5', 'e5', 'd4', 'd6'].map(function (s) { return g.parse(s); }); }
  function windRight(D) { return hrand(D.st.x.seed || 1, D.st.ply, 3) < 0.5; }
  function obsSq(D) { var x = D.st.x, g = D.g; var r = 2 + Math.floor(hrand(x.seed || 1, D.c === 'w' ? 11 : 12, 0) * 4), c = Math.floor(hrand(x.seed || 1, D.c === 'w' ? 13 : 14, 0) * 8); return D.c === 'w' ? g.idx(c, 7 - r) : g.idx(c, r); }
  function gardenSq(D) { var x = D.st.x, g = D.g, c = Math.floor(hrand(x.seed || 1, D.c === 'w' ? 21 : 22, 0) * 8); return D.c === 'w' ? g.idx(c, 5) : g.idx(c, 2); }
  function advanced(D, t) { var a = -1, g = D.g; D.st.b.forEach(function (p, i) { if (p && p.c === D.c && p.t === t) a = Math.max(a, g.relRow(i, D.c)); }); return a; }
  function openFile(D) { var g = D.g, b = D.st.b; for (var f = 0; f < g.files; f++) { var any = false; for (var r = 0; r < g.ranks; r++) { var p = b[g.idx(f, r)]; if (p && p.t === 'P') { any = true; break; } } if (!any) return f; } return -1; }
  function undefendedPawn(D) { var bad = false; D.st.b.forEach(function (p, i) { if (!bad && p && p.c === D.c && p.t === 'P' && !D.V.attacked(D.st, i, D.c)) bad = true; }); return bad ? 'a pawn was left undefended' : null; }
  function queenHits(D, sq) { var V = D.V, b = D.st.b; for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === D.o && p.t === 'Q') { var nb = b.map(function (q, j) { return q && q.c === D.o && j !== i ? null : q; }); if (V.attacked({ b: nb, x: D.st.x }, sq, D.o)) return true; } } return false; }
  var HOME = 'RNBQKBNR';
  function fischerOk(D) {
    var g = D.g, c = D.c, ok = true;
    D.st.b.forEach(function (p, i) { if (!ok || !p || p.c !== c || p.t === 'P') return; if (g.relRow(i, c) !== 0 || HOME[g.col(i)] === p.t) ok = false; });
    return ok;
  }

  function keyOf(st, c) { return st.x && st.x.dbk ? st.x.dbk[c] : null; }
  function mkD(V, st, c, out) { return { V: V, g: V.geo, st: st, c: c, o: opp(c), me: recOf(st, c), op: recOf(st, opp(c)), out: out || [] }; }

  function filterFor(V, st, legal) {
    var c = st.turn, d = DB[keyOf(st, c)];
    if (!d) return legal;
    var D = mkD(V, st, c, legal), out = legal;
    if (d.ban) out = out.filter(function (m) { if (!m.n) m.n = V.make(st, m); return !d.ban(D, m); });
    if (d.promo) out = out.filter(function (m) { return !m.promo || d.promo.indexOf(m.promo) >= 0; });
    if (d.must && (!d.when || d.when(D))) {
      var sel = out.filter(function (m) { if (!m.n) m.n = V.make(st, m); return d.must(D, m); });
      if (sel.length || d.strict) out = sel;
    }
    if (d.game === 'devil' && ((st.x.devilMiss || {})[c] || 0) >= 7 && out.length) { var dv = devilPick(V, st, out); out = dv ? [dv] : out; }
    return out;
  }
  function loseCheck(V, st) {
    var cs = ['w', 'b'];
    for (var k = 0; k < cs.length; k++) {
      var c = cs[k], d = DB[keyOf(st, c)]; if (!d || (!d.lose && !d.turnLose)) continue;
      if (find(st, c, 'K') < 0 || find(st, opp(c), 'K') < 0) return null;  /* a captured king is handled by the engine */
      var D = mkD(V, st, c), why = d.lose ? d.lose(D) : null;
      if (!why && d.turnLose && st.turn === c) why = d.turnLose(D);
      if (why) return { w: opp(c), why: d.name + ': ' + why, broke: c };
    }
    return null;
  }

  function P(ctx) { return ctx.params || {}; }
  function run(ctx) { var id = ctx.spec.id; return RUN[id] || (RUN[id] = { game: -1, wins: 0, played: 0 }); }
  function visible(ctx) { var v = P(ctx).view || 'see'; if (v === 'hidden') return false; if (v === 'flash') return !!ctx.x.flashOn; return true; }
  function cardHtml(d, title, sub) {
    return '<div style="max-width:86%;background:#2b2140;color:#f3eefc;border-radius:10px;padding:14px 16px;box-shadow:0 8px 24px rgba(0,0,0,.45);font:600 14px/1.35 system-ui,sans-serif;text-align:left">' +
      '<div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#b9a6e6;margin-bottom:6px">' + title + '</div>' +
      '<div style="font-size:19px;font-weight:800;margin-bottom:4px">' + CM.util.esc(d.name) + '</div>' +
      '<div style="font-weight:500">' + CM.util.esc(d.text) + '</div>' + (sub ? '<div style="margin-top:8px;font-size:12px;color:#b9a6e6">' + sub + '</div>' : '') + '</div>';
  }
  function pickPool(ctx, avoid) {
    var pool = P(ctx).pool || Object.keys(DB).filter(function (k) { return !DB[k].low && k !== 'vacation'; });
    pool = pool.filter(function (k) { return k !== avoid && DB[k]; });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  var H = {
    filterMoves: filterFor,
    checkWin: function (V, st, moves) {
      var r = loseCheck(V, st); if (r) return r;
      if (!moves.length && find(st, st.turn, 'K') >= 0 && find(st, opp(st.turn), 'K') >= 0) {
        var d = DB[keyOf(st, st.turn)];
        return { w: opp(st.turn), why: 'no legal move' + (d ? ' under the drawback ' + d.name : ''), broke: st.turn };
      }
      return null;
    },
    onMake: function (V, st, m, n) {
      var g = V.geo, c = st.turn, o = opp(c);
      var L = (st.x && st.x.L) || { w: rec0(), b: rec0() };
      var me = Object.assign({}, L[c] || rec0()), op = Object.assign({}, L[o] || rec0());
      var sh = m.f >= 0 ? shape(g, m, c) : { dx: 0, dy: 0, len: 0 };
      /* absolution: clear taint of pieces that start this turn next to a bishop, then follow the moving piece */
      var taint = me.taint.filter(function (s) { return !adjOwn(st, g, s, c, -1, isB); });
      var ti = taint.indexOf(m.f); if (ti >= 0) { taint = taint.slice(); taint.splice(ti, 1); if (!m.cap) taint.push(m.t); }
      if (m.cap && m.p !== 'B') { taint = taint.concat([m.t]); }
      me.taint = taint;
      me.n++;
      me.last = { f: m.f, t: m.t, p: m.p, cap: m.cap ? m.cap.t : null, pawn: m.p === 'P' ? 1 : 0, len: sh.len };
      me.fwdRun = sh.dy > 0 ? me.fwdRun + 1 : 0;
      me.sinceCap = m.cap ? 0 : me.sinceCap + 1;
      if (m.p === 'K') me.kingN = me.n;
      if (sh.dx) me.lastLR = Math.sign(sh.dx);
      if (m.f >= 0 && me.visited.indexOf(m.f) < 0) me.visited = me.visited.concat([m.f]);
      if (m.p === 'R' && g.relRow(m.t, c) === 6) me.r7 = 1;
      if (m.cap) {
        var cs = m.capSq != null ? m.capSq : m.t;
        if (me.capOn.indexOf(cs) < 0) me.capOn = me.capOn.concat([cs]);
        if (me.capT.indexOf(m.cap.t) < 0) me.capT += m.cap.t;
        if (me.capWith.indexOf(m.p) < 0) me.capWith += m.p;
        op.lostMax = Math.max(op.lostMax, val(m.cap.t));
        if (m.cap.t === 'N') op.lostN = 1;
        var oi = op.taint.indexOf(cs); if (oi >= 0) { op.taint = op.taint.slice(); op.taint.splice(oi, 1); }
        /* shapeshifter: the capturer's shifting queen copies a captured non-pawn */
        if (DB[keyOf(st, c)] && DB[keyOf(st, c)].shapeshift && m.cap.t !== 'P' && m.cap.t !== 'K') {
          for (var i = 0; i < n.b.length; i++) { var q = n.b[i]; if (q && q.c === c && q.shift) { n.b[i] = Object.assign({}, q, { t: m.cap.t }); break; } }
        }
      }
      var NL = {}; NL[c] = me; NL[o] = op; n.x.L = NL;
    },
    evaluate: function (V, st) {
      /* a small nudge so the bot keeps its "you lose if" drawbacks satisfied before they bite */
      var v = 0;
      ['w', 'b'].forEach(function (c) {
        var d = DB[keyOf(st, c)]; if (!d) return; var sgn = c === 'w' ? 1 : -1, D = mkD(V, st, c);
        if (d === DB.pawn_battle) v += sgn * 40 * (count(st, c, function (p) { return p.t === 'P'; }) - count(st, opp(c), function (p) { return p.t === 'P'; }));
        if (d === DB.boastful) v += sgn * 30 * (count(st, c) - count(st, opp(c)));
        if (d === DB.rook_seventh && !D.me.r7) v -= sgn * 8 * D.me.n;
        if (d === DB.warlord && D.me.n >= 7) { var k = find(st, c, 'K'); if (k >= 0 && V.geo.relRow(k, c) <= 1) v -= sgn * 25 * (D.me.n - 6); }
      });
      return v;
    },

    /* ---------------- game hooks ---------------- */
    setup: function (ctx) {
      var p = P(ctx), r = run(ctx); r.game++;
      var games = p.games || [], gm = r.game < games.length ? games[r.game] : (p.pool || !games.length ? {} : games[r.game % games.length]);
      var side = gm.side || (p.side === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : (p.side || ctx.spec.player_side || 'w'));
      side = side === 'white' ? 'w' : side === 'black' ? 'b' : side;
      ctx.game.human = side; ctx.game.botColor = opp(side);
      var you = gm.you && DB[gm.you] ? gm.you : pickPool(ctx);
      var them = gm.opp && DB[gm.opp] ? gm.opp : pickPool(ctx, you);
      var dbk = {}; dbk[side] = you; dbk[opp(side)] = them;
      ctx.setX('dbk', dbk);
      ctx.setX('seed', 1 + Math.floor(Math.random() * 2147483000));
      ctx.setX('L', { w: rec0(), b: rec0() });
      ctx.setX('devilMiss', { w: 0, b: 0 });
      ctx.setX('flashOn', (p.view || 'see') === 'flash' ? 1 : 0);
      /* Shapeshifter: the queen starts as a bishop */
      ['w', 'b'].forEach(function (c) {
        if (!DB[dbk[c]].shapeshift) return;
        var q = find(ctx.state, c, 'Q'); if (q >= 0) ctx.transform(q, { type: 'B', props: { shift: 1 } });
      });
      var names = p.opp_names || [], nm = gm.opp_name || (names.length ? names[r.game % names.length] : 'Anonymous');
      var av = p.avatars ? p.avatars[r.game % p.avatars.length] : null;
      ctx.setOpponent(Object.assign({ name: nm, rating: null }, av ? { avatar: av } : {}));
      r.cur = { you: you, them: them };
    },
    onStart: function (ctx) {
      var p = P(ctx), r = run(ctx), d = DB[ctx.x.dbk[ctx.human]], view = p.view || 'see';
      var title = 'Game ' + (r.game + 1) + (p.goal ? ' · goal ' + p.goal + ' wins' : '') + ' · your drawback';
      if (view === 'hidden') {
        ctx.fx({ type: 'overlay', at: 'board', html: cardHtml({ name: '? ? ?', text: 'Your drawback is hidden. Moves it forbids are simply not allowed: work it out from what the board refuses.' }, title), duration_ms: 2600, fade_ms: 300 });
      } else {
        ctx.fx({ type: 'overlay', at: 'board', html: cardHtml(d, title, view === 'flash' ? 'Memorise it: it disappears in two seconds.' : (p.hard ? 'Hard drawbacks enabled' : 'Opponent\'s drawback is revealed when the game ends')), duration_ms: view === 'flash' ? 2000 : 2600, fade_ms: 300 });
        if (view === 'flash') ctx.after(2000, function () { ctx.setX('flashOn', 0); ctx.game.render(); });
      }
      ctx.sound('notify');
    },
    onTurn: function (ctx, c) {
      if (c !== ctx.human || ctx.over) return;
      var d = DB[ctx.x.dbk[c]]; if (!d || !d.game) return;
      var st = ctx.state, V = ctx.V;
      if (d.game === 'stockfish') {
        if (ctx.x.sfBan && ctx.x.sfBan.ply === st.ply) return;
        var L = new CM.Search(V, {}).rank(st, { moves: ctx.game.moves.slice(), maxDepth: 3, timeMs: 300, noise: 0 });
        if (L && L.length > 1) { ctx.setX('sfBan', { ply: st.ply, f: L[0].m.f, t: L[0].m.t }); ctx.refresh(); }
      } else if (d.game === 'devil' && ctx.game.moves.length) {
        var dv = devilPick(V, st, ctx.game.moves);
        ctx.clearFx('arrow');
        if (dv) ctx.fx({ type: 'arrow', from: dv.f, to: dv.t, color: 'rgba(200,40,40,.85)', duration_ms: 0 });
      }
    },
    afterMove: function (ctx, m) {
      ctx.clearFx('arrow');
      var h = ctx.game.history, prev = h.length ? h[h.length - 1].state : null; if (!prev) return;
      var c = prev.turn, d = DB[keyOf(prev, c)];
      if (d && d.game === 'devil') {
        var dv = devilPick(ctx.V, prev, ctx.V.legal(prev)), miss = Object.assign({}, ctx.x.devilMiss || {});
        miss[c] = dv && dv.f === m.f && dv.t === m.t ? 0 : (miss[c] || 0) + 1;
        ctx.setX('devilMiss', miss);
        if (miss[c] >= 7) ctx._dirtyDevil = true;
      }
      return null;
    },
    botPick: function (ctx, L) {
      var d = DB[ctx.x.dbk[ctx.bot]];
      if (d && d.game === 'stockfish' && L.length > 1) return L[1 + Math.floor(Math.random() * Math.min(2, L.length - 1))];
      if (d && d.game === 'devil' && L.length > 1 && Math.random() < 0.25) return L[L.length - 1];
      return null;
    },
    decorate: function (ctx, sq) {
      var c = ctx.human, d = DB[ctx.x.dbk && ctx.x.dbk[c]]; if (!d || !d.zone || ctx.over) return null;
      var st = ctx.state, key = st.ply + ':' + c;
      if (ctx._g2zk !== key || ctx._g2st !== st) { ctx._g2zk = key; ctx._g2st = st; var z = d.zone(mkD(ctx.V, st, c)) || []; ctx._g2z = {}; z.forEach(function (s) { ctx._g2z[s] = 1; }); }
      if (!ctx._g2z[sq]) return null;
      return { html: '<span class="sq-tint" style="background:' + (d.tint || 'rgba(232,96,150,.42)') + '"></span>' };
    },
    status: function (ctx) {
      var p = P(ctx), r = run(ctx), c = ctx.human, d = DB[ctx.x.dbk && ctx.x.dbk[c]]; if (!d) return '';
      var goal = p.goal ? 'Wins ' + r.wins + '/' + p.goal + ' · ' : '';
      if (!visible(ctx)) return goal + 'Your drawback: hidden. Blocked moves are your clue.';
      var live = d.info ? ' (' + d.info(mkD(ctx.V, ctx.state, c)) + ')' : '';
      return goal + 'Your drawback: ' + d.name + ': ' + d.text + live;
    },
    onGameOver: function (ctx, over) {
      var r = run(ctx), x = ctx.x, mine = DB[x.dbk[ctx.human]], theirs = DB[x.dbk[ctx.bot]];
      r.played++; if (over.w === ctx.human) r.wins++;
      var why = over.why || '';
      if (/^the king was captured$/.test(why)) why = over.w === ctx.human ? "you took your opponent's king" : 'your king was taken';
      over.why = why + '. Your opponent\'s drawback was ' + theirs.name + ': ' + theirs.text + ((P(ctx).view || 'see') !== 'see' ? ' Yours was ' + mine.name + ': ' + mine.text : '');
    },
    onUndo: function (ctx) { ctx.clearFx('arrow'); }
  };
  H.catalogue = DB;
  CM.defineHooks('g2_drawback', H);
})();
