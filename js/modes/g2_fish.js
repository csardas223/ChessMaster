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
   MirrorFish (pick 'mirror') also shows a chess.com-style review badge (Brilliant ... Blunder, Book) on the top-right
   corner of the square each move lands on, for your move and its mirrored reply. The badge is the same rank the fish
   copies (classify() below), art in assets/ui/move-quality (tools/art_move_badges.py, CC0). */
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
  /* ---- MirrorFish review badges (owner 2026-11-26: "show the move quality icon next to the piece like chess.com") ----
     The tier is the rank the fish mirrors (0 best, 1, 2, 3, 4 = "5th or worse"), so your badge and the fish's reply
     always sit in the same tier: #1 Best (Great when it was the only good move, Brilliant when it is also a sound
     piece sacrifice), #2 Excellent, #3 Good, #4 Inaccuracy, #5+ Mistake / Miss / Blunder by how many centipawns it
     dropped. Each side's first three moves in the top 3 are Book. v is centipawns from the mover's view. */
  var QLABEL = { brilliant: 'Brilliant', great: 'Great move', best: 'Best move', excellent: 'Excellent', good: 'Good', book: 'Book move',
    inaccuracy: 'Inaccuracy', mistake: 'Mistake', miss: 'Miss', blunder: 'Blunder' };
  function classify(V, st, L, idx, m) {
    var rk = Math.min(Math.max(idx, 0), 4), mine = L[Math.max(idx, 0)] || L[0], v0 = L[0].v, loss = v0 - mine.v;
    if (st.ply < 6 && rk <= 2) return 'book';
    if (rk === 0) {
      var d = V.def(m.p || '') || {}, cv = m.cap ? (V.def(m.cap.t) || {}).value || 0 : 0, n = m.n || V.make(st, m), opp = st.turn === 'w' ? 'b' : 'w';
      if (!m.promo && !d.royal && (d.value || 0) >= 300 && (d.value || 0) - cv >= 200 && mine.v >= -50 && L.length > 1 && V.attacked(n, m.t, opp)) return 'brilliant';
      if (L.length > 1 && v0 - L[1].v >= 150 && v0 > -300) return 'great';
      return 'best';
    }
    if (rk === 1) return 'excellent';
    if (rk === 2) return 'good';
    if (rk === 3) return 'inaccuracy';
    if (v0 >= 250 && loss >= 200 && mine.v >= -60) return 'miss';
    return loss >= 300 ? 'blunder' : 'mistake';
  }
  /* the badge waits for the slide to land: it pops in at `at` (performance.now() ms) */
  function setBadge(ctx, sq, kind, t0) {
    var ms = (CM.settings && CM.settings.animMs && CM.settings.animMs()) || 0;
    ctx.setX('qbadge', kind ? { sq: sq, k: kind, at: Math.max(performance.now(), t0 + ms + (ms ? 60 : 0)) } : null);   /* +60 ms: the board starts the slide on the render after this hook */
  }
  function badgeHtml(ctx, b, sq) {
    var g = ctx.geo, flip = ctx.game && ctx.game.flipped ? ctx.game.flipped() : false;
    var dr = flip ? g.ranks - 1 - g.row(sq) : g.row(sq), dc = flip ? g.files - 1 - g.col(sq) : g.col(sq);
    var cls = 'mq-badge' + (dr === 0 ? ' mq-badge--top' : '') + (dc === g.files - 1 ? ' mq-badge--right' : '');
    var delay = Math.round(b.at - performance.now());   /* re-renders rebuild the square: a negative delay resumes the pop where it was */
    return '<img class="' + cls + '" src="assets/ui/move-quality/' + b.k + '.svg" alt="' + QLABEL[b.k] + '" title="' + QLABEL[b.k] + '" draggable="false" style="animation-delay:' + delay + 'ms">';
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
    mirror: function (ctx, L) { var k = Math.min(ctx.x.mirrorK || 0, 4), i = Math.min(k, L.length - 1); ctx.game._mqPick = { st: ctx.state, L: L, i: i }; return L[i]; },   /* ranks 1-4, anything worse = 5th (iwantcheckmate.com MirrorFish) */
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
      var p = P(ctx), E = p.elo; if (!E || ctx.over) return;
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
        if (p.pick === 'mirror') {
          var mq = ctx.game._mqPick; ctx.game._mqPick = null;
          var kind = null; try { if (mq && mq.L.length && sameMove(mq.L[mq.i].m, m)) kind = classify(V, mq.st, mq.L, mq.i, m); } catch (e) { console.warn('mirror badge', e); }
          setBadge(ctx, m.t, kind, performance.now());
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
      var needRank = E.playerBest || E.playerNotBest || E.playerWorst || p.pick === 'mirror';
      var tMove = performance.now();
      if (p.pick === 'mirror') setBadge(ctx, -1, null, tMove);   /* the previous badge clears as soon as you move */
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
            if (p.pick === 'mirror') {
              var rk = idx < 0 ? 0 : idx; ctx.setX('mirrorK', rk);
              if (L.length) setBadge(ctx, m.t, classify(V, prev, L, rk, m), tMove);
              ctx.toast(rk === 0 ? 'You played the best move. MirrorFish will too.' : rk < 4 ? 'Your move ranked #' + (rk + 1) + '. MirrorFish will play its #' + (rk + 1) + '.' : 'Your move ranked #' + (rk + 1) + ' (worse than #4). MirrorFish will play its #5.', 1700);   /* ranks past 4 play the 5th, as in the mirror pick */
            }
          } catch (e) { console.warn('g2_fish quality check', e); }
          res();
        }, 30);
      });
    },
    botPick: null,
    /* pass 2: the video's magenta last-move squares (params.lastMoveTint) */
    /* MirrorFish: the review badge sits in the piece's attached layer (decorate takes p, so it rides with the slide and
       follows board flip); a tinted square with a badge keeps both on the square instead */
    decorate: function (ctx, sq, p) {
      var t = P(ctx).lastMoveTint, l = ctx.last, b = ctx.x && ctx.x.qbadge;
      var tint = t && l && (l.f === sq || l.t === sq) ? '<span class="sq-tint" style="background:' + t + '"></span>' : '';
      var badge = b && b.sq === sq && p ? badgeHtml(ctx, b, sq) : '';
      if (!tint && !badge) return null;
      if (tint) return { html: tint + badge, follow: false };
      return { html: badge };
    },
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
