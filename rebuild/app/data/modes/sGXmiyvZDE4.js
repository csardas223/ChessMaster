/* Can I BEAT Petrified Pawns?  A real-time dungeon RPG with chess-piece units: escort your King to the end of each level
   past black chess-piece monsters (pawns, knights, bishops, rooks, a queen); units attack with their chess pattern and
   have health bars, mana from boxes buys heals. Sources: research/modes/sGXmiyvZDE4.json, frames (dungeon #e8d050 /
   #3a3d4a). PASS 1: a turn-based dungeon corridor (8 files x 14 ranks, walls), no check, your King must reach the far
   rank; losing the King loses. HP, mana and spells are pass 2.
   art-g6b (2026-11-25): video art from paused 1080p frames 0:21 / 3:12 / 7:51 (research/frames/video_thumbs/sGXmiyvZDE4_frame_*,
   tools/g6b_pp_art.py): in the video you command the DARK pieces (green health bars) and the monsters are the PALE pieces (red
   bars), so w = the dark King/Rook/Knight cut-outs, b = the pale pawn/knight/bishop/rook/queen; the floor squares are two of the
   video's stone floor tiles warped top-down and walls are its stone-brick wall. Inferred: your Pawn and promotion Queen/Bishop
   (no frame shows a dark one) are the pale cuts re-shaded dark. */
CM.mode({
  id: 'sGXmiyvZDE4',
  title: 'Can I BEAT Petrified Pawns?',
  name: 'Petrified Pawns',
  category: 'Variants & Games',
  description: 'Escort your King through the dungeon. Your rook, knight and pawns clear the way; pale monster pieces guard the corridors and take whatever stands in their pattern. There is no check, so keep the King out of reach.',
  how_to_win: 'Bring your King to the far end of the dungeon.',
  player_side: 'white',
  opponent: { name: 'Dungeon monsters', rating: null, avatar: 'assets/modes/sGXmiyvZDE4/bN.png', tagline: 'Pale chess-piece monsters with red health bars.' },
  board: { files: 8, ranks: 14, light: '#8a8a6a', dark: '#3a3d4a', background: '#16161c', viewport: { files: 8, ranks: 10, follow: 'player_king' }, texture: { light: '../assets/modes/sGXmiyvZDE4/floor_light.jpg', dark: '../assets/modes/sGXmiyvZDE4/floor_dark.jpg' } },
  pieces: {
    '#': { overlay: null, img: 'assets/modes/sGXmiyvZDE4/wall.jpg' },
    K: { img: { w: 'assets/modes/sGXmiyvZDE4/wK.png' } },
    Q: { img: { w: 'assets/modes/sGXmiyvZDE4/wQ.png', b: 'assets/modes/sGXmiyvZDE4/bQ.png' } },
    R: { img: { w: 'assets/modes/sGXmiyvZDE4/wR.png', b: 'assets/modes/sGXmiyvZDE4/bR.png' } },
    B: { img: { w: 'assets/modes/sGXmiyvZDE4/wB.png', b: 'assets/modes/sGXmiyvZDE4/bB.png' } },
    N: { img: { w: 'assets/modes/sGXmiyvZDE4/wN.png', b: 'assets/modes/sGXmiyvZDE4/bN.png' } },
    P: { img: { w: 'assets/modes/sGXmiyvZDE4/wP.png', b: 'assets/modes/sGXmiyvZDE4/bP.png' } }
  },
  setup: { fen: '8/1*4*1/2n2b2/1**2**1/8/p6p/**1**1**/3r4/8/1*1pp1*1/8/**1**1**/1PPPPPP1/2RNKN2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, win: [{ type: 'reach', piece: 'K', color: 'w', squares: 'last_rank', why: 'the King escaped the dungeon' }] },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  todo_pass2: ['real-time movement (left click select, right click move)', 'HP bars (rook 300, queen 2000), damage by standing in an enemy pattern', 'boxes and vases with mana, Lesser Heal / chain heal spells, potions', 'more missions / levels'],
  source: { research: 'research/modes/sGXmiyvZDE4.json', confidence: 'medium', notes: 'Turn-based approximation; dungeon layout invented. Art from the video frames (0:21, 3:12, 7:51); dark pawn / promotion queen + bishop re-shaded from the pale cuts (inferred).' }
});
