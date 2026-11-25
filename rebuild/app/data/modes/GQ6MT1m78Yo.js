/* Can I BEAT Martin's Family? Gauntlet vs the Martin family bots with their chat lines.
   Sources: research/modes/GQ6MT1m78Yo.json (transcript quotes), frames: Martin XIII (1800). */
CM.mode({
  id: "GQ6MT1m78Yo",
  name: "Martin's Family",
  category: "Variants & Games",
  description: "Play every bot in Martin's family in order: Martin M. Martin (250), Martin Jr. (500), Marty the dog (1350), baby Martin XIII (1800) and Martina (3250). Each has their own lines.",
  how_to_win: "Checkmate the whole family, ending with Martina.",
  player_side: "white",
  opponent: { avatar: 'assets/modes/GQ6MT1m78Yo/opponent.png' },
  board: {"files": 8, "ranks": 8, "light": "#eeeed2", "dark": "#769656"},
  params: {"ladder": [{"name": "Martin M. Martin", "rating": 250, "hello": "I love playing chess, win or lose!", "chat": ["Oops!", "Do you want my queen?", "Chess is fun!"], "win": "Good game, friend!"}, {"name": "Martin Jr.", "rating": 500, "hello": "I'm just like my dad, except I'm good at making friends.", "chat": ["Watch this!", "My dad taught me that."]}, {"name": "Marty", "rating": 1350, "tagline": "Martin's dog. Gives puppy eyes.", "hello": "Woof!", "chat": ["Woof!", "*puppy eyes*", "Arf arf!"]}, {"name": "Martin XIII", "rating": 1800, "tagline": "The baby.", "hello": "I might not know my shapes and colors yet, but I can already beat my dad.", "chat": ["Goo goo.", "Waaah!"], "win": "Waaaah!"}, {"name": "Martina", "rating": 3250, "hello": "You must be Martin's best friend.", "chat": ["Your queen will look dashing in my trophy case, next to my Nobel Prize in physics.", "Predictable."], "lose": "Do tell Martin I said hello."}]},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/GQ6MT1m78Yo/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: "g5_ladder",
  source: {"notes": "Quotes from the transcript; extra chat lines are original.", "research": "research/modes/GQ6MT1m78Yo.json", "confidence": "high"}
});
