/* Can I BEAT 10,000 Player Chess?  An .io-style massively multiplayer chess board (compared to Slither.io /
   Agar.io): a huge shared checkerboard where every player owns a handful of pieces and hunts the others; a
   'Captured' counter tracks kills and losing your king is 'Game Over!'. Sources: research/modes/TsA-ro0GZ0I.json,
   frames visual (#eaead2/#72a24e, scattered pieces of many colours, Captured: 3/9/17). Played in real time on a 32x32
   board (engine max; video ~48 wide); the other players are one bot side whose squads spawn in as new players join. */
CM.mode({
  id: 'TsA-ro0GZ0I',
  title: 'Can I BEAT 10,000 Player Chess?',
  name: '10,000 Player Chess',
  category: 'Variants & Games',
  description: 'A giant shared board full of other players, each with a few pieces. You start with a small squad around your king. Every capture adds to your Captured counter; new players keep joining the board. Your king follows normal check rules; the other players have no king.',
  how_to_win: 'Reach 20 captures before your king is checkmated.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: '10,000 players', rating: null, tagline: 'Everyone else on the board (io-style).' },
  board: { files: 32, ranks: 32, light: '#eaead2', dark: '#72a24e', viewport: { files: 14, ranks: 14, mobile: { files: 10, ranks: 10 }, follow: 'player_king' } },
  setup: {
    fen: '32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/14PPP15/14NKB15/15R16/32/32/32/32/32/32/32/32/32/32/32/32/32/32',
    /* QA: the random horde used to be able to box White in completely (no legal move on move 1); keep a two-row
       buffer around the starting cluster (rows 15-17) so White always has somewhere to go */
    place: [
      { type: 'P', color: 'b', at: 'random_empty', count: 34, rows: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,19,20,21,22,23,24,25,26,27,28,29,30,31] },
      { type: 'N', color: 'b', at: 'random_empty', count: 14, rows: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,19,20,21,22,23,24,25,26,27,28,29,30,31] },
      { type: 'B', color: 'b', at: 'random_empty', count: 12, rows: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,19,20,21,22,23,24,25,26,27,28,29,30,31] },
      { type: 'R', color: 'b', at: 'random_empty', count: 8, rows: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,19,20,21,22,23,24,25,26,27,28,29,30,31] },
      { type: 'Q', color: 'b', at: 'random_empty', count: 3, rows: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,19,20,21,22,23,24,25,26,27,28,29,30,31] }
    ]
  },
  rules: {
    check: { w: 'standard', b: 'none' }, castling: false, enPassant: false,
    promotion: { choices: ['Q', 'N', 'R', 'B'] },
    drawPlies: 400,
    win: [{ type: 'points', target: 20, values: { P: 1, N: 1, B: 1, R: 1, Q: 1, K: 1 } }, { type: 'checkmate' }]
  },
  bot: { engine: 'search', depth: 2, time_ms: 450, min_ms: 300 },
  events: [
    { when: 'every_plies:8', do: [{ spawn: { type: 'N', color: 'b', at: 'random_empty', count: 1 } }, { spawn: { type: 'P', color: 'b', at: 'random_empty', count: 2 } }] }
  ],
  messages: { loss_title: 'Game Over!', loss: 'You were checkmated.' },   /* the site's 'Game Over! You were ...' banner */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/TsA-ro0GZ0I/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  params: { rtMode: '10k', rt: { bot_ms: [900, 1900] } },
  hooks: 'g5_realtime',   /* real time: the other players move on their own (js/modes/g5_realtime.js) */
  source: { research: 'research/modes/TsA-ro0GZ0I.json', confidence: 'medium', notes: 'No transcript rules; win target (20 captures) chosen from the Captured counter in frames. Real time (the others move every 0.9-1.9 s, js/modes/g5_realtime.js) and one colour per joining squad (red/purple/blue/green/yellow tints of the standard set, as in the frames). Not reproduced: the minimap (the board is only 32x32 here, the viewport follows your king) and the real ~48-wide board (engine max 32).' }
});
