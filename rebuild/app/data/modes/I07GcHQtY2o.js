/* Can I BEAT Chess Ultimate? (Ninja Method REFUTED)  Ranked Chess Ultimate after the Ninja method was refuted: ban
   phase in the draft, maps with black pit holes, SPAWN MINION / UNIQUE MOVE buttons, ~58 s turn timer. Sources:
   research/modes/I07GcHQtY2o.json, frames visual (grey stone tiles #ACB0B0/#878B8C, pits). Character rules are the
   shared group-4 library js/modes/g4_cu.js (used read-only). PASS 1: one representative ranked draft: you still run
   the Ninja, the opponent answers with Bomb, Penguin and a Sniper; two pits on the board. Pass 2 (impl-5, 7th session): character art = group 4's cut of the game's own
   sprites (assets/modes/CxtttdnwNWk/cu/), pits = a stone tile with its pit cut from the video (blocking squares). */
CM.mode({
  id: 'I07GcHQtY2o',
  title: 'Can I BEAT Chess Ultimate? (Ninja Method REFUTED)',
  name: 'Chess Ultimate: Ninja Refuted',
  category: 'Variants & Games',
  description: 'Ranked Chess Ultimate on a map with two pits (holes). You kept the Ninja (moves up to 3 squares in any line, passing through characters) but the opponent drafted counters: a Bomb that explodes when it captures or is captured, a Penguin that freezes its neighbours and a Sniper that shoots straight ahead.',
  how_to_win: 'Checkmate the enemy King (an enemy Jester looks exactly like a King).',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Ranked Opponent', rating: null, tagline: 'Online Chess Ultimate player who refuted the Ninja method.' },
  board: { files: 8, ranks: 8, light: "#ACB0B0", dark: "#878B8C", walls: ["c5", "f4"] },
  theme: { background: '#5f9e4a' },
  pieces: {
    '#': { name: 'Pit', overlay: null, img: 'assets/modes/I07GcHQtY2o/pit.png' },
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
    Mage: { name: 'Mage', moves: '', gen: 'cuMage', value: 260, img: { w: 'assets/modes/CxtttdnwNWk/cu/Mage_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Mage_b.png' } },
    Fisherman: { name: 'Fisherman', moves: '', gen: 'cuFisherman', value: 260, img: { w: 'assets/modes/CxtttdnwNWk/cu/Fisherman_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Fisherman_b.png' } },
    Jester: { name: 'Jester', moves: 'K', value: 300, img: { w: 'assets/modes/CxtttdnwNWk/cu/King_w.png', b: 'assets/modes/CxtttdnwNWk/cu/King_b.png' } },
    Sludge: { name: 'Sludge', moves: 'mW2', value: 320, img: { w: 'assets/modes/CxtttdnwNWk/cu/Sludge_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Sludge_b.png' } },
    Berserker: { name: 'Berserker', moves: '', gen: 'cuBerserker', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Berserker_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Berserker_b.png' } },
    Ghost: { name: 'Ghost', moves: 'K', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Ghost_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Ghost_b.png' } },
    Penguin: { name: 'Penguin', moves: 'K', value: 400, img: { w: 'assets/modes/CxtttdnwNWk/cu/Penguin_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Penguin_b.png' } },
    Parasite: { name: 'Parasite', moves: 'K', value: 420, img: { w: 'assets/modes/CxtttdnwNWk/cu/Parasite_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Parasite_b.png' } },
    Devil: { name: 'Devil', moves: '', gen: 'cuDevil', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Devil_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Devil_b.png' } },
    Minion: { name: 'Minion', moves: 'K', value: 120, img: { w: 'assets/modes/CxtttdnwNWk/cu/Minion_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Minion_b.png' } },
    Dragon: { name: 'Dragon', moves: 'BN', value: 800, img: { w: 'assets/modes/CxtttdnwNWk/cu/Dragon_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Dragon_b.png' } },
    Sniper: { name: 'Sniper', moves: '', gen: 'cuSniper', value: 520, img: { w: 'assets/modes/CxtttdnwNWk/cu/Sniper_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Sniper_b.png' } },
    Bomb: { name: 'Bomb', moves: 'W2F2', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Bomb_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Bomb_b.png' } },
    Prince: { name: 'Prince', moves: 'K', value: 450, img: { w: 'assets/modes/CxtttdnwNWk/cu/Prince_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Prince_b.png' } },
    Ninja: { name: 'Ninja', moves: 'WDHFAG', value: 850, img: { w: 'assets/modes/CxtttdnwNWk/cu/Ninja_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Ninja_b.png' } },
    Angel: { name: 'Angel', moves: '', gen: 'cuAngel', value: 700, img: { w: 'assets/modes/CxtttdnwNWk/cu/Angel_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Angel_b.png' } },
    Giant: { name: 'Giant (Squid)', moves: 'W4', value: 600, img: { w: 'assets/modes/CxtttdnwNWk/cu/Giant_w.png', b: 'assets/modes/CxtttdnwNWk/cu/Giant_b.png' } }
  },
  setup: { fen: 'r[bomb]bk[sniper][penguin]n[turtle]/[checker][checker]pppp[checker][checker]/8/8/8/8/[Checker][Checker]PPPP[Checker][Checker]/[Turtle][Mage]BK[Ninja][Ghost]NR' },
  rules: { castling: false, enPassant: true, promotion: { choices: ['Q'], auto: 'Q' }, stalemate: 'draw' },
  bot: { engine: 'search', depth: 2, time_ms: 600, min_ms: 300 },
  clock: { w: 600, b: 600, inc: 0, bot: true },
  params: { cost: {"Checker": 1, "CheckerKing": 1, "P": 2, "Turtle": 4, "Copycat": 5, "N": 6, "Mage": 8, "Fisherman": 8, "B": 9, "Jester": 10, "Sludge": 12, "R": 13, "Berserker": 15, "Ghost": 15, "Penguin": 15, "Parasite": 15, "Devil": 15, "Minion": 0, "Dragon": 16, "Q": 17, "Sniper": 17, "Bomb": 18, "Prince": 18, "Ninja": 30, "Angel": 40, "Giant": 20} },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/I07GcHQtY2o/ninjas_and_ghost.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  vfx_timeline: [
    { trigger: 'game_start', effect: { type: 'overlay', html: '<div style="display:flex;height:100%;align-items:center;justify-content:center;font:900 64px/1 Impact,Arial Black,sans-serif;color:#ffd23f;-webkit-text-stroke:3px #4a2c0c;text-shadow:0 5px 0 #4a2c0c">VS</div>', duration_ms: 1100, fade_ms: 250 } },
    { trigger: 'game_over', effect: { type: 'overlay', image: 'assets/modes/CxtttdnwNWk/cu/checkmate.png', fit: 'contain', duration_ms: 1800, fade_ms: 250 } }
  ],
  hooks: 'g4_cu',
  todo_pass2: ['ban phase in the draft', '58 s per-turn timer', 'SPAWN MINION / UNIQUE MOVE buttons'],
  source: { research: 'research/modes/I07GcHQtY2o.json', confidence: 'medium', notes: 'Drafts invented (ranked pick brackets, ban phase not modelled); pits placed at c5/f4; 58 s per-turn timer approximated by a 10-minute clock.' }
});
