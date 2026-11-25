/* Can I BEAT Petrified Pawns?  A real-time dungeon RPG with chess-piece units: escort your King to the end of each level
   past black chess-piece monsters (pawns, knights, bishops, rooks, a queen); units attack with their chess pattern and
   have health bars, mana from boxes buys heals. Sources: research/modes/sGXmiyvZDE4.json, frames (dungeon #e8d050 /
   #3a3d4a). PASS 1: a turn-based dungeon corridor (8 files x 14 ranks, walls), no check, your King must reach the far
   rank; losing the King loses. HP, mana and spells are pass 2. */
CM.mode({
  id: 'sGXmiyvZDE4',
  title: 'Can I BEAT Petrified Pawns?',
  name: 'Petrified Pawns',
  category: 'Variants & Games',
  description: 'Escort your King through the dungeon. Your rook, knight and pawns clear the way; black monster pieces guard the corridors and take whatever stands in their pattern. There is no check, so keep the King out of reach.',
  how_to_win: 'Bring your King to the far end of the dungeon.',
  player_side: 'white',
  opponent: { name: 'Dungeon monsters', rating: null, avatar: 'assets/avatars/bot.svg', tagline: 'Black chess-piece monsters with red health bars.' },
  board: { files: 8, ranks: 14, light: '#8a8a6a', dark: '#3a3d4a', background: '#16161c', viewport: { files: 8, ranks: 10, follow: 'player_king' } },
  setup: { fen: '8/1*4*1/2n2b2/1**2**1/8/p6p/**1**1**/3r4/8/1*1pp1*1/8/**1**1**/1PPPPPP1/2RNKN2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, win: [{ type: 'reach', piece: 'K', color: 'w', squares: 'last_rank', why: 'the King escaped the dungeon' }] },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  todo_pass2: ['real-time movement (left click select, right click move)', 'HP bars (rook 300, queen 2000), damage by standing in an enemy pattern', 'boxes and vases with mana, Lesser Heal / chain heal spells, potions', 'more missions / levels', 'dungeon tileset and unit art (original)'],
  source: { research: 'research/modes/sGXmiyvZDE4.json', confidence: 'medium', notes: 'Turn-based approximation; dungeon layout invented.' }
});
