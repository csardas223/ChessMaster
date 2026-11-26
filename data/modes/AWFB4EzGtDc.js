/* Can I BEAT Gun King?  Gun King (Steam early access roguelite): a king with a gun in a top-down octagon arena on a
   light-blue pixel checker floor, surviving waves of chess-piece enemies (pawns, red elite pawns, kamikaze pawns with
   explosives, lunging knights, fireball bishops). Pick a gun (pistol, shotgun, crossbow, machine gun), level up from
   kills and choose chess-pun upgrades (Pawn's Endurance, Skewer, Bishop Pair, Pawn Race, Reverse Opening, Wing Gambit,
   aura, freeze). Dying = checkmate. Sources: research/modes/AWFB4EzGtDc.json (#aeebfd/#089eea floor, HUD with HP,
   ammo, gold, kills; first run 4:08 / 390 kills, second run clears Quickplay). Game module js/games/g4_gunking.js,
   video art (sprites, start room, exit strips, icy floor; tools/g4_sprites.py + tools/g4_art7.py). art-g4b: the run starts in the
   stone start room (0:38) with four EXITs; down = icy biome (1:02), up = forest (inferred from its edge strip), left/right never
   shown in the video (stone halls); end-of-run CHECKMATE/VICTORY summary styled after 8:12/26:13. Quickplay timer 150 s.
   arena (2026-11-25): run gold is banked across runs with gold unlocks (first at 375, as the end screen shows; rewards inferred),
   grenade-throwing pieces (lobbed grenade with a red landing ring), and our own synthesised gun sounds per gun
   (tools/g4_gunking_sounds.py: pistol, shotgun, crossbow, machine gun, reload click, grenade throw). */
CM.mode({
  id: 'AWFB4EzGtDc',
  title: 'Can I BEAT Gun King?',
  name: 'Gun King',
  category: 'Variants & Games',
  description: 'You are the king, and you have a gun. Start in the stone room and walk through one of the four EXITs to pick a biome (down = icy blue). Move with the pad (or hold a finger on the arena); the gun auto-aims at the nearest piece. Pawns rush you, kamikaze pawns explode, knights lunge, bishops throw fireballs. Grenade throwers lob grenades: step out of the red ring. Collect green XP to level up and pick an upgrade; gold is banked across runs and unlocks new upgrades (first unlock at 375 gold). Switch guns or Survival mode in the side panel.',
  how_to_win: 'Quickplay: survive the 150-second level. Survival: last as long as you can. Losing all HP is checkmate.',
  frame: 'game',
  player_side: 'white',
  player: { name: 'Gun King', rating: null },
  opponent: { name: 'Quickplay waves', rating: null, tagline: 'Pawns, kamikazes, knights, bishops and grenade throwers.' },
  board: { files: 8, ranks: 8, light: '#aeebfd', dark: '#089eea' },
  theme: { background: '#0b3d5c' },
  game: { module: 'g4_gunking', aspect: 1, controls: ['left', 'up', 'down', 'right', '|', 'action'] },
  sounds: { gk_pistol: 'assets/modes/AWFB4EzGtDc/pistol.wav', gk_shotgun: 'assets/modes/AWFB4EzGtDc/shotgun.wav', gk_crossbow: 'assets/modes/AWFB4EzGtDc/crossbow.wav', gk_machine: 'assets/modes/AWFB4EzGtDc/machine.wav', gk_smg: 'assets/modes/AWFB4EzGtDc/smg.wav', gk_reload: 'assets/modes/AWFB4EzGtDc/reload.wav', gk_grenade: 'assets/modes/AWFB4EzGtDc/grenade.wav' },
  source: { research: 'research/modes/AWFB4EzGtDc.json', confidence: 'high', notes: 'Numbers (HP, damage, spawn rates, timer) tuned by hand; upgrade texts from the video. Gold unlocks: the 375 threshold (end screen 8:12) unlocks the SMG (8:40); the later tiers and what each unlock gives are inferred. Grenade thrower look inferred (no repo still shows one). Gun sounds are our own synthesised WAVs.' }
});
