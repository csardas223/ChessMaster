/* Can I BEAT the Rosen Score?  First Rosen Score video: Alphabet Openings. The files of your first moves must spell the
   word (CHAD = c, h, a, d; then HEADACHE), then you must win. Public blitz pool vs ~2000-2150 humans (PURESATURDAYY ~2039).
   Sources: research/modes/1Q4rfOd0al8.json, frames visual_d (green board). Rules via js/modes/g5_spell.js (read-only reuse). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/1Q4rfOd0al8/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: '1Q4rfOd0al8',
  title: 'Can I BEAT the Rosen Score?',
  name: 'Rosen Score: CHAD & HEADACHE',
  category: 'Variants & Games',
  description: 'Rosen Score Alphabet Opening: the files your first moves land on must spell the word in order (CHAD = c, h, a, d; HEADACHE = h, e, a, d, a, c, h, e). Until the word is done only matching moves are offered. Then win the game; it only counts with the word spelled.',
  how_to_win: 'Spell the word with your opening moves, then checkmate.',
  player_side: 'white',
  opponent: { avatar: 'assets/modes/1Q4rfOd0al8/opponent.png', name: 'PURESATURDAYY', rating: 2039, tagline: 'Blitz pool opponent' },
  board: { files: 8, ranks: 8, light: '#eaedd1', dark: '#759e55' },
  clock: { w: 180, b: 180, inc: 0 },
  params: { words: ['CHAD', 'HEADACHE'], side: 'w', by: 'file' },
  hooks: 'g5_spell',
  source: { research: 'research/modes/1Q4rfOd0al8.json', confidence: 'high' }
});
