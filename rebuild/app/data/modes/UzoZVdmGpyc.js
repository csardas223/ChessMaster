/* Can I BEAT Who Takes the Crown?  ("Who Wears the Crown?") A pawn climbs a tower of chessboards; the unlocked boards
   are chess positions against Stockfish 1300 and checkmating one grants a Super Jump to the board above, up to the
   crown. Sources: research/modes/UzoZVdmGpyc.json (Stockfish ~1300, checkmate -> Super Jump, checkpoints, tutorial
   36:39), frames (red/burgundy boards #ba4e36/#8a1e12). PASS 1: the climb is a sequence of boards (g5_levels): mate
   Stockfish 1300 on each to jump to the next; the platformer itself is not built. */
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
      { name: 'Board 2', fen: '4k3/8/8/8/8/8/8/3QK3' },
      { name: 'Board 3', fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1' },
      { name: 'The crown', fen: 'r3k2r/ppp2ppp/2n5/3q4/3P4/2N5/PPP2PPP/R2QK2R' }
    ]
  },
  bot: { engine: 'auto', elo: 1320 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/UzoZVdmGpyc/crowned_pawn.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_levels',
  todo_pass2: ['platformer climb between boards (frame: game module: jump / charged jump / fall, checkpoints, R respawn)', 'Super Jump through pawn rows', 'pixel climber pawn art and crown', 'speedrun timer', 'real tutorial board positions'],
  source: { research: 'research/modes/UzoZVdmGpyc.json', confidence: 'medium', notes: 'Board positions are placeholders except the tutorial opening (1.d4 ... Qg5).' }
});
