/* Chess... but it's Battle Royale  Chess Arena (chessarena.gg playtest): real-time battle royale. Each player is a
   king who summons an army, clears guardian pits, takes queen shrines and outlasts the shrinking purple poison;
   capturing a king is checkmate and wipes that army. Sources: research/modes/CONozr99agQ.json (green/teal tiles
   #6daa89/#3f5a4d, purple poison, minimap, players-left counter, per-piece cooldown bars). Game module
   js/games/g4_rt.js (variant 'arena'). REDUCED VERSION (allowed by the owner): 8 kings on a 24x24 2D map instead of 40
   players on a 3D map; no champion abilities, bushes or XP orbs (clearing a pit levels you up instead). */
CM.mode({
  id: 'CONozr99agQ',
  title: "Chess... but it's Battle Royale",
  name: 'Chess Arena Battle Royale',
  category: 'Other Videos',
  description: 'Real-time battle royale: you are the gold king among 8. Summon an army with the action button (or Q), move any ready piece at any time (each piece cools down after moving), clear orange guardian pits to level up, stand by a gold Q shrine for 3 s to gain a queen, and stay out of the purple poison that closes in.',
  how_to_win: 'Be the last king standing. Capturing a king destroys that whole army.',
  frame: 'game',
  player_side: 'white',
  opponent: { name: '7 rival kings', rating: null, tagline: 'Blizzard, Eldrin, Lore and friends.' },
  board: { files: 24, ranks: 24, light: '#6daa89', dark: '#3f5a4d' },
  theme: { background: '#1f2d27' },
  game: { module: 'g4_rt', variant: 'arena', aspect: 1, controls: ['left', 'up', 'down', 'right', '|', 'action'] },
  todo_pass2: ['champion select + abilities (Blizzard ice shield/slow, Eldrin)', 'bushes that hide pieces', 'XP orbs', 'end screen stats (pieces destroyed, pits cleared, queens, checkmates)', 'drag to move several pieces', 'original stylised piece art'],
  source: { research: 'research/modes/CONozr99agQ.json', confidence: 'medium', notes: 'Reduced: 8 players, 2D map, simplified levelling.' }
});
