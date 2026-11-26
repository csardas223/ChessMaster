/* g5_troll: King of the Bridge ("the 11th edition of Advanced Troll Chess"). You play White against the Troll, who
   cheats. Press "Accuse" (or Space) right after a Troll move, then pick the rule it broke:
     correct -> the cheating piece is arrested (removed from the board)
     wrong   -> params.falseAccusation: 'lose' (you lose at once, Impatience run) | 'forfeit' (your turn is
                forfeited and the Troll's next move is a revenge cheat)
   An un-accused cheat stands once you move. Troll rules modelled (rule hooks, pure):
     Rule 4: pawns are small-minded: they step one square forward, sideways or back (double step from the start),
             and capture diagonally forward only
     Rule 9: only the knight can jump over other pieces          Rule 12: the queen may not capture the king
     Rule 11: when the Troll's king dies the crown passes to another Troll piece (the game goes on)
     Rule 10: if your king dies (checkmate) the Troll wins.     You win when every Troll piece is gone.
   Cheats the Troll uses (game hook botPick fabricates the move): rule 2 (moves one of YOUR pieces), rule 4 (pawn
   walks diagonally without capturing), rule 9 (a slider jumps over a piece), rule 13 (a bishop steps straight).
   Mode params: cheatChance (0.25), falseAccusation, goose: { after_ply, after_catches } (Goose ending: the goose
   swoops in and carries off one Troll piece per turn), timer: true (speedrun clock, Impatience < 15:00).
   Pass 2 (all optional, older mode files keep working):
     unlock: { ruleNumber: ply }   hidden rules: a rule joins the rule book (gong + page flash) at that ply; the Troll
                                   only breaks rules that are already in the book
     slippery: ['d4', ...]         slippery tiles: a non-king piece that lands there is knocked over (rotated); it
                                   cannot move until its owner spends a turn standing it up (tap it, then its square).
                                   A queen that slips flips the board.
     payback: true                 after a correct accusation your next move may be one cheat: any of your pieces
                                   may step one square like a king
     intro: [lines], gooseLines: [lines], gooseEnd: [lines]   skippable dialogue boxes with the troll / goose portrait
     trollImg, gooseImg, sounds gong / arrest / honk / achievement (from the mode's sounds map)
   Pass 3 (acc 2026-11-26, M0rsyuvaTrk + WEYUcaJTBso; rule text from the in-game rule book as transcribed in the Steam
   guide "Rule Book: 11th Edition of Advanced Troll Chess" and read aloud in both videos; all optional):
     fullBook: true      the real rule numbers 00-29: 2 own colour, 3 you may move the other colour's queen, 4/6 pawns
                         step N/E/W and back (no diagonals), 7 horse guy (knight), 9 only he jumps, 12 crown guy is lazy
                         (one square), 13 bishop X, 14 towers (straight lines), 15+25 only bishops work out of town,
                         20 pawns on the far rank ascend, 21 a queen capture mirrors the world, 22 bishops drop a gift
                         of knowledge (landmine) on the tile they leave, 24 no two pieces on one tile, 26 slippery tiles,
                         27 do not move the gifts, 29 the queen may not touch the king. Extra Troll cheats: 7 (knight
                         steps like a king), 12 (king walks two squares), 14 (tower steps diagonally), 24 (stacks on his
                         own piece), 25 (non-bishop walks out of town), 27 (moves a gift).
     outOfTown: true     the board file is 10x10: the outer ring is "out of town" (only bishops may go there; a piece
                         that got there by cheating may walk back in, no rule forbids it: M0rsyuvaTrk 4:12)
     gifts: true, giftImg  rule 22 landmines; any piece that lands on one is blown up with it; sliders pass over them
     payback: 'any'      rule 00 as in the game: after a correct accusation you may move ANY piece anywhere for one move:
                         your pieces, the Troll's pieces (drop one on a gift), or tap a gift and then a Troll piece to drop
                         the gift on it (M0rsyuvaTrk 2:33 'grab this bishop, drop it on the gift', 8:26 'capture the
                         king with the gift')
     ascend, queenMirror, slipRandom: n (n hidden slippery tiles in the middle four rows, revealed when someone slips),
     hidden: [rule numbers]  rules that join the book (gong) the first time the game uses them
     endCutscene: [lines]    win cutscene: the Troll's last words, then you become the Troll (the timer stops after it) */
