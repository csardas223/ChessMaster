/* Can I BEAT Gambonanza?  Chess roguelike on a small board: a piece wheel gives the starting army (Tony: two kings and a
   rook), then five escalating fights (2 pawns, 5 pawns, ...) ending with a boss (a Judit Polgar pun). Money from wins
   and captures buys gambits, tokens and pieces between fights; special tiles: holes/gaps, tiles that fall.
   Sources: research/modes/qqvbb2r2k5I.json (LOW confidence: exact rules unclear), frames (#ffffff/#7e4e8a).
   PASS 1: a 6x6 board, five fixed fights via js/modes/g6_levels.js; your kings are ordinary pieces (several kings,
   no check) and a fight is won by capturing every enemy piece; walls stand in for holes. */
CM.mode({
  id: 'qqvbb2r2k5I',
  title: 'Can I BEAT Gambonanza?',
  name: 'Gambonanza',
  category: 'Variants & Games',
  description: 'A run of five fights on a small 6x6 board. Your army came from a spin of the piece wheel: two kings and a rook. Kings are ordinary pieces here, there is no check, and the dark squares with walls are holes nothing can cross. Capture every enemy piece to win a fight; lose all of yours and the run ends.',
  how_to_win: 'Win all five fights, boss included.',
  player_side: 'white',
  opponent: { name: 'Gambonanza AI', rating: null, avatar: 'assets/modes/qqvbb2r2k5I/deep_blu.png', tagline: 'Five fights, then the boss.' },
  board: { files: 6, ranks: 6, light: '#ffffff', dark: '#7e4e8a' },
  pieces: { U: { name: 'King', moves: 'K', value: 350, glyph: 'K' } },
  setup: { fen: '6/1pp3/6/6/6/1[U]R[U]2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, win: [{ type: 'eliminate', why: 'every piece was captured' }] },
  params: {
    run: 'Fight', money: true,
    levels: [
      { name: 'Fight 1: two pawns', fen: '6/1pp3/6/6/6/1[U]R[U]2', reward: 5 },
      { name: 'Fight 2: five pawns', fen: '6/ppppp1/6/6/6/1[U]R[U]2', reward: 6 },
      { name: 'Fight 3: knights', fen: '1n2n1/2pp2/6/2*3/6/1[U]R[U]2', hint: 'The wall square is a hole', reward: 7 },
      { name: 'Fight 4: bishops and rook', fen: 'rb2b1/2pp2/6/3*2/6/1[U]RQ[U]1', hint: 'You bought a queen ($10)', reward: 8 },
      { name: 'Boss: Judit Pawlgar', fen: 'qr2rk/pppppp/6/2*3/6/1[U]RQ[U]1', hint: 'The boss fields a full back row', reward: 12, opponent: { name: 'Judit Pawlgar (boss)', rating: 1200, tagline: 'The run-ending boss.' } }
    ]
  },
  bot: { engine: 'search', depth: 3, time_ms: 450 },
  hooks: 'g6_levels',
  todo_pass2: ['CONFIRM RULES (low confidence): win/loss condition, falling tiles', 'piece wheel spin at run start', 'shop: gambits (Church, Will-o-the-Wisp), tokens, re-rolls', 'placement phase before each fight', 'falling tiles and phantom tiles', 'boss card art'],
  source: { research: 'research/modes/qqvbb2r2k5I.json', confidence: 'low', notes: 'Fights 3-5 and the boss army invented; boss name is a placeholder pun.' }
});
