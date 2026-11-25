/* Can I MASTER Chessformer?  Second Chessformer video (puzzle-platformer by Robert Alvarez), levels 21-35 on a ~16x10 side-view grid with green pipe walls, black void squares, keys and buttons. Pieces move with normal chess moves; after every move each piece falls straight down until
   it lands on terrain or another piece (stacking pieces into towers is the main trick). Capture the static red king to
   clear a level. Purple lock blocks vanish when a piece captures the key. Sources: research/modes/oAoik9Dj2qQ.json, frames (16x10, #c4a16d/#ab864d, keys = yellow tiles).
   impl-6a pass 2 (2026-11-25): the 'black void holes' in the Level 27 / Level 35 stills (maxres2/3) are the level-intro
   wipe (random black squares around the 'Level N' title; the fully shown levels in p6W3yDU-v88's stills have none), so they
   are a dissolve VFX (params.dissolve), not holes; falling animation (params.fallAnim).
   art-g6b (2026-11-25): confirmed from in-play frames (research/frames/video_thumbs/oAoik9Dj2qQ_frame_29 = Level 21, _frame_547 =
   Level 27, p6W3yDU-v88_frame_149 = Level 39): no black cells during play; the black squares exist only in the level-intro wipe,
   which g6_levels dissolve() now draws like the stills (whole black cells vanishing at random, white regular "Level N" with a thin black outline).
   PASS 1: original hand-made levels (the video's layouts are not recoverable from stills), walls = terrain,
   js/modes/g6_levels.js (passColor: the red king never moves; unlock: key -> locks). Levels checked solvable with a
   breadth-first search over the engine. */
CM.mode({
  id: 'oAoik9Dj2qQ',
  title: 'Can I MASTER Chessformer?',
  name: 'Chessformer: Levels 21-35',
  category: 'Variants & Games',
  description: 'Puzzle levels where chess pieces have gravity. Move your pieces like normal chess pieces, then they fall straight down until they land on a platform or another piece. Stack pieces to climb, and capture the key to remove the purple locks. A bishop can change square colour by falling.',
  how_to_win: 'Capture the red king in every level.',
  player_side: 'white',
  opponent: { name: 'Red King', rating: null, avatar: 'assets/modes/oAoik9Dj2qQ/red_king_av.png', tagline: 'The static red king waiting at the end of each level.' },
  board: { files: 16, ranks: 10, light: '#c4a16d', dark: '#ab864d' },
  pieces: {
    Ky: { name: 'Key', moves: '', value: 0, img: 'assets/modes/oAoik9Dj2qQ/key.png' },
    Lk: { name: 'Lock block', moves: '', value: 0, blocker: true, overlay: null, cls: 'g6-lock', img: 'assets/modes/oAoik9Dj2qQ/lock_tile.png' },
    /* art-g6: the video's own art (tools/g6_art_pass2.py): blue player set from the title screen, the static red king, single green platform block */
    '#': { overlay: null, img: 'assets/modes/oAoik9Dj2qQ/green_block.png' },
    P: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_p.png', b: 'assets/pieces/cburnett/bP.svg' } },
    N: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_n.png', b: 'assets/pieces/cburnett/bN.svg' } },
    B: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_b.png', b: 'assets/pieces/cburnett/bB.svg' } },
    R: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_r.png', b: 'assets/pieces/cburnett/bR.svg' } },
    Q: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_q.png', b: 'assets/pieces/cburnett/bQ.svg' } },
    K: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_k.png', b: 'assets/modes/oAoik9Dj2qQ/red_king.png' } }
  },
  setup: { fen: '16/16/16/16/16/16/7k8/7*8/N1R13/****************' },
  rules: { check: 'none', castling: false, enPassant: false, gravity: { dir: 'down', exempt: ['Ky', 'Lk'] }, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  params: { passColor: 'b', run: 'Level', unlock: { key: 'Ky', lock: 'Lk' }, fallAnim: true, dissolve: true, levels: [{"name": "Level 21: first step", "fen": "16/16/16/16/16/16/7k8/7*8/N1R13/****************", "hint": "Pieces fall after they move"}, {"name": "Level 24: stack", "fen": "16/16/16/16/k15/***13/16/16/1RNK12/****************", "hint": "Pieces can stand on pieces"}, {"name": "Level 27: high ledge", "fen": "16/16/16/16/16/7k8/7*8/16/N1R13/****************", "hint": "Two steps this time"}, {"name": "Level 35: key and lock", "fen": "16/16/16/16/16/16/4k11/***13/16/1R1N4[n:Ky]3[n:Lk]3", "hint": "The bottom edge is the floor"}] },
  bot: { engine: 'random' },
  hooks: 'g6_levels',
  todo_pass2: ["real level layouts 21-35: Level 21 (frame_29) and Level 27 (frame_547) are now fully visible in committed frames (16x10 + floor; pipes, thin ledges, keys/padlocks) and can be transcribed; others need more frames", "buttons toggling platforms: supported by g6_levels (params.buttons) but no visible layout uses them"],
  source: { research: 'research/modes/oAoik9Dj2qQ.json', confidence: 'high', notes: 'Rules exact; level layouts original placeholders.' }
});
