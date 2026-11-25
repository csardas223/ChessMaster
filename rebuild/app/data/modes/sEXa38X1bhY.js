/* 5 Dragons vs 1 Chess YouTuber.  Tony (full army, White) vs ViperKing, who has only a king plus N Dragons (bishop +
   knight). One more dragon after every Tony win, until Tony loses (he beat 1-6 and lost to 7, mated on h2 ~38:16).
   5-minute games. Sources: research/modes/sEXa38X1bhY.json, frames visual_d (brown lichess-style board, black dragon
   head icons on the back rank). Dragon and avatar art are original. Ladder via js/modes/g3_ladder.js (advance on win). */
CM.mode({
  id: 'sEXa38X1bhY',
  title: '5 Dragons vs 1 Chess YouTuber',
  name: 'Dragons vs YouTuber',
  category: 'Other Videos',
  description: 'You have a normal army. ViperKing has only a king and Dragons, which move like a bishop or a knight. Every time you win, he gets one more Dragon. How far can you go? The goal in the video was five.',
  how_to_win: 'Checkmate ViperKing. Each win adds a Dragon for the next game.',
  player_side: 'white',
  opponent: { name: 'ViperKing', rating: 1500, avatar: 'assets/modes/sEXa38X1bhY/viperking.svg', tagline: 'Chess YouTuber with an army of Dragons.' },
  board: { files: 8, ranks: 8, light: '#ecdab7', dark: '#ae8766' },
  pieces: { A: { name: 'Dragon', moves: 'BN', value: 800, img: { w: 'assets/modes/sEXa38X1bhY/dragon_w.svg', b: 'assets/modes/sEXa38X1bhY/dragon_b.svg' } } },
  setup: { fen: '4k3/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 300, b: 300, inc: 0 },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 800 },
  params: {
    levels: [
      { label: '1 Dragon', fen: '3ak3/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
      { label: '2 Dragons', fen: '3aka2/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
      { label: '3 Dragons', fen: '2aaka2/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
      { label: '4 Dragons', fen: '2aakaa1/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
      { label: '5 Dragons', fen: '1aaakaa1/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
      { label: '6 Dragons', fen: '1aaakaaa/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
      { label: '7 Dragons', fen: 'aaaakaaa/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
      { label: '8 Dragons', fen: 'aaaakaaa/4a3/8/8/8/8/PPPPPPPP/RNBQKBNR' }
    ],
    advance: 'win',
    unit: 'Dragons'
  },
  hooks: 'g3_ladder',
  source: { research: 'research/modes/sEXa38X1bhY.json', confidence: 'high', notes: 'Dragon start squares are visual-only in the video; placed symmetrically around the king. Ladder lib reused read-only from group 3.' }
});
