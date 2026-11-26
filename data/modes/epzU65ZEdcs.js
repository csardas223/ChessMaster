/* Chess, But SPC-096 Hides In the Fog. Fog-of-war chess vs Stockfish (3600): you only see your own pieces and the
   squares they attack. SCP-096 (Shy Guy) hides on a random empty square of ranks 3-6 (24 squares). Any piece, yours
   or Stockfish's, whose attack touches his square is eaten: he jumps onto it, revealed, and keeps eating anything that
   looks at him from then on. He cannot be captured; if he eats a king, that side loses.
   Sources: research/modes/epzU65ZEdcs.json (transcript 00:01 rule + "I can only see squares I attack", 00:55 game 1
   lost to Shy Guy taking the king, 01:20 "24 possible squares", 02:38 his move is heard between turns, 08:53 Shy Guy
   captures the black king), frames visual_a (brown board, dark-grey fog tiles, magenta strike arrow, Stockfish (3600)).
   Inferred: strike reach = any attack line (any distance); several lookers -> random one; Stockfish does not know where
   he hides (its search treats his square as empty-looking blocker only). Art: SCP-096 from iwantcheckmate.com/challenges/scp-096/shyguy.png. */
(function () {
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function shySq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'S') return i; return -1; }
  function attackersOf(V, st, sq) {
    var b = st.b, saved = b[sq], out = [];
    b[sq] = { t: '?', c: '?', m: 1, probe: 1 };
    for (var i = 0; i < b.length; i++) {
      var p = b[i]; if (!p || i === sq || p.c === 'n' || p.probe) continue;
      var ms = []; V.genPiece(st, i, ms, true);
      for (var k = 0; k < ms.length; k++) if (ms[k].t === sq && ms[k].cap) { out.push(i); break; }
    }
    b[sq] = saved; return out;
  }
  function react(ctx) {
    var V = ctx.V, s = shySq(ctx.state); if (s < 0 || ctx.over) return null;
    var att = attackersOf(V, ctx.state, s); if (!att.length) return null;
    var a = ctx.pick(att), victim = ctx.at(a), first = !ctx.at(s).seen;
    ctx.transform(s, { props: { seen: 1 } });
    ctx.refresh();
    ctx.fx({ type: 'arrow', from: s, to: a, color: 'rgba(214, 60, 200, 0.9)', duration_ms: 950 });
    ctx.fx({ type: 'highlight', squares: [ctx.name(s), ctx.name(a)], color: 'rgba(214, 60, 200, 0.45)', duration_ms: 950 });
    if (first) ctx.fx({ type: 'jumpscare', image: 'assets/modes/epzU65ZEdcs/shyguy.png', background: '#1a1b1d', duration_ms: 900 });
    else ctx.sound('jumpscare');
    return wait(ctx, first ? 950 : 650).then(function () {
      ctx.move(s, a); ctx.sound('capture');
      ctx.toast('SCP-096 saw the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + ' looking at it.', 1800);
      if (V.def(victim.t).royal) { ctx.refresh(); ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'SCP-096 came out of the fog and ate your king' : 'SCP-096 ate the Stockfish king'); return; }
      ctx.refresh();
      return wait(ctx, 250);
    });
  }
  CM.mode({
    id: 'epzU65ZEdcs',
    name: 'SCP-096 in the Fog',
    category: 'Powerups & Rule Twists',
    description: 'Fog of war: you only see your pieces and the squares they attack. SCP-096 hides on one of the 24 empty squares of ranks 3-6. Any piece of either side that attacks his square gets eaten, and he stays revealed, eating anything that looks at him after that. He cannot be captured.',
    how_to_win: 'Checkmate Stockfish, or let SCP-096 eat the black king.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Sees the whole board. Does not know where Shy Guy hides.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#f0d9b5', dark: '#b58863' },
    pieces: { S: { name: 'SCP-096', moves: '', value: 0, capturable: false, img: 'assets/modes/epzU65ZEdcs/shyguy.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'S', color: 'n', at: 'random_empty', rows: [3, 4, 5, 6] }] },
    rules: { fog: true },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 650 },
    assets: { shy: 'assets/modes/epzU65ZEdcs/shyguy.png' },
    hooks: {
      /* visible: your pieces, every square they attack, and Shy Guy once he has struck */
      vision: function (ctx) {
        var V = ctx.V, st = ctx.state, g = ctx.geo, me = ctx.human, dist = new Array(g.size).fill(99);
        if (ctx.over) { dist.fill(0); return { dist: dist }; }
        for (var i = 0; i < g.size; i++) {
          var p = st.b[i];
          if ((p && p.c === me) || (p && p.t === 'S' && p.seen) || V._attBy(st, i, me)) dist[i] = 0;
        }
        return { dist: dist };
      },
      afterMove: function (ctx) { return react(ctx); },
      status: function (ctx) { var s = shySq(ctx.state), p = s >= 0 && ctx.at(s); return p && p.seen ? 'SCP-096 is on ' + ctx.name(s) + '. Don\'t look at him.' : 'SCP-096 hides somewhere on ranks 3-6.'; }
    },
    source: { research: 'research/modes/epzU65ZEdcs.json', confidence: 'medium', notes: 'Strike reach (any attack line) and bot unawareness inferred.' }
  });
})();
