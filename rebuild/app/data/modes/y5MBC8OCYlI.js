/* Can I BEAT Cornered Kings?  Yellow vs red on an irregular board: both kings start in a walled pocket on the left,
   apart from the main army, which stands on an 8-file area to the right. Sources: research/modes/y5MBC8OCYlI.json
   (LOW confidence: transcript failed), frames visual (~12x8 with stone walls and a left alcove; yellow/red recoloured
   chess.com set; explainer shows normal knight and pawn moves). Our layout: an 11x8 board, files a-b are the king
   pockets (a1/b1 area for Yellow, a8/b8 for Red), stone walls on files a-c except one gap per pocket at c2 / c7. */
CM.mode({
  id: 'y5MBC8OCYlI',
  name: 'Cornered Kings',
  category: 'Variants & Games',
  description: 'Your king starts tucked in a stone-walled pocket on the left side of the board, separated from your army. Stone squares block everything. Pieces move normally; bring the army over before the enemy breaks into your corner.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  opponent: { name: 'Anna_mam', rating: 1651, avatar: null, tagline: 'Plays Red.' },
  board: { files: 11, ranks: 8, light: '#dbdbdb', dark: '#acacac', walls: ['c1', 'c3', 'c4', 'c5', 'c6', 'c8', 'a3', 'b3', 'a4', 'b4', 'a5', 'b5', 'a6', 'b6'] },
  setup: { fen: 'k2rnbq1bnr/3pppppppp/11/11/11/11/3PPPPPPPP/K2RNBQ1BNR', moved: ['a1', 'a8'] },
  rules: { castling: false },
  clock: { w: 180, b: 180, inc: 2 },
  bot: { engine: 'search', elo: 1650, depth: 3, time_ms: 800 },
  hooks: {
    init: function () {
      if (document.getElementById('g6-cornered-css')) return;
      var st = document.createElement('style'); st.id = 'g6-cornered-css';
      st.textContent = '.g6-yel{filter:sepia(1) saturate(8) hue-rotate(8deg) brightness(.97) drop-shadow(0 0 .5px #6b5300)}.g6-red{filter:sepia(1) saturate(9) hue-rotate(-42deg) brightness(.78) drop-shadow(0 0 .5px #4a0000)}';
      document.head.appendChild(st);
    },
    decorate: function (ctx, sq, p) { if (p && p.c === 'b' && 'PNBRQK'.indexOf(p.t) >= 0) return { img: CM.settings.pieceUrl('w', p.t) }; return null; },
    setup: function (ctx) {
      ctx.pieces(function (p) { return p.c === 'w' || p.c === 'b'; }).forEach(function (i) {
        var p = ctx.at(i); ctx.set(i, Object.assign({}, p, { cls: p.c === 'w' ? 'g6-yel' : 'g6-red' }));
      });
      ctx.refresh();
    }
  },
  source: { research: 'research/modes/y5MBC8OCYlI.json', confidence: 'low', notes: 'Board dimensions and wall layout estimated from frames; colours drawn as tinted white set (yellow) and tinted set (red).' }
});
