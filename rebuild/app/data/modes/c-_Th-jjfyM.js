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
  player: { name: 'You', rating: 1850 },
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
  params: { throne: ['h9', 'i9', 'h8', 'i8'], lives: 5 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/c-_Th-jjfyM/war_board.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
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
  todo_pass2: ['per-player 3|2 clocks', 'end-of-game placement table'],
  source: { research: 'research/modes/c-_Th-jjfyM.json', confidence: 'medium', notes: 'Board size, army layout, wall ring and throne squares estimated from frames; checkmate worth 40 (transcript also says 20).' }
});
