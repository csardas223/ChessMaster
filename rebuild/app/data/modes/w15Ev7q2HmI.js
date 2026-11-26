/* Chess, but there are landmines... Best of three vs Angela, the developer of the Landmine Chess site (plays as
   "BOOM", 1560), on its lavender board with a blitz clock. Before each game both sides hide 3 landmines: White on
   ranks 3-4, Black on ranks 5-6. Any piece of either colour that lands on a mine explodes and is removed, leaving a
   crater (the square stays playable). Mines are hidden from the opponent; your own show as red X marks. Shared logic:
   js/modes/g1_mines.js.
   Sources: research/modes/w15Ev7q2HmI.json (transcript: ranks 3-4 / 5-6, Angela blows up her own pawn on g5, games
   won on time ~7:39 and ~21:17), frames visual_* (lavender #dedeea/#967eba, red X marks, burnt crater, "BOOM" 1560).
   Inferred: a king that explodes loses (unverified); clock 5+0; the bot remembers its own mines and avoids them. */
CM.mode({
  id: 'w15Ev7q2HmI',
  name: 'Landmine Chess',
  category: 'Powerups & Rule Twists',
  description: 'Before each game, tap 3 empty squares on ranks 3-4 to hide your landmines; Angela hides 3 on ranks 5-6. Any piece that lands on a mine, either colour, explodes and leaves a crater. Squares a piece has crossed safely are clear. Best of three, blitz clock.',
  how_to_win: 'Checkmate or flag Angela. Win two games out of three.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Angela', rating: 1560, avatar: null, tagline: 'Made the Landmine Chess site. Plays as BOOM.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#dedeea', dark: '#967eba', background: '#1f1b2b' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 300, b: 300, inc: 0, bot: true },
  bot: { engine: 'search', elo: 1560, depth: 3, time_ms: 600 },
  params: { mines: 3, playerRanks: [3, 4], botMines: true, botRanks: [5, 6], destroy: false, bestOf: 3,
    mineImg: 'assets/modes/w15Ev7q2HmI/x.png', botMineImg: 'assets/modes/w15Ev7q2HmI/mine.png', craterImg: 'assets/modes/w15Ev7q2HmI/crater.png' },
  sounds: { flag: 'assets/modes/w15Ev7q2HmI/flag.wav' },
  hooks: 'g1_mines',
  source: { research: 'research/modes/w15Ev7q2HmI.json', confidence: 'medium', notes: 'Exploding king loses (unverified); 5+0 clock inferred. blurry-b 2026-11-26: x.png (player mine marker) redrawn as a clean vector X in the video colours (red #e11d38 core, pink #f08caa rim), 512px transparent; the video crop was only a blurred glow.' }
});
