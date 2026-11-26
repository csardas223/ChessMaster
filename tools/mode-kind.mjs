/* Short lobby badge ("kind") for a video or mode. build-data.mjs used to import this module, but it was missing from the
   repo, which made `node tools/build-data.mjs` fail. The badges already generated in data/kinds.js are kept as they are
   (build-data passes them in as `prev`), so regenerating does not churn them; new videos get a badge from their
   category and title here. */
const BY_CATEGORY = {
  'Horror Chess': 'Horror',
  'Drawback Chess': 'Drawback',
  'Dice Chess': 'Dice',
  'Challenges & Odds': 'Odds',
  'Variant Bots': 'Bot Battle',
  'Powerups & Rule Twists': 'Power-up',
  'Variants & Games': 'Variant',
  'Other Videos': 'Variant',
};

/* title/name phrases that beat the category badge */
const BY_TEXT = [
  [/roguelike|pawnbarian|ouroboros|gambonanza|petrified pawns|king of the bridge|battle chess/i, 'Roguelike'],
  [/4 player|four player|chaturaji|war for (the )?throne/i, '4-Player'],
  [/real[- ]time|hyper chess|1 million chessboards|10,000 player/i, 'Real-time'],
  [/chess ultimate/i, 'Chess Ultimate'],
  [/spell chess|explosive magic/i, 'Spell Chess'],
  [/opening|gambit|london system/i, 'Opening'],
  [/drawback/i, 'Drawback'],
  [/horror|scp-|backrooms|mal0|waldo/i, 'Horror'],
  [/puzzle/i, 'Puzzle'],
  [/bot ladder|how many bots/i, 'Bot Ladder'],
  [/setup chess/i, 'Variant'],
];

export function modeKind(facts, prev) {
  if (prev) return prev;
  const f = facts || {};
  const text = [f.title, f.name].filter(Boolean).join(' ');
  if (f.frame === 'game') return 'Video Game';
  if (Array.isArray(f.players) ? f.players.length >= 3 : f.players >= 3) return '4-Player';
  if (/g6_setup|setup/i.test(f.hooks || '')) return 'Setup';
  for (const [re, kind] of BY_TEXT) if (re.test(text)) return kind;
  if (/drawfish|stockfish|komodo|bot/i.test(text) && f.category === 'Variant Bots') return 'Bot Battle';
  return BY_CATEGORY[f.category] || 'Variant';
}
