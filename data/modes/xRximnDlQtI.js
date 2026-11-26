/* The New Mage is Terrifying (and he wants checkmate)  (m-accuracy 2026-11-26, accuracy_audit P1; was a legacy 'fairy' Mage stand-in)
   Chess Ultimate with the new IWC Mage skin: unranked games on the 8x10 stone board, your team built on the MAKE A TEAM! screen
   (100 points, first three ranks), opponents in the video's order. Shared rules: js/modes/cu_mage.js -> js/modes/g4_cu.js.
   Transcript (analyze_video 2026-11-26): 1:09-2:54 the Mage setup (pawns, Mage, Devil in front of the King, a Checker, two
   Mages, a second Queen, a Bishop = 99 pts), 3:03 game 1 vs "I want checkmate with spaces number six" (two squids, parasite,
   berserkers, two devils next to the king, penguin), 8:12 Mage-pawn swap on the back rank promotes to a Queen Bee, 9:34 game 2
   vs Seferent (moves first, rooks lined up, Mage, wins with the Mage-squid swap), 12:27-13:12 the squid-swap setup (two Bishops
   and two Queens on the back rank, squids), 13:31 game 3 vs Unstoppable (snipers, two squids, copycats, Mage, a ghost), 15:45
   game 4 vs Voided24 (Ninja, a Jester next to the real King, Parasite). Goal (0:27): win one game with the IWC skin. */
CM.mode({
  id: 'xRximnDlQtI',
  title: "The New Mage is Terrifying (and he wants checkmate)",
  name: "Chess Ultimate: the IWC Mage",
  category: 'Variants & Games',
  description: "Chess Ultimate with the new I Want Checkmate Mage skin. Build a 100-point team on your first three ranks, then use the Mage swap: get a Queen to the far side, swap it with the Mage, swap the Mage with a pawn and it promotes. Four unranked opponents from the video.",
  how_to_win: "Checkmate the enemy King (a Jester looks exactly like a King). Win one game with the IWC Mage.",
  player_side: 'white',
  player: { name: 'iwantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: "i want checkmate 6", rating: null, tagline: 'Unranked Chess Ultimate opponent.' },
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
    cuMage: { turn: 60, budget: 100, presets: [{"name": "Pawn factory (game 1)", "rows": [["Checker", "Q", "Mage", "B", "K", null, "Mage", "Q"], ["P", "P", "P", "P", "Devil", "P", "P", "P"], ["P", null, "P", "P", null, null, "P", "P"]]}, {"name": "Squid swap (games 3-4)", "rows": [["B", "Q", "Mage", "Devil", "K", "Mage", "Q", "B"], ["Giant", null, "Giant", null, "Giant", null, "Giant", null], [null, null, null, null, null, null, null, null]]}], games: {"i want checkmate 6": {"first": "w", "note": "Two squids, a parasite, berserkers, two devils by the king and a penguin; no jesters.", "rows": [["Berserker", null, null, "Devil", "K", "Devil", null, "Berserker"], [null, "Giant", null, "Parasite", "Penguin", null, null, "Giant"], [null, null, null, null, null, null, null, null]]}, "Seferent": {"first": "b", "note": "A wall of rooks, a Mage and a squid.", "rows": [["R", "R", "Mage", null, "K", null, "R", "R"], ["P", "Giant", null, "P", "P", "R", null, "P"], [null, null, null, null, null, null, null, null]]}, "Unstoppable": {"first": "w", "note": "Snipers, two squids, copycats, a Mage and a hidden ghost.", "rows": [["Sniper", "Copycat", "Ghost", "K", null, "Copycat", "Mage", "Sniper"], [null, null, "Giant", "Sniper", null, "Giant", null, null], [null, null, null, null, null, null, null, null]]}, "Voided24": {"first": "w", "note": "One of the two Kings is a Jester.", "rows": [["R", null, null, "Jester", "K", "Parasite", null, "R"], ["P", "P", "P", "Ninja", "P", "P", "P", "P"], [null, null, null, null, null, null, null, null]]}} },
    series: {"opponents": [{"name": "i want checkmate 6", "rating": null, "avatar": null}, {"name": "Seferent", "rating": null, "avatar": null}, {"name": "Unstoppable", "rating": null, "avatar": null}, {"name": "Voided24", "rating": null, "avatar": null}], "boxes": 1}
  },
  vfx_timeline: [
    { trigger: 'game_start', effect: { type: 'overlay', html: '<div style="display:flex;height:100%;align-items:center;justify-content:center;font:900 64px/1 Impact,Arial Black,sans-serif;color:#ffd23f;-webkit-text-stroke:3px #4a2c0c;text-shadow:0 5px 0 #4a2c0c">VS</div>', duration_ms: 1100, fade_ms: 250 } },
    { trigger: 'game_over', effect: { type: 'overlay', image: 'assets/modes/CxtttdnwNWk/cu/checkmate.png', fit: 'contain', duration_ms: 1800, fade_ms: 250 } }
  ],
  hooks: 'cu_mage',
  source: { research: 'research/modes/xRximnDlQtI.json', confidence: 'medium', notes: "Board 8x10, 100-point MAKE A TEAM! on the first three ranks, IWC Mage skin, squid = 1 pt, Mage swap promotes a pawn on the last rank, minions move straight ahead, opponent names and who moves first: transcript. Square-by-square lineups of both sides are reconstructed from the transcript's descriptions (inferred); 60 s per turn from the 4FRsSJoxMkE frame; random move on timeout inferred. Not modelled: minions walking off the far edge, chat messages." }
});
