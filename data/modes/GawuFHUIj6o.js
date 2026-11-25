/* Can I BEAT Phantom Rooks?  An 8x10 board: behind each army sits a sealed row of stone walls and, behind it, a back
   row of 8 rooks. Jump-spell potions let a rook pass the wall row. Sources: research/modes/GawuFHUIj6o.json, frames
   (hq1/hq2 thumbnails, pol-q2 re-check 2026-11-25: 10 rows = rooks / walls / army row P P P K R P P P with d+e pawns
   in front / 2 empty rows / mirrored; potions x15 at the start, x13/x14 at 3:47; in-game hint "Use your Jump spells on
   the walls in order to free your back rank rooks"; the-killer0 1401, #eaf6d2/#7ea25a). Inferred: a potion lets a rook
   slide straight through wall squares (it can never stop on one), pawns promote on the enemy army row. Back-row rooks
   are plain chess.com rooks in the frames; wall tile cut from the 3:47 frame. */
CM.mode({
  id: 'GawuFHUIj6o',
  title: 'Can I BEAT Phantom Rooks?',
  name: 'Phantom Rooks',
  category: 'Variants & Games',
  description: 'Each side has a small army (king, rook and eight pawns) plus a back row of 8 rooks sealed behind a row of stone walls. Spend a jump-spell potion to send a rook straight through the walls; you have 15 potions. Walls can never be captured or landed on.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  player: { name: 'You', rating: 1450, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'the-killer0', rating: 1401, tagline: 'Phantom Rooks opponent on chess.com.' },
  board: { files: 8, ranks: 10, light: '#eaf6d2', dark: '#7ea25a' },
  pieces: {
    '#': { name: 'Stone wall', img: 'assets/modes/GawuFHUIj6o/wall.png', overlay: null },
    P: { name: 'Pawn', value: 100, moves: 'fmWfcFifmnD', pawn: true, enPassant: true, promote: true, san: '', promoteZone: 3 }
  },
  setup: { fen: 'rrrrrrrr/********/pppkrppp/3pp3/8/8/3PP3/PPPKRPPP/********/RRRRRRRR', x: { pot: { w: 15, b: 15 } } },
  rules: { castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'], zone: 3 } },
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
  source: { research: 'research/modes/GawuFHUIj6o.json', confidence: 'medium', notes: 'pol-q2: board 8x10 + army row PPPKRPPP/3PP3 + 15 potions from the frames (was 8x12 with full armies). Potion use inferred: rooks only.' }
});
