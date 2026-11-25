/* Can I CONQUER Chess... with Gravity?  Despite the title this is the final part of the Chessformer puzzle-platformer series (levels 37-48 of 48): blue pieces, static red king, green terrain, purple locks, buttons, keys and promotion squares. Pieces move with normal chess moves; after every move each piece falls straight down until
   it lands on terrain or another piece (stacking pieces into towers is the main trick). Capture the static red king to
   clear a level. Purple lock blocks vanish when a piece captures the key. Sources: research/modes/p6W3yDU-v88.json, frames, transcript level notes (L38 tower, L41 locked knight, L45 bishop staircase, L48 key).
   PASS 1: original hand-made levels (the video's layouts are not recoverable from stills), walls = terrain,
   js/modes/g6_levels.js (passColor: the red king never moves; unlock: key -> locks). Levels checked solvable with a
   breadth-first search over the engine. */
CM.mode({
  id: 'p6W3yDU-v88',
  title: 'Can I CONQUER Chess... with Gravity?',
  name: 'Chessformer: Final Levels',
  category: 'Variants & Games',
  description: 'Puzzle levels where chess pieces have gravity. Move your pieces like normal chess pieces, then they fall straight down until they land on a platform or another piece. Stack pieces to climb, and capture the key to remove the purple locks. A bishop can change square colour by falling.',
  how_to_win: 'Capture the red king in every level.',
  player_side: 'white',
  opponent: { name: 'Red King', rating: null, avatar: 'assets/modes/p6W3yDU-v88/red_king.png', tagline: 'The static red king waiting at the end of each level.' },
  board: { files: 8, ranks: 8, light: '#c4a06e', dark: '#a98549' /* art-g6: sampled from the video frames */ },
  pieces: {
    Ky: { name: 'Key', moves: '', value: 0, img: 'assets/modes/p6W3yDU-v88/key.png' },
    Lk: { name: 'Lock block', moves: '', value: 0, blocker: true, overlay: null, cls: 'g6-lock', img: 'assets/modes/p6W3yDU-v88/lock_tile.png' },
    /* art-g6: the video's own art (tools/g6_art_pass2.py): blue player set from the title screen, the static red king, single green platform block */
    '#': { overlay: null, img: 'assets/modes/p6W3yDU-v88/green_block.png' },
    P: { img: { w: 'assets/modes/p6W3yDU-v88/blue_p.png', b: 'assets/pieces/cburnett/bP.svg' } },
    N: { img: { w: 'assets/modes/p6W3yDU-v88/blue_n.png', b: 'assets/pieces/cburnett/bN.svg' } },
    B: { img: { w: 'assets/modes/p6W3yDU-v88/blue_b.png', b: 'assets/pieces/cburnett/bB.svg' } },
    R: { img: { w: 'assets/modes/p6W3yDU-v88/blue_r.png', b: 'assets/pieces/cburnett/bR.svg' } },
    Q: { img: { w: 'assets/modes/p6W3yDU-v88/blue_q.png', b: 'assets/pieces/cburnett/bQ.svg' } },
    K: { img: { w: 'assets/modes/p6W3yDU-v88/blue_k.png', b: 'assets/modes/p6W3yDU-v88/red_king.png' } }
  },
  setup: { fen: '8/8/8/8/7k/7*/N1R5/********' },
  rules: { check: 'none', castling: false, enPassant: false, gravity: { dir: 'down', exempt: ['Ky', 'Lk'] }, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  params: { passColor: 'b', run: 'Level', unlock: { key: 'Ky', lock: 'Lk' }, levels: [{"name": "Level 37: climb", "fen": "8/8/8/8/7k/7*/N1R5/********", "hint": "Make a step out of one piece for the other"}, {"name": "Level 38: the tower", "fen": "7k/7*/8/8/8/8/PK1NB3/********", "hint": "Build a tower to reach the ledge"}, {"name": "Level 41: locked knight", "fen": "8/8/k7/*1[n:Lk]5/1[n:Ky]6/1*6/2N1R3/********", "hint": "Grab the key first"}, {"name": "Level 45: staircase", "fen": "8/k7/**6/8/8/8/4BBK1/********", "hint": "Bishops make a diagonal staircase"}, {"name": "Level 48: everything", "fen": "k7/*7/8/3[n:Lk]4/3*4/8/K1NB[n:Ky]R2/********", "hint": "Key, then climb"}] },
  bot: { engine: 'random' },
  hooks: 'g6_levels',
  todo_pass2: ["real level layouts 37-48 (re-check frames)", "buttons that toggle purple blocks while a piece stands on them", "piece-choice slots (level 39)", "promotion squares", "falling animation"],
  source: { research: 'research/modes/p6W3yDU-v88.json', confidence: 'high', notes: 'Rules from transcript; level layouts are original placeholders named after the video levels.' }
});
