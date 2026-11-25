/* I Tried to Qualify for the 2025 Seirawan Chess Championship.  chess.com S-Chess arena qualifier: normal chess plus a
   Hawk (bishop + knight) and an Elephant (rook + knight) in reserve, gated onto a back-rank square when the piece on it
   moves for the first time. First pairing: a national master; other arena opponents ~1800-2000. Blitz clocks.
   Sources: research/modes/LjehdkzmCho.json (frames: green board, reserve tray). Rules via js/modes/g5_seirawan.js
   (read-only reuse); the Hawk/Elephant use chess.com's own art cut from the video (75% still / 4:32 frame). */
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/LjehdkzmCho/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: 'LjehdkzmCho',
  title: 'I Tried to Qualify for the 2025 Seirawan Chess Championship',
  name: 'Seirawan Arena Qualifier',
  category: 'Other Videos',
  description: 'Seirawan Chess (S-Chess): each side also has a Hawk (moves as bishop + knight) and an Elephant (rook + knight) in reserve. When one of your back-rank pieces moves for the first time you may drop a reserve piece on the square it left (choose it in the picker; pick the moving piece itself to skip). Reserves are lost once all back-rank pieces have moved.',
  how_to_win: 'Checkmate. Arena games are short: 3 minutes plus 2 seconds per move.',
  player_side: 'white',
  opponent: { name: 'National Master', rating: 2000, tagline: 'First arena pairing: a national master.' },
  board: { files: 8, ranks: 8, light: '#eaf0cc', dark: '#789c54' },
  pieces: {
    H: { name: 'Hawk', moves: 'BN', value: 760, glyph: 'B', img: { w: 'assets/modes/LjehdkzmCho/H_w.png', b: 'assets/modes/LjehdkzmCho/H_b.png' } }  /* chess.com hawk cut from the 75% still */,
    E: { name: 'Elephant', moves: 'RN', value: 860, glyph: 'R', img: { w: 'assets/modes/LjehdkzmCho/E_w.png', b: 'assets/modes/LjehdkzmCho/E_b.png' } }  /* chess.com elephant from the 4:32 frame: black from h8, white from the piece legend (tools/g4_art4.py) */
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { res: { w: 'HE', b: 'HE' } } },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'B', 'H', 'E'] } },
  clock: { w: 180, b: 180, inc: 2 },
  bot: { engine: 'search', elo: 2000, depth: 3, time_ms: 800 },
  hooks: 'g5_seirawan',
  source: { research: 'research/modes/LjehdkzmCho.json', confidence: 'high', notes: 'Arena points/standings not modelled; one game per New game.' }
});
