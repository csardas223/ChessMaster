/* Can I BEAT Martin with 0% Damage? Beat Martin without any of your pieces ever being captured.
   Sources: research/modes/XhtzHTEsh9Q.json (losing any material = instant loss). */
CM.mode({
  id: "XhtzHTEsh9Q",
  name: "0% Damage",
  category: "Variants & Games",
  description: "A no-damage run against Martin: if Martin captures any of your pieces, even a single pawn in an equal trade, you lose on the spot.",
  how_to_win: "Checkmate Martin without losing any material.",
  player_side: "white",
  opponent: {"name": "Martin", "rating": 250, "tagline": "Even Martin can land a hit."},
  board: {"files": 8, "ranks": 8, "light": "#eeeed2", "dark": "#769656"},
  bot: {"engine": "search", "elo": 250, "depth": 3, "time_ms": 500},
  hooks: {
    onMake: function (V, st, m, n) { if (m.cap && m.cap.c === 'w') n.x.hit = 1; },
    checkWin: function (V, st) { return st.x.hit ? { w: 'b', why: 'you took damage' } : null; },
    status: function (ctx) { return 'Damage: ' + (ctx.x.hit ? '100%' : '0%'); }
  },
  source: {"research": "research/modes/XhtzHTEsh9Q.json", "confidence": "high"}
});
