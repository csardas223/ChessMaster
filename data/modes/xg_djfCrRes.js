/* Can I BEAT Labyrinth 82?  chess.com community 4-player FFA variant: a cross board with impenetrable stone walls, small
   armies on the back row (two pawns each), points for captures (checkmate 20). Sources: research/modes/xg_djfCrRes.json
   (transcript: walls, each king survives 8 checks, pawns promote on the 2nd rank and a double step skips it, promoted
   pieces at full value, checkmate 20, 1 min + 5 s), frame maxres1 (wall layout and armies read square by square; kings show their 8 lives),
   frame colours #dcdcdc/#b1b1b1. You are Blue as in game 1. Logic: js/modes/g6_4pc.js (lives / promoteRank / backDouble). */
CM.mode({
  id: 'xg_djfCrRes',
  title: 'Can I BEAT Labyrinth 82?',
  name: 'Labyrinth 82 (4 Player)',
  category: 'Variants & Games',
  description: 'Four small armies (king, queen, rooks, knights, bishops and two pawns each) on a cross-shaped board split up by stone walls. Nothing can enter or slide through a wall. Each king survives 8 checks: the 8th check knocks it out. Pawns promote on your 2nd rank, to any piece, at full value (a double step jumps past the promotion). Captures score points (pawn 1, knight 3, bishop 5, rook 5, queen 9); checkmating a player scores 20. One minute per player, +5 seconds a move.',
  how_to_win: 'Have the most points when the game ends.',
  player_side: 'u',
  player: { name: 'You', rating: 1900 },
  opponent: { name: 'Plankton', rating: 2100, tagline: 'Plankton (2100) to your right, Megan and JMeister.' },
  players: [{"color": "r", "forward": "up", "name": "Plankton", "swatch": "#bf3b43", "base": "w", "rating": 2100}, {"color": "u", "forward": "right", "name": "You", "swatch": "#4185bf", "base": "w"}, {"color": "y", "forward": "down", "name": "Megan", "swatch": "#c09526", "base": "w", "rating": null}, {"color": "g", "forward": "left", "name": "JMeister", "swatch": "#4e9161", "base": "w", "rating": null}],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#dcdcdc', dark: '#b1b1b1' },
  pieces: { '#': { name: 'Wall', value: 0, moves: '', blocker: true, capturable: false, overlay: null, img: 'assets/modes/xg_djfCrRes/stone_wall.png' } },   /* promoted pieces are ordinary pieces at full value: 11:58-12:10 "is it worth one point because it's a promoted pawn? ... it is worth nine points" */
  setup: { fen: '3[y:P]1[y:N][y:K][y:N][y:N][y:R][y:P]3/3.******.3/3.*......3/[u:P]..*.****.****/[u:N]****.**.**..[g:P]/[u:N]*.*.*..*..*[g:R]*/[u:K]*..*.*...**[g:N][g:K]/[u:N]*.**.*.*.*.*[g:N]/*.**..*..**..[g:P]/[u:R].*..*.*...**[g:N]/[u:P].**.******..*/3.*.....*3/3.*.****.3/3[r:P][r:N]*[r:K][r:N][r:R][r:N][r:P]3' },
  rules: { castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'], zone: 13 }, drawPlies: 200, win: [{ type: 'points', target: 9999, values: { P: 1, N: 3, B: 5, R: 5, Q: 9, K: 0 } }] },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { ffa: true, lives: 8, livesBig: true, promoteRank: 1, backDouble: true, clock4: { base: 60, inc: 5 }, names: { r: 'Plankton', u: 'You', y: 'Megan', g: 'JMeister' } },
  hooks: 'g6_4pc',
  source: { research: 'research/modes/xg_djfCrRes.json', confidence: 'medium', notes: 'Walls and armies read square by square from the video frame maxres1 (i.ytimg.com): cm_acc 2026-11-26 re-checked it square by square with a texture classifier: it is the pre-game intro board (every army on its back row, nothing moved), one square fixed (k9 was a wall, it is open). Transcript: 8 checks per king (22:10 "you just check someone eight times?"), 2nd-rank promotion, a double step skips it (2:23, 21:01), promoted pieces at FULL value (12:10 "it is worth nine points"; the old 1-point promoted types were wrong), 1 minute per player + 5 s increment (7:51), names Plankton 2100 to your right (0:29, red), Megan and JMeister (seats inferred). Board colours sampled from maxres1 (#dcdcdc / #b1b1b1). Not built: a resigned or disconnected player\'s king turning into a bot that keeps playing (4:45, 14:19, 25:42); here a knocked-out army turns grey. art-audit-b: stone wall tile trimmed of a magenta strip left from the crop.' }
});
