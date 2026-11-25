/* Can I BEAT Who Takes the Crown?  ("Who Wears the Crown?") A pawn climbs a tower of chessboards; the unlocked boards
   are chess positions against Stockfish 1300 and checkmating one grants a Super Jump to the board above, up to the
   crown. Sources: research/modes/UzoZVdmGpyc.json (Stockfish ~1300, checkmate -> Super Jump, checkpoints, tutorial
   36:39), frames (red/burgundy boards #ba4e36/#8a1e12). PASS 1: the climb is a sequence of boards (g5_levels): mate
   Stockfish 1300 on each to jump to the next; the platformer itself is not built. Pass 2 (impl-5, 7th session): boards
   2-3 are transcribed square by square from the video's own stills (i.ytimg.com/vi/UzoZVdmGpyc/maxres2.jpg lower-left
   board, maxres3.jpg upper board); a piece half cut off at the frame edge (a1) is left out. */
CM.mode({
  id: 'UzoZVdmGpyc',
  title: 'Can I BEAT Who Takes the Crown?',
  name: 'Who Takes the Crown?',
  category: 'Variants & Games',
  description: 'Climb the tower of chessboards. Each board is a position against Stockfish (1300): deliver checkmate to earn the Super Jump to the next board. Reach the top board and take the crown.',
  how_to_win: 'Checkmate Stockfish on every board of the tower.',
  player_side: 'white',
  opponent: { name: 'Stockfish', rating: 1300, avatar: 'assets/avatars/stockfish.svg', tagline: 'Level 1300 Stockfish guarding each board.' },
  board: { files: 8, ranks: 8, light: '#ba4e36', dark: '#8a1e12' },
  params: {
    levels: [
      { name: 'Board 1 (tutorial)', fen: 'rnb1kbnr/pppp1ppp/8/4p1q1/3P4/8/PPP1PPPP/RNBQKBNR' },
      { name: 'Board 2 (video, maxres2)', fen: '2n5/pp1r3p/8/6P1/5P2/2PP4/1k3K2/4rR2' },
      { name: 'Board 3 (video, maxres3)', fen: 'r1bk4/5qpp/8/P7/1BN1b3/1Pn5/7R/4K3' }
    ]
  },
  bot: { engine: 'auto', elo: 1320 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/UzoZVdmGpyc/crowned_pawn.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_levels',
  _deferred: ['platformer climb between boards (needs a frame: game module: jump / charged jump / fall, checkpoints, R respawn, Super Jump through pawn rows, speedrun timer)', 'the other boards of the tower (only two are legible in the published stills)'],
  source: { research: 'research/modes/UzoZVdmGpyc.json', confidence: 'medium', notes: 'Tutorial opening from the transcript (1.d4 ... Qg5); boards 2-3 from the video stills (side to move inferred: White).' }
});
