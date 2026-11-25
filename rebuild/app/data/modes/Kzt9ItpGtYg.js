/* Can I BEAT Pawnbarian?  First Pawnbarian episode: a chess-themed roguelike deck-builder. Cards move the hero like
   chess pieces, promotion in the top row, monsters strike targeted squares, loot decays, shop between floors; he
   clears Tutorial Island and the first area to its boss. Sources: research/modes/Kzt9ItpGtYg.json (2 actions from 3
   cards, red notches = targeted squares, Horned Cappy Bear only hit diagonally), frames (5x5 grid #646786/#36355b).
   Logic in js/modes/g5_pawnbarian.js. PASS 1: no loot row / gold / shop; 4 floors ending in a boss. */
CM.mode({
  id: 'Kzt9ItpGtYg',
  title: 'Can I BEAT Pawnbarian?',
  name: 'Pawnbarian',
  category: 'Variants & Games',
  description: 'You are the Pawnbarian (H). Each turn you hold 3 piece cards and take 2 actions: tap the hero, then a square it can reach with any card in your hand (pawn, knight, bishop, rook, queen, king); moving onto a monster kills it. Reaching the top row turns your pawn cards into queens. After your actions, every monster next to you hits for one heart (red-notched squares), then a monster moves. Horned Cappy Bears (Y) can only be attacked diagonally; the boss (X) needs 3 hits.',
  how_to_win: 'Kill every monster on each floor and beat the boss without losing all 3 hearts.',
  player_side: 'white',
  player: { name: 'Pawnbarian', rating: null, avatar: 'assets/modes/Kzt9ItpGtYg/hero_avatar.png' },
  opponent: { name: 'Monsters', rating: null, avatar: 'assets/modes/Kzt9ItpGtYg/lion.png', tagline: 'Cappy Bears, Horned Cappy Bears and the island boss.' },
  board: { files: 5, ranks: 5, light: '#646786', dark: '#36355b' },
  theme: { background: '#1e1d33' },
  pieces: {
    H: { name: 'Pawnbarian', moves: '', gen: 'hero', value: 1000, img: 'assets/modes/Kzt9ItpGtYg/hero.png', badge: '' },
    C: { name: 'Cappy Bear', moves: 'mK', value: 200, img: 'assets/modes/Kzt9ItpGtYg/cappy.png', badge: '' },
    Y: { name: 'Horned Cappy Bear', moves: 'mK', value: 260, img: 'assets/modes/Kzt9ItpGtYg/horned_cappy.png', badge: '' },
    X: { name: 'Island Boss', moves: 'mK', value: 900, img: 'assets/modes/Kzt9ItpGtYg/lion.png', badge: '' },
    /* Goblin Caves monsters, round tokens cut from the 11:43 / 15:40 / 22:20 video frames (tools/g5_art5.py) */
    S: { name: 'Spidertoad', moves: 'mK', value: 240, img: 'assets/modes/Kzt9ItpGtYg/spidertoad.png', badge: '' },
    M: { name: 'Champion Goblin Shaman', moves: 'mK', value: 320, img: 'assets/modes/Kzt9ItpGtYg/goblin_shaman.png', badge: '' },
    J: { name: 'Blightsack', moves: '', value: 120, img: 'assets/modes/Kzt9ItpGtYg/blightsack.png', badge: '' }   /* not placed yet: sacks spawn on deaths in the game (needs a hook); a sack left alone would stalemate the monster side */
  },
  setup: { fen: '1c1c1/5/5/5/2H2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { none: true }, movesPerTurn: { w: 2 }, drawPlies: 400, win: [] },
  bot: { engine: 'search', depth: 2, time_ms: 400, min_ms: 380 },
  params: {
    hearts: 3, bossHp: 3, deck: ['P', 'P', 'P', 'P', 'N', 'B', 'P', 'R'],
    floors: [
      { name: 'Tutorial Island', fen: '1c1c1/5/5/5/2H2' },
      { name: 'Island shore', fen: 'c1y1c/5/5/5/2H2' },
      { name: 'Island cliffs', fen: 'cy1yc/2c2/5/5/2H2' },
      { name: 'Boss: the Island King', fen: '1cxc1/5/5/5/2H2' },
      { name: 'The Goblin Caves', fen: 's1m1s/1y1y1/5/5/2H2' }
    ]
  },
  hooks: 'g5_pawnbarian',
  vfx_timeline: [{ trigger: 'player_capture', effects: [
    { type: 'overlay', at: 'to', image: 'assets/modes/Kzt9ItpGtYg/splash.png', fit: 'contain', duration_ms: 520 },   /* the pink diagonal slash cut from the video still (tools/g5_art4.py) */
    { type: 'overlay', at: 'to', image: 'assets/modes/Kzt9ItpGtYg/zap.png', fit: 'contain', duration_ms: 380 },   /* the cantrip zap burst (11:43 frame) */
    { type: 'text', text: '1 damage', at: 'to', color: '#ff4d6d', duration_ms: 900 } ] }],
  todo_pass2: ['piece-card hand UI (tap a card)', 'diagonal splash on queen promotion (art shipped as splash.png; needs a promotion trigger in g5_pawnbarian)', 'loot row that decays each turn, gold, shop between floors', 'Goblin Caves: the Blightvessel boss (art shipped as blightvessel.png; needs a second X-type boss in g5_pawnbarian), champion immunity / Nimble, Blightsack spawning'],
  source: { research: 'research/modes/Kzt9ItpGtYg.json', confidence: 'medium', notes: 'Floor layouts, deck and boss HP invented; monster attack = adjacent to the hero at the end of your turn.' }
});
