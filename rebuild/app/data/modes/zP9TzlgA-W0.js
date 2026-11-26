/* Can I MASTER Pawnbarian?  Second Pawnbarian episode: the Golem Fortress, seven floors on a 5x5 board (stills maxres2/3:
   "The Golem Fortress, Floor 3 / Floor 5", #dde8eb/#36355b). Transcript (g6b 2026-11-25, analyze_video; the spec had none):
   the hero plays piece cards (3 in hand, two actions a turn), monsters strike their targeted squares ("1 damage"), hearts,
   gold and a shop before every floor (another heart costs 9 gold, 11:11; "we gain one of our hearts back for moving forward",
   13:32; new cards: "pick up a bishop", 3:41), promotion on the back rank (10:44). Golem Fortress foes: Coil Golem, "vigilant:
   immune while the hero is not on any of the adjacent squares, so we have to strike from an adjacent tile" (1:15); Guard
   Golem, a brawler "incapable of getting attacked unless you're diagonally placed" (4:14, 21:15); Spark Imps (8:32), Knight
   Golems (11:33), Cappy Bear Golems (3:56), Spewer Golem (14:01). Engine: js/modes/g5_pawnbarian.js (hand, actions, hearts,
   threat notches, promotion, floors); this file adds the floors, the vigilant rule, gold + shop, hearts carried between
   floors and a tappable card hand. Inferred: floor armies, gold per floor (loot that decays: 8 minus turns, min 2), card
   prices (knight 3, bishop 5, rook 6), starting 4 of 6 hearts (the still shows 6 heart slots), which golem sprite is which
   (except the imp and the hero). 
   cm-g6b pass 2 (2026-11-25, transcript re-read + stills maxres2/3): own hooks (no longer g5_pawnbarian). Cards carry
   upgrades (shield: blocks 1 damage this turn; diagonal / cardinal splash: hits the monsters on those squares around where
   the hero lands, 1:30, 18:10; cantrip: +1 action, 0:43) and are drawn from a draw pile into a hand of 3, played cards go to
   the discard pile, which is reshuffled when the pile runs out (the Deck / Discard panels of the stills). Spark traits fire
   after every cantrip and again for each Spark Imp death ("golem soul: after death triggers all spark traits", 4:34; "it
   applied the effect doubly because I got rid of both of the spark imps", 26:16): Knight Golem spark aegis + surge (0:34),
   Coil Golem surge (0:54), Cappy Bear Golem spark walk (1:04), Spewer Golem (14:01: moves twice leaving blight, spark blight
   blast on the adjacent squares, immune to cardinally adjacent strikes, spark immune, nimble, spark puppeteer = spawns a
   Cappy Bear Golem). Nimble dodges the first attack each turn, splashes included (7:34-7:55). Each monster strikes its own
   targeted squares for 1 damage per monster (red notches + a damage number; the Spark Imp's whole row and column as in
   maxres2); shields absorb ("took 14 damage and shielded from five", 29:02). Loot row above the board (gold bag with the run's
   gold, a heart crystal and gold nuggets; the rightmost item is lost every turn), hearts row with the end-turn chevrons, shop
   with hearts, new cards, upgrades ("upgrade the rook with cardinal splash", 22:37) and discarding a card (25:41). Board
   colours from maxres2 (#636885 / #37375d). Inferred: targeting patterns other than the imp's, the start deck's upgrades,
   blight damage (1 when a turn ends on it), upgrade prices, loot amounts. */
