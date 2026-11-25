/* Can I SURVIVE Petrified Chess?  chess.com Petrified: a non-pawn piece that captures turns to stone on the capture
   square and can never move again (a grey stone block that blocks both sides). Pawns are never petrified and may also
   step one square sideways (no sideways captures). Captures score the captured piece's value; 20 points wins at once;
   checkmate still wins. Sources: research/modes/ppwoznHliD8.json, frames visual (grey stone pieces, point counters). */
CM.mode({
  id: 'ppwoznHliD8',
  name: 'Petrified Chess',
  category: 'Variants & Games',
  description: 'When a knight, bishop, rook, queen or king captures, it turns to stone on that square: an immovable block nobody can pass or take. A petrified king stays your king but can never move again. Pawns never petrify and may also step one square sideways (they still capture diagonally). Every capture scores the captured piece\'s value.',
  how_to_win: 'Checkmate, or be first to 20 points.',
  player_side: 'white',
  opponent: { name: 'topfchess', rating: 1748, avatar: null, tagline: 'Higher-rated Petrified player.' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7a9f58' },
  pieces: {
    P: { name: 'Pawn', moves: 'fmWfcFifmnDsmW', pawn: true, enPassant: true, promote: true, value: 100 },
    S: { name: 'Stone', moves: '', value: 0, blocker: true, capturable: false, img: 'assets/modes/ppwoznHliD8/stone.svg' },
    Y: { name: 'Petrified king', moves: '', value: 0, royal: true, img: 'assets/modes/ppwoznHliD8/stone.svg', badge: 'K' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { win: [{ type: 'checkmate' }, { type: 'points', target: 20, values: { P: 1, N: 3, B: 3, R: 5, Q: 9, Y: 0 } }] },
  clock: { w: 180, b: 180, inc: 2 },
  bot: { engine: 'search', elo: 1748, depth: 3, time_ms: 800 },
  hooks: {
    onMake: function (V, prev, m, n) {
      if (!m.cap || m.drop || V.def(m.p).pawn) return;
      n.b[m.t] = V.def(m.p).royal ? V.piece('Y', m.c, { m: 1 }) : V.piece('S', 'n', { m: 1 });
    },
    status: function (ctx) { var s = ctx.state.score || {}; return 'Points: you ' + (s.w || 0) + ' · ' + ctx.opponent.name + ' ' + (s.b || 0) + ' (20 wins)'; }
  },
  vfx_timeline: [{ trigger: { on: 'capture' }, effect: { type: 'flash', at: 'to', color: '#9a9c9c', opacity: 0.55, duration_ms: 420 } }],
  source: { research: 'research/modes/ppwoznHliD8.json', confidence: 'medium', notes: 'Bishop scored as 3 (narration ambiguous 3 vs 5); draw-by-repetition points tiebreak not implemented.' }
});
