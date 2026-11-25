/* Can I BEAT 1 Million Chessboards?  A grid of a million boards where anyone moves at any time; pieces may cross onto
   neighbouring boards but cannot capture across a board edge. Final challenge vs the developer Nolan: two boards side
   by side, first to capture both enemy kings wins. Sources: research/modes/Obcl5GCtNHc.json (0:53-1:25 no captures
   across boards, 8:05-8:15 two-board king race), frames/thumbnail (#eeeed2/#769656). PASS 1: the two-board challenge,
   turn-based (the site has no turns), no check: kings are captured. */
CM.mode({
  id: 'Obcl5GCtNHc',
  title: 'Can I BEAT 1 Million Chessboards?',
  name: '1 Million Chessboards (2 boards)',
  category: 'Variants & Games',
  description: 'Two standard boards side by side, each with a full game. Pieces may move from one board onto the other, but a capture is only allowed when both squares are on the same board. There is no check: kings can simply be taken.',
  how_to_win: 'Capture both enemy kings first.',
  player_side: 'white',
  opponent: { name: 'Nolan', rating: null, tagline: 'Developer of 1 Million Chessboards.' },
  board: { files: 16, ranks: 8, light: '#eeeed2', dark: '#769656' },
  pieces: { K: { name: 'King', moves: 'K', value: 2000, royal: false, castle: false } },
  setup: { fen: 'rnbqkbnrrnbqkbnr/pppppppppppppppp/16/16/16/16/PPPPPPPPPPPPPPPP/RNBQKBNRRNBQKBNR' },
  rules: { check: 'none', castling: false, win: [{ type: 'capture', piece: 'K', why: 'both kings were captured' }] },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  hooks: {
    filterMoves: function (V, st, legal) { var g = V.geo; return legal.filter(function (m) { return !m.cap || m.f < 0 || (g.col(m.f) < 8) === (g.col(m.capSq != null ? m.capSq : m.t) < 8); }); },
    decorate: function (ctx, sq) { var c = ctx.geo.col(sq); return c === 7 ? { cls: 'g5-edge-r' } : null; },
    init: function () { if (!document.getElementById('g5-1m-css')) { var s = document.createElement('style'); s.id = 'g5-1m-css'; s.textContent = '.g5-edge-r{box-shadow:inset -3px 0 0 #2b2926}'; document.head.appendChild(s); } }
  },
  todo_pass2: ['real-time play (no turns, other players moving at any time)', 'challenges 1-2 (replace an army with knights; capture a piece while it is moving)', 'minimap of the board grid', 'live player cursors'],
  source: { research: 'research/modes/Obcl5GCtNHc.json', confidence: 'medium', notes: 'Turn-based approximation of the real-time site.' }
});
