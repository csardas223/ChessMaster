/* Can I BEAT Who Takes the Crown?  ("Who Wears the Crown?") A Getting-Over-It style platformer: a little pawn climbs a
   tower of chessboards to the royal crown. Game frame js/games/who-crown.js (s5-accuracy, 2026-11-26), replacing the
   pass-1 "mate Stockfish on three boards" stand-in.
   Sources: transcript (analyze_video, 2026-11-26): 0:01 premise, 0:20 Stockfish level 1300, 0:30-0:40 tap / hold Space,
   hold too long = failed jump, 0:47 1.d4 ... Qg5, 1:20 speedrun timer, 2:21 boards without a lock can be moved,
   3:00 take the pawn with check, the king can only go to f8, 3:23 F free cam, 3:40 checkpoint + hold R, 3:58 being in
   check makes you immobile, 4:21 Re1+ skewer after f4, 6:57 Bc3#, 7:11-7:50 super jump (E, hold Space, jumps through
   pieces / the rows of pawns above), 10:28 you can fall off the board, 17:38 the king moved away under you,
   24:25 Nd4+ then mate, 26:20 locked last board, 26:38 crown (36:39). Stills i.ytimg.com/vi/UzoZVdmGpyc/maxres2.jpg
   (board colours, teal last move, dashed leading move, tutorial panels, flag pole) and maxres3.jpg (locked pink board,
   paintings, torches). Crowned pawn + crown cut from the thumbnail (assets/modes/UzoZVdmGpyc/source.notes).
   Inferred: the tower layout and the board positions other than the transcript's moves (each one is built so the
   video's moves play out: d4/Qg5, Rxe6+ Kf8, f4 Re1+ Kf2 Rxe4, Bc3#, Nd4+ Ka4 Ra6#), jump heights and timings. */
CM.mode({
  id: 'UzoZVdmGpyc',
  title: 'Can I BEAT Who Takes the Crown?',
  name: 'Who Takes the Crown?',
  category: 'Variants & Games',
  frame: 'game',
  description: 'Climb a tower of chessboards as a little pawn. The pieces are your platforms. Tap jump for a small jump, hold it for a bigger one, but hold too long and the jump fails. Boards with a lock are scenery; on boards without a lock you move White\'s pieces (tap a piece, then a square) against Stockfish 1300 to build platforms, and the tutorial suggests leading moves (dashed squares). Being in check makes you immobile until you get out of check. Checkmate grants a Super Jump: press E (action), then hold and release jump to fly through pieces, like the rows of pawns above. Fall and you fall all the way. Checkpoints: hold R (reset) to respawn at the last one; the boards above it start over. Drag the view (or press F) for the free cam; moving the pawn brings the camera back.',
  how_to_win: 'Reach the top of the tower and take the crown. The speedrun timer runs the whole way (the video: 36:39).',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Stockfish', rating: 1300, avatar: 'assets/avatars/stockfish.png', tagline: 'Level 1300 Stockfish on every board without a lock.' },
  board: { files: 8, ranks: 8, light: '#ba5134', dark: '#8a1913' },
  theme: { background: '#3b2826' },
  game: { module: 'who-crown', aspect: 1, controls: ['left', 'right', '|', 'jump', 'action', 'reset'] },
  assets: { crown: 'assets/modes/UzoZVdmGpyc/crown.png', crowned_pawn: 'assets/modes/UzoZVdmGpyc/crowned_pawn.png' },
  bot: { engine: 'stockfish', elo: 1320 },
  source: { research: 'research/modes/UzoZVdmGpyc.json', confidence: 'medium', notes: 'Mechanics from the transcript; the tutorial map itself is never shown whole, so the tower (8 boards, 3 checkpoints) is a reconstruction that replays the video\'s moves. Keys: arrows / A D move, Space or W jump (hold to charge), E super jump, R hold to respawn, F free cam (zoomed out) / drag to pan; tap the board to move pieces. Climbability checked by tools/qa_who_crown.mjs.' }
});
