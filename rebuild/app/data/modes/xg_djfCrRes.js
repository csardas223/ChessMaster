/* Can I BEAT Labyrinth 82?  chess.com community 4-player FFA variant: a cross board with impenetrable stone walls, small
   armies with two pawns each, points for captures (checkmate 20). Sources: research/modes/xg_djfCrRes.json (rules from
   transcript: walls, 8 checks per king, pawns with 2 each, promoted pawn worth 1, eliminated kings become bots),
   frames (#aeaeae/#7e8a8a). PASS 1 approximations: the wall layout is invented (frames illegible), the "8 checks"
   king-life rule is not modelled (normal checkmate), promotion on the centre line as in 4 Player Chess.
   You are Blue as in game 1. Shared 4PC logic js/modes/g5_4pc.js (group 5 lib, read-only). */
CM.mode({
  id: 'xg_djfCrRes',
  title: 'Can I BEAT Labyrinth 82?',
  name: 'Labyrinth 82 (4 Player)',
  category: 'Variants & Games',
  description: 'Four small armies (king, queen, rooks, knights, bishops and two pawns each) on a cross-shaped board split up by stone walls. Nothing can enter or slide through a wall. Captures score points; checkmating a player scores 20.',
  how_to_win: 'Have the most points when the game ends.',
  player_side: 'u',
  player: { name: 'You', rating: 1900 },
  opponent: { name: 'Plankton', rating: 2100, tagline: 'Plankton (2100), Megan and JMeister.' },
  players: [{"color": "r", "forward": "up", "name": "Red", "swatch": "#bf3b43", "base": "w", "rating": 2100}, {"color": "u", "forward": "right", "name": "You", "swatch": "#4185bf", "base": "w"}, {"color": "y", "forward": "down", "name": "Yellow", "swatch": "#c09526", "base": "w", "rating": 1900}, {"color": "g", "forward": "left", "name": "Green", "swatch": "#4e9161", "base": "w", "rating": 1800}],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#aeaeae', dark: '#7e8a8a' },
  pieces: { PQ: { name: 'Promoted Queen', moves: 'Q', value: 880, glyph: 'Q', badge: '1', san: 'Q', points: 1 } },
  setup: { fen: '3[y:R][y:N][y:B][y:K][y:Q][y:B][y:N][y:R]3/3**1[y:P][y:P]1**3/14/[u:R]*4*5*[g:R]/[u:N]*2**2**2*[g:N]/[u:B]3*4*3[g:B]/[u:Q][u:P]4*3*1[g:P][g:K]/[u:K][u:P]1*3*4[g:P][g:Q]/[u:B]3*4*3[g:B]/[u:N]*2**2**2*[g:N]/[u:R]*5*4*[g:R]/14/3**1[r:P][r:P]1**3/3[r:R][r:N][r:B][r:Q][r:K][r:B][r:N][r:R]3' },
  rules: { castling: false, enPassant: false, promotion: { auto: 'PQ', choices: ['PQ'], zone: 7 }, drawPlies: 200, win: [{ type: 'points', target: 9999, values: { P: 1, N: 3, B: 5, R: 5, Q: 9, PQ: 1, K: 0 } }] },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { ffa: true, names: { r: 'Plankton', u: 'You', y: 'Megan', g: 'JMeister' } },
  hooks: 'g5_4pc',
  todo_pass2: ['real Labyrinth 82 wall layout (re-check frames)', 'king survives 8 checks (life counter per king)', 'relative 2nd-rank promotion and the double-step-skips-promotion quirk', 'stone wall art'],
  source: { research: 'research/modes/xg_djfCrRes.json', confidence: 'low', notes: 'Walls and army layout invented; scoring per transcript.' }
});
