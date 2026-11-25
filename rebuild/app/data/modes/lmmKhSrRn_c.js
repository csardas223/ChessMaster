/* Can I BEAT Explosive Magic?  A combo variant vs CzarnyRes (1928): captures explode (atomic), a central 2x2 hill
   (king of the hill), freeze/jump potions beside each clock and a dragon piece; "the pawns promote on the rank directly
   behind the hill". Sources: research/modes/lmmKhSrRn_c.json (LOW confidence: transcript failed), frames visual
   (2x2 hill, snowflake markers, potion icon per clock, rules text, dragon-maned knight explainer). Inferred: the spells
   are chess.com Spell Chess spells (js/modes/g6_spellc.js), the dragon (queen + knight) is a promotion choice, king
   capture / explosion decides (no check). */
CM.mode({
  id: 'lmmKhSrRn_c',
  name: 'Explosive Magic',
  category: 'Variants & Games',
  description: 'Atomic chess with magic: every capture explodes, destroying all non-pawn pieces around it. Get your king onto the central 2x2 hill to win. Pawns promote as soon as they reach the rank right behind the hill (your 6th rank), and can become a Dragon (queen + knight). You also carry Freeze and Jump potions (see Spell Chess).',
  how_to_win: 'Blow up or capture the enemy king, or walk your king onto the hill.',
  player_side: 'white',
  opponent: { name: 'CzarnyRes', rating: 1928, avatar: null, tagline: 'Plays fast, one-minute games.' },
  board: { files: 8, ranks: 8, light: '#ecf3d1', dark: '#7ba059', squares: { d4: { color: 'rgba(255,170,40,.32)' }, e4: { color: 'rgba(255,170,40,.32)' }, d5: { color: 'rgba(255,170,40,.32)' }, e5: { color: 'rgba(255,170,40,.32)' } } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none', atomic: true, promotion: { choices: ['Q', 'D', 'N', 'R', 'B'], zone: 3 },
    win: [{ type: 'reach', squares: 'd4 e4 d5 e5', piece: 'K', why: 'king of the hill' }] },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1928, depth: 3, time_ms: 600 },
  hooks: 'g6_spellc',
  params: { jump: 2, freeze: 5, cooldown: 3, botFreeze: 0.35 },
  vfx_timeline: [{ trigger: 'capture', effect: { type: 'explosion', at: 'to', radius: 1 } }],
  source: { research: 'research/modes/lmmKhSrRn_c.json', confidence: 'low', notes: 'Spell set, dragon placement and win rules inferred from frames; re-check with transcript.' }
});
