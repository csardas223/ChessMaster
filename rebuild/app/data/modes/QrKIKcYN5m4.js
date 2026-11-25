/* Can I BEAT Stone Gravitation?  Yellow vs Red armies on a grey chess.com variants board vs ilikecheese (1583).
   Sources: research/modes/QrKIKcYN5m4.json (LOW confidence: transcript fetch failed, gravity not visible in stills),
   frames (#DBDBDB/#ACACAC, yellow vs red full armies, me 1765). PASS 1: plays as standard chess with the frame colours;
   the exact Stone Gravitation rule is unknown and listed in todo_pass2 (id is in the HANDOFF low-confidence recheck list). */
CM.mode({
  id: 'QrKIKcYN5m4',
  title: 'Can I BEAT Stone Gravitation?',
  name: 'Stone Gravitation',
  category: 'Variants & Games',
  description: 'Yellow against Red on a grey board. (The special Stone Gravitation rule still has to be confirmed from the video; for now this is played as normal chess.)',
  how_to_win: 'Checkmate the red king.',
  player_side: 'white',
  player: { name: 'You', rating: 1765 },
  opponent: { name: 'ilikecheese', rating: 1583, tagline: 'Stone Gravitation opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#DBDBDB', dark: '#ACACAC' },
  bot: { engine: 'auto', elo: 1583 },
  hooks: {
    setup: function (ctx) { ctx.pieces(function (p) { return p.c === 'w' || p.c === 'b'; }).forEach(function (i) { var p = ctx.at(i); ctx.set(i, Object.assign({}, p, { cls: p.c === 'w' ? 'pc--tint-y' : 'pc--tint-r' })); }); },
    decorate: function (ctx, sq, p) { return p && p.c === 'b' ? { img: CM.settings.pieceUrl('w', p.t) } : null; },
    stockfishOk: true
  },
  todo_pass2: ['CONFIRM RULES: re-run the transcript (low confidence); "stone"/"gravitation" mechanic unknown', 'thumbnail caged gold king', 'meme overlay seen in frames'],
  source: { research: 'research/modes/QrKIKcYN5m4.json', confidence: 'low', notes: 'Rules unknown; standard chess placeholder.' }
});
