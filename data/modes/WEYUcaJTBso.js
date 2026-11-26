/* Can I BEAT King of the Bridge?  Indie pixel-art game: a riddle-loving troll on a bridge challenges you to 'the 11th
   edition of Advanced Troll Chess'. A rule book lists numbered rules; the troll cheats; press Space, pick the piece
   and the rule it broke. Correct = 'Officer, arrest him' (payback); false accusation = your turn is forfeited and the
   troll cheats as revenge. Losing your king ends the game; the troll's king passes its crown. He wins by out-waiting
   the troll and catching every cheat. Sources: research/modes/WEYUcaJTBso.json (rules 00-25), frames (pixel art,
   rule book overlay). Logic in js/modes/g5_troll.js. PASS 2: the game's pixel pieces cut from the video stills (tools/g5_frames.py) + the troll from the video (tools/g5_sprites.py), synthesised sounds (tools/g5_sounds.py), dialogue, slippery tiles, rule unlocks, payback. Still missing: see _deferred. */
CM.mode({
  id: 'WEYUcaJTBso',
  title: 'Can I BEAT King of the Bridge?',
  name: 'King of the Bridge',
  category: 'Variants & Games',
  description: "Advanced Troll Chess on the bridge. The Troll cheats: when his last move broke a rule, press Accuse (or Space) and pick that rule from the rule book. A correct accusation gets the cheating piece arrested; a false one forfeits your turn and the Troll cheats as revenge. Troll rules (the game's rule book): pawns step one square forward, sideways or back and never diagonally; only the horse guy jumps; the crown guy is lazy (one square); towers move straight; only bishops work out of town (the dark ring around the board) and they drop a gift of knowledge on every tile they leave: whatever lands on a gift blows up with it, sliders pass over it; the queen may not touch the king, and a queen capture flips the world sideways; pawns on the far row ascend; you may also move the Troll's queen once rule 3 is in the book; hidden slippery tiles knock a piece over (spend a turn standing it up); when the Troll's king dies the crown passes on, so you win only when every Troll piece is gone. If your king dies, you lose. Catch a cheat and you may cheat once yourself: move any piece anywhere, drop a Troll piece on a gift, or tap a gift and then a Troll piece. Many pages are hidden at first and join the book with a gong when the game first uses them.",
  how_to_win: 'Remove every Troll piece (catch its cheats) without losing your king.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/WEYUcaJTBso/troll.png', tagline: 'Guards the bridge. Cheats. A lot.' },
  board: { files: 10, ranks: 10, light: '#c8b98a', dark: '#5b6b3a' },
  theme: { background: '#1f2a2e', pieces: '../modes/WEYUcaJTBso/pixel' },
  pieces: { P: { name: 'Pawn (small-minded)', moves: 'W', pawn: true, promote: false, value: 100 } },
  setup: { fen: '10/1rnbqkbnr1/1pppppppp1/10/10/10/10/1PPPPPPPP1/1RNBQKBNR1/10' },
  rules: { check: { w: 'none', b: 'none' }, castling: false, enPassant: false, drawPlies: 400, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 500, min_ms: 400 },
  params: { cheatChance: 0.25, falseAccusation: 'forfeit', payback: 'any', fullBook: true, outOfTown: true, gifts: true, giftImg: 'assets/modes/M0rsyuvaTrk/gift.svg', ascend: true, queenMirror: true, slipRandom: 2, unlock: { 13: 12, 9: 24, 12: 30, 14: 34, 29: 50, 3: 60 }, hidden: [4, 6, 15, 20, 21, 22, 27], bookImg: 'assets/modes/M0rsyuvaTrk/rulebook.png', trollImg: 'assets/modes/WEYUcaJTBso/troll.png', intro: ['Halt! None shall cross my bridge...', 'Unless you beat me at the 11th edition of Advanced Troll Chess.', 'The rules are in the book. I would NEVER cheat. Hehehe.'], endCutscene: ['Cheater.', 'I may not have won the game, but at least I will leave a worthy successor.', 'You treated me so nicely. I hated you for no reason.', 'Your final evolution: you become the Troll.', 'You remain on the bridge.'] },
  sounds: { gong: 'assets/modes/WEYUcaJTBso/gong.wav', arrest: 'assets/modes/WEYUcaJTBso/arrest.wav' },
  hooks: 'g5_troll',
  _deferred: ['valorite scraps / castles (rules 16-17, 23, 28)', 'Acts 1-3 overworld walk and retry screen'],
  source: { research: 'research/modes/WEYUcaJTBso.json', confidence: 'medium', notes: 'acc 2026-11-26: real rule numbers and wording, out-of-town ring for bishops (rules 15/25), gifts (22/27), troubled knight / lazy king / towers / shoes cheats (7/12/14/24), hidden pages revealed on first use, payback any-piece cheat, queen-capture mirror (21), ending cutscene. Inferred: 10x10 ring for off-board space, which cheats the Troll prefers (Steam guide), unlock plies.' }
});
