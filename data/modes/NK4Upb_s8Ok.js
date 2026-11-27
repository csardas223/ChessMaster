/* Can I BEAT Shotgun King? [RANK 3]  Shotgun King: The Final Checkmate at Rank 3 (White gets one extra rook), with the
   Solomon shotgun: the lone black king steps (reloads) or fires a cone of pellets; white pieces have HP and move one per
   turn by normal chess rules; kill the White King to clear a floor; 11 floors and the boss floor (a humongous White King
   with 21 hearts) clear the rank. Sources: research/modes/NK4Upb_s8Ok.json, transcript (0:08 rank 3 = +1 rook, Solomon;
   card pairs read at 1:16, 2:51, 4:05, 5:30, 7:40, 9:10, 10:59, 12:44, 13:51, 15:36; 11:23 boss "humongous", 17:49 21
   hearts; 18:13 rank 3 cleared), frames (floor board with holes, card slots, POWER / RANGE / F.ARC panel).
   cm_acc 2026-11-26: moved from the old 6-floor 8x8 module (js/modes/g5_shotgun.js, invented cards, 3 player hearts the
   game does not have) onto the shared Shotgun King engine js/modes/g4_shotgun.js (12 floors with holes, the game's HUD,
   aim cone, Shotgun King Wiki white army) with params.cardSet 'rank3': the video's own card pairs and effects (souls,
   grenades, flips, extra turns, timed curses), boss floor. */
CM.mode({
  id: 'NK4Upb_s8Ok',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/9j7h5kF4X9s/title.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* the game's title card (same game) */
  title: 'Can I BEAT Shotgun King? [RANK 3]',
  name: 'Shotgun King (Rank 3)',
  category: 'Variants & Games',
  description: 'You are the black King with a shotgun. Each turn either step one square (this reloads a shell), or tap a white piece within range to blast a cone of pellets at it: everything in the cone takes damage (HP in red). White moves one piece per turn and captures you if you stand on a square it attacks (marked !). Kill the White King to clear the floor, then pick one of two card pairs from the video: your card plus the curse White gets with it. Killing a knight, bishop or rook stores its soul (SOUL button: one move like that piece); some cards give grenades (GRENADE button: a free throw that bounces and blasts 3x3). Rank 3: White has an extra rook.',
  how_to_win: 'Clear 11 floors and beat the boss on floor 12 (the White King with 21 hearts). One capture ends the run.',
  player_side: 'black',
  player: { name: 'The Black King', rating: null, avatar: 'assets/modes/NK4Upb_s8Ok/shotgun_king_art.png' },
  opponent: { name: 'The White Army (Rank 3)', rating: null, avatar: 'assets/modes/pzxXxIsKRRo/white_king.png', tagline: 'The terrible king must be stopped. +1 rook.' },
  board: { files: 8, ranks: 8, light: '#f2e6ce', dark: '#8b86b8' },
  theme: { background: '#1d2140', texture: { light: 'assets/modes/9j7h5kF4X9s/tile_light.png', dark: 'assets/modes/9j7h5kF4X9s/tile_dark.png' } },
  pieces: {   /* the game's white army sprites (Shotgun King Wiki, palette-mapped; shared with pzxXxIsKRRo / AvZiSnngZjA) */
    K: { name: 'King', moves: '', gen: 'skKing', royal: true, castle: false, value: 0, img: { w: 'assets/modes/pzxXxIsKRRo/wK.png' } },
    Q: { img: { w: 'assets/modes/pzxXxIsKRRo/wQ.png' } }, R: { img: { w: 'assets/modes/pzxXxIsKRRo/wR.png' } }, B: { img: { w: 'assets/modes/pzxXxIsKRRo/wB.png' } }, N: { img: { w: 'assets/modes/pzxXxIsKRRo/wN.png' } }, P: { img: { w: 'assets/modes/pzxXxIsKRRo/wP.png' } }
  },
  setup: { fen: '4k3/8/8/8/8/8/8/4K3', turn: 'b' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 400 },
  bot: { engine: 'search', depth: 2, time_ms: 550 },   /* 4:00 "the AI on rank three isn't all that powerful" */
  params: { rank: 3, floors: 12, boss: 21, cardSet: 'rank3', kingImg: 'assets/modes/NK4Upb_s8Ok/shotgun_king_art.png' },
  hooks: 'g4_shotgun',
  sounds: { explosion: 'assets/modes/NK4Upb_s8Ok/blast.wav', blast: 'assets/modes/NK4Upb_s8Ok/blast.wav', reload: 'assets/modes/NK4Upb_s8Ok/reload.wav' },
  source: { research: 'research/modes/NK4Upb_s8Ok.json', confidence: 'medium', notes: 'cm_acc 2026-11-26: card names, pairs, order and texts from the transcript; the player has no hearts (one capture ends the run; the spec summary\'s "one heart left" was the boss\'s). Inferred: HP values, cone, damage falloff and floor armies (shared engine); grenade bounce (0-1 square, deterministic per ply) and 3x3 blast (3 damage, 2 after Philanthropy, as the 8:44 "two hearts of damage for everybody"); Night Bane\'s blade as a step-capture of a piece with 3 HP or less; Golden Aging\'s targets; the unread curses (Majestic Censer / Subtle Poison pair has none read, floor 8\'s second offer repeats Extra Barrel); Royal Vigor is a placeholder name for the unread Desperado curse. Not modelled: piece "intends to move" telegraphs, -1 speed, bishop healing, Tag Team swaps, piercing (the cone already hits every piece in it), Solomon vs Victoria stats, the intro cutscene. sprite-fix2 2026-11-25: shotgun_king_art.png is a COMPOSITE of the Shotgun King Wiki Black King sprite https://static.wikia.nocookie.net/shotgun-king/images/9/95/Black_King.png + Royal Shotgun sprite https://shotgun-king.fandom.com/wiki/Black_King (File:Royal_Shotgun.png), transparent 512px.' }
});
