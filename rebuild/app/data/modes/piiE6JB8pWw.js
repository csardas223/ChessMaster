/* Can I BEAT Tiny Chess?  Tiny Chess on a 4x4 chess.com-style board vs ~1460 humans; a pocket column at the board edge
   shows captured pieces that can be dropped back (crazyhouse-style). Sources: research/modes/piiE6JB8pWw.json (low
   confidence), frames visual (4x4, pocket pieces at left). Drops inferred from the pocket column. impl-6 (8th session): army
   and piece art read from the real frames (maxres1-3): K, wazir (the tall piece that is Cloister's wazir), dragon knight, spiked
   ferz (moves inferred: one step diagonally) and a pawn each, point-symmetric; promotion to the army's pieces is inferred. */
CM.mode({
  id: 'piiE6JB8pWw',
  name: 'Tiny Chess',
  category: 'Variants & Games',
  description: 'A 4x4 board with king, wazir (one step straight), knight, ferz (one step diagonally) and a pawn per side. Pieces you capture go to your pocket and can be dropped back onto any empty square instead of moving (pawns not on the first or last row).',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  player: { name: 'ireallywantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's chess.com handle + purple-king avatar from the frames */
  opponent: { name: 'Klub4Konej', rating: 1460, avatar: 'assets/modes/piiE6JB8pWw/opp1.png', tagline: 'Tiny Chess regular.' },
  board: { files: 4, ranks: 4, light: '#eaf6d2', dark: '#7ea25a' },
  setup: { fen: 'fnwk/3p/P3/KWNF', moved: ['d3', 'a2'] },
  rules: { castling: false, enPassant: false, drops: true, promotion: { choices: ['N', 'W', 'F'] } },
  pieces: { P: { name: 'Pawn', moves: 'fmWfcF', pawn: true, promote: true, value: 100 },
    N: { name: 'Knight', moves: 'N', value: 300, img: { w: 'assets/modes/piiE6JB8pWw/knight_w.png', b: 'assets/modes/piiE6JB8pWw/knight_b.png' } },
    W: { name: 'Wazir', moves: 'W', value: 150, glyph: null, badge: null, img: { w: 'assets/modes/piiE6JB8pWw/bishop_w.png', b: 'assets/modes/piiE6JB8pWw/bishop_b.png' } },
    F: { name: 'Ferz', moves: 'F', value: 150, glyph: null, badge: null, img: { w: 'assets/modes/piiE6JB8pWw/spike_w.png', b: 'assets/modes/piiE6JB8pWw/spike_b.png' } } },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1460, depth: 4, time_ms: 600 },
  params: { series: {opponents: [{name: 'Klub4Konej', rating: 1460, avatar: 'assets/modes/piiE6JB8pWw/opp1.png'}, {name: 'purrberry', rating: 1479, avatar: 'assets/modes/piiE6JB8pWw/opp2.png'}]} },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/piiE6JB8pWw/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/piiE6JB8pWw.json', confidence: 'low', notes: 'Army and drop rule inferred from frames (pocket column); transcript unavailable.' }
});
