/* Can I BEAT Shotgun King? [RANK 2]  Shotgun King: The Final Checkmate (Steam roguelike) at Rank 2: you are a black king
   who either steps one square or fires a shotgun instead of moving; white chess pieces hunt you and kill you if they can
   capture you. Kill the white king to clear the floor. Sources: research/modes/pzxXxIsKRRo.json (Rank 2 difficulty,
   floors 5/7 visible, cards between floors), frames (#f6eac6/#968aba).
   impl-6a pass 2 (2026-11-25): the pass-1 single-target shot is replaced by the shared Shotgun King engine
   js/modes/g4_shotgun.js (group 4 lib, used read-only): click a target to fire a cone of pellets (red aim cone on hover,
   muzzle flash + sparks), pieces have HP, shells/reload, escalating floors with holes, upgrade card for you + curse card
   for White between floors, HUD with the game's tiles/card faces. params.rank 2 (the lib only adds a pawn from rank 4; the video does not show what Rank 2 changes).
   Art: this video's own shotgun king avatar + Shotgun King title card (research sprites); white army = the game's own
   sprites (art-g6c frame cuts, then art-audit: Shotgun King Wiki, see pieces). Shot sound is the app's synthesised explosion. */
CM.mode({
  id: 'pzxXxIsKRRo',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/pzxXxIsKRRo/shotgun_card.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],
  title: 'Can I BEAT Shotgun King? [RANK 2]',
  name: 'Shotgun King (Rank 2)',
  category: 'Variants & Games',
  description: 'You are the black King with a shotgun. Each turn either step one square (you cannot capture by moving), or tap a white piece within range to blast a cone of pellets at it: everything in the cone takes damage (pieces have HP shown in red). Shooting uses a shell; stepping reloads one. White moves one piece per turn and captures you if you stand on a square it attacks (marked !). Kill the White King to clear the floor, then take an upgrade card while White draws a curse. Each floor brings a bigger white army.',
  how_to_win: 'Kill the White King on every floor (12 floors).',
  player_side: 'black',
  player: { name: 'Shotgun King', rating: null, avatar: 'assets/modes/pzxXxIsKRRo/shotgun_king.png' },
  opponent: { name: 'The White Army', rating: null, avatar: 'assets/modes/pzxXxIsKRRo/white_king.png' /* art-audit: the game's White King (Shotgun King Wiki White_King.png) instead of initials */, tagline: 'Rank 2: a bigger army every floor.' },
  board: { files: 8, ranks: 8, light: '#f6eac6', dark: '#968aba' },
  theme: { background: '#1d2140', texture: { light: 'assets/modes/9j7h5kF4X9s/tile_light.png', dark: 'assets/modes/9j7h5kF4X9s/tile_dark.png' }  /* app-relative; CM.util.cssUrl resolves it against the page */ },
  pieces: {
    /* art-g6c: white army cut from frames 111 / 1017 (tools/g6c_art.py job shotgun); black king keeps the lib KING image (hook decorate).
       art-audit 2026-11-25: the white queen is on no frame of this video (6:01-7:12 and every 30 s to 29:50 checked), so the
       whole white set now comes from the Shotgun King Wiki piece sprites (the game's own 16-px art at 10x, same art as the video),
       palette-mapped 1:1 to the video's cream/navy/lavender (tools/audit_sk_wiki.py; research/frames/sprites_web/). */
    K: { name: 'King', moves: '', gen: 'skKing', royal: true, castle: false, value: 0, img: { w: 'assets/modes/pzxXxIsKRRo/wK.png' } },
    N: { img: { w: 'assets/modes/pzxXxIsKRRo/wN.png' } }, B: { img: { w: 'assets/modes/pzxXxIsKRRo/wB.png' } }, R: { img: { w: 'assets/modes/pzxXxIsKRRo/wR.png' } }, Q: { img: { w: 'assets/modes/pzxXxIsKRRo/wQ.png' } }, P: { img: { w: 'assets/modes/pzxXxIsKRRo/wP.png' } }
  },
  setup: { fen: '4k3/8/8/8/8/8/8/4K3', turn: 'b' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 400 },
  bot: { engine: 'search', depth: 2, time_ms: 550 },
  params: { rank: 2, floors: 12 },
  hooks: { extends: 'g4_shotgun', afterMove: function (ctx, m, info) {
    /* art-g6c: muzzle flash + ejected shells cut from the 3:59 shot (frame 239, tools/g6c_art.py job shotfx) */
    if (m.shoot) ctx.fx({ type: 'overlay', at: ctx.name(m.f), image: 'assets/modes/pzxXxIsKRRo/muzzle.png', fit: 'contain', duration_ms: 300 });
    return this._base.afterMove.call(this, ctx, m, info);
  } },
  source: { research: 'research/modes/pzxXxIsKRRo.json', confidence: 'medium', notes: 'HP values, cone width, damage falloff and card effects are inferred (shared with group 4 Shotgun King modes); white army K/Q/R/B/N/P = the game sprites from the Shotgun King Wiki (https://static.wikia.nocookie.net/shotgun-king/images/{1/1d/King,a/ab/Queen,1/1b/Rook,f/f0/Bishop,6/6b/Knight,f/f4/Pawn}.png, CC-BY-SA), recoloured to the video palette; opponent avatar = the wiki White King art (https://static.wikia.nocookie.net/shotgun-king/images/3/3c/White_King.png) on the video lavender; muzzle flash from frame 239. blurry-b 2026-11-26: the white piece sprites (wK wQ wR wB wN wP) and muzzle.png are exact 8px-grid pixel art; scaled up 4x (muzzle 5x) nearest-neighbour so they are 512px+ with identical pixels, no resampling blur, same layout for every piece.' }
});
