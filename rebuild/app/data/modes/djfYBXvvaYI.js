/* Can I BEAT Villagers Chess?  chess.com variant 'Villagers Chess' (by Baqueano) in 1-minute games vs humans (~1500).
   Re-checked from the transcript (cm-recheck2 2026-11-25, analyze_video): 0:01 "the king is replaced by a royal pawn and two
   variant pieces are introduced. The soldier moves and captures straight ahead and the sergeants are pawns that move and capture
   forward and diagonally"; 0:24 "the royal pieces are not directly in front of each other ... my rook is looking directly at that
   royal pawn"; 1:24 "there's no queen here either"; 2:00 the royal pawn "is quite literally a pawn"; 5:10 "the round ones are
   soldiers"; 9:50 pawns "never move backwards"; 12:00 / 17:07 four wins. Start position = the video's still maxres1 (White:
   B Sgt N R RoyalPawn N Sgt B, eight soldiers on rank 2) and maxres2 (Black mirrored with royal pawn on d8 facing White's d1 rook),
   which match the variant's FEN4 on chess-variants.fandom.com/wiki/Villagers_Chess. Promotion to R/B/N (fandom: BKNR; the
   non-royal promoted King is left out). Art: soldier/sergeant cut from those stills (tools/recheck2_villagers_art.py), the
   royal pawn = the earlier fleur-de-lis badge crops. */
CM.mode({
  id: 'djfYBXvvaYI',
  title: 'Can I BEAT Villagers Chess?',
  name: 'Villagers Chess',
  category: 'Variants & Games',
  description: 'Your king is a royal pawn (fleur-de-lis badge) that moves and captures exactly like a pawn. Soldiers (round heads) move and capture one square straight ahead; Sergeants (pointed heads) move and capture one square forward or diagonally forward. No queen. The royal pawns do not face each other: each rook stares straight at the enemy royal pawn.',
  how_to_win: 'Checkmate the enemy royal pawn.',
  player_side: 'white',
  player: { name: 'You', rating: 1780, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'Delhy', rating: 1514, avatar: null, tagline: '1-minute Villagers Chess (game 2 of the video).' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7b9f59' },
  pieces: {
    K: { name: 'Royal pawn', moves: 'fmWfcFifmnD', royal: true, castle: false, value: 0,
         img: { w: 'assets/modes/djfYBXvvaYI/villager_w.png', b: 'assets/modes/djfYBXvvaYI/villager_b.png' } },
    O: { name: 'Soldier', moves: 'fWifmnD', value: 110, pawn: true, promote: true, promoteTo: ['R', 'B', 'N'],
         img: { w: 'assets/modes/djfYBXvvaYI/soldier_w.png', b: 'assets/modes/djfYBXvvaYI/soldier_b.png' } },
    S: { name: 'Sergeant', moves: 'fWfFifmnD', value: 200, pawn: true, promote: true, promoteTo: ['R', 'B', 'N'],
         img: { w: 'assets/modes/djfYBXvvaYI/sergeant_w.png', b: 'assets/modes/djfYBXvvaYI/sergeant_b.png' } }
  },
  setup: { fen: 'bsnkrnsb/oooooooo/8/8/8/8/OOOOOOOO/BSNRKNSB' },
  rules: { castling: false, enPassant: false, promotion: { choices: ['R', 'B', 'N'] } },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1514, depth: 3, time_ms: 500 },
  source: { research: 'research/modes/djfYBXvvaYI.json', confidence: 'high', notes: 'Rules from the transcript, start position from the video stills (matches the variant FEN4). Inferred: soldiers/sergeants double-step from their start square (chess.com default for pawn types), no en passant, promotion R/B/N (the non-royal promoted King of the real variant is left out); the royal pawn never promotes.' }
});
