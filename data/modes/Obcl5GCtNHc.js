/* Can I BEAT 1 Million Chessboards?  A grid of a million boards where anyone moves at any time; pieces may cross onto
   neighbouring boards but cannot capture across a board edge. Final challenge vs the developer Nolan: two boards side
   by side, first to capture both enemy kings wins. Sources: research/modes/Obcl5GCtNHc.json (0:53-1:25 no captures
   across boards, 8:05-8:15 two-board king race), frames/thumbnail (#eeeed2/#769656). The two-board
   challenge in real time (js/modes/g5_realtime.js: no turns, Nolan moves on his own clock), no check: kings are captured. */
CM.mode({
  id: 'Obcl5GCtNHc',
  title: 'Can I BEAT 1 Million Chessboards?',
  name: '1 Million Chessboards (2 boards)',
  category: 'Variants & Games',
  description: 'Two standard boards side by side, each with a full game. Pieces may move from one board onto the other, but a capture is only allowed when both squares are on the same board. There is no check: kings can simply be taken. There are no turns either: move whenever you like while Nolan does the same.',
  how_to_win: 'Capture both enemy kings first.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Nolan', rating: null, tagline: 'Developer of 1 Million Chessboards.' },
  board: { files: 16, ranks: 8, light: '#eeeed2', dark: '#769656' },
  pieces: { K: { name: 'King', moves: 'K', value: 2000, royal: false, castle: false } },
  setup: { fen: 'rnbqkbnrrnbqkbnr/pppppppppppppppp/16/16/16/16/PPPPPPPPPPPPPPPP/RNBQKBNRRNBQKBNR' },
  rules: { check: 'none', castling: false, win: [{ type: 'capture', piece: 'K', why: 'both kings were captured' }] },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Obcl5GCtNHc/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  params: { rtMode: '1m', rt: { bot_ms: [1100, 2400] } },
  hooks: 'g5_realtime',   /* real time: no turns (js/modes/g5_realtime.js); no capture across the board edge */
  source: { research: 'research/modes/Obcl5GCtNHc.json', confidence: 'medium', notes: 'Real time: Nolan moves every 1.1-2.4 s, you move whenever you like. Only the final two-board challenge is played; challenges 1-2 (knight army, capture a piece mid-move), the minimap and the live cursors of the million-board site are not reproduced (a 1000x1000 grid of boards is beyond the 32x32 engine; pieces move square to square, so nothing can be caught mid-move).' }
});
