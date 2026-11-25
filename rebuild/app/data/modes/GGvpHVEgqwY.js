/* Chinese Chess vs Modern Chess.  Collab with PietroCheckmate: a Xiangqi-adapted army on an 8x8 board vs a normal chess
   army, normal check/checkmate, no clock. Chinese side: Chariot (rook), Horse (knight that cannot jump: blocked by the
   orthogonally adjacent square), Elephant (exactly two squares diagonally), Advisor (one step diagonally), General (one
   step orthogonally), Cannon (moves like a rook, captures by jumping exactly one screen), Soldier (one step forward,
   also sideways once past the 5th rank). Game 1: the narrator plays the Chinese army as White. Sources:
   research/modes/GGvpHVEgqwY.json, rules.jsonl, frames visual_a (brown board #ead3b4/#ac7f65, chariots in the corners,
   cannons in front of the back rank). Exact Chinese placement on 8 files inferred; palace not enforced. */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/GGvpHVEgqwY/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail */
  id: 'GGvpHVEgqwY',
  title: 'Chinese Chess vs Modern Chess',
  name: 'Chinese vs Modern Chess',
  category: 'Other Videos',
  description: 'Your Xiangqi army against Pietro\'s normal chess army on an 8x8 board. Chariots move like rooks; Horses move like knights but are blocked by a piece right next to them; Elephants jump exactly two squares diagonally; Advisors step one square diagonally; your General steps one square straight; Cannons slide like rooks but capture only by jumping over exactly one piece; Soldiers step forward, and also sideways once they cross the middle.',
  how_to_win: 'Checkmate Pietro.',
  player_side: 'white',
  opponent: { avatar: 'assets/modes/GGvpHVEgqwY/opponent.png', name: 'PietroCheckmate', rating: 1800, tagline: 'Chess YouTuber, plays the normal army.' },
  board: { files: 8, ranks: 8, light: '#ead3b4', dark: '#ac7f65' },
  pieces: {
    XR: { name: 'Chariot', moves: 'R', value: 500, img: 'assets/modes/GGvpHVEgqwY/chariot.png' },
    XH: { name: 'Horse', moves: 'nN', value: 280, img: 'assets/modes/GGvpHVEgqwY/horse.png' },
    XE: { name: 'Elephant', moves: 'A', value: 200, img: 'assets/modes/GGvpHVEgqwY/elephant.png' },
    XA: { name: 'Advisor', moves: 'F', value: 150, img: 'assets/modes/GGvpHVEgqwY/advisor.png' },
    XK: { name: 'General', moves: 'W', royal: true, value: 0, img: 'assets/modes/GGvpHVEgqwY/general.png' },
    XC: { name: 'Cannon', moves: 'mRcpR', value: 450, img: 'assets/modes/GGvpHVEgqwY/cannon.png' },
    XS: { name: 'Soldier', moves: 'fW', value: 100, img: 'assets/modes/GGvpHVEgqwY/soldier.png' },
    XT: { name: 'Soldier (crossed)', moves: 'fsW', value: 160, img: 'assets/modes/GGvpHVEgqwY/soldier.png' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/[XS]1[XS]2[XS]1[XS]/1[XC]4[XC]1/[XR][XH][XE][XA][XK][XE][XH][XR]' },
  rules: { castling: true },
  messages: { win_title: 'You Won! :)' },
  vfx_timeline: [{ trigger: 'win', effect: { type: 'overlay', at: 'board', duration_ms: 2600, fade_ms: 250, html: '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:10px 18px;background:#262421;color:#fff;border-radius:6px;font:500 17px/1.2 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.4)">You Won! :)</div>' } }],  /* the site's popup in the video (maxres3) */
  bot: { engine: 'search', elo: 1800, depth: 3, time_ms: 800 },
  hooks: {
    onMake: function (V, st, m, n) {
      var p = n.b[m.t]; if (!p || p.t !== 'XS') return;
      if (V.geo.relRow(m.t, p.c) >= 4) n.b[m.t] = Object.assign({}, p, { t: 'XT' });
    }
  },
  source: { research: 'research/modes/GGvpHVEgqwY.json', confidence: 'medium', notes: 'Chinese army squares inferred (chariots corners, cannons on the 2nd rank, 4 soldiers); Pietro rating inferred.' },
  _gameplay_todo: ['swapped-sides game option']
});
