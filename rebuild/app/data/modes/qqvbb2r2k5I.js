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
/* arena agent (2026-11-25), logic pass: formation phase before every game (move your pieces anywhere on your home rows, land or
   bench stock pieces, then Fight!), shop tokens (chess / tile / gambit, "choose one among N", 1:53-2:02, 7:39), selling pieces and
   gambits (half price; inferred), probability gambits from the transcript (Will-o'-the-Wisp phantom tiles 1:25, 1-in-10 skip
   turn 3:08, Musketeers 6:38, Philosopher's Stone 7:00, knight trap tiles 14:35, Backup's 16:12, Black Stallion's 23:35, Limited
   Edition's 10:19), modified tiles (trap / phantom / gold), stage 3 with Hikaru the banished (no stock during the game, 23:22) and
   the burning piece (20:01 / 22:04, never explained: inferred as a capture streak). Gambit names the transcript does not read out
   ("Tempo's", "Snare's"), token / gambit prices, sell values, the gold tile and stage-3 games 2-5 are inferred. */
CM.mode({
  id: 'qqvbb2r2k5I',
  title: 'Can I BEAT Gambonanza?',
  name: 'Gambonanza',
  category: 'Variants & Games',
  description: 'A chess roguelike on a mini board. Capture every enemy piece to win a game: there is no check, kings are ordinary pieces, and a side that cannot move passes (or press Wait). Earn money from wins, captures and interest, then shop between games for pieces, more board slots and gambits. Before each game you arrange your formation on your two home rows (drag pieces, land or bench stock pieces), then press Fight!. Pieces in your stock can also be landed during a game (it costs a turn). The shop sells pieces, tokens and gambits, and buys back pieces and gambits. Five games per stage; the fifth is a boss.',
  how_to_win: 'Clear the stages game by game; a lost game is retried with the same army.',
  player_side: 'white',
  opponent: { name: 'Gambonanza AI', rating: null, avatar: 'assets/modes/qqvbb2r2k5I/deep_blu.png', tagline: 'Basically Martin: it gives pieces away.' },
  board: { files: 7, ranks: 7, light: '#efd6ab', dark: '#964d4e' },   /* art-audit: cream / maroon sampled from frame 42 (assets/modes/qqvbb2r2k5I/board.json) */
  pieces: {
    '#': { name: 'Gap', overlay: 'void' },
    K: { name: 'King', moves: 'K', royal: false, castle: false, value: 350, img: { w: 'assets/modes/qqvbb2r2k5I/wK.png', b: 'assets/modes/qqvbb2r2k5I/bK.png' } },   /* kings are ordinary pieces in a capture-all game */
    Q: { img: { w: 'assets/modes/qqvbb2r2k5I/wQ.png', b: 'assets/modes/qqvbb2r2k5I/bQ.png' } }, R: { img: { w: 'assets/modes/qqvbb2r2k5I/wR.png', b: 'assets/modes/qqvbb2r2k5I/bR.png' } }, B: { img: { w: 'assets/modes/qqvbb2r2k5I/wB.png', b: 'assets/modes/qqvbb2r2k5I/bB.png' } }, N: { img: { w: 'assets/modes/qqvbb2r2k5I/wN.png', b: 'assets/modes/qqvbb2r2k5I/bN.png' } }, P: { img: { w: 'assets/modes/qqvbb2r2k5I/wP.png', b: 'assets/modes/qqvbb2r2k5I/bP.png' } },
    Kg: { name: 'Golden King', moves: 'K', royal: false, castle: false, value: 360, img: { w: 'assets/modes/qqvbb2r2k5I/wK.png', b: 'assets/modes/qqvbb2r2k5I/bK.png' } },   /* arena: Musketeers' Gambit reward (6:43); king art + gold badge */
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
        opponent: { name: 'Mech Magnus Carlsen', rating: null, avatar: 'assets/modes/qqvbb2r2k5I/deep_blu.png', tagline: 'Stage 2 boss.' } },
      /* arena: stage 3 (23:22): Hikaru the banished's drawback is that you cannot use your stock during the game (place everything in
         the formation phase); a trapped knight that frees itself just before its tile falls (25:34). Games 2-5 of stage 3 are never
         shown: armies inferred. */
      { name: 'Stage 3 - Game 1/5: Hikaru the banished', fen: '2n1r2/1ppp3/7/7/7/7/7', reward: 7, noStock: true, crumble: 4, traps: ['c7'], hint: "Hikaru's drawback: you can't use your stock during the game",
        opponent: { name: 'Hikaru the banished', rating: null, avatar: 'assets/modes/qqvbb2r2k5I/deep_blu.png', tagline: "You can't use your stock during the game." } },
      { name: 'Stage 3 - Game 2/5', fen: 'r1n1n1r/1ppppp1/7/7/7/7/7', reward: 7, crumble: 5 },
      { name: 'Stage 3 - Game 3/5', fen: '1rb1br1/ppp1ppp/7/7/7/7/7', reward: 8 },
      { name: 'Stage 3 - Game 4/5', fen: 'r1[cr]q1[cr]r/1ppppp1/7/7/7/7/7', reward: 8 },
      { name: 'Stage 3 - Boss', fen: 'rn[sk]q[sn]nr/ppppppp/7/7/7/7/7', reward: 10, crumble: 4, hint: 'Both skull pieces can only be captured last' }
    ]
  },
  /* g6b: g6_levels gives the rounds (levels, retry on a loss, progress); the shop, money, stock and gambits are this game's own */
  hooks: (function () {
    var PRICE = { Q: 10, R: 7, B: 5, N: 5, K: 3, P: 2, Kg: 12 };
    var GAMBITS = {
      church: { name: "Church's Gambit", cost: 5, text: 'At the start of the game earn $2 per bishop.' },
      shadow: { name: "Shadow's Gambit", cost: 6, text: 'At the end of the game earn $10 if all your pieces are on black tiles.' },
      survivor: { name: "Survivor's Gambit", cost: 5, text: 'Winning with only one piece on the board grants $10.' },
      family: { name: "Family's Gambit", cost: 6, text: 'At the end of a game gain $5 per piece next to a king.' },
      oshaya: { name: "Oshaya's Gambit", cost: 5, text: 'Allows you to place one more piece on the board.' },
      clearance: { name: "Stock Clearance's Gambit", cost: 6, text: '+1 chess piece available in the shop.' }
    };
    /* arena agent (2026-11-25): probability gambits and the rest named in the transcript. Costs are inferred except the $6 one. */
    Object.assign(GAMBITS, {
      willo: { name: "Will-o'-the-Wisp's Gambit", cost: 6, text: 'Capturing on a white tile has a 1 in 3 chance to create a phantom tile: a piece moving onto it gets a phantom copy.' },
      tempo: { name: "Tempo's Gambit", cost: 6, text: "A 1 in 10 chance to skip the enemy's turn after playing." },
      musketeers: { name: "Musketeers' Gambit", cost: 6, text: 'When one of your bishops captures: a 1 in 3 chance to earn a king, and a 1 in 5 chance that it is a golden one.' },
      philosopher: { name: "Philosopher's Stone Gambit", cost: 4, text: 'After selling a gambit, earn a random chess piece.' },
      snare: { name: "Snare's Gambit", cost: 5, text: 'Capturing with a knight has a 1 in 3 chance to place a trap tile on the capturing tile; a trapped enemy cannot move.' },
      backup: { name: "Backup's Gambit", cost: 4, text: '+$2 when landing a piece (placing a piece from the stock onto the board).' },
      stallion: { name: "Black Stallion's Gambit", cost: 7, text: "Capturing with a knight on a black tile skips the enemy's turn." },
      limited: { name: "Limited Edition's Gambit", cost: 3, text: 'Gains $3 of sell value after every game you win.' }
    });
    /* tokens (1:53, 2:02, 7:39): the number is how many choices the token offers; prices inferred */
    var TOKENS = { chess: { name: 'Chess token', cost: 4, text: 'Choose one among N random chess pieces.' }, tile: { name: 'Tile token', cost: 3, text: 'Earn one modified tile among N choices.' }, gambit: { name: 'Gambit token', cost: 5, text: 'Choose one among N random gambits.' } };
    /* modified tiles: the video names trap tiles (14:35) and phantom tiles (1:25); the gold tile is inferred. Each owned tile is laid on a
       random empty square of the middle rows at the start of a game. */
    var TILES = { trap: { name: 'Trap tile', text: 'An enemy piece standing on it cannot move.' }, phantom: { name: 'Phantom tile', text: 'The first of your pieces to move onto it gets a phantom copy on your home rows (gone after the game).' }, gold: { name: 'Gold tile', text: '+$2 whenever one of your pieces captures on it.' } };
    function sellValue(r, t) { return t === 'Kg' ? 6 : Math.max(1, Math.floor((PRICE[t] || 2) / 2)); }
    function gSell(r, k) { return k === 'limited' ? (r.limited || 0) : Math.floor(GAMBITS[k].cost / 2); }
    var R = null;
    function fresh() { return { k: 0, cash: 0, army: ['K', 'K', 'R'], cap: 3, slotBuys: 0, gambits: {}, offer: null, wheel: false, snap: null, tiles: [], sold: 0 }; }
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
      r.offer = { pieces: pick(['Q', 'R', 'B', 'N', 'K', 'P', 'K', 'B'], r.gambits.clearance ? 2 : 1).map(function (t) { return { t: t, sold: 0 }; }), gambits: pick(owned, 2).map(function (k) { return { k: k, sold: 0 }; }),
        tokens: pick(['chess', 'tile', 'gambit'], 2).map(function (k) { return { k: k, n: 2 + Math.floor(Math.random() * 2), sold: 0 }; }) };
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
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' + (r.offer.tokens || []).map(function (tk, k) { var T = TOKENS[tk.k];
          return card('token', k, '<span style="width:40px;height:40px;border-radius:50%;background:#e2b33c;color:#3b2a06;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:18px">' + tk.n + '</span><span>' + T.name + ' ' + tk.n + '</span><small style="opacity:.8">' + T.text.replace('N', tk.n) + '</small>', T.cost, tk.sold); }).join('') + '</div>' +
        /* selling (arena): pieces for half their price, gambits for half their cost (inferred) */
        '<div style="font-size:12px;opacity:.85">Sell: tap to sell</div><div style="display:flex;flex-wrap:wrap;gap:4px">' + r.army.map(function (t, k) { return '<button type="button" class="btn" data-a="sellp" data-v="' + k + '" title="Sell ' + ctx.V.def(t).name + '" style="padding:2px 6px;gap:2px;background:#2e2238"' + (r.army.length <= 1 ? ' disabled' : '') + '><img alt="" src="' + img(t) + '" style="width:24px;height:24px">$' + sellValue(r, t) + '</button>'; }).join('') +
        Object.keys(r.gambits).map(function (k) { return '<button type="button" class="btn" data-a="sellg" data-v="' + k + '" style="padding:2px 6px;background:#2e2238;font-size:11px">' + GAMBITS[k].name + ' $' + gSell(r, k) + '</button>'; }).join('') + '</div>' +
        (r.tiles.length ? '<div style="font-size:12px;opacity:.85">Tiles: ' + r.tiles.map(function (t) { return TILES[t].name; }).join(', ') + '</div>' : '') +
        '<div style="display:flex;gap:8px;margin-top:auto"><button type="button" class="btn" data-a="reroll"' + (r.cash < 2 ? ' disabled' : '') + ' style="background:#1f9bd1;flex:1">Re-roll $2</button>' +
        '<button type="button" class="btn" data-a="next" style="background:#e3a72a;color:#222;flex:1;font-weight:700">Next game &rarr;</button></div>';
      overlay(html, function (a, v) {
        if (a === 'piece') { var it = r.offer.pieces[+v]; if (it.sold || r.cash < PRICE[it.t]) return; r.cash -= PRICE[it.t]; it.sold = 1; r.army.push(it.t); }
        else if (a === 'slot') { if (r.cash < slot) return; r.cash -= slot; r.cap++; r.slotBuys++; }
        else if (a === 'gambit') { var g = r.offer.gambits[+v]; if (g.sold || r.cash < GAMBITS[g.k].cost) return; r.cash -= GAMBITS[g.k].cost; g.sold = 1; r.gambits[g.k] = 1; }
        else if (a === 'reroll') { r.cash -= 2; newOffer(r); }
        else if (a === 'token') { var tk = r.offer.tokens[+v]; if (tk.sold || r.cash < TOKENS[tk.k].cost) return; r.cash -= TOKENS[tk.k].cost; tk.sold = 1; ctx.sound('notify'); openToken(ctx, tk); return; }
        else if (a === 'sellp') { if (r.army.length <= 1) return; var st0 = r.army.splice(+v, 1)[0]; r.cash += sellValue(r, st0); r.sold++; }
        else if (a === 'sellg') { if (!r.gambits[v]) return; r.cash += gSell(r, v); delete r.gambits[v];
          if (r.gambits.philosopher || v === 'philosopher') { if (v !== 'philosopher') { var gp = pick(['Q', 'R', 'B', 'N', 'K', 'P', 'P', 'N', 'B'], 1)[0]; r.army.push(gp); ctx.toast("Philosopher's Stone: you earn a " + ctx.V.def(gp).name.toLowerCase() + '!', 2000); } } }
        else if (a === 'next') { r.offer = null; close(); ctx.game.newGame(); return; }
        ctx.sound('notify'); shop(ctx);
      });
    }
    function openToken(ctx, tk) {   /* a bought token: choose one among its N choices */
      var r = run(), img = function (t) { return ctx.game.pieceImage({ t: t, c: 'w' }); }, ch;
      if (tk.k === 'chess') ch = pick(['Q', 'R', 'B', 'N', 'K', 'P', 'R', 'B', 'N'], tk.n).map(function (t) { return { v: t, html: '<img alt="" src="' + img(t) + '" style="width:40px;height:40px"><b>' + ctx.V.def(t).name + '</b>' }; });
      else if (tk.k === 'tile') ch = pick(Object.keys(TILES), tk.n).map(function (t) { return { v: t, html: '<b>' + TILES[t].name + '</b><small>' + TILES[t].text + '</small>' }; });
      else ch = pick(Object.keys(GAMBITS).filter(function (k) { return !r.gambits[k]; }), tk.n).map(function (k) { return { v: k, html: '<b>' + GAMBITS[k].name + '</b><small>' + GAMBITS[k].text + '</small>' }; });
      if (!ch.length) { shop(ctx); return; }
      overlay('<b style="font-size:18px">' + TOKENS[tk.k].name + ' ' + tk.n + '</b><div>Choose one</div>' + ch.map(function (c) { return '<button type="button" class="btn" data-a="t" data-v="' + c.v + '" style="flex-direction:column;gap:4px;padding:10px;background:#3b2a48;white-space:normal;height:auto;flex-shrink:0">' + c.html + '</button>'; }).join(''),
        function (a, v) { if (tk.k === 'chess') r.army.push(v); else if (tk.k === 'tile') r.tiles.push(v); else r.gambits[v] = 1; ctx.sound('promote'); shop(ctx); });
    }
    /* formation phase (0:27 "prepare your strategy"): before the first move your pieces may be moved anywhere on your home rows,
       landed from the stock or benched; Fight! starts the game */
    function formTools(ctx) {
      var old = document.getElementById('gb-form'); if (old) old.remove();
      var st = ctx.state, stl = document.getElementById('status'); if (!(st.x || {}).formation || !stl || !stl.parentNode) return;
      var bar = document.createElement('div'); bar.id = 'gb-form'; bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;margin-top:6px';
      var mineIx = []; st.b.forEach(function (p, i) { if (p && p.c === ctx.human) mineIx.push(i); });
      bar.innerHTML = '<span style="font-size:12px;opacity:.85">Formation: drag your pieces. Bench:</span>' + mineIx.map(function (i) { return '<button type="button" class="btn" data-i="' + i + '" style="padding:2px 4px" title="Back to the stock"><img alt="" src="' + ctx.game.pieceImage(st.b[i]) + '" style="width:22px;height:22px"></button>'; }).join('') +
        '<button type="button" class="btn" data-go="1" style="background:#81b64c;color:#fff;font-weight:700">Fight!</button>';
      bar.onclick = function (e) {
        var b = e.target.closest('button'); if (!b || ctx.over) return;
        if (b.dataset.go) { ctx.setX('formation', false); bar.remove(); ctx.refresh(); ctx.toast('Fight!', 900); return; }
        var i = +b.dataset.i, p = ctx.at(i); if (!p || p.c !== ctx.human || mine(ctx.state, ctx.human) <= 1) return;
        var s2 = Object.assign({}, ctx.state, { hands: Object.assign({}, ctx.state.hands, { w: (ctx.state.hands.w || []).concat([p.t]) }) }); s2.b = s2.b.slice(); s2.b[i] = null; ctx.state = s2; ctx.refresh(); formTools(ctx);
      };
      stl.parentNode.insertBefore(bar, stl.nextSibling);
    }
    function spawnPhantom(ctx, t) {   /* a phantom copy on a free home-row square (not kept after the game) */
      var g = ctx.V.geo, e = ctx.emptySquares(function (i) { return g.relRow(i, ctx.human) <= 1; }); if (!e.length) return;
      var s = ctx.pick(e); ctx.spawn(t, ctx.human, s, { ph: 1, m: 1 }); ctx.fx({ type: 'flash', color: '#b04cff', at: s, opacity: 0.5, duration_ms: 400 }); ctx.toast('A phantom ' + (ctx.V.def(t).name || t).toLowerCase() + ' appears!', 1600);
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
        st.x = Object.assign({}, st.x, { cap: cap(r), crack: {}, enemyStart: mine(st, 'b'), noStock: !!lv.noStock, formation: true, mt: {} });
        /* modified tiles: owned tiles on random empty middle squares; a level's own trap tiles (Hikaru's trapped knight) */
        var mid = []; for (var q = 0; q < st.b.length; q++) if (g.valid[q] && !st.b[q] && g.relRow(q, 'w') >= 2 && g.relRow(q, 'b') >= 2) mid.push(q);
        r.tiles.forEach(function (t) { if (mid.length) st.x.mt[mid.splice(Math.floor(Math.random() * mid.length), 1)[0]] = t; });
        (lv.traps || []).forEach(function (nm) { var ti = g.parse(nm); if (ti >= 0) st.x.mt[ti] = 'trap'; });
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
        formTools(ctx);
        base().onStart(ctx);
        if (lv.shuffle) ctx.toast('Mech Magnus Carlsen scrambles your formation!', 2600);
        if (ctx.state.x.church) ctx.toast("Church's Gambit: +$" + ctx.state.x.church, 1800);
      },
      moves: function (V, st, out) {
        out = base().moves(V, st, out) || out; var x = st.x || {}, me = st.turn, g = V.geo;
        if (x.formation && me === 'w') {   /* formation phase: move your pieces anywhere on your home rows, or land stock pieces there */
          var fm = [], n0 = 0, home = [];
          for (var h = 0; h < st.b.length; h++) { if (st.b[h] && st.b[h].c === 'w') n0++; if (g.valid[h] && g.relRow(h, 'w') <= 1 && !st.b[h]) home.push(h); }
          st.b.forEach(function (p, i) { if (p && p.c === 'w') home.forEach(function (j) { fm.push({ f: i, t: j, p: p.t, c: 'w', cap: null, form: 1 }); }); });
          if (n0 < (x.cap || 3)) out.forEach(function (m) { if (m.drop && g.relRow(m.t, 'w') <= 1) fm.push(Object.assign({}, m, { form: 1 })); });
          return fm;
        }
        if (x.mt) out = out.filter(function (m) { return !(m.f >= 0 && x.mt[m.f] === 'trap' && st.b[m.f] && st.b[m.f].c === 'b'); });   /* trapped enemy pieces cannot move */
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
        if (m.form) { n.turn = st.turn; if (m.drop) n.hands = Object.assign({}, n.hands); }   /* formation moves do not hand over the turn */
      },
      afterMove: function (ctx, m, info) {
        var st = ctx.state, V = ctx.V, lv = lvl(ctx), r = run(), g = V.geo, x = st.x || {};
        if (m && m.form) { ctx.state = Object.assign({}, ctx.state, { turn: ctx.human }); formTools(ctx); return null; }   /* formation moves keep your turn */
        fall(ctx);
        if (info && info.by === 'player' && m) {
          var to = m.t, pc = ctx.at(to), mt = Object.assign({}, x.mt);
          if (m.drop && r.gambits.backup) { r.cash += 2; ctx.toast("Backup's Gambit: +$2", 1000); }
          if (pc && mt[to] === 'phantom' && !pc.ph) { delete mt[to]; ctx.setX('mt', mt); spawnPhantom(ctx, pc.t); }
          if (info.capture && pc) {
            if (mt[to] === 'gold') { r.cash += 2; ctx.toast('Gold tile: +$2', 1000); }
            if (r.gambits.willo && !dark(g, to) && Math.random() < 1 / 3) { mt[to] = 'phantom'; ctx.setX('mt', mt); ctx.toast("Will-o'-the-Wisp: a phantom tile!", 1400); }
            if (r.gambits.snare && pc.t === 'N' && Math.random() < 1 / 3) { mt[to] = 'trap'; ctx.setX('mt', mt); ctx.toast("Snare's Gambit: a trap tile!", 1400); }
            if (r.gambits.musketeers && pc.t === 'B' && Math.random() < 1 / 3) { var gold = Math.random() < 1 / 5; r.army.push(gold ? 'Kg' : 'K'); var hs = Object.assign({}, ctx.state.hands); hs.w = (hs.w || []).concat([gold ? 'Kg' : 'K']); ctx.state = Object.assign({}, ctx.state, { hands: hs }); r.musk = (r.musk || 0) + 1; ctx.toast("Musketeers' Gambit: you earn a " + (gold ? 'golden ' : '') + 'king (in your stock)!', 2000); }
            /* burning piece (20:01 / 22:04: never explained in the video; inferred = a piece on a capture streak of two or more catches fire) */
            ctx.transform(to, { props: { fire: (pc.fire || 0) + 1 } });
          } else if (pc && pc.fire) ctx.transform(to, { props: { fire: 0 } });
          var skip = (r.gambits.stallion && info.capture && pc && pc.t === 'N' && dark(g, to)) ? "Black Stallion's Gambit" : (r.gambits.tempo && !m.pass && Math.random() < 0.1) ? "Tempo's Gambit" : null;
          if (skip && !ctx.over) { ctx.state = Object.assign({}, ctx.state, { turn: ctx.human }); ctx.toast(skip + ': the enemy skips a turn!', 1600); }
        }
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
        var b0 = base().decorate(ctx, sq, p), x = ctx.state.x || {}, cr = x.crack, o = b0 ? Object.assign({}, b0) : {}, html = o.html || '';
        if (cr && cr[sq] != null) html += '<span class="sq-tint" style="background:repeating-linear-gradient(35deg,rgba(40,20,10,.55) 0 3px,transparent 3px 9px)"></span>';
        var t = x.mt && x.mt[sq];
        if (t === 'trap') html += '<span class="sq-tint" style="background:repeating-linear-gradient(0deg,rgba(30,30,30,.45) 0 2px,transparent 2px 8px),repeating-linear-gradient(90deg,rgba(30,30,30,.45) 0 2px,transparent 2px 8px)"></span>';
        if (t === 'gold') html += '<span class="sq-tint" style="background:radial-gradient(circle,rgba(255,210,60,.55),rgba(255,210,60,.12) 70%)"></span>';
        if (t === 'phantom') html += '<span class="sq-tint" style="background:radial-gradient(circle,rgba(176,76,255,.5),rgba(176,76,255,.08) 70%)"></span>';
        if (p && p.fire >= 2) html += '<span class="sq-label gb-fire" style="position:absolute;inset:auto 10% 4% 10%;height:46%;pointer-events:none;z-index:2;background:radial-gradient(ellipse at 50% 100%,rgba(255,220,80,.9),rgba(255,120,20,.65) 45%,rgba(220,40,0,0) 75%);mix-blend-mode:screen"></span>';
        if (html) o.html = html;
        if (p && p.ph) o.cls = ((o.cls || '') + ' gb-phantom').trim();
        if (p && p.t === 'Kg') o.badge = '\u2605';
        if (p && p.ph) { o.html = (o.html || '') + '<style>.gb-phantom .pc,.gb-phantom img{opacity:.55;filter:drop-shadow(0 0 4px #b04cff)}</style>'; }
        return Object.keys(o).length ? o : null;
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
          r.army = mineSq.filter(function (i) { return !st.b[i].ph; }).map(function (i) { return st.b[i].t; }).concat(st.hands.w || []);   /* lost pieces are gone for good; phantoms vanish */
          if (r.gambits.limited) r.limited = (r.limited || 0) + 3;
          ctx.fx({ type: 'text', text: '+$' + gain, at: 'board', color: '#ffd75a', size: 40, duration_ms: 1400 });
          ctx.toast('Win reward $' + (lv.reward || 2) + ' \u00b7 captured pieces $' + capd + ' \u00b7 interest $' + interest + (notes.length ? ' \u00b7 ' + notes.join(' \u00b7 ') : ''), 3600);
          if (k >= last) { ctx.toast('Both bosses beaten: run complete!', 4200); R = null; }
          else { r.k++; ctx.after(1700, function () { shop(ctx); }); }
        } else if (over.w !== 'd' && r.snap) { r.army = r.snap.army; r.cash = r.snap.cash; }
        var fb = document.getElementById('gb-form'); if (fb) fb.remove();
        base().onGameOver(ctx, over);
      },
      status: function (ctx) {
        var r = run(), st = ctx.state, lv = lvl(ctx);
        return ((st.x || {}).formation ? 'Formation: prepare your strategy, then Fight! \u00b7 ' : '') + (lv.name || '') + ' \u00b7 $' + r.cash + ' \u00b7 on board ' + mine(st, ctx.human) + '/' + (st.x.cap || 3) + ((st.hands.w || []).length ? ' \u00b7 stock ' + st.hands.w.length : '');
      },
      onExit: function (ctx) { close(); ['gb-wait', 'gb-form'].forEach(function (id) { var w = document.getElementById(id); if (w) w.remove(); }); base().onExit(ctx); },
      onUndo: function (ctx) { base().onUndo(ctx); formTools(ctx); },
      qa: function () { return run(); }
    };
  })(),
  source: { research: 'research/modes/qqvbb2r2k5I.json', confidence: 'medium', notes: 'Rules from the full transcript (re-run 2026-11-25); armies beyond those named, board sizes and some prices inferred. Pixel-art piece set cut from paused 1080p frames 42/539/1193/1317 (research/frames/video_thumbs/qqvbb2r2k5I_frame_<s>.jpg, tools/g6b_gb_art.py); skull king/knight and copycat are their own cuts. INFERRED (no frame shows them): black Queen = white queen recoloured dark; white Pawn/Knight/Bishop = black cuts recoloured pale; plain black King = skull king without its badge. Board colours cream #efd6ab / maroon #964d4e from frame 42 (the old #ffffff/#7e4e8a matched no frame). Crumbler keeps a glyph + badge (no clean frame of it).' }
});
