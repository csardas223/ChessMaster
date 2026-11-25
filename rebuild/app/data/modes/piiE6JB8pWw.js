/* Can I BEAT Tiny Chess?  Tiny Chess on a 4x4 chess.com-style board vs ~1460 humans; a pocket column at the board edge
   shows captured pieces that can be dropped back (crazyhouse-style). Sources: research/modes/piiE6JB8pWw.json (low
   confidence), frames visual (4x4, back rank B N B K, pocket pieces at left). Drops inferred from the pocket column. */
CM.mode({
  id: 'piiE6JB8pWw',
  name: 'Tiny Chess',
  category: 'Variants & Games',
  description: 'A 4x4 board with bishop, knight, bishop, king and a pawn per side. Pieces you capture go to your pocket and can be dropped back onto any empty square instead of moving (pawns not on the first or last row).',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  opponent: { name: 'Klub4Konej', rating: 1460, avatar: null, tagline: 'Tiny Chess regular.' },
  board: { files: 4, ranks: 4, light: '#eaf6d2', dark: '#7ea25a' },
  setup: { fen: 'kbnb/3p/P3/BNBK', moved: ['d3', 'a2'] },
  rules: { castling: false, enPassant: false, drops: true },
  pieces: { P: { name: 'Pawn', moves: 'fmWfcF', pawn: true, promote: true, value: 100 } },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1460, depth: 4, time_ms: 600 },
  source: { research: 'research/modes/piiE6JB8pWw.json', confidence: 'low', notes: 'Army and drop rule inferred from frames (pocket column); transcript unavailable.' }
});
