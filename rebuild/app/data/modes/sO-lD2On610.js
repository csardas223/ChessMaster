/* Can I BEAT Pac-Man Chess?  chess.com community variant on a ~20x20 maze: grey wall squares are impassable, blue neutral
   "pellet" pieces fill the corridors (capturing a rook-pellet scores 1, a pawn-pellet 5) and green ghost pieces from the
   central box cannot be captured. Sources: research/modes/sO-lD2On610.json (LOW confidence: transcript fetch failed;
   pellet values and uncapturable ghosts from frames/transcript fragments), frames (#7F888A/#373934). PASS 1
   approximations: two players instead of four, maze layout invented, ghosts drift toward your king every few moves
   but never capture; first to 25 points (or checkmate) wins. */
CM.mode({
  id: 'sO-lD2On610',
  title: 'Can I BEAT Pac-Man Chess?',
  name: 'Pac-Man Chess',
  category: 'Variants & Games',
  description: 'A maze board: grey walls block every move. Neutral pellet pieces sit in the corridors: capture a rook-pellet for 1 point and a pawn-pellet for 5. The green ghosts cannot be captured and wander toward your king. Normal check and checkmate apply.',
  how_to_win: 'Reach 25 points first, or checkmate.',
  player_side: 'white',
  opponent: { name: 'Online player', rating: null, tagline: 'Pac-Man Chess on chess.com variants.' },
  board: { files: 20, ranks: 20, light: '#7f888a', dark: '#737b7d', background: '#1b1c1a', viewport: { files: 20, ranks: 20, mobile: { files: 12, ranks: 12 }, follow: 'player_king' } },
  pieces: {
    Pr: { name: 'Rook pellet', moves: '', value: 60, glyph: 'R', badge: '1', points: 1, cls: 'pc--tint-u' },
    Pp: { name: 'Pawn pellet', moves: '', value: 200, glyph: 'P', badge: '5', points: 5, cls: 'pc--tint-u' },
    Gh: { name: 'Ghost', moves: '', value: 0, glyph: 'Q', capturable: false, cls: 'pc--tint-g' }
  },
  setup: { fen: '7rnkqnr7/1**1****1**1****1**1/1[n:Pr][n:Pr]1[n:Pr]2[n:Pr]5[n:Pr]5[n:Pp]/[n:Pr]**1*1********[n:Pr]*1**1/[n:Pp]3*[n:Pr]1[n:Pp][n:Pr]**2[n:Pp]1*4/***1****1**1****1***/4*9[n:Pr]*[n:Pr]3/1**[n:Pr]*1***2***1*[n:Pr]**1/1**3*6*3**1/1**1*1*1[n:Gh][n:Gh][n:Gh][n:Gh]1*1*1**1/1**1*1*6*1*1**1/1**2[n:Pr]********2[n:Pr]**1/1**1*5[n:Pr]2[n:Pr][n:Pr]*1**1/1[n:Pr]2*1********[n:Pp]*4/***5[n:Pp][n:Pr]2[n:Pr]3[n:Pr][n:Pr]1[n:Pr]/[n:Pr]**1****1**1****1**1/1[n:Pr]3[n:Pr]3[n:Pr]10/[n:Pr]**1*1********1*1**[n:Pr]/4*4**4*4/7RNKQNR7' },
  rules: { castling: false, enPassant: false, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 450 },
  events: [{ when: 'every_plies:4', do: { move_toward: { type: 'Gh', color: 'n', target: 'player_king', steps: 1, captures: false } } }],
  hooks: {
    onMake: function (V, st, m, n) {
      var cap = st.b[m.capSq != null ? m.capSq : m.t];
      if (!cap || cap.c !== 'n') return;
      var pts = cap.t === 'Pp' ? 5 : cap.t === 'Pr' ? 1 : 0; if (!pts) return;
      n.score = Object.assign({}, st.score || {}); n.score[st.turn] = (n.score[st.turn] || 0) + pts;
    },
    checkWin: function (V, st) { var s = st.score || {}; if ((s.w || 0) >= 25) return { w: 'w', why: '25 pellet points' }; if ((s.b || 0) >= 25) return { w: 'b', why: '25 pellet points' }; return null; },
    evaluate: function (V, st) { var s = st.score || {}; return ((s.w || 0) - (s.b || 0)) * 40; },
    status: function (ctx) { var s = ctx.state.score || {}; return 'Points: you ' + (s.w || 0) + ' · opponent ' + (s.b || 0) + ' (first to 25)'; }
  },
  todo_pass2: ['CONFIRM RULES: re-run the transcript (low confidence)', 'four players with boxes in the corners', 'pellet and ghost piece art (original SVG dot pellets, ghost sprite)', 'real maze layout from frames'],
  source: { research: 'research/modes/sO-lD2On610.json', confidence: 'low', notes: 'Two-player approximation; maze and pellet placement invented.' }
});
