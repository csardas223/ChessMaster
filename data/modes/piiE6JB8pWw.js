/* Can I BEAT Tiny Chess?  chess.com "Tiny House Chess": a 4x4 board, captured pieces can be placed back (crazyhouse drops),
   three new pieces: the Ferz ("moves like an X"), the Dragon Knight ("a knight that can't jump") and the Wazir ("moves like a
   plus", the narrator calls it Bob). Goal: win three games (vs three unique opponents), 1-minute games.
   Sources: research/modes/piiE6JB8pWw.json; transcript recheck 2026-11-25 (analyze_video) 0:01 rules, 0:23 Bob, 1:06 the dragon
   knight "can't move anymore because it can't jump over other pieces", 2:32 "we only get a minute", 3:54 promotion choice Bob /
   ferz / dragon knight; frames maxres1-3 (army K, wazir, dragon knight, ferz, pawn, point-symmetric; impl-6 art). The Dragon Knight
   rule is spelled out in the next episode (gY9DNg9xDUM 0:23): one square orthogonally then one diagonally, blocked by a piece on
   the orthogonal square (= lame knight 'nN'); it was a jumping knight here before the recheck. */
CM.mode({
  id: 'piiE6JB8pWw',
  name: 'Tiny House Chess',
  category: 'Variants & Games',
  description: 'Tiny House Chess: a 4x4 board with a king, a Wazir ("Bob", moves like a plus), a Dragon Knight (a knight that cannot jump: one square straight, then one diagonally, blocked if the straight square is occupied), a Ferz (moves like an X) and a pawn per side. Pieces you capture can be placed back on any empty square instead of moving. Pawns promote to a Bob, Ferz or Dragon Knight. Win three games.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  player: { name: 'ireallywantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's chess.com handle + purple-king avatar from the frames */
  opponent: { name: 'Klub4Konej', rating: 1460, avatar: 'assets/modes/piiE6JB8pWw/opp1.png', tagline: 'Tiny Chess regular.' },
  board: { files: 4, ranks: 4, light: '#eaf6d2', dark: '#7ea25a' },
  setup: { fen: 'fnwk/3p/P3/KWNF', moved: ['d3', 'a2'] },
  rules: { castling: false, enPassant: false, drops: true, promotion: { choices: ['N', 'W', 'F'] } },
  pieces: { P: { name: 'Pawn', moves: 'fmWfcF', pawn: true, promote: true, value: 100 },
    N: { name: 'Dragon Knight', moves: 'nN', value: 220, img: { w: 'assets/modes/piiE6JB8pWw/knight_w.png', b: 'assets/modes/piiE6JB8pWw/knight_b.png' } },
    W: { name: 'Wazir', moves: 'W', value: 150, glyph: null, badge: null, img: { w: 'assets/modes/piiE6JB8pWw/bishop_w.png', b: 'assets/modes/piiE6JB8pWw/bishop_b.png' } },
    F: { name: 'Ferz', moves: 'F', value: 150, glyph: null, badge: null, img: { w: 'assets/modes/piiE6JB8pWw/spike_w.png', b: 'assets/modes/piiE6JB8pWw/spike_b.png' } } },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1460, depth: 4, time_ms: 600 },
  params: { series: {opponents: [{name: 'Klub4Konej', rating: 1460, avatar: 'assets/modes/piiE6JB8pWw/opp1.png'}, {name: 'purrberry', rating: 1479, avatar: 'assets/modes/piiE6JB8pWw/opp2.png'}]} },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/piiE6JB8pWw/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/piiE6JB8pWw.json', confidence: 'high', notes: 'Rechecked against the transcript 2026-11-25: drops, Ferz/Wazir/non-jumping Dragon Knight, promotion choices, 1-minute clock confirmed. art-audit-b: opponent avatar swapped for the same chess.com profile picture at 200px (api.chess.com/pub/player/<username> avatar), exact match to the video crop. blurry-b 2026-11-26: spike_w.png / spike_b.png (Ferz) re-traced to clean vector shapes (palette-quantised, potrace, re-rendered as a 512px transparent PNG at ~90%, hard anti-aliased edges, no fading; tool tools/sprite_vec.py) from the existing video crop, because no copy of the same image was found online.' }
});