CM.mode({
  id: 'zP9TzlgA-W0',
  title: 'Can I MASTER Pawnbarian?',
  name: 'Pawnbarian',
  category: 'Variants & Games',
  description: 'The Golem Fortress: your Pawnbarian moves with piece cards. You hold three cards and take two actions a turn (tap a card to choose it, or just move). Moving into a monster kills it. Card upgrades: shield (blocks one damage this turn), diagonal / cardinal splash (also hits the monsters on those squares around where you land) and cantrip (an extra action, but every golem\'s spark trait fires). When your actions are spent, every monster strikes its red-notched squares for one damage each. Coil Golems must be struck from an adjacent square, Guard Golems only diagonally, Spewer Golems never from a cardinally adjacent square; nimble monsters dodge the first hit. Reach the back row to promote your pawn cards to queens. Clear seven floors; grab the loot row fast and spend gold on hearts, cards and upgrades.',
  how_to_win: 'Clear all seven floors of the Golem Fortress.',
  player_side: 'white',
  player: { name: 'Pawnbarian', rating: null, avatar: 'assets/modes/zP9TzlgA-W0/hero.png' },
  opponent: { name: 'The Golem Fortress', rating: null, avatar: 'assets/modes/zP9TzlgA-W0/skull_enemy.png', tagline: 'High voltage, keep out.' },
  board: { files: 5, ranks: 5, light: '#636885', dark: '#37375d', background: '#37375d' },
  pieces: { /* hero + Cappy Bears cut from the video frames (tools/g6_art_pass2.py); golems + imp from maxres2/3 (tools/g6b_art.py) */
    H: { name: 'Pawnbarian', moves: '', gen: 'hero', value: 1000, img: 'assets/modes/zP9TzlgA-W0/hero.png', badge: '' },
    C: { name: 'Cappy Bear Golem', moves: 'mK', value: 200, img: 'assets/modes/zP9TzlgA-W0/cappy_bear.png', badge: '' },
    Y: { name: 'Guard Golem', moves: 'mK', value: 280, img: 'assets/modes/zP9TzlgA-W0/guard_golem.png', badge: '' },
    O: { name: 'Coil Golem', moves: 'mK', value: 300, img: 'assets/modes/zP9TzlgA-W0/coil_golem.png', badge: '' },
    I: { name: 'Spark Imp', moves: 'mK', value: 220, img: 'assets/modes/zP9TzlgA-W0/spark_imp.png', badge: '' },
    G: { name: 'Knight Golem', moves: 'mN', value: 260, img: 'assets/modes/zP9TzlgA-W0/knight_golem.png', badge: '' },
    E: { name: 'Spewer Golem', moves: 'mK', value: 320, img: 'assets/modes/zP9TzlgA-W0/spewer_golem.png', badge: '' }
  },
  setup: { fen: 'g1o1g/5/5/5/2H2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { none: true }, movesPerTurn: { w: 2 }, drawPlies: 400, win: [] },
  bot: { engine: 'search', depth: 2, time_ms: 400, min_ms: 380 },
  params: {
    hearts: 4,
    deck: [{ t: 'P', up: ['shield', 'dsplash'] }, { t: 'P', up: ['cantrip'] }, { t: 'P', up: ['csplash'] }, { t: 'P', up: [] }, { t: 'N', up: [] }, { t: 'B', up: ['dsplash'] }, { t: 'R', up: [] }, { t: 'Q', up: ['cantrip'] }],
    floors: [
      { name: 'The Golem Fortress - Floor 1', fen: 'g1o1c/5/5/5/2H2' },
      { name: 'Floor 2: coil golem and guard', fen: '1o1y1/2c2/5/5/2H2' },
      { name: 'Floor 3: spark imps', fen: 'i3i/5/1o3/5/2H2' },
      { name: 'Floor 4: four knight golems', fen: 'g1i1g/5/g3g/5/2H2' },
      { name: 'Floor 5: the spewer golem', fen: '1ie2/1o1y1/5/5/4H' },
      { name: 'Floor 6: spewer, guards, knights', fen: 'eyc1y/g3g/1o3/5/2H2' },
      { name: 'Floor 7: three spark imps', fen: 'iyi1i/1gog1/5/5/2H2' }
    ]
  },
  hooks: (function () {
    var A = 'assets/modes/zP9TzlgA-W0/', NAME = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' };
    var UPN = { shield: 'Shield', dsplash: 'Diagonal splash', csplash: 'Cardinal splash', cantrip: 'Cantrip' }, UPIMG = { shield: 'up_shield', dsplash: 'up_dsplash', csplash: 'up_csplash', cantrip: 'up_cantrip' };
    var PRICE = { N: 3, B: 5, R: 6 }, UPRICE = { shield: 4, dsplash: 5, csplash: 5, cantrip: 3 }, HEART = 9, MAXHP = 6;
    var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]], ORTH = D8.slice(0, 4), DIAG = D8.slice(4), KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
    /* per-monster traits (transcript) and targeting (Spark Imp from maxres2; the others inferred) */
    var MON = { C: { tgt: 'K', walk: 1 }, Y: { tgt: 'K', diagOnly: 1 }, O: { tgt: 'W2', vigilant: 1, surge: 1 }, I: { tgt: 'RC', soul: 1 },
      G: { tgt: 'N', aegis: 1, surge: 1 }, E: { tgt: 'K', cardImm: 1, nimble: 1, aegis: 1, blast: 1, puppet: 1, twice: 1 } };
    var R = null;
    function run(ctx) { return R || (R = { k: 0, gold: 0, hp: ctx.params.hearts, deck: ctx.params.deck.map(function (c) { return { t: c.t, up: c.up.slice() }; }), snap: null }); }
    function isMon(p) { return p && p.c === 'b'; }
    function rng(s) { return (s * 1103515245 + 12345) & 0x7fffffff; }
    function hero(b) { for (var i = 0; i < b.length; i++) if (b[i] && b[i].t === 'H') return i; return -1; }
    function ctype(c) { return c.pr ? 'Q' : c.t; }
    function targets(g, b, i) {   /* squares monster i strikes */
      var p = b[i], m = MON[p.t] || { tgt: 'K' }, o = [], add = function (j) { if (j >= 0) o.push(j); };
      if (m.tgt === 'K') D8.forEach(function (d) { add(g.step(i, d[0], d[1])); });
      else if (m.tgt === 'N') KN.forEach(function (d) { add(g.step(i, d[0], d[1])); });
      else if (m.tgt === 'W2') ORTH.forEach(function (d) { var j = g.step(i, d[0], d[1]); add(j); if (j >= 0) add(g.step(j, d[0], d[1])); });
      else if (m.tgt === 'RC') ORTH.forEach(function (d) { var j = i; while ((j = g.step(j, d[0], d[1])) >= 0) o.push(j); });
      return o;
    }
    function threat(g, b) { var t = {}; for (var i = 0; i < b.length; i++) if (isMon(b[i])) targets(g, b, i).forEach(function (j) { t[j] = (t[j] || 0) + 1; }); return t; }
    /* can the hero at f strike the monster at t (kind 'move' | 'dsplash' | 'csplash') */
    function canHit(g, b, f, t, kind) {
      var q = b[t]; if (!isMon(q) || q.imm) return false; var m = MON[q.t] || {}, dc = Math.abs(g.col(t) - g.col(f)), dr = Math.abs(g.row(t) - g.row(f));
      if (kind === 'csplash') return !m.diagOnly && !m.cardImm;
      if (kind === 'dsplash') return true;
      if (m.diagOnly && dc !== dr) return false;
      if (m.vigilant && g.dist(f, t) > 1) return false;
      if (m.cardImm && g.dist(f, t) === 1 && (dc === 0 || dr === 0)) return false;
      return true;
    }
    function drawHand(x) {
      var s = x.seed || 7; x.drawP = x.drawP.slice(); x.disc = x.disc.slice(); x.hand = x.hand.slice();
      while (x.hand.length < 3) {
        if (!x.drawP.length) { if (!x.disc.length) break; var d = x.disc.slice(); x.disc = []; while (d.length) { s = rng(s); x.drawP.push(d.splice(s % d.length, 1)[0]); } }
        x.hand.push(x.drawP.pop());
      }
      x.seed = s;
    }
    function heroGen(V, st, i, p, out) {
      var g = V.geo, b = st.b, x = st.x, hand = (x.hand || []).slice();
      hand.sort(function (a, c) { var A1 = x.cards[a], C1 = x.cards[c]; if (x.sel === a) return -1; if (x.sel === c) return 1;
        var ka = A1.up.indexOf('cantrip') >= 0 ? 1 : 0, kc = C1.up.indexOf('cantrip') >= 0 ? 1 : 0; if (ka !== kc) return ka - kc; return 'PNBRQK'.indexOf(ctype(A1)) - 'PNBRQK'.indexOf(ctype(C1)); });
      if (x.sel != null && hand.indexOf(x.sel) >= 0) hand = [x.sel];
      var n0 = out.length;
      function add(j, k) { if (j < 0) return false; var q = b[j]; if (q && !isMon(q)) return false; if (q && !canHit(g, b, i, j, 'move')) return false; out.push({ f: i, t: j, p: p.t, c: p.c, cap: q || null, capSq: q ? j : undefined, card: k }); return !q; }
      function gen(T, k) {
        if (T === 'P') { var j = g.step(i, 0, -1); if (j >= 0 && !b[j]) add(j, k); [-1, 1].forEach(function (dc) { var d = g.step(i, dc, -1); if (d >= 0 && isMon(b[d])) add(d, k); }); }
        else if (T === 'N') KN.forEach(function (v) { add(g.step(i, v[0], v[1]), k); });
        else if (T === 'K') D8.forEach(function (v) { add(g.step(i, v[0], v[1]), k); });
        else (T === 'R' ? ORTH : T === 'B' ? DIAG : D8).forEach(function (v) { var j = i; while ((j = g.step(j, v[0], v[1])) >= 0) { if (!add(j, k)) break; } });
      }
      hand.forEach(function (k) { gen(ctype(x.cards[k]), k); });
      if (out.length === n0) gen('K', -1);   /* no card can move: a desperate king step (no card spent) */
    }
    /* one strike on the monster at j: nimble dodges the first one each turn (it steps away from the hero) */
    function strike(V, n, j, at, died, ev) {
      var g = V.geo, q = n.b[j], m = MON[q.t] || {};
      if (m.nimble && !q.dodged) {
        var best = -1, bd = -1; D8.forEach(function (d) { var s = g.step(j, d[0], d[1]); if (s >= 0 && !n.b[s] && g.dist(s, at) > bd) { bd = g.dist(s, at); best = s; } });
        var nq = Object.assign({}, q, { dodged: 1 }); n.b[j] = null; n.b[best >= 0 ? best : j] = nq; ev.push({ k: 'dodge', at: best >= 0 ? best : j }); return;
      }
      n.b[j] = null; died.push(q); ev.push({ k: 'kill', at: j });
    }
    function sparks(V, n, at, times, ev) {   /* every spark trait fires: aegis, surge, walk, blight blast, puppeteer */
      var g = V.geo, x = n.x, dmg = 0;
      for (var r = 0; r < times; r++) {
        var list = []; n.b.forEach(function (p, i) { if (isMon(p)) list.push(i); });
        list.forEach(function (i) {
          var p = n.b[i]; if (!isMon(p)) return; var m = MON[p.t] || {};
          if (m.aegis) n.b[i] = Object.assign({}, n.b[i], { imm: 1 });
          if (m.surge && targets(g, n.b, i).indexOf(at) >= 0) { dmg++; ev.push({ k: 'surge', at: i }); }
          if (m.walk) { var best = -1, bd = 99; D8.forEach(function (d) { var s = g.step(i, d[0], d[1]); if (s >= 0 && !n.b[s] && g.dist(s, at) < bd) { bd = g.dist(s, at); best = s; } }); if (best >= 0) { n.b[best] = n.b[i]; n.b[i] = null; } }
          if (m.blast) { x.blight = Object.assign({}, x.blight); D8.forEach(function (d) { var s = g.step(i, d[0], d[1]); if (s >= 0) x.blight[s] = 1; }); ev.push({ k: 'blast', at: i }); }
          if (m.puppet) { for (var k = 0; k < 8; k++) { var s = g.step(i, D8[k][0], D8[k][1]); if (s >= 0 && !n.b[s]) { n.b[s] = { t: 'C', c: 'b', m: 1 }; ev.push({ k: 'spawn', at: s }); break; } } }
        });
      }
      return dmg;
    }
    function hurt(x, dmg, ev, at) { if (dmg <= 0) return; var ab = Math.min(x.sh || 0, dmg); x.sh = (x.sh || 0) - ab; x.hp = (x.hp || 0) - (dmg - ab); x.dmgT = (x.dmgT || 0) + dmg; x.shT = (x.shT || 0) + ab; ev.push({ k: 'dmg', n: dmg - ab, ab: ab, at: at }); }

    /* ---------------- game UI ---------------- */
    function css() {
      if (document.getElementById('pb2-css')) return; var s = document.createElement('style'); s.id = 'pb2-css';
      s.textContent = '.pb-notch{position:absolute;inset:0;pointer-events:none;background:linear-gradient(135deg,#e0316a 0 9%,transparent 9%),linear-gradient(225deg,#e0316a 0 9%,transparent 9%),linear-gradient(45deg,#e0316a 0 9%,transparent 9%),linear-gradient(315deg,#e0316a 0 9%,transparent 9%);opacity:.9}' +
        '.pb-dmg{position:absolute;right:4%;bottom:2%;font:700 calc(var(--sqpx,60px)*.22)/1 system-ui;color:#ff8aa8;text-shadow:0 1px 0 #000;pointer-events:none}.pb-blight{position:absolute;inset:8%;border-radius:30%;background:radial-gradient(rgba(120,190,60,.55),rgba(80,140,40,.15));pointer-events:none}' +
        '.pb-imm img{filter:drop-shadow(0 0 4px #9fe8ff) drop-shadow(0 0 2px #fff)}' +
        '#pb-loot{display:flex;align-items:center;gap:2px;height:30px;margin:2px auto;max-width:100%;overflow:hidden}#pb-loot img{height:26px;width:auto}#pb-loot .bag{position:relative}#pb-loot .bag b{position:absolute;left:0;right:0;top:44%;text-align:center;font:700 12px/1 Georgia,serif;color:#2a2440}' +
        '#pb-ui{display:flex;flex-direction:column;gap:6px;align-items:center;margin:6px 0;color:#fff;font:13px/1.2 Georgia,serif}#pb-ui .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center}' +
        '#pb-ui .hearts img{height:24px}#pb-ui .card{width:62px;height:84px;border-radius:5px;border:3px solid #fff;background:#dde8eb;padding:3px;cursor:pointer;display:flex;flex-direction:column;align-items:center}' +
        '#pb-ui .card.on{border-color:#f0b648}#pb-ui .card .ups{height:16px;display:flex;gap:2px}#pb-ui .card .ups img{height:15px}#pb-ui .card .pc2{flex:1;min-height:0;width:100%;object-fit:contain}' +
        '#pb-ui .pile{display:flex;gap:3px;align-items:flex-start;flex-wrap:wrap;justify-content:center}#pb-ui .pile span{display:flex;flex-direction:column;align-items:center}#pb-ui .pile img.p{height:18px;filter:brightness(10)}#pb-ui .pile img.u{height:9px}' +
        '#pb-ui .end{border:0;background:none;padding:0;cursor:pointer}#pb-ui .end img{height:30px}#pb-ui .end:disabled{opacity:.4}';
      document.head.appendChild(s);
    }
    function pimg(ctx, t) { return ctx.game.pieceImage({ t: t, c: 'w' }); }
    function ups(c, cls) { return c.up.map(function (u) { return '<img class="' + (cls || '') + '" alt="' + UPN[u] + '" title="' + UPN[u] + '" src="' + A + UPIMG[u] + '.png">'; }).join(''); }
    function ui(ctx) {
      css(); var x = ctx.state.x || {}, r = run(ctx);
      var col = document.getElementById('board-col'), area = document.getElementById('board-area'), stl = document.getElementById('status');
      var lt = document.getElementById('pb-loot'); if (!lt && col && area) { lt = document.createElement('div'); lt.id = 'pb-loot'; col.insertBefore(lt, area); }
      if (lt) lt.innerHTML = '<span class="bag"><img alt="gold" src="' + A + 'loot_bag.png"><b>' + r.gold + '</b></span>' + (x.loot || []).map(function (it) { return '<img alt="' + (it === 'c' ? 'heart crystal' : 'gold') + '" src="' + A + (it === 'c' ? 'loot_crystal' : 'loot_gold') + '.png" style="height:' + (it === 'c' ? 24 : 18) + 'px">'; }).join('');
      var el = document.getElementById('pb-ui'); if (!el && stl && stl.parentNode) { el = document.createElement('div'); el.id = 'pb-ui'; stl.parentNode.insertBefore(el, stl); }
      if (!el) return;
      var hp = Math.max(0, x.hp || 0), myTurn = ctx.state.turn === ctx.human && !ctx.over;
      var pile = function (list) { return list.map(function (k) { var c = x.cards[k]; return '<span><img class="p" alt="' + NAME[ctype(c)] + '" src="' + pimg(ctx, ctype(c)) + '">' + ups(c, 'u') + '</span>'; }).join('') || '<i style="opacity:.6">empty</i>'; };
      el.innerHTML = '<div class="row hearts">' + new Array(hp + 1).join('<img alt="heart" src="' + A + 'heart_full.png">') + new Array(Math.max(0, MAXHP - hp) + 1).join('<img alt="empty heart" src="' + A + 'heart_empty.png">') +
        (x.sh ? '<img alt="shield" src="' + A + 'up_shield.png" style="height:20px;margin-left:6px"><b>' + x.sh + '</b>' : '') +
        '<button type="button" class="end" data-end="1" title="End turn"' + (myTurn ? '' : ' disabled') + '><img alt="End turn" src="' + A + 'end_turn.png"></button></div>' +
        '<div class="row">' + (x.hand || []).map(function (k) { var c = x.cards[k]; return '<button type="button" class="card' + (x.sel === k ? ' on' : '') + '" data-k="' + k + '" title="' + NAME[ctype(c)] + (c.up.length ? ': ' + c.up.map(function (u) { return UPN[u]; }).join(', ') : '') + '"><span class="ups">' + ups(c) + '</span><img class="pc2" alt="' + NAME[ctype(c)] + '" src="' + pimg(ctx, ctype(c)) + '"></button>'; }).join('') + '</div>' +
        '<div class="row" style="font-size:11px;opacity:.9"><b style="font-variant:small-caps">Deck</b><div class="pile">' + pile(x.drawP || []) + '</div><b style="font-variant:small-caps;margin-left:8px">Discard</b><div class="pile">' + pile(x.disc || []) + '</div></div>';
      el.onclick = function (e) {
        var G = ctx.game; if (ctx.over || G.busy || ctx.state.turn !== ctx.human) return;
        var b = e.target.closest('[data-k],[data-end]'); if (!b) return;
        if (b.dataset.end) { var pm = G.moves.find(function (m) { return m.pass; }); if (pm) G.commit(pm, {}); return; }
        var k = +b.dataset.k; ctx.setX('sel', ctx.state.x.sel === k ? null : k); ctx.refresh(); ui(ctx);
      };
    }
    function close() { var e = document.getElementById('pb-run'); if (e) e.remove(); }
    function shop(ctx) {
      var r = run(ctx), wrap = document.getElementById('board-wrap'); if (!wrap) return; close();
      if (!r.offer) {   /* three upgrade offers: a random card of your deck + an upgrade it does not have yet */
        var o = [], tries = 0; while (o.length < 3 && tries++ < 40) { var k = ctx.random(r.deck.length), u = ctx.pick(Object.keys(UPRICE)); if (r.deck[k].up.indexOf(u) < 0 && !o.some(function (z) { return z.k === k && z.u === u; })) o.push({ k: k, u: u }); }
        r.offer = o; r.dropped = 0;
      }
      var el = document.createElement('div'); el.id = 'pb-run';
      el.style.cssText = 'position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(55,55,93,.98);padding:10px;display:flex;flex-direction:column;gap:7px;color:#fff;font:14px/1.3 Georgia,serif';
      var btn = function (a, v, label, cost, dis) { return '<button type="button" class="btn" data-a="' + a + '" data-v="' + v + '"' + (r.gold < cost || dis ? ' disabled' : '') + ' style="flex:1 1 30%;min-width:92px;flex-direction:column;gap:3px;padding:6px 4px;background:#45427a">' + label + '<b style="color:#f0b648">' + cost + ' gold</b></button>'; };
      var cardLab = function (c) { return '<span style="display:flex;gap:2px;height:16px">' + ups(c).replace(/<img /g, '<img style="height:15px" ') + '</span><img alt="" src="' + pimg(ctx, c.t) + '" style="width:34px;height:34px;background:#dde8eb;border-radius:4px">'; };
      el.innerHTML = '<b style="font-size:18px;font-variant:small-caps">Shop</b><div style="display:flex;align-items:center;gap:6px"><img alt="" src="' + A + 'loot_bag.png" style="height:28px"><b style="color:#f0b648;font-size:20px">' + r.gold + '</b> \u00b7 ' + new Array(r.hp + 1).join('<img alt="" src="' + A + 'heart_full.png" style="height:18px">') + new Array(Math.max(0, MAXHP - r.hp) + 1).join('<img alt="" src="' + A + 'heart_empty.png" style="height:18px">') + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' + btn('heart', 0, '<img alt="" src="' + A + 'heart_full.png" style="height:34px"><span>Heart</span>', HEART, r.hp >= MAXHP) +
        Object.keys(PRICE).map(function (t) { return btn('card', t, '<img alt="" src="' + pimg(ctx, t) + '" style="width:34px;height:34px;background:#dde8eb;border-radius:4px"><span>' + NAME[t] + ' card</span>', PRICE[t]); }).join('') + '</div>' +
        '<b style="font-variant:small-caps">Upgrade a piece</b><div style="display:flex;flex-wrap:wrap;gap:6px">' + r.offer.map(function (o, i) { var c = r.deck[o.k]; return btn('up', i, cardLab({ t: c.t, up: c.up.concat([o.u]) }) + '<span>' + NAME[c.t] + ' + ' + UPN[o.u] + '</span>', UPRICE[o.u], o.sold); }).join('') + '</div>' +
        '<b style="font-variant:small-caps">Discard a card' + (r.dropped ? ' (done)' : '') + '</b><div style="display:flex;flex-wrap:wrap;gap:4px">' + r.deck.map(function (c, k) { return '<button type="button" class="btn" data-a="drop" data-v="' + k + '"' + (r.dropped || r.deck.length <= 4 ? ' disabled' : '') + ' style="flex-direction:column;padding:3px;background:#45427a">' + cardLab(c) + '</button>'; }).join('') + '</div>' +
        '<button type="button" class="btn" data-a="next" style="margin-top:auto;background:#f0b648;color:#222;font-weight:700">Next floor &rarr;</button>';
      el.onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b || b.disabled) return; var a = b.dataset.a, v = b.dataset.v;
        if (a === 'heart') { r.gold -= HEART; r.hp = Math.min(MAXHP, r.hp + 1); }
        else if (a === 'card') { r.gold -= PRICE[v]; r.deck.push({ t: v, up: [] }); }
        else if (a === 'up') { var o = r.offer[+v]; r.gold -= UPRICE[o.u]; r.deck[o.k] = { t: r.deck[o.k].t, up: r.deck[o.k].up.concat([o.u]) }; o.sold = 1; }
        else if (a === 'drop') { r.deck.splice(+v, 1); r.dropped = 1; r.offer = r.offer.filter(function (o) { return o.k !== +v; }).map(function (o) { return o.k > +v ? Object.assign({}, o, { k: o.k - 1 }) : o; }); }
        else if (a === 'next') { r.offer = null; close(); ctx.game.newGame(); return; }
        ctx.sound('notify'); shop(ctx); };
      wrap.appendChild(el);
    }
    function fl(ctx) { var F = ctx.params.floors; return F[Math.min(run(ctx).k, F.length - 1)]; }
    return {
      hero: heroGen,
      setup: function (ctx) {
        var r = run(ctx), V = ctx.V, st = ctx.state; close();
        st.b = CM.spec.parseSetup(V, fl(ctx).fen); st.turn = 'w'; st.sub = 0; st.start = {};
        var cards = r.deck.map(function (c) { return { t: c.t, up: c.up.slice() }; }), idx = cards.map(function (c, k) { return k; }), seed = 1 + ctx.random(100000), drawP = [];
        while (idx.length) { seed = rng(seed); drawP.push(idx.splice(seed % idx.length, 1)[0]); }
        var x = { cards: cards, drawP: drawP, disc: [], hand: [], sel: null, hp: r.hp, sh: 0, act: 2, seed: seed, blight: {}, loot: ['c', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g', 'g'], turns: 0, dmgT: 0, shT: 0 };
        drawHand(x); st.x = x; r.snap = { hp: r.hp, gold: r.gold };
        V.rules.movesPerTurn = { w: 2 };
      },
      onStart: function (ctx) { var r = run(ctx); ctx.toast('Pawnbarian \u00b7 The Golem Fortress \u00b7 Floor ' + (r.k + 1) + ' - Chain 0', 2800); ui(ctx); },
      moves: function (V, st, out) {
        if (st.turn === 'w') { var h = hero(st.b); if (h >= 0) out.push({ f: h, t: h, p: 'H', c: 'w', cap: null, pass: 1, card: -1 }); return out; }
        if (out.length) return out;   /* a monster side with no move passes */
        for (var i = 0; i < st.b.length; i++) if (isMon(st.b[i])) return [{ f: i, t: i, p: st.b[i].t, c: 'b', cap: null, pass: 1 }];
        return out;
      },
      onMake: function (V, st, m, n) {
        var g = V.geo, x = n.x = Object.assign({}, st.x), ev = x.ev = [];
        if (st.turn === 'b') {   /* monsters moved: aegis wears off, the hero gets two actions; the Spewer leaves blight */
          if (m.p === 'E' && !m.pass) { x.blight = Object.assign({}, x.blight); x.blight[m.f] = 1; }
          for (var i = 0; i < n.b.length; i++) { var q = n.b[i]; if (isMon(q) && (q.imm || q.dodged)) n.b[i] = Object.assign({}, q, { imm: 0, dodged: 0 }); }
          x.act = 2; x.sel = null; return;
        }
        if (m.pass) { n.b[m.f] = st.b[m.f]; x.act = 0; }
        else {
          var card = m.card >= 0 ? x.cards[m.card] : null, up = card ? card.up : [], died = [], at = m.t, sp = 0;
          if (card) { x.hand = x.hand.filter(function (k) { return k !== m.card; }); x.disc = x.disc.concat([m.card]); }
          x.act = (x.act || 2) - 1; x.sel = null;
          if (up.indexOf('shield') >= 0) x.sh = (x.sh || 0) + 1;
          if (m.cap) {
            var mm = MON[m.cap.t] || {};
            if (mm.nimble && !m.cap.dodged) { n.b[m.f] = st.b[m.f]; n.b[m.t] = m.cap; at = m.f; strike(V, n, m.t, at, died, ev); }
            else { died.push(m.cap); ev.push({ k: 'kill', at: m.t }); }
          }
          [['dsplash', DIAG], ['csplash', ORTH]].forEach(function (s) {
            if (up.indexOf(s[0]) < 0) return;
            s[1].forEach(function (d) { var j = g.step(at, d[0], d[1]); if (j >= 0 && canHit(g, n.b, at, j, s[0])) { ev.push({ k: 'splash', at: j }); strike(V, n, j, at, died, ev); } });
          });
          died.forEach(function (q) { if ((MON[q.t] || {}).soul) sp++; });
          if (g.row(at) === 0) { var pr = 0; x.cards = x.cards.map(function (c, k) { if (c.t === 'P' && !c.pr && (x.hand.indexOf(k) >= 0 || k === m.card)) { pr = 1; return Object.assign({}, c, { pr: 1 }); } return c; }); if (pr) ev.push({ k: 'promo', at: at }); }
          if (up.indexOf('cantrip') >= 0) { x.act += 1; sp++; ev.push({ k: 'cantrip', at: at }); }
          if (sp) { var dm = sparks(V, n, at, sp, ev); hurt(x, dm, ev, at); }
        }
        if (x.act <= 0) {   /* end of the turn: every monster strikes its targeted squares, blight burns, a fresh hand */
          var h = hero(n.b), t = threat(g, n.b), dmg = (t[h] || 0) + (x.blight && x.blight[h] ? 1 : 0);
          hurt(x, dmg, ev, h);
          x.disc = x.disc.concat(x.hand); x.hand = []; drawHand(x); x.sh = 0; x.turns = (x.turns || 0) + 1;
          if (x.loot && x.loot.length) x.loot = x.loot.slice(0, -1);
          for (var i2 = 0; i2 < n.b.length; i2++) { var q2 = n.b[i2]; if (isMon(q2) && q2.dodged) n.b[i2] = Object.assign({}, q2, { dodged: 0 }); }
        }
        V.rules.movesPerTurn = { w: (st.sub || 0) + 1 + (x.act > 0 ? 1 : 0) };
      },
      checkWin: function (V, st) {
        if ((st.x.hp || 0) <= 0) return { w: 'b', why: 'the Pawnbarian ran out of hearts' };
        for (var i = 0; i < st.b.length; i++) if (isMon(st.b[i])) return null;
        return { w: 'w', why: 'every monster on the floor is dead' };
      },
      evaluate: function (V, st) {
        var h = hero(st.b), v = 0; if (h < 0) return 0; var t = threat(V.geo, st.b);
        for (var j = 0; j < st.b.length; j++) if (isMon(st.b[j])) v += 120 + 20 * (4 - Math.min(4, V.geo.dist(j, h)));
        return 400 * (st.x.hp || 0) - v - 60 * (t[h] || 0);
      },
      afterMove: function (ctx, m, info) {
        var x = ctx.state.x || {}, ev = x.ev || [], V = ctx.V;
        ev.forEach(function (e) {
          var sq = ctx.name(e.at);
          if (e.k === 'splash' || e.k === 'kill') ctx.fx({ type: 'overlay', at: sq, image: 'assets/modes/Kzt9ItpGtYg/splash.png', fit: 'contain', duration_ms: 520 });
          else if (e.k === 'dodge') ctx.fx({ type: 'text', text: 'Nimble', at: sq, color: '#9fe8ff', size: 18, duration_ms: 900 });
          else if (e.k === 'surge') ctx.fx({ type: 'overlay', at: sq, image: A + 'spark_bolt.png', fit: 'contain', duration_ms: 600 });
          else if (e.k === 'cantrip') { ctx.fx({ type: 'overlay', at: sq, image: 'assets/modes/Kzt9ItpGtYg/zap.png', fit: 'contain', duration_ms: 420 }); ctx.toast('Cantrip: +1 action. Spark traits trigger!', 1600); }
          else if (e.k === 'blast') ctx.fx({ type: 'particles', kind: 'smoke', at: sq, count: 12 });
          else if (e.k === 'spawn') ctx.toast('Spark puppeteer: a Cappy Bear Golem appears.', 1600);
          else if (e.k === 'promo') { ctx.fx({ type: 'overlay', at: sq, image: 'assets/modes/Kzt9ItpGtYg/splash.png', fit: 'contain', duration_ms: 700 }); ctx.sound('promote'); ctx.toast('Promotion: your pawn cards become queens for this floor.', 2200); }
          else if (e.k === 'dmg') ctx.fx({ type: 'text', text: e.n ? e.n + ' damage' : 'Shielded', at: sq, color: e.n ? '#ff5d8a' : '#c9d2e3', size: 18, duration_ms: 1000 });
        });
        /* the Spewer Golem moves twice and leaves blight in its path */
        if (info && info.by === 'bot' && m && m.p === 'E' && !m.pass && !ctx.over) {
          var g = V.geo, h = hero(ctx.state.b), best = -1, bd = 99;
          D8.forEach(function (d) { var s = g.step(m.t, d[0], d[1]); if (s >= 0 && !ctx.at(s) && g.dist(s, h) < bd) { bd = g.dist(s, h); best = s; } });
          if (best >= 0) { var bl = Object.assign({}, ctx.state.x.blight); bl[m.t] = 1; ctx.setX('blight', bl); ctx.move(m.t, best); ctx.refresh(); }
        }
        ui(ctx); return null;
      },
      decorate: function (ctx, sq, p) {
        var st = ctx.state, x = st.x || {}, t = threat(ctx.geo, st.b), n = t[sq] || 0, html = '';
        if (x.blight && x.blight[sq]) html += '<span class="pb-blight"></span>';
        if (n && (!p || p.t === 'H')) html += '<span class="pb-notch"></span><span class="pb-dmg">' + n + '</span>';
        var o = {}; if (html) o.html = html; if (p && p.imm) o.cls = 'pb-imm'; return html || o.cls ? o : null;
      },
      onTurn: function (ctx) { ui(ctx); },
      onUndo: function (ctx) { ui(ctx); },
      onGameOver: function (ctx, over) {
        var r = run(ctx), x = ctx.state.x || {}, last = ctx.params.floors.length - 1;
        if (over.w === ctx.human) {
          var gold = (x.loot || []).filter(function (i) { return i === 'g'; }).length, crys = (x.loot || []).indexOf('c') >= 0;
          r.gold += gold; r.hp = Math.min(MAXHP, Math.max(1, x.hp || 0) + 1 + (crys ? 1 : 0));   /* a heart back for moving forward (+ the crystal) */
          ctx.toast('Floor cleared: +' + gold + ' gold' + (crys ? ', heart crystal' : '') + ', +1 heart \u00b7 took ' + (x.dmgT || 0) + ' damage, shielded ' + (x.shT || 0) + '.', 3200);
          if (r.k >= last) { ctx.toast('We conquered the Golem Fortress!', 4200); R = null; return; }
          r.k++; ctx.after(1700, function () { shop(ctx); });
        } else if (r.snap) { r.hp = r.snap.hp; r.gold = r.snap.gold; }
        ui(ctx);
      },
      status: function (ctx) { var r = run(ctx), x = ctx.state.x || {}; return 'Floor ' + (r.k + 1) + '/' + ctx.params.floors.length + ' \u00b7 actions ' + Math.max(0, x.act || 0) + ' \u00b7 ' + r.gold + ' gold' + (x.sel != null ? ' \u00b7 card: ' + NAME[ctype(x.cards[x.sel])] : ''); },
      onExit: function (ctx) { close(); ['pb-ui', 'pb-loot'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); }); ctx.V.rules.movesPerTurn = { w: 2 }; }
    };
  })(),
  source: { research: 'research/modes/zP9TzlgA-W0.json', confidence: 'medium', notes: 'Transcript fetched 2026-11-25; floor armies, gold amounts, targeting patterns (except the Spark Imp row/column), start-deck upgrades, upgrade prices and blight damage inferred. Art: loot row, upgrade icons, hearts and end-turn chevrons cut from maxres2/3 (tools/g6b_pb_art.py). blurry-b 2026-11-26: hero.png is the game\'s own Pawnbarian class art from the Pawnbarian Fandom wiki (https://pawnbarian.fandom.com/wiki/File:Pawnbarian_(class).png, 328px transparent), re-traced clean at 512px. end_turn, heart_empty, loot_bag, up_shield re-traced to clean vector shapes (palette-quantised, potrace, re-rendered as a 512px transparent PNG at ~90%, hard anti-aliased edges, no fading; tool tools/sprite_vec.py) from the existing video crop, because no copy of the same image was found online. heart_full.png: the video crop was clipped on the left, so it is a composite of the clean heart_empty outline filled with the heart_full colours.' }
});
