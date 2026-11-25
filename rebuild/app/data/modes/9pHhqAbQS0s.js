/* Chess, But Captures are Permanent Between Games... A gauntlet up the chess.com bot ladder (Zach 1, Martin 250,
   Juan 400, Noel 550, Aaron 700, Zara 850, Maria 1000, Aziz 1100, then stronger bots) where every piece of yours that
   gets captured is gone from your starting army for all later games. The bots always start with a full army. The run
   ends at your first loss.
   Sources: research/modes/9pHhqAbQS0s.json (transcript ladder names/ratings, "any piece I lose is lost permanently",
   16:56 mated by Aziz), frames visual_b (green #eaead2/#72a25a, "Game 100" thumbnail with K, N and two pawns).
   Inferred: a promoted piece that is captured costs the original pawn; draws keep the run going at the same bot; the
   ladder above Aziz continues with chess.com's Advanced bots Wendy 1500 .. Manuel 2100 (art from tfPyy36nwc4/WciUSfeqGgs); the run lives in this browser tab (New game after a loss restarts). */
(function () {
  var L = [
    ['Zach', 1, 'assets/modes/9pHhqAbQS0s/zach.png'], ['Martin', 250, 'assets/modes/9pHhqAbQS0s/martin.png'],
    ['Juan', 400, 'assets/modes/nK5WQNSbFfE/juan.png'], ['Noel', 550, 'assets/modes/9pHhqAbQS0s/noel.png'],
    ['Aaron', 700, 'assets/modes/9pHhqAbQS0s/aaron.png'], ['Zara', 850, 'assets/modes/9pHhqAbQS0s/zara.png'],
    ['Maria', 1000, 'assets/modes/AtmctmxLq58/maria.png'], ['Azeez', 1100, 'assets/modes/AtmctmxLq58/azeez.png' /* transcript 'Aziz'; the chess.com bar reads 'Azeez (1100)' (16:40 frame check) */]
  ];
  /* art-g4 2026-11-25: past Azeez the video ends (16:56 mated by Azeez; 16:40-17:57 checked frame by frame: no later bot is ever shown),
     so the inferred rest of the ladder is chess.com's real Advanced bots, with the portraits cut from the tfPyy36nwc4 / WciUSfeqGgs
     frames (no generic avatar); after Manuel the run keeps facing Manuel. */
  var UP = [
    ['Wendy', 1500, 'assets/modes/tfPyy36nwc4/wendy.png'], ['Pablo', 1600, 'assets/modes/tfPyy36nwc4/pablo.png'],
    ['Arthur', 1700, 'assets/modes/tfPyy36nwc4/arthur.png'], ['Lorenzo', 1800, 'assets/modes/tfPyy36nwc4/lorenzo.png'],
    ['Miguel', 1900, 'assets/modes/tfPyy36nwc4/miguel.png'], ['Li', 2000, 'assets/modes/tfPyy36nwc4/li.png'],
    ['Manuel', 2100, 'assets/modes/WciUSfeqGgs/manuel.png']
  ];
  function bot(k) {
    var e = k < L.length ? L[k] : UP[Math.min(k - L.length, UP.length - 1)];
    return { name: e[0], rating: e[1], avatar: e[2], elo: Math.max(1, e[1]) };
  }
  var run = { level: 0, lost: {}, dead: false, game: 1 };
  /* (divs, not spans: .fx-overlay span is styled as a caption) army carry-over card between games (the video shows the depleted army at the start of each game, e.g. the
     'Game 100' thumbnail: K, N and two pawns): your 16 starting squares, the pieces lost for good dimmed and crossed */
  var HOME = { a1: 'R', b1: 'N', c1: 'B', d1: 'Q', e1: 'K', f1: 'B', g1: 'N', h1: 'R' };
  function roster(ctx, title, sub, gone) {
    var cell = function (sq) {
      var t = HOME[sq] || 'P', dead = !!run.lost[sq], fresh = gone.indexOf(sq) >= 0;
      return '<div style="position:relative;width:11%;aspect-ratio:1;border-radius:4px;background:' + (fresh ? 'rgba(224,40,40,.35)' : 'rgba(255,255,255,.08)') + '">' +
        '<img alt="" src="' + CM.settings.pieceUrl('w', t) + '" style="width:100%;height:100%;opacity:' + (dead ? '.22' : '1') + '">' +
        (dead ? '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#e02828;font:900 22px/1 sans-serif">&#x2715;</div>' : '') + '</div>';
    };
    var row = function (r) { return '<div style="display:flex;gap:1.5%;justify-content:center">' + 'abcdefgh'.split('').map(function (f) { return cell(f + r); }).join('') + '</div>'; };
    var html = '<div style="position:absolute;left:6%;right:6%;top:50%;transform:translateY(-50%);padding:14px 10px;border-radius:10px;background:rgba(38,36,33,.94);color:#fff;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.5)">' +
      '<div style="font:800 20px/1.2 var(--font,sans-serif)">' + CM.util.esc(title) + '</div><div style="font:500 13px/1.4 var(--font,sans-serif);opacity:.8;margin:4px 0 10px">' + CM.util.esc(sub) + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px">' + row(2) + row(1) + '</div></div>';
    ctx.fx({ type: 'overlay', at: 'board', html: html, duration_ms: 4200, fade_ms: 300, id: 'roster' });
  }
  CM.mode({
    id: '9pHhqAbQS0s',
    name: 'Permanent Captures',
    category: 'Powerups & Rule Twists',
    description: 'Climb the chess.com bot ladder from 1 Elo upward. Every piece of yours that gets captured is missing from your starting army in every later game; the bots always start with everything. The run ends at your first loss.',
    how_to_win: 'Beat as many bots in a row as you can. Avoid trades at all costs.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Zach', rating: 1, avatar: 'assets/modes/9pHhqAbQS0s/zach.png', tagline: 'The first rung of the ladder.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#eaead2', dark: '#72a25a' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'auto', elo: 1, depth: 3, time_ms: 500 },
    hooks: {
      stockfishOk: true,
      setup: function (ctx) {
        if (run.dead) run = { level: 0, lost: {}, dead: false, game: 1 };
        var b = bot(run.level), st = ctx.state;
        ctx.setOpponent({ name: b.name, rating: b.rating, avatar: b.avatar, tagline: 'Game ' + run.game + ' of the gauntlet.' }); ctx.game.opponent.elo = b.elo;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c !== ctx.human) continue;
          var o = ctx.name(i); if (run.lost[o]) st.b[i] = null; else st.b[i] = Object.assign({}, p, { o: o }); }
      },
      onGameOver: function (ctx, r) {
        var have = {}; ctx.state.b.forEach(function (p) { if (p && p.o) have[p.o] = 1; });
        var gone = [];
        ['a1','b1','c1','d1','e1','f1','g1','h1','a2','b2','c2','d2','e2','f2','g2','h2'].forEach(function (s) { if (!run.lost[s] && !have[s]) { run.lost[s] = 1; gone.push(s); } });
        var left = 16 - Object.keys(run.lost).length;
        var nb = bot(r.w === ctx.human ? run.level + 1 : run.level);
        if (r.w !== ctx.human && r.w !== 'd') roster(ctx, 'Run over', run.level + ' win' + (run.level === 1 ? '' : 's') + ' in a row. Your army:', gone);
        else roster(ctx, 'Game ' + (run.game + 1) + ' vs ' + nb.name + (nb.rating != null ? ' (' + nb.rating + ')' : ''), left + '/16 pieces carry over' + (gone.length ? ', ' + gone.length + ' lost this game' : ', none lost this game'), gone);
        if (r.w === ctx.human) { run.level++; run.game++; ctx.toast('Win! ' + (gone.length ? gone.length + ' piece' + (gone.length > 1 ? 's' : '') + ' lost for good. ' : 'No losses! ') + left + ' pieces carry over. Next: ' + bot(run.level).name + '.', 3600); }
        else if (r.w === 'd') { run.game++; ctx.toast('Draw: replay ' + bot(run.level).name + ' with ' + left + ' pieces.', 3200); }
        else { run.dead = true; ctx.toast('Run over after ' + run.level + ' win' + (run.level === 1 ? '' : 's') + '. New starts a fresh run.', 3600); }
      },
      status: function (ctx) { var n = Object.keys(run.lost).length; return 'Game ' + run.game + ' - ' + run.level + ' win' + (run.level === 1 ? '' : 's') + ' so far - ' + (16 - n) + '/16 pieces left.'; }
    },
    source: { research: 'research/modes/9pHhqAbQS0s.json', confidence: 'high', notes: 'Ladder above Azeez (Advanced bots Wendy..Manuel) and draw handling inferred; the video never shows a bot after Azeez.' }
  });
})();
