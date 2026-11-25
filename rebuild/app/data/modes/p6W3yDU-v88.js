/* Can I CONQUER Chess... with Gravity?  Despite the title this is the final part of the Chessformer puzzle-platformer series (levels 37-48 of 48): blue pieces, static red king, green terrain, purple locks, buttons, keys and promotion squares. Pieces move with normal chess moves; after every move each piece falls straight down until
   it lands on terrain or another piece (stacking pieces into towers is the main trick). Capture the static red king to
   clear a level. Purple lock blocks vanish when a piece captures the key. Sources: research/modes/p6W3yDU-v88.json, frames, transcript level notes (L38 tower, L41 locked knight, L45 bishop staircase, L48 key).
   impl-6a pass 2 (2026-11-25): falling animation, level-intro dissolve and the g6_levels Chessformer layer (purple buttons +
   blocks, thin ledges, '?' piece-choice picker; art: tools/g6a_chessformer.py) are wired; no verified real layout uses the
   buttons / ledges / choice yet (see todo_pass2), the 8x8 placeholders stay.
   art-g6b (2026-11-25): Level 39 in play (research/frames/video_thumbs/p6W3yDU-v88_frame_149, 2:29) shows no black void cells: the
   black squares in the stills are only the level-intro wipe, drawn by g6_levels dissolve() to match.
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
    Pb: { name: 'Purple block', moves: '', value: 0, blocker: true, overlay: null, img: 'assets/modes/p6W3yDU-v88/purple_block.png' },
    Ch: { name: 'Choice slot', moves: '', value: 0, img: { w: 'assets/modes/p6W3yDU-v88/choice.png' } },  /* impl-6a: the '?' slot (tools/g6a_chessformer.py) */
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
  params: { passColor: 'b', run: 'Level', unlock: { key: 'Ky', lock: 'Lk' }, buttons: { block: 'Pb', img: 'assets/modes/p6W3yDU-v88/button.png' }, choicePiece: 'Ch', fallAnim: true, dissolve: true, levels: [{"name": "Level 37: climb", "fen": "8/8/8/8/7k/7*/N1R5/********", "hint": "Make a step out of one piece for the other"}, {"name": "Level 38: the tower", "fen": "7k/7*/8/8/8/8/PK1NB3/********", "hint": "Build a tower to reach the ledge"}, {"name": "Level 41: locked knight", "fen": "8/8/k7/*1[n:Lk]5/1[n:Ky]6/1*6/2N1R3/********", "hint": "Grab the key first"}, {"name": "Level 45: staircase", "fen": "8/k7/**6/8/8/8/4BBK1/********", "hint": "Bishops make a diagonal staircase"}, {"name": "Level 48: everything", "fen": "k7/*7/8/3[n:Lk]4/3*4/8/K1NB[n:Ky]R2/********", "hint": "Key, then climb"}] },
  bot: { engine: 'random' },
  hooks: 'g6_levels',
  todo_pass2: ["real level layouts 37-48: only Level 39 is fully visible in a repo still (maxres3; 16 x 11, transcribed in tools/g6a_cf_levels.py) and it is unsolvable under our rules (pipes solid, thin ledges one-way: BFS finds no line for any R/B/N/P choice), so the pipe/ledge mechanics need the video; maxres2 (a pawn level) is half covered by the promotion dialog", "promotion squares (pawns use the normal last-rank promotion picker)"],
  source: { research: 'research/modes/p6W3yDU-v88.json', confidence: 'high', notes: 'Rules from transcript; level layouts are original placeholders named after the video levels. NEXT AI (cf agent, 2026-11-25 1:25 PM ET, WIP, stopped on owner order): DONE: 1080p frames of every level now committed in research/frames/video_thumbs (oAoik9Dj2qQ_frame_118 L22, 186 L23, 273 L24, 408 L25, 468 L26, 547 L27, 611 L28, 683 L29, 757 L30, 880 L31, 983 L32, 1031 L33, 1113 L34, 1138 L35, 1231 L36; p6W3yDU-v88_frame_16 L37, 75 L38, 149 L39, 197 L40 (Level-40 wipe text over it), 267 L41, 369 L42, 511 L43, 594 L44, 715 L45, 863 L46, 973 L47; frame_1087 is NOT a full-screen frame, ignore). Grid = 16 cols x 10 rows + floor, cell 98.25 px from (174,180) on the 1920x1440 frames (tools/g6_cf_classify.py prints a class grid + writes a numbered overlay). Transcribed: L21, L27, L37-L42, L45, L47 in tools/g6_cf_levels.py (all re-checked against the new frames: 0 diff rows) and L22-L26, L28-L36 in tools/g6_cf_new_levels.py. Ledge convention: a thin bar drawn at the TOP of cell (c,r) = ledges entry (c, r-1). BFS (tools/g6_cf_solve_new.py L22 ...): solvable under current rules L22 L23 L24 L28 L29 L30 L31 L32 (+ L21 L27 L37 L40 L47 earlier); NOT solvable: L25, L26 (L33-L36 not run yet). FINDING: the transcripts say \'drop onto the king\' / \'drop on the king\'s head\' (L25, L26, L45): a piece that FALLS onto the red king captures it. Add that to tools/g6_cf_levels.py Level.settle (blue piece falling >=1 square with \'k\' directly below = win) and to js/modes/g6_levels.js fallLedges (white piece falling onto a black royal replaces it), then re-run BFS: L25/L26 should solve (tools/g6_cf_reach.py L25 shows a bishop reaches (13,5) above the king). LEFT: (1) fall-capture rule as above; (2) loop the button toggle + regrav in g6_levels onMake until stable (solver does); (3) Chessformer pawns: every pawn may double-step once (p6 L42 transcript) - g6_levels marks pawns off their 2nd rank as moved, add a param to skip that; (4) transcribe L43 (frame_511: 5x4 rook block + knight in cols 5-9, king in a pipe ring at (11,2)), L44 (frame_594), L46 (frame_863), L48 (capture p6 18:06, chapter \'Level 48 Platform\'); (5) wire levels: board 16 x 11, rules.gravity null + params.gravity {dir:\'down\',exempt:[\'Ky\',\'Lk\',\'Pb\']} + params.ledges true, levels from `python3 tools/g6_cf_levels.py --json` (extend it to include NEW), choice [\'R\',\'B\',\'N\',\'K\',\'P\'] (no queen), button tile \'o\' -> tiles {sq:\'button\'}; (6) remove todo_pass2 items, QA qa_all.py --ids oAoik9Dj2qQ,p6W3yDU-v88 --redo --par 1 at 390/360.' }
});
