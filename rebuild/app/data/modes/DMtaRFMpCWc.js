/* Can I BEAT Wizard Chess?  Wizard Chess, a 'chess roguelike where chess meets wizards': you are the Bard (blue, swanky
   hat, never attacks) with recruited units (Alice the dog 0/6, Elitis the Merc, guards, rogue, druid) against golden
   units in dungeon rooms; combat at the end of each turn (combined adjacent ATK > DEF = hit; hit twice = dead); boss
   fight vs Cloaky. Sources: research/modes/DMtaRFMpCWc.json (transcript 00:00:01 rules, unit stats/skills), frames
   (tan floor #c8a070, dark brick #3a2a2a). Logic in js/modes/g5_wizard.js. PASS 1: square rooms, units drawn with
   tinted standard pieces + ATK/DEF badges; no shop/rewards/dialogue. */
CM.mode({
  id: 'DMtaRFMpCWc',
  title: 'Can I BEAT Wizard Chess?',
  name: 'Wizard Chess',
  category: 'Variants & Games',
  description: 'You are the Bard (blue king): he moves but never attacks. Move ONE unit per turn; units never capture by moving. At the end of each turn every unit of the side that moved (except the Bard) attacks all adjacent enemies: an enemy is hit when the combined ATK next to it is higher than its DEF. A hit unit turns Vulnerable (red ring); hit again, it dies. Badges show ATK/DEF. Druid: enemies in its row or column lose 2 DEF. Merc: lonely enemies lose 1 DEF. Guards cannot move. Golden enemies fight the same way, so standing next to them is dangerous.',
  how_to_win: 'Clear every room (kill all golden units) and beat Cloaky without the Bard being hit twice.',
  player_side: 'white',
  opponent: { name: 'Cloaky', rating: null, tagline: 'The cloaked tutor runs the tournament. The Minotaur, The Teacher, watches.' },
  board: { files: 7, ranks: 7, mask: ['x.....x', '.......', '.......', '.......', '.......', '.......', 'x.....x'], light: '#c8a070', dark: '#a9824f' },
  theme: { background: '#2a1d1d' },
  pieces: {
    W: { name: 'Bard', moves: 'mK', royal: true, castle: false, value: 0, glyph: 'K' },
    A: { name: 'Alice the dog', moves: 'mK', value: 250, glyph: 'N' },
    C: { name: 'Elitis the Merc', moves: 'mKmnD', value: 400, glyph: 'R' },
    T: { name: 'Guard', moves: '', value: 300, glyph: 'R' },
    O: { name: 'Rogue', moves: 'mN', value: 330, glyph: 'N' },
    Y: { name: 'Druid', moves: 'mK', value: 330, glyph: 'B' },
    S: { name: 'Skeleton', moves: 'mK', value: 200, glyph: 'P' },
    H: { name: 'Skeleton Brute', moves: 'mK', value: 400, glyph: 'R' },
    Z: { name: 'Cloaky', moves: 'mKmnD', value: 800, glyph: 'Q' }
  },
  setup: { fen: '2s1s2/7/7/7/7/7/2CWA2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { none: true }, drawPlies: 160, win: [] },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: {
    leader: 'W', druid: 'Y', merc: 'C',
    stats: { W: { atk: 0, def: 2 }, A: { atk: 0, def: 6 }, C: { atk: 2, def: 2 }, T: { atk: 1, def: 4 }, O: { atk: 2, def: 1 }, Y: { atk: 1, def: 1 },
      S: { atk: 1, def: 1 }, H: { atk: 2, def: 3 }, Z: { atk: 3, def: 4 } },
    rooms: [
      { name: 'Tutorial: the first skeletons', fen: '2s1s2/7/7/7/7/7/2CWA2' },
      { name: 'Guard post', fen: '1s1h1s1/7/7/7/7/2T1T2/1OCWA2' },
      { name: 'Druid grove', fen: '1shshs1/2s1s2/7/7/7/7/1YCWAO1' },
      { name: 'Boss: Cloaky', fen: '1hszsh1/1s3s1/7/7/7/2T1T2/1YCWAO1', boss: 'Cloaky' }
    ]
  },
  hooks: 'g5_wizard',
  todo_pass2: ['isometric pixel-art dungeon tiles (dark brick walls, tan floor)', 'original pixel units: Bard with swanky hat, Alice the dog, Merc, Guard, Rogue, Druid, skeletons, Cloaky', 'Minotaur (The Teacher) + Cloaky dialogue boxes', 'magenta/green glowing move tiles', 'rewards/shop with skull currency between rooms', 'boss shield orbs', 'Poised / javelin skills'],
  source: { research: 'research/modes/DMtaRFMpCWc.json', confidence: 'high', notes: 'Combat rules from the transcript; room layouts, unit stats (except Alice 0/6) and the 7x7 rooms are invented. Combat resolves for the side that just moved.' }
});
