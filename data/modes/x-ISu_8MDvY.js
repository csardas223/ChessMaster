/* Can I BEAT GM Ben Finegold?  Not a variant: a 6-round 5+0 blitz arena hosted by GM Ben Finegold on chess.com, played to get
   paired with him (cm-recheck3 2026-11-25, transcript via analyze_video): 0:01 "a tournament hosted by Grandmaster Ben Finegold
   in an attempt to play him and possibly win", 0:10 six rounds, time control 5. Rounds: 1 vs ~1300 (White, d4 London, mate, 2:58),
   2 vs ~1500 (Black, won 9:07), 3 vs ~1500 (White, won 15:04), 4 vs ~1900 (won 20:34, 4/4), 5 vs GM Ben Finegold "2700 rated"
   (White, London, lost on a mating attack ~26:20), 6 vs ~1800 (Black, lost 31:02); 4th place on tie-break (31:27).
   Opponent names from the frames (SacToTheFuture 1323, player1245763 1589); the others are not shown. Finegold's portrait is the
   video's own thumbnail sprite (research/frames/sprites/x-ISu_8MDvY_ben_finegold.png). The rounds rotate per game through
   params.series; you always play White here (the video alternates colours: not modelled). */
CM.mode({
  id: 'x-ISu_8MDvY',
  title: 'Can I BEAT GM Ben Finegold?',
  name: 'Finegold Arena (5+0)',
  category: 'Other Videos',
  description: 'A six-round 5-minute blitz tournament hosted by GM Ben Finegold. Normal chess. Each new game is the next round, as in the video: a 1300, a 1500, another 1500, a 1900, then GM Ben Finegold himself (2700), then an 1800.',
  how_to_win: 'Win your rounds and beat GM Ben Finegold in round five.',
  player_side: 'white',
  player: { name: 'You', rating: 2127, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'SacToTheFuture', rating: 1323, elo: 1323, avatar: null, tagline: 'Round 1 of 6' },
  board: { files: 8, ranks: 8, light: '#ebeed0', dark: '#759f56' },
  clock: { w: 300, b: 300, inc: 0, bot: true },
  bot: { engine: 'auto', time_ms: 700 },
  params: { series: { opponents: [
    { name: 'SacToTheFuture', rating: 1323, elo: 1323, avatar: null, tagline: 'Round 1 of 6' },
    { name: 'player1245763', rating: 1589, elo: 1589, avatar: null, tagline: 'Round 2 of 6' },
    { name: 'Round 3 opponent', rating: 1500, elo: 1500, avatar: null, tagline: 'Round 3 of 6 (2/2 so far)' },
    { name: 'Round 4 opponent', rating: 1900, elo: 1900, avatar: null, tagline: 'Round 4 of 6' },
    { name: 'GM Ben Finegold', rating: 2700, elo: 2700, avatar: 'assets/modes/x-ISu_8MDvY/finegold.png', tagline: 'Round 5: the host' },
    { name: 'Round 6 opponent', rating: 1800, elo: 1800, avatar: null, tagline: 'Round 6 of 6' }
  ] } },
  source: { research: 'research/modes/x-ISu_8MDvY.json', confidence: 'high', notes: 'cm-recheck3: transcript gives the format (6 rounds, 5+0), the ratings and results; frames give two opponent names and the chess.com green board. Round 3/4/6 opponent names not shown (placeholders). Colours per round not modelled (you are always White).' }
});
