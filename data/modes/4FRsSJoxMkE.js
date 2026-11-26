/* RETURN of the iwantcheckmage...  (m-accuracy 2026-11-26, accuracy_audit P1; was a legacy 'fairy' Mage stand-in)
   Chess Ultimate again with the IWC Mage skin: MAKE A TEAM! (100 points, first three ranks; the thumbnail frame shows the A-H /
   1-10 board and the price pots), 60 s turns, unranked online opponents. Shared rules: js/modes/cu_mage.js -> js/modes/g4_cu.js.
   Transcript (analyze_video 2026-11-26): 1:06-2:50 the bomb setup (pawns, a Bomb = exactly 20 pts with a pawn in front, two IWC
   Mages, two Queens on the C and G files, a Ghost on B3, 100 pts), 2:54 game 1 vs King Hedgehog (pawns, two sludges, two
   bishops, two devils, a Jester; the real King on the A side), 5:32 game 2 vs Tiuri (moves first, a Mage and six rooks),
   8:36-9:01 the adjusted setup (King off the back rank behind a pawn, Ghost on C3, one Queen moved over), 9:08 game 3 vs
   Julian#6 (moves first, six ghosts, squids defending each other). Strategies: Queen to the far side, swap with the Mage, swap
   the Mage with a pawn (promotes), a squid or the Bomb. */
