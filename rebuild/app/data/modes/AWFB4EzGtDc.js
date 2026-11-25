/* Can I BEAT Gun King?  Gun King (Steam early access roguelite): a king with a gun in a top-down octagon arena on a
   light-blue pixel checker floor, surviving waves of chess-piece enemies (pawns, red elite pawns, kamikaze pawns with
   explosives, lunging knights, fireball bishops). Pick a gun (pistol, shotgun, crossbow, machine gun), level up from
   kills and choose chess-pun upgrades (Pawn's Endurance, Skewer, Bishop Pair, Pawn Race, Reverse Opening, Wing Gambit,
   aura, freeze). Dying = checkmate. Sources: research/modes/AWFB4EzGtDc.json (#aeebfd/#089eea floor, HUD with HP,
   ammo, gold, kills; first run 4:08 / 390 kills, second run clears Quickplay). Game module js/games/g4_gunking.js,
   all art drawn in code. PASS 1: four exits/biomes, unlock shop and grenades not modelled; Quickplay timer 150 s. */
CM.mode({
  id: 'AWFB4EzGtDc',
  title: 'Can I BEAT Gun King?',
  name: 'Gun King',
  category: 'Variants & Games',
  description: 'You are the king, and you have a gun. Move with the pad (or hold a finger on the arena); the gun auto-aims at the nearest piece. Pawns rush you, kamikaze pawns explode, knights lunge, bishops throw fireballs. Collect green XP to level up and pick an upgrade; gold counts your loot. Switch guns or Survival mode in the side panel.',
  how_to_win: 'Quickplay: survive the 150-second level. Survival: last as long as you can. Losing all HP is checkmate.',
  frame: 'game',
  player_side: 'white',
  player: { name: 'Gun King', rating: null },
  opponent: { name: 'Quickplay waves', rating: null, tagline: 'Pawns, kamikazes, knights and bishops.' },
  board: { files: 8, ranks: 8, light: '#aeebfd', dark: '#089eea' },
  theme: { background: '#0b3d5c' },
  game: { module: 'g4_gunking', aspect: 1, controls: ['left', 'up', 'down', 'right', '|', 'action'] },
  todo_pass2: ['four exits / biomes (icy blue etc.)', 'gold unlocks (next unlock at 375)', 'grenade throwers', 'end-of-run summary screen styling', 'gun sounds (pistol/shotgun/crossbow/machine gun)'],
  source: { research: 'research/modes/AWFB4EzGtDc.json', confidence: 'high', notes: 'Numbers (HP, damage, spawn rates, timer) tuned by hand; upgrade texts from the video.' }
});
