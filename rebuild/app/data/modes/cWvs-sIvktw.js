/* Can I BEAT Checkers Chess? All pieces look like checker discs but move as chess pieces.
   Sources: research/modes/cWvs-sIvktw.json (transcript: remember relationships, Qc7#), frames: disc pieces. */
CM.mode({
  id: "cWvs-sIvktw",
  name: "Checkers Chess",
  category: "Variants & Games",
  description: "Every piece on both sides is drawn as an identical checker disc, but it still moves like the chess piece it really is. Remember which disc is which. The real pieces are revealed when the game ends.",
  how_to_win: "Checkmate.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {"name": "Goku8110", "rating": 1554, "tagline": "Checkers Chess opponent on chess.com"},
  board: {"files": 8, "ranks": 8, "light": "#eaf6d2", "dark": "#7ea25a"},
  assets: {"w": "assets/modes/cWvs-sIvktw/disc_w.png", "b": "assets/modes/cWvs-sIvktw/disc_b.png"},
  hooks: {
    decorate: function (ctx, sq, p) { return p && !ctx.over ? { img: 'assets/modes/cWvs-sIvktw/disc_' + (p.c === 'b' ? 'b' : 'w') + '.png' } : null; },
    stockfishOk: true
  },
  source: {"notes": "Disc art is original. One frame suggests a linked checkers board; the transcript describes discs that move as chess pieces, which is what is implemented.", "research": "research/modes/cWvs-sIvktw.json", "confidence": "high"}
});
