/* Can I BEAT Chess Ultimate? (Ninja Method REFUTED)  Ranked Chess Ultimate after the Ninja method was refuted: ban
   phase in the draft, maps with black pit holes, SPAWN MINION / UNIQUE MOVE buttons, ~58 s turn timer. Sources:
   research/modes/I07GcHQtY2o.json, frames visual (grey stone tiles #ACB0B0/#878B8C, pits). Character rules are the
   shared group-4 library js/modes/g4_cu.js (used read-only). PASS 1: one representative ranked draft: you still run
   the Ninja, the opponent answers with Bomb, Penguin and a Sniper; two pits on the board. Pass 2 (impl-5, 7th session): character art = group 4's cut of the game's own
   sprites (assets/modes/CxtttdnwNWk/cu/), pits = a stone tile with its pit cut from the video (blocking squares). */
/* g5 2026-11-25 pass 2 (frames: BAN phase screen, roster pot Berserker..Ninja 15-30, army score '096', turn timer '58'):
   - Ranked draft with a BAN phase: before drafting, each side bans one character from the 15-30 pot (Berserker, Ghost,
     Penguin, Parasite, Devil, Queen Bee, Sniper, Bomb, Prince, Ninja); a banned character can't be drafted by either side
     (both-sides ban and the opponent's pick are inferred). Then you draft a 100-point army (the King is always in, tap a
     slot then a character; the King can be moved). A character of the opponent's lineup that got banned is swapped for
     a Knight.
   - 58 s per-turn timer (the video's '58'): each turn starts at 0:58 on the chess.com-style clock; when your time runs
     out a random legal move is played for you (Chess Ultimate never flags you; inferred from the game).
   - SPAWN MINION / UNIQUE MOVE buttons: selecting a character with an ability (Devil spawn, Mage swap, Sniper shot,
     Fisherman pull, Angel attach) shows the game's button under the board; pressing it highlights only the ability's
     target squares and restricts your next move to the ability (press again to cancel).
   Rule logic stays in js/modes/g4_cu.js (extended, not edited). */
