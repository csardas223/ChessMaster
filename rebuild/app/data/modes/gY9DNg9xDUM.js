/* Can I MASTER Tiny Chess?  Second "Tiny House Chess" episode: same 4x4 drop variant and army as piiE6JB8pWw (king, Wazir
   "Bob", non-jumping Dragon Knight, Ferz, pawn; captured pieces can be placed back), goal FIVE wins, 1+1 clock ("I only get one
   second back for every move", 7:06). Transcript recheck 2026-11-25 (analyze_video): 0:01 rules; 0:23 the Dragon Knight moves
   one square orthogonally then one diagonally and cannot go to either matching diagonal if a piece stands orthogonally next to
   it; 1:04 "its real name is the wazir, but I still want to call it Bob"; 6:25 promotes to a Bob. The old file guessed an
   R N B K + pawn army from blurry frames. Art: the series' pieces cut by impl-6 (assets/modes/piiE6JB8pWw); the ornate knight
   intro card is this video's own. Opponent from the frames: Tristanfail (1482). */
CM.mode({
  id: 'gY9DNg9xDUM',
  name: 'Tiny House Chess',
  category: 'Variants & Games',
  description: 'Tiny House Chess again: a 4x4 board with a king, a Wazir ("Bob", moves like a plus), a Dragon Knight (one square straight then one diagonally; blocked if the straight square is occupied), a Ferz (moves like an X) and a pawn per side. Captured pieces can be placed back on any empty square instead of moving. Pawns promote to a Bob, Ferz or Dragon Knight. This time: win five games at 1+1.',
  how_to_win: 'Checkmate the enemy king (or flag them).',
  player_side: 'white',
  player: { name: 'ireallywantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'Tristanfail', rating: 1482, avatar: null, tagline: 'Tiny House regular.' },
  board: { files: 4, ranks: 4, light: '#eaf6d2', dark: '#7ea25a' },
  setup: { fen: 'fnwk/3p/P3/KWNF', moved: ['d3', 'a2'] },
  rules: { castling: false, enPassant: false, drops: true, promotion: { choices: ['W', 'F', 'N'] } },
  pieces: { P: { name: 'Pawn', moves: 'fmWfcF', pawn: true, promote: true, value: 100 },
    N: { name: 'Dragon Knight', moves: 'nN', value: 220, img: { w: 'assets/modes/piiE6JB8pWw/knight_w.png', b: 'assets/modes/piiE6JB8pWw/knight_b.png' } },
    W: { name: 'Wazir (Bob)', moves: 'W', value: 150, glyph: null, badge: null, img: { w: 'assets/modes/piiE6JB8pWw/bishop_w.png', b: 'assets/modes/piiE6JB8pWw/bishop_b.png' } },
    F: { name: 'Ferz', moves: 'F', value: 150, glyph: null, badge: null, img: { w: 'assets/modes/piiE6JB8pWw/spike_w.png', b: 'assets/modes/piiE6JB8pWw/spike_b.png' } } },
  clock: { w: 60, b: 60, inc: 1 },
  bot: { engine: 'search', elo: 1480, depth: 5, time_ms: 600 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/gY9DNg9xDUM/ornate_knight.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/gY9DNg9xDUM.json', confidence: 'high', notes: 'Rechecked against the transcript 2026-11-25: same variant as piiE6JB8pWw, five wins, 1+1. Start position shared with the first episode (frames of both videos show the same point-symmetric army).' }
});
