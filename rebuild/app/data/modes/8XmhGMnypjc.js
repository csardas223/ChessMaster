/* Can I BEAT 4 Player Team Chess?  chess.com Team 4-Player Chess with YouTuber Croissant: opposite seats are teammates
   (Red + Yellow vs Blue + Green). Checkmating either player of the enemy team wins for the team; they won 3/3.
   Sources: research/modes/8XmhGMnypjc.json (blue ~1500, green ~1800). Board/setup as IjUqZLgF_xM (14x14 cross).
   PASS 1: you are Red (bottom); Croissant (Yellow) is an allied bot. */
CM.mode({
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/8XmhGMnypjc/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: '8XmhGMnypjc',
  title: 'Can I BEAT 4 Player Team Chess?',
  name: '4 Player Team Chess',
  category: 'Variants & Games',
  description: 'Teams on the cross-shaped board: you (Red) and Croissant (Yellow, across from you) against Blue and Green. Turns go clockwise Red, Blue, Yellow, Green. Gang up on the weaker opponent: checkmating either enemy player wins the game for your team. Pawns promote on the centre line.',
  how_to_win: 'Checkmate Blue or Green. If you or Croissant get mated, your team loses.',
  player_side: 'r',
  player: { avatar: 'assets/modes/8XmhGMnypjc/you.png', name: 'You', rating: 1800 },
  opponent: { avatar: 'assets/modes/8XmhGMnypjc/opponent.png', name: 'Blue', rating: 1500, tagline: 'Enemy team: Blue (~1500) and Green (~1800).' },
  players: [
    { color: 'r', forward: 'up', name: 'You', swatch: '#bf3b43', base: 'w', team: 1 },
    { color: 'u', forward: 'right', name: 'Blue', swatch: '#4185bf', base: 'w', rating: 1500, team: 2 },
    { color: 'y', forward: 'down', name: 'Croissant', swatch: '#c09526', base: 'w', rating: 1800, team: 1 },
    { color: 'g', forward: 'left', name: 'Green', swatch: '#4e9161', base: 'w', rating: 1800, team: 2 }
  ],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#ebecd0', dark: '#739552' },
  setup: { fen: '3[y:R][y:N][y:B][y:K][y:Q][y:B][y:N][y:R]3/3[y:P][y:P][y:P][y:P][y:P][y:P][y:P][y:P]3/14/[u:R][u:P]10[g:P][g:R]/[u:N][u:P]10[g:P][g:N]/[u:B][u:P]10[g:P][g:B]/[u:Q][u:P]10[g:P][g:K]/[u:K][u:P]10[g:P][g:Q]/[u:B][u:P]10[g:P][g:B]/[u:N][u:P]10[g:P][g:N]/[u:R][u:P]10[g:P][g:R]/14/3[r:P][r:P][r:P][r:P][r:P][r:P][r:P][r:P]3/3[r:R][r:N][r:B][r:Q][r:K][r:B][r:N][r:R]3' },
  rules: { castling: true, enPassant: false, promotion: { auto: 'Q', choices: ['Q'], zone: 7 }, drawPlies: 200 },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  hooks: {
    checkWin: function (V, st) {
      var out = st.out || {};
      if (out.u || out.g) return { w: 'r', team: 1, why: (out.u ? 'Blue' : 'Green') + ' was checkmated: your team wins' };
      if (out.r || out.y) return { w: 'u', team: 2, why: (out.r ? 'you were' : 'Croissant was') + ' checkmated' };
      return null;
    }
  },
  source: { research: 'research/modes/8XmhGMnypjc.json', confidence: 'high', notes: 'Seat colours and partner AI inferred; team = opposite seats.' },
  todo_pass2: ['teammate chat lines (Croissant)', 'chess.com 4PC grey board look check vs frames', 'player/opp avatars']
});
