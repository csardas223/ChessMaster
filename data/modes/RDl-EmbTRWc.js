/* Can I BEAT Chessformer?  Puzzle-platformer by Robert Alvarez: side-view levels where chess pieces have gravity. Move
   your (blue) pieces with normal chess moves; after every move each piece falls straight down until it lands on
   something. Capture the static red king to clear a level. Sources: research/modes/RDl-EmbTRWc.json, rules.jsonl
   (gravity after each move, bishops change colour by falling), frames (~12x10 grid, tan/brown #c4a16e/#ab864d,
   green pipe platforms, black void squares, "Level 12"). Levels are transcribed square by square from the video's own
   stills (i.ytimg.com/vi/RDl-EmbTRWc/maxres2.jpg = Level 12, maxres3.jpg = a later level; 16x11 grid); green pipes =
   walls, black squares = void blocks; the red king never moves (g5_levels passColor). Pass 2 (impl-5, 7th session):
   blue/red armies, pipe + void look recreated from the frames, title screen card cut from maxres1. */
CM.mode({
  id: 'RDl-EmbTRWc',
  title: 'Can I BEAT Chessformer?',
  name: 'Chessformer',
  category: 'Variants & Games',
  description: 'Chess pieces with gravity. Your pieces move like normal chess pieces, then fall straight down until they land on a platform or another piece. Plan around the fall: a bishop can change square colour by dropping.',
  how_to_win: 'Capture the red king to clear each level.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { avatar: 'assets/modes/RDl-EmbTRWc/red_king.png', name: 'Red King', rating: null, tagline: 'The static red king waiting at the end of each level.' },
  board: { files: 16, ranks: 11, light: '#c4a16e', dark: '#ab864d' },
  theme: { background: '#2b2620' },
  pieces: { V: { name: 'Void', moves: '', value: 0, blocker: true, capturable: false, overlay: 'void' },
    /* ov-art2: the video's flat blue set (same Chessformer art as oAoik9Dj2qQ) and a red king redrawn (cburnett king outline in the video's red, 256px) (the CSS hue filters left the pieces pale) */
    P: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_p.png' } }, N: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_n.png' } }, B: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_b.png' } },
    R: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_r.png' } }, Q: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_q.png' } }, K: { img: { w: 'assets/modes/oAoik9Dj2qQ/blue_k.png', b: 'assets/modes/RDl-EmbTRWc/red_king_piece.png' } } },
  setup: { fen: '16/8B5R1/5*****6/5*3*6/7k1*6/3*******6/4*1*3*5/5*4*5/10**4/5**9/****************' },
  rules: { check: 'none', castling: false, enPassant: false, gravity: null, promotion: false },   /* gravity runs in g6_levels (params.gravity) so thin ledges work */
  params: {
    passColor: 'b', run: 'Level',
    /* cm_acc 2026-11-26: the shared Chessformer rules of oAoik9Dj2qQ (g6_levels): lib-side gravity with thin one-way ledges
       (levels[].tiles { sq: 'ledge' } = a green bar under that square: a falling piece rests on it, moves pass through it), a
       piece dropped onto the red king's head takes it, pieces slide then fall */
    gravity: { dir: 'down', exempt: [], fallCapture: true }, ledges: true, fallAnim: true,
    levels: [
      { name: 'Bishop and rook (video, maxres3)', fen: '16/8B5R1/5*****6/5*3*6/7k1*6/3*******6/4*1*3*5/5*4*5/10**4/5**9/****************', tiles: { o10: 'ledge', o4: 'ledge' }, hint: 'Drop onto the red king: pieces fall after every move. Thin ledges catch falling pieces; pieces move through them' },
      { name: 'Level 12 (video, maxres2)', fen: '6[n:V]2[n:V]2[n:V]3/4[n:V]1*[n:V]4*3/6*4[n:V]*1[n:V]1/6*1k1*1*3/1[n:V]P2[n:V]****[n:V]1*3/2*3*3[n:V]1[n:V]1N1/6*1***[n:V]****/2[n:V]1[n:V]2**[n:V]6/[n:V]3[n:V]1**8/2K1*1*9/************[n:V]***', tiles: { c11: 'ledge', c10: 'ledge', c9: 'ledge' }, hint: 'Black squares are solid void blocks' }
    ],
    decor: { '#': 'cf-pipe', V: 'cf-void', w: 'cf-blue', b: 'cf-red' },
    css: '.sq.cf-pipe .blk--wall{background:#66dd55;box-shadow:0 0 0 0.5px #66dd55}.sq.cf-void .blk--void{background:#000}'
  },
  bot: { engine: 'random' },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/RDl-EmbTRWc/title.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: { extends: 'g6_levels',   /* + this mode's own pipe / void / army look (params.css, params.decor) */
    setup: function (ctx) {
      var cid = 'cf1-css'; if (!document.getElementById(cid)) { var el = document.createElement('style'); el.id = cid; el.textContent = ctx.params.css; document.head.appendChild(el); }
      return this._base.setup.call(this, ctx);
    },
    decorate: function (ctx, sq, p) {
      var d = this._base.decorate.call(this, ctx, sq, p), D = ctx.params.decor, c = p && D ? D[p.t] || D[p.c] : null;
      if (!c) return d; d = Object.assign({}, d || {}); d.cls = (d.cls ? d.cls + ' ' : '') + c; return d;
    } },
  _deferred: ['the other levels of the run (only two levels are legible in the published stills)', 'in-game arrow / U / restart buttons (the app toolbar Undo / New game do the same)'],
  source: { research: 'research/modes/RDl-EmbTRWc.json', confidence: 'medium', notes: 'Gameplay rules exact; both levels transcribed from the video stills ; thin green ledges (maxres3 o10/o4, Level 12 c9-c11) are one-way ledge tiles (cm_acc 2026-11-26), no longer full wall squares.' }
});
