/* Can I BEAT TINY 5D Chess?  5D Chess With Multiverse Time Travel on 4x4 boards: each side has K, R, B, N and four pawns;
   pieces may also move back through time (creating new timelines) and across timelines. Sources:
   research/modes/qSwTtgUWqUw.json, frames (#F6DAAD/#D3B07E, purple time arrows), research sprites tiny_4x4_board (start
   position confirmed: Black N B R K / pawns, White pawns / K R B N) and multiverse_timelines (timeline rows, purple bands
   and arrows, Undo Move / Submit Moves).
   impl-6a pass 2 (2026-11-25): now a standalone multiverse game, js/games/g6_tiny5d.js (rules + simplifications in its
   header): 4-axis movement, branching timelines, present line, Submit Moves / Undo Move, check + checkmate across the
   multiverse. Pass-1 single-board version replaced. */
CM.mode({
  id: 'qSwTtgUWqUw',
  title: 'Can I BEAT TINY 5D Chess?',
  name: 'Tiny 5D Chess',
  category: 'Variants & Games',
  frame: 'game',
  description: 'Tiny 5D Chess: 4x4 boards with king, rook, bishop, knight and four pawns each, laid out in timelines (rows) across time (columns). Pieces move on four axes: file, rank, time (one full turn per step) and timeline. Moving a piece onto an older board branches a new timeline. Move on every board at the present (the lighter column), then press Submit Moves. You may not submit while any of your kings can be captured. Arrows (or the on-screen arrows) scroll through history; Enter/Space submits.',
  how_to_win: 'Checkmate across the multiverse: leave Black with no submission that saves all of its kings.',
  player_side: 'white',
  opponent: { name: '5D Chess opponent', rating: null, avatar: 'assets/modes/qSwTtgUWqUw/cube.png', tagline: 'Multiverse time traveller.' },
  board: { files: 4, ranks: 4, light: '#f6daad', dark: '#d3b07e', background: '#c9d3dc' },
  theme: { background: '#c9d3dc' },
  game: { module: 'g6_tiny5d', aspect: 0.85, controls: ['left', 'right', '|', 'action'] },
  params: { light: '#f6daad', dark: '#d3b07e', bg: '#d9dee3' },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/qSwTtgUWqUw/cube.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/qSwTtgUWqUw.json', confidence: 'medium', notes: 'Multiverse rules from 5D Chess game knowledge; simplified: every timeline is active (no inactive-timeline rule), at most 6 timelines, bot samples submissions by material. Layout/colours from the research sprites.' }
});
