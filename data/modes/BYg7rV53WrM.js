/* Chess, But the Darkness is All-Consuming. Standard chess vs Stockfish (3600) with SCP-280's darkness starting on b4.
   After every round (after Black's move) the darkness grows by one square, orthogonally, into a square that no piece
   protects (a piece does not protect its own square). A piece standing there is consumed; a consumed king loses.
   Darkness squares are solid: nothing moves onto or through them, so a wall of darkness can split the board.
   Rules (video BYg7rV53WrM, transcript re-read 2026-11-26): 0:16 starts on b4; 0:18 orthogonal, unprotected squares only,
   "B5, C4 and A4 are all possible ... B3 is protected"; 0:50 a bridge cuts the board; 3:18 "a piece does not defend
   itself"; 4:20 "nowhere else to expand into" -> it eats the queen; 4:42 "I can't take on E5 because the darkness would
   take back"; 6:02 it consumes the king. The narrator baits Stockfish into unprotected squares again and again (Bc5,
   Qd5, Ke7), so the engine plays plain chess and does not see the darkness coming: no darkness term in the bot's eval.
   iwantcheckmate.com/challenges/dark ("Chess, But the Void Stares Back at You", page script studied 2026-11-26) has the
   same rules and settles what the video leaves open: the new square is uniformly random among the candidates, nothing
   grows when there is no candidate, a consumed king ends the game like a mate.
   Look = the site's (owner 2026-11-26: "not accurate to the website or video"; the video's middle frame agrees): one
   merged black mass with fuzzy speckled edges that bleed a little over the neighbours, the two white eyes stay on the
   ORIGIN square b4 for the whole game (video frame 3:10: darkness a4 b4 b5, eyes on b4), a new square just fades in
   (200 ms, linear), no candidate markers, no flash, no smoke, no vignette, no toasts. The pink squares/arrows in the
   video are the narrator's own right-click annotations, not part of the mode. A consumed piece makes the normal capture
   sound; spreading onto an empty square is silent. A consumed king gets the site's confetti burst on its square.
   Art: dark_fuzz.png and dark_eyes.png are the creator's own tiles from iwantcheckmate.com (see source.notes). */
(function () {
  var O4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  var DIR = 'assets/modes/BYg7rV53WrM/';
  var GROW_MS = 200;
  function wait(ctx, ms) { return new Promise(function (r) { ctx.after(ms, r); }); }
  function protectedSq(V, st, sq) { return V.attacked(st, sq, 'w') || V.attacked(st, sq, 'b'); }
  /* squares the darkness may grow into next: next to a darkness square (4 directions) and protected by nobody */
  function frontier(V, st) {
    var g = V.geo, seen = {}, out = [];
    for (var i = 0; i < st.b.length; i++) {
      var p = st.b[i]; if (!p || p.t !== 'Dk') continue;
      for (var k = 0; k < 4; k++) {
        var j = g.step(i, O4[k][0], O4[k][1]); if (j < 0 || seen[j]) continue; seen[j] = 1;
        var q = st.b[j]; if (q && q.t === 'Dk') continue;
        if (!protectedSq(V, st, j)) out.push(j);
      }
    }
    return out;
  }
  function grow(ctx) {
    var V = ctx.V, st = ctx.state; if (ctx.over) return null;
    var fr = frontier(V, st); if (!fr.length) return null;   /* nowhere to go: it waits this round */
    var at = ctx.pick(fr);   /* uniformly random among the candidates, as on the site */
    var victim = ctx.at(at);
    ctx.spawn('Dk', 'n', at);
    if (st.ep === at || st.epv === at) { st.ep = -1; st.epv = -1; }   /* darkness on the en-passant square, or on the pawn that just double-stepped, ends en passant */
    ctx.game._g1grow = { sq: at, t: Date.now() };
    if (victim) {
      ctx.sound('capture');
      if (V.def(victim.t).royal) {
        ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'the darkness consumed your king' : 'the darkness consumed the Stockfish king');
        ctx.refresh({ instant: true });   /* after endGame, so the result keeps this reason */
        ctx.fx({ type: 'particles', kind: 'confetti', at: at, count: 28 });
        return null;
      }
    }
    ctx.refresh({ instant: true });
    return wait(ctx, GROW_MS);
  }
  function css() {
    if (typeof document === 'undefined' || document.getElementById('g1-dark-css')) return;
    var s = document.createElement('style'); s.id = 'g1-dark-css';
    s.textContent = '@keyframes g1DarkGrow{from{opacity:0}to{opacity:1}}.g1-darksq .coord{opacity:0}@media (prefers-reduced-motion: reduce){.g1-dark--grow{animation:none!important}}';
    document.head.appendChild(s);
  }
  function origin(ctx) {
    var o = ctx.game._g1origin;
    if (o == null) o = ctx.game._g1origin = ctx.V.geo.parse('b4');
    return o;
  }
  CM.mode({
    id: 'BYg7rV53WrM',
    title: 'Chess, But the Darkness is All-Consuming',
    name: 'All-Consuming Darkness',
    category: 'Horror Chess',
    description: 'The darkness starts on b4. After every round it spreads one square up, down, left or right into a square that no piece protects (a piece does not protect its own square), consuming any piece there. Darkness squares are solid: nothing can enter or cross them.',
    how_to_win: 'Checkmate Stockfish, or let the darkness consume the black king.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Does not see it coming.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2b6', dark: '#af8164' },
    pieces: { Dk: { name: 'Darkness', moves: '', value: 0, blocker: true, capturable: false, img: DIR + 'darkness.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Dk', color: 'n', at: 'b4' }] },
    /* plain chess search, blind to the darkness like the video's (and the site's) Stockfish */
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return grow(ctx); },
      decorate: function (ctx, sq, p) {
        if (!p || p.t !== 'Dk') return null;
        css();
        var g = ctx.game._g1grow, fresh = g && g.sq === sq && Date.now() - g.t < GROW_MS;
        /* fuzz tile drawn 3.9% bigger than the square on every side, so neighbouring tiles merge into one mass with a
           speckled rim that bleeds over the next square; z-index 1 keeps it over the square's own highlights */
        var html = '<span class="g1-dark' + (fresh ? ' g1-dark--grow' : '') + '" style="position:absolute;inset:-3.90625%;z-index:1;pointer-events:none;' +
          'background:url(' + DIR + 'dark_fuzz.png) center/100% 100% no-repeat' + (fresh ? ';animation:g1DarkGrow ' + GROW_MS + 'ms linear both' : '') + '"></span>';
        if (sq === origin(ctx)) html += '<span class="g1-dark-eyes" style="position:absolute;inset:0;z-index:1;pointer-events:none;background:url(' + DIR + 'dark_eyes.png) center/contain no-repeat"></span>';
        return { cls: 'g1-darksq', html: html, hidePiece: true, follow: false };
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.t === 'Dk'; }).length; return 'The darkness covers ' + n + ' square' + (n === 1 ? '' : 's') + '.'; }
    },
    source: { research: 'research/modes/BYg7rV53WrM.json', official_site_url: 'https://iwantcheckmate.com/challenges/dark/', confidence: 'high', notes: 'Rules from the video transcript; the random pick, the look (fuzzy merged mass, eyes fixed on b4, 200 ms fade-in) and the capture sound from the site page. Engine is darkness-blind as in the video.' }
  });
})();
