/* Can I BEAT ChatGPT in Chess? You play legal chess; ChatGPT's moves happen as it says them, illegal or not.
   Sources: research/modes/MvVT7xDW4ow.json (bot hallucinates more as the game goes on; real mate ends the game). */
CM.mode({
  id: "MvVT7xDW4ow",
  name: "ChatGPT Chess",
  category: "Variants & Games",
  description: "You must play legal chess, but whatever ChatGPT says it plays becomes reality, even illegal moves: pieces teleporting, impossible captures, pieces coming back from the dead. It gets worse as the game goes on. A real checkmate on the board still ends the game.",
  how_to_win: "Deliver an actual checkmate, whatever ChatGPT claims.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { "avatar": "assets/modes/MvVT7xDW4ow/chatgpt_logo.png","name": "ChatGPT", "rating": 1000, "tagline": "Confident. Chatty. Occasionally hallucinates."},
  board: {"files": 8, "ranks": 8, "light": "#eeeed2", "dark": "#769656"},
  bot: {"engine": "search", "elo": 1000, "depth": 3, "time_ms": 500},
  messages: {"win": "ChatGPT: \"That is not checkmate.\" (It is.)"},
  params: {"talk": ["A classic positional move!", "Keeping it mysterious.", "Developing with purpose.", "This should put some pressure on you.", "A solid, principled choice.", "Let me centralize this piece."], "lies": ["My knight takes your piece. Totally legal.", "I move my bishop here. It can do that now.", "My queen is back. She never left.", "This is a perfectly normal rook move.", "I believe this square was empty."]},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/MvVT7xDW4ow/chatgpt_logo.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    afterMove: function (ctx, m, info) {
      if (info.by !== 'bot' || ctx.over) return;
      var p = Math.min(0.45, 0.03 + ctx.ply * 0.011);
      if (!ctx.chance(p)) { if (ctx.chance(0.45)) ctx.toast('ChatGPT: "' + ctx.pick(ctx.params.talk) + '"', 2600); return; }
      hallucinate(ctx);
    }
  },
  source: {"notes": "Which illegal moves ChatGPT makes and how often are inferred; the video shows teleports, impossible captures and resurrected pieces increasing over the game.", "research": "research/modes/MvVT7xDW4ow.json", "confidence": "high"}
});

/* one hallucination: a random black piece teleports (possibly capturing), or a lost piece comes back */
function hallucinate(ctx) {
  var g = ctx.geo, V = ctx.V, mine = ctx.pieces(function (p) { return p.c === 'b' && p.t !== 'K'; });
  var kind = ctx.random(3);
  if (kind === 2 || !mine.length) {
    var e = ctx.emptySquares(function (i) { return g.relRow(i, 'b') <= 3; });
    if (!e.length) return;
    var t = ctx.pick(['Q', 'R', 'N', 'B']), at = ctx.pick(e);
    ctx.spawn(t, 'b', at);
    ctx.fx({ type: 'piece_transform', at: at, style: 'fade' });
  } else {
    var f = ctx.pick(mine), legal = {};
    V.legal(Object.assign({}, ctx.state, { turn: 'b' })).forEach(function (mv) { if (mv.f === f) legal[mv.t] = 1; });
    var targets = [];
    for (var i = 0; i < g.size; i++) { if (!g.valid[i] || i === f || legal[i]) continue; var q = ctx.at(i); if (!q || (q.c === 'w' && q.t !== 'K' && kind === 1)) targets.push(i); }
    if (!targets.length) return;
    var to = ctx.pick(targets);
    ctx.fx({ type: 'arrow', from: f, to: to, color: 'rgba(220, 60, 60, 0.85)', duration_ms: 1400 });
    var victim = ctx.at(to); ctx.move(f, to); ctx.sound(victim ? 'capture' : 'move-opponent');
  }
  ctx.toast('ChatGPT: "' + ctx.pick(ctx.params.lies) + '"', 3000);
}
