/* Can I BEAT Cornered Kings?  chess.com variant 'Cornered' (by BlueYoshi21, variants.world/posts/1813) vs humans ~1500-1650.
   Re-checked from the transcript (cm-recheck2 2026-11-25, analyze_video): 0:01 "the goal is for each player to place their royal king
   on their corresponding highlighted square. The two other kings play as normal pieces. We also have three variant pieces: the dragon
   knight, which is a knight that can't jump. The sergeant, which moves and captures forwards and diagonally, and the soldiers, which
   are pawns that move and capture straight ahead"; 0:26 yellow moves second (Red first); 3:26 three minutes, no increment.
   Board + start position: the variant FEN4 (10x8: four stone files with two open rows, royal kings in the pockets at a6 / a3, hill
   squares d6 / d3; promote on the rank level with your royal king to a General or a Rook; stalemate loses; checkmate also wins),
   matching the video stills maxres2/maxres3 square by square. Art: every red/yellow piece, the royal fleur-de-lis kings and the hill
   square cut from those stills (tools/recheck2_cornered_art.py); stone wall from research sprites. Player = Red (as in both stills). */
(function () {
  var A = 'assets/modes/y5MBC8OCYlI/';
  function im(n) { return { w: A + n + '_r.png', b: A + n + '_y.png' }; }
  CM.mode({
    id: 'y5MBC8OCYlI',
    title: 'Can I BEAT Cornered Kings?',
    name: 'Cornered',
    category: 'Variants & Games',
    description: 'Your royal king (fleur-de-lis badge) starts walled into a corridor on the left; walk it onto the shaded square at the end of its corridor to win, or checkmate the enemy royal king. Your other king is an ordinary piece. Dragon Knight = a knight that cannot jump; Sergeant = moves and captures one square forward or diagonally forward; Soldier = moves and captures one square straight ahead. Soldiers and Sergeants promote to a General (king + knight) or a Rook on the rank level with your royal king. Stalemating yourself loses.',
    how_to_win: 'Put your royal king on its shaded square, or checkmate the enemy royal king.',
    player_side: 'white',
    player: { name: 'You', rating: 1741, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
    opponent: { name: 'Anna_mam', rating: 1651, avatar: null, tagline: 'Plays Yellow (moves second).' },
    board: { files: 10, ranks: 8, light: '#dbdbdb', dark: '#acacac',
      squares: { d6: { image: A + 'hill.png', opacity: 1 }, d3: { image: A + 'hill.png', opacity: 1 } } },
    pieces: {
      '#': { name: 'Stone wall', value: 0, moves: '', blocker: true, capturable: false, overlay: null, img: A + 'stone_wall.png' },
      K: { name: 'Royal king', moves: 'K', royal: true, castle: false, value: 0, img: im('royal') },
      U: { name: 'King', moves: 'K', value: 350, badge: null, img: im('king') },
      H: { name: 'Dragon Knight', moves: 'nN', value: 260, img: im('dknight') },
      N: { name: 'Knight', moves: 'N', value: 300, img: im('knight') },
      B: { name: 'Bishop', moves: 'B', value: 320, img: im('bishop') },
      S: { name: 'Sergeant', moves: 'fWfFifmnD', value: 160, pawn: true, promote: true, img: im('sergeant') },
      O: { name: 'Soldier', moves: 'fWifmnD', value: 100, pawn: true, promote: true, img: im('soldier') },
      Z: { name: 'General', moves: 'KN', value: 650, glyph: 'N', badge: 'G' },
      R: { name: 'Rook', moves: 'R', value: 500, glyph: 'R' }
    },
    setup: { fen: '****husbns/****oooooo/K1u7/****6/****6/k1U7/****OOOOOO/****HUSBNS' },
    rules: { castling: false, enPassant: false, stalemate: 'loss', promotion: { choices: ['Z', 'R'], zone: 3 },
      win: [{ type: 'checkmate' }, { type: 'reach', squares: 'd6 d3', piece: 'K', why: 'royal king reached its square' }] },
    clock: { w: 180, b: 180, inc: 0 },
    bot: { engine: 'search', elo: 1650, depth: 3, time_ms: 700 },
    source: { research: 'research/modes/y5MBC8OCYlI.json', confidence: 'high', notes: 'Rules from the transcript + the variant page, layout from the stills. Inferred/left out: the variant\'s "bare piece" win, kings of the same colour touching counting as check, en passant; General art (promotion only, never on a still) is a knight with a G badge.' }
  });
})();