CM.mode({
  id: '4FRsSJoxMkE',
  title: "RETURN of the iwantcheckmage...",
  name: "Chess Ultimate: Return of the iwantcheckmage",
  category: 'Variants & Games',
  description: "Back to Chess Ultimate with the IWC Mage skin to try more Mage strategies: drop a Queen deep, swap it with the Mage, then swap the Mage with the Bomb, a squid or a pawn. 100-point team on your first three ranks, 60-second turns, three online opponents from the video.",
  how_to_win: "Checkmate the enemy King (a Jester looks exactly like a King).",
  player_side: 'white',
  player: { name: 'iwantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: "King Hedgehog", rating: null, tagline: 'Unranked Chess Ultimate opponent.' },
  board: { files: 8, ranks: 10, light: '#ABAFB1', dark: '#868A8C' },
  theme: { background: '#5f9e4a' },
  pieces: {
    K: { name: 'King', moves: 'K', royal: true, castle: false, value: 0, img: { w: 'assets/modes/CxtttdnwNWk/cu/King_w.png', b: 'assets/modes/CxtttdnwNWk/cu/King_b.png' } },
    P: { name: 'Pawn', moves: 'fmWfcFifmnD', pawn: true, promote: true, enPassant: true, value: 100, img: { w: 'assets/modes/CxtttdnwNWk/cu/Pawn_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Pawn_b.png' } },
    N: { name: 'Knight', moves: 'N', value: 320, img: { w: 'assets/modes/CxtttdnwNWk/cu/Knight_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Knight_b.png' } },
    B: { name: 'Bishop (Rover)', moves: 'B', value: 330, img: { w: 'assets/modes/CxtttdnwNWk/cu/Rover_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Rover_b.png' } },
    R: { name: 'Rook (Rock)', moves: 'R', value: 500, img: { w: 'assets/modes/CxtttdnwNWk/cu/Rock_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Rock_b.png' } },
    Q: { name: 'Queen (Queen Bee)', moves: 'Q', value: 900, img: { w: 'assets/modes/CxtttdnwNWk/cu/QueenBee_w.png', b: 'assets/modes/CxtttdnwNWk/cu/QueenBee_b.png' } },
    Checker: { name: 'Checker', moves: '', gen: 'cuChecker', value: 90, promote: true, promoteTo: ['CheckerKing'], promoteZone: 1, img: { w: 'assets/modes/CxtttdnwNWk/cu/Checker_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Checker_b.png' } },
    CheckerKing: { name: 'Checker King', moves: '', gen: 'cuChecker', value: 200, img: { w: 'assets/modes/CxtttdnwNWk/cu/Checker_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Checker_b.png' } },
    Turtle: { name: 'Turtle', moves: 'W', value: 150, img: { w: 'assets/modes/CxtttdnwNWk/cu/Turtle_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Turtle_b.png' } },
    Copycat: { name: 'Copycat', moves: 'K', value: 220, img: { w: 'assets/modes/CxtttdnwNWk/cu/Copycat_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Copycat_b.png' } },
    Mage: { name: 'Mage (IWC skin)', moves: '', gen: 'cuMage', value: 260, img: { w: 'assets/modes/CxtttdnwNWk/cu/MageIWC_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Mage_b.png' } },
    Fisherman: { name: 'Fisherman', moves: '', gen: 'cuFisherman', value: 260, img: { w: 'assets/modes/CxtttdnwNWk/cu/Fisherman_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Fisherman_b.png' } },
    Jester: { name: 'Jester', moves: 'K', value: 300, img: { w: 'assets/modes/CxtttdnwNWk/cu/King_w.png', b: 'assets/modes/CxtttdnwNWk/cu/King_b.png' } },
    Sludge: { name: 'Sludge', moves: 'mW2', value: 320, img: { w: 'assets/modes/CxtttdnwNWk/cu/Sludge_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Sludge_b.png' } },
    Berserker: { name: 'Berserker', moves: '', gen: 'cuBerserker', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Berserker_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Berserker_b.png' } },
    Ghost: { name: 'Ghost', moves: 'K', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Ghost_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Ghost_b.png' } },
    Penguin: { name: 'Penguin', moves: 'K', value: 400, img: { w: 'assets/modes/CxtttdnwNWk/cu/Penguin_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Penguin_b.png' } },
    Parasite: { name: 'Parasite', moves: 'K', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Parasite_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Parasite_b.png' } },
    Devil: { name: 'Devil', moves: '', gen: 'cuDevil', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Devil_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Devil_b.png' } },
    Minion: { name: 'Minion', moves: 'fW', value: 120, img: { w: 'assets/modes/CxtttdnwNWk/cu/Minion_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Minion_b.png' } },
    Dragon: { name: 'Dragon', moves: 'BN', value: 800, img: { w: 'assets/modes/CxtttdnwNWk/cu/Dragon_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Dragon_b.png' } },
    Sniper: { name: 'Sniper', moves: '', gen: 'cuSniper', value: 520, img: { w: 'assets/modes/CxtttdnwNWk/cu/Sniper_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Sniper_b.png' } },
    Bomb: { name: 'Bomb', moves: 'W2F2', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Bomb_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Bomb_b.png' } },
    Prince: { name: 'Prince', moves: 'K', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Prince_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Prince_b.png' } },
    Ninja: { name: 'Ninja', moves: 'WDHFAG', value: 850, img: { w: 'assets/modes/CxtttdnwNWk/cu/Ninja_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Ninja_b.png' } },
    Angel: { name: 'Angel', moves: '', gen: 'cuAngel', value: 700, img: { w: 'assets/modes/CxtttdnwNWk/cu/Angel_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Angel_b.png' } },
    Giant: { name: 'Giant (Squid)', moves: '', gen: 'cuGiant', value: 600, img: { w: 'assets/modes/CxtttdnwNWk/cu/Giant_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Giant_b.png' } }
  },
  setup: { fen: '8/8/8/8/8/8/8/8/8/4K3' },   /* replaced by hooks.setup (MAKE A TEAM! lineup vs the video opponent) */
  rules: { castling: false, enPassant: true, promotion: { choices: ['Q'], auto: 'Q' }, stalemate: 'draw' },
  bot: { engine: 'search', depth: 2, time_ms: 600, min_ms: 300 },
  clock: { w: 60, b: 60, inc: 0, bot: false },   /* ~60 s per turn, reset every turn (js/modes/cu_mage.js) */
  params: {
    cost: {"Checker": 1, "CheckerKing": 1, "P": 2, "Turtle": 4, "Copycat": 5, "N": 6, "Mage": 8, "Fisherman": 8, "B": 9, "Jester": 10, "Sludge": 12, "R": 13, "Berserker": 15, "Ghost": 15, "Penguin": 15, "Parasite": 15, "Devil": 15, "Minion": 0, "Dragon": 16, "Q": 17, "Sniper": 17, "Bomb": 20, "Prince": 18, "Ninja": 22, "Angel": 40, "Giant": 1},
    cuMage: { turn: 60, budget: 100, presets: [{"name": "Bomb drop (game 1)", "rows": [["Mage", null, "Q", "Bomb", "K", null, "Q", "Mage"], ["P", "P", null, "P", "P", "P", null, "P"], [null, "Ghost", null, null, null, null, null, null]]}, {"name": "Safer king (game 3)", "rows": [["Mage", null, null, "Bomb", null, null, "Q", "Mage"], ["P", "P", "Q", "P", "K", "P", null, "P"], [null, null, "Ghost", null, "P", null, null, null]]}], games: {"King Hedgehog": {"first": "w", "note": "Pawns, two sludges, two bishops, two devils and a Jester: one King is fake.", "rows": [["K", "Sludge", null, null, null, null, "Sludge", "Jester"], ["Devil", "B", null, null, null, null, "B", "Devil"], ["P", "P", "P", "P", "P", "P", "P", "P"]]}, "Tiuri": {"first": "b", "note": "A Mage and six rooks staring into your position.", "rows": [["R", "R", null, "K", "Mage", null, "R", "R"], [null, null, "R", null, null, "R", null, null], ["P", null, null, "P", "P", null, null, "P"]]}, "Julian#6": {"first": "b", "note": "Six hidden ghosts behind squids that defend each other.", "rows": [[null, "Ghost", null, "K", "Ghost", null, "Ghost", null], ["Giant", null, "Ghost", "Giant", null, "Ghost", "Giant", null], [null, null, "Ghost", null, null, null, null, null]]}} },
    series: {"opponents": [{"name": "King Hedgehog", "rating": null, "avatar": null}, {"name": "Tiuri", "rating": null, "avatar": null}, {"name": "Julian#6", "rating": null, "avatar": null}]}
  },
  vfx_timeline: [
    { trigger: 'game_start', effect: { type: 'overlay', html: '<div style="display:flex;height:100%;align-items:center;justify-content:center;font:900 64px/1 Impact,Arial Black,sans-serif;color:#ffd23f;-webkit-text-stroke:3px #4a2c0c;text-shadow:0 5px 0 #4a2c0c">VS</div>', duration_ms: 1100, fade_ms: 250 } },
    { trigger: 'game_over', effect: { type: 'overlay', image: 'assets/modes/CxtttdnwNWk/cu/checkmate.png', fit: 'contain', duration_ms: 1800, fade_ms: 250 } }
  ],
  hooks: 'cu_mage',
  source: { research: 'research/modes/4FRsSJoxMkE.json', confidence: 'medium', notes: "Board 8x10, 100-point MAKE A TEAM! on the first three ranks, IWC Mage skin, squid = 1 pt, Mage swap promotes a pawn on the last rank, minions move straight ahead, opponent names and who moves first: transcript. Square-by-square lineups of both sides are reconstructed from the transcript's descriptions (inferred); 60 s per turn from the hq3 frame; random move on timeout inferred. Not modelled: minions walking off the far edge, chat messages." }
});
