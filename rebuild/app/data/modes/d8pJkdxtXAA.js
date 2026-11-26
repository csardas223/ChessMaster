/* Can I BEAT Hyper Chess?  Hyper Chess (Steam): real-time chess with no turns, a MOVES meter, pieces that travel and
   can be intercepted mid-path; king capture wins, castling unavailable. He plays online games (e.g. vs 'Clob') and
   wins 3 of 5. Sources: research/modes/d8pJkdxtXAA.json (transcript 00:00:01 rules, frames: white/green 3D board on a
   blue grid, MOVES bar). Real-time play, the MOVES meter and the match live in js/modes/g5_realtime.js. */
CM.mode({
  id: 'd8pJkdxtXAA',
  title: 'Can I BEAT Hyper Chess?',
  name: 'Hyper Chess',
  category: 'Variants & Games',
  description: 'No turns: you and your opponent move whenever you like. Each move uses one bar of your MOVES meter, which refills over time. There is no check and no castling: the king is simply captured like any other piece, so watch every attack on it.',
  how_to_win: 'Capture the enemy king. Win 3 games of the 5-game match.',
  player_side: 'black',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Clob', rating: null, tagline: 'Online Hyper Chess player.' },
  board: { files: 8, ranks: 8, light: '#d8dde0', dark: '#356b39' },   /* the 3D board's white and green squares (maxres2) */
  theme: { background: '#64acd2' },                                     /* the arena's blue grid (image set by the hook) */
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none', castling: false, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 2, time_ms: 350, min_ms: 200 },
  params: { games: 5, need: 3, reward: 75, rtMode: 'hyper', rt: { meter: 4, refill_ms: 1600, bot_ms: [1300, 2600] }, bgImage: 'assets/modes/d8pJkdxtXAA/grid.jpg' },
  messages: { win_title: 'You Win! +$75' },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/d8pJkdxtXAA/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ },
        { type: 'overlay', at: 'board', image: 'assets/modes/d8pJkdxtXAA/logo.jpg', fit: 'contain', delay_ms: 1700, duration_ms: 1500, id: 'g5logo' /* the HYPER CHESS logo from the game menu (maxres1) */ }],
  hooks: { extends: 'g5_realtime',   /* ov-3d: real-3D view of the video's game (js/fx/view3d.js on CM.scene3d) wraps the unchanged rules; no WebGL = 2D board */
    onStart: function (ctx) { if (this._base.onStart) this._base.onStart.call(this, ctx); CM.util.loadScript('js/fx/view3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.view3d.attach(ctx, 'hyper'); }).catch(function (e) { console.warn(e); }); },
    onExit: function (ctx) { if (CM.view3d) CM.view3d.detach(); if (this._base.onExit) this._base.onExit.call(this, ctx); } },
  source: { research: 'research/modes/d8pJkdxtXAA.json', confidence: 'high',
    notes: 'Real time: the bot moves every 1.3-2.6 s on its own, you move whenever your 4-bar MOVES meter has charge (1 bar back every 1.6 s; meter size read from the "4 MOVES" bar in the frames, refill rate inferred). Pieces use the standard 2D set: the 3D models in the stills overlap each other and cannot be cut cleanly. Not reproduced: intercepting a piece mid-path, the knight flying-away capture animation (no video source in the sandbox: yt-dlp blocked); win sound = our own synthesised game-end sound (owner 2026-11-24 11:41 PM: no audio extraction). Reward per win simplified to $75.' }
});
