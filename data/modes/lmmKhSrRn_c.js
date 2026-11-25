/* Can I BEAT Explosive Magic?  chess.com variant 'Explosive Magic' (by BN1208) vs humans up to CzarnyRes (~1930).
   Re-checked from the transcript (cm-recheck2 2026-11-25, analyze_video): 0:01 "combines atomic chess where pieces except for
   pawns explode when they are captured, king of the hill where placing the king in the middle four squares wins the game and spell
   chess where you can freeze 3 by 3 areas of the board"; 0:17 "the dragon bishop which moves like a bishop and a knight that can't
   jump, a general which moves like a king and a knight and a dragon knight which is a knight that just can't jump"; 2:19-2:34 a
   frozen king in check with no capture of the checker is checkmate; 5:13 spells have a three-turn cooldown; 7:24 "four spells
   left" (5 freezes each, no jump spell); 11:57 / frame text "pawns promote on the rank directly behind the hill"; 17:11 castling.
   Board = 10x10 (stills maxres2/maxres3), start position from the variant's FEN4 (chess-variants.fandom.com/wiki/Explosive_Magic):
   R DragonKnight B DragonBishop General K DragonBishop B DragonKnight R, ten torpedo pawns (double step from any square),
   promotion to Bishop / Knight / Alfil / Dabbaba ("BINS") on the 7th rank, hill e5 f5 e6 f6. Art: General + Dragon Knight cut
   from maxres2 (tools/recheck2_explosive_art.py); the Dragon Bishop never shows on a still, so it is a bishop with a DB badge. */
CM.mode({
  id: 'lmmKhSrRn_c',
  title: 'Can I BEAT Explosive Magic?',
  name: 'Explosive Magic',
  category: 'Variants & Games',
  description: 'Atomic + King of the Hill + Spell Chess on a 10x10 board. Every capture explodes the 3x3 area around it (pawns survive the blast). Walk your king onto the four centre squares to win. Each side has five Freeze spells (freeze a 3x3 area for one turn, three-turn cooldown). New pieces: Dragon Bishop (bishop + knight that cannot jump), General (king + knight), Dragon Knight (knight that cannot jump). Pawns can always step two squares and promote on the rank right behind the hill.',
  how_to_win: 'Checkmate or blow up the enemy king, or get your king onto the hill.',
  player_side: 'white',
  player: { name: 'You', rating: 1680, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'CzarnyRes', rating: 1928, avatar: null, tagline: 'The strongest Explosive Magic player in the video.' },
  board: { files: 10, ranks: 10, light: '#ecf3d1', dark: '#7ba059',
    squares: { e5: { image: 'assets/modes/lmmKhSrRn_c/hill.png', opacity: 0.85 }, f5: { image: 'assets/modes/lmmKhSrRn_c/hill.png', opacity: 0.85 },
               e6: { image: 'assets/modes/lmmKhSrRn_c/hill.png', opacity: 0.85 }, f6: { image: 'assets/modes/lmmKhSrRn_c/hill.png', opacity: 0.85 } } },
  pieces: {
    P: { name: 'Pawn', moves: 'fmWfmnDfcF', value: 100, pawn: true, promote: true },
    H: { name: 'Dragon Knight', moves: 'nN', value: 280, img: { w: 'assets/modes/lmmKhSrRn_c/horse_w.png', b: 'assets/modes/lmmKhSrRn_c/horse_b.png' } },
    Y: { name: 'Dragon Bishop', moves: 'BnN', value: 650, glyph: 'B', badge: 'DB' },
    Z: { name: 'General', moves: 'KN', value: 650, img: { w: 'assets/modes/lmmKhSrRn_c/general_w.png', b: 'assets/modes/lmmKhSrRn_c/general_b.png' } },
    T: { name: 'Alfil', moves: 'A', value: 150, glyph: 'B', badge: 'AL' },
    O: { name: 'Dabbaba', moves: 'D', value: 150, glyph: 'R', badge: 'DA' }
  },
  setup: { fen: 'rhbyzkybhr/pppppppppp/10/10/10/10/10/10/PPPPPPPPPP/RHBYZKYBHR' },
  rules: { check: 'standard', enPassant: false, atomic: true,
    promotion: { choices: ['B', 'N', 'T', 'O'], zone: 4 },
    win: [{ type: 'checkmate' }, { type: 'reach', squares: 'e5 f5 e6 f6', piece: 'K', why: 'king of the hill' }] },
  bot: { engine: 'search', elo: 1928, depth: 3, time_ms: 600 },
  hooks: 'g6_spellc',
  params: { jump: 0, freeze: 5, cooldown: 3, botFreeze: 0.35 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/lmmKhSrRn_c/potion.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }, { trigger: 'capture', effect: { type: 'explosion', at: 'to', radius: 1 } }],
  source: { research: 'research/modes/lmmKhSrRn_c.json', confidence: 'high', notes: 'Rules from the transcript, board/start position from the stills + the variant FEN4. Inferred: castling uses the engine\'s generic two-square king step (the video only shows that castling exists), no en passant with torpedo pawns, no clock (the video\'s time control is not stated), which letters of BINS are Alfil/Dabbaba (the variant lists those pieces only as promotion types). Dragon Bishop art: no still shows one.' }
});
