/* Can I CONQUER Roblox Chess?  Normal rated chess inside the Roblox experience "Roblox Chess" (3D tables in a lobby, VS splash, a 2D board
   you can pop open). m3-salvage 2026-11-26 (accuracy_audit P1): was a legacy gauntlet fallback with no Roblox look.
   Sources: research/modes/ls3U1YKj9As.json, transcript (analyze_video 2026-11-26): 0:01 goal = top 10 on the bullet
   leaderboard (above ~1456), 0:20 a subscriber first (+38 = "12 something"), 2:00 an open challenge 1350 at 1+1 and three
   rematches (game 3 Black), 8:40 rated 1423, 9:30 Koala Guy (Black); frames: VS splash Chip131213 vs mo_waffles, rating overlay 1430/1460.
   Real-3D Roblox table view shared with EqOwqolOZOo (js/fx/view3d.js 'robloxTable'); no WebGL = the 2D board. */
CM.mode({
  id: 'ls3U1YKj9As',
  title: 'Can I CONQUER Roblox Chess?',
  name: 'Roblox Chess: Conquer',
  category: 'Variants & Games',
  description: 'Chess Club on Roblox Chess: climb the bullet ladder (1+1) at the lobby tables, farming the highest-rated player in the lobby for rematches, until you crack the top 10 of the bullet leaderboard.',
  how_to_win: 'Checkmate or flag the Roblox player. Goal: climb onto the bullet top 10 (~1456).',
  player_side: 'white',
  player: { name: 'mo_waffles', rating: 1190, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* mo_waffles = the narrator's Roblox name on both VS splashes (inferred) */
  opponent: { name: 'Subscriber', rating: null, avatar: null, tagline: 'Game 1: a subscriber met in the lobby.' },
  params: { series: { boxes: 5, opponents: [{ name: 'Subscriber', rating: null, avatar: null }, { name: 'Chip131213', rating: 1350, avatar: null }, { name: 'Chip131213', rating: 1350, avatar: null }, { name: 'Chip131213', rating: 1350, avatar: null }, { name: 'Koala Guy', rating: null, avatar: null }] } },
  board: { files: 8, ranks: 8, light: '#c8a878', dark: '#7a5a3a' },
  clock: { w: 60, b: 60, inc: 1 },
  bot: { engine: 'search', elo: 1350, depth: 3, time_ms: 450 },
  hooks: {
    onStart: function (ctx) { CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'robloxTable'); }).catch(function (e) { console.warn(e); }); },
    onExit: function () { if (CM.view3d) CM.view3d.detach(); }
  },
  source: { research: 'research/modes/ls3U1YKj9As.json', confidence: 'medium', notes: 'Ratings, clock 1+1 and game order from the transcript. The 1350 rematch opponent is taken to be Chip131213 from the VS splash frame (inferred); the starting rating ~1190 is inferred from "+38, rated 12 something". Board colours estimated from the frames (3D brown board).' }
});
