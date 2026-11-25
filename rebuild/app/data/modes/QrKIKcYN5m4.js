/* Can I BEAT Stone Gravitation?  chess.com variant 'Stone Gravitation' (formerly 'Locked', by RALRAL3333, March 2019):
   standard chess rules from a locked custom start position, Red (moves first) vs Yellow on the grey variants board.
   Sources: transcript QrKIKcYN5m4 (0:01 'each side fights to open the position', 0:12 red moves first, 3:35 promotion
   to a queen allowed, sacrifice-heavy 'Houdini' openings), start FEN from the variant's own tournament page
   chess.com/tournament/locked-custom-position ('6nk/3p2pr/p2Pp1pb/p2pP1p1/Pp1Pp1P1/1P1pP3/NR1P4/KNB5 w'), frames
   maxres1/maxres2 (red king in the corner with knights/bishop/rook around it, matches). Game 1 of the video: we are Red. */
CM.mode({
  id: 'QrKIKcYN5m4',
  title: 'Can I BEAT Stone Gravitation?',
  name: 'Stone Gravitation',
  category: 'Variants & Games',
  description: 'Stone Gravitation (chess.com variant): normal chess rules, but both armies start locked in a maze of interlocked pawns, king boxed in a corner by its own knights, bishop and rook. Red moves first. Sacrifice pieces to free your army, then break through with a pawn or mate a still-trapped king. Pawns promote as usual.',
  how_to_win: 'Checkmate the yellow king (or promote and convert).',
  player_side: 'white',
  player: { name: 'You', rating: 1765, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'ilikecheese', rating: 1583, avatar: 'assets/modes/QrKIKcYN5m4/opponent.png' /* chess.com bar avatar from the video still */, tagline: 'Stone Gravitation opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#DBDBDB', dark: '#ACACAC' },
  setup: { fen: '6nk/3p2pr/p2Pp1pb/p2pP1p1/Pp1Pp1P1/1P1pP3/NR1P4/KNB5', turn: 'w' },   /* the variant's start position (chess.com tournament 'locked-custom-position') */
  rules: { castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'auto', elo: 1583 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/QrKIKcYN5m4/caged_king.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  vfx_timeline: [{ trigger: 'ply:16', once: true, effect: { type: 'overlay', at: 'board', image: 'assets/modes/QrKIKcYN5m4/meme.jpg', fit: 'contain', duration_ms: 1800 } }],   /* the meme clip he overlays on the board (cut from the video still; the moment it plays is inferred) */
  hooks: {
    /* Red (us, White in the engine: moves first, king a1) and Yellow (king h8), both drawn from the white set and
       tinted per square so promoted pieces keep their army colour (frames maxres1/maxres2) */
    init: function () { if (document.getElementById('g5-sg-css')) return; var s = document.createElement('style'); s.id = 'g5-sg-css';
      s.textContent = '.g5sg-r .pc{filter:sepia(1) saturate(6) hue-rotate(-38deg) brightness(.9)}.g5sg-y .pc{filter:sepia(1) saturate(7) hue-rotate(5deg) brightness(1.05)}'; document.head.appendChild(s); },
    decorate: function (ctx, sq, p) { return p ? { cls: p.c === 'w' ? 'g5sg-r' : 'g5sg-y', img: CM.settings.pieceUrl('w', p.t) } : null; },
    stockfishOk: true
  },
    source: { research: 'research/modes/QrKIKcYN5m4.json', confidence: 'high', notes: 'Rules = standard chess (chess.com variant, no special rule; the name describes the locked position). Start FEN from the variant\'s tournament page. Player plays Red as in game 1 of the video.' }
});
