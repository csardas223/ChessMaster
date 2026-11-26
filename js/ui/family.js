/* m3-ui family chrome (owner 2026-11-26 2:05 PM ET: "Don't just do good vfx and UI for the horror, do it for the
   others"). Every mode belongs to one presentation family (guns, dragons, nukes, magic, arcade, dice, roguelikes, bot
   ladders, 4-player, drawback, duck, standard ...). The family gives the game chrome (never the board: in-board VFX is
   js/fx/*) a small identity in the chess.com Android look:
     - #view-game[data-family] + --fam (accent colour) for the HUD: status-line edge, title icon, clock while running
     - a title strip across the board when a mode opens (icon + family label, mode name, "vs opponent"), the
       non-horror counterpart of js/fx/horror-cine.js's title cards; pointer-events none, ~1.9 s, opacity-only with
       reduced motion; skipped by automated browsers unless CM.store 'introForce'
     - the intro card's eyebrow and the game-over card's result art + default titles (js/ui/game-ui.js asks CM.family)
   Horror modes keep their own cinema layer: family 'horror' gets the accent only.
   Resolution order: per-slug rules (roguelikes, roulette/wheel, 4-player, bot ladders) > the SFX v7 family of the mode
   (window.CM_SOUND_SETS.modes, tools/sfx/wire_v7.py) > the lobby category > 'standard'. */
