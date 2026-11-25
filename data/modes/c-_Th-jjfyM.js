/* Can I BEAT War for Throne?  Obscure chess.com 4-player variant: a ring of stone walls guards a central throne.
   Pawns promote to (non-royal) kings on their 4th rank; only your original royal king counts: walk it onto the
   throne to win (+40 for every enemy king still standing). Checking a royal king 5 times = checkmate. Kings score 3,
   pawns 1, checkmates 40. 3 FFA games vs humans (~1800-1900); he wins game 1 by running his king to the middle.
   Sources: research/modes/c-_Th-jjfyM.json, frames visual (16x16 cut-corner board #DCDBDC/#ADADAD, cobblestone ring
   with entryways; yellow left, red right, green top, blue bottom). PASS 1: army layout inferred (frames not legible):
   each army = back row + 12 pawns; wall ring of 6x6 with 2-square gates on every side; throne = central 2x2.
   Pass 2 (impl-5, 7th session): wall squares use the cobblestone tile cut from the video; the throne is the lighter
   2x2 in the middle of the ring, as in the frames (no throne graphic is drawn in the game). */
CM.mode({
  id: 'c-_Th-jjfyM',
  title: 'Can I BEAT War for Throne?',
  name: 'War for Throne',
  category: 'Variants & Games',
  description: 'Four armies, free-for-all, moving Red, Blue, Yellow, Green. A ring of stone walls with gates surrounds the central throne. Pawns promote to ordinary kings on their 4th rank (they are not royal and may stand next to other kings). Only your original king is royal: it has 5 lives, every check costs one, and 5 checks count as checkmate. Points: pawn 1, knight 3, bishop/rook 5, queen 9, king 3, checkmate 40.',
  how_to_win: 'Put your royal king on a throne square, or finish with the most points.',
  player_side: 'r',
  player: { name: 'You', rating: 1850, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'Krenn', rating: 1900, tagline: 'Three online humans (~1800-1900).' },
  players: [
    { color: 'r', forward: 'left', name: 'You', swatch: '#bf3b43', base: 'w' },
    { color: 'u', forward: 'up', name: 'Megan', swatch: '#4185bf', base: 'w', rating: 1820 },
    { color: 'y', forward: 'right', name: 'Yellow', swatch: '#c09526', base: 'w', rating: 1796 },
    { color: 'g', forward: 'down', name: 'Krenn', swatch: '#4e9161', base: 'w', rating: 1900 }
  ],
  board: {
    files: 16, ranks: 16, shape: { type: 'cross', corner: 4 }, light: '#DCDBDC', dark: '#ADADAD',
    squares: { h9: { color: 'rgba(255,255,255,.45)' }, i9: { color: 'rgba(255,255,255,.45)' }, h8: { color: 'rgba(255,255,255,.45)' }, i8: { color: 'rgba(255,255,255,.45)' } }
  },
  pieces: {
    '#': { name: 'Stone wall', overlay: null, img: 'assets/modes/c-_Th-jjfyM/stone.png' },
    J: { name: 'Promoted King', moves: 'K', value: 320, glyph: 'K', badge: '+', castle: false, points: 3 }
  },
  setup: { fen: '4[g:R][g:N][g:B][g:K][g:Q][g:B][g:N][g:R]4/4[g:P][g:P][g:P][g:P][g:P][g:P][g:P][g:P]4/6[g:P][g:P][g:P][g:P]6/16/[y:R][y:P]12[r:P][r:R]/[y:N][y:P]3**2**3[r:P][r:N]/[y:B][y:P][y:P]2*4*2[r:P][r:P][r:B]/[y:K][y:P][y:P]10[r:P][r:P][r:Q]/[y:Q][y:P][y:P]10[r:P][r:P][r:K]/[y:B][y:P][y:P]2*4*2[r:P][r:P][r:B]/[y:N][y:P]3**2**3[r:P][r:N]/[y:R][y:P]12[r:P][r:R]/16/6[u:P][u:P][u:P][u:P]6/4[u:P][u:P][u:P][u:P][u:P][u:P][u:P][u:P]4/4[u:R][u:N][u:B][u:Q][u:K][u:B][u:N][u:R]4' },
  rules: {
    castling: false, enPassant: false, drawPlies: 240,
    promotion: { choices: ['J'], zone: 13 },
    win: [{ type: 'points', target: 9999, values: { P: 1, N: 3, B: 5, R: 5, Q: 9, J: 3, K: 3 } }]
  },
  clock: null,
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { throne: ['h9', 'i9', 'h8', 'i8'], lives: 5, clock: 180, inc: 2 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/c-_Th-jjfyM/war_board.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    /* pass 2: chess.com 4-player clocks, 3|2 per player (one clock each, as in the video's bars). The engine's clock is
       2-player only, so the four clocks live here (onTick 100 ms); a player whose flag falls is out (pieces greyed, as
       chess.com does); your own flag ends the game. The end-of-game placement table (1st-4th by points) is added to the
       game-over card. */
    init: function () {
      if (document.getElementById('g5wft-css')) return; var s = document.createElement('style'); s.id = 'g5wft-css';
      s.textContent = '.g5wft-clocks{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 0 0}' +
        '.g5wft-clk{display:flex;align-items:center;gap:6px;min-width:72px;padding:4px 8px;border-radius:4px;background:#262421;color:#989795;font:600 14px/1.2 system-ui,sans-serif;font-variant-numeric:tabular-nums;transition:background .2s ease-out,color .2s ease-out}' +
        '.g5wft-clk i{width:10px;height:10px;border-radius:2px;flex:none}.g5wft-clk.is-on{background:#fff;color:#262421}.g5wft-clk.is-low.is-on{background:#e02828;color:#fff}.g5wft-clk.is-out{opacity:.45;text-decoration:line-through}' +
        '.g5wft-place{width:100%;margin:10px 0 2px;border-collapse:collapse;font:600 14px/1.3 system-ui,sans-serif}.g5wft-place td{padding:4px 6px;text-align:left}.g5wft-place td:last-child{text-align:right;font-variant-numeric:tabular-nums}.g5wft-place tr.is-you{background:rgba(129,182,76,.18)}.g5wft-place i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px}';
      document.head.appendChild(s);
    },
    setup: function (ctx) {
      var ms = (ctx.params.clock || 180) * 1000, ck = { t: performance.now(), turn: ctx.state.turn };
      ctx.colors.forEach(function (c) { ck[c] = ms; }); ctx.game._g5wft = ck;
      var row = document.getElementById('g5wft-clocks');
      if (!row) { row = document.createElement('div'); row.id = 'g5wft-clocks'; row.className = 'g5wft-clocks'; var st = document.getElementById('status'); st.parentNode.insertBefore(row, st); }
      var old = document.querySelector('.g5wft-place'); if (old) old.remove();
    },
    afterMove: function (ctx, move, info) {
      var ck = ctx.game._g5wft; if (!ck) return null; var now = performance.now();
      if (info && info.side && ck[info.side] != null) { ck[info.side] = Math.max(0, ck[info.side] - (now - ck.t)) + (ctx.params.inc || 2) * 1000; }
      ck.t = now; ck.turn = ctx.state.turn; return null;
    },
    onUndo: function (ctx) { var ck = ctx.game._g5wft; if (ck) { ck.t = performance.now(); ck.turn = ctx.state.turn; } },
    onTick: function (ctx, now) {
      var ck = ctx.game._g5wft, row = document.getElementById('g5wft-clocks'); if (!ck || !row) return;
      now = performance.now(); var st = ctx.state, turn = st.turn, out = st.out || {};
      if (ck.turn !== turn) { ck.turn = turn; ck.t = now; }
      var left = function (c) { return Math.max(0, ck[c] - (!ctx.over && c === turn ? now - ck.t : 0)); };
      if (!ctx.over && !out[turn] && left(turn) <= 0) {
        ck[turn] = 0;
        if (turn === ctx.human) { ctx.endGame('bot', 'you ran out of time'); }
        else { var nm = { r: 'You', u: 'Megan', y: 'Yellow', g: 'Krenn' }; ctx.toast(nm[turn] + ' ran out of time.', 2400); ctx.state = ctx.V.eliminate(st, turn); ctx.refresh(); }
      }
      var names = { r: 'You', u: 'Megan', y: 'Yellow', g: 'Krenn' }, sw = { r: '#bf3b43', u: '#4185bf', y: '#c09526', g: '#4e9161' };
      row.innerHTML = ctx.colors.map(function (c) {
        var l = left(c), m = Math.floor(l / 60000), s = Math.floor(l / 1000) % 60, txt = l < 10000 ? (l / 1000).toFixed(1) : m + ':' + (s < 10 ? '0' : '') + s;
        return '<span class="g5wft-clk' + (c === turn && !ctx.over ? ' is-on' : '') + (l < 20000 ? ' is-low' : '') + (out[c] ? ' is-out' : '') + '" title="' + names[c] + '"><i style="background:' + sw[c] + '"></i>' + txt + '</span>';
      }).join('');
    },
    onExit: function () { var r = document.getElementById('g5wft-clocks'); if (r) r.remove(); var t = document.querySelector('.g5wft-place'); if (t) t.remove(); },
    onGameOver: function (ctx) {
      var sc = ctx.state.score || {}, out = ctx.state.out || {}, names = { r: 'You', u: 'Megan', y: 'Yellow', g: 'Krenn' }, sw = { r: '#bf3b43', u: '#4185bf', y: '#c09526', g: '#4e9161' };
      var w = ctx.over && ctx.over.w, order = ctx.colors.slice().sort(function (a, b) { return (b === w) - (a === w) || (sc[b] || 0) - (sc[a] || 0) || (out[a] ? 1 : 0) - (out[b] ? 1 : 0); });
      var why = document.getElementById('gowhy'); if (!why) return;
      var old = document.querySelector('.g5wft-place'); if (old) old.remove();
      var t = document.createElement('table'); t.className = 'g5wft-place';
      t.innerHTML = order.map(function (c, k) { return '<tr' + (c === ctx.human ? ' class="is-you"' : '') + '><td>' + ['1st', '2nd', '3rd', '4th'][k] + '</td><td><i style="background:' + sw[c] + '"></i>' + names[c] + (out[c] ? ' (out)' : '') + '</td><td>' + (sc[c] || 0) + '</td></tr>'; }).join('');
      why.parentNode.insertBefore(t, why.nextSibling);
    },
    /* 5 lives: every move that leaves an enemy royal king attacked costs it one life; the fifth = checkmate (+40) */
    onMake: function (V, st, m, n) {
      var me = st.turn, lives = (V.cfg.params || {}).lives || 5, x = null;
      V.enemiesOf(me).forEach(function (E) {
        if (n.out && n.out[E]) return;
        var R = V.royals(n, E); if (!R.length || !V.attacked(n, R[0], me)) return;
        x = x || (n.x = Object.assign({}, n.x));
        var h = (x['hits_' + E] || 0) + 1; x['hits_' + E] = h;
        if (h >= lives) { n.b[R[0]] = null; n.score = Object.assign({}, n.score); n.score[me] = (n.score[me] || 0) + 40; }
      });
    },
    checkWin: function (V, st) {
      var th = ((V.cfg.params || {}).throne || []).map(function (s) { return V.geo.parse(s); });
      for (var k = 0; k < V.colors.length; k++) {
        var c = V.colors[k]; if (st.out && st.out[c]) continue;
        var R = V.royals(st, c); if (R.length && th.indexOf(R[0]) >= 0) return { w: c, why: 'the royal king took the throne' };
      }
      var alive = V.alive(st);
      if (alive.length <= 1 || st.half >= (V.rules.drawPlies || 240) - 1) {
        var sc = st.score || {}, top = null, hi = -1, tie = false;
        V.colors.forEach(function (c) { var v = sc[c] || 0; if (v > hi) { hi = v; top = c; tie = false; } else if (v === hi) tie = true; });
        return { w: tie ? 'd' : top, why: 'most points (' + hi + ')' };
      }
      return null;
    },
    evaluate: function (V, st, c) {
      if (!c) return 0;
      var th = V.geo.parse('h9'), R = V.royals(st, c), v = 0;
      if (R.length) v -= 6 * V.geo.dist(R[0], th);
      v += 30 * ((st.score || {})[c] || 0);
      return v * (c === 'b' ? -1 : 1);
    },
    onTrigger: function (ctx, name, info) {
      if (name !== 'knockout') return;
      var st = ctx.state, last = ctx.last, to = last ? last.c : null; if (!to || to === 'n' || to === info.side) return;
      if ((st.x['hits_' + info.side] || 0) >= (ctx.params.lives || 5)) return; /* the 5-check mate already scored */
      var sc = Object.assign({}, st.score || {}); sc[to] = (sc[to] || 0) + 40; st.score = sc;
      ctx.toast('+40 for the checkmate.', 2200);
    },
    decorate: function (ctx, sq, p) {
      if (!p || p.t !== 'K' || p.dead) return null;
      var left = (ctx.params.lives || 5) - (ctx.state.x['hits_' + p.c] || 0); return { badge: String(left) };
    },
    status: function (ctx) {
      var st = ctx.state, sc = st.score || {}, names = { r: 'You', u: 'Megan', y: 'Yellow', g: 'Krenn' };
      return ctx.colors.map(function (c) { return names[c] + ' ' + (sc[c] || 0) + (st.out && st.out[c] ? ' (out)' : ''); }).join('  ·  ');
    }
  },
  source: { research: 'research/modes/c-_Th-jjfyM.json', confidence: 'medium', notes: 'Board size, army layout, wall ring and throne squares estimated from frames; checkmate worth 40 (transcript also says 20).' }
});
