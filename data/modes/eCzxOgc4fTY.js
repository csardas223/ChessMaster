/* Can I BEAT Duolingo Chess?  duo remake (owner 2026-11-26 6:22 PM "Duolingo isn't accurate in art or animation").
   Sources: full transcript of eCzxOgc4fTY (analyze_video 2026-11-26), research/modes/eCzxOgc4fTY.json, the video stills.
   What the video shows, in order, and what this mode does with it:
   - 0:44 placement "Based on your Elo rating, you should start at section four" -> the course opens on a lesson path
     (SECTION 4 header, path of round lesson buttons, the coach beside the path).
   - 0:50-2:16 "checkmate practice", one short lesson: Qxf7 mate (1:07 "obvious checkmate here on F7"), back-rank mates
     (1:13, 2:04, 2:12), one mate in 2 "on the side of the board" where "your queen can seal the deal" (1:20-1:25), a queen
     contact mate on g7 "supported by the knight" (1:51), Qh7 mate (1:59). Lesson UI: progress bar, hearts, the coach's
     speech bubble over the board, green "correct" / red "wrong" footer with a big CONTINUE button.
   - 2:16 result screen "100%, 1 minute 35" (accuracy + time), 2:22 "you jumped ahead to section four", 2:28 one-day streak.
   - 3:12 "Oscar in front of a 4x4 board. Play chess: 20-minute matches with Oscar" -> the Play chess card on the path.
     Matches as before: 20-minute games whose strength moves game to game like the video's three games (params.elo.starts),
     the coach's lines from the video in a speech bubble.
   ART: everything here is original and drawn for this project (tools/duo_art.py, CC0): a flat chunky piece set, a purple
   rook-tower coach (NOT a copy of any app's mascot or of Oscar's design; the name Oscar is kept because the video's
   opponent is called that), the lesson UI in plain CSS. No art files from the app or the video are used.
   INFERRED: exact puzzle positions (rebuilt from the transcript's descriptions, all verified mates), board colours,
   unit number, hearts count (5), XP values, Oscar's Elo per game (1800 / 450 / 1100). Not built: placement quiz, ads,
   notification/streak-goal prompts (the video skips them). */