(function () {
  var S = { team: null, ban: null, oppBan: null, uniq: false };
  var POT = ['Berserker', 'Ghost', 'Penguin', 'Parasite', 'Devil', 'Q', 'Sniper', 'Bomb', 'Prince', 'Ninja'];
  var ROSTER = ['Checker', 'P', 'Turtle', 'Copycat', 'N', 'Mage', 'Fisherman', 'B', 'Jester', 'Sludge', 'R', 'Berserker', 'Ghost', 'Penguin', 'Parasite', 'Devil', 'Q', 'Sniper', 'Bomb', 'Prince', 'Ninja'];
  var BLACK = ['R', 'Bomb', 'B', 'K', 'Sniper', 'Penguin', 'N', 'Turtle'];   /* opponent back row a8..h8, from the original lineup */
  var PRESET = ['Turtle', 'Mage', 'B', 'K', 'Ninja', 'Ghost', 'N', 'R', 'Checker', 'Checker', 'P', 'P', 'P', 'P', 'Checker', 'Checker'];
  var TURN = 58000;
  function cost(ctx, t) { return t === 'K' ? 0 : (ctx.spec.params.cost || {})[t] || 0; }
  function tok(t) { return t.length === 1 ? t : '[' + t + ']'; }
  function row(list, black) { var o = '', e = 0; list.forEach(function (t) { if (!t) { e++; return; } if (e) { o += e; e = 0; } var k = tok(t); o += black ? k.toLowerCase() : k; }); if (e) o += e; return o; }
  function nm(ctx, t) { var d = ctx.spec.pieces[t]; return d ? d.name.replace(/ \(.*\)/, '') : t; }
  function img(ctx, t) { var d = ctx.spec.pieces[t]; return d && d.img ? d.img.w : ''; }
  function base(ctx) { return ctx.hooks._base || CM.hooks.g4_cu || {}; }
  function banned(t) { return t === S.ban || t === S.oppBan; }
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
  function css2() {
    if (document.getElementById('g5cur-css')) return; var s = document.createElement('style'); s.id = 'g5cur-css';
    s.textContent = '.g5cu-ban{position:relative}.g5cu-ban::after{content:"";position:absolute;inset:6px;border:3px solid #e0392b;border-radius:50%;pointer-events:none}' +
      '.g5cu-ban::before{content:"";position:absolute;left:50%;top:6px;bottom:6px;width:3px;background:#e0392b;transform:rotate(45deg);pointer-events:none}' +
      '.g5cu-act{display:flex;gap:6px;justify-content:center;min-height:0;margin:4px 0 0}.g5cu-act:empty{display:none}' +
      '.g5cu-act button{border:0;border-radius:6px;background:#ffd23f;color:#3a2405;font:800 13px/1 system-ui,sans-serif;padding:8px 12px;letter-spacing:.03em;box-shadow:0 3px 0 #b8860b;cursor:pointer;transition:filter .12s ease-out}' +
      '.g5cu-act button.on{background:#81b64c;box-shadow:0 3px 0 #4e7a2a}.g5cu-act button:active{filter:brightness(.85)}';
    document.head.appendChild(s);
  }
  function bar(ctx) {
    css(); css2(); var old = document.querySelector('.g5cu-bar'); if (old) old.remove();
    var area = document.getElementById('board-area'); if (!area || !area.parentNode) return;
    var el = document.createElement('div'); el.className = 'g5cu-bar';
    el.innerHTML = '<button type="button" data-a="ban">Ranked: ban + draft</button>' + (S.ban ? '<button type="button" data-a="info">Bans: ' + nm(ctx, S.ban) + ' · ' + nm(ctx, S.oppBan) + '</button>' : '');
    el.onclick = function (e) { var b = e.target.closest('[data-a]'); if (b && b.dataset.a === 'ban') banPhase(ctx); };
    area.parentNode.insertBefore(el, area);
    var act = document.querySelector('.g5cu-act');
    if (!act) { act = document.createElement('div'); act.className = 'g5cu-act'; area.parentNode.insertBefore(act, area.nextSibling); }
  }
  function banPhase(ctx) {
    var el = dlg('<h3>BAN PHASE</h3><div style="text-align:center;margin-bottom:8px">Ban one character from the 15-30 pot. Banned characters can\'t be drafted by either side.</div><div class="g5cu-ros">' +
      POT.map(function (t) { return '<button type="button" data-t="' + t + '"><img alt="" src="' + img(ctx, t) + '">' + nm(ctx, t) + ' · ' + cost(ctx, t) + '</button>'; }).join('') +
      '</div><div class="g5cu-row"><button type="button" data-x="close">Cancel</button></div>');
    el.onclick = function (e) {
      var t = e.target.closest('[data-t]'), x = e.target.closest('[data-x]');
      if (x) return closeDlg();
      if (!t) return;
      S.ban = t.dataset.t;
      var left = POT.filter(function (k) { return k !== S.ban && k !== 'Ninja'; });   /* the opponent bans one of the rest (random, inferred) */
      S.oppBan = left[Math.floor(Math.random() * left.length)];
      t.classList.add('g5cu-ban'); var ob = el.querySelector('[data-t="' + S.oppBan + '"]'); if (ob) ob.classList.add('g5cu-ban');
      el.querySelector('div').textContent = 'You banned ' + nm(ctx, S.ban) + '. Opponent banned ' + nm(ctx, S.oppBan) + '.';
      el.onclick = null; setTimeout(function () { draft(ctx); }, 1100);
    };
  }
  function draft(ctx) {
    var team = (S.team || PRESET).map(function (t) { return t && banned(t) ? null : t; }), sel = -1;
    function total() { return team.reduce(function (a, t) { return a + (t ? cost(ctx, t) : 0); }, 0); }
    function draw() {
      var tot = total(), html = '<h3>Draft: ' + ('00' + tot).slice(-3) + ' / 100</h3><div class="g5cu-grid">';
      for (var r = 1; r >= 0; r--) for (var c = 0; c < 8; c++) { var k = r * 8 + c, t = team[k]; html += '<div data-s="' + k + '" class="' + (k === sel ? 'sel' : '') + '">' + (t ? '<img alt="' + nm(ctx, t) + '" src="' + img(ctx, t) + '">' : '') + '</div>'; }
      html += '</div><div style="text-align:center;margin-bottom:6px">' + (sel < 0 ? 'Tap a square of your two back rows.' : team[sel] === 'K' ? 'King selected: tap another square to move him.' : 'Pick a character for this square (or Clear).') + '</div><div class="g5cu-ros">';
      ROSTER.forEach(function (t) { var left = 100 - tot + (sel >= 0 && team[sel] ? cost(ctx, team[sel]) : 0), off = banned(t) || sel < 0 || team[sel] === 'K' || cost(ctx, t) > left; html += '<button type="button" data-t="' + t + '"' + (off ? ' disabled' : '') + (banned(t) ? ' class="g5cu-ban"' : '') + '><img alt="" src="' + img(ctx, t) + '">' + nm(ctx, t) + ' · ' + cost(ctx, t) + '</button>'; });
      html += '</div><div class="g5cu-row"><button type="button" data-x="clear">Clear square</button><button type="button" data-x="close">Cancel</button><button type="button" class="go" data-x="go"' + (tot > 100 ? ' disabled' : '') + '>Ready</button></div>';
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
        else if (a === 'close') return closeDlg();
        else if (a === 'go' && total() <= 100) { S.team = team; closeDlg(); ctx.game.newGame(); return; }
      }
      draw();
    };
    draw();
  }
  function uniqueOf(m) { return m.spawn ? 'SPAWN MINION' : (m.swap || m.stay || m.pull || m.attach) ? 'UNIQUE MOVE' : null; }
  function actions(ctx) {
    var act = document.querySelector('.g5cu-act'), G = ctx.game; if (!act || !G) return;
    var sel = G.sel, label = null, sq = [];
    if (sel >= 0 && !ctx.over && ctx.state.turn === ctx.human) (G.moves || []).forEach(function (m) { if (m.f === sel) { var u = uniqueOf(m); if (u) { label = u; sq.push(m.t); } } });
    if (!label) S.uniq = false;
    var html = label ? '<button type="button" class="' + (S.uniq ? 'on' : '') + '">' + label + '</button>' : '';
    if (act.innerHTML !== html) act.innerHTML = html;
    act.onclick = function (e) {
      if (!e.target.closest('button')) return; S.uniq = !S.uniq; act.innerHTML = '';
      if (S.uniq) ctx.fx({ type: 'highlight', squares: sq.map(function (i) { return ctx.name(i); }), color: 'rgba(255,210,63,.6)', duration_ms: 1400 });
      actions(ctx);
    };
  }
CM.mode({
  id: 'I07GcHQtY2o',
  title: 'Can I BEAT Chess Ultimate? (Ninja Method REFUTED)',
  name: 'Chess Ultimate: Ninja Refuted',
  category: 'Variants & Games',
  description: 'Ranked Chess Ultimate on a map with two pits (holes). You kept the Ninja (moves up to 3 squares in any line, passing through characters) but the opponent drafted counters: a Bomb that explodes when it captures or is captured, a Penguin that freezes its neighbours and a Sniper that shoots straight ahead.',
  how_to_win: 'Checkmate the enemy King (an enemy Jester looks exactly like a King).',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Ranked Opponent', rating: null, tagline: 'Online Chess Ultimate player who refuted the Ninja method.' },
  board: { files: 8, ranks: 8, light: "#ACB0B0", dark: "#878B8C", walls: ["c5", "f4"] },
  theme: { background: '#5f9e4a' },
  pieces: {
    '#': { name: 'Pit', overlay: null, img: 'assets/modes/I07GcHQtY2o/pit.png' },
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
  setup: { fen: 'r[bomb]bk[sniper][penguin]n[turtle]/[checker][checker]pppp[checker][checker]/8/8/8/8/[Checker][Checker]PPPP[Checker][Checker]/[Turtle][Mage]BK[Ninja][Ghost]NR' },
  rules: { castling: false, enPassant: true, promotion: { choices: ['Q'], auto: 'Q' }, stalemate: 'draw' },
  bot: { engine: 'search', depth: 2, time_ms: 600, min_ms: 300 },
  clock: { w: 58, b: 58, inc: 0, bot: false },   /* the video's 58 s turn timer, reset every turn (hooks.afterMove) */
  params: { cost: {"Checker": 1, "CheckerKing": 1, "P": 2, "Turtle": 4, "Copycat": 5, "N": 6, "Mage": 8, "Fisherman": 8, "B": 9, "Jester": 10, "Sludge": 12, "R": 13, "Berserker": 15, "Ghost": 15, "Penguin": 15, "Parasite": 15, "Devil": 15, "Minion": 0, "Dragon": 16, "Q": 17, "Sniper": 17, "Bomb": 18, "Prince": 18, "Ninja": 30, "Angel": 40, "Giant": 20} },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/I07GcHQtY2o/ninjas_and_ghost.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  vfx_timeline: [
    { trigger: 'game_start', effect: { type: 'overlay', html: '<div style="display:flex;height:100%;align-items:center;justify-content:center;font:900 64px/1 Impact,Arial Black,sans-serif;color:#ffd23f;-webkit-text-stroke:3px #4a2c0c;text-shadow:0 5px 0 #4a2c0c">VS</div>', duration_ms: 1100, fade_ms: 250 } },
    { trigger: 'game_over', effect: { type: 'overlay', image: 'assets/modes/CxtttdnwNWk/cu/checkmate.png', fit: 'contain', duration_ms: 1800, fade_ms: 250 } }
  ],
  hooks: {
    extends: 'g4_cu',
    setup: function (ctx) {
      S.uniq = false;
      var st = ctx.state, V = ctx.V, mine = S.team, opp = BLACK.map(function (t) { return banned(t) ? 'N' : t; });
      var fen = row(opp, true) + '/[checker][checker]pppp[checker][checker]/8/8/8/8/' + (mine ? row(mine.slice(8, 16)) + '/' + row(mine.slice(0, 8)) : '[Checker][Checker]PPPP[Checker][Checker]/[Turtle][Mage]BK[Ninja][Ghost]NR');
      st.b = CM.spec.parseSetup(V, fen); st.turn = 'w';
      V.geo.parseList(ctx.spec.board.walls).forEach(function (i) { if (!st.b[i]) st.b[i] = V.piece('#', 'n'); });   /* the map's pits */
      st.b.forEach(function (p, i) { if (p && V.def(p.t).pawn && V.geo.relRow(i, p.c) !== 1) st.b[i] = Object.assign({}, p, { m: 1 }); });
      st.start = {}; V.colors.forEach(function (c) { st.start[c + 'Royal'] = V.royals(st, c).length > 0; });
      CM.g4cuGiant.expand(V, st.b);   /* cu2: Giants grow into their 2x2 block */
    },
    onStart: function (ctx) { bar(ctx); if (!S.ban) ctx.toast('Ranked: tap "Ranked: ban + draft" for the ban phase, or play the Ninja lineup.', 3400); },
    onExit: function () { closeDlg(); ['.g5cu-bar', '.g5cu-act'].forEach(function (q) { var o = document.querySelector(q); if (o) o.remove(); }); },
    afterMove: function (ctx, m, info) {
      var G = ctx.game; if (G.clock) { G.clock.w = TURN; G.clock.b = TURN; G.clock.t = performance.now(); }   /* every turn starts at 0:58 */
      S.uniq = false;
      return base(ctx).afterMove ? base(ctx).afterMove(ctx, m, info) : null;
    },
    onUndo: function (ctx) { var G = ctx.game; if (G.clock) { G.clock.w = TURN; G.clock.b = TURN; G.clock.t = performance.now(); } },
    onTick: function (ctx) {
      var G = ctx.game; if (!G.clock || ctx.over || G.busy) return;
      var c = ctx.state.turn; if (c !== ctx.human) return;
      if (G.clock[c] - (performance.now() - G.clock.t) > 250) return;
      var ms = G.moves || []; if (!ms.length) return;
      ctx.toast('Time is up: a random move was played.', 2200);
      G.clock[c] = TURN; G.clock.t = performance.now();
      G.commit(ms[Math.floor(Math.random() * ms.length)], {});
    },
    beforeMove: function (ctx, m) {
      if (S.uniq && !uniqueOf(m)) { ctx.toast('Unique move is on: pick a highlighted target (tap the button again to cancel).', 2200); return false; }
      return true;
    },
    status: function (ctx) { actions(ctx); return base(ctx).status ? base(ctx).status(ctx) : null; }
  },
  source: { research: 'research/modes/I07GcHQtY2o.json', confidence: 'medium', notes: 'Drafts invented (ranked pick brackets, opponent lineup from the original pass-1 draft); pits placed at c5/f4; both-sides bans, the opponent\'s random ban and the random move on timeout are inferred.' }
});
})();
