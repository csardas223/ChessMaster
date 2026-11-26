/* game-fx per-mode config (owner 2026-11-26 10:30 AM ET: game-like VFX where the video has effects or the mode feels flat).
   id -> list of preset names from CM.gameFx.PRESETS (js/fx/game-fx.js) and/or extra vfx_timeline entries.
   Presets are skipped for triggers a mode's own vfx_timeline already handles. Clean chess.com-style modes (odds
   challenges, Drawback, standard variants, bot ladders) are deliberately NOT listed. Horror/SCP = fin-icm, 3D/FPS =
   fin-battle/fin-fps.
   fin-sprites-a: ids -TKJGtBKK8U .. X1aDgLuvLMU (LC_ALL=C sorted first half). fin-sprites-b: append its half below. */
(function () {
  'use strict';
  var CM = window.CM; if (!CM) return;
  var A = ['arcade'], R = ['results'];
  var M = {
    /* --- fin-sprites-a half --- */
    '0VbTOk8X1TY': ['check_ring', 'results'],                     /* Chess Roulette: own revolver/explosion fx */
    '0gnWnkyg6VA': ['check_ring', 'results'],                     /* Hungry Martin: +1000 popups come from g2_elofish */
    '30CbSsx8ixM': ['check_ring', 'results'],                     /* Martin's Fireworks: own firework fx */
    '1L_sxGgxX9M': ['check_ring', 'results'], 'OO3XlFQ32i0': ['check_ring', 'results'],   /* Passant: own laser/smoke */
    '3Sr5lJbHKKU': ['capture_dust', 'check_ring', 'results'],     /* Chess vs Checkers */
    '6YEM7m8owJ4': A,                                              /* Spinner Wheel */
    '7csbf0L-uio': ['capture_sparks', 'check_ring', 'results'],   /* Portals */
    '9M2Mj2WFFys': ['capture_sparks', 'results'],                 /* Kung Fu Chess (real time) */
    '9j7h5kF4X9s': ['capture_dust', 'results'], 'AvZiSnngZjA': ['capture_dust', 'results'], 'NK4Upb_s8Ok': ['capture_dust', 'results'],   /* Shotgun King */
    'AoREbapF7y0': ['check_ring', 'results'],                     /* Sniper Bishops: own tracer */
    /* Dice Chess family: chess.com-arcade dice games ('YOU WIN' / coin popups in the videos) */
    'B5LGzOEZSyo': A, 'CEkC0TINhm8': A, 'Cr3j7jf5xXk': A, 'CuwO5ygTGCM': A, 'HkeZayq10p8': A, 'Jg-oNqDOXtg': A, 'KJYUsRlj_34': A, 'OcWzHqqeLNg': A, 'Rtee8TRU0vg': A,
    'Cs6knoD0INQ': R,                                              /* YouTube Chess (level select game) */
    'D1hAji3BgJw': A,                                              /* Unicorn Attack */
    'G4zH8iKfIi0': A,                                              /* RuneScape Bots */
    'GawuFHUIj6o': ['capture_smoke', 'check_ring', 'results'],    /* Phantom Rooks */
    'H_5UviR2nTU': A,                                              /* Snake vs Chess */
    'HtNZ9DTxHUs': A, 'R8gZYKtr-C4': A,                            /* Dragon Bishop */
    'Hz1J81D8rP4': ['castle_dust', { trigger: 'castle', effect: { type: 'popup', at: 'to', text: '!!', color: '#26c2a3', size: '30px' } }, 'results'],   /* Castling Checkmate: '!!' brilliant badge */
    'I_TbJqRHtf4': ['promo_gold', 'results'], 'JPDYufARCQU': ['promo_gold', 'results'], 'U_irVoLjtNI': ['promo_gold', 'results'],   /* Secret Queen */
    'JAz_qMQpI1o': ['capture_sparks', 'check_ring'],              /* Ouroboros King: roguelike, own result screens */
    'JcpCAs1a2gc': A, 'WXcmWG7Eczs': A,                            /* Anarchy */
    'Kzt9ItpGtYg': ['check_ring', 'results'],                     /* Pawnbarian: own attack fx */
    'LfzNhUjl3qE': ['check_ring', 'results'],                     /* Evil Martin */
    'LiXg0nHrjxg': ['promo_gold', 'results'],                     /* Midas Touch: own gold fx */
    'Mg2Upjjo2yg': ['check_ring', 'results'],                     /* Jupiter 2011 */
    'NbMW2bOMO5k': A,                                              /* Killer King */
    'NWxiv9k1yrQ': ['capture_dust', 'check_ring', 'results'], 'O44sHRw-89k': ['capture_dust', 'check_ring', 'results'],   /* Petrified */
    'OvQYI_S5IZg': ['capture_dust', 'check_ring', 'results'],     /* Trojan Horses */
    'PhcIDwTqQKA': ['check_ring', 'results'],                     /* Atomic: own 3x3 explosion */
    'Q6sj5N3oQjI': ['check_ring', 'results'], 'SbPYufgaG-I': ['check_ring', 'results'], 'U6J7XjR_5Ik': ['check_ring', 'results'],   /* elo-swing fish */
    'Ugw05nktuDM': ['capture_dust', 'results'],                   /* Launch Pawns */
    'UzoZVdmGpyc': R,                                              /* Who Takes the Crown */
    'VV9Wb6egokU': A,                                              /* Capture Anything */
    'Vr3WOIRAXoI': R                                               /* Stockfish in a Maze */,
    /* --- fin-sprites-b half (X5kLXAJeAQI ..; compared with research/modes/<id>.json video notes; clean chess.com variants,
       odds/bot ladders, Drawback, engine-gimmick fish and holiday bots left alone) --- */
    '_RFXN1Ye3sY': ['capture_sparks', 'check_ring'], 'rf2HSTXTehE': ['capture_sparks', 'check_ring'],   /* Ouroboros King: roguelike, own result screens */
    '_qxqjb3DseA': R, 'pHItplJMih0': R, 'tH7eOK3Lr1A': R, 'u0hl8g63mUg': R,   /* Rosen Score: trophy-card feel on the result */
    'aSc3Cs0eo7g': ['capture_dust', 'check_ring', 'results'],     /* Breaking Squares: own crack dust */
    'cYVauucyLyQ': ['check_ring', 'results'],                     /* Chess Roulette ep. 1: own revolver/explosion fx */
    'd-4NWgCwzco': ['check_ring', 'results'],                     /* 3 Bombs: own explosions */
    'dkCMhNcZezM': ['check_ring', 'results'], 'dztzDlPfqSI': ['check_ring', 'results'], 'qZyNuiVbGMI': ['check_ring', 'results'], 'rMSar6g_2HY': ['check_ring', 'results'],   /* Passant: own laser/smoke */
    /* Dice Chess family (same as the first half) */
    'dwiAKx06Q9E': A, 'eKAOw0yaqyA': A, 'exMFzra96vo': A, 'haNXJMir3Zk': A, 'prd7LxnJtL4': A, 'vm0JynHlzys': A,
    'fRZmYTwLE54': ['capture_sparks', 'check_ring', 'results'],   /* Magnet Pieces */
    'hgU5hVwLlHo': ['capture_sparks', 'results'],                 /* Anish Grabs Pieces: one-time grab power-up */
    'lmmKhSrRn_c': ['check_ring', 'results'],                     /* Explosive Magic: own atomic capture fx */
    'nick8PeAXLA': A, 'rQQKF0ZZQfg': A,                            /* Spinner Wheel */
    'qDkxrnZfeXw': A,                                              /* Anarchy Chess site */
    'qqvbb2r2k5I': ['capture_sparks', 'check_ring', 'results'],   /* Gambonanza roguelike */
    'riHSnaWRQlY': R, 'rsI_92dNd9M': R, 'wPaOpQw4FoY': R,          /* Time Travel / Breeding Knights / Game of Life Pawns */
    'pzxXxIsKRRo': ['capture_dust', 'results'],                   /* Shotgun King (as the first-half Shotgun King modes) */
    'zP9TzlgA-W0': ['check_ring', 'results'],                     /* Pawnbarian: own attack fx */
    'spJibM5qaNQ': ['capture_sparks', 'results'],                 /* Chess Survivors */
    'tVAelwglnH8': A,                                              /* Capture Anything */
    'b0peFhZs4yU': ['check_ring', 'results'], 'uQ0kzL0-taQ': ['check_ring', 'results'], 'wTudFnunSL0': ['check_ring', 'results'],   /* Atomic: own 3x3 explosion */
    'vQ3hLgU6jLA': ['check_ring', 'results'], 'w15Ev7q2HmI': ['check_ring', 'results'],   /* Place Mines / Landmine Chess */
    'ppwoznHliD8': ['capture_dust', 'check_ring', 'results'],     /* Petrified */
    'vIvVdaTQi3s': ['check_ring', 'results'], 'nx6jkHl2k_Y': ['check_ring', 'results'],   /* elo-swing bots (Panic Fish, +200 Martin) */
    'hymgaszLxnw': ['check_ring', 'results'],                     /* Evil Martin (-5) */
    'sO-lD2On610': ['capture_sparks', 'results'],                 /* Pac-Man Chess: pellet pick-ups */
    'goDcorwxJnA': R, 'vzNwF2BH8jg': R,                            /* Minions vs the Moon / Among Us Impostor themes */
    'tpXg3mxSfY0': R,                                              /* Castling Wins: own castle fx, banner on the result */
    'ucGhD2hC_6s': R                                               /* Offside (soccer parody) */
  };
  CM.gameFxModes = Object.assign(CM.gameFxModes || {}, M);
})();
