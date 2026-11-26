/* Can I Find Myself in Infinite Craft?  Back in Infinite Craft (neal.fun; combine two concepts, an AI names the result) to
   craft Checkmate and then "I want checkmate". m3-salvage 2026-11-26 (accuracy_audit P1; was the legacy "craft" stand-in).
   Transcript (analyze_video 2026-11-26): 0:01 goal Checkmate and I want checkmate, Chess carried over from the first episode
   (-TKJGtBKK8U); 1:50-2:21 Chess + Blade = Knight, Chess + Fire / Riddle / Obsidian / Thunder / Warrior / Knight = Checkmate,
   Chess + Unicorn = Knight, Chess + Storm = Chess Master, Chess + Sandstorm = Sand Castle, Chess + King = Chess King;
   4:20-4:50 Earth + Dwarf = Gnome, Earth + Egypt = Pyramid, Earth + Fairy = Gnome, Earth + Frankenstein = Monster, Earth +
   Gandalf = Dirt, Earth + Mummy = Tomb, Earth + Samurai = Ninja, Earth + Zombie = Plant, Earth + Unicorn = Pegasus; 5:51 Magic +
   Zombie = Wizard, Mystery + Wizard = Magic, Magic + Monster = Dragon; 6:30 Wind + Earth = Dust, Wind + Dust = Sandstorm;
   10:01 Angel + Life = Soul, Angel + Angel = Angel; 14:50 Checkmate + Checkmate = Stalemate; 15:20 the Want chain (Climate
   Change + Answer = Denial, Richer + Blanket = Warmer, Warmer + Boring = Hotter, Hotter + Denial = Not, Waste + Not = Want);
   15:50 "Want and checkmate just makes checkmate"; 16:11 he never finds "I want checkmate". The remake's goal is Checkmate (what
   the video reaches); Want + Checkmate = Checkmate is kept as the video's punchline. Module js/games/g4_craft.js (params.craft). */
CM.mode({
  id: 'jmdkuvE2ApQ',
  title: 'Can I Find Myself in Infinite Craft?',
  name: 'Infinite Craft: Checkmate',
  category: 'Variants & Games',
  description: 'Infinite Craft again, with Chess carried over from the first episode. Combine two items to make a new one: find what turns Chess into Checkmate, then go looking for "I want checkmate" (the video never found it: Want + Checkmate just makes Checkmate).',
  how_to_win: 'Craft Checkmate (hint: Chess plus something that attacks).',
  frame: 'game',
  player_side: 'white',
  opponent: { name: 'Infinite Craft', rating: null, tagline: 'No opponent: a crafting sandbox.' },
  board: { files: 8, ranks: 8, light: '#ffffff', dark: '#ffffff' },
  game: { module: 'g4_craft', aspect: 0.82, controls: [] },
  params: { craft: {
    goal: 'Checkmate', winImg: null,
    start: ['Water', 'Fire', 'Earth', 'Wind', 'Chess'],
    status: 'Craft Checkmate. You start with Water, Fire, Earth, Wind and the Chess from last time.',
    recipes: ['Chess+Blade=Knight', 'Chess+Fire=Checkmate', 'Chess+Riddle=Checkmate', 'Chess+Obsidian=Checkmate', 'Chess+Thunder=Checkmate',
      'Chess+Warrior=Checkmate', 'Chess+Knight=Checkmate', 'Chess+Unicorn=Knight', 'Chess+Storm=Chess Master', 'Chess+Sandstorm=Sand Castle',
      'Chess+King=Chess King', 'Earth+Dwarf=Gnome', 'Earth+Egypt=Pyramid', 'Earth+Fairy=Gnome', 'Earth+Frankenstein=Monster', 'Earth+Gandalf=Dirt',
      'Earth+Mummy=Tomb', 'Earth+Samurai=Ninja', 'Earth+Zombie=Plant', 'Earth+Unicorn=Pegasus', 'Magic+Zombie=Wizard', 'Mystery+Wizard=Magic',
      'Magic+Monster=Dragon', 'Wind+Dust=Sandstorm', 'Angel+Life=Soul', 'Angel+Angel=Angel', 'Checkmate+Checkmate=Stalemate',
      'Climate Change+Answer=Denial', 'Richer+Blanket=Warmer', 'Warmer+Boring=Hotter', 'Hotter+Denial=Not', 'Waste+Not=Want', 'Want+Checkmate=Checkmate',
      'Water+Lava=Obsidian', 'Wind+Cloud=Storm', 'Cloud+Fire=Thunder'],
    emoji: { Obsidian: '🪨', Thunder: '⚡', Storm: '⛈️', Sandstorm: '🌪️', 'Chess Master': '🧠', 'Sand Castle': '🏰', 'Chess King': '👑', Gnome: '🧙', Monster: '👹',
      Dirt: '🟤', Tomb: '🪦', Ninja: '🥷', Pegasus: '🦄', Wizard: '🧙', Magic: '✨', Soul: '👻', Stalemate: '🤝', Denial: '🙅', Warmer: '🔥', Hotter: '🥵', Not: '🚫', Want: '🙏' },
    notes: { 'Want+Checkmate': 'Want + Checkmate just makes Checkmate. "I want checkmate" was never found in the video.' }
  } },
  sounds: { 'move-self': 'assets/modes/-TKJGtBKK8U/craft_combine.wav', 'promote': 'assets/modes/-TKJGtBKK8U/craft_new.wav' },
  source: { research: 'research/modes/jmdkuvE2ApQ.json', confidence: 'medium', notes: 'Recipes in the header are quoted from the transcript; Water + Lava = Obsidian, Wind + Cloud = Storm and Cloud + Fire = Thunder are filler (inferred) so the video\'s Checkmate ingredients can be made; the rest falls back to the first episode\'s table. The thumbnail\'s "Want + Checkmate = iwantcheckmate" is not what the video shows.' }
});
