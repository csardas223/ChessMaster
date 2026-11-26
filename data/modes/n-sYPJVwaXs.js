/* Can I BEAT XXL Chess?  A 16x16 board with five fairy pieces: Chancellor (R+N), Camel (3,1 leaper), General (K+N),
   Archbishop (B+N), Amazon (Q+N). Sources: research/modes/n-sYPJVwaXs.json, frames visual (~16x16, legend panel of
   compound pieces), rules.jsonl (no castling; pawns promote after crossing the middle of the board). Exact lineup is
   too small to read in the frames: the back rank below is our arrangement of the five fairy pieces plus the normal army. */
CM.mode({
  id: 'n-sYPJVwaXs',
  name: 'XXL Chess',
  category: 'Variants & Games',
  description: 'A huge 16x16 board. Besides the normal army you get Chancellors (rook + knight), Camels (leap 3 and 1), a General (king + knight), Archbishops (bishop + knight) and an Amazon (queen + knight). No castling; pawns promote once they cross into the enemy half.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  opponent: { name: 'TheSpartain1', rating: 1500, avatar: null, tagline: 'Online XXL opponent, 5-minute game.' },
  board: { files: 16, ranks: 16, light: '#ecf2cf', dark: '#7b9d59' },
  pieces: {
    C: { name: 'Chancellor', moves: 'RN', value: 850, glyph: null, img: { w: 'assets/modes/n-sYPJVwaXs/chancellor_w.png', b: 'assets/modes/n-sYPJVwaXs/chancellor_b.png' } },
    I: { name: 'Camel', moves: 'C', value: 250, glyph: 'N', badge: null, img: { w: 'assets/modes/n-sYPJVwaXs/camel_w.png', b: 'assets/modes/n-sYPJVwaXs/camel_b.png' } },
    G: { name: 'General', moves: 'KN', value: 560, glyph: null, img: { w: 'assets/modes/n-sYPJVwaXs/general_w.png', b: 'assets/modes/n-sYPJVwaXs/general_b.png' } },
    A: { name: 'Archbishop', moves: 'BN', value: 750, glyph: null, img: { w: 'assets/modes/n-sYPJVwaXs/archbishop_w.png', b: 'assets/modes/n-sYPJVwaXs/archbishop_b.png' } },
    M: { name: 'Amazon', moves: 'QN', value: 1250, glyph: null, img: { w: 'assets/modes/n-sYPJVwaXs/amazon_w.png', b: 'assets/modes/n-sYPJVwaXs/amazon_b.png' } }
  },
  setup: { fen: 'rincbaqkmgabcnir/pppppppppppppppp/16/16/16/16/16/16/16/16/16/16/16/16/PPPPPPPPPPPPPPPP/RINCBAQKMGABCNIR' },
  rules: { castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'], zone: 8 } },
  clock: { w: 300, b: 300, inc: 0 },
  bot: { engine: 'search', elo: 1500, depth: 2, time_ms: 900 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/n-sYPJVwaXs/fairy_legend.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/n-sYPJVwaXs.json', confidence: 'medium', notes: 'Board size estimated 16x16 from frames; back-rank order is ours.' }
});
