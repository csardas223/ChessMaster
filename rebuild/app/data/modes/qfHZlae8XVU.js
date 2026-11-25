/* Can I BEAT Cloister?  Each side has eight wazirs (one step orthogonally, move or capture). The capturing wazir turns
   into a brick on the capture square and its owner gains a wazir in hand; a turn is either a wazir move or a drop.
   Win by capturing the last wazir on the board or by leaving the opponent without a legal move. Sources:
   research/modes/qfHZlae8XVU.json (transcript 0:14, 0:26, 0:17, 1:18). Board size and start squares are not shown in
   the transcript; impl-6 (8th session) read them from the frames: a 4x4 board filled in a checkerboard of white and
   black wazirs, 1-minute bullet; the wazir and brick art and the magenta move squares are copied from the video. */
CM.mode({
  id: 'qfHZlae8XVU',
  name: 'Cloister',
  category: 'Variants & Games',
  description: 'Each side has eight wazirs that move or capture one square up, down, left or right. When a wazir captures, it turns into a brick on that square (nothing can enter or take a brick) and you gain a wazir in hand. On your turn either move a wazir or drop one from your hand on any empty square.',
  how_to_win: 'Capture the last enemy wazir on the board, or leave your opponent with no legal move.',
  player_side: 'white',
  player: { name: 'ireallywantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's chess.com handle + purple-king avatar from the frames */
  opponent: { name: 'megan_34', rating: 1472, avatar: 'assets/modes/qfHZlae8XVU/opp1.png', tagline: 'Bullet Cloister.' },
  board: { files: 4, ranks: 4, light: '#eeeed2', dark: '#769656' },
  pieces: {
    W: { name: 'Wazir', moves: 'W', value: 200, glyph: null, badge: null, img: { w: 'assets/modes/qfHZlae8XVU/monk_w.png', b: 'assets/modes/qfHZlae8XVU/monk_b.png' } },
    Z: { name: 'Brick', moves: '', value: 0, blocker: true, capturable: false, overlay: null, img: 'assets/modes/qfHZlae8XVU/brick.png' }
  },
  setup: { fen: 'WwWw/wWwW/WwWw/wWwW' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: false, drops: true, stalemate: 'loss', drawPlies: 300,
    win: [{ type: 'eliminate', result: 'loss', why: 'the last wazir was captured' }] },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 700 },
  hooks: {
    onMake: function (V, prev, m, n) { if (m.cap && !m.drop) n.b[m.t] = V.piece('Z', 'n', { m: 1 }); },
    /* impl-6: the site's magenta move squares from the frames (selected square darker) */
    setup: function () {
      if (!document.getElementById('g6-cloister-css')) { var el = document.createElement('style'); el.id = 'g6-cloister-css'; el.textContent = '.m-cloister .sq.is-target,.m-cloister .sq.is-target-cap{background:#ec5ff0 !important}.m-cloister .sq.is-target::after,.m-cloister .sq.is-target-cap::after{display:none}.m-cloister .sq.is-sel{background:#d43ee0 !important}.m-cloister .sq.is-sel::before{display:none}'; document.head.appendChild(el); }
      document.body.classList.add('m-cloister');
    },
    onExit: function () { document.body.classList.remove('m-cloister'); }
  },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/qfHZlae8XVU/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/qfHZlae8XVU.json', confidence: 'medium', notes: 'Board size and start squares from the frames (4x4 checkerboard of wazirs).' }
});
