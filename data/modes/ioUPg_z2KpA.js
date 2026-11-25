/* GTE... but it's DUCK Chess?  Guess-the-Elo review of subscribers' Duck Chess games (Professor K204's 5-move duck trap,
   ~1700). Playable as Duck Chess against a ~1700 duck player on 1:00 clocks. Sources: research/modes/ioUPg_z2KpA.json,
   frames visual_d (green board, duck, 1:00 clocks). Rules via js/modes/g5_duck.js (read-only reuse). */
CM.mode({
  id: 'ioUPg_z2KpA',
  title: "GTE... but it's DUCK Chess?",
  name: 'Duck Chess: Guess the Elo',
  category: 'Other Videos',
  description: 'Duck Chess like the reviewed subscriber games: after your move, put the duck on another empty square. Use it to cut off long-range defenders, or to block a check on your own king so the opponent has nowhere useful to put it. No check rule: capture the king to win.',
  how_to_win: 'Capture the enemy king before the clock runs out.',
  player_side: 'white',
  opponent: { name: 'Professor K204', rating: 1700, tagline: 'Subscriber game: about 1700 in Duck Chess. Likes a quick duck trap.' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7a9f58' },
  pieces: { '*': { name: 'Duck', img: 'assets/modes/ioUPg_z2KpA/duck.png' }, K: { royal: false } },
  rules: { check: 'none', drops: true, movesPerTurn: { w: 2, b: 2 }, stalemate: 'win', drawPlies: 400, win: [{ type: 'capture', piece: 'K', why: 'the king was captured' }] },
  clock: { w: 60, b: 60, inc: 0, bot: true },
  bot: { engine: 'search', elo: 1700, depth: 3, time_ms: 600 },
  hooks: 'g5_duck',
  source: { research: 'research/modes/ioUPg_z2KpA.json', confidence: 'high', notes: 'The review/guess format is not interactive; the mode plays the variant being reviewed. art-audit-b: duck recut transparent at 256px from https://i.ytimg.com/vi/ioUPg_z2KpA/maxresdefault.jpg (old piece had the pink thumbnail background).' }
});
