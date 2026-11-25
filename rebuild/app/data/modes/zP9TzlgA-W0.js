/* Can I MASTER Pawnbarian?  Steam roguelike deck-builder: a single hero on a small grid against monsters; each turn you
   draw piece cards (pawn, knight, bishop, rook, queen, king) and the hero moves/attacks with that piece's pattern, two
   actions per turn; monsters punish the squares they target. Sources: research/modes/zP9TzlgA-W0.json, frames
   (#dde8eb/#36355b). PASS 1: a 5x5 floor; three cards are drawn every turn and the hero may use any of their patterns
   for each of its two actions; monsters move like kings (Cappy Bears) or ferzes (Horned, diagonal only). Hearts are
   pass 2 (a monster reaching the hero kills it). */
CM.mode({
  id: 'zP9TzlgA-W0',
  title: 'Can I MASTER Pawnbarian?',
  name: 'Pawnbarian',
  category: 'Variants & Games',
  description: 'Your Pawnbarian hero moves with cards: every turn three piece cards are dealt (pawn, knight, bishop, rook, queen, king) and the hero takes two actions, each with one of the dealt patterns. Moving into a monster attacks it. Clear the floor before the monsters corner you.',
  how_to_win: 'Defeat every monster on the floor.',
  player_side: 'white',
  player: { name: 'Pawnbarian', rating: null, avatar: 'assets/modes/zP9TzlgA-W0/hero.png' },
  opponent: { name: 'Monsters', rating: null, avatar: 'assets/modes/zP9TzlgA-W0/skull_enemy.png', tagline: 'Cappy Bears and horned beasts.' },
  board: { files: 5, ranks: 5, light: '#dde8eb', dark: '#36355b', background: '#191830' },
  pieces: { /* art-g6: hero + monsters cut from the video frames (tools/g6_art_pass2.py) */
    H: { name: 'Pawnbarian', moves: '', value: 2000, royal: true, img: 'assets/modes/zP9TzlgA-W0/hero.png', gen: 'hero' },
    U: { name: 'Cappy Bear', moves: 'K', value: 300, img: 'assets/modes/zP9TzlgA-W0/cappy_bear.png', badge: '' },
    F: { name: 'Horned Cappy Bear', moves: 'F', value: 250, img: 'assets/modes/zP9TzlgA-W0/horned_bear.png', badge: '' }
  },
  setup: { fen: 'u1f1u/5/5/5/2[H]2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: false, movesPerTurn: { w: 2, b: 1 }, win: [{ type: 'eliminate', why: 'every monster was defeated' }] },
  bot: { engine: 'search', depth: 3, time_ms: 450 },
  hooks: {
    hero: function (V, st, from, p, out) {
      var cards = (st.x && st.x.cards) || ['K'];
      var seen = {};
      cards.forEach(function (c) {
        var st2 = Object.assign({}, st, { b: st.b.slice() }); st2.b[from] = Object.assign({}, p, { t: c === 'P' ? 'Hp' : c });
        var tmp = []; V.genPiece(st2, from, tmp, true);
        tmp.forEach(function (m) { if (seen[m.t]) return; seen[m.t] = 1; m.p = 'H'; delete m.promo; delete m.dbl; out.push(m); });
      });
    },
    setup: function (ctx) { ctx.state.x = Object.assign({}, ctx.state.x, { cards: ['K', 'N', 'P'] }); },
    onTurn: function (ctx, c) { if (c !== ctx.human || ctx.over) return; if (ctx.state.x.dealtAt === ctx.ply) return; var deck = ['P', 'P', 'N', 'N', 'B', 'R', 'Q', 'K']; var h = []; while (h.length < 3) h.push(ctx.pick(deck)); ctx.setX('cards', h); ctx.setX('dealtAt', ctx.ply); ctx.refresh(); },
    status: function (ctx) { var n = { P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' }; return 'Cards: ' + ((ctx.state.x.cards || []).map(function (c) { return n[c]; }).join(' · ')); }
  },
  todo_pass2: ['card hand UI (pick which card each action uses; cards are spent)', 'hearts and red targeted-square notches, monster attack phase', 'promotion by reaching the top row', 'floors, shop, deck upgrades, bosses'],
  source: { research: 'research/modes/zP9TzlgA-W0.json', confidence: 'medium', notes: 'Cards are patterns available to both actions; monster set simplified.' }
});
