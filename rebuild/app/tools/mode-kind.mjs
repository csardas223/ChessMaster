/* pol-ui (owner 2026-11-25 4:57 PM ET): short per-video category ("kind") shown as the small badge on lobby rows/cards,
   instead of the mode name that only repeated the title. Derived from data we already have: the mode file (hooks module,
   frame, players), the video's lobby category and its title. Series always map to the same kind (all Shotgun King ranks,
   all King of the Bridge endings, every Martinfish ...). Used by tools/build-data.mjs -> CM_DATA.videoKinds.
   Order matters: the first rule that matches wins. Keep labels short (they sit in a 1-line badge). */

const HOOK_KIND = {
  g1_dice: 'Dice', g2_drawback: 'Drawback', g2_fish: 'Bot Battle', g2_elofish: 'Bot Battle',
  g3_ladder: 'Odds', g3_odds: 'Odds', g1_secretq: 'Power-up', g1_mines: 'Power-up',
  g4_ladder: 'Bot Ladder', g5_ladder: 'Bot Ladder', g6_ladder: 'Bot Ladder', g4_martin: 'Bot Ladder', g4_evil: 'Bot Battle',
  g5_4pc: '4-Player', g6_4pc: '4-Player',
  g6_spellc: 'Spell Chess',
  g4_shotgun: 'Roguelike', g5_shotgun: 'Roguelike', g5_ouro: 'Roguelike', g5_pawnbarian: 'Roguelike', g5_passant: 'Roguelike',
  g4_kotb: 'Indie Game', g5_troll: 'Indie Game', g6_bridge: 'Indie Game',
  g5_levels: 'Puzzle', g6_levels: 'Puzzle', g6_infinite: 'Variant',
  g6_rosen: 'Opening', g5_spell: 'Opening',
  g4_cu: 'Chess Ultimate', g5_realtime: 'Real-time', g5_fps: 'Indie Game', g5_petrified: 'Indie Game', g5_wizard: 'Indie Game',
  g4_epmate: 'Challenge', g4_solo: 'Challenge', g4_wheel: 'Challenge',
};

/* title/name keywords, checked before the hooks map (series that span several hook modules) */
const TITLE_RULES = [
  [/shotgun king|ouroboros|pawnbarian|gambonanza|chess survivors|(?<!en )passant/i, 'Roguelike'],
  [/king of the bridge|petrified|battle chess|wizard chess|fps chess|table tactics/i, 'Indie Game'],
  [/chessformer|beyond the board|who takes the crown|puzzle|mate in \d/i, 'Puzzle'],
  [/spell chess|explosive magic/i, 'Spell Chess'],
  [/chess ultimate/i, 'Chess Ultimate'],
  [/\b(4|four)[ -]player|chaturaji|labyrinth 82|dangerous intersection|3 hunters/i, '4-Player'],
  [/^(chinese )?chess vs (shogi|checkers|chaturanga|modern)|^snake vs chess|tries xian|xiangqi/i, 'Crossover'],
  [/tinyhouse|minihouse|cross derby|portals to chess|anarchy chess|roblox chess|seirawan/i, 'Variant'],
  [/tournament|rating climb|road to nm|smurf|99\.9%|championship|leaderboard|2000 elo players/i, 'Online'],
  [/drawback/i, 'Drawback'],
  [/dice chess/i, 'Dice'],
  [/\bscp\b|scp-|horror|backrooms|jumpscare/i, 'Horror'],
  [/guess the elo|\bgte\b/i, 'Guess the Elo'],
  [/\bnuke\b/i, 'Odds'],
  [/(fish|stockfish), but|martinfish|worstfish/i, 'Bot Battle'],
  [/\bbots?\b/i, 'Bot Ladder'],
  [/opening/i, 'Opening'],
];

const CAT_KIND = {
  'Horror Chess': 'Horror', 'Drawback Chess': 'Drawback', 'Dice Chess': 'Dice', 'Variant Bots': 'Bot Battle',
  'Challenges & Odds': 'Odds', 'Powerups & Rule Twists': 'Power-up', 'Variants & Games': 'Variant', 'Other Videos': 'Challenge',
  Play: 'Classic',
};

/* m = { title, name, category, frame, players (count), hooks (module name or '') } */
export function modeKind(m) {
  const text = [m.title || '', m.name || ''].join(' | ');
  if (m.frame === 'game' && !/chess ultimate/i.test(text)) return 'Video Game';
  if ((m.players || 0) >= 3) return /hunters/i.test(text) ? '4-Player' : (m.players === 3 ? '3-Player' : '4-Player');
  if (m.category === 'Horror Chess') return 'Horror';
  for (const [re, k] of TITLE_RULES) if (re.test(text)) return k;
  if (m.hooks && HOOK_KIND[m.hooks]) return HOOK_KIND[m.hooks];
  if (m.category === 'Challenges & Odds' && /how many|extra|odds|removing|with \d|vs \d|\d+ (moves?|pawns|queens)/i.test(text)) return 'Odds';
  return CAT_KIND[m.category] || 'Variant';
}
