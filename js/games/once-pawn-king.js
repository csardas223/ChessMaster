/* once-pawn-king: "Can I BEAT Once a Pawn a King?" (video C9v7G3dJl7E), a 2D top-down remake of the tutorial and the
   first Cellars rooms of the Steam chess roguelike Once a Pawn a King (Clover Bite) as played in the video.
   Rules from the video (transcript times): place your pieces on the starting tiles (1:04), White always moves first and
   its patrol shows its next move (1:47-1:49), every white piece moves during White's turn in the order of its number
   (4:06-4:08), enemies leave their patrol to capture (2:06), moving a piece costs its move and you end the turn when you
   have no moves left (1:14-1:17), clear a room by capturing every white piece or by reaching the key / unlocking the door
   (1:31, 5:03), Angel blessings Pull (pull an enemy within two tiles one tile closer) and Hop (jump over one
   non-furniture tile) bought with piece shards (3:02-3:11), blessings cost mana and do not spend the move, mana 50,
   +10 per kill, full again every room (4:28-4:44), Butcher sells a pawn or a bishop, army of up to two (5:54-5:58),
   chests open with a key by a piece that spends its move without leaving its tile (6:48-6:51), the Cellars rooms with
   two knights and a bishop + four pawns (9:31, 12:15), the money bag (19:57).
   Inferred (not readable in the video): exact room layouts and patrols, shard prices/rewards, blessing mana costs. */
