/* Chess, But I Can't Break the Laws of Islam: a normal game vs Martin played under self-imposed rules the narrator
   draws from Islamic principles. Kept respectful and neutral (spec design_note): the rules are shown as the video
   states them, with no commentary. Sources: research/modes/IwbWTK5_1nY.json (0:22-1:15 no resigning, plain chess
   only; 1:15 profession of faith typed in chat before move 1; 2:04-2:48 give back 25% (rounded up) of material gained
   before checkmate; 3:30 "Bismillah, Allahu Akbar" typed before capturing a knight; 4:09 22 gained -> 6 to give back;
   5:15 Qd8 sacrifice; 5:23 Re8 mate; peace greeting typed after the win).
   Inferred: "gained" = material you captured, "given back" = your material Martin captured (P1 N3 B3 R5 Q9); the
   chat lines are shown as chat bubbles typed for you. Sadaqah card and crossed-out spell icons are cropped from the video frames (research/frames/sprites, owner instruction), credit iwantcheckmate. The app has no resign button, so "no resigning" needs no code. */
(function () {
'use strict';
CM.mode({
  id: 'IwbWTK5_1nY',
  title: "Chess, But I Can't Break the Laws of Islam",
  name: 'Laws of Islam',
  category: 'Powerups & Rule Twists',
  description: 'Standard chess against Martin under the video\'s rules: no resigning and no magic (plain chess only). The profession of faith is typed in chat before your first move, and "Bismillah, Allahu Akbar" before you capture a knight. Before you may checkmate, you must give back at least 25% (rounded up) of the material you have won, as sadaqah.',
  how_to_win: 'Checkmate Martin, after giving back at least a quarter of the material you gained.',
  player_side: 'white',
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.svg', tagline: 'chess.com beginner bot.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#ebecd0', dark: '#739552' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { gained: 0, given: 0, spoke: 0 } },
  bot: { engine: 'search', style: 'elo', elo: 250 },
  params: { share: 0.25, values: { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 } },
  assets: { sadaqah: 'assets/modes/IwbWTK5_1nY/sadaqah.png', spell_x: 'assets/modes/IwbWTK5_1nY/spell_x.png', potion: 'assets/modes/IwbWTK5_1nY/potion.png', bottle: 'assets/modes/IwbWTK5_1nY/bottle.png' },
  messages: { win: 'checkmate after giving back your sadaqah', win_title: 'You Won!' },
  vfx: [],
  hooks: {
    onStart: function (ctx) {
      ctx.fx({ type: 'overlay', at: 'board', duration_ms: 3200, fade_ms: 260, html: card('House rules', '<div style="display:flex;justify-content:center;gap:8px;margin:2px 0 6px"><img src="assets/modes/IwbWTK5_1nY/spell_x.png" alt="" style="width:44px;height:44px;border-radius:6px"><img src="assets/modes/IwbWTK5_1nY/potion.png" alt="" style="width:44px;height:44px;border-radius:6px;filter:grayscale(.2)"><img src="assets/modes/IwbWTK5_1nY/bottle.png" alt="" style="width:44px;height:44px;border-radius:6px"></div><div>No resigning.</div><div>No spells, no potions: plain chess only.</div><div>Give back 25% of what you win before checkmate.</div>') });
    },
    beforeMove: function (ctx, m) {
      var x = ctx.state.x || {}, V = ctx.V, cap = ctx.at(m.t);
      if (!x.spoke) { chat(ctx, 'Ashhadu an la ilaha illa Allah, wa ashhadu anna Muhammadan rasul Allah'); ctx.setX('spoke', 1); }
      if (cap && cap.t === 'N' && cap.c !== ctx.human) chat(ctx, 'Bismillah, Allahu Akbar');
      var n = m.n || V.make(ctx.state, m);
      var mate = V.inCheck(n, ctx.bot) && !V.legal(n).length;
      if (mate) {
        var need = needed(ctx), given = x.given || 0;
        if (given < need) {
          ctx.toast('Sadaqah first: give back ' + (need - given) + ' more point' + (need - given === 1 ? '' : 's') + ' of material before checkmate.', 3600);
          ctx.fx({ type: 'overlay', at: 'board', duration_ms: 2400, fade_ms: 220, html: card('<img src="assets/modes/IwbWTK5_1nY/sadaqah.png" alt="Sadaqah" style="display:block;width:100%;border-radius:4px">', '<div>Gained: ' + (x.gained || 0) + '</div><div>Given back: ' + given + ' of ' + need + '</div>') });
          return false;
        }
      }
      return true;
    },
    afterMove: function (ctx, m, info) {
      if (!info.captured) return;
      var v = ctx.params.values[info.captured.t] || 0, x = ctx.state.x || {};
      if (info.by === 'player') ctx.setX('gained', (x.gained || 0) + v);
      else ctx.setX('given', (x.given || 0) + v);
    },
    onGameOver: function (ctx, r) {
      if (r && r.w === ctx.human) chat(ctx, 'As-salamu alaykum');
    },
    status: function (ctx) {
      var x = ctx.state.x || {}, need = needed(ctx);
      return 'Gained ' + (x.gained || 0) + ' · given back ' + (x.given || 0) + (need ? ' / ' + need + ' needed' : '');
    }
  },
  todo_pass2: [],
  source: { research: 'research/modes/IwbWTK5_1nY.json', confidence: 'high', notes: 'material accounting inferred (captured vs lost); respectful, neutral treatment per design_note' }
});

function needed(ctx) { var x = ctx.state.x || {}; return Math.ceil((x.gained || 0) * ctx.params.share); }
function chat(ctx, text) {
  ctx.toast('You (chat): ' + text, 3000);
  ctx.fx({ type: 'overlay', at: 'board', duration_ms: 2600, fade_ms: 200, html: '<div style="position:absolute;left:6%;right:6%;bottom:6%;background:rgba(38,36,33,.92);color:#fff;border-radius:10px;padding:8px 12px;font:600 14px/1.35 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.4)"><span style="color:#81b64c">You:</span> ' + CM.util.esc(text) + '</div>' });
}
/* parchment card (original styling, CSS only) */
function card(title, body) {
  return '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:72%;max-width:300px;background:linear-gradient(#f4e7c5,#e8d3a0);color:#3b2a12;border:2px solid #a9864a;border-radius:8px;padding:12px 14px;font:500 14px/1.45 Georgia,serif;text-align:center;box-shadow:0 6px 18px rgba(0,0,0,.45)"><div style="font:700 17px Georgia,serif;margin-bottom:6px">' + title + '</div>' + body + '</div>';
}
})();
