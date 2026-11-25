/* Can I BEAT Gambonanza?  Chess roguelike on a mini board. Rules re-checked from the full transcript (g6b 2026-11-25,
   analyze_video; the old spec was low confidence):
   - run start: the piece wheel gives the army (Tony: two kings and a rook, 0:06); "prepare your strategy" formation (0:27)
   - "a capture all variant" (4:16): no check, kings are ordinary pieces; capture every enemy piece to win; a side that
     "can't play" passes and the turn comes back (4:10); there is a Wait button (17:21-17:29)
   - money: "$2 and another two for the two captured pieces" (0:46); later "win reward, six bucks. captured pieces $3 ...
     $2 of bonus interest, $1 for every 10, max five" (9:44)
   - shop between games: pieces (queen $10 at 1:44, king $3 at 2:50, pawn $2 at 4:24), max pieces on the board ($10 at 2:59,
     then $20 at 14:26), stock (bought pieces wait in stock and are "landed" during the game: it costs a turn, 10:31-12:46),
     re-roll $2 (19:01), gambits: Church's (+$2 per bishop at game start, 1:19), Shadow's (+$10 if all your pieces are on dark
     tiles at the end, 4:46), Survivor's (+$10 winning with one piece, 4:34), Family's (+$5 per piece next to a king, 10:24),
     Oshaya's (+1 board slot, 18:34), Stock Clearance's (+1 piece in the shop, 18:27)
   - five games per stage, the fifth is a boss: Judit Polgar "the queen of illusions" (king + two bishops, a skull piece that
     "can only be captured last", squares disappearing, 8:15-9:32); stage 2 board "has gotten a little bit bigger" (11:19) with
     a piece that makes "a random tile crumble" whenever a piece is captured (11:13), one that copies itself on a random tile
     when you wait (19:38), then the Mech Magnus Carlsen boss (shuffles your pieces in the formation phase, skull knight,
     20:45-23:13); the AI "is basically Martin" and gives pieces away (5:58)
   Inferred: board sizes (6x6 inside a 7x7 frame, then 7x7), the enemy armies beyond what is named, bishop/knight/rook prices,
   landing on your two home rows, tiles cracking one turn before they fall (25:34 "it moved before it fell"), and the run
   ending after the stage-2 boss (the video goes on into stage 3 and loses). Frames: cream #efd6ab / maroon #964d4e squares (frame 42). */
