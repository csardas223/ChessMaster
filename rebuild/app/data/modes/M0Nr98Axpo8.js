/* Can I BEAT Chess Ultimate?  First Chess Ultimate episode: every character tutorial (Checker, Giant squid, Pawn,
   Turtle, Copycat, Knight, Rover, Mage, Jester, Sludge, Rook, Sniper, Berserker, Ghost, Penguin, Parasite, Devil,
   Queen Bee, Bomb, Prince, Ninja, Angel), then 100-point teams vs the very easy and the hard CPU. Sources:
   research/modes/M0Nr98Axpo8.json (character list and costs; casual lineup limited to characters up to the Queen),
   frames visual (grey stone tiles #ACB0B0/#878B8C on a floating grassy island). Character rules are the shared
   group-4 library js/modes/g4_cu.js (used read-only). PASS 1: one representative draft per side (exact drafts not
   legible); the hard CPU is the search bot.    Pass 2 (impl-5, 7th session): character art = group 4's cut of the game's own sprites (assets/modes/CxtttdnwNWk/cu/). */
/* g5 2026-11-25 (pass 2, transcript of M0Nr98Axpo8): a Chess Ultimate menu bar above the board, as the video plays it:
   - Character tutorials: one per character in the video's order (Checker ... Queen Bee). Each puts that character and your
     King on the board with a few enemy Checkers it can take (squares picked from the character's own capture moves; the
     enemy stands still); take them all to finish. Layouts inferred (the game's tutorial boards are not legible). Sludge
     has no tutorial here: it never captures, and its goop needs a moving enemy.
   - Draft: your 100-point casual army ("100 points to work with"), tap a slot then a character; the King is always in
     and can be moved to another slot. Roster limited to characters up to the Queen Bee, costs from the video's roster.
   - CPU: Very easy (picks a random legal move, but always takes a king left en prise) or Hard (the search bot).
   Rule logic stays in the shared group-4 library js/modes/g4_cu.js (extended here, not edited). */
