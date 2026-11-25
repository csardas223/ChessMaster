/* Can I BEAT King of the Bridge? (Bullet Ending)  King of the Bridge: a pixel-art chess game against the cheating Troll, who guards the bridge with a rule
   book of strange numbered rules. The Bullet Ending: beat the Troll on a very short clock (time limit not stated; 1 minute here). Sources: research/modes/puKYAUl9x9s.json, base rules research/modes/WEYUcaJTBso.json,
   frames (dark green pixel swamp, #8a8b72/#4f5540 board). Shared logic js/modes/g6_bridge.js. PASS 1: the rule book is a
   toast per unlocked rule, the Troll cheats at random after his moves; the accusation mode (Space) is pass 2. */
CM.mode({
  id: 'puKYAUl9x9s',
  title: 'Can I BEAT King of the Bridge? (Bullet Ending)',
  name: 'King of the Bridge: Bullet',
  category: 'Variants & Games',
  description: 'Chess by the Troll\'s rules: pawns step one square forward, sideways or back and capture straight ahead; the Horse guy may also trot one square; the Queen may never take a king; there is no check, and when the Troll\'s king falls the crown passes to his strongest piece. Watch the Troll: he cheats.',
  how_to_win: 'Beat the Troll before your one-minute clock runs out.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/hv_NHWqysZE/troll.png', tagline: 'Guardian of the bridge. He cheats.' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#2e3b31', background: '#16220f' },
  pieces: {
    B: { name: 'Bishop', moves: 'B', value: 330, img: { w: 'assets/modes/WEYUcaJTBso/pixel/wB.svg', b: 'assets/modes/WEYUcaJTBso/pixel/bB.svg' } /* same game's pixel pieces cut from video stills by group 5 */ },
    R: { name: 'Castle', moves: 'R', value: 500, img: { w: 'assets/modes/WEYUcaJTBso/pixel/wR.svg', b: 'assets/modes/WEYUcaJTBso/pixel/bR.svg' } /* same game's pixel pieces cut from video stills by group 5 */ },
    Q: { name: 'Queen', moves: 'Q', value: 900, img: { w: 'assets/modes/WEYUcaJTBso/pixel/wQ.svg', b: 'assets/modes/WEYUcaJTBso/pixel/bQ.svg' } /* same game's pixel pieces cut from video stills by group 5 */ },
    P: { name: 'Small-minded one', moves: 'mWfcW', value: 100, pawn: true, promote: true, enPassant: false, san: '', img: { w: 'assets/modes/WEYUcaJTBso/pixel/wP.svg', b: 'assets/modes/WEYUcaJTBso/pixel/bP.svg' } /* same game's pixel pieces cut from video stills by group 5 */ },
    N: { name: 'Horse guy', moves: 'NW', value: 340, img: { w: 'assets/modes/WEYUcaJTBso/pixel/wN.svg', b: 'assets/modes/WEYUcaJTBso/pixel/bN.svg' } /* same game's pixel pieces cut from video stills by group 5 */ },
    K: { name: 'Crown guy', moves: 'K', value: 2000, royal: true, castle: false, img: { w: 'assets/modes/WEYUcaJTBso/pixel/wK.svg', b: 'assets/modes/WEYUcaJTBso/pixel/bK.svg' } /* same game's pixel pieces cut from video stills by group 5 */ }
  },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  clock: { w: 60, b: 60, inc: 0, bot: false },
  params: { ending: 'bullet', cheat: 0.18 },
  hooks: 'g6_bridge',
  theme: { background: '#16220f url(../assets/modes/hv_NHWqysZE/swamp.jpg) center / cover no-repeat' },
  sounds: { gong: 'assets/modes/hv_NHWqysZE/gong.wav', laugh: 'assets/modes/hv_NHWqysZE/laugh.wav' },
  vfx_timeline: [{ trigger: 'game_start', effect: { type: 'vignette', color: '#0b1206', size: 30, duration_ms: 0, id: 'swamp' } }, { trigger: 'game_start', effect: { type: 'scanlines', duration_ms: 0, id: 'crt' } }],
  _gameplay_todo: ['accusation mode (Space + point at the broken rule): correct = you may cheat once, false = turn forfeited + Troll revenge', 'slippery tiles (piece falls over), queen slip flips the board', 'bishops leaving the board out of town', 'intro riddle cutscene'],
  _pass2_done: '2026-11-24 impl-6 art pass: Troll avatar = video sprite, cobble-swamp backdrop and board colours cropped/sampled from the video frames (maxres1/2); pieces = the King of the Bridge pixel set cut from the video stills (shared from WEYUcaJTBso, tools/g5_frames.py)',
  source: { research: 'research/modes/puKYAUl9x9s.json', confidence: 'medium', notes: 'Clock length inferred.' }
});
