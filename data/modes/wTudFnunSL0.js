/* Can I BEAT Atomic Chess?  Atomic chess on chess.com against online players (~1950) on 3-minute clocks.
   Sources: research/modes/wTudFnunSL0.json (transcript 0:01 rules, 3:43 pawn exception: "pawns can explode pieces,
   but pawns never explode"), frames: green board, standard UI, opponents 2025ramr (1954), Marcello09 (1927). */
CM.mode({
  id: 'wTudFnunSL0',
  name: 'Atomic Chess',
  category: 'Variants & Games',
  description: 'Every capture explodes. The capturing piece, the captured piece and every piece next to them are destroyed, except pawns, which only die when they capture or are captured. Kings cannot capture and may stand next to each other.',
  how_to_win: 'Blow up the enemy king, or checkmate it. A move that would explode your own king is not allowed.',
  player_side: 'white',
  opponent: { name: '2025ramr', rating: 1954, tagline: 'Atomic player on chess.com (opponent in game 1)' },
  board: { files: 8, ranks: 8, light: '#ebecd0', dark: '#739552' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { atomic: { radius: 1, spare: ['P'] } },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1954, depth: 3, time_ms: 700 },
  vfx_timeline: [
    { trigger: 'capture', effect: { type: 'explosion', at: 'to', radius: 1, shake: false }, sound: 'explosion' }
  ],
  messages: { win: 'the enemy king exploded' },
  source: { research: 'research/modes/wTudFnunSL0.json', confidence: 'high', notes: 'Explosion art is generic (assets/img/boom.png); chess.com shows a plain blast.' }
});
