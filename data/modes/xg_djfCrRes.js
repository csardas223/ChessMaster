/* Can I BEAT Labyrinth 82?  chess.com community 4-player FFA variant: a cross board with impenetrable stone walls, small
   armies on the back row (two pawns each), points for captures (checkmate 20). Sources: research/modes/xg_djfCrRes.json
   (transcript: walls, each king survives 8 checks, pawns promote on the 2nd rank and a double step skips it, promoted
   pawn worth 1, checkmate 20), frame maxres1 (wall layout and armies read square by square; kings show their 8 lives),
   frames colours #aeaeae/#7e8a8a. You are Blue as in game 1. Logic: js/modes/g6_4pc.js (lives / promoteRank / backDouble). */
CM.mode({
  id: 'xg_djfCrRes',
  title: 'Can I BEAT Labyrinth 82?',
  name: 'Labyrinth 82 (4 Player)',
  category: 'Variants & Games',
  description: 'Four small armies (king, queen, rooks, knights, bishops and two pawns each) on a cross-shaped board split up by stone walls. Nothing can enter or slide through a wall. Each king survives 8 checks (the next one is mate). Pawns promote on your 2nd rank (a double step jumps past it). Captures score points; checkmating a player scores 20.',
  how_to_win: 'Have the most points when the game ends.',
  player_side: 'u',
  player: { name: 'You', rating: 1900 },
  opponent: { name: 'Plankton', rating: 2100, tagline: 'Plankton (2100), Megan and JMeister.' },
  players: [{"color": "r", "forward": "up", "name": "Red", "swatch": "#bf3b43", "base": "w", "rating": 2100}, {"color": "u", "forward": "right", "name": "You", "swatch": "#4185bf", "base": "w"}, {"color": "y", "forward": "down", "name": "Yellow", "swatch": "#c09526", "base": "w", "rating": 1900}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w", "rating": 1800}],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#aeaeae', dark: '#7e8a8a' },
  pieces: { '#': { name: 'Wall', value: 0, moves: '', blocker: true, capturable: false, overlay: null, img: 'assets/modes/xg_djfCrRes/stone_wall.png' }, PQ: { name: 'Promoted Queen', moves: 'Q', value: 880, glyph: 'Q', badge: '1', san: 'Q', points: 1 }, PR: { name: 'Promoted Rook', moves: 'R', value: 480, glyph: 'R', badge: '1', san: 'R', points: 1 }, PB: { name: 'Promoted Bishop', moves: 'B', value: 320, glyph: 'B', badge: '1', san: 'B', points: 1 }, PN: { name: 'Promoted Knight', moves: 'N', value: 300, glyph: 'N', badge: '1', san: 'N', points: 1 } },
  setup: { fen: '3[y:P]1[y:N][y:K][y:N][y:N][y:R][y:P]3/3.******.3/3.*......3/[u:P]..*.****.****/[u:N]****.**.**..[g:P]/[u:N]*.*.*..*.**[g:R]*/[u:K]*..*.*...**[g:N][g:K]/[u:N]*.**.*.*.*.*[g:N]/*.**..*..**..[g:P]/[u:R].*..*.*...**[g:N]/[u:P].**.******..*/3.*.....*3/3.*.****.3/3[r:P][r:N]*[r:K][r:N][r:R][r:N][r:P]3' },
  rules: { castling: false, enPassant: false, promotion: { choices: ['PQ', 'PN', 'PR', 'PB'], zone: 13 }, drawPlies: 200, win: [{ type: 'points', target: 9999, values: { P: 1, N: 3, B: 5, R: 5, Q: 9, PQ: 1, PR: 1, PB: 1, PN: 1, K: 0 } }] },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { ffa: true, lives: 8, promoteRank: 1, backDouble: true, names: { r: 'Plankton', u: 'You', y: 'Megan', g: 'JMeister' } },
  hooks: 'g6_4pc',
  source: { research: 'research/modes/xg_djfCrRes.json', confidence: 'low', notes: 'Walls and armies read square by square from the video frame maxres1 (i.ytimg.com, the opening of game 1; a few pieces may already have moved). 8 checks per king, 2nd-rank promotion (a double step skips it) and promoted pieces worth 1 per transcript. art-audit-b: stone wall tile trimmed of a magenta strip left from the crop.' }
});
