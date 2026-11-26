/* Can I MASTER Giveaway Chess?  chess.com Giveaway (antichess): capturing is compulsory (choose among captures), the king is an ordinary piece (no
   check, it can be captured, no castling), pawns may also promote to a king, and you win by losing all your pieces or by
   having no legal move. Sources: research/modes/rBh7IIhTbw4.json (stalemated side wins; promotion to a king seen in xAFkE7-Jp88). */
CM.mode({
  id: 'rBh7IIhTbw4',
  name: 'Giveaway Chess',
  category: 'Variants & Games',
  description: 'Everything is backwards: if you can capture, you must, and the goal is to lose all your pieces. The king is just another piece (no check, it can be captured) and castling is not allowed. Pawns can even promote to a king. If you have no legal move, you win.',
  how_to_win: 'Lose all your pieces, or be stalemated.',
  player_side: 'white',
  opponent: { name: 'La-Douine', rating: 1832, avatar: null, tagline: 'Online Giveaway player.' },
  board: { files: 8, ranks: 8, light: '#ECF2D1', dark: '#7A9F58' },
  pieces: { K: { name: 'King', moves: 'K', value: 300, royal: false, castle: false } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none', castling: false, forcedCapture: true, stalemate: 'win', promotion: { choices: ['Q', 'N', 'R', 'B', 'K'] },
    win: [{ type: 'eliminate', result: 'win' }] },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1832, depth: 4, time_ms: 700 },
  messages: { win: 'you gave everything away' },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/rBh7IIhTbw4/gift.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }, { trigger: 'win', once: true, effect: { type: 'overlay', image: 'assets/modes/rBh7IIhTbw4/wins_card.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 2200, fade_ms: 300 } }],
  source: { research: 'research/modes/rBh7IIhTbw4.json', confidence: 'high', notes: 'blurry-b 2026-11-26: gift.png re-traced to clean vector shapes (palette-quantised, potrace, re-rendered as a 512px transparent PNG at ~90%, hard anti-aliased edges, no fading; tool rebuild/app/tools/sprite_vec.py) from the existing video crop, because no copy of the same image was found online; the purple background fringe from the video was dropped.' }
});
