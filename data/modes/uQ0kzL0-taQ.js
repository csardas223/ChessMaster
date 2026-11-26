/* Can I SURVIVE Atomic Chess?  Atomic chess against higher-rated humans (~1800-1900). Every capture explodes the capturing
   piece, the captured piece and every non-pawn piece on the 8 surrounding squares. Sources: research/modes/uQ0kzL0-taQ.json
   (pawns immune to blasts, exploding the king wins, kings cannot capture, adjacent kings cannot be checked). */
CM.mode({
  id: 'uQ0kzL0-taQ',
  name: 'Atomic Chess',
  category: 'Variants & Games',
  description: 'Every capture is an explosion: the capturing piece, the captured piece and every non-pawn piece next to them are destroyed. Pawns only die if they capture or are captured. Kings cannot capture, and a king touching the enemy king cannot be checked.',
  how_to_win: 'Blow up the enemy king, or checkmate it. You may never explode your own king.',
  player_side: 'white',
  opponent: { name: 'Hardy314', rating: 1805, avatar: null, tagline: 'Higher-rated atomic player.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { atomic: { radius: 1, spare: ['P'] } },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1805, depth: 3, time_ms: 700 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/uQ0kzL0-taQ/atomic.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } },  { trigger: 'capture', effect: { type: 'explosion', at: 'to', radius: 1, shake: false }, sound: 'explosion' } ],
  messages: { win: 'the enemy king exploded' },
  source: { research: 'research/modes/uQ0kzL0-taQ.json', confidence: 'high', notes: 'blurry-b 2026-11-26: atomic.png re-traced to clean vector shapes (palette-quantised, potrace, re-rendered as a 512px transparent PNG at ~90%, hard anti-aliased edges, no fading; tool tools/sprite_vec.py) from the existing video crop, because no copy of the same image was found online.' }
});
