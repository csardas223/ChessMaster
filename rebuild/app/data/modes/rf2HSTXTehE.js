/* Can I BEAT Ouroboros King?  Steam "tactical variant chess roguelite": a campaign of small battles on ~6x8 boards with
   drafted unit armies; win a battle by killing the enemy General. Units: Portal Mage (moves to any empty square, kills
   only adjacent), Reaper (king steps; kills any non-royal enemy standing on a tile of its own colour), Glass Queen,
   Marching Pawn (2 forward or 1 diagonal, kills diagonally), Prince, Knight, Viking (up to two orthogonal steps),
   General (royal king). Sources: research/modes/rf2HSTXTehE.json, frames (navy #c2c7da/#323f55). PASS 1: a run of
   three battles (js/modes/g6_levels.js) with fixed armies; relics, rewinds and recruiting are pass 2. */
CM.mode({
  id: 'rf2HSTXTehE',
  title: 'Can I BEAT Ouroboros King?',
  name: 'Ouroboros King',
  category: 'Variants & Games',
  description: 'Small tactical battles with strange units. Your King and the enemy General are royal: kill the General and his army surrenders. Portal Mage teleports to any empty square but only kills next to itself; Viking makes up to two orthogonal steps; Marching Pawn moves two forward or one diagonally; Glass Queen moves like a queen.',
  how_to_win: 'Kill the enemy General in every battle.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/rf2HSTXTehE/hero.png' },
  opponent: { name: 'Ouroboros armies', rating: null, avatar: null, tagline: 'Kingdom of Thessalonia, Marsh of Madness, Ridge of Ruin.' },
  board: { files: 6, ranks: 8, light: '#c2c7da', dark: '#323f55', background: '#101826' },
  pieces: {
    K: { name: 'King', moves: 'K', value: 2000, royal: true, castle: false },
    Gn: { name: 'General', moves: 'K', value: 2000, royal: true, glyph: 'K', badge: 'G' },
    Pm: { name: 'Portal Mage', moves: '', value: 400, glyph: 'B', badge: 'PM', gen: 'portal' },
    Vk: { name: 'Viking', moves: 'W2', value: 380, glyph: 'R', badge: 'V' },
    Mp: { name: 'Marching Pawn', moves: 'fmnDfF', value: 150, glyph: 'P', badge: 'M', promote: true, promoteTo: ['Gq'] },
    Gq: { name: 'Glass Queen', moves: 'Q', value: 800, glyph: 'Q', badge: 'G' },
    Pr: { name: 'Prince', moves: 'K', value: 350, glyph: 'K', badge: 'Pr' }
  },
  setup: { fen: '1r[gn]n2/2pp2/6/6/6/6/6/1R[Gq]K[Vk]1' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  params: {
    run: 'Battle',
    levels: [
      { name: 'Kingdom of Thessalonia', fen: '1r[gn]n2/2pp2/6/6/6/6/6/1R[Gq]K[Vk]1' },
      { name: 'Marsh of Madness', fen: 'n1[gn]1rb/1pppp1/6/6/6/6/2[Mp][Mp]2/1R[Gq]K[Vk][Pm]' },
      { name: 'Boss: the Ouroboros Queen', fen: 'rnq[gn]bn/pppppp/6/6/6/6/1[Mp][Mp][Mp]2/[Pm]R[Gq]K[Vk][Pr]', opponent: { name: 'Ouroboros Queen', rating: null, tagline: 'Final boss.' } }
    ]
  },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  hooks: 'g6_levels',
  todo_pass2: ['Reaper (same-colour-tile kills), Fool (copies the last enemy move), Prince (king protected within 3), Viking direction change', 'node map campaign, recruiting, Armory upgrades, relics (The Finisher, Alarm Bell, Ouroboros Sigil rewinds)', 'hand-drawn unit icons (original art), pink enemy-zone squares', 'final trio boss'],
  source: { research: 'research/modes/rf2HSTXTehE.json', confidence: 'medium', notes: 'Armies invented; several unit powers simplified.' }
});