(function () {
  var S = { cpu: 'hard', team: null, tut: -1 };
  var ROSTER = ['Checker', 'Giant', 'P', 'Turtle', 'Copycat', 'N', 'B', 'Mage', 'Jester', 'Sludge', 'R', 'Sniper', 'Berserker', 'Ghost', 'Penguin', 'Parasite', 'Devil', 'Q'];
  var TUT = ROSTER.filter(function (t) { return t !== 'Sludge'; });
  var BLACK = 'r[ghost]bkq[penguin]n[sludge]/[checker][checker][checker][checker][checker][checker][checker][checker]';
  var PRESET = ['Mage', 'N', 'B', 'K', 'Q', 'Sniper', 'N', 'R', 'Checker', 'Checker', 'Checker', 'Checker', 'Checker', 'Checker', 'Checker', 'Checker'];   /* a1..h1 then a2..h2 */
  function cost(ctx, t) { var c = (ctx.spec.params.cost || {})[t]; return t === 'K' ? 0 : c || 0; }
  function tok(t) { return t.length === 1 ? t : '[' + t + ']'; }
  function row(list) { var o = '', e = 0; list.forEach(function (t) { if (!t) { e++; return; } if (e) { o += e; e = 0; } o += tok(t); }); if (e) o += e; return o; }
  function nm(ctx, t) { var d = ctx.spec.pieces[t]; return d ? d.name.replace(/ \(.*\)/, '') : t; }
  function img(ctx, t) { var d = ctx.spec.pieces[t]; return d && d.img ? d.img.w : ''; }
  function base() { return CM.hooks.g4_cu || {}; }
  function css() {
    if (document.getElementById('g5cu-css')) return;
    var s = document.createElement('style'); s.id = 'g5cu-css';
    s.textContent = '.g5cu-bar{display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin:2px 0 4px}.g5cu-bar button{padding:5px 9px!important;font-size:12px!important}' +
      '.g5cu-bar button,.g5cu-dlg button{border:0;border-radius:6px;background:#3d3a37;color:#fff;font:600 13px/1.1 system-ui,sans-serif;padding:7px 10px;cursor:pointer}' +
      '.g5cu-bar button.on{background:#81b64c;color:#111}' +
      '.g5cu-dlg{position:fixed;inset:0;z-index:120;background:rgba(18,30,14,.9);overflow:auto;padding:14px 10px;font:500 13px system-ui,sans-serif;color:#fff;animation:g5cuf .22s ease-out}' +
      '@keyframes g5cuf{from{opacity:0}to{opacity:1}}.g5cu-dlg h3{margin:4px 0 8px;text-align:center;font-size:17px;color:#ffd23f}' +
      '.g5cu-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:3px;max-width:420px;margin:0 auto 10px}' +
      '.g5cu-grid div{aspect-ratio:1;background:#878b8c;border-radius:4px;display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer}' +
      '.g5cu-grid div:nth-child(odd){background:#acb0b0}.g5cu-grid div.sel{outline:3px solid #ffd23f;outline-offset:-3px}' +
      '.g5cu-grid img,.g5cu-ros img{width:88%;height:88%;object-fit:contain;pointer-events:none}' +
      '.g5cu-ros{display:grid;grid-template-columns:repeat(auto-fill,minmax(66px,1fr));gap:5px;max-width:440px;margin:0 auto}' +
      '.g5cu-ros button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px;background:#2c4a24}' +
      '.g5cu-ros button img{width:40px;height:40px}.g5cu-ros button[disabled]{opacity:.35}.g5cu-row{display:flex;gap:6px;justify-content:center;margin:10px 0}' +
      '.g5cu-row .go{background:#81b64c;color:#111}';
    document.head.appendChild(s);
  }
  function dlg(html) { var o = document.querySelector('.g5cu-dlg'); if (o) o.remove(); var el = document.createElement('div'); el.className = 'g5cu-dlg'; el.setAttribute('role', 'dialog'); el.innerHTML = html; document.body.appendChild(el); return el; }
  function closeDlg() { var o = document.querySelector('.g5cu-dlg'); if (o) o.remove(); }
  function bar(ctx) {
    css(); var old = document.querySelector('.g5cu-bar'); if (old) old.remove();
    var area = document.getElementById('board-area'); if (!area || !area.parentNode) return;
    var el = document.createElement('div'); el.className = 'g5cu-bar';
    el.innerHTML = '<button type="button" data-a="tut">Tutorials</button><button type="button" data-a="draft">Draft (100 pts)</button>' +
      '<button type="button" data-a="cpu">CPU: ' + (S.cpu === 'easy' ? 'Very easy' : 'Hard') + '</button>';
    el.onclick = function (e) {
      var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a;
      if (a === 'tut') tutorials(ctx); else if (a === 'draft') draft(ctx);
      else { S.cpu = S.tut >= 0 ? S.cpu : S.cpu === 'easy' ? 'hard' : 'easy'; S.tut = -1; ctx.game.newGame(); }   /* from a tutorial: back to the match */
    };
    area.parentNode.insertBefore(el, area);
  }
  function tutorials(ctx) {
    var el = dlg('<h3>Character tutorials</h3><div class="g5cu-ros">' + TUT.map(function (t, k) { return '<button type="button" data-k="' + k + '"><img alt="" src="' + img(ctx, t) + '">' + nm(ctx, t) + '</button>'; }).join('') + '</div><div class="g5cu-row"><button type="button" data-x="1">Close</button></div>');
    el.onclick = function (e) { var b = e.target.closest('button'); if (!b) return; closeDlg(); if (b.dataset.k != null) { S.tut = +b.dataset.k; ctx.game.newGame(); } };
  }
  function draft(ctx) {
    var team = (S.team || PRESET).slice(), sel = -1;
    function total() { return team.reduce(function (a, t) { return a + (t ? cost(ctx, t) : 0); }, 0); }
    function draw() {
      var tot = total(), html = '<h3>Draft your army: ' + tot + ' / 100 points</h3><div class="g5cu-grid">';
      for (var r = 1; r >= 0; r--) for (var c = 0; c < 8; c++) { var k = r * 8 + c, t = team[k]; html += '<div data-s="' + k + '" class="' + (k === sel ? 'sel' : '') + '">' + (t ? '<img alt="' + nm(ctx, t) + '" src="' + img(ctx, t) + '">' : '') + '</div>'; }
      html += '</div><div style="text-align:center;margin-bottom:6px">' + (sel < 0 ? 'Tap a square of your two back rows.' : team[sel] === 'K' ? 'King selected: tap another square to move him.' : 'Pick a character for this square (or Clear).') + '</div><div class="g5cu-ros">';
      ROSTER.forEach(function (t) { var left = 100 - tot + (sel >= 0 && team[sel] ? cost(ctx, team[sel]) : 0); html += '<button type="button" data-t="' + t + '"' + (sel < 0 || team[sel] === 'K' || cost(ctx, t) > left ? ' disabled' : '') + '><img alt="" src="' + img(ctx, t) + '">' + nm(ctx, t) + ' · ' + cost(ctx, t) + '</button>'; });
      html += '</div><div class="g5cu-row"><button type="button" data-x="clear">Clear square</button><button type="button" data-x="preset">Preset</button><button type="button" data-x="close">Cancel</button><button type="button" class="go" data-x="go"' + (tot > 100 ? ' disabled' : '') + '>Fight!</button></div>';
      el.innerHTML = html;
    }
    var el = dlg('');
    el.onclick = function (e) {
      var s = e.target.closest('[data-s]'), t = e.target.closest('[data-t]'), x = e.target.closest('[data-x]');
      if (s) { var k = +s.dataset.s; if (sel >= 0 && team[sel] === 'K' && k !== sel) { var tmp = team[k]; team[k] = 'K'; team[sel] = tmp; sel = k; } else sel = k; }
      else if (t && !t.disabled && sel >= 0 && team[sel] !== 'K') team[sel] = t.dataset.t;
      else if (x) {
        var a = x.dataset.x;
        if (a === 'clear' && sel >= 0 && team[sel] !== 'K') team[sel] = null;
        else if (a === 'preset') team = PRESET.slice();
        else if (a === 'close') return closeDlg();
        else if (a === 'go' && total() <= 100) { S.team = team; S.tut = -1; closeDlg(); ctx.game.newGame(); return; }
      }
      draw();
    };
    draw();
  }
  /* tutorial board: your King a1, enemy King h8 (it never moves), the character on d4 (pawn-likes on d2), up to 3 enemy
     Checkers on squares the character can capture from where it stands */
  function tutorial(ctx) {
    var V = ctx.V, g = V.geo, t = TUT[S.tut], st = ctx.state, b = st.b.map(function () { return null; });
    var home = g.parse(t === 'P' || t === 'Checker' ? 'd2' : 'd4');
    b[g.parse('a1')] = { t: 'K', c: 'w', m: 1 }; b[g.parse('h8')] = { t: 'K', c: 'b', m: 1 }; b[home] = { t: t, c: 'w' };
    if (t === 'Giant') CM.g4cuGiant.expand(V, b);   /* cu2: the 2x2 squid, as in the game's tutorial (1:01) */
    if (t === 'Copycat') b[g.parse('e3')] = { t: 'Copycat', c: 'w' };   /* the Copycat comes as a pair */
    var cand = [];
    for (var j = 0; j < b.length; j++) {
      if (b[j] || g.dist(j, home) < 1) continue;
      var tb = b.slice(); tb[j] = { t: 'Checker', c: 'b', m: 1 };
      var ts = Object.assign({}, st, { b: tb, turn: 'w', x: Object.assign({}, st.x, { tut: 1 }) });
      if (V.legal(ts).some(function (m) { return m.f === home && m.cap && (m.capSq != null ? m.capSq : m.t) === j; })) cand.push(j);
    }
    var pick = cand.length <= 3 ? cand : [cand[0], cand[Math.floor(cand.length / 2)], cand[cand.length - 1]];
    pick.forEach(function (j) { b[j] = { t: 'Checker', c: 'b', m: 1 }; });
    st.b = b; st.turn = 'w'; st.x = Object.assign({}, st.x, { tut: 1 });
    st.start = { wRoyal: true, bRoyal: true };
  }
CM.mode({
  id: 'M0Nr98Axpo8',
  title: 'Can I BEAT Chess Ultimate?',
  name: 'Chess Ultimate vs CPU',
  category: 'Variants & Games',
  description: 'Casual match vs the Hard CPU with 100-point teams of Chess Ultimate characters (lineup limited to characters up to the Queen Bee). Every character keeps its ability: Checkers jump-capture, the Mage swaps with an ally, the Sniper shoots straight ahead, the Penguin freezes neighbours, the Ghost is invisible, and so on. Tap a piece to see where it can go.',
  how_to_win: 'Checkmate the enemy King (an enemy Jester looks exactly like a King).',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'CPU (Hard)', rating: null, tagline: 'Chess Ultimate CPU bot (very easy, then hard).' },
  board: { files: 8, ranks: 8, light: "#ACB0B0", dark: "#878B8C" },
  theme: { background: '#5f9e4a' },
  pieces: {
    K: { name: 'King', moves: 'K', royal: true, castle: false, value: 0, img: { w: 'assets/modes/CxtttdnwNWk/cu/King_w.png', b: 'assets/modes/CxtttdnwNWk/cu/King_b.png' } },
    P: { name: 'Pawn', moves: 'fmWfcFifmnD', pawn: true, promote: true, enPassant: true, value: 100, img: { w: 'assets/modes/CxtttdnwNWk/cu/Pawn_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Pawn_b.png' } },
    N: { name: 'Knight', moves: 'N', value: 320, img: { w: 'assets/modes/CxtttdnwNWk/cu/Knight_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Knight_b.png' } },
    B: { name: 'Bishop (Rover)', moves: 'B', value: 330, img: { w: 'assets/modes/CxtttdnwNWk/cu/Rover_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Rover_b.png' } },
    R: { name: 'Rook (Rock)', moves: 'R', value: 500, img: { w: 'assets/modes/CxtttdnwNWk/cu/Rock_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Rock_b.png' } },
    Q: { name: 'Queen (Queen Bee)', moves: 'Q', value: 900, img: { w: 'assets/modes/CxtttdnwNWk/cu/QueenBee_w.png', b: 'assets/modes/CxtttdnwNWk/cu/QueenBee_b.png' } },
    Checker: { name: 'Checker', moves: '', gen: 'cuChecker', value: 90, promote: true, promoteTo: ['CheckerKing'], promoteZone: 1, img: { w: 'assets/modes/CxtttdnwNWk/cu/Checker_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Checker_b.png' } },
    CheckerKing: { name: 'Checker King', moves: '', gen: 'cuChecker', value: 200, img: { w: 'assets/modes/CxtttdnwNWk/cu/Checker_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Checker_b.png' } },
    Turtle: { name: 'Turtle', moves: 'W', value: 150, img: { w: 'assets/modes/CxtttdnwNWk/cu/Turtle_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Turtle_b.png' } },
    Copycat: { name: 'Copycat', moves: 'K', value: 220, img: { w: 'assets/modes/CxtttdnwNWk/cu/Copycat_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Copycat_b.png' } },
    Mage: { name: 'Mage', moves: '', gen: 'cuMage', value: 260, img: { w: 'assets/modes/CxtttdnwNWk/cu/Mage_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Mage_b.png' } },
    Fisherman: { name: 'Fisherman', moves: '', gen: 'cuFisherman', value: 260, img: { w: 'assets/modes/CxtttdnwNWk/cu/Fisherman_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Fisherman_b.png' } },
    Jester: { name: 'Jester', moves: 'K', value: 300, img: { w: 'assets/modes/CxtttdnwNWk/cu/King_w.png', b: 'assets/modes/CxtttdnwNWk/cu/King_b.png' } },
    Sludge: { name: 'Sludge', moves: 'mW2', value: 320, img: { w: 'assets/modes/CxtttdnwNWk/cu/Sludge_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Sludge_b.png' } },
    Berserker: { name: 'Berserker', moves: '', gen: 'cuBerserker', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Berserker_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Berserker_b.png' } },
    Ghost: { name: 'Ghost', moves: 'K', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Ghost_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Ghost_b.png' } },
    Penguin: { name: 'Penguin', moves: 'K', value: 400, img: { w: 'assets/modes/CxtttdnwNWk/cu/Penguin_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Penguin_b.png' } },
    Parasite: { name: 'Parasite', moves: 'K', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Parasite_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Parasite_b.png' } },
    Devil: { name: 'Devil', moves: '', gen: 'cuDevil', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Devil_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Devil_b.png' } },
    Minion: { name: 'Minion', moves: 'K', value: 120, img: { w: 'assets/modes/CxtttdnwNWk/cu/Minion_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Minion_b.png' } },
    Dragon: { name: 'Dragon', moves: 'BN', value: 800, img: { w: 'assets/modes/CxtttdnwNWk/cu/Dragon_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Dragon_b.png' } },
    Sniper: { name: 'Sniper', moves: '', gen: 'cuSniper', value: 520, img: { w: 'assets/modes/CxtttdnwNWk/cu/Sniper_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Sniper_b.png' } },
    Bomb: { name: 'Bomb', moves: 'W2F2', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Bomb_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Bomb_b.png' } },
    Prince: { name: 'Prince', moves: 'K', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Prince_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Prince_b.png' } },
    Ninja: { name: 'Ninja', moves: 'WDHFAG', value: 850, img: { w: 'assets/modes/CxtttdnwNWk/cu/Ninja_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Ninja_b.png' } },
    Angel: { name: 'Angel', moves: '', gen: 'cuAngel', value: 700, img: { w: 'assets/modes/CxtttdnwNWk/cu/Angel_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Angel_b.png' } },
    Giant: { name: 'Giant (Squid)', moves: '', gen: 'cuGiant', value: 600, img: { w: 'assets/modes/CxtttdnwNWk/cu/Giant_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Giant_b.png' } }
  },
  setup: { fen: 'r[ghost]bkq[penguin]n[sludge]/[checker][checker][checker][checker][checker][checker][checker][checker]/8/8/8/8/[Checker][Checker][Checker][Checker][Checker][Checker][Checker][Checker]/[Mage]NBKQ[Sniper]NR' },
  rules: { castling: false, enPassant: true, promotion: { choices: ['Q'], auto: 'Q' }, stalemate: 'draw' },
  bot: { engine: 'search', depth: 2, time_ms: 600, min_ms: 300 },
  clock: null,
  params: { cost: {"Checker": 1, "CheckerKing": 1, "P": 2, "Turtle": 4, "Copycat": 5, "N": 6, "Mage": 8, "Fisherman": 8, "B": 9, "Jester": 10, "Sludge": 12, "R": 13, "Berserker": 15, "Ghost": 15, "Penguin": 15, "Parasite": 15, "Devil": 15, "Minion": 0, "Dragon": 16, "Q": 17, "Sniper": 17, "Bomb": 18, "Prince": 18, "Ninja": 30, "Angel": 40, "Giant": 20} },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/M0Nr98Axpo8/ninja.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  vfx_timeline: [
    { trigger: 'game_start', effect: { type: 'overlay', html: '<div style="display:flex;height:100%;align-items:center;justify-content:center;font:900 64px/1 Impact,Arial Black,sans-serif;color:#ffd23f;-webkit-text-stroke:3px #4a2c0c;text-shadow:0 5px 0 #4a2c0c">VS</div>', duration_ms: 1100, fade_ms: 250 } },
    { trigger: 'game_over', effect: { type: 'overlay', image: 'assets/modes/CxtttdnwNWk/cu/checkmate.png', fit: 'contain', duration_ms: 1800, fade_ms: 250 } }
  ],
  hooks: {
    extends: 'g4_cu',
    setup: function (ctx) {
      if (S.tut >= 0) return tutorial(ctx);
      if (S.team) {
        var st = ctx.state, V = ctx.V, fen = BLACK + '/8/8/8/8/' + row(S.team.slice(8, 16)) + '/' + row(S.team.slice(0, 8));
        st.b = CM.spec.parseSetup(V, fen); st.turn = 'w';
        st.b.forEach(function (p, i) { if (p && V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) st.b[i] = Object.assign({}, p, { m: 1 }); });
        st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
        CM.g4cuGiant.expand(V, st.b);   /* cu2: Giants grow into their 2x2 block */
      }
    },
    onStart: function (ctx) {
      CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'cu'); }).catch(function (e) { console.warn(e); });   /* ov-3d: real-3D view (js/fx/view3d.js) */
      bar(ctx);
      if (S.tut >= 0) { var t = TUT[S.tut]; ctx.toast('Tutorial ' + (S.tut + 1) + '/' + TUT.length + ': ' + ctx.spec.pieces[t].name + '. Take every enemy Checker.', 3600); ctx.setOpponent({ name: 'Tutorial', rating: null }); }
      else ctx.setOpponent({ name: S.cpu === 'easy' ? 'CPU (Very easy)' : 'CPU (Hard)', rating: null });
    },
    onExit: function () { if (CM.view3d) CM.view3d.detach(); closeDlg(); var o = document.querySelector('.g5cu-bar'); if (o) o.remove(); },
    moves: function (V, st, out) {
      var o = base().moves ? base().moves(V, st, out) || out : out;
      if (st.x && st.x.tut && st.turn === 'b') { for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'b' && p.t === 'K') return [{ f: i, t: i, p: p.t, c: p.c, cap: null, pass: 1 }]; } }
      return o;
    },
    checkWin: function (V, st) {
      if (!st.x || !st.x.tut) return null;
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'b' && p.t !== 'K') return null; }
      return { w: 'w', why: 'tutorial complete' };
    },
    botPick: function (ctx, ranked) {
      if (S.tut >= 0 || S.cpu !== 'easy' || !ranked.length) return null;
      return ranked[ctx.random(ranked.length)];   /* very easy: any legal move */
    },
    onGameOver: function (ctx, over) {
      if (S.tut >= 0 && over.w === ctx.human) { S.tut = S.tut < TUT.length - 1 ? S.tut + 1 : -1; ctx.toast(S.tut >= 0 ? 'Tutorial done! New game starts: ' + ctx.spec.pieces[TUT[S.tut]].name + '.' : 'All tutorials done! New game: casual match.', 3200); }
    }
  },
  source: { research: 'research/modes/M0Nr98Axpo8.json', confidence: 'medium', notes: 'CPU draft invented within the 100-point casual budget (97); your preset 84. Tutorial layouts inferred.' }
});
})();