CM.mode({
  id: 'qqvbb2r2k5I',
  title: 'Can I BEAT Gambonanza?',
  name: 'Gambonanza',
  category: 'Variants & Games',
  description: 'A chess roguelike on a mini board. Capture every enemy piece to win a game: there is no check, kings are ordinary pieces, and a side that cannot move passes (or press Wait). Earn money from wins, captures and interest, then shop between games for pieces, more board slots and gambits. Pieces in your stock can be landed on your home rows during a game (it costs a turn). Five games per stage; the fifth is a boss.',
  how_to_win: 'Clear both stages: ten games, two bosses.',
  player_side: 'white',
  opponent: { name: 'Gambonanza AI', rating: null, avatar: 'assets/modes/qqvbb2r2k5I/deep_blu.png', tagline: 'Basically Martin: it gives pieces away.' },
  board: { files: 7, ranks: 7, light: '#efd6ab', dark: '#964d4e' },   /* art-audit: cream / maroon sampled from frame 42 (assets/modes/qqvbb2r2k5I/board.json) */
  pieces: {
    '#': { name: 'Gap', overlay: 'void' },
    K: { name: 'King', moves: 'K', royal: false, castle: false, value: 350, img: { w: 'assets/modes/qqvbb2r2k5I/wK.png', b: 'assets/modes/qqvbb2r2k5I/bK.png' } },   /* kings are ordinary pieces in a capture-all game */
    Q: { img: { w: 'assets/modes/qqvbb2r2k5I/wQ.png', b: 'assets/modes/qqvbb2r2k5I/bQ.png' } }, R: { img: { w: 'assets/modes/qqvbb2r2k5I/wR.png', b: 'assets/modes/qqvbb2r2k5I/bR.png' } }, B: { img: { w: 'assets/modes/qqvbb2r2k5I/wB.png', b: 'assets/modes/qqvbb2r2k5I/bB.png' } }, N: { img: { w: 'assets/modes/qqvbb2r2k5I/wN.png', b: 'assets/modes/qqvbb2r2k5I/bN.png' } }, P: { img: { w: 'assets/modes/qqvbb2r2k5I/wP.png', b: 'assets/modes/qqvbb2r2k5I/bP.png' } },
    Sk: { name: 'Skull king', moves: 'K', value: 300, img: 'assets/modes/qqvbb2r2k5I/Sk.png', last: true },     /* "this piece can only be captured last" */
    Sn: { name: 'Skull knight', moves: 'N', value: 300, img: 'assets/modes/qqvbb2r2k5I/Sn.png', last: true },
    Cr: { name: 'Crumbler', moves: 'K', value: 250, glyph: 'B', badge: '\u2248', crumble: true },   /* capturing a piece makes a random tile crumble */
    Cp: { name: 'Copycat', moves: 'B', value: 300, img: 'assets/modes/qqvbb2r2k5I/Cp.png', copy: true }              /* waiting creates a copy of it on a random tile */
  },
  setup: { fen: '7/7/7/7/7/7/7', hands: { w: [], b: [] } },
  rules: { check: 'none', castling: false, enPassant: false, drops: true, promotion: { choices: ['Q', 'N', 'R', 'B'] }, stalemate: 'draw', drawPlies: 160,
    win: [{ type: 'eliminate', why: 'every piece was captured' }] },
  bot: { engine: 'search', depth: 2, time_ms: 350, style: 'mix', p: 0.45 },
  params: {
    run: 'Game',
    levels: [
      { name: 'Stage 1 - Game 1/5: two pawns', fen: '*******/*1pp3/*5/*5/*5/*5/*5', reward: 2 },
      { name: 'Stage 1 - Game 2/5: five pawns', fen: '*******/*ppppp/*5/*5/*5/*5/*5', reward: 3 },
      { name: 'Stage 1 - Game 3/5: four pawns and a knight', fen: '*******/*1n3/*pppp1/*5/*5/*5/*5', reward: 4 },
      { name: 'Stage 1 - Game 4/5: three pawns, two rooks', fen: '*******/*r3r/*1ppp1/*5/*5/*5/*5', reward: 5 },
      { name: 'Stage 1 - Boss: Judit Polgar, the queen of illusions', fen: '*******/*b1[sk]b1/*5/*5/*5/*5/*5', reward: 6, crumble: 3, hint: 'The skull piece can only be captured last; the squares are disappearing',
        opponent: { name: 'Judit Polgar', rating: null, avatar: 'assets/modes/qqvbb2r2k5I/boss.png', tagline: 'The queen of illusions.' } },
      { name: 'Stage 2 - Game 1/5', fen: '1r2[cr]1r/2ppp2/7/7/7/7/7', reward: 6, hint: 'While the crumbler is on the board, every capture makes a random tile crumble' },
      { name: 'Stage 2 - Game 2/5', fen: '1n1[cr]1r1/2ppp2/7/7/7/7/7', reward: 6 },
      { name: 'Stage 2 - Game 3/5', fen: 'rnb1bnr/1pp1pp1/7/7/7/7/7', reward: 7 },
      { name: 'Stage 2 - Game 4/5: five pawns and a queen', fen: '2[cp]q3/1ppppp1/7/7/7/7/7', reward: 7, hint: 'Waiting copies the purple-haired piece onto a random tile' },
      { name: 'Stage 2 - Boss: Mech Magnus Carlsen', fen: 'r1[sn]1b1r/1ppppp1/7/7/7/7/7', reward: 8, shuffle: true, hint: 'He scrambles your pieces in the formation phase; the skull knight can only be captured last',
        opponent: { name: 'Mech Magnus Carlsen', rating: null, avatar: 'assets/modes/qqvbb2r2k5I/deep_blu.png', tagline: 'Stage 2 boss.' } }
    ]
  },
  /* g6b: g6_levels gives the rounds (levels, retry on a loss, progress); the shop, money, stock and gambits are this game's own */
  hooks: (function () {
    var PRICE = { Q: 10, R: 7, B: 5, N: 5, K: 3, P: 2 };
    var GAMBITS = {
      church: { name: "Church's Gambit", cost: 5, text: 'At the start of the game earn $2 per bishop.' },
      shadow: { name: "Shadow's Gambit", cost: 6, text: 'At the end of the game earn $10 if all your pieces are on black tiles.' },
      survivor: { name: "Survivor's Gambit", cost: 5, text: 'Winning with only one piece on the board grants $10.' },
      family: { name: "Family's Gambit", cost: 6, text: 'At the end of a game gain $5 per piece next to a king.' },
      oshaya: { name: "Oshaya's Gambit", cost: 5, text: 'Allows you to place one more piece on the board.' },
      clearance: { name: "Stock Clearance's Gambit", cost: 6, text: '+1 chess piece available in the shop.' }
    };
    var R = null;
    function fresh() { return { k: 0, cash: 0, army: ['K', 'K', 'R'], cap: 3, slotBuys: 0, gambits: {}, offer: null, wheel: false, snap: null }; }
    function run() { return R || (R = fresh()); }
    function base() { return CM.hooks.g6_levels; }
    function lvl(ctx) { var l = ctx.params.levels; return l[Math.min(run().k, l.length - 1)] || {}; }
    function dark(g, i) { return ((g.col(i) + g.row(i)) & 1) === 1; }
    function cap(r) { return r.cap + (r.gambits.oshaya ? 1 : 0); }
    function mine(st, c) { var n = 0; st.b.forEach(function (p) { if (p && p.c === c) n++; }); return n; }
    function PANEL() { return 'position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(40,22,48,.96);padding:10px;display:flex;flex-direction:column;gap:8px;color:#fff;font:14px/1.3 system-ui,sans-serif'; }
    function overlay(html, onClick) {
      var wrap = document.getElementById('board-wrap'); if (!wrap) return null; var old = document.getElementById('gb-run'); if (old) old.remove();
      var el = document.createElement('div'); el.id = 'gb-run'; el.style.cssText = PANEL(); el.innerHTML = html;
      el.onclick = function (e) { var b = e.target.closest('[data-a]'); if (b && !b.disabled) onClick(b.dataset.a, b.dataset.v); };
      wrap.appendChild(el); return el;
    }
    function close() { var e = document.getElementById('gb-run'); if (e) e.remove(); }
    function pick(list, n) { var a = list.slice(), o = []; while (a.length && o.length < n) o.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]); return o; }
    function newOffer(r) {
      var owned = Object.keys(GAMBITS).filter(function (k) { return !r.gambits[k]; });
      r.offer = { pieces: pick(['Q', 'R', 'B', 'N', 'K', 'P', 'K', 'B'], r.gambits.clearance ? 2 : 1).map(function (t) { return { t: t, sold: 0 }; }), gambits: pick(owned, 2).map(function (k) { return { k: k, sold: 0 }; }) };
    }
    function shop(ctx) {
      var r = run(); if (!r.offer) newOffer(r);
      var img = function (t) { return ctx.game.pieceImage({ t: t, c: 'w' }); }, slot = r.slotBuys ? 20 : 10;
      var card = function (a, v, inner, cost, sold) { return '<button type="button" class="btn" data-a="' + a + '" data-v="' + v + '"' + (sold || r.cash < cost ? ' disabled' : '') + ' style="flex:1 1 30%;min-width:96px;flex-direction:column;gap:4px;padding:8px 4px;background:#3b2a48">' + inner + '<b style="color:#8fdc6a">' + (sold ? 'Sold' : '$' + cost) + '</b></button>'; };
      var html = '<b style="font-size:18px;letter-spacing:.04em">SHOP</b><div>Bank <b style="font-size:20px;color:#ffd75a">$' + r.cash + '</b> \u00b7 pieces ' + r.army.length + ' \u00b7 max on board ' + cap(r) + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
        r.offer.pieces.map(function (it, k) { return card('piece', k, '<img alt="" src="' + img(it.t) + '" style="width:40px;height:40px"><span>' + ctx.V.def(it.t).name + '</span>', PRICE[it.t], it.sold); }).join('') +
        card('slot', 0, '<span style="font-size:26px">+1</span><span>Max pieces on board</span>', slot, false) + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' + r.offer.gambits.map(function (g, k) { var G = GAMBITS[g.k];
          return '<button type="button" class="btn" data-a="gambit" data-v="' + k + '"' + (g.sold || r.cash < G.cost ? ' disabled' : '') + ' style="justify-content:space-between;text-align:left;background:#5a2f6e;gap:8px"><span><b>' + G.name + '</b><br><small>' + G.text + '</small></span><b style="color:#8fdc6a">' + (g.sold ? 'Owned' : '$' + G.cost) + '</b></button>'; }).join('') + '</div>' +
        (Object.keys(r.gambits).length ? '<div style="font-size:12px;opacity:.85">Gambits: ' + Object.keys(r.gambits).map(function (k) { return GAMBITS[k].name; }).join(', ') + '</div>' : '') +
        '<div style="display:flex;gap:8px;margin-top:auto"><button type="button" class="btn" data-a="reroll"' + (r.cash < 2 ? ' disabled' : '') + ' style="background:#1f9bd1;flex:1">Re-roll $2</button>' +
        '<button type="button" class="btn" data-a="next" style="background:#e3a72a;color:#222;flex:1;font-weight:700">Next game &rarr;</button></div>';
      overlay(html, function (a, v) {
        if (a === 'piece') { var it = r.offer.pieces[+v]; if (it.sold || r.cash < PRICE[it.t]) return; r.cash -= PRICE[it.t]; it.sold = 1; r.army.push(it.t); }
        else if (a === 'slot') { if (r.cash < slot) return; r.cash -= slot; r.cap++; r.slotBuys++; }
        else if (a === 'gambit') { var g = r.offer.gambits[+v]; if (g.sold || r.cash < GAMBITS[g.k].cost) return; r.cash -= GAMBITS[g.k].cost; g.sold = 1; r.gambits[g.k] = 1; }
        else if (a === 'reroll') { r.cash -= 2; newOffer(r); }
        else if (a === 'next') { r.offer = null; close(); ctx.game.newGame(); return; }
        ctx.sound('notify'); shop(ctx);
      });
    }
    function wheel(ctx) {   /* run start: the piece wheel spin that gave the army */
      var r = run(), names = ['Queen', 'Rook', 'Bishop', 'Knight', 'King', 'Pawn'], n = 0;
      var el = overlay('<b style="font-size:18px;text-align:center">Spin the piece wheel</b><div id="gb-wheel" style="margin:auto;font-size:30px;font-weight:800;color:#ffd75a">...</div>', function () {});
      if (!el) return; el.style.pointerEvents = 'none'; var w = el.querySelector('#gb-wheel');
      var t = setInterval(function () { n++; if (w) w.textContent = names[n % names.length]; if (n > 9) { clearInterval(t); if (w) w.textContent = 'Two kings and a rook!'; setTimeout(close, 800); } }, 80);
      r.wheel = true;
    }
    function crack(ctx, why) {   /* a random tile starts to crumble; it falls (with whatever stands on it) one turn later */
      var g = ctx.V.geo, st = ctx.state, x = st.x || {}, cr = Object.assign({}, x.crack), ok = [];
      for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (g.valid[i] && !(p && p.t === '#') && cr[i] == null) ok.push(i); }
      if (!ok.length) return; var s = ctx.pick(ok); cr[s] = st.ply + 2; ctx.setX('crack', cr);
      ctx.fx({ type: 'shake_piece', at: s, duration_ms: 500 }); if (why) ctx.toast(why, 1500);
    }
    function fall(ctx) {
      var st = ctx.state, cr = Object.assign({}, (st.x || {}).crack), any = false;
      Object.keys(cr).forEach(function (k) { if (cr[k] <= st.ply) { var i = +k, p = ctx.at(i); ctx.set(i, ctx.V.piece('#', 'n')); delete cr[k]; any = true;
        ctx.fx({ type: 'particles', kind: 'dust', at: i, count: 14 }); if (p && p.t !== '#') ctx.toast((p.c === ctx.human ? 'Your ' : 'Enemy ') + (ctx.V.def(p.t).name || p.t).toLowerCase() + ' fell through the board!', 1800); } });
      if (any) { ctx.setX('crack', cr); ctx.sound('capture'); }
    }
    return {
      extends: 'g6_levels',
      setup: function (ctx) {
        base().setup(ctx); close();
        var r = run(), st = ctx.state, V = ctx.V, g = V.geo, lv = lvl(ctx);
        r.snap = { army: r.army.slice(), cash: r.cash };   /* a lost game is retried with the same army */
        var spots = [];
        [0, 1].forEach(function (rr) { [3, 2, 4, 1, 5, 0, 6].forEach(function (c) { for (var i = 0; i < st.b.length; i++) if (g.valid[i] && g.relRow(i, 'w') === rr && g.col(i) === c && !st.b[i]) spots.push(i); }); });
        var onBoard = r.army.slice(0, cap(r)), stock = r.army.slice(cap(r));
        if (lv.shuffle) onBoard = onBoard.sort(function () { return Math.random() - 0.5; });
        onBoard.forEach(function (t, j) { if (spots[j] != null) st.b[spots[j]] = V.piece(t, 'w', { m: 1 }); else stock.push(t); });
        st.hands = { w: stock, b: [] };
        st.x = Object.assign({}, st.x, { cap: cap(r), crack: {}, enemyStart: mine(st, 'b'), noStock: !!lv.noStock });
        if (r.gambits.church) { var nb = r.army.filter(function (t) { return t === 'B'; }).length; if (nb) { r.cash += 2 * nb; st.x.church = 2 * nb; } }
      },
      onStart: function (ctx) {
        var r = run(), lv = lvl(ctx);
        var old = document.getElementById('gb-wait'); if (old) old.remove();
        var stl = document.getElementById('status');
        if (stl && stl.parentNode) {   /* the game's Wait button (17:21): pass your turn */
          var bt = document.createElement('button'); bt.id = 'gb-wait'; bt.type = 'button'; bt.className = 'btn'; bt.textContent = 'Wait'; bt.style.cssText = 'display:block;margin:6px auto 0';
          bt.onclick = function () { var G = ctx.game; if (G.over || G.busy || ctx.state.turn !== ctx.human) return; var pm = G.moves.find(function (m) { return m.pass; }); if (pm) G.commit(pm, {}); };
          stl.parentNode.insertBefore(bt, stl.nextSibling);
        }
        if (!r.wheel && r.k === 0) wheel(ctx);
        base().onStart(ctx);
        if (lv.shuffle) ctx.toast('Mech Magnus Carlsen scrambles your formation!', 2600);
        if (ctx.state.x.church) ctx.toast("Church's Gambit: +$" + ctx.state.x.church, 1800);
      },
      moves: function (V, st, out) {
        out = base().moves(V, st, out) || out; var x = st.x || {}, me = st.turn;
        out = out.filter(function (m) {
          if (!m.drop) return true;
          if (me !== 'w' || x.noStock) return false;
          var n = 0; for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].c === me) n++;
          return n < (x.cap || 3) && V.geo.relRow(m.t, me) <= 1;   /* land on your two home rows while a board slot is free */
        });
        var board = out.filter(function (m) { return !m.pass; });
        if (me === 'w' || !board.length) {   /* the Wait button (player) / a side that can't play passes */
          for (var j = 0; j < st.b.length; j++) { var p = st.b[j]; if (p && p.c === me) { out.push({ f: j, t: j, p: p.t, c: me, cap: null, pass: 1 }); break; } }
        }
        return out;
      },
      filterMoves: function (V, st, legal) {   /* skull pieces can only be captured last */
        return legal.filter(function (m) {
          var q = m.cap; if (!q || !V.def(q.t).last) return true;
          for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === q.c && !V.def(p.t).last && p.t !== '#') return false; }
          return true;
        });
      },
      onMake: function (V, st, m, n) {
        base().onMake(V, st, m, n);
        if (m.cap && !m.drop) n.hands = st.hands;   /* captures do not go to your stock */
        if (m.pass) n.x = Object.assign({}, n.x, { waited: (st.x.waited || 0) + 1 });
      },
      afterMove: function (ctx, m, info) {
        var st = ctx.state, V = ctx.V, lv = lvl(ctx);
        fall(ctx);
        if (info && info.capture && st.b.some(function (p) { return p && p.c !== ctx.human && V.def(p.t).crumble; })) crack(ctx, 'A random tile starts to crumble!');
        if (lv.crumble && st.ply % lv.crumble === 0) crack(ctx, 'The squares are disappearing...');
        if (m && m.pass && info.by === 'player') {
          ctx.toast('Wait.', 900);
          st.b.forEach(function (p, i) { if (p && p.c !== ctx.human && V.def(p.t).copy) { var e = ctx.emptySquares(); if (e.length) { var s = ctx.pick(e); ctx.spawn(p.t, p.c, s); ctx.fx({ type: 'flash', color: '#b04cff', at: s, opacity: 0.5, duration_ms: 400 }); ctx.toast('The copycat copies itself!', 1500); } } });
        }
        ctx.refresh();
        return null;
      },
      decorate: function (ctx, sq, p) {
        var b0 = base().decorate(ctx, sq, p), cr = (ctx.state.x || {}).crack;
        if (cr && cr[sq] != null) return { html: '<span class="sq-tint" style="background:repeating-linear-gradient(35deg,rgba(40,20,10,.55) 0 3px,transparent 3px 9px)"></span>' };
        return b0;
      },
      onGameOver: function (ctx, over) {
        var r = run(), st = ctx.state, V = ctx.V, g = V.geo, lv = lvl(ctx), last = ctx.params.levels.length - 1, k = r.k;
        if (over.w === ctx.human) {
          var mineSq = []; st.b.forEach(function (p, i) { if (p && p.c === ctx.human) mineSq.push(i); });
          var capd = Math.max(0, (st.x.enemyStart || 0) - mine(st, 'b')), interest = Math.min(5, Math.floor(r.cash / 10)), bonus = 0, notes = [];
          if (r.gambits.shadow && mineSq.length && mineSq.every(function (i) { return dark(g, i); })) { bonus += 10; notes.push("Shadow's +$10"); }
          if (r.gambits.survivor && mineSq.length === 1) { bonus += 10; notes.push("Survivor's +$10"); }
          if (r.gambits.family) { var fam = 0; mineSq.forEach(function (i) { var p = st.b[i]; if (p.t === 'K') return; if (mineSq.some(function (j) { return st.b[j].t === 'K' && g.dist(i, j) === 1; })) fam++; }); if (fam) { bonus += 5 * fam; notes.push("Family's +$" + 5 * fam); } }
          var gain = (lv.reward || 2) + capd + interest + bonus; r.cash += gain;
          r.army = mineSq.map(function (i) { return st.b[i].t; }).concat(st.hands.w || []);   /* lost pieces are gone for good */
          ctx.fx({ type: 'text', text: '+$' + gain, at: 'board', color: '#ffd75a', size: 40, duration_ms: 1400 });
          ctx.toast('Win reward $' + (lv.reward || 2) + ' \u00b7 captured pieces $' + capd + ' \u00b7 interest $' + interest + (notes.length ? ' \u00b7 ' + notes.join(' \u00b7 ') : ''), 3600);
          if (k >= last) { ctx.toast('Both bosses beaten: run complete!', 4200); R = null; }
          else { r.k++; ctx.after(1700, function () { shop(ctx); }); }
        } else if (over.w !== 'd' && r.snap) { r.army = r.snap.army; r.cash = r.snap.cash; }
        base().onGameOver(ctx, over);
      },
      status: function (ctx) {
        var r = run(), st = ctx.state, lv = lvl(ctx);
        return (lv.name || '') + ' \u00b7 $' + r.cash + ' \u00b7 on board ' + mine(st, ctx.human) + '/' + (st.x.cap || 3) + ((st.hands.w || []).length ? ' \u00b7 stock ' + st.hands.w.length : '');
      },
      onExit: function (ctx) { close(); var w = document.getElementById('gb-wait'); if (w) w.remove(); base().onExit(ctx); }
    };
  })(),
  todo_pass2: ['formation phase (drag your pieces before the first move; pieces are auto-placed centre-out on your home rows)', 'tokens (chess / tile / gambit tokens), selling pieces and gambits, probability gambits (Will-o-the-Wisp phantom tiles, 1-in-10 skip turn, Musketeers, Philosopher\'s Stone, trap tiles)', 'stage 3+ (Hikaru the banished: no stock) and the burning-piece effect (20:01, unexplained)'],
  source: { research: 'research/modes/qqvbb2r2k5I.json', confidence: 'medium', notes: 'Rules from the full transcript (re-run 2026-11-25); armies beyond those named, board sizes and some prices inferred. Pixel-art piece set cut from paused 1080p frames 42/539/1193/1317 (research/frames/video_thumbs/qqvbb2r2k5I_frame_<s>.jpg, tools/g6b_gb_art.py); skull king/knight and copycat are their own cuts. INFERRED (no frame shows them): black Queen = white queen recoloured dark; white Pawn/Knight/Bishop = black cuts recoloured pale; plain black King = skull king without its badge. Board colours cream #efd6ab / maroon #964d4e from frame 42 (the old #ffffff/#7e4e8a matched no frame). Crumbler keeps a glyph + badge (no clean frame of it).' }
});
