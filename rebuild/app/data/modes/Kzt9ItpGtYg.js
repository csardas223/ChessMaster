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
    C: { name: 'Cappy Bear', moves: 'mK', value: 200, img: 'assets/modes/Kzt9ItpGtYg/cappy.svg', badge: '' },
    Y: { name: 'Horned Cappy Bear', moves: 'mK', value: 260, img: 'assets/modes/Kzt9ItpGtYg/horned_cappy.svg', badge: '' },
    X: { name: 'Island Boss', moves: 'mK', value: 900, img: 'assets/modes/Kzt9ItpGtYg/lion.png', badge: '' }
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
      { name: 'Boss: the Island King', fen: '1cxc1/5/5/5/2H2' }
    ]
  },
  hooks: 'g5_pawnbarian',
  todo_pass2: ['horned-helmet barbarian hero art', 'capybara / horned capybara / boss monster art', 'piece-card hand UI (tap a card)', 'red notch markers on targeted squares', "'1 damage' text + slash / lightning attack VFX", 'diagonal splash on queen promotion', 'loot row that decays each turn, gold, shop between floors', 'Blight host / Spider toad / champions (later areas)'],
  source: { research: 'research/modes/Kzt9ItpGtYg.json', confidence: 'medium', notes: 'Floor layouts, deck and boss HP invented; monster attack = adjacent to the hero at the end of your turn.' }
});