(function () {
  'use strict';
  var ID = 'eCzxOgc4fTY', A = 'assets/modes/' + ID + '/';
  var COACH = { idle: A + 'coach_idle.svg', happy: A + 'coach_happy.svg', sad: A + 'coach_sad.svg' };
  /* the lesson: 7 puzzles in the video's order (sol = first player move; n = mate in n) */
  var LESSON = [
    { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR', sol: 'h5f7', n: 1, say: "Let's kick things off with some good old checkmates!" },
    { fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1', sol: 'a1a8', n: 1, say: 'Try to finish the game by trapping my king.' },
    { fen: '7k/4r1pp/8/8/8/6R1/6PP/2Q3K1', sol: 'c1c8', n: 2, say: 'Your queen can seal the deal.' },
    { fen: '6k1/5p1p/6p1/5N2/3Q4/8/5PPP/6K1', sol: 'd4g7', n: 1, say: 'A little bit of this, a little bit of that.' },
    { fen: '5rk1/5pp1/8/7Q/8/3B4/5PPP/6K1', sol: 'h5h7', n: 1, say: 'You know your chess!' },
    { fen: '4r1k1/5ppp/8/8/8/8/4QPPP/4R1K1', sol: 'e2e8', n: 1, say: 'Give these a shot.' },
    { fen: '2r3k1/5ppp/8/8/8/8/5PPP/2R3K1', sol: 'c1c8', n: 1, say: 'Give these a shot.' }
  ];
  var LINES = {
    start: ["I'll go easy on you.", "Let's kick things off!", 'Ready for a rematch?'],
    takePawn: ["Some pawns aren't built to last."],
    recapture: ['Equal and opposite reaction.'],
    takeQueen: ['Bye-bye!'],
    lostKnight: ['You took my pony!'],
    win: ['You know your chess... but not today.'],
    lose: ['You know your chess!']
  };
  var GOOD = ['Excellent!', 'Nice job!', 'Great work!', 'Amazing!', 'Correct!'];
  var KEY = 'cm.duo.' + ID;
  function loadProg() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function saveProg(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* private mode */ } }
  /* run state survives New game / puzzle reloads (the mode file loads once per page) */
  var R = { view: 'path', k: 0, hearts: 5, t0: 0, firstTry: 0, missed: false, prog: loadProg(), said: 0 };
  var reduce = function () { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function $(id) { return document.getElementById(id); }
  function css() {
    if ($('duo-css')) return;
    var l = document.createElement('link'); l.id = 'duo-css'; l.rel = 'stylesheet'; l.href = A + 'duo.css'; document.head.appendChild(l);
  }
  function clearUI() {
    ['duo-path', 'duo-head', 'duo-foot', 'duo-done', 'duo-say', 'duo-course'].forEach(function (i) { var e = $(i); if (e) e.remove(); });
    document.body.classList.remove('duo-lesson', 'duo-pathon', 'duo-match');
  }
  function base(self, name, args) { return self._base && self._base[name] ? self._base[name].apply(self, args) : undefined; }
  function sfx(ctx, n) { try { ctx.sound(n); } catch (e) { /* no sound */ } }

  /* ---------------- the course path ---------------- */
  function showPath(ctx, popDone) {
    clearUI(); document.body.classList.add('duo-pathon');
    var done = !!R.prog.lesson1, root = el('div', 'duo-path'); root.id = 'duo-path';
    root.innerHTML =
      '<div class="duo-stats"><button type="button" class="duo-x duo-back" aria-label="Back to lobby">' +
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<span class="duo-chip duo-chip--course" title="Chess course"><i class="duo-kingtile"></i></span>' +
      '<span class="duo-chip duo-chip--streak"><i class="duo-ic duo-ic--flame"></i>' + (R.prog.streak || 0) + '</span>' +
      '<span class="duo-chip duo-chip--gem"><i class="duo-ic duo-ic--gem"></i>' + (R.prog.xp || 0) + '</span>' +
      '<span class="duo-chip duo-chip--heart"><i class="duo-ic duo-ic--heart"></i>5</span></div>' +
      '<div class="duo-unit"><div><small>SECTION 4, UNIT 1</small><b>Checkmate practice</b></div><i class="duo-unit__book" aria-hidden="true"></i></div>' +
      '<div class="duo-track">' +
      '<div class="duo-node-wrap" style="--x:0px"><span class="duo-start"' + (done ? ' hidden' : '') + '>START</span>' +
      '<button type="button" class="duo-node ' + (done ? 'is-done' : 'is-cur') + (popDone ? ' pop-done' : '') + '" id="duo-n1" aria-label="Lesson: Checkmate practice' + (done ? ' (complete)' : '') + '"><i class="duo-ic duo-ic--' + (done ? 'check' : 'star') + '"></i></button></div>' +
      '<div class="duo-node-wrap" style="--x:-54px"><button type="button" class="duo-node ' + (done ? 'is-cur' : 'is-lock') + '" id="duo-n2" aria-label="Play chess: 20-minute matches with Oscar"><i class="duo-ic duo-ic--board"></i></button>' +
      (done ? '<span class="duo-start duo-start--side">PLAY</span>' : '') + '</div>' +
      '<div class="duo-node-wrap" style="--x:-20px"><span class="duo-node is-lock is-chest" aria-hidden="true"><i class="duo-ic duo-ic--chest"></i></span></div>' +
      '<img class="duo-coach duo-coach--path" src="' + COACH.idle + '" alt="">' +
      '</div>' +
      '<div class="duo-playcard"><div class="duo-mini"><img src="' + COACH.idle + '" alt=""><i class="duo-4x4"></i></div>' +
      '<div class="duo-playcard__t"><b>Play chess</b><span>20-minute matches with Oscar</span></div>' +
      '<button type="button" class="duo-btn duo-btn--blue" id="duo-play">PLAY</button></div>';
    $('view-game').appendChild(root);
    root.querySelector('.duo-back').onclick = function () { var b = $('back'); if (b) b.click(); };
    $('duo-n1').onclick = function () { startLesson(ctx); };
    var play = function () { startMatch(ctx); };
    $('duo-n2').onclick = function () { if (!done) { ctx.toast('Finish Checkmate practice first, or tap PLAY below.', 2000); return; } play(); };
    $('duo-play').onclick = play;
  }

  /* ---------------- lesson ---------------- */
  function startLesson(ctx) {
    R.view = 'lesson'; R.k = 0; R.hearts = 5; R.firstTry = 0; R.missed = false; R.t0 = Date.now();
    clearUI(); ctx.game.newGame();
  }
  function lessonChrome(ctx) {
    clearUI(); document.body.classList.add('duo-lesson');
    var pz = LESSON[R.k], head = el('div', 'duo-head'); head.id = 'duo-head';
    var pct = Math.round(R.k / LESSON.length * 100);
    head.innerHTML =
      '<div class="duo-bar"><button type="button" class="duo-x" id="duo-quit" aria-label="Quit lesson">' +
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<div class="duo-prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + Math.max(pct, 4) + '%"></i></div>' +
      '<span class="duo-hearts" id="duo-hearts"><i class="duo-ic duo-ic--heart"></i><b>' + R.hearts + '</b></span></div>' +
      '<h2 class="duo-title">Checkmate in ' + pz.n + '</h2>' +
      '<div class="duo-talk"><img class="duo-coach duo-coach--talk" id="duo-coach" src="' + COACH.idle + '" alt="Oscar">' +
      '<p class="duo-bubble" id="duo-bubble">' + pz.say + '</p></div>';
    var col = $('board-col'); col.insertBefore(head, $('board-area'));
    var foot = el('div', 'duo-foot'); foot.id = 'duo-foot';
    foot.innerHTML = '<div class="duo-foot__msg" id="duo-msg"></div><button type="button" class="duo-btn duo-btn--skip" id="duo-cta">SKIP</button>';
    $('view-game').appendChild(foot);
    $('duo-quit').onclick = function () { R.view = 'path'; clearUI(); ctx.game.newGame(); };
    /* SKIP: no heart lost, counts as a miss, shows the answer, then the next puzzle */
    $('duo-cta').onclick = function () {
      if (ctx.game.busy) return;
      ctx.game.holdBot = true; R.missed = true; coachMood('sad');
      feedback(false, 'Skipped', 'The answer starts ' + pz.sol.slice(0, 2) + ' \u2192 ' + pz.sol.slice(2) + '.', function () { setProg(R.k + 1); setTimeout(function () { nextPuzzle(ctx); }, 0); });
    };
    /* the bar fills to where this puzzle starts (animated from the previous width) */
    requestAnimationFrame(function () { var i = head.querySelector('.duo-prog i'); if (i) i.style.width = Math.max(pct, 4) + '%'; });
  }
  function setProg(n) { var i = document.querySelector('.duo-prog i'); if (i) i.style.width = Math.round(n / LESSON.length * 100) + '%'; }
  function coachMood(m) { var c = $('duo-coach'); if (!c) return; c.src = COACH[m]; c.classList.remove('is-happy', 'is-sad'); void c.offsetWidth; if (m !== 'idle') c.classList.add('is-' + m); }
  function feedback(ok, text, sub, onGo) {
    var f = $('duo-foot'), m = $('duo-msg'), b = $('duo-cta'); if (!f) return;
    f.classList.remove('is-ok', 'is-bad'); void f.offsetWidth; f.classList.add(ok ? 'is-ok' : 'is-bad');
    m.innerHTML = '<i class="duo-ic duo-ic--' + (ok ? 'tick' : 'cross') + '"></i><div><b>' + text + '</b>' + (sub ? '<span>' + sub + '</span>' : '') + '</div>';
    b.disabled = false; b.textContent = ok ? 'CONTINUE' : 'GOT IT'; b.className = 'duo-btn ' + (ok ? 'duo-btn--green' : 'duo-btn--red');
    b.onclick = function () { b.onclick = null; onGo(); }; b.focus();
  }
  function nextPuzzle(ctx) {
    R.k++;
    if (R.k >= LESSON.length) { lessonDone(ctx); return; }
    R.missed = false; ctx.game.newGame();
  }
  function wrong(ctx, sub) {
    R.hearts = Math.max(0, R.hearts - 1); R.missed = true;
    var h = $('duo-hearts'); if (h) { h.querySelector('b').textContent = R.hearts; h.classList.remove('is-hit'); void h.offsetWidth; h.classList.add('is-hit'); }
    var bw = $('board-wrap'); if (bw && !reduce()) { bw.classList.remove('duo-shake'); void bw.offsetWidth; bw.classList.add('duo-shake'); }
    coachMood('sad'); sfx(ctx, 'illegal');
    return new Promise(function (res) {
      feedback(false, R.hearts ? 'Not quite' : 'Out of hearts', R.hearts ? sub : 'Take a breath and try the lesson again.', function () {
        res();
        setTimeout(function () { if (R.hearts) ctx.game.newGame(); else startLesson(ctx); }, 0);
      });
    });
  }
  function lessonDone(ctx) {
    var secs = Math.round((Date.now() - R.t0) / 1000), acc = Math.round(R.firstTry / LESSON.length * 100), xp = 10 + (acc === 100 ? 5 : 0);
    var first = !R.prog.lesson1;
    R.prog.lesson1 = 1; R.prog.xp = (R.prog.xp || 0) + xp; R.prog.streak = Math.max(1, R.prog.streak || 0); saveProg(R.prog);
    clearUI(); document.body.classList.add('duo-pathon');
    var d = el('div', 'duo-done'); d.id = 'duo-done';
    var mm = Math.floor(secs / 60), ss = ('0' + secs % 60).slice(-2);
    d.innerHTML = '<img class="duo-coach duo-coach--done" src="' + COACH.happy + '" alt="">' +
      '<h2 class="duo-done__t">Lesson complete!</h2>' +
      '<p class="duo-done__s">' + (first ? 'Great job! You jumped ahead to Section 4.' : 'You know your chess!') + '</p>' +
      '<div class="duo-stat-row">' +
      '<div class="duo-stat duo-stat--xp"><small>TOTAL XP</small><b><i class="duo-ic duo-ic--bolt"></i><span data-to="' + xp + '">0</span></b></div>' +
      '<div class="duo-stat duo-stat--time"><small>' + (secs < 120 ? 'SPEEDY' : 'COMMITTED') + '</small><b><i class="duo-ic duo-ic--clock"></i>' + mm + ':' + ss + '</b></div>' +
      '<div class="duo-stat duo-stat--acc"><small>' + (acc === 100 ? 'AMAZING' : 'GOOD') + '</small><b><i class="duo-ic duo-ic--target"></i><span data-to="' + acc + '">0</span>%</b></div></div>' +
      '<button type="button" class="duo-btn duo-btn--green duo-done__go" id="duo-go">CONTINUE</button>';
    $('view-game').appendChild(d);
    sfx(ctx, 'game-end');
    /* count-up on the numbers (the result screen ticks up in the video) */
    [].forEach.call(d.querySelectorAll('[data-to]'), function (s) {
      var to = +s.getAttribute('data-to'), t0 = performance.now() + 500;
      if (reduce()) { s.textContent = to; return; }
      (function tick(now) { var k = Math.max(0, Math.min(1, (now - t0) / 700)); s.textContent = Math.round(to * k); if (k < 1 && document.body.contains(s)) requestAnimationFrame(tick); })(performance.now());
    });
    $('duo-go').onclick = function () { first ? streak(ctx) : back(ctx); };
  }
  function streak(ctx) {
    var d = $('duo-done'); if (!d) return back(ctx);
    d.className = 'duo-done duo-done--streak';
    d.innerHTML = '<div class="duo-flame" aria-hidden="true"><i></i></div><div class="duo-streak-n">' + R.prog.streak + '</div>' +
      '<h2 class="duo-done__t duo-done__t--orange">day streak</h2><p class="duo-done__s">Do a lesson every day to keep it going.</p>' +
      '<button type="button" class="duo-btn duo-btn--green duo-done__go" id="duo-go">CONTINUE</button>';
    $('duo-go').onclick = function () { back(ctx); };
  }
  function back(ctx) { R.view = 'path'; clearUI(); R._pop = true; ctx.game.newGame(); }

  /* ---------------- match vs the coach ---------------- */
  function startMatch(ctx) { R.view = 'match'; clearUI(); ctx.game.newGame(); }
  function say(ctx, k) {
    var a = LINES[k]; if (!a) return; R.said++;
    var t = a[R.said % a.length], top = $('card-top'); if (!top) return;
    var b = $('duo-say'); if (b) b.remove();
    b = el('div', 'duo-say'); b.id = 'duo-say'; b.textContent = t; b.setAttribute('role', 'status');
    top.appendChild(b);
    setTimeout(function () { if (b.parentNode) { b.classList.add('is-out'); setTimeout(function () { b.remove(); }, 300); } }, 2600);
  }

  CM.mode({
    id: ID,
    title: 'Can I BEAT Duolingo Chess?',
    name: 'Duolingo Chess: Oscar',
    category: 'Variants & Games',
    description: "Duolingo's chess course like in the video: start at Section 4 with the Checkmate practice lesson (7 mates, 5 hearts, progress bar, the coach's tips), then play 20-minute matches against Oscar. His strength changes from game to game like the video's three games: hard, then giving pieces away, then in between.",
    how_to_win: 'Finish the lesson with your hearts left, then checkmate Oscar.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
    opponent: { name: 'Oscar', rating: 1800, avatar: COACH.idle, tagline: 'Chess coach. 20-minute matches.' },
    board: { files: 8, ranks: 8, light: '#f4f4ec', dark: '#a5d86e' },
    theme: { light: '#f4f4ec', dark: '#a5d86e', background: '#ffffff' },
    pieces: (function () { var o = {}; 'PNBRQK'.split('').forEach(function (t) { o[t] = { img: { w: A + 'pieces/w' + t + '.svg', b: A + 'pieces/b' + t + '.svg' } }; }); return o; })(),
    clock: { w: 1200, b: 1200, inc: 0 },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    assets: { coach_happy: COACH.happy, coach_sad: COACH.sad },
    params: { elo: { starts: [1800, 450, 1100], max: 3600 } },
    hooks: {
      extends: 'g2_elofish',
      init: function (ctx) { css(); return base(this, 'init', arguments); },
      setup: function (ctx) {
        css();
        if (R.view === 'lesson') {
          var st = ctx.state, pz = LESSON[R.k];
          st.b = CM.spec.parseSetup(ctx.V, pz.fen); st.turn = 'w';
          return;
        }
        return base(this, 'setup', arguments);
      },
      onStart: function (ctx) {
        if (R.view === 'lesson') { lessonChrome(ctx); return; }
        if (R.view === 'path') { var p = R._pop; R._pop = false; showPath(ctx, p); return; }
        clearUI(); document.body.classList.add('duo-match');
        var cb = el('button', 'duo-btn duo-btn--skip duo-course', 'BACK TO COURSE'); cb.type = 'button'; cb.id = 'duo-course';
        cb.onclick = function () { R.view = 'path'; clearUI(); ctx.game.newGame(); };
        var stl = $('status'); if (stl && stl.parentNode) stl.parentNode.insertBefore(cb, stl.nextSibling);
        base(this, 'onStart', arguments);
        ctx.after(1400, function () { say(ctx, 'start'); });
      },
      beforeMove: function (ctx) { if (R.view === 'path') return false; return R.view === 'lesson' ? true : base(this, 'beforeMove', arguments) !== false; },
      afterMove: function (ctx, m, info) {
        if (R.view === 'lesson') {
          var pz = LESSON[R.k];
          if (info.by !== 'player') return;
          ctx.game.holdBot = true;
          var uci = ctx.name(info.from) + ctx.name(info.to);
          var firstMove = ctx.ply <= 1;
          var after = ctx.state, mated = after.turn !== ctx.human && !ctx.V.legal(after).length && ctx.V.inCheck(after, after.turn);
          if (mated) {
            if (!R.missed) R.firstTry++;
            setProg(R.k + 1); coachMood('happy'); sfx(ctx, 'game-end');
            return new Promise(function (res) { feedback(true, GOOD[R.k % GOOD.length], null, function () { res(); setTimeout(function () { nextPuzzle(ctx); }, 0); }); });
          }
          if (pz.n > 1 && firstMove && uci === pz.sol) {
            /* mate in 2: the coach answers (the reply is forced), then you finish it */
            ctx.game.holdBot = false; $('duo-bubble').textContent = 'Good start. Now finish it!';
            return;
          }
          return wrong(ctx, pz.n > 1 && firstMove ? 'Look for a check that leaves only one answer.' : 'That doesn\u2019t trap the king. Look at checks first.');
        }
        var r = base(this, 'afterMove', arguments);
        if (ctx.over) { say(ctx, ctx.over.w === ctx.human ? 'lose' : 'win'); return r; }
        var z = ctx.game._duo = ctx.game._duo || {};
        if (info.by === 'bot') {
          if (info.capture && info.captured === 'Q') say(ctx, 'takeQueen');
          else if (info.capture && z.lastPlayerCapTo === info.to) say(ctx, 'recapture');
          else if (info.capture && info.captured === 'P' && Math.random() < 0.5) say(ctx, 'takePawn');
        } else {
          z.lastPlayerCapTo = info.capture ? info.to : -1;
          if (info.capture && info.captured === 'N') say(ctx, 'lostKnight');
        }
        return r;
      },
      onGameOver: function (ctx) { if (R.view !== 'match') return true; return base(this, 'onGameOver', arguments); },
      status: function (ctx) { return R.view === 'match' ? base(this, 'status', arguments) : ''; },
      onExit: function () { clearUI(); R.view = 'path'; var l = $('duo-css'); if (l) l.remove(); }
    },
    source: { research: 'research/modes/eCzxOgc4fTY.json', confidence: 'medium', notes: 'duo remake: lesson path + Checkmate practice lesson + matches; original art (tools/duo_art.py). See header for what is inferred.' }
  });
})();
