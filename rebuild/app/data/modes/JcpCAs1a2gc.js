/* Can I BEAT Anarchy Chess? Normal chess vs a meme-quoting Anarchy Bot (1660). Rules beyond standard chess are not
   established by the research; forced en passant is inferred. Sources: research/modes/JcpCAs1a2gc.json, frames: green board, chat bubble 'New game just dropped'. */
CM.mode({
  id: "JcpCAs1a2gc",
  name: "Anarchy Chess Bot",
  category: "Meme Chess",
  description: "Normal chess against the Anarchy Bot (1660), which talks only in r/AnarchyChess memes. Anarchy rule: en passant is forced. If you can take en passant, you must.",
  how_to_win: "Checkmate the Anarchy Bot.",
  player_side: "white",
  player: {"name": "You", "rating": 2205, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { "avatar": "assets/modes/JcpCAs1a2gc/anarchy_bot_avatar.png","name": "Anarchy Bot", "rating": 1660, "tagline": "New response just dropped."},
  board: {"files": 8, "ranks": 8, "light": "#ebeed1", "dark": "#759f56"},
  bot: {"engine": "search", "elo": 1660, "depth": 3, "time_ms": 650},
  params: {"chat": ["New game just dropped.", "Holy hell!", "Google en passant.", "Actual zombie.", "Call the exorcist.", "Bishop goes on vacation, never comes back.", "Il Vaticano!", "Knook incoming.", "Average Anarchy Chess enjoyer."]},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/JcpCAs1a2gc/anarchy_knight.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    filterMoves: function (V, st, legal) { var ep = legal.filter(function (m) { return m.ep; }); return ep.length ? ep : legal; },
    afterMove: function (ctx, m, info) {
      if (info.by === 'bot' && ctx.chance(0.3)) ctx.toast('Anarchy Bot: "' + ctx.pick(ctx.params.chat) + '"', 2800);
      if (m.ep) ctx.toast('Anarchy Bot: "Holy hell! En passant is forced."', 2800);
    }
  },
  source: {"confidence": "low", "notes": "The bot's exact meme rules are not established in the research; forced en passant (the best-known r/AnarchyChess rule) is an inferred stand-in.", "research": "research/modes/JcpCAs1a2gc.json"}
});
