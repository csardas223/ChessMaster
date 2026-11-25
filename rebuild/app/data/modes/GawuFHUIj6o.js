/* Can I BEAT Phantom Rooks?  A tall 8x12 board: behind each normal army sits a sealed row of stone walls and, behind
   it, a back row of 8 "phantom" rooks. Jump-spell potions (about x13-x15 per side in the frames) let a rook pass the
   wall row. Sources: research/modes/GawuFHUIj6o.json, frames visual (index 265: tall board, stone wall rows, potions,
   the-killer0 1401, #eaf6d2/#7ea25a). Inferred: a potion lets any rook slide straight through wall squares (it can
   never stop on one), 13 potions per side, pawns promote on the enemy back rank (rank 10 / 3). Phantom rook art is
   original. */
CM.mode({
  id: 'GawuFHUIj6o',
  title: 'Can I BEAT Phantom Rooks?',
  name: 'Phantom Rooks',
  category: 'Variants & Games',
  description: 'Each side has a normal army plus a hidden back row of 8 phantom rooks sealed behind a row of stone walls. Spend a jump-spell potion to send a rook straight through the walls; you have 13 potions. Walls can never be captured or landed on.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  player: { name: 'You', rating: 1450 },
  opponent: { name: 'the-killer0', rating: 1401, tagline: 'Phantom Rooks opponent on chess.com.' },
  board: { files: 8, ranks: 12, light: '#eaf6d2', dark: '#7ea25a' },
  pieces: {
    Ph: { name: 'Phantom Rook', moves: 'R', value: 480, san: 'R', img: { w: 'assets/modes/GawuFHUIj6o/phantom_w.svg', b: 'assets/modes/GawuFHUIj6o/phantom_b.svg' } },
    P: { name: 'Pawn', value: 100, moves: 'fmWfcFifmnD', pawn: true, enPassant: true, promote: true, san: '', promoteZone: 3 }
  },
  setup: { fen: '[ph][ph][ph][ph][ph][ph][ph][ph]/********/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR/********/[Ph][Ph][Ph][Ph][Ph][Ph][Ph][Ph]', x: { pot: { w: 13, b: 13 } } },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'B'], zone: 3 } },
  bot: { engine: 'search', elo: 1401, depth: 3, time_ms: 700 },
  clock: { w: 600, b: 600, inc: 0, bot: false },
  hooks: {
    setup: function (ctx) { ctx.pieces(function (p) { return p.t === 'P'; }).forEach(function (i) { var p = ctx.at(i); ctx.set(i, Object.assign({}, p, { m: 0 })); }); },
    moves: function (V, st, out) {
      var me = st.turn, pot = (st.x.pot || {})[me] || 0, g = V.geo, b = st.b; if (!pot) return out;
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < b.length; i++) {
        var p = b[i]; if (!p || p.c !== me || (p.t !== 'Ph' && p.t !== 'R')) continue;
        dirs.forEach(function (d) {
          var j = i, wall = false;
          while (true) {
            j = g.step(j, d[0], d[1]); if (j < 0) return;
            var q = b[j];
            if (q && q.t === '#') { wall = true; continue; }
            if (!wall) { if (q) return; continue; }
            if (q) { if (V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: me, cap: q, capSq: j, potion: 1 }); return; }
            out.push({ f: i, t: j, p: p.t, c: me, cap: null, potion: 1 });
          }
        });
      }
      return out;
    },
    onMake: function (V, st, m, n) { if (!m.potion) return; var pot = Object.assign({}, st.x.pot); pot[m.c]--; n.x.pot = pot; },
    afterMove: function (ctx, m) { if (m.potion) { ctx.fx({ type: 'particles', kind: 'sparks', at: m.t, count: 16 }); ctx.fx({ type: 'flash', at: m.t, color: '#8fb3ff', opacity: 0.5, duration_ms: 380 }); } },
    status: function (ctx) { var p = ctx.x.pot || {}; return 'Jump-spell potions: you x' + (p[ctx.human] || 0) + ', opponent x' + (p[ctx.bot] || 0) + '. Move a rook through the walls to use one.'; }
  },
  source: { research: 'research/modes/GawuFHUIj6o.json', confidence: 'medium', notes: 'Exact potion count/use inferred from frame counters (x13-x15). Rooks only use potions.' }
});
