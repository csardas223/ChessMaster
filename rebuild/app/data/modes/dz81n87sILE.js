/* Can I MASTER Earth Day Bots?  Normal chess against chess.com's five Earth Day bots in rising order (endangered and
   extinct animals that chat nature facts and trash talk). Sources: research/modes/dz81n87sILE.json (summary: Diana the
   Dodo 400, Tim the Turtle (rating not stated, ~800 inferred), Rhonda the Rhino 1350, Sunny the Snow Leopard 1750,
   Wallace the Mammoth 2000; Dodo line quoted in the transcript), green board. Other chat lines are original. */
CM.mode({
  id: 'dz81n87sILE',
  name: 'Earth Day Bots',
  category: 'Variants & Games',
  description: "Normal chess against the five Earth Day bots, one after another: Diana the Dodo, Tim the Turtle, Rhonda the Rhino, Sunny the Snow Leopard and Wallace the Mammoth. Each animal chats facts and trash talk while you play. Win to unlock the next bot.",
  how_to_win: 'Checkmate all five bots in order. Beating Wallace the Mammoth completes the set.',
  player_side: 'white',
  opponent: { name: 'Diana the Dodo', rating: 400, avatar: 'assets/avatars/bot.svg', tagline: 'Earth Day bot' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'auto', elo: 400, time_ms: 600 },
  params: {
    chance: 0.3,
    ladder: [
      { name: 'Diana the Dodo', rating: 400, tagline: 'Extinct since the 1600s.', lines: ['One reason I went extinct is because I never learned to fear humans.', 'Dodos could not fly. My pieces cannot either.', 'Mauritius was lovely before the ships came.'] },
      { name: 'Tim the Turtle', rating: 800, tagline: 'Slow and steady.', lines: ['Sea turtles can live for over 50 years. I can think about this move for that long.', 'Plastic bags look like jellyfish to me. Please recycle.', 'Slow and steady wins the race.'] },
      { name: 'Rhonda the Rhino', rating: 1350, tagline: 'Critically endangered, critically aggressive.', lines: ['My horn is made of keratin, just like your fingernails.', 'I can charge at 50 km per hour. Watch your king.', 'There are very few of us left. Show some respect.'] },
      { name: 'Sunny the Snow Leopard', rating: 1750, tagline: 'Ghost of the mountains.', lines: ['I can leap six times my body length.', 'You will not see me coming. Nobody does.', 'My tail keeps me warm and your position cold.'] },
      { name: 'Wallace the Mammoth', rating: 2000, tagline: 'Back from the ice age.', lines: ['I survived an ice age. I can survive your opening.', 'Woolly mammoths walked the Earth until about 4,000 years ago.', 'Climate change ended my kind. Do not let it end yours.'] }
    ]
  },
  hooks: 'g6_ladder',
  source: { research: 'research/modes/dz81n87sILE.json', confidence: 'high', notes: 'Bot chat lines (except the Dodo quote) and Tim the Turtle rating (~800) are inferred.' }
});
