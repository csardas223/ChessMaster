/* Can I BEAT Chess Survivors?  A Vampire-Survivors-style roguelike on a tiled arena: each turn you move your hero (the
   Joker: one square any direction) and abilities fire automatically; enemy chess pieces chase you in waves. Sources:
   research/modes/spJibM5qaNQ.json (Joker 350 HP, Cribbage pegs fired in horizontal lines alternating direction,
   movement coins, giant pawns with keys, Evil Joker boss), frames (#c5b9ac/#575758). PASS 1: survive 30 of your turns
   on a 9x9 arena; every 3 plies a new enemy spawns on the edge; every second turn Cribbage removes the first enemy in
   your row (alternating left/right). Losing the hero loses (one hit = death here; HP is pass 2). */
CM.mode({
  id: 'spJibM5qaNQ',
  title: 'Can I BEAT Chess Survivors?',
  name: 'Chess Survivors',
  category: 'Variants & Games',
  description: 'You are the Joker, alone in an arena. Step one square per turn while waves of enemy chess pieces close in. Your Cribbage ability fires pegs along your row every second turn, alternating directions, and wipes out the first enemy it hits.',
  how_to_win: 'Survive 30 turns.',
  player_side: 'white',
  player: { name: 'Joker', rating: null, avatar: 'assets/modes/spJibM5qaNQ/joker.png' },
  opponent: { name: 'The Horde', rating: null, avatar: 'assets/modes/spJibM5qaNQ/evil_joker.png', tagline: 'Waves of chess pieces and the Evil Joker.' },
  board: { files: 9, ranks: 9, light: '#c5b9ac', dark: '#575758', background: '#1c1b1d' },
  pieces: { /* art-g6: Joker hero + the salmon pixel enemy pieces cut from the video stills (tools/g6_art_pass2.py) */
    J: { name: 'Joker', moves: 'K', value: 2000, royal: true, img: 'assets/modes/spJibM5qaNQ/joker.png' },
    P: { img: { w: 'assets/pieces/cburnett/wP.svg', b: 'assets/modes/spJibM5qaNQ/pawn.png' } }, N: { img: { w: 'assets/pieces/cburnett/wN.svg', b: 'assets/modes/spJibM5qaNQ/knight.png' } }, B: { img: { w: 'assets/pieces/cburnett/wB.svg', b: 'assets/modes/spJibM5qaNQ/bishop.png' } }, R: { img: { w: 'assets/pieces/cburnett/wR.svg', b: 'assets/modes/spJibM5qaNQ/rook.png' } }, Q: { img: { w: 'assets/pieces/cburnett/wQ.svg', b: 'assets/modes/spJibM5qaNQ/queen.png' } }
  },
  setup: { fen: 'p3p3r/9/9/9/4[J]4/9/9/9/b7p' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q' }, win: [{ type: 'survive', moves: 30, color: 'w', why: 'you survived the act' }] },
  bot: { engine: 'search', depth: 2, time_ms: 400 },
  events: [
    { when: 'every_plies:3', do: { spawn: { type: 'P', color: 'b', at: 'random_empty', count: 1, rows: [0] } } },
    { when: 'every_plies:9', do: [{ spawn: { type: 'N', color: 'b', at: 'random_empty', count: 1, rows: [0, 8] } }, { message: 'A knight joins the horde.' }] }
  ],
  hooks: {
    afterMove: function (ctx, mv, info) {
      if (info.by !== 'player' || ctx.over) return;
      var n = Math.ceil(info.ply / 2); if (n % 2) return;
      var V = ctx.V, g = V.geo, k = V.royals(ctx.state, 'w')[0]; if (k == null) return;
      var dir = (n / 2) % 2 ? 1 : -1, j = k;
      for (;;) { j = g.step(j, dir, 0); if (j < 0) break; var p = ctx.at(j); if (p && p.c === 'b') { ctx.remove(j); ctx.fx({ type: 'overlay', image: 'assets/modes/spJibM5qaNQ/peg.png', fit: 'contain', at: g.name(j), duration_ms: 450, fade_ms: 200 }); ctx.fx({ type: 'particles', kind: 'sparks', at: g.name(j), count: 10 }); ctx.toast('Cribbage!', 900); ctx.refresh(); break; } }
    },
    status: function (ctx) { return 'Turn ' + Math.ceil(ctx.ply / 2) + '/30 · Cribbage fires every 2nd turn'; }
  },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/spJibM5qaNQ/title.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  todo_pass2: ['hero HP (350) and enemy damage instead of one-hit death', 'movement coins (bishop / rook / queen-like movement for a few turns)', 'giant pawns carrying keys, chests, level-up ability picks', 'acts with turn counts and the Evil Joker boss'],
  source: { research: 'research/modes/spJibM5qaNQ.json', confidence: 'medium', notes: 'Turn counts and wave sizes invented.' }
});