(function () {
  'use strict';
  var CM = window.CM, U = CM.util, $ = U.$;
  /* label, Lucide icon, accent; win/loss: default result titles when the mode gives none */
  var FAM = {
    guns:     { label: 'Armed',       icon: 'crosshair', accent: '#d9a441' },
    battle:   { label: 'Battle',      icon: 'swords',    accent: '#c9764a' },
    dragon:   { label: 'Dragons',     icon: 'flame',     accent: '#e0673f' },
    nuke:     { label: 'Explosive',   icon: 'radiation', accent: '#e6c229' },
    magic:    { label: 'Magic',       icon: 'sparkles',  accent: '#a47be0' },
    arcade:   { label: 'Arcade',      icon: 'gamepad',   accent: '#45b4e0', win: 'Stage Clear!', loss: 'Game Over' },
    puzzle:   { label: 'Puzzle',      icon: 'gamepad',   accent: '#45b4e0', win: 'Solved!' },
    scifi:    { label: 'Sci-fi',      icon: 'gamepad',   accent: '#5fc7c0' },
    dice:     { label: 'Luck',        icon: 'dices',     accent: '#4fb3a0' },
    rogue:    { label: 'Roguelike',   icon: 'castle',    accent: '#c49a5a', loss: 'Run Over' },
    bots:     { label: 'Bot ladder',  icon: 'bot',       accent: '#8ab4f8' },
    rush:     { label: 'Speed',       icon: 'clock',     accent: '#81b64c' },
    multi:    { label: 'Multiplayer', icon: 'users',     accent: '#e2a93b' },
    drawback: { label: 'Drawback',    icon: 'ban',       accent: '#d06b8a' },
    duck:     { label: 'Duck',        icon: 'bird',      accent: '#e8c547' },
    fog:      { label: 'Fog',         icon: 'info',      accent: '#9aa3ad' },
    challenge:{ label: 'Challenge',   icon: 'crown',     accent: '#81b64c' },
    horror:   { label: 'Horror',      icon: 'skull',     accent: '#c0392b' },
    standard: { label: 'Chess',       icon: 'crown',     accent: '#81b64c' }
  };
  var RULES = [
    [/pawnbarian|ouroboros|passant|gambonanza|chess-survivors|once-a-pawn|petrified-pawns/, 'rogue'],
    [/shotgun-king|gun-king|fps-chess|bazooka|sniper/, 'guns'],
    [/roulette|spinner-wheel|dice/, 'dice'],
    [/4-player|chaturaji|bughouse|battle-royale|10-000-player|team-chess/, 'multi'],
    [/duck/, 'duck'],
    [/drawback/, 'drawback'],
    [/nuke|atomic|bomb|landmine|place-mines|firework|explosive/, 'nuke'],
    [/dragon/, 'dragon'],
    [/spell|wizard|magic|archangel/, 'magic'],
    [/pac-man|minecraft|roblox|arcade|tetris/, 'arcade'],
    [/bots|bot-ladder|speedrun/, 'bots']
  ];
  var SND = { guns: 'guns', battle: 'battle', medieval: 'battle', dragon: 'dragon', explosive: 'nuke', magic: 'magic', magic_start: 'magic',
    arcade: 'arcade', scifi: 'scifi', puzzle: 'puzzle', dice: 'dice', fish: 'bots', rush: 'rush', arena: 'multi', drawback: 'drawback',
    duck: 'duck', fog: 'fog', odds: 'challenge', horror: 'horror' };
  var CAT = { 'Horror Chess': 'horror', 'Dice Chess': 'dice', 'Drawback Chess': 'drawback', 'Variant Bots': 'bots', 'Challenges & Odds': 'challenge' };

  function of(id) {
    if (!id) return 'standard';
    var slug = (CM.app && CM.app.slugOf && CM.app.slugOf(id)) || '', v = CM.lobby && CM.lobby.byId[id];
    var cat = (v && v.cat) || '', snd = ((window.CM_SOUND_SETS || {}).modes || {})[id];
    if (cat === 'Horror Chess' || snd === 'horror') return 'horror';
    for (var i = 0; i < RULES.length; i++) if (RULES[i][0].test(slug)) return RULES[i][1];
    if (snd && SND[snd]) return SND[snd];
    return CAT[cat] || 'standard';
  }
  function info(id) { var k = of(id); return Object.assign({ key: k }, FAM[k]); }
  function curId() { var m = /^#\/play\/(.+)$/.exec(location.hash); return m ? decodeURIComponent(m[1]) : ''; }

  function reduced() { return CM.settings && CM.settings.reducedMotion ? CM.settings.reducedMotion() : false; }
  /* HUD: family hook on the game view (CSS: css/game.css "m3-ui family chrome") */
  function apply(id) {
    var f = info(id), v = $('view-game'); if (!v) return f;
    v.dataset.family = f.key; v.style.setProperty('--fam', f.accent);
    var t = document.querySelector('.gamebar__title'), ic = t && t.querySelector('.fam-ico');
    if (t && !ic) { ic = document.createElement('i'); ic.className = 'fam-ico'; ic.setAttribute('aria-hidden', 'true'); t.insertBefore(ic, t.firstChild); }
    if (ic) ic.innerHTML = f.key === 'standard' ? '' : CM.icon(f.icon);
    return f;
  }
  function clear() { var v = $('view-game'); if (v) { delete v.dataset.family; v.style.removeProperty('--fam'); } hideStrip(); }

  /* title strip across the board (after the loading screen and the intro card) */
  var stripT = 0;
  function hideStrip() { clearTimeout(stripT); var s = document.getElementById('fam-strip'); if (s) s.remove(); }
  function strip(id, opp) {
    var f = info(id); if (f.key === 'horror') return;
    if (navigator.webdriver && !CM.store.get('introForce', false)) return;
    var seq = CM.app ? CM.app.seq : 0, t0 = Date.now();
    hideStrip();
    (function go() {
      if (CM.app && (CM.app.seq !== seq || CM.app.view !== 'game')) return;
      var intro = $('intro'), busy = (CM.loader && CM.loader.isVisible()) || (intro && intro.classList.contains('is-open'));
      if (busy && Date.now() - t0 < 60000) { stripT = setTimeout(go, 150); return; }
      var wrap = $('board-area'); if (!wrap) return;
      var el = document.createElement('div'); el.id = 'fam-strip'; el.className = 'fam-strip' + (reduced() ? ' is-calm' : ''); el.setAttribute('aria-hidden', 'true');
      el.style.setProperty('--fam', f.accent);
      el.innerHTML = '<em>' + CM.icon(f.icon) + U.esc(f.label) + '</em><b>' + U.esc($('mname').textContent) + '</b>' +
        (opp && opp.name ? '<span>vs ' + U.esc(opp.name) + (opp.rating != null && opp.rating !== '' ? ' (' + U.esc(String(opp.rating)) + ')' : '') + '</span>' : '');
      wrap.appendChild(el);
      stripT = setTimeout(function () { el.classList.add('is-out'); stripT = setTimeout(function () { el.remove(); }, 320); }, reduced() ? 1400 : 1900);
    })();
  }
  CM.family = { of: of, info: info, apply: apply, clear: clear, strip: strip, curId: curId, FAM: FAM };
})();
