/* Chess, But I Can Use Minecraft Blocks. Chess vs (Fairy-)Stockfish (3600). You have an inventory: 3 Cobblestone, 1
   TNT, 1 Chest. Instead of a move you may place one block (it cannot be moved again):
   * Cobblestone on an empty square: a permanent wall for everyone;
   * TNT on any square (empty or not, never on a king): explodes at once and removes every piece in the 3x3 around it
     except kings (and whatever hides in the chest);
   * Chest on an empty square: a white piece standing in the chest cannot be captured, but still attacks and gives
     check, and can walk out again.
   Only you have blocks. Sources: research/modes/Re3c-3qomgQ.json (transcript 00:01 three cobble, one TNT 3x3, one
   chest; 00:28 TNT on c7; 00:54 kings survive TNT; 02:10 queen in the chest gives check and cannot be taken; 03:56
   blocks cannot be moved; 12:08 one-chest challenge), frames visual_b (brown #ead2ba/#ae7e66, inventory counts).
   Inferred: TNT keeps cobblestone; a king in the chest still counts as in check when attacked (engine limitation);
   the video's reduced-inventory challenges are not separate modes. */
(function () {
  var BLOCKS = { Cob: 1, TNT: 1, Chest: 1 };
  function chests(st) { return (st.x && st.x.chests) || []; }
  CM.mode({
    id: 'Re3c-3qomgQ',
    name: 'Minecraft Blocks',
    category: 'Powerups & Rule Twists',
    description: 'Your inventory (next to your name): 3 Cobblestone, 1 TNT, 1 Chest. Instead of moving, tap a block and then a square. Cobblestone is a permanent wall. TNT blows up everything in a 3x3 except kings. A piece of yours inside the Chest cannot be captured but still attacks.',
    how_to_win: 'Checkmate Stockfish. TNT into a crowd of pieces is very strong.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Fairy-Stockfish. Not a gamer.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ba', dark: '#ae7e66' },
    pieces: {
      Cob: { name: 'Cobblestone', moves: '', value: 0, blocker: true, capturable: false, img: 'assets/modes/Re3c-3qomgQ/cobble.png', san: 'Cobble' },
      TNT: { name: 'TNT', moves: '', value: 0, img: 'assets/modes/Re3c-3qomgQ/tnt.png', san: 'TNT' },
      Chest: { name: 'Chest', moves: '', value: 0, img: 'assets/modes/Re3c-3qomgQ/chest.png', san: 'Chest' }
    },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', hands: { w: ['Cob', 'Cob', 'Cob', 'TNT', 'Chest'], b: [] }, x: { chests: [] } },
    rules: { drops: true },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 900 },
    sounds: { place: 'assets/modes/Re3c-3qomgQ/place.wav', chest: 'assets/modes/Re3c-3qomgQ/chest.wav', fuse: 'assets/modes/Re3c-3qomgQ/fuse.wav' },
    hooks: {
      moves: function (V, st, out) {
        var C = chests(st), me = st.turn;
        out = out.filter(function (m) {
          if (m.drop) return me === 'w' && BLOCKS[m.drop] && C.indexOf(m.t) < 0;
          if (m.cap && C.indexOf(m.capSq != null ? m.capSq : m.t) >= 0 && m.cap.c === 'w') return false;
          return true;
        });
        if (me === 'w' && st.hands.w.indexOf('TNT') >= 0) {
          for (var s = 0; s < st.b.length; s++) { var q = st.b[s]; if (!q || V.def(q.t).royal || V.def(q.t).blocker || C.indexOf(s) >= 0) continue; out.push({ f: -1, t: s, p: 'TNT', c: 'w', cap: null, drop: 'TNT', occ: 1 }); }
        }
        return out;
      },
      onMake: function (V, st, m, n) {
        if (!m.drop) { if (m.cap) n.hands = st.hands; return; }
        var g = V.geo, t = m.t;
        if (m.drop === 'Cob') n.b[t] = { t: 'Cob', c: 'n', m: 1 };
        else if (m.drop === 'Chest') { n.b[t] = null; n.x.chests = chests(st).concat([t]); }
        else if (m.drop === 'TNT') {
          var C = chests(st), gone = 0;
          n.b[t] = st.b[t];
          for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) {
            var j = (dc || dr) ? g.step(t, dc, dr) : t; if (j < 0 || C.indexOf(j) >= 0) continue;
            var p = n.b[j]; if (!p || V.def(p.t).royal || p.t === 'Cob') continue; n.b[j] = null; gone++;
          }
          n.x.boom = t; n.half = 0;
        }
      },
      init: function (ctx) {
        var G = ctx.game; if (G._g1mc) return; G._g1mc = 1;
        var fin = G._finishCommit;
        /* placed blocks vanish from the board (chest, TNT) and must not show up as captured pieces */
        G._finishCommit = function () { var r = fin.apply(G, arguments); Object.keys(G.cap).forEach(function (k) { G.cap[k] = G.cap[k].filter(function (x) { return !BLOCKS[x.t]; }); }); G.render(); return r; };
      },
      afterMove: function (ctx, m) {
        if (!m.drop) {
          /* a piece walks into / out of a chest: the video's chest closes over the square for a moment (no open-lid
             sprite exists in the video, so the closed chest covers the piece and fades back to the corner badge) */
          var C = chests(ctx.state), into = C.indexOf(m.t) >= 0, out = m.f >= 0 && C.indexOf(m.f) >= 0;
          if (into || out) {
            ctx.sound('chest');
            ctx.fx({ type: 'overlay', at: into ? m.t : m.f, image: 'assets/modes/Re3c-3qomgQ/chest.png', fit: 'contain', duration_ms: 520, fade_ms: 200, cls: 'g1-chest-lid' });
            if (into) ctx.toast('Hidden in the chest: it cannot be captured.', 1500);
          }
          return null;
        }
        if (m.drop === 'TNT') {
          ctx.sound('fuse'); ctx.setX('boom', null);
          ctx.fx({ type: 'highlight', squares: [ctx.name(m.t)], color: 'rgba(255,60,40,.5)', duration_ms: 300 });
          ctx.fx({ type: 'explosion', at: m.t, radius: 1.5, shake: false, delay_ms: 250 });
          ctx.after(260, function () { ctx.sound('explosion'); });
          ctx.toast('TNT on ' + ctx.name(m.t) + '!', 1500);
        } else if (m.drop === 'Chest') { ctx.sound('chest'); ctx.toast('Chest placed on ' + ctx.name(m.t) + '. Move a piece in to hide it.', 1900); }
        else ctx.sound('place');
        return null;
      },
      decorate: function (ctx, sq, p) {
        if (chests(ctx.state).indexOf(sq) < 0) return null;
        return p ? { html: '<img alt="" src="assets/modes/Re3c-3qomgQ/chest.png" style="position:absolute;left:2%;bottom:2%;width:42%;height:42%;z-index:4;pointer-events:none;image-rendering:pixelated">' }
                 : { html: '<img alt="" src="assets/modes/Re3c-3qomgQ/chest.png" style="position:absolute;inset:8%;width:84%;height:84%;z-index:1;pointer-events:none;image-rendering:pixelated">' };
      },
      status: function (ctx) {
        var h = ctx.state.hands[ctx.human], c = function (t) { return h.filter(function (x) { return x === t; }).length; };
        return 'Inventory: ' + c('Cob') + ' cobble, ' + c('TNT') + ' TNT, ' + c('Chest') + ' chest. Tap a block, then a square.';
      }
    },
    source: { research: 'research/modes/Re3c-3qomgQ.json', confidence: 'high', notes: 'TNT spares cobble and the chest; king-in-chest check is an engine limitation.' }
  });
})();
