/* Can I MASTER King of the Hill Chess?  chess.com King of the Hill: normal chess, plus you win instantly by moving your king onto d4, e4, d5 or e5 (the
   move must be legal). Sources: research/modes/y4jUrlwAPlA.json (centre squares outlined, online opponents). */
CM.mode({
  id: 'y4jUrlwAPlA',
  name: 'King of the Hill',
  category: 'Variants & Games',
  description: 'Normal chess with a hill in the middle: the four centre squares d4, e4, d5 and e5. Walk your king onto any of them (legally, not into check) and you win on the spot.',
  how_to_win: 'Reach the hill with your king, or checkmate.',
  player_side: 'white',
  opponent: { name: 'Spencsheep', rating: 1600, avatar: null, tagline: 'Online King of the Hill player.' },
  board: { files: 8, ranks: 8, light: '#ECF2D1', dark: '#7B9F59', squares: { d4: { image: 'assets/modes/y4jUrlwAPlA/hill.png', opacity: 0.85 }, e4: { image: 'assets/modes/y4jUrlwAPlA/hill.png', opacity: 0.85 }, d5: { image: 'assets/modes/y4jUrlwAPlA/hill.png', opacity: 0.85 }, e5: { image: 'assets/modes/y4jUrlwAPlA/hill.png', opacity: 0.85 } }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { win: [{ type: 'checkmate' }, { type: 'reach', squares: 'd4 e4 d5 e5', piece: 'K', why: 'king reached the hill' }] },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1600, depth: 4, time_ms: 700 },
  source: { research: 'research/modes/y4jUrlwAPlA.json', confidence: 'high', notes: 'blurry-b 2026-11-26: hill.png re-traced to clean vector shapes (palette-quantised, potrace, re-rendered as a 512px transparent PNG at ~90%, hard anti-aliased edges, no fading; tool rebuild/app/tools/sprite_vec.py) from the existing video crop, because no copy of the same image was found online.' }
});
