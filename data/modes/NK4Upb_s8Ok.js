/* Can I BEAT Shotgun King? [RANK 3]  Shotgun King: The Final Checkmate at Rank 3 (white gets one extra rook), with the
   Solomon shotgun: the lone black king steps or fires a pellet spread; white pieces have HP and move one per turn by
   normal chess rules; ending on an attacked square = death; kill the White King to clear a floor. He clears the run
   on one heart. Sources: research/modes/NK4Upb_s8Ok.json (rules, rank 3 handicap, card list), frames (pixel art,
   #f2e6ce/#8b86b8, threat markers, blast + shake). Logic in js/modes/g5_shotgun.js. PASS 2: the Shotgun King is the video's own sprite (tools/g5_sprites.py); white pieces use the
   standard set because no still shows the game's outline pieces cleanly enough to cut (see impl_5_report), blast/reload sounds, pellet cone VFX, Solomon/Victoria choice, card-pair draft, souls, hearts. */
CM.mode({
  id: 'NK4Upb_s8Ok',
  title: 'Can I BEAT Shotgun King? [RANK 3]',
  name: 'Shotgun King (Rank 3)',
  category: 'Variants & Games',
  description: 'You are the black king with a shotgun. Each turn either step one square (this reloads a shell) or fire: tap a white piece in a straight or diagonal line up to 4 squares away. Damage falls off with distance (3, 2, 1, 1) and the spread also hits the pieces beside the target. White pieces have HP (badge) and move one per turn like normal chess pieces; red-ringed squares are attacked and you can never end your turn on one. Rank 3: White has an extra rook.',
  how_to_win: 'Kill the White King on every floor. Pick a card pair after each floor; a lost floor costs one of 3 hearts.',
  player_side: 'black',
  player: { name: 'The Black King', rating: null, avatar: 'assets/modes/NK4Upb_s8Ok/shotgun_king_art.png' },
  opponent: { name: 'White Army (Rank 3)', rating: null, tagline: 'The terrible king must be stopped. +1 rook.' },
  board: { files: 8, ranks: 8, light: '#f2e6ce', dark: '#8b86b8' },
  theme: { background: '#1b1726' },
  pieces: {
    K: { name: 'King', moves: 'K', royal: true, castle: false, value: 0 },
    S: { name: 'Shotgun King', moves: '', gen: 'shotgun', royal: true, value: 0, img: 'assets/modes/NK4Upb_s8Ok/shotgun_king_art.png' }
  },
  setup: { fen: '4s3/8/8/8/8/8/1PPPPPP1/2B1K1N1', turn: 'b' },
  rules: { check: { w: 'none', b: 'standard' }, castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 3, time_ms: 650 },
  params: {
    ammo: 2, range: 4, fire: [3, 2, 1, 1], hearts: 3, guns: true,
    floors: [
      { name: 'The courtyard', fen: '4s3/8/8/8/8/8/1PPPPPP1/2B1K1N1' },
      { name: 'The hall', fen: '4s3/8/8/8/8/8/PPPPPPPP/1NB1KBN1' },
      { name: 'The barracks', fen: '4s3/8/8/8/8/8/PPPPPPPP/RNB1KBNR' },
      { name: 'The chapel', fen: '3s4/8/8/8/8/8/PPPPPPPP/RNBQKBNR' },
      { name: 'The armory', fen: '4s3/8/8/8/8/R6R/PPPPPPPP/RNBQKBNR' },
      { name: 'The throne (Rank 3: +1 rook)', fen: '4s3/8/8/8/8/R7/PPPPPPPP/RNBQKBNR' }
    ]
  },
  hooks: 'g5_shotgun',
  sounds: { blast: 'assets/modes/NK4Upb_s8Ok/blast.wav', reload: 'assets/modes/NK4Upb_s8Ok/reload.wav' },
  _deferred: ['12-floor run with irregular per-floor boards (holes) is cut to 6 floors on 8x8', 'card flip conditions (cards turning into their downside)'],
  source: { research: 'research/modes/NK4Upb_s8Ok.json', confidence: 'medium', notes: 'HP per piece, damage falloff and the floor armies are invented; the 12-floor run is cut to 4.' }
});