(function () {
  'use strict';
  var CM = window.CM;
  var RULES = [
    { n: 2, t: 'You may only move your own coloured pieces.' },
    { n: 4, t: 'Pawns are small-minded: one step forward, sideways or back; they only capture diagonally forward.' },
    { n: 9, t: 'Only the knight (horse guy) can jump over other pieces.' },
    { n: 29, t: 'Royal affair: the queen may not capture the king.' },
    { n: 13, t: 'The bishop travels in an X (diagonals only).' }
  ];
  /* the real book (fullBook), wording from the game's pages as read in the videos */
  var BOOK = [
    { n: 0, t: 'If you catch the other colour cheating you may cheat during your turn as payback.', info: 1 },
    { n: 1, t: 'If you falsely accuse the other colour of cheating, your turn is forfeited and they may cheat as revenge.', info: 1 },
    { n: 2, t: 'You can only move your own coloured pieces. Do not move the other pieces please.' },
    { n: 3, t: 'You can also move the queens of the other colour.', info: 1 },
    { n: 4, t: 'Pawns move like this (one step forward, left or right) because they are small minded. Never diagonally.' },
    { n: 6, t: 'Pawns can also move backwards actually.', info: 1 },
    { n: 7, t: 'Horse guy can also move like this in four directions. He is troubled. (He must trot, canter or gallop: the L-jump only.)' },
    { n: 9, t: 'Only HE (the horse) can jump over other pieces.' },
    { n: 10, t: 'If the White King dies, Black wins the game.', info: 1 },
    { n: 11, t: 'If the Black King dies, the crown is given to another member of the royal guard. The perpetual cycle continues.', info: 1 },
    { n: 12, t: 'Crown guy can do as he pleases. But he is also lazy. He moves like this (one square).' },
    { n: 13, t: 'The Bishop is a vital piece in the chess arsenal. He travels in the direction of X.' },
    { n: 14, t: "Towers can't normally move. But in this world of abstraction, he can move as well (straight lines only)." },
    { n: 15, t: 'Bishops work out of town as well. They can leave the town and still come home for supper!', info: 1 },
    { n: 20, t: 'Any pawn that reaches the great beyond (the furthest row) ascends.', info: 1 },
    { n: 21, t: 'If the queen captures a piece, the world flips upside down but like. sideways.', info: 1 },
    { n: 22, t: 'Bishops drop their gift of knowledge when they leave a tile! The horse is not the only one who can jump over this!', info: 1 },
    { n: 24, t: 'Do not walk in each other\'s shoes. It makes it hard to see who is who. (No two pieces on one tile.)' },
    { n: 25, t: 'No pieces can move outside of the board unless they work out of town.' },
    { n: 26, t: 'Some tiles are slippery! Watch out!', info: 1 },
    { n: 27, t: 'Do not look a horse in the mouth! Do not move the gifts when they have been given.' },
    { n: 29, t: 'The queen may not have an affair! If she touches the opposing King it is considered cheating!' }
  ];
  function book(P) { return P && P.fullBook ? BOOK : RULES; }
  var VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
  function css() {
    if (document.getElementById('g5-troll-css')) return;
    var s = document.createElement('style'); s.id = 'g5-troll-css';
    s.textContent = '.g5troll{display:flex;gap:8px;justify-content:center;align-items:center;margin:2px 0 6px;flex-wrap:wrap}' +
      '.g5troll button{font:600 14px system-ui,sans-serif;padding:8px 14px;border-radius:6px;border:0;background:#c64a3b;color:#fff;cursor:pointer;box-shadow:0 3px 0 #8a2f25}' +
      '.g5troll button:active{transform:translateY(2px);box-shadow:0 1px 0 #8a2f25}' +
      '.g5troll__book{position:fixed;inset:auto 0 0 0;z-index:80;background:#2b2926;color:#eee;border-radius:12px 12px 0 0;padding:14px 14px 18px;box-shadow:0 -6px 24px rgba(0,0,0,.5);max-height:70vh;overflow:auto;animation:g5tb .22s ease-out}' +
      '@keyframes g5tb{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}' +
      '.g5troll__book h3{margin:0 0 8px;font:700 16px system-ui,sans-serif;color:#e8c547}' +
      '.g5troll__book button{display:block;width:100%;text-align:left;margin:6px 0;padding:10px 12px;border-radius:6px;border:1px solid #3d3a36;background:#3a3733;color:#eee;font:500 14px/1.3 system-ui,sans-serif;cursor:pointer}' +
      '.g5troll__book button:hover{background:#4a4642}.g5troll__book .x{background:transparent;border:0;text-align:center;color:#aaa}' +
      '.g5goose{position:absolute;width:34%;pointer-events:none;z-index:5}' +
      '.g5troll__dlg{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);width:min(92vw,460px);z-index:85;display:flex;gap:10px;align-items:center;background:#1d1b19;border:3px solid #e8d9a8;box-shadow:0 0 0 3px #1d1b19,0 8px 24px rgba(0,0,0,.5);padding:10px 12px;color:#f4ecd2;font:600 15px/1.35 ui-monospace,Menlo,monospace;cursor:pointer;animation:g5tb .22s ease-out;image-rendering:pixelated}' +
      '.g5troll__dlg img{width:56px;height:56px;flex:none}.g5troll__dlg p{margin:0;flex:1}.g5troll__dlg small{position:absolute;right:8px;bottom:2px;font-size:10px;opacity:.6}' +
      '.g5troll__book--paper{background:#efe4c4 no-repeat right 8px top 8px/110px auto;color:#2a2418}.g5troll__book--paper h3{color:#5a3d16;padding-right:110px}.g5troll__book--paper button{background:#f8f0da;border-color:#c9b98f;color:#2a2418}.g5troll__book--paper button:hover{background:#fff7e2}' +
      '.g5troll-down .pc{transform:rotate(90deg) scale(.9);transition:transform .2s ease-out}.g5troll-slip{background-image:linear-gradient(135deg,rgba(160,220,255,.35) 25%,transparent 25%,transparent 50%,rgba(160,220,255,.35) 50%,rgba(160,220,255,.35) 75%,transparent 75%)!important;background-size:12px 12px!important;box-shadow:inset 0 0 0 2px rgba(160,220,255,.6)}' +
      '.g5troll-town{background:#34483c!important;box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)}.g5troll__gift{position:absolute;left:15%;top:28%;width:70%;height:auto;image-rendering:pixelated;pointer-events:none;z-index:1}.g5troll-giftsel{box-shadow:inset 0 0 0 3px #e8c547!important}.g5troll-stack .pc{filter:drop-shadow(3px -3px 0 rgba(0,0,0,.55))}' +
      '.g5troll__end{display:flex;flex-direction:column;align-items:center;gap:6px;background:#1d1b19;border:3px solid #e8d9a8;padding:14px 18px;color:#f4ecd2;font:600 15px/1.3 ui-monospace,Menlo,monospace;text-align:center}.g5troll__end img{width:96px;height:96px;image-rendering:pixelated}.g5troll__end b{font-size:17px}' +
      '.g5troll__timer{font:700 14px ui-monospace,Menlo,monospace;background:#111;color:#7CFC7C;padding:6px 10px;border-radius:4px;border:2px solid #333;min-width:64px;text-align:center}' +
      '.g5troll__ach{display:flex;gap:10px;align-items:center;position:absolute;left:50%;top:10px;transform:translateX(-50%);background:#232323;color:#fff;border:2px solid #e8c547;border-radius:8px;padding:8px 12px;font:600 14px/1.3 system-ui,sans-serif;width:max-content;max-width:min(92vw,420px);box-sizing:border-box}.g5troll__ach b{color:#e8c547;display:block}';
    document.head.appendChild(s);
  }
  function bar() { return document.querySelector('.g5troll'); }
  /* skippable dialogue: lines shown one at a time in a pixel-style box with a portrait; tap to advance */
  function dialogue(ctx, lines, img, done) {
    if (!lines || !lines.length) { if (done) done(); return null; }
    css(); var old = document.querySelector('.g5troll__dlg'); if (old) old.remove();
    var el = document.createElement('div'), k = 0; el.className = 'g5troll__dlg'; el.setAttribute('role', 'dialog');
    function show() { el.innerHTML = (img ? '<img src="' + img + '" alt="">' : '') + '<p>' + CM.util.esc(lines[k]) + '</p><small>' + (k < lines.length - 1 ? 'tap to continue' : 'tap to close') + ' · Esc skips</small>'; }
    function close() { if (!el.parentNode) return; el.remove(); document.removeEventListener('keydown', kh); if (done) done(); }
    function kh(e) { if (e.key === 'Escape') close(); }
    el.onclick = function () { k++; if (k >= lines.length) close(); else show(); };
    document.addEventListener('keydown', kh); show(); document.body.appendChild(el);
    return el;
  }
  /* the goose flies across the board over square i (original sprite), ~900 ms, fades under reduced motion */
  function swoop(ctx, i, img) {
    var cell = document.querySelector('.sq[data-i="' + i + '"]'), board = cell && cell.offsetParent; if (!board) return;
    var g = document.createElement('img'); g.src = img; g.className = 'g5goose'; g.alt = '';
    var y = cell.offsetTop - cell.offsetHeight * 0.6; g.style.top = y + 'px'; g.style.left = '-35%'; board.appendChild(g);
    var red = CM.settings.reducedMotion && CM.settings.reducedMotion();
    var a = g.animate(red ? [{ opacity: 0, left: cell.offsetLeft + 'px' }, { opacity: 1 }, { opacity: 0 }] : [{ left: '-35%' }, { left: (cell.offsetLeft - cell.offsetWidth * 0.5) + 'px', offset: 0.5 }, { left: '105%' }], { duration: 950, easing: 'ease-in-out' });
    a.onfinish = function () { g.remove(); };
  }
  /* a rule is in the book: not hidden behind a ply unlock and (rules in params.hidden) already revealed by use */
  function known(P, st, n) {
    var U = P.unlock; if (U && U[n] != null && st.ply < U[n]) return false;
    if (P.hidden && P.hidden.indexOf(n) >= 0 && !(st.x && st.x.rev && st.x.rev[n])) return false;
    return true;
  }
  function unlocked(ctx, n) { return known(ctx.params, ctx.state, n); }
  function closeBook() { var b = document.querySelector('.g5troll__book'); if (b) b.remove(); }
  function fmt(ms) { var s = Math.floor(ms / 1000); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  /* out of town: the outer ring of the 10x10 board file */
  function ring(V, i) { var P = V.cfg.params || {}, g = V.geo; if (!P.outOfTown || i < 0) return false; var c = g.col(i), r = g.row(i); return c === 0 || r === 0 || c === g.files - 1 || r === g.ranks - 1; }
  function mirror(V, i) { var g = V.geo; return g.idx(g.files - 1 - g.col(i), g.row(i)); }
  function gifts(st) { return (st.x && st.x.gifts) || {}; }
  /* slippery squares (indices) in the current orientation: params.slippery names or the per-game random set x.slip */
  function slipSet(V, st) {
    var P = V.cfg.params || {}, names = (st.x && st.x.slip) || P.slippery || [], o = {};
    names.forEach(function (n) { var i = V.geo.parse(n); if (i >= 0) o[st.x && st.x.mir ? mirror(V, i) : i] = 1; });
    return o;
  }
  function reveal(n, rule) { n.x.rev = Object.assign({}, n.x.rev || {}); n.x.rev[rule] = 1; }
  var K8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function okTarget(b, j, me) { return j >= 0 && (!b[j] || (b[j].c !== me && b[j].c !== 'n' && b[j].t !== 'K')); }

  /* fabricate a cheat for the Troll (colour b) in the current state; returns a move or null */
  function makeCheat(ctx) {
    var V = ctx.V, g = V.geo, st = ctx.state, b = st.b, me = st.turn, opts = [], P = ctx.params, full = !!P.fullBook, G = gifts(st);
    function mv(rule, i, j, extra) { opts.push({ rule: rule, m: Object.assign({ f: i, t: j, p: b[i].t, c: me, cap: b[j] || null, capSq: b[j] ? j : undefined }, extra || {}) }); }
    b.forEach(function (p, i) {
      if (!p || p.c === 'n') return;
      if (p.c === me && p.t === 'P') {   /* rule 4: diagonal step onto an empty square */
        [-1, 1].forEach(function (dc) { var j = g.step(i, dc, me === 'b' ? 1 : -1); if (j >= 0 && !b[j] && !G[j]) opts.push({ rule: 4, m: { f: i, t: j, p: 'P', c: me, cap: null } }); });
      }
      if (p.c === me && p.t === 'B') {   /* rule 13: a bishop steps straight */
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var j = g.step(i, d[0], d[1]); if (okTarget(b, j, me) && !G[j]) mv(13, i, j); });
      }
      if (p.c === me && (p.t === 'R' || p.t === 'B' || p.t === 'Q')) {   /* rule 9: jump exactly one piece */
        var D = p.t === 'R' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : p.t === 'B' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : K8;
        D.forEach(function (d) {
          var j = g.step(i, d[0], d[1]); if (j < 0 || !b[j]) return; var k = g.step(j, d[0], d[1]);
          if (okTarget(b, k, me) && !G[k] && !(P.outOfTown && p.t !== 'B' && ring(V, k))) mv(9, i, k);
        });
      }
      if (p.c !== me && p.t !== 'K') {   /* rule 2: shove one of your pieces one square back toward you */
        var j2 = g.step(i, 0, 1); if (j2 >= 0 && !b[j2] && !G[j2] && !ring(V, j2)) opts.push({ rule: 2, m: { f: i, t: j2, p: p.t, c: me, cap: null, foreign: 1 } });
      }
      if (!full || p.c !== me) return;
      /* Steam guide (SunMoonFX) on the Troll's habits: knights step like a king, the king walks two squares, towers step one
         diagonal; WEYUcaJTBso 29:24 "Black Knight's not trot, canter or gallop" (rule 7), 7:04 / 7:23 rules 12 and 14 */
      if (p.t === 'N') K8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (okTarget(b, j, me) && !G[j] && !ring(V, j)) mv(7, i, j); });
      if (p.t === 'K') [[2, 0], [-2, 0], [0, 2], [0, -2]].forEach(function (d) { var j = g.step(i, d[0], d[1]); if (okTarget(b, j, me) && !G[j] && !ring(V, j)) mv(12, i, j); });
      if (p.t === 'R') [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (d) { var j = g.step(i, d[0], d[1]); if (okTarget(b, j, me) && !G[j] && !ring(V, j)) mv(14, i, j); });
      /* rule 25: a piece that does not work out of town walks off the board (M0rsyuvaTrk 2:15 pawn, 8:07 king) */
      if (P.outOfTown && p.t !== 'B' && !ring(V, i)) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && ring(V, j) && !b[j] && !G[j]) mv(25, i, j); });
      /* rule 24: walks in another Troll piece's shoes (stacks on it; the piece underneath comes back when he is arrested) */
      if (p.t !== 'K') K8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0 && b[j] && b[j].c === me && b[j].t !== 'K' && !b[j].under && !b[i].under) opts.push({ rule: 24, m: { f: i, t: j, p: p.t, c: me, cap: null, stack: 1 } }); });
    });
    /* rule 27: he moves one of the gifts one square (the move is encoded on his king's square, which stays put) */
    if (full && P.gifts) {
      var ks = -1; b.forEach(function (p, i) { if (p && p.c === me && p.t === 'K') ks = i; });
      if (ks >= 0) Object.keys(G).forEach(function (k) { k = +k; K8.forEach(function (d) { var j = g.step(k, d[0], d[1]); if (j >= 0 && !b[j] && !G[j]) opts.push({ rule: 27, m: { f: ks, t: ks, p: 'K', c: me, cap: null, giftMove: { from: k, to: j } } }); }); });
    }
    opts = opts.filter(function (o) { return unlocked(ctx, o.rule); });
    if (!opts.length) return null;
    /* prefer cheats that win material, else any */
    opts.sort(function (a, b2) { return ((b2.m.cap ? VAL[b2.m.cap.t] || 0 : 0) - (a.m.cap ? VAL[a.m.cap.t] || 0 : 0)); });
    var top = opts.filter(function (o) { return o.m.cap; });
    var o = top.length && Math.random() < 0.6 ? top[0] : ctx.pick(opts);
    o.m.cheat = o.rule; return o.m;
  }
  function crownTransfer(V, b) {
    var best = -1, bv = -1;
    for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === 'b' && p.t !== 'K') { var v = VAL[p.t] != null ? VAL[p.t] : 1; if (v > bv) { bv = v; best = i; } } }
    if (best >= 0) b[best] = Object.assign({}, b[best], { t: 'K', crowned: 1 });
    return best;
  }
  function accuse(ctx, rule) {
    closeBook();
    var x = ctx.state.x, ch = x.cheat, P = ctx.params;
    if (ctx.over || ctx.state.turn !== ctx.human || ctx.game.busy) return;
    if (ch && ch.rule === rule) {
      var at = ch.to, p = ctx.at(at);
      if (ch.gift) { var G = Object.assign({}, gifts(ctx.state)); delete G[at]; ctx.setX('gifts', G); }
      else if (p && p.c === ctx.bot) {
        if (p.under) ctx.set(at, p.under);   /* rule 24: the piece underneath stays */
        else if (p.t === 'K') { ctx.remove(at); var nb = ctx.state.b, k = crownTransfer(ctx.V, nb); if (k >= 0) ctx.set(k, nb[k]); }
        else ctx.remove(at);
      }
      ctx.setX('cheat', null); ctx.setX('caught', (x.caught || 0) + 1);
      if (P.payback) {
        ctx.setX('payback', 1);
        ctx.after(900, function () { ctx.toast(P.payback === 'any' ? 'YOU MAY CHEAT THIS TURN: move any piece anywhere. Drop a Troll piece on a gift, or tap a gift and then a Troll piece.' : 'Payback! This turn any of your pieces may also step one square like a king.', 3400); });
      }
      ctx.sound(ctx.spec.sounds && ctx.spec.sounds.arrest ? 'arrest' : 'notify'); ctx.toast('Rule ' + rule + '! Officer, arrest him. ' + (ch.gift ? 'The moved gift is taken away.' : 'The cheating piece is taken away.'), 2600);
      ctx.fx({ type: 'flash', color: '#e8c547', opacity: 0.35, at: at });
      ctx.refresh(); return;
    }
    ctx.setX('cheat', null);
    if ((P.falseAccusation || 'forfeit') === 'lose') { ctx.sound('illegal'); ctx.endGame('bot', 'false accusation (rule ' + rule + ')'); return; }
    ctx.sound('illegal'); ctx.toast('False accusation! Your turn is forfeited and the Troll cheats as revenge.', 2800);
    ctx.setX('revenge', 1);
    var st = ctx.state; st.turn = ctx.bot; ctx.refresh(); ctx.game.afterChange();
  }
  function openBook(ctx) {
    css(); closeBook(); if (ctx.over) return;
    var el = document.createElement('div'); el.className = 'g5troll__book'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Rule book');
    el.innerHTML = '<h3>Rule book: which rule did the Troll break?</h3>' + book(ctx.params).filter(function (r) { return unlocked(ctx, r.n); }).map(function (r) { return '<button type="button" data-r="' + r.n + '"><b>Rule ' + (r.n < 10 ? '0' : '') + r.n + '.</b> ' + r.t + '</button>'; }).join('') +
      '<button type="button" class="x" data-r="x">Close</button>';
    el.onclick = function (e) { var b = e.target.closest('[data-r]'); if (!b) return; if (b.dataset.r === 'x') return closeBook(); accuse(ctx, +b.dataset.r); };
    if (ctx.params.bookImg) el.classList.add('g5troll__book--paper'), el.style.backgroundImage = 'url("' + ctx.params.bookImg + '")';
    document.body.appendChild(el);
  }
  var keyH = null, T0 = 0;
  function mount(ctx) {
    css(); var old = bar(); if (old) old.remove();
    var st = document.getElementById('status'); if (!st || !st.parentNode) return;
    var d = document.createElement('div'); d.className = 'g5troll';
    d.innerHTML = (ctx.params.timer ? '<span class="g5troll__timer">0:00</span>' : '') + '<button type="button" data-a="acc" title="Space">Accuse (Space)</button>';
    d.onclick = function (e) { if (e.target.closest('[data-a]')) openBook(ctx); };
    st.parentNode.insertBefore(d, st.nextSibling);
    if (keyH) document.removeEventListener('keydown', keyH);
    keyH = function (e) { if (e.code === 'Space' && CM.app.view === 'game' && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) { e.preventDefault(); openBook(ctx); } };
    document.addEventListener('keydown', keyH);
  }
  function unmount() { var b = bar(); if (b) b.remove(); closeBook(); if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; } var g = document.querySelector('.g5goose'); if (g) g.remove(); var dl = document.querySelector('.g5troll__dlg'); if (dl) dl.remove(); }

  /* acc 2026-11-26 (Y7KKKTTkwNk transcript 5:06-6:57): the goose swims up on its own after a while (cheating or not, 1:04), you
     put it on the board, grab the Troll's King and put him on the goose, and it carries him off: the "Bon Voyage" ending, where
     you got rid of the Troll but stay on the bridge as the new Troll (same as the cheating ending). params.goose.carry = true. */
  function gooseButton(ctx) {
    var b = bar(); if (!b || b.querySelector('[data-a="goose"]')) return;
    var btn = document.createElement('button'); btn.type = 'button'; btn.dataset.a = 'goose'; btn.textContent = 'Put the King on the goose';
    btn.onclick = function (e) { e.stopPropagation(); carry(ctx); };
    b.appendChild(btn);
  }
  function carry(ctx) {
    if (ctx.over || ctx.state.turn !== ctx.human || ctx.game.busy) { ctx.toast('Wait for your turn.', 1400); return; }
    var P = ctx.params, k = ctx.pieces(function (p) { return p.c === ctx.bot && p.t === 'K'; })[0];
    if (k == null) return;
    if (P.gooseImg) swoop(ctx, k, P.gooseImg);
    if (ctx.spec.sounds && ctx.spec.sounds.honk) ctx.sound('honk');
    ctx.fx({ type: 'flash', color: '#f5f1e6', opacity: 0.5, at: k });
    var btn = document.querySelector('.g5troll [data-a="goose"]'); if (btn) btn.remove();
    ctx.after(500, function () { ctx.endGame('player', P.goose.why || 'the goose carried the Troll away'); ctx.remove(k); ctx.game.render(); });
  }
  /* payback 'any' (rule 00): every move the cheat turn allows. Pure; only built on White's payback turn. */
  function anyMoves(V, st, out) {
    var b = st.b, G = gifts(st), have = {};
    out.forEach(function (m) { have[m.f + ',' + m.t] = 1; });
    for (var f = 0; f < b.length; f++) {
      var p = b[f]; if (!p || p.c === 'n' || p.down) continue;
      if (p.c === 'b') Object.keys(G).forEach(function (g) { g = +g; out.push({ f: f, t: f, p: p.t, c: 'w', cap: null, giftHit: g, payback: 1, special: true }); });
      for (var t = 0; t < b.length; t++) {
        if (t === f || have[f + ',' + t]) continue; var q = b[t];
        if (p.c === 'w') { if (q && q.c !== 'b') continue; out.push({ f: f, t: t, p: p.t, c: 'w', cap: q || null, capSq: q ? t : undefined, payback: 1 }); }
        else if (!q && p.t !== 'K' || (!q && G[t])) out.push({ f: f, t: t, p: p.t, c: 'w', cap: null, foreign: 1, payback: 1 });
      }
    }
    return out;
  }
  /* rule 3: either side may also move the other colour's queen (normal queen moves, no captures; a gift still blows her up) */
  function queenMoves(V, st, out) {
    var b = st.b, g = V.geo, me = st.turn, P = V.cfg.params || {};
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!p || p.t !== 'Q' || p.c === me || p.c === 'n' || p.down) continue;
      K8.forEach(function (d) { var j = g.step(i, d[0], d[1]); while (j >= 0 && !b[j] && !(P.outOfTown && ring(V, j))) { out.push({ f: i, t: j, p: 'Q', c: me, cap: null, foreign: 1, rule3: 1 }); j = g.step(j, d[0], d[1]); } });
    }
    return out;
  }
  var giftSel = -1, revSeen = {}, endShown = 0;
  CM.defineHooks('g5_troll', {
    init: function (ctx) { css(); },
    setup: function (ctx) {
      mount(ctx); T0 = performance.now(); giftSel = -1; endShown = 0; revSeen = {};
      var P = ctx.params, g = ctx.geo;
      if (P.slipRandom) {   /* Steam guide: slippery tiles are hidden, laid out anew each game, only in the middle four rows */
        var off = P.outOfTown ? 1 : 0, rows = [], k;
        for (var r = 2; r <= 5; r++) for (var c = 0; c < 8; c++) rows.push(ctx.name(g.idx(c + off, r + off)));
        var pick = []; for (k = 0; k < P.slipRandom && rows.length; k++) pick.push(rows.splice(ctx.random(rows.length), 1)[0]);
        ctx.setX('slip', pick);
      }
    },
    onStart: function (ctx) { var P = ctx.params; if (P.intro) dialogue(ctx, P.intro, P.trollImg); },
    moves: function (V, st, out) {
      var P = V.cfg.params || {}, b = st.b, g = V.geo;
      if (P.slippery || P.slipRandom) {
        out = out.filter(function (m) { return !(m.f >= 0 && b[m.f] && b[m.f].down); });
        for (var i = 0; i < b.length; i++) if (b[i] && b[i].down && b[i].c === st.turn) out.push({ f: i, t: i, p: b[i].t, c: st.turn, cap: null, stand: 1 });
      }
      if (P.fullBook && known(P, st, 3)) out = queenMoves(V, st, out);
      if (P.payback === 'any' && st.x && st.x.payback && st.turn === 'w') return anyMoves(V, st, out);
      if (P.payback && st.x && st.x.payback && st.turn === 'w') {
        var have = {}; out.forEach(function (m) { have[m.f + ',' + m.t] = 1; });
        for (var j = 0; j < b.length; j++) {
          var p = b[j]; if (!p || p.c !== 'w' || p.down) continue;
          K8.forEach(function (d) {
            var k = g.step(j, d[0], d[1]); if (k < 0 || have[j + ',' + k]) return; var q = b[k];
            if (q && (q.c === 'w' || q.c === 'n')) return;
            out.push({ f: j, t: k, p: p.t, c: 'w', cap: q || null, capSq: q ? k : undefined, payback: 1 });
          });
        }
      }
      return out;
    },
    onExit: function () { unmount(); },
    onUndo: function (ctx) { closeBook(); giftSel = -1; },
    filterMoves: function (V, st, legal) {
      var P = V.cfg.params || {};
      return legal.filter(function (m) {
        if (m.payback) return true;
        /* rule 29 (royal affair): the queen never captures the king */
        if (m.p === 'Q' && m.cap && m.cap.t === 'K') return false;
        /* rule 25: only bishops work out of town */
        if (P.outOfTown && m.p !== 'B' && !m.stand && ring(V, m.t)) return false;
        return true;
      });
    },
    onMake: function (V, st, m, n) {
      var P = V.cfg.params || {}, g = V.geo, G0 = gifts(st), G = G0, mover = st.b[m.f];
      function setG(o) { G = o; n.x.gifts = o; }
      if (m.stand) { n.b[m.t] = Object.assign({}, st.b[m.f], { down: 0 }); n.x.lastTo = m.t; return; }
      if (m.giftMove) {   /* rule 27 cheat: a gift slides one square, nothing else moves */
        n.b[m.f] = st.b[m.f]; var gm = Object.assign({}, G0); delete gm[m.giftMove.from]; gm[m.giftMove.to] = 1; setG(gm); n.x.lastTo = m.giftMove.to; return;
      }
      if (m.giftHit != null) {   /* payback: a gift dropped on a Troll piece blows both up */
        n.b[m.t] = null; var gh = Object.assign({}, G0); delete gh[m.giftHit]; setG(gh); n.x.boom = m.t; n.x.cheated = 1; n.x.payback = 0;
        if (mover && mover.t === 'K' && mover.c === 'b') crownTransfer(V, n.b);
        n.x.lastTo = m.t; return;
      }
      if (m.stack) n.b[m.t] = Object.assign({}, n.b[m.t], { under: st.b[m.t] });
      /* rule 11: the Troll's crown passes on */
      if (m.cap && m.cap.t === 'K' && m.cap.c === 'b') crownTransfer(V, n.b);
      var to = m.t, landed = n.b[to];
      if (P.gifts && mover && mover.t === 'B' && m.f !== m.t) {   /* rule 22: the bishop leaves his gift of knowledge behind */
        var gd = Object.assign({}, G0); gd[m.f] = 1; setG(gd); if (P.hidden) { reveal(n, 22); reveal(n, 27); }
      }
      if (P.outOfTown && mover && mover.t === 'B' && ring(V, to) && P.hidden) { reveal(n, 15); reveal(n, 25); }
      if (P.hidden && mover && mover.t === 'P' && !m.payback && !m.foreign) { var dr = g.row(to) - g.row(m.f); if (dr === 0) reveal(n, 4); else if (dr === (mover.c === 'w' ? 1 : -1)) reveal(n, 6); }
      if (G[to] && landed) {   /* stepping on a gift: boom */
        var gb = Object.assign({}, G); delete gb[to]; setG(gb); n.b[to] = null; landed = null; n.x.boom = to;
        if (mover && mover.t === 'K' && mover.c === 'b' && !(m.cap && m.cap.t === 'K')) crownTransfer(V, n.b);
      }
      if (landed && (P.slippery || P.slipRandom) && landed.t !== 'K' && slipSet(V, st)[to]) {
        n.b[to] = landed = Object.assign({}, landed, { down: 1 });
        if (P.slipRandom || P.hidden) { n.x.slipSeen = Object.assign({}, st.x && st.x.slipSeen); n.x.slipSeen[st.x && st.x.mir ? mirror(V, to) : to] = 1; if (P.hidden) reveal(n, 26); }
      }
      if (landed && P.ascend && landed.t === 'P') {   /* rule 20: the great beyond */
        var off = P.outOfTown ? 1 : 0, far = landed.c === 'w' ? off : g.ranks - 1 - off;
        if (g.row(to) === far) { n.b[to] = null; landed = null; n.x.asc = (st.x && st.x.asc || 0) + 1; if (P.hidden) reveal(n, 20); }
      }
      if (P.queenMirror && m.cap && mover && mover.t === 'Q') {   /* rule 21: the world flips sideways */
        var nb = n.b.slice(); for (var i = 0; i < nb.length; i++) nb[i] = n.b[mirror(V, i)]; n.b.length = 0; Array.prototype.push.apply(n.b, nb);
        var gmir = {}; Object.keys(G).forEach(function (k) { gmir[mirror(V, +k)] = 1; }); setG(gmir);
        if (n.x.slipSeen) { var sm = {}; Object.keys(n.x.slipSeen).forEach(function (k) { sm[k] = 1; }); n.x.slipSeen = sm; }   /* stored unmirrored */
        n.x.mir = !(st.x && st.x.mir); to = mirror(V, to); if (P.hidden) reveal(n, 21);
      }
      n.x.lastTo = to;
      if (m.c === 'w' && st.x && st.x.payback) { n.x.payback = 0; if (m.payback) n.x.cheated = 1; }
      /* rule 11 again: a crown lost to a gift or a stack still passes on */
      var hasK = false, hasB = false; n.b.forEach(function (p) { if (p && p.c === 'b') { hasB = true; if (p.t === 'K') hasK = true; } });
      if (hasB && !hasK) crownTransfer(V, n.b);
    },
    onTap: function (ctx, i) {
      /* payback: tap a gift, then a Troll piece, to drop the gift on it */
      var P = ctx.params, G = gifts(ctx.state);
      if (P.payback !== 'any' || !ctx.state.x.payback || ctx.state.turn !== ctx.human || ctx.over) { giftSel = -1; return false; }
      if (G[i] && !ctx.at(i)) { giftSel = giftSel === i ? -1 : i; ctx.game.sel = -1; ctx.game.render(); return true; }
      if (giftSel >= 0) {
        var gs = giftSel; giftSel = -1;
        var m = ctx.game.moves.filter(function (q) { return q.giftHit === gs && q.t === i; })[0];
        if (m) { ctx.game.sel = -1; ctx.game.commit(m, {}); return true; }
        ctx.game.render();
      }
      return false;
    },
    decorate: function (ctx, i, p) {
      var P = ctx.params, st = ctx.state, c = [], html = '';
      if (P.slippery || P.slipRandom) {
        var shown = !P.slipRandom || (st.x.slipSeen && st.x.slipSeen[st.x.mir ? mirror(ctx.V, i) : i]);
        if (shown && slipSet(ctx.V, st)[i]) c.push('g5troll-slip');
      }
      if (P.outOfTown && ring(ctx.V, i)) c.push('g5troll-town');
      if (p && p.down) c.push('g5troll-down');
      if (p && p.under) c.push('g5troll-stack');
      if (P.gifts && gifts(st)[i]) { html = '<img class="g5troll__gift" src="' + (P.giftImg || '') + '" alt="gift">'; if (giftSel === i) c.push('g5troll-giftsel'); }
      return c.length || html ? { cls: c.join(' '), html: html, follow: false } : null;
    },
    checkWin: function (V, st) {
      var left = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'b') left++; }
      if (!left) return { w: 'w', why: "every Troll piece is gone: you cross the bridge" };
      if (!V.royals(st, 'w').length) return { w: 'b', why: 'your king died (rule 10)' };
      return null;
    },
    botPick: function (ctx, ranked) {
      var P = ctx.params, x = ctx.state.x, chance = P.cheatChance == null ? 0.25 : P.cheatChance;
      if (ctx.state.ply < 4 && !x.revenge) return null;
      if (x.revenge || Math.random() < chance) { var c = makeCheat(ctx); if (c) return c; }
      return null;
    },
    afterMove: function (ctx, m, info) {
      var P = ctx.params, U = P.unlock, x = ctx.state.x, B = book(P);
      function gong(n) { ctx.sound(ctx.spec.sounds && ctx.spec.sounds.gong ? 'gong' : 'notify'); ctx.fx({ type: 'flash', color: '#e8d9a8', opacity: 0.3, duration_ms: 400 }); var r = B.filter(function (q) { return q.n === +n; })[0]; ctx.toast('New page in the rule book: Rule ' + (n < 10 ? '0' : '') + n + (r ? '. ' + r.t : ''), 3400); }
      if (U) Object.keys(U).forEach(function (n) { if (U[n] === ctx.state.ply) gong(+n); });
      if (x.rev) Object.keys(x.rev).forEach(function (n) { if (!revSeen[n]) { revSeen[n] = 1; gong(+n); } });
      var to = x.lastTo != null ? x.lastTo : m.t, land = ctx.at(to);
      if (x.boom != null) { ctx.sound('capture'); ctx.fx({ type: 'flash', color: '#dca66a', opacity: 0.55, at: x.boom }); ctx.toast(m.giftHit != null ? 'The gift of knowledge goes off!' : 'Boom! That was a gift of knowledge (rule 22).', 2000); ctx.setX('boom', null); }
      if (x.asc) { if (x.asc !== x.ascSeen) { ctx.toast('The pawn reached the great beyond and ascends (rule 20).', 2400); ctx.setX('ascSeen', x.asc); } }
      if (land && land.down && !m.stand) { ctx.sound('illegal'); ctx.toast('Slippery! The ' + (land.t === 'Q' ? 'queen' : 'piece') + ' falls over. Tap it, then its own square, to stand it up.', 2600); if (land.t === 'Q' && ctx.game.flip && !P.queenMirror) { ctx.toast('The queen slipped and knocked the whole board around!', 2600); ctx.game.flip(); } }
      if (P.queenMirror && m.cap && info.piece && (info.piece.t || info.piece) === 'Q') ctx.toast('The queen captured: the world flips sideways (rule 21).', 2200);
      if (info.by === 'bot') {
        if (m.cheat) { ctx.setX('cheat', { rule: m.cheat, to: to, gift: m.giftMove ? 1 : 0 }); ctx.setX('revenge', 0); ctx.setX('cheats', (x.cheats || 0) + 1); }
        else ctx.setX('cheat', null);
      } else ctx.setX('cheat', null);
      var G = ctx.params.goose;
      if (G && !ctx.state.x.goose && ((ctx.state.ply >= (G.after_ply || 60)) || (G.after_catches != null && (ctx.state.x.caught || 0) >= G.after_catches))) {
        ctx.setX('goose', 1); ctx.toast('HONK. A goose rises from the water behind the bridge...', 3000); ctx.sound(ctx.spec.sounds && ctx.spec.sounds.honk ? 'honk' : 'notify');
        ctx.fx({ type: 'text', text: 'HONK!', color: '#f5f1e6', size: 48, duration_ms: 1400 });
        if (P.gooseLines) dialogue(ctx, P.gooseLines, P.trollImg);
        if (G.carry) gooseButton(ctx);
      }
      if (ctx.state.x.goose && info.by === 'player' && !G.carry) {
        var bs = ctx.pieces(function (p) { return p.c === ctx.bot; });
        if (bs.length) {
          var vic = bs.sort(function (a, b) { return (VAL[ctx.at(b).t] || 0) - (VAL[ctx.at(a).t] || 0); })[ctx.state.x.goose % 2 ? 0 : bs.length - 1];
          ctx.fx({ type: 'flash', color: '#f5f1e6', opacity: 0.5, at: vic });
          if (P.gooseImg) swoop(ctx, vic, P.gooseImg);
          if (ctx.spec.sounds && ctx.spec.sounds.honk) ctx.sound('honk');
          ctx.remove(vic); ctx.setX('goose', ctx.state.x.goose + 1);
          ctx.toast('The goose carries off a Troll piece!', 1600);
        }
      }
      return null;
    },
    onTick: function (ctx) {
      if (!ctx.params.timer || (ctx.over && !endShown)) return;
      if (endShown === 2) return;   /* timer stopped after the ending */
      var s = document.getElementById('status'); if (s && !ctx.over) s.textContent = ctx.hooks.status(ctx);
      var tm = document.querySelector('.g5troll__timer'); if (tm) tm.textContent = fmt(performance.now() - T0);
    },
    onGameOver: function (ctx, over) {
      closeBook();
      var P = ctx.params, won = over.w === ctx.human;
      if (won && P.gooseEnd && ctx.state.x.goose) dialogue(ctx, P.gooseEnd, P.gooseImg);
      function award() {
        var t = performance.now() - T0;
        if (P.timer && won && t < 15 * 60000) { ctx.sound(ctx.spec.sounds && ctx.spec.sounds.achievement ? 'achievement' : 'notify'); ctx.fx({ type: 'overlay', at: 'screen', html: '<div class="g5troll__ach"><span style="font-size:28px">&#9203;</span><span><b>Achievement unlocked</b>Impatience: beat the Troll in under 15:00</span></div>', duration_ms: 4200, fit: 'contain' }); }
        if (P.timer && won) ctx.toast(t < 15 * 60000 ? 'Impatience award: finished in ' + fmt(t) + ' (under 15:00)!' : 'Finished in ' + fmt(t) + ': too slow for the Impatience award (15:00).', 4200);
      }
      /* the ending cutscene (M0rsyuvaTrk 8:35-8:53, WEYUcaJTBso 48:16-49:22): the Troll's last words, then you become the
         Troll; the speedrun timer runs through it and stops at the end (M0rsyuvaTrk 8:44 "the in-game timer counts the
         beginning and the end of it"). Without a cheat of your own the Troll just lets you cross (inferred). */
      if (won && P.endCutscene && !ctx.state.x.goose) {
        endShown = 1;
        var cheated = !!ctx.state.x.cheated, x = ctx.state.x;
        var lines = cheated ? P.endCutscene : ['...', 'You never cheated once. Fine. Cross my bridge.'];
        dialogue(ctx, lines, P.trollImg, function () {
          var t = performance.now() - T0; endShown = 2;
          var tm = document.querySelector('.g5troll__timer'); if (tm) tm.textContent = fmt(t);
          if (cheated) ctx.fx({ type: 'overlay', at: 'screen', html: '<div class="g5troll__end"><img src="' + P.trollImg + '" alt=""><b>You remain on the bridge.</b><span>You became the Troll.</span></div>', duration_ms: 3600, fit: 'contain' });
          ctx.after(cheated ? 3600 : 0, award);
          var stats = 'Time ' + fmt(t) + ' · the Troll cheated ' + (x.cheats || 0) + ' times · you caught ' + (x.caught || 0);
          ctx.after(cheated ? 7900 : 300, function () {
            if (CM.gameUI && CM.gameUI.showOver) CM.gameUI.showOver({ result: 'win', why: (cheated ? 'You became the Troll. ' : 'You crossed the bridge. ') + stats, title: cheated ? 'Cheating Ending' : null, you: Object.assign({}, ctx.spec.player), opp: { name: ctx.spec.opponent.name, avatar: ctx.spec.opponent.avatar } });
          });
        });
        return true;
      }
      award();
    },
    status: function (ctx) {
      var x = ctx.state.x, t = ctx.params.timer ? fmt(performance.now() - T0) + '  ·  ' : '';
      if (x.payback && ctx.params.payback === 'any' && ctx.state.turn === ctx.human) return t + 'YOU MAY CHEAT THIS TURN';
      return t + 'Cheats caught ' + (x.caught || 0) + (x.goose ? '  ·  the Goose is here' : '');
    }
  });
})();
