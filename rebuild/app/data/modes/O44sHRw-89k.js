/* Can I BEAT Petrified Chess?  chess.com Petrified Chess vs online humans: a non-pawn piece that captures (a non-pawn)
   turns to stone where it lands and becomes a permanent block; pawns never petrify and can also step sideways (found at
   6:15). He wins two and draws the third by repetition. Sources: research/modes/O44sHRw-89k.json, rules.jsonl, frames
   (#edf2d0/#7b9d58, grey stone pieces, makar050 ~1496, JanHeckm 1743, 3-min clocks). Rules in js/modes/g5_petrified.js
   (kings cannot capture, per the sister video NWxiv9k1yrQ). */
CM.mode({
  id: 'O44sHRw-89k',
  title: 'Can I BEAT Petrified Chess?',
  name: 'Petrified Chess',
  category: 'Variants & Games',
  description: 'A piece (not a pawn) that captures a non-pawn piece is petrified: it turns to stone on that square and can never move again, nor be captured. Pawns capture freely and may also step one square sideways. Kings cannot capture. Use the stones as walls around the enemy king.',
  how_to_win: 'Checkmate.',
  player_side: 'white',
  player: { name: 'You', rating: 1524 },
  opponent: { name: 'JanHeckm', rating: 1743, tagline: 'Petrified Chess opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#edf2d0', dark: '#7b9d58' },
  pieces: {
    P: { name: 'Pawn', value: 110, moves: 'fmWfcFifmnDmsW', pawn: true, enPassant: true, promote: true, san: '' },
    Stone: { name: 'Stone', moves: '', value: 0, blocker: true, capturable: false, img: 'assets/modes/O44sHRw-89k/stone.svg' }
  },
  bot: { engine: 'search', elo: 1743, depth: 3, time_ms: 700 },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  hooks: 'g5_petrified',
  source: { research: 'research/modes/O44sHRw-89k.json', confidence: 'high', notes: 'Points counter shown in the video is not used: checkmate decides.' }
});
