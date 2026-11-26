/* Can I SURVIVE Roblox Chess?  Normal rated chess inside the Roblox experience "Roblox Chess" (3D tables in a lobby, VS splash, a 2D board
   you can pop open). m3-salvage 2026-11-26 (accuracy_audit P1): was a legacy gauntlet fallback with no Roblox look.
   Sources: research/modes/vcMhd5Vd1mM.json, transcript (analyze_video 2026-11-26): 0:01 goal three wins, 0:51 rating 1539, 1:40 "anyone rated one minute", 2:11-2:21 White vs a 1629, rematches with the same opponent (game 2 Black, game 3 White), 14:11 three wins.
   Real-3D Roblox table view shared with EqOwqolOZOo (js/fx/view3d.js 'robloxTable'); no WebGL = the 2D board. */
CM.mode({
  id: 'vcMhd5Vd1mM',
  title: 'Can I SURVIVE Roblox Chess?',
  name: 'Roblox Chess: Survive',
  category: 'Variants & Games',
  description: 'Back to Roblox Chess for 1-minute rated games at a lobby table. The opponent (1629) keeps asking for rematches. Win three games.',
  how_to_win: 'Checkmate the Roblox player or flag them. Goal: three wins.',
  player_side: 'white',
  player: { name: 'mo_waffles', rating: 1539, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* mo_waffles = the narrator's Roblox name on both VS splashes (inferred) */
  opponent: { name: 'check_zeejay', rating: 1629, avatar: null, tagline: 'Accepts every rematch.' },
  params: { series: { boxes: 3, opponents: [{ name: 'check_zeejay', rating: 1629, avatar: null }] } },
  board: { files: 8, ranks: 8, light: '#c8a878', dark: '#7a5a3a' },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1629, depth: 3, time_ms: 450 },
  hooks: {
    onStart: function (ctx) { CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'robloxTable'); }).catch(function (e) { console.warn(e); }); },
    onExit: function () { if (CM.view3d) CM.view3d.detach(); }
  },
  source: { research: 'research/modes/vcMhd5Vd1mM.json', confidence: 'medium', notes: 'Opponent name from the VS splash frame (mo_waffles vs check_zeejay; which side is the narrator is inferred from ls3U1YKj9As, where mo_waffles also appears), rating 1629 and 1+0 from the transcript; board colours estimated from the frames (3D brown board); no clean avatar sprite (the hamster crop has the lobby baked in).' }
});
