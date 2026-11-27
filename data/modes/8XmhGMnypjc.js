/* Can I BEAT 4 Player Team Chess?  chess.com Team 4-Player Chess with YouTuber Croissant: opposite seats are teammates
   (Red + Yellow vs Blue + Green). Checkmating either player of the enemy team wins for the team; they won 3/3.
   Sources: research/modes/8XmhGMnypjc.json (blue ~1500, green ~1800). Board/setup as IjUqZLgF_xM (14x14 cross).
   PASS 1: you are Red (bottom); Croissant (Yellow) is an allied bot. */
/* critic 2026-11-27: Croissant's chat lines used to be toasts in the status pill, which hid the goal on phones. The pill
   now always shows the goal and whose turn it is; the chat was dropped (the video's chat is voice, not text). */
var G4_TEAM_NAMES = { r: 'Your', u: 'Blue\u2019s', y: 'Croissant\u2019s', g: 'Green\u2019s' };
CM.mode({
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/8XmhGMnypjc/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: '8XmhGMnypjc',
  title: 'Can I BEAT 4 Player Team Chess?',
  name: '4 Player Team Chess',
  category: 'Variants & Games',
  description: 'Teams on the cross-shaped board: you (Red) and Croissant (Yellow, across from you) against Blue and Green. Turns go clockwise Red, Blue, Yellow, Green. Gang up on the weaker opponent: checkmating either enemy player wins the game for your team. Pawns promote on the centre line.',
  how_to_win: 'Checkmate Blue or Green. If you or Croissant get mated, your team loses.',
  player_side: 'r',
  player: { avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png', name: 'You', rating: 1800 },
  opponent: { avatar: 'assets/modes/uUXev8TPVak/default.png', name: 'Blue', rating: 1500, tagline: 'Enemy team: Blue (~1500) and Green (~1800).' },
  players: [
    { color: 'r', forward: 'up', name: 'You', swatch: '#bf3b43', base: 'w', team: 1, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
    { color: 'u', forward: 'right', name: 'Blue', swatch: '#4185bf', base: 'w', rating: 1500, team: 2, avatar: 'assets/modes/uUXev8TPVak/default.png' },
    { color: 'y', forward: 'down', name: 'Croissant', swatch: '#c09526', base: 'w', rating: 1800, team: 1, avatar: 'assets/modes/8XmhGMnypjc/croissant.png' },
    { color: 'g', forward: 'left', name: 'Green', swatch: '#4e9161', base: 'w', rating: 1800, team: 2, avatar: 'assets/modes/8XmhGMnypjc/opponent.png' }
  ],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#dadada', dark: '#acacac' }  /* chess.com 4PC grey board, sampled from the 25% still */,
  setup: { fen: '3[y:R][y:N][y:B][y:K][y:Q][y:B][y:N][y:R]3/3[y:P][y:P][y:P][y:P][y:P][y:P][y:P][y:P]3/14/[u:R][u:P]10[g:P][g:R]/[u:N][u:P]10[g:P][g:N]/[u:B][u:P]10[g:P][g:B]/[u:Q][u:P]10[g:P][g:K]/[u:K][u:P]10[g:P][g:Q]/[u:B][u:P]10[g:P][g:B]/[u:N][u:P]10[g:P][g:N]/[u:R][u:P]10[g:P][g:R]/14/3[r:P][r:P][r:P][r:P][r:P][r:P][r:P][r:P]3/3[r:R][r:N][r:B][r:Q][r:K][r:B][r:N][r:R]3' },
  rules: { castling: true, enPassant: false, promotion: { auto: 'Q', choices: ['Q'], zone: 7 }, drawPlies: 200 },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  hooks: {
    status: function (ctx) {
      if (ctx.over) return null;
      return 'Checkmate Blue or Green \u00b7 ' + (G4_TEAM_NAMES[ctx.state.turn] || '') + ' turn';
    },
    checkWin: function (V, st) {
      var out = st.out || {};
  if (out.u || out.g) return { w: 'r', team: 1, why: (out.u ? 'Blue' : 'Green') + ' was checkmated: your team wins' };
  if (out.r || out.y) return { w: 'u', team: 2, why: (out.r ? 'you were' : 'Croissant was') + ' checkmated' };
      return null;
    }
  },
  source: { research: 'research/modes/8XmhGMnypjc.json', confidence: 'high', notes: 'ov-art1 2026-11-25: croissant.png (Croissant\'s Mona Lisa avatar) replaced by a sharp crop of https://commons.wikimedia.org/wiki/File:Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg (public domain; the old one was a blurry upscale). Seat colours and partner AI inferred; team = opposite seats. Teammate chat toasts dropped 2026-11-27 (critic: they replaced the goal in the status pill).' }
});
