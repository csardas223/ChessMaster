/* Chess... but it's Battle Royale  Chess Arena (chessarena.gg playtest): real-time battle royale. Each player is a
   king who summons an army, clears guardian pits, takes queen shrines and outlasts the shrinking purple poison;
   capturing a king is checkmate and wipes that army. Sources: research/modes/CONozr99agQ.json (green/teal tiles
   #6daa89/#3f5a4d, purple poison, minimap, players-left counter, per-piece cooldown bars). Game module
   js/games/g4_rt.js (variant 'arena'). REDUCED VERSION (allowed by the owner): 8 kings on a 24x24 2D map instead of 40
   players on a 3D map. arena agent (2026-11-25): champion select (Lord Thalric: Blizzard / Ice Shield / Frostbite from the 11:43
   frame; Eldrin: Stone Wall / Tremor / Aftershock from the transcript, cooldowns inferred), Q E R ability bar, bushes that hide
   pieces, blue XP orbs from cleared pits and checkmated armies, sliders limited to four squares, drag-to-move and box-select
   group moves (art: tools/g4_arena_ui.py from frames 703 / 352). */
CM.mode({
  id: 'CONozr99agQ',
  title: "Chess... but it's Battle Royale",
  name: 'Chess Arena Battle Royale',
  category: 'Other Videos',
  description: 'Real-time battle royale: you are the gold king among 8. Choose a champion (Lord Thalric or Eldrin), then summon an army with Q (or the action button). Move any ready piece at any time (each piece cools down; sliders go at most four squares): tap it, drag it, or drag on empty ground to box-select several and tap a square to send them all. E and R cast your champion abilities. Clear orange guardian pits and stand next to the blue XP orbs to level up, hide in bushes (enemies only see you when they are next to you), stand by a gold Q shrine for 3 s to gain a queen, and stay out of the purple poison.',
  how_to_win: 'Be the last king standing. Capturing a king destroys that whole army.',
  frame: 'game',
  player_side: 'white',
  opponent: { name: '7 rival kings', rating: null, tagline: 'KidGhost, DarkBlood7, Oren and friends (names from the kill feed).' },
  board: { files: 24, ranks: 24, light: '#6daa89', dark: '#3f5a4d' },
  theme: { background: '#1f2d27' },
  game: { module: 'g4_rt', variant: 'arena', aspect: 1, controls: ['left', 'up', 'down', 'right', '|', 'action'], pieces: 'assets/modes/CONozr99agQ/pieces' },  /* art-g4b: Chess Arena models from the video (w Base Purple 11:43, n brown guardians 5:52/8:49, b rivals; tools/g4_art6.py) */
  sounds: { 'game-start': 'assets/modes/CONozr99agQ/br_drop.wav', 'capture': 'assets/modes/CONozr99agQ/br_elim.wav', 'explosion': 'assets/modes/CONozr99agQ/br_tremor.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
  source: { research: 'research/modes/CONozr99agQ.json', confidence: 'medium', notes: 'Reduced: 8 players, 2D map. Inferred: Eldrin cooldowns (40 / 60 s) and his title (none shown), Stone Wall rock look (no still), blizzard slow = longer cooldowns, group move = each selected piece takes its legal square closest to the tapped one, XP per level, bots use no abilities. Other champions (Legion, Grand Demir, Kindra, Rea) are named in the video but not playable here.' }
});