(function () {
  'use strict';
  var CM = window.CM;
  var W = 1000, H = 1000;
  var COL = { light: '#7f5466', dark: '#4a2840', wall: '#1a0c18', brick: '#2d1427', abyss: '#0b0610', abyssEdge: '#1e1846',
    gold: '#d9a74a', mana: '#0f8c93', manaDark: '#064c52', red: '#c2272d', ghost: 'rgba(190,240,255,0.55)', green: '#2f9e44' };
  var MANA_MAX = 50, KILL_MANA = 10, KILL_SHARDS = 10;
  var BLESS = {
    pull: { name: 'Pull', cost: 20, price: 20, text: 'The piece pulls an enemy within two tiles one tile closer.' },
    hop: { name: 'Hop', cost: 20, price: 20, text: 'The piece jumps over one non-furniture tile.' }
  };
  var SHOP = { p: { name: 'Pawn', price: 20 }, b: { name: 'Bishop', price: 40 } };
  var TNAME = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen' };

  /* Map legend (top row = rank 1; left column = the highest file letter, as the game labels G..A left to right):
     '.' floor  'S' starting tile  ' ' abyss  '#' furniture  'g' grate (pit, Hop can jump it)  'D' locked door (needs a key)
     'X' room exit  'K' the key (picks up a key and clears the room)  'c' chest  '$' money bag */
  var NODES = [
    { kind: 'talk', who: 'pong', lines: [
      ['Pongement', 'Ugh, my head.'], ['You', 'Hello, who\'s there? What are you?'],
      ['Pongement', 'I\'m Pongement, king\'s pawn of the black army. I\'d offer you a proper introduction, but I\'m in a rush. My troop is missing.'],
      ['You', 'Wait, maybe I can help you find them. Maybe someone out there knows me.'], ['Pongement', 'All right, come along.']] },
    { kind: 'combat', name: 'Tutorial · Combat', room: 1, map: [' X ', ' . ', ' . ', ' S '], enemies: [], reward: 20,
      tips: ['Place Pongement on the starting tile.', 'Moving a piece costs its move. End your turn when you have no moves left.'] },
    { kind: 'combat', name: 'Tutorial · Combat', room: 2, map: ['#.D#', '....', '....', '.SS.'], reward: 20,
      enemies: [{ t: 'p', at: [2, 1], patrol: [[1, 1], [2, 1]] }],
      tips: ['You can progress without using a key by capturing all the white pieces in the room. Be careful, they can also capture your pieces.',
        'The patrol indicates White\'s next move. White always moves first.', 'Remember: enemies will leave their patrol to capture. Tap an enemy for more detailed information about it.'],
      say: ['Pongement', 'I don\'t recognize this pawn. How is it possible?'] },
    { kind: 'angel' },
    { kind: 'combat', name: 'Tutorial · Combat', room: 3, map: ['#.K.#', '..g..', '.....', '.....', '.S.S.'], reward: 20,
      enemies: [{ t: 'p', at: [0, 2], patrol: [[0, 3], [1, 3]] }, { t: 'p', at: [2, 2], patrol: [[2, 3], [3, 3], [2, 3]] }],
      tips: ['All the white pieces move during White\'s turn. Their number shows the order in which they move.',
        'Blessings cost mana to activate. Using a blessing doesn\'t spend a piece\'s move.', 'Killing an enemy restores 10 mana. Mana fully regenerates after each room.'],
      say: ['Pongement', 'The board is disintegrating. Better get out of this king-forsaken place.'] },
    { kind: 'butcher' },
    { kind: 'combat', name: 'Tutorial · Combat', room: 4, map: ['#..D.#', '......', '.c....', '......', '..SS..', '......'], reward: 20,
      enemies: [{ t: 'n', at: [4, 1], patrol: [[2, 2], [4, 1]] }, { t: 'p', at: [2, 1], patrol: [[3, 1], [2, 1]] }],
      tips: ['Chests contain tokens, each granting a different type of reward.', 'A piece can spend its move and a key to open a chest without leaving its tile (stand next to it).',
        'Use the arrows (or tap) to switch between your pieces.'] },
    { kind: 'talk', who: 'pong', lines: [['', 'The tutorial is over. Welcome to the Cellars: the white barracks, modified and expanded by the white king.']] },
    { kind: 'combat', name: 'Cellars · Combat', room: 1, map: ['  .D.  ', '  ...  ', '#.....#', '.. . ..', '.......', ' ..... ', ' .SSS. '], reward: 25,
      enemies: [{ t: 'n', at: [2, 2], patrol: [[3, 4], [2, 2]] }, { t: 'n', at: [5, 4], patrol: [[3, 3], [5, 4]] }] },
    { kind: 'combat', name: 'Cellars · Combat', room: 2, map: ['#..D..#', '.......', '.......', '.......', '.......', '..SSS..'], reward: 25,
      enemies: [{ t: 'p', at: [0, 2], patrol: [[0, 3], [1, 3]] }, { t: 'p', at: [2, 2], patrol: [[2, 3], [3, 3]] },
        { t: 'p', at: [4, 2], patrol: [[4, 3], [5, 3]] }, { t: 'p', at: [5, 1], patrol: [[6, 1], [5, 1]] }, { t: 'b', at: [1, 1], patrol: [[3, 3], [1, 1]] }] },
    { kind: 'combat', name: 'Cellars · Combat', room: 3, map: ['#..D.#', '..#...', '...$..', '.#..#.', '......', '..SS..'], reward: 25,
      enemies: [{ t: 'n', at: [3, 1], patrol: [[2, 3], [3, 1]] }, { t: 'p', at: [5, 2], patrol: [[4, 2], [5, 2]] }],
      say: ['Pongement', 'Wait, but I know this place.'] }
  ];

  CM.defineGame('once-pawn-king', function (host) {
    var cv = host.canvas, g = host.g, A = host.spec.assets || {}, IMG = {}, imgs = {}, R, S, bar, panel, uid = 0, lastT = 0;
    Object.keys(A).forEach(function (k) { var im = new Image(); im.onload = function () { im.ok = true; }; im.src = A[k]; IMG[k] = im; });
    function pieceImg(c, t) { var k = c + t; if (!imgs[k]) { imgs[k] = new Image(); imgs[k].onload = function () { imgs[k].ok = true; }; imgs[k].src = host.pieceUrl(c, t.toUpperCase()); } return imgs[k]; }
    function reduced() { return host.reduced(); }

    /* ---------------- run state ---------------- */
    function newRun() {
      uid = 0;
      S = { node: -1, shards: 0, keys: 0, army: [mk('p', 'b', 'Pongement', true)], over: false };
      nextNode();
    }
    function mk(t, side, name, hero) { return { id: ++uid, t: t, side: side, name: name || TNAME[t], hero: !!hero, c: -1, r: -1, moved: false, bless: [], dead: false, x: 0, y: 0, ax: 0, ay: 0, at: 1 }; }
    function nextNode() {
      closePanel(); S.node++;
      var n = NODES[S.node];
      if (!n) return winRun();
      R = null;
      if (n.kind === 'talk') return talk(n.lines, nextNode);
      if (n.kind === 'angel') return angel();
      if (n.kind === 'butcher') return butcher();
      startRoom(n);
    }
    function winRun() {
      R = null; S.over = true; renderBar(); draw();
      host.over({ result: 'win', title: 'Cellars cleared!', why: 'You fought through the tutorial and the first rooms of the Cellars with ' + alive().map(function (p) { return p.name; }).join(' and ') + '.' });
    }
    function loseRun(why) { S.over = true; renderBar(); host.over({ result: 'loss', title: 'Run over', why: why || 'Your whole army was captured.' }); }

    /* ---------------- rooms ---------------- */
    function startRoom(n) {
      var map = n.map.map(function (row) { return row.split(''); });
      R = { n: n, map: map, cols: map[0].length, rows: map.length, enemies: [], phase: 'place', sel: null, mode: 'move', mana: MANA_MAX, tip: 0,
        info: null, fx: [], busy: false, placeIdx: 0, cleared: false, hadEnemies: n.enemies.length > 0 };
      n.enemies.forEach(function (e, i) { var p = mk(e.t, 'w'); p.c = e.at[0]; p.r = e.at[1]; p.patrol = e.patrol.slice(); p.pi = 0; p.order = i + 1; p.x = p.c; p.y = p.r; R.enemies.push(p); });
      alive().forEach(function (p) { p.c = -1; p.r = -1; p.moved = false; });
      R.sel = alive()[0] || null;
      host.setPlayers({ opp: { name: 'White army', rating: null }, you: { name: 'Black army (' + alive().length + '/2)' } });
      host.setActive('bottom');
      if (n.say) toastSay(n.say);
      renderBar(); setStatus(); planAll();
    }
    function tile(c, r) { if (!R || r < 0 || r >= R.rows || c < 0 || c >= R.cols) return null; return R.map[r][c]; }
    function fileName(c) { return 'ABCDEFGH'.charAt(R.cols - 1 - c); }
    function sqName(c, r) { return fileName(c) + (r + 1); }
    function alive() { return S.army.filter(function (p) { return !p.dead; }); }
    function onBoard() { return alive().filter(function (p) { return p.c >= 0; }); }
    function liveEnemies() { return R ? R.enemies.filter(function (e) { return !e.dead; }) : []; }
    function at(c, r) { var all = onBoard().concat(liveEnemies()); for (var i = 0; i < all.length; i++) if (all[i].c === c && all[i].r === r) return all[i]; return null; }
    function standable(p, c, r) {
      var t = tile(c, r); if (t == null) return false;
      if (t === '.' || t === 'S' || t === '$') return true;
      if (p.side === 'w') return false;                       /* enemies never step on exits */
      if (t === 'X' || t === 'K') return true;
      if (t === 'D') return S.keys > 0;
      return false;
    }
    /* legal moves of a piece: [{c, r, cap}] ; player pawns go up the screen, white pawns down */
    function moves(p) {
      var out = [], dir = p.side === 'b' ? -1 : 1;
      function add(c, r, capOnly, moveOnly) {
        var o = at(c, r);
        if (o) { if (!moveOnly && o.side !== p.side && tile(c, r) != null) out.push({ c: c, r: r, cap: o }); return false; }
        if (capOnly) return false;
        if (!standable(p, c, r)) return false;
        out.push({ c: c, r: r, cap: null }); return true;
      }
      if (p.t === 'p') {
        add(p.c, p.r + dir, false, true); add(p.c - 1, p.r, false, true); add(p.c + 1, p.r, false, true);
        add(p.c - 1, p.r + dir, true); add(p.c + 1, p.r + dir, true);
      } else if (p.t === 'n') {
        [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(function (d) { add(p.c + d[0], p.r + d[1]); });
      } else {
        var dirs = p.t === 'b' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : p.t === 'r' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
        dirs.forEach(function (d) { var c = p.c + d[0], r = p.r + d[1]; while (add(c, r)) { c += d[0]; r += d[1]; } });
      }
      return out;
    }
    function plan(e) {   /* what this white piece does next: capture first, else its patrol */
      var caps = moves(e).filter(function (m) { return m.cap; });
      if (caps.length) return { c: caps[0].c, r: caps[0].r, cap: caps[0].cap };
      var tgt = e.patrol[e.pi % e.patrol.length];
      if (tgt[0] === e.c && tgt[1] === e.r) { e.pi++; tgt = e.patrol[e.pi % e.patrol.length]; }
      var ok = moves(e).some(function (m) { return !m.cap && m.c === tgt[0] && m.r === tgt[1]; });
      return { c: tgt[0], r: tgt[1], cap: null, blocked: !ok };
    }
    function planAll() { liveEnemies().forEach(function (e) { e.plan = plan(e); }); }

    /* ---------------- placement ---------------- */
    function placeAt(c, r) {
      if (tile(c, r) !== 'S') return false;
      var o = at(c, r);
      if (o && o.side === 'b') { o.c = -1; o.r = -1; R.sel = o; host.sound('move'); return true; }
      if (o) return false;
      var p = (R.sel && R.sel.c < 0) ? R.sel : alive().filter(function (q) { return q.c < 0; })[0];
      if (!p) { p = R.sel || alive()[0]; }
      p.c = c; p.r = r; p.x = c; p.y = r; host.sound('move');
      var left = alive().filter(function (q) { return q.c < 0; });
      R.sel = left[0] || p;
      planAll(); return true;
    }
    function canStart() { return R && R.phase === 'place' && alive().every(function (p) { return p.c >= 0; }); }
    function startBattle() {
      if (!canStart()) { host.toast(alive().length > 1 ? 'Place every piece on a starting tile first.' : 'Place ' + alive()[0].name + ' on a starting tile first.'); return; }
      R.phase = 'white'; R.sel = null; host.sound('game-start'); whiteTurn();
    }

    /* ---------------- player turn ---------------- */
    function select(p) { R.sel = p; R.mode = 'move'; R.info = null; renderBar(); setStatus(); }
    function cycle(d) { var L = onBoard(); if (!L.length) return; var i = L.indexOf(R.sel); select(L[(i + d + L.length) % L.length]); host.sound('move'); }
    function tapPlayer(c, r) {
      var o = at(c, r), p = R.sel;
      if (R.mode !== 'move' && p) return castAt(p, c, r);
      if (o && o.side === 'b') { select(o); return; }
      if (p && !p.moved) {
        var m = moves(p).filter(function (m) { return m.c === c && m.r === r; })[0];
        if (m) return doMove(p, m);
        if (tile(c, r) === 'c' && near(p, c, r)) return openChest(p, c, r);
      }
      if (o && o.side === 'w') { R.info = o; host.toast(infoText(o), 3200); return; }
      if (p && p.moved) host.toast(p.name + ' has already spent its move. End the turn.');
      else if (tile(c, r) === 'D' && S.keys < 1) host.toast('The door is locked and you have no key. Capture every white piece instead.');
    }
    function near(p, c, r) { return Math.max(Math.abs(p.c - c), Math.abs(p.r - r)) === 1; }
    function infoText(e) {
      var pl = e.plan, where = pl ? (pl.cap ? 'capture ' + pl.cap.name + ' on ' + sqName(pl.c, pl.r) : pl.blocked ? 'move to ' + sqName(pl.c, pl.r) + ' (blocked)' : 'move to ' + sqName(pl.c, pl.r)) : 'wait';
      return 'White ' + TNAME[e.t] + ' #' + e.order + ' · HP 1/1 · Attack 1 · intends to ' + where + '.';
    }
    function slide(p, c, r) { p.ax = p.c; p.ay = p.r; p.c = c; p.r = r; p.at = reduced() ? 1 : 0; }
    function doMove(p, m) {
      var t = tile(m.c, m.r);
      if (m.cap) { kill(m.cap, p); }
      slide(p, m.c, m.r); p.moved = true;
      host.sound(m.cap ? 'capture' : 'move');
      if (t === '$') { R.map[m.r][m.c] = '.'; S.shards += 20; floatText(m.c, m.r, '+20 shards', COL.gold); }
      if (t === 'K') { S.keys++; floatText(m.c, m.r, '+1 key', COL.gold); return roomClear('You reached the key.'); }
      if (t === 'X') return roomClear('Room cleared.');
      if (t === 'D') { S.keys--; return roomClear('You unlocked the door.'); }
      if (R.hadEnemies && !liveEnemies().length) return roomClear('Every white piece captured.');
      planAll(); renderBar(); setStatus();
      if (!onBoard().some(function (q) { return !q.moved; })) host.toast('No moves left: end your turn.', 1600);
    }
    function kill(victim, by) {
      victim.dead = true; R.fx.push({ k: 'burst', c: victim.c, r: victim.r, t: 0 });
      if (victim.side === 'w') { R.mana = Math.min(MANA_MAX, R.mana + KILL_MANA); S.shards += KILL_SHARDS; floatText(victim.c, victim.r, '+10 mana', '#7fe3e8'); }
      else { victim.c = -1; host.toast(victim.name + ' was captured' + (by ? ' by the white ' + TNAME[by.t].toLowerCase() : '') + '.', 2200); }
    }
    function openChest(p, c, r) {
      if (S.keys < 1) { host.toast('You need a key to open the chest.'); host.sound('illegal'); return; }
      S.keys--; p.moved = true; R.map[r][c] = '.';
      var gain = 30; S.shards += gain; floatText(c, r, '+' + gain + ' shards', COL.gold); host.sound('promote');
      planAll(); renderBar(); setStatus();
    }
    function castAt(p, c, r) {
      var b = BLESS[R.mode], o = at(c, r);
      if (o === p) { R.mode = 'move'; renderBar(); setStatus(); return; }
      if (R.mana < b.cost) { host.toast('Not enough mana.'); R.mode = 'move'; renderBar(); return; }
      if (R.mode === 'pull') {
        var dx = c - p.c, dy = r - p.r, dist = Math.max(Math.abs(dx), Math.abs(dy));
        var line = dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy);
        var mc = p.c + Math.sign(dx), mr = p.r + Math.sign(dy);
        if (!o || o.side !== 'w' || dist !== 2 || !line || at(mc, mr) || !standable(o, mc, mr)) { host.toast('Invalid target'); host.sound('illegal'); return; }
        slide(o, mc, mr); R.fx.push({ k: 'ring', c: mc, r: mr, t: 0, col: '#b9a7ff' });
      } else {
        var hx = c - p.c, hy = r - p.r;
        var ok = (Math.abs(hx) === 2 && hy === 0) || (Math.abs(hy) === 2 && hx === 0);
        var midT = tile(p.c + hx / 2, p.r + hy / 2);
        if (!ok || midT == null || midT === '#' || midT === 'c' || o || !standable(p, c, r)) { host.toast('Invalid target'); host.sound('illegal'); return; }
        var t = tile(c, r); slide(p, c, r); R.fx.push({ k: 'ring', c: c, r: r, t: 0, col: '#ff9be0' });
        R.mana -= b.cost; R.mode = 'move'; host.sound('move');
        if (t === 'K') { S.keys++; return roomClear('You reached the key.'); }
        if (t === 'X') return roomClear('Room cleared.');
        if (t === 'D') { S.keys--; return roomClear('You unlocked the door.'); }
        if (t === '$') { R.map[r][c] = '.'; S.shards += 20; }
        planAll(); renderBar(); setStatus(); return;
      }
      R.mana -= b.cost; R.mode = 'move'; host.sound('move'); planAll(); renderBar(); setStatus();
    }
    function endTurn() {
      if (!R || R.phase !== 'player' || R.busy) return;
      R.phase = 'white'; R.mode = 'move'; R.sel = null; renderBar(); whiteTurn();
    }

    /* ---------------- white turn: every piece in order ---------------- */
    function whiteTurn() {
      R.busy = true; host.setActive('top'); host.setThinking(true); setStatus();
      var list = liveEnemies().slice().sort(function (a, b) { return a.order - b.order; }), i = 0;
      function step() {
        if (!R) return;
        if (i >= list.length) return afterWhite();
        var e = list[i++]; if (e.dead) return step();
        var pl = plan(e);
        if (pl.cap) { kill(pl.cap, e); slide(e, pl.c, pl.r); host.sound('capture'); }
        else if (!pl.blocked) { slide(e, pl.c, pl.r); e.pi++; host.sound('move-opponent'); }
        else { R.fx.push({ k: 'confused', c: e.c, r: e.r, t: 0 }); }
        if (!alive().length) { R.busy = false; host.setThinking(false); renderBar(); return host.after(500, function () { loseRun('Your whole army was captured in ' + R.n.name + ' room ' + R.n.room + '.'); }); }
        host.after(reduced() ? 150 : 480, step);
      }
      host.after(reduced() ? 100 : 380, step);
    }
    function afterWhite() {
      R.busy = false; host.setThinking(false); host.setActive('bottom');
      R.phase = 'player'; onBoard().forEach(function (p) { p.moved = false; });
      R.sel = onBoard()[0] || null; planAll(); renderBar(); setStatus();
    }
    function roomClear(why) {
      R.cleared = true; R.busy = true; renderBar();
      var n = R.n; S.shards += n.reward || 0;
      R.fx.push({ k: 'banner', t: 0, text: 'Room cleared' });
      host.sound('victory');
      host.toast(why + ' +' + (n.reward || 0) + ' shards.', 2200);
      host.after(reduced() ? 400 : 1500, nextNode);
    }

    /* ---------------- shops and dialogue (DOM panel over the canvas) ---------------- */
    function closePanel() { if (panel) panel.remove(); panel = null; }
    function openPanel(html, onClick) {
      closePanel();
      panel = document.createElement('div'); panel.className = 'opk-panel';
      panel.style.cssText = 'position:absolute;left:4%;right:4%;bottom:5%;padding:12px;border-radius:8px;background:rgba(24,30,30,.96);border:2px solid #b88a3e;color:#eee;font:500 14px/1.35 system-ui,sans-serif;pointer-events:auto;box-shadow:0 6px 24px rgba(0,0,0,.6)';
      panel.innerHTML = html; host.el.appendChild(panel);
      panel.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) onClick(b.dataset.c); });
    }
    function btn(c, label, on, primary) { return '<button type="button" data-c="' + c + '"' + (on === false ? ' disabled' : '') + ' style="min-height:36px;padding:0 12px;margin:6px 6px 0 0;border:0;border-radius:5px;color:#fff;font:600 14px system-ui,sans-serif;background:' + (primary ? '#81b64c' : '#3d4a48') + ';box-shadow:inset 0 -3px 0 rgba(0,0,0,.3);opacity:' + (on === false ? 0.45 : 1) + '">' + label + '</button>'; }
    function face(src) { return src ? '<img src="' + src + '" alt="" style="width:52px;height:52px;border-radius:6px;float:left;margin:0 10px 4px 0;object-fit:cover;border:2px solid #b88a3e">' : ''; }
    function esc(s) { return CM.util && CM.util.esc ? CM.util.esc(s) : String(s); }
    function talk(lines, done) {
      var i = 0;
      (function show() {
        var L = lines[i], who = L[0];
        var src = who === 'Pongement' ? A.pong_card : who === 'Angel' ? null : who === 'Bishop' ? null : null;
        openPanel(face(src) + (who ? '<b style="color:#e7c27a">' + esc(who) + '</b><br>' : '') + esc(L[1]) + '<div style="clear:both;text-align:right">' + btn('next', i < lines.length - 1 ? 'Next' : 'Continue', true, true) + '</div>',
          function () { i++; if (i < lines.length) show(); else { closePanel(); done(); } });
        host.status(who ? who + ': ' + L[1] : L[1]);
      })();
      renderBar(); draw();
    }
    function hero() { return alive().filter(function (p) { return p.hero; })[0] || alive()[0]; }
    function angel() {
      var h = hero();
      host.status('The Angel grants new abilities to pieces. Buy a blessing for ' + h.name + '.');
      var html = '<b style="color:#e7c27a">Angel</b> <span style="opacity:.8">· shards ' + S.shards + '</span><br>"I graciously offer you and your pieces my blessings. In exchange, I require merely a pittance of piece remains. Piece shards, if you will."' +
        '<div style="margin-top:6px">' + Object.keys(BLESS).map(function (k) {
          var b = BLESS[k], has = h.bless.indexOf(k) >= 0;
          return '<div style="margin-top:6px"><b>' + b.name + '</b> <span style="opacity:.75">(' + b.cost + ' mana)</span> · ' + esc(b.text) + '<br>' + btn('buy:' + k, has ? 'Owned' : 'Buy for ' + b.price + ' shards', !has && S.shards >= b.price) + '</div>';
        }).join('') + '</div><div style="text-align:right">' + btn('leave', 'Leave', true, true) + '</div>';
      openPanel(html, function (c) {
        if (c === 'leave') { closePanel(); return nextNode(); }
        var k = c.split(':')[1], b = BLESS[k];
        if (S.shards < b.price) return; S.shards -= b.price; h.bless.push(k); host.sound('promote');
        host.toast(h.bless.length > 1 ? '"To be blessed by me, consider yourself lucky."' : '"All this time and this is what you choose? Fine."', 2200); angel();
      });
      renderBar(); draw();
    }
    function butcher() {
      var n = alive().length;
      host.status('Buy a piece to expand your army. You can have up to two pieces in your army.');
      var html = '<b style="color:#e7c27a">Butcher</b> <span style="opacity:.8">· shards ' + S.shards + ' · army ' + n + '/2</span><br>"Ah, fresh meat. Welcome."<div style="margin-top:4px">' +
        Object.keys(SHOP).map(function (t) { var s = SHOP[t]; return btn('buy:' + t, 'Buy ' + s.name + ' (' + s.price + ' shards)', n < 2 && S.shards >= s.price); }).join('') +
        '</div><div style="text-align:right">' + btn('leave', 'Leave', true, true) + '</div>';
      openPanel(html, function (c) {
        if (c === 'leave') { closePanel(); return nextNode(); }
        var t = c.split(':')[1], s = SHOP[t];
        if (alive().length >= 2 || S.shards < s.price) return;
        S.shards -= s.price; S.army.push(mk(t, 'b', s.name)); host.sound('promote');
        host.toast('"A fine choice."', 1600);
        if (t === 'b') host.after(900, function () { host.toast('Bishop: "Oh joy, another ill-mannered stranger."', 2400); });
        butcher();
      });
      renderBar(); draw();
    }
    function toastSay(s) { host.after(300, function () { host.toast(s[0] + ': "' + s[1] + '"', 2600); }); }

    /* ---------------- toolbar (Start / End turn / blessings) ---------------- */
    function renderBar() {
      if (!bar) {
        bar = document.createElement('div'); bar.className = 'opk-bar';
        bar.style.cssText = 'position:absolute;right:2%;bottom:2%;display:flex;gap:6px;align-items:center;pointer-events:auto;font:600 13px/1 system-ui,sans-serif';
        host.el.appendChild(bar);
        bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b && !b.disabled) cmd(b.dataset.c); });
      }
      var h = '', inRoom = R && !R.cleared && !S.over && !panel;
      function b(c, label, on, pressed, primary) { return '<button type="button" data-c="' + c + '"' + (on ? '' : ' disabled') + ' style="min-height:40px;padding:0 12px;border:0;border-radius:6px;color:#fff;background:' + (pressed ? '#9b4dca' : primary ? '#81b64c' : 'rgba(30,26,34,.92)') + ';box-shadow:inset 0 -3px 0 rgba(0,0,0,.35);opacity:' + (on ? 1 : 0.45) + '">' + label + '</button>'; }
      if (inRoom && R.phase === 'place') h += b('start', 'Start', canStart(), false, true);
      if (inRoom && R.phase !== 'place') {
        var p = R.sel, me = R.phase === 'player' && !R.busy;
        (p && p.bless || []).forEach(function (k) { h += b('bless:' + k, BLESS[k].name + ' ' + BLESS[k].cost, me && R.mana >= BLESS[k].cost, R.mode === k); });
        h += b('end', 'End turn', me, false, me && !onBoard().some(function (q) { return !q.moved; }));
      }
      if (bar._h !== h) { bar.innerHTML = h; bar._h = h; }
    }
    function cmd(c) {
      if (!R) return;
      if (c === 'start') return startBattle();
      if (c === 'end') return endTurn();
      if (c.indexOf('bless:') === 0) {
        var k = c.split(':')[1];
        if (R.phase !== 'player' || R.busy) return;
        if (R.mana < BLESS[k].cost) { host.toast('Not enough mana.'); return; }
        R.mode = R.mode === k ? 'move' : k; renderBar(); setStatus();
        if (R.mode === 'pull') host.toast('Pull: tap an enemy two tiles away.', 1800);
        if (R.mode === 'hop') host.toast('Hop: tap the tile two steps away.', 1800);
      }
    }
    function setStatus() {
      if (!R) return;
      var s;
      if (R.phase === 'place') s = (R.n.tips && R.n.tips[0]) || 'Place your pieces on the starting tiles, then press Start.';
      else if (R.phase === 'white') s = 'White is moving (in order of the numbers).';
      else if (R.mode !== 'move') s = BLESS[R.mode].name + ': ' + BLESS[R.mode].text;
      else { var t = R.n.tips || []; s = t[Math.min(t.length - 1, 1 + (R.turnTip || 0))] || 'Your turn: each piece may move once, then End turn.'; }
      host.status(s);
      host.setMoves([]);
    }

    /* ---------------- input ---------------- */
    function toWorld(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
    function geo() {
      var cols = R.cols, rows = R.rows, ts = Math.min(115, 760 / cols, 660 / rows), bw = ts * cols, bh = ts * rows;
      return { ts: ts, x0: 195 + (780 - bw) / 2, y0: 110 + (680 - bh) / 2 };
    }
    function onDown(e) {
      if (!R || S.over || panel) return;
      var w = toWorld(e), G = geo(), c = Math.floor((w.x - G.x0) / G.ts), r = Math.floor((w.y - G.y0) / G.ts);
      if (tile(c, r) == null) return;
      e.preventDefault();
      if (R.phase === 'place') { if (!placeAt(c, r)) { var o = at(c, r); if (o && o.side === 'w') { R.info = o; host.toast(infoText(o), 3200); } } renderBar(); return; }
      if (R.phase === 'player' && !R.busy) { R.turnTip = (R.turnTip || 0) + 1; tapPlayer(c, r); renderBar(); }
      else { var q = at(c, r); if (q && q.side === 'w') host.toast(infoText(q), 2600); }
    }
    function onCtx(e) { e.preventDefault(); }

    /* ---------------- drawing ---------------- */
    function floatText(c, r, text, col) { R.fx.push({ k: 'text', c: c, r: r, t: 0, text: text, col: col }); }
    function drawBackdrop() {
      g.fillStyle = COL.wall; g.fillRect(0, 0, W, H);
      g.strokeStyle = COL.brick; g.lineWidth = 3;
      for (var y = 0; y < H; y += 46) { var off = (y / 46) % 2 ? 40 : 0; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (var x = off; x < W; x += 80) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 46); g.stroke(); } }
      var vg = g.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 720); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.75)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
      [[70, 260], [930, 260], [70, 640], [930, 640]].forEach(function (t, i) {
        var fl = 0.85 + 0.15 * Math.sin(lastT / 170 + i * 1.7);
        var rg = g.createRadialGradient(t[0], t[1], 4, t[0], t[1], 120 * fl); rg.addColorStop(0, 'rgba(255,170,60,.55)'); rg.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = rg; g.fillRect(t[0] - 130, t[1] - 130, 260, 260);
        g.fillStyle = '#3a2a22'; g.fillRect(t[0] - 6, t[1] + 6, 12, 40); g.fillStyle = '#ffb347'; g.beginPath(); g.ellipse(t[0], t[1], 10 * fl, 16 * fl, 0, 0, Math.PI * 2); g.fill();
      });
    }
    function drawHud() {
      var ok = function (k) { return IMG[k] && IMG[k].ok; };
      g.font = '700 34px system-ui, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillStyle = '#fff';
      if (ok('shard')) g.drawImage(IMG.shard, 18, 14, 36, 40); g.fillText(String(S.shards), 64, 36);
      if (ok('key')) g.drawImage(IMG.key, 18, 60, 36, 40); g.fillText(String(S.keys), 64, 82);
      g.textAlign = 'right'; g.font = '700 36px Cinzel, Georgia, serif';
      var n = NODES[S.node] || {}, label = n.kind === 'combat' ? 'Room ' + n.room : n.kind === 'angel' ? 'Angel' : n.kind === 'butcher' ? 'Butcher' : '';
      g.fillText(label, W - 24, 40);
      if (n.name) { g.font = '600 22px system-ui, sans-serif'; g.fillStyle = '#d7c3cf'; g.fillText(n.name, W - 24, 80); }
    }
    function drawMana() {
      if (!R || R.phase === undefined) return;
      var cx = 110, cy = 900, s = 78;
      g.save(); g.translate(cx, cy); g.rotate(Math.PI / 4);
      g.fillStyle = COL.manaDark; g.fillRect(-s / 2 - 8, -s / 2 - 8, s + 16, s + 16);
      g.fillStyle = COL.mana; g.fillRect(-s / 2, -s / 2, s, s); g.restore();
      g.fillStyle = '#fff'; g.font = '700 30px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(R.mana + '/' + MANA_MAX, cx, cy);
    }
    function drawArmy() {   /* the card list on the left, like the game's party panel */
      var y = 120;
      alive().forEach(function (p) {
        var sel = R && R.sel === p;
        g.fillStyle = sel ? 'rgba(184,138,62,.9)' : 'rgba(28,38,38,.9)'; g.fillRect(8, y, 140, 92);
        g.strokeStyle = '#6b7f78'; g.lineWidth = 2; g.strokeRect(8, y, 140, 92);
        var im = p.hero && IMG.pong_card && IMG.pong_card.ok ? IMG.pong_card : pieceImg('b', p.t);
        if (im.ok) g.drawImage(im, 14, y + 26, 60, 60);
        g.fillStyle = '#fff'; g.font = '600 17px system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'top';
        g.fillText(p.name, 14, y + 4);
        g.font = '700 20px system-ui, sans-serif'; g.fillStyle = '#5bd16a'; g.fillText('1/1', 92, y + 32); g.fillStyle = '#ff6b6b'; g.fillText('⚔ 1', 92, y + 60);
        if (R && R.phase === 'player' && p.moved) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(8, y, 140, 92); }
        y += 100;
      });
      g.fillStyle = '#d9a74a'; g.font = '700 18px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText(alive().length + '/2', 12, y + 2);
    }
    function drawTile(G, c, r, t) {
      var x = G.x0 + c * G.ts, y = G.y0 + r * G.ts, ts = G.ts;
      if (t === ' ') { g.fillStyle = COL.abyss; g.fillRect(x, y, ts, ts); g.strokeStyle = COL.abyssEdge; g.lineWidth = 2; g.strokeRect(x + 2, y + 2, ts - 4, ts - 4); return; }
      g.fillStyle = (c + r) % 2 ? COL.dark : COL.light; g.fillRect(x, y, ts, ts);
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y + ts - 6, ts, 6);
      if (t === '#') { g.fillStyle = '#5a3a24'; g.fillRect(x + ts * .1, y + ts * .12, ts * .8, ts * .76); g.strokeStyle = '#2e1c10'; g.lineWidth = 4; g.strokeRect(x + ts * .1, y + ts * .12, ts * .8, ts * .76); g.beginPath(); g.moveTo(x + ts * .1, y + ts * .12); g.lineTo(x + ts * .9, y + ts * .88); g.moveTo(x + ts * .9, y + ts * .12); g.lineTo(x + ts * .1, y + ts * .88); g.stroke(); }
      if (t === 'g') { g.fillStyle = '#120a12'; g.fillRect(x + 4, y + 4, ts - 8, ts - 8); g.strokeStyle = '#6d6470'; g.lineWidth = 5; for (var i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x + i * ts / 5, y + 6); g.lineTo(x + i * ts / 5, y + ts - 6); g.stroke(); } g.strokeRect(x + 6, y + 6, ts - 12, ts - 12); }
      if (t === 'X' || t === 'K' || t === 'D') {
        g.fillStyle = '#2f6b45'; g.fillRect(x + 4, y + 4, ts - 8, ts - 8); g.strokeStyle = '#d9b14a'; g.lineWidth = 4; g.strokeRect(x + 6, y + 6, ts - 12, ts - 12);
        if (t === 'D' && IMG.door && IMG.door.ok) g.drawImage(IMG.door, x + ts * .12, y + ts * .02, ts * .76, ts * .82);
        else { g.fillStyle = COL.gold; g.beginPath(); g.moveTo(x + ts / 2, y + ts * .28); g.lineTo(x + ts * .72, y + ts / 2); g.lineTo(x + ts / 2, y + ts * .72); g.lineTo(x + ts * .28, y + ts / 2); g.closePath(); g.fill(); }
        if (t === 'K' && IMG.key && IMG.key.ok) g.drawImage(IMG.key, x + ts * .3, y + ts * .28, ts * .4, ts * .44);
        if (t === 'D' && S.keys < 1) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, y, ts, ts); }
      }
      if (t === 'c') { g.fillStyle = '#6d4220'; g.fillRect(x + ts * .16, y + ts * .3, ts * .68, ts * .5); g.fillStyle = '#8b5a2b'; g.fillRect(x + ts * .16, y + ts * .22, ts * .68, ts * .18); g.fillStyle = COL.gold; g.fillRect(x + ts * .46, y + ts * .3, ts * .08, ts * .2); g.strokeStyle = '#d9a74a'; g.lineWidth = 3; g.strokeRect(x + ts * .16, y + ts * .22, ts * .68, ts * .58); }
      if (t === '$') { g.fillStyle = '#8a6a3a'; g.beginPath(); g.ellipse(x + ts / 2, y + ts * .58, ts * .24, ts * .22, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6d5028'; g.fillRect(x + ts * .42, y + ts * .3, ts * .16, ts * .12); g.fillStyle = COL.gold; g.font = '700 ' + Math.round(ts * .26) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', x + ts / 2, y + ts * .6); }
      if (t === 'S' && R.phase === 'place') brackets(x, y, ts, COL.gold);
    }
    function brackets(x, y, ts, col) {
      var a = ts * .26, m = ts * .1; g.strokeStyle = col; g.lineWidth = Math.max(3, ts * .05);
      [[x + m, y + m, 1, 1], [x + ts - m, y + m, -1, 1], [x + m, y + ts - m, 1, -1], [x + ts - m, y + ts - m, -1, -1]].forEach(function (k) { g.beginPath(); g.moveTo(k[0] + a * k[2], k[1]); g.lineTo(k[0], k[1]); g.lineTo(k[0], k[1] + a * k[3]); g.stroke(); });
    }
    function drawPiece(G, p, ghost) {
      var e = p.at < 1 ? 1 - Math.pow(1 - p.at, 3) : 1;
      var px = ghost ? ghost.c : p.ax + (p.c - p.ax) * e, py = ghost ? ghost.r : p.ay + (p.r - p.ay) * e;
      var x = G.x0 + px * G.ts, y = G.y0 + py * G.ts, ts = G.ts, im = pieceImg(p.side, p.t);
      if (!ghost) { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + ts / 2, y + ts * .84, ts * .3, ts * .09, 0, 0, Math.PI * 2); g.fill(); }
      if (im.ok) {
        g.save(); if (ghost) g.globalAlpha = 0.45;
        if (p.side === 'b' && R.phase === 'player' && p.moved && !ghost) g.globalAlpha = 0.7;
        g.drawImage(im, x + ts * .06, y + ts * .02, ts * .88, ts * .88); g.restore();
      }
      if (ghost) return;
      if (p.hero) { g.strokeStyle = COL.gold; g.lineWidth = 3; g.beginPath(); g.ellipse(x + ts / 2, y + ts * .86, ts * .3, ts * .09, 0, 0, Math.PI * 2); g.stroke(); }
      var bx = x + ts * .62, by = y + ts * .7, bs = Math.max(16, ts * .22);
      g.fillStyle = '#1f7a37'; g.fillRect(bx, by, bs * 1.3, bs * .72); g.fillStyle = '#fff'; g.font = '700 ' + Math.round(bs * .55) + 'px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1/1', bx + bs * .65, by + bs * .37);
      if (p.side === 'w') {
        var ox = x + ts * .06, oy = y + ts * .06, rr = Math.max(13, ts * .16);
        g.fillStyle = '#efe7da'; g.beginPath(); g.arc(ox + rr, oy + rr, rr, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#3a2a33'; g.lineWidth = 2; g.stroke();
        g.fillStyle = '#2a1a24'; g.font = '800 ' + Math.round(rr * 1.2) + 'px system-ui'; g.fillText(String(p.order), ox + rr, oy + rr + 1);
      }
    }
    function arrow(G, a, b, col) {
      var x1 = G.x0 + (a.x + .5) * G.ts, y1 = G.y0 + (a.y + .5) * G.ts, x2 = G.x0 + (b.c + .5) * G.ts, y2 = G.y0 + (b.r + .5) * G.ts;
      var ang = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1) - G.ts * .3; if (L < 4) return;
      x2 = x1 + Math.cos(ang) * L; y2 = y1 + Math.sin(ang) * L;
      g.strokeStyle = col; g.lineWidth = Math.max(4, G.ts * .07); g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      var h = G.ts * .2; g.fillStyle = col; g.beginPath(); g.moveTo(x2 + Math.cos(ang) * h * .6, y2 + Math.sin(ang) * h * .6); g.lineTo(x2 - Math.cos(ang - .5) * h, y2 - Math.sin(ang - .5) * h); g.lineTo(x2 - Math.cos(ang + .5) * h, y2 - Math.sin(ang + .5) * h); g.closePath(); g.fill();
    }
    function draw(dt) {
      if (!S) return;
      g.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
      drawBackdrop(); drawHud();
      if (!R) { drawArmy(); return; }
      var G = geo(), c, r;
      g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(G.x0 - 10, G.y0 - 10, R.cols * G.ts + 20, R.rows * G.ts + 20);
      for (r = 0; r < R.rows; r++) for (c = 0; c < R.cols; c++) drawTile(G, c, r, R.map[r][c]);
      /* coordinates: files below (G..A left to right), ranks at the left (1 at the top), as in the game */
      g.fillStyle = '#c9b48a'; g.font = '700 ' + Math.round(G.ts * .3) + 'px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (c = 0; c < R.cols; c++) g.fillText(fileName(c), G.x0 + (c + .5) * G.ts, G.y0 + R.rows * G.ts + G.ts * .3);
      for (r = 0; r < R.rows; r++) g.fillText(String(r + 1), G.x0 - G.ts * .3, G.y0 + (r + .5) * G.ts);
      var ens = liveEnemies();
      /* patrols: a ghost of the piece on its next square, an arrow, and red danger when it will capture */
      if (!R.cleared) ens.forEach(function (e) {
        var pl = e.plan; if (!pl || R.phase === 'white') return;
        if (pl.cap) { g.fillStyle = 'rgba(194,39,45,.55)'; g.fillRect(G.x0 + pl.c * G.ts, G.y0 + pl.r * G.ts, G.ts, G.ts); }
        else if (!pl.blocked) drawPiece(G, e, pl);
        arrow(G, { x: e.c, y: e.r }, pl, pl.cap ? '#ff5a5a' : pl.blocked ? 'rgba(200,200,200,.4)' : 'rgba(215,245,255,.85)');
      });
      if (R.info && !R.info.dead) { moves(R.info).forEach(function (m) { if (R.info.t !== 'p' || m.c !== R.info.c) { g.fillStyle = 'rgba(194,39,45,.28)'; g.fillRect(G.x0 + m.c * G.ts, G.y0 + m.r * G.ts, G.ts, G.ts); } }); }
      var p = R.sel;
      if (p && p.c >= 0 && R.phase !== 'white') {
        g.strokeStyle = '#f3d36b'; g.lineWidth = 5; g.strokeRect(G.x0 + p.c * G.ts + 3, G.y0 + p.r * G.ts + 3, G.ts - 6, G.ts - 6);
        if (R.phase === 'player' && !p.moved && R.mode === 'move') moves(p).forEach(function (m) {
          if (m.cap) { g.fillStyle = 'rgba(194,39,45,.6)'; g.fillRect(G.x0 + m.c * G.ts, G.y0 + m.r * G.ts, G.ts, G.ts); g.fillStyle = '#fff'; g.font = '700 ' + Math.round(G.ts * .4) + 'px system-ui'; g.fillText('⚔', G.x0 + (m.c + .5) * G.ts, G.y0 + (m.r + .2) * G.ts); }
          else brackets(G.x0 + m.c * G.ts, G.y0 + m.r * G.ts, G.ts, COL.gold);
        });
        if (R.phase === 'player' && R.mode === 'hop') [[2, 0], [-2, 0], [0, 2], [0, -2]].forEach(function (d) { brackets(G.x0 + (p.c + d[0]) * G.ts, G.y0 + (p.r + d[1]) * G.ts, G.ts, '#ff9be0'); });
        if (R.phase === 'player' && R.mode === 'pull') { g.strokeStyle = 'rgba(185,167,255,.8)'; g.lineWidth = 3; g.strokeRect(G.x0 + (p.c - 2) * G.ts, G.y0 + (p.r - 2) * G.ts, G.ts * 5, G.ts * 5); }
      }
      ens.concat(onBoard()).sort(function (a, b) { return a.r - b.r; }).forEach(function (q) { drawPiece(G, q); });
      ens.forEach(function (e) { if (e.plan && e.plan.blocked && R.phase === 'player') { g.fillStyle = '#ffe27a'; g.font = '800 ' + Math.round(G.ts * .34) + 'px system-ui'; g.textAlign = 'center'; g.fillText('?', G.x0 + (e.c + .82) * G.ts, G.y0 + (e.r + .2) * G.ts); } });
      /* fx */
      R.fx = R.fx.filter(function (f) {
        f.t += dt || 0; var x = G.x0 + (f.c + .5) * G.ts, y = G.y0 + (f.r + .5) * G.ts;
        if (f.k === 'burst') { var k = f.t / .45; if (k > 1) return false; g.fillStyle = 'rgba(255,240,220,' + (1 - k) + ')'; for (var i = 0; i < 8; i++) { var a = i / 8 * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(a) * k * G.ts * .6, y + Math.sin(a) * k * G.ts * .6, G.ts * .08 * (1 - k) + 2, 0, Math.PI * 2); g.fill(); } return true; }
        if (f.k === 'ring') { var q = f.t / .5; if (q > 1) return false; g.strokeStyle = f.col; g.globalAlpha = 1 - q; g.lineWidth = 5; g.beginPath(); g.arc(x, y, G.ts * (.2 + .4 * q), 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; return true; }
        if (f.k === 'text') { var u = f.t / 1.2; if (u > 1) return false; g.globalAlpha = 1 - u; g.fillStyle = f.col; g.font = '800 ' + Math.round(G.ts * .26) + 'px system-ui'; g.textAlign = 'center'; g.fillText(f.text, x, y - G.ts * (.3 + .5 * u)); g.globalAlpha = 1; return true; }
        if (f.k === 'confused') { var v = f.t / .9; if (v > 1) return false; g.fillStyle = 'rgba(255,226,122,' + (1 - v) + ')'; g.font = '800 ' + Math.round(G.ts * .45) + 'px system-ui'; g.textAlign = 'center'; g.fillText('?', x, y - G.ts * (.45 + .2 * v)); return true; }
        if (f.k === 'banner') { var b = f.t / 1.4; if (b > 1) return false; g.globalAlpha = Math.min(1, 3 * (1 - b)); g.fillStyle = 'rgba(15,10,18,.85)'; g.fillRect(0, 430, W, 120); g.fillStyle = COL.gold; g.font = '700 60px Cinzel, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(f.text, W / 2, 490); g.globalAlpha = 1; return true; }
        return false;
      });
      drawArmy(); drawMana();
    }
    function tick(dt, t) {
      lastT = t;
      if (R) { onBoard().concat(R.enemies).forEach(function (p) { if (p.at < 1) p.at = Math.min(1, p.at + dt / 0.2); }); }
      draw(dt);
    }

    /* QA handle (tools/qa_opk.py): read-only state + tile geometry, and a node jump for headless room tests */
    host.el.__opk = { S: function () { return S; }, R: function () { return R; }, geo: function () { return R ? geo() : null; },
      jump: function (i, army) { closePanel(); S.army = (army || ['p']).map(function (t, k) { return mk(t, 'b', k ? TNAME[t] : 'Pongement', !k); }); S.keys = 1; S.shards = 60; S.over = false; S.node = i - 1; nextNode(); } };
    cv.addEventListener('pointerdown', onDown);
    cv.addEventListener('contextmenu', onCtx);
    return {
      start: function () { newRun(); host.loop(tick); },
      newGame: function () { closePanel(); newRun(); },
      stop: function () { cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('contextmenu', onCtx); closePanel(); if (bar) bar.remove(); bar = null; },
      key: function (k, down) {
        if (!down || !R || S.over || panel) return;
        if (k === 'left' || k === 'up') { if (R.phase !== 'white') cycle(-1); }
        else if (k === 'right' || k === 'down') { if (R.phase !== 'white') cycle(1); }
        else if (k === 'action' || k === 'jump') { if (R.phase === 'place') startBattle(); else endTurn(); }
        renderBar();
      },
      resize: function () { draw(0); },
      redraw: function () { draw(0); }
    };
  });
})();
