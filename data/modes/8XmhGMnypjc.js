/* Can I BEAT 4 Player Team Chess?  chess.com Team 4-Player Chess with YouTuber Croissant: opposite seats are teammates
   (Red + Yellow vs Blue + Green). Checkmating either player of the enemy team wins for the team; they won 3/3.
   Sources: research/modes/8XmhGMnypjc.json (blue ~1500, green ~1800). Board/setup as IjUqZLgF_xM (14x14 cross).
   PASS 1: you are Red (bottom); Croissant (Yellow) is an allied bot. */
var g4TeamChatAt = -9;  /* ply of Croissant's last chat line */
function g4TeamChat(ctx, info) {
  var say = null, side = info && info.side;
  if (!info || ctx.over || (ctx.ply || 0) - g4TeamChatAt < 3) return;
  if (info.check && side === 'y') say = 'checks are always dangerous';
  else if (info.check && (side === 'u' || side === 'g')) say = "I'm glad you're looking out for my checks";
  else if (info.capture && side === 'y') say = ctx.pick(['sweet', 'I just take it', 'that is super free']);
  else if (info.capture && side === 'r') say = ctx.pick(['nice', 'that looks good', 'dude we might actually be 1600 by the end of this']);
  else if (info.capture && (side === 'u' || side === 'g') && ctx.chance(0.5)) say = ctx.pick(["oh no", "I don't know what I was panicking for"]);
  else if (side === 'y' && ctx.chance(0.12)) say = ctx.pick(['these yellow pieces match my profile picture', "if we can trade off our opponent's Bishops that would be good", 'attacking is always good']);
  if (say) { g4TeamChatAt = ctx.ply || 0; ctx.toast('Croissant: ' + say, 2200); }
}
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
    /* impl-4 pass 2: teammate chat. Croissant's lines are quoted from the video's transcript (0:01, 13:56, 14:19, 14:39,
       17:42, 17:52, 18:16, 16:00, 30:16), shown as a short chat toast; never more than one line every 3 plies. */
    onStart: function (ctx) { g4TeamChatAt = -9; ctx.after(1700, function () { ctx.toast("Croissant: hello I'm Croissant and I love chess"); }); },
    afterMove: function (ctx, m, info) { ctx.after(60, function () { g4TeamChat(ctx, info); }); },  /* deferred: info.check is set after the hook */
    checkWin: function (V, st) {
      var out = st.out || {};
  if (out.u || out.g) return { w: 'r', team: 1, why: (out.u ? 'Blue' : 'Green') + ' was checkmated: your team wins' };
  if (out.r || out.y) return { w: 'u', team: 2, why: (out.r ? 'you were' : 'Croissant was') + ' checkmated' };
      return null;
    }
  },
  source: { research: 'research/modes/8XmhGMnypjc.json', confidence: 'high', notes: 'Seat colours and partner AI inferred; team = opposite seats. Teammate chat = Croissant lines quoted from the transcript (the video has voice chat, not text chat), shown as toasts.' }
});
