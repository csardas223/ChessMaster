/* Can I BEAT Infinite Craft?  Not chess: the Infinite Craft sandbox, where you combine two items into a new one,
   starting from Water, Fire, Earth and Wind. His goal is to craft "Chess": plant, tree, lava, stone, boulder,
   mountain, clay, pottery, dragon, pharaoh, King Tut, Excalibur, King Arthur, Warrior + Excalibur = King,
   King + Riddle = Sphinx (not chess), Blade + King = Knight, Blade + Knight = Chess; then other pieces.
   Sources: research/modes/-TKJGtBKK8U.json (white canvas, emoji chips, sidebar list). Game module
   js/games/g4_craft.js with a hand-written recipe table (combinations not in it give nothing). */
CM.mode({
  id: '-TKJGtBKK8U',
  title: 'Can I BEAT Infinite Craft?',
  name: 'Infinite Craft: Make Chess',
  category: 'Variants & Games',
  description: 'Combine two items to make a new one, starting from Water, Fire, Earth and Wind: Water + Fire = Steam, Water + Earth = Plant, Fire + Earth = Lava, Lava + Water = Stone... Tap one item, then another, or drag one onto another. Some pairs make nothing.',
  how_to_win: 'Craft Chess (hint: you will need a Blade and a Knight).',
  frame: 'game',
  player_side: 'white',
  opponent: { name: 'Infinite Craft', rating: null, tagline: 'No opponent: a crafting sandbox.' },
  board: { files: 8, ranks: 8, light: '#ffffff', dark: '#ffffff' },
  game: { module: 'g4_craft', aspect: 0.82, controls: [] },
  source: { research: 'research/modes/-TKJGtBKK8U.json', confidence: 'high', notes: 'Recipe table invented around the items named in the video; the route to Chess follows the video.' }
});
