/* Can I MASTER Setup Chess?  chess.com Setup Chess: the board starts empty; both players alternately place pieces on their own first three
   ranks with a 39-point budget (P1 N3 B3 R5 Q9, king free and compulsory, no pawns on the back rank), then play normal
   chess with White moving first. Shared logic: js/modes/g6_setup.js. Sources: research/modes/nFY-Hn6xiOI.json. Video: 39 points spent exactly; spam pawns / spam bishops / triple rooks. */
CM.mode({
  id: 'nFY-Hn6xiOI',
  name: 'Setup Chess',
  category: 'Variants & Games',
  description: 'The board starts empty. Take turns placing pieces anywhere on your first three ranks: you have 39 points to spend (pawn 1, knight 3, bishop 3, rook 5, queen 9) and must also place your king (free). Pawns cannot go on the back rank. When both armies are built, normal chess begins with White to move. In the video you play Black: White places first.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'black',
  opponent: { name: 'DaRealYou', rating: 1700, avatar: null, tagline: 'Online Setup Chess player (~1584-1858).' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7a9e59' },
  setup: { fen: '8/8/8/8/8/8/8/8', turn: 'w', hands: { w: ['K','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','N','N','N','N','N','N','N','N','N','N','N','N','N','B','B','B','B','B','B','B','B','B','B','B','B','B','R','R','R','R','R','R','R','Q','Q','Q','Q'], b: ['K','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','P','N','N','N','N','N','N','N','N','N','N','N','N','N','B','B','B','B','B','B','B','B','B','B','B','B','B','R','R','R','R','R','R','R','Q','Q','Q','Q'] }, x: { bud: { w: 39, b: 39 }, king: { w: 0, b: 0 } } },
  rules: { drops: true, castling: false },
  clock: { w: 300, b: 300, inc: 0 },
  bot: { engine: 'search', elo: 1700, depth: 2, time_ms: 700 },
  hooks: 'g6_setup',
  params: { budget: 39 },
  source: { research: 'research/modes/nFY-Hn6xiOI.json', confidence: 'high', notes: 'Placement order alternates; a side that finishes early stops placing. Castling off (inferred).' }
});
