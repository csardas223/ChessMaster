/* Can I BEAT King of the Bridge? (Ascension Ending)  King of the Bridge: a pixel-art chess game against the cheating Troll, who guards the bridge with a rule
   book of strange numbered rules. The Ascension Ending: promote ("ascend") every one of your eight pawns. Sources: research/modes/ulE3YPZI9Sc.json, base rules research/modes/WEYUcaJTBso.json,
   frames (dark green pixel swamp, #8a8b72/#4f5540 board). Shared logic js/modes/g6_bridge.js. PASS 1: the rule book is a
   toast per unlocked rule, the Troll cheats at random after his moves; the accusation mode (Space) is pass 2. */
CM.mode({
  id: 'ulE3YPZI9Sc',
  title: 'Can I BEAT King of the Bridge? (Ascension Ending)',
  name: 'King of the Bridge: Ascension',
  category: 'Variants & Games',
  description: 'Chess by the Troll\'s rules: pawns step one square forward, sideways or back and capture straight ahead; the Horse guy may also trot one square; the Queen may never take a king; there is no check, and when the Troll\'s king falls the crown passes to his strongest piece. Watch the Troll: he cheats.',
  how_to_win: 'Ascend all eight of your pawns.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/hv_NHWqysZE/troll.png', tagline: 'Guardian of the bridge. He cheats.' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#4f5540', background: '#16220f' },
  pieces: {
    B: { name: 'Bishop', moves: 'B', value: 330, img: { w: 'assets/modes/hv_NHWqysZE/px_B_w.svg', b: 'assets/modes/hv_NHWqysZE/px_B_b.svg' } },
    R: { name: 'Castle', moves: 'R', value: 500, img: { w: 'assets/modes/hv_NHWqysZE/px_R_w.svg', b: 'assets/modes/hv_NHWqysZE/px_R_b.svg' } },
    Q: { name: 'Queen', moves: 'Q', value: 900, img: { w: 'assets/modes/hv_NHWqysZE/px_Q_w.svg', b: 'assets/modes/hv_NHWqysZE/px_Q_b.svg' } },
    P: { name: 'Small-minded one', moves: 'mWfcW', value: 100, pawn: true, promote: true, enPassant: false, san: '', img: { w: 'assets/modes/hv_NHWqysZE/px_P_w.svg', b: 'assets/modes/hv_NHWqysZE/px_P_b.svg' } },
    N: { name: 'Horse guy', moves: 'NW', value: 340, img: { w: 'assets/modes/hv_NHWqysZE/px_N_w.svg', b: 'assets/modes/hv_NHWqysZE/px_N_b.svg' } },
    K: { name: 'Crown guy', moves: 'K', value: 2000, royal: true, castle: false, img: { w: 'assets/modes/hv_NHWqysZE/px_K_w.svg', b: 'assets/modes/hv_NHWqysZE/px_K_b.svg' } }
  },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  params: { ending: 'ascension', cheat: 0.18 },
  hooks: 'g6_bridge',
  theme: { background: '#16220f url(../assets/modes/hv_NHWqysZE/swamp.svg) center / cover no-repeat' },
  sounds: { gong: 'assets/modes/hv_NHWqysZE/gong.wav', laugh: 'assets/modes/hv_NHWqysZE/laugh.wav' },
  vfx_timeline: [{ trigger: 'game_start', effect: { type: 'vignette', color: '#0b1206', size: 30, duration_ms: 0, id: 'swamp' } }, { trigger: 'game_start', effect: { type: 'scanlines', duration_ms: 0, id: 'crt' } }],
  _gameplay_todo: ['accusation mode (Space + point at the broken rule): correct = you may cheat once, false = turn forfeited + Troll revenge', 'slippery tiles (piece falls over), queen slip flips the board', 'bishops leaving the board out of town', 'intro riddle cutscene'],
  _pass2_done: '2026-11-24 impl-6: 1-bit pixel piece set, Troll avatar (video sprite), swamp-bridge backdrop + vignette/scanlines, gong on rule unlock, troll laugh on a cheat (js/modes/g6_bridge.js)',
  source: { research: 'research/modes/ulE3YPZI9Sc.json', confidence: 'medium', notes: 'Ascension counter counts your promotions; capturing the Troll king only moves his crown.' }
});
