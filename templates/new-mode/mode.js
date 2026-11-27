/* TODO <exact video title> (video TODO_videoId, TODO m:ss, TODO YYYY-MM-DD), by TODO creator.
   Sources: research/modes/TODO_videoId.json (rules with transcript timestamps), frames research/frames/video_thumbs/.
   What the video does, in 2-4 lines: TODO.
   Each rule below cites the transcript time it comes from. Anything the video does not show is marked INFERRED here and
   in source.notes. Art: assets/modes/TODO_videoId/ (source.notes in that folder, LICENSES.md rows).
   Copy to data/modes/<videoId>.js, replace every TODO, then `node tools/build-data.mjs`. Schema: docs/ARCHITECTURE.md. */
(function () {
  var DIR = 'assets/modes/TODO_videoId/';
  CM.mode({
    id: 'TODO_videoId',
    title: 'TODO exact video title',
    name: 'TODO short lobby name',
    category: 'TODO lobby category',
    description: 'TODO how it works, 1-3 plain sentences.',
    how_to_win: 'TODO one sentence.',
    player_side: 'white',
    /* names, ratings and avatars exactly as the video shows them (frame time in a comment) */
    player: { name: 'You', rating: null, avatar: 'assets/avatars/iwantcheckmate.png' },
    opponent: { name: 'TODO', rating: null, avatar: 'assets/avatars/stockfish.png', tagline: 'TODO short line in the video\'s voice' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2b6', dark: '#af8164' },   /* TODO sample both square colours from a clean video frame */
    pieces: {},                                      /* custom pieces: { X: { name, moves, value, img: DIR + 'x.png' } } */
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    rules: {},                                       /* promotion stays Q/R/B/N unless the video shows otherwise */
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    sounds: {},                                      /* own/CC0 only, cinematic, no bells/chimes/chiptune; LICENSES.md row */
    hooks: {
      /* Rule hooks are pure (no randomness, no DOM). Game hooks may animate: slide with ctx.move + ctx.refresh (never
         teleport), one-shot ability pulses through CM.abilityFx (js/fx/ability-fx.js), never permanent rings. */
      afterMove: function (ctx, m, info) { return null; },
      status: function (ctx) { return 'TODO one short line under the board'; }
    },
    source: { research: 'research/modes/TODO_videoId.json', confidence: 'TODO high|medium|low', notes: 'TODO what was inferred and why' }
  });
})();
