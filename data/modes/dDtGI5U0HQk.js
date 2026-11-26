/* Can I COMEBACK Roblox Chess?  Normal rated chess inside the Roblox experience "Roblox Chess" (3D tables in a lobby, VS splash, a 2D board
   you can pop open). m3-salvage 2026-11-26 (accuracy_audit P1): was a legacy gauntlet fallback with no Roblox look.
   Sources: research/modes/dDtGI5U0HQk.json, transcript (analyze_video 2026-11-26): 0:10 rating 1486, needs ~1540 to get back on the leaderboard, 0:30 rated bullet open challenge, 0:40 White vs a ~1000, 1:20 a subscriber rated 1444 (White again, rematches), 8:10 1552 = ninth place.
   Real-3D Roblox table view shared with EqOwqolOZOo (js/fx/view3d.js 'robloxTable'); no WebGL = the 2D board. */
CM.mode({
  id: 'dDtGI5U0HQk',
  title: 'Can I COMEBACK Roblox Chess?',
  name: 'Roblox Chess: Comeback',
  category: 'Variants & Games',
  description: 'You fell off the Roblox Chess bullet leaderboard (1486). Play rated 1-minute games at the tavern tables (open challenges, rematches) and climb back to about 1540.',
  how_to_win: 'Checkmate or flag the Roblox player. Goal: climb from 1486 back onto the leaderboard (~1540).',
  player_side: 'white',
  player: { name: 'mo_waffles', rating: 1486, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* mo_waffles = the narrator's Roblox name on both VS splashes (inferred) */
  opponent: { name: 'Roblox player', rating: 1000, avatar: null, tagline: 'Game 1: a thousand-rated opponent.' },
  params: { series: { boxes: 4, opponents: [{ name: 'Roblox player', rating: 1000, avatar: null }, { name: 'Subscriber', rating: 1444, avatar: null }, { name: 'Subscriber', rating: 1444, avatar: null }, { name: 'Subscriber', rating: 1444, avatar: null }] } },
  board: { files: 8, ranks: 8, light: '#a27e5b', dark: '#4d330f' },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1300, depth: 3, time_ms: 450 },
  hooks: {
    onStart: function (ctx) { CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'robloxTable'); }).catch(function (e) { console.warn(e); }); },
    onExit: function () { if (CM.view3d) CM.view3d.detach(); }
  },
  source: { research: 'research/modes/dDtGI5U0HQk.json', confidence: 'medium', notes: 'Ratings and order from the transcript (names not spoken; subscriber rated 1444 plays the rematches). Bullet clock taken as 1+0 (inferred). Board colours sampled from the frames (wooden board).' }
});
