/* Can I BEAT Passant? [Full Release - Part 2]  Passant, a Steam chess roguelike: you play White with a small bought army against the AI's preset army each
   round. Full release, setup 4 "Slip and Push": six pawns, two bishops and the king with the Slippy badge (a piece that moved in a straight line slides one more square if it can, possibly off the board). Victory (any one): checkmate / capture the king, check the enemy king 6 of your turns in a row,
   capture every enemy piece except the king, or stay +7 material ahead for two turns. You may move into check, but if
   your king is captured you lose. Sources: research/modes/dkCMhNcZezM.json, frames (#e8b8c8/#70361c). PASS 1: the run is a
   fixed sequence of rounds (js/modes/g6_levels.js, passant + money counters); the shop, coins and badges are pass 2.
   The Courtisan freezes the enemy pieces next to it (qZyNuiVbGMI spec).    impl-6 pass 2 (8th session, js/modes/g6_levels.js run layer): SHOP between rounds (pieces / coins / Push + Slippy
   badges, Re-roll $2, Next Round), Stage Select (Standard / Challenging / Skip Round), 3 undo charges, 'Player Turn'
   banner, smoke on capture, +$ payout popup. Coin effects beyond the spec's pawn/money coins and the tile squares are
   inferred. Passant's own 3D piece set is only partly visible in the stills (no queen/rook/fairy pieces), so the
   fairy pieces keep glyph + badge. */
CM.mode({
  id: 'dkCMhNcZezM',
  title: 'Can I BEAT Passant? [Full Release - Part 2]',
  name: 'Passant: Slip and Push',
  category: 'Variants & Games',
  description: 'A chess roguelike run of rounds against the Passant AI. Win a round by checkmate (or taking the king), by checking the king six of your turns in a row, by capturing everything but the king, or by staying 7 points of material ahead for two turns. You may move into check, but losing your king ends the run. Empress = rook + knight, Amazon = queen + knight; enemy pieces next to your Courtisan are frozen. Slippy: your piece slides one more square after a straight move.',
  how_to_win: 'Clear every round of the run.',
  player_side: 'white',
  opponent: { name: 'Passant AI', rating: null, avatar: 'assets/modes/dkCMhNcZezM/passant_ai.png', tagline: 'Preset enemy armies and boss rounds.' },
  board: { files: 8, ranks: 8, light: '#e2c6c3', dark: '#372f24', background: '#ae6a39' }   /* impl-6: sampled from the full-release frame (maxres2) */,
  pieces: {
    C: { name: 'Empress', moves: 'RN', value: 850, glyph: 'R', badge: 'E' },
    M: { name: 'Amazon', moves: 'QN', value: 1200, glyph: 'Q', badge: 'A' },
    Ct: { name: 'Courtisan', moves: 'K', value: 300, glyph: 'B', badge: 'Ct' },
    U: { name: 'Man', moves: 'K', value: 300, glyph: 'K', badge: 'M' },
    Dk: { name: 'Dragon King', moves: 'Q', value: 1000, royal: true, glyph: 'K', badge: 'D' },
    Rp: { name: 'Rainbow Pawn', moves: 'fmWfcFmK', value: 350, glyph: 'P', badge: 'R' }
  },
  setup: { fen: '3k4/2ppp3/8/8/8/8/1PPPPPP1/2B1KB2' },
  rules: { check: { w: 'none', b: 'standard' }, castling: false, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 550 },
  params: { shop: { pieces: [{ t: 'P', cost: 2 }, { t: 'N', cost: 4 }, { t: 'B', cost: 4 }, { t: 'R', cost: 5 }, { t: 'Q', cost: 9 }], coins: ['queen', 'pawn', 'demotion', 'money'], coinCost: 3, badges: [{ id: 'push', name: 'Push', cost: 5 }, { id: 'slippy', name: 'Slippy', cost: 4 }], offer: 3, reroll: 2 }, stages: true, undos: 3, banner: 'Player Turn', startBadges: { push: 1, slippy: 1 }, "run": "Round", "money": true, "passant": true, "freezer": "Ct", "levels": [{"name": "Level 1, round 1", "fen": "3k4/2ppp3/8/8/8/8/1PPPPPP1/2B1KB2", "reward": 8}, {"name": "Level 1, round 2", "fen": "1n1k2n1/2ppp3/8/8/8/8/1PPPPPP1/2B1KB2", "reward": 8, "hint": "Unstable tiles collapse once left; arrow tiles slide you on", "tiles": {"c4": "unstable", "f4": "unstable", "a5": "right", "h5": "left"}}, {"name": "Boss: Enemy Rainbow Pawn", "fen": "r2k3r/2p[rp][rp]p2/8/8/8/8/1PPPPPP1/2B1KB2", "hint": "Rainbow pawns step in any direction", "reward": 12}], "slippy": true},
  vfx_timeline: [{ trigger: 'capture', effect: { type: 'particles', kind: 'smoke', at: 'to', count: 14 } }],
  hooks: 'g6_levels',
  source: { research: 'research/modes/dkCMhNcZezM.json', confidence: 'medium', notes: 'Push badge and unstable tiles not modelled; boss armies invented.' }
});
