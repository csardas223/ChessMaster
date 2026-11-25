/* Can I BEAT Chess Ultimate with a Normal Chess Setup?  Chess Ultimate (Steam) where the army is a normal chess setup made
   of Chess Ultimate units: Pawn, Knight, Rover (bishop), Rock (rook), Queen Bee and King, all of which move like their chess
   counterparts. Sources: research/modes/dKBSZUzVQ1E.json (roster from the series' tutorial M0Nr98Axpo8; opponent PHATPAT,
   10:00 timer, CHECKMATE banner, grey stone tiles). The special units of the full roster are not used in this game. */
CM.mode({
  id: 'dKBSZUzVQ1E',
  name: 'Chess Ultimate: Normal Setup',
  category: 'Variants & Games',
  description: 'Chess Ultimate on a stone board floating over a grassy island, with a self-imposed normal chess army: Pawns, Knights, Rovers (bishops), Rocks (rooks), a Queen Bee and the King. They move exactly like chess pieces. The opponent is a real Chess Ultimate player.',
  how_to_win: 'Checkmate the enemy King.',
  player_side: 'white',
  opponent: { name: 'PHATPAT', rating: null, avatar: null, tagline: 'Chess Ultimate player' },
  board: { files: 8, ranks: 8, light: '#acb0b0', dark: '#878b8c' },
  theme: { background: '#4f8f3a' },
  pieces: {
    B: { name: 'Rover' },
    R: { name: 'Rock' },
    Q: { name: 'Queen Bee' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 600, b: 600, inc: 0 },
  bot: { engine: 'auto', elo: 1500, time_ms: 600 },
  messages: { win_title: 'CHECKMATE!' },
  source: { research: 'research/modes/dKBSZUzVQ1E.json', confidence: 'medium', notes: 'Unit art uses the standard set; PHATPAT strength inferred.' }
});
