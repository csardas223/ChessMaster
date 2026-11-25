/* Can I BEAT Table Tactics?  Table Tactics (Steam demo): a turn-based, physics-driven tactics game on a kitchen-table
   diorama. Green units vs purple slimes (and a dragon) marching on your castle; nothing has health, units are beaten
   only by being knocked over; each knockdown pays a coin for the build menu; 5 castle hits = loss.
   Sources: research/modes/xvlHij1tgk8.json (rules + transcript 0:01 quotes). Standalone canvas mini-game
   js/games/g6_table_tactics.js (original art, synthesised sounds in assets/modes/xvlHij1tgk8/). Knock-over is modelled
   as "tilt" (impulse / mass, topples at 1, settles 60% per round) rather than a 3D rigid-body simulation. */
CM.mode({
  id: 'xvlHij1tgk8',
  title: 'Can I BEAT Table Tactics?',
  name: 'Table Tactics',
  category: 'Variants & Games',
  frame: 'game',
  description: 'Turn-based physics tactics on a kitchen-table diorama. Select a unit, move it inside its circle, then attack: catapult marbles keep rolling, archers fire precise arrows, the Cat Knight rams (and leaps again after a knockdown), fire mages throw bombs that hit everyone nearby. Enemies are only beaten when they are knocked over; every knockdown pays a coin for the build menu. New slimes spawn every turn and march on your castle.',
  how_to_win: 'Knock over every enemy through 9 waves. Five hits on your castle and you lose.',
  player: { name: 'Green Rangers', rating: null, avatar: 'assets/modes/xvlHij1tgk8/rangers.svg' },
  opponent: { name: 'AI Team', rating: null, avatar: 'assets/modes/xvlHij1tgk8/ai_team.svg', tagline: 'Purple slimes, meat carriers and a dragon.' },
  theme: { background: '#3b2a1a' },
  game: { module: 'g6_table_tactics', aspect: 1, controls: ['left', 'right', '|', 'jump', 'action'] },
  sounds: {
    step: 'assets/modes/xvlHij1tgk8/step.wav', twang: 'assets/modes/xvlHij1tgk8/twang.wav', launch: 'assets/modes/xvlHij1tgk8/launch.wav',
    bonk: 'assets/modes/xvlHij1tgk8/bonk.wav', fall: 'assets/modes/xvlHij1tgk8/fall.wav', coin: 'assets/modes/xvlHij1tgk8/coin.wav',
    thunk: 'assets/modes/xvlHij1tgk8/thunk.wav', roll: 'assets/modes/xvlHij1tgk8/roll.wav', castle: 'assets/modes/xvlHij1tgk8/castle.wav',
    build: 'assets/modes/xvlHij1tgk8/build.wav', roar: 'assets/modes/xvlHij1tgk8/roar.wav', fanfare: 'assets/modes/xvlHij1tgk8/fanfare.wav'
  },
  _pass2_done: '2026-11-24 impl-6: original canvas art, avatars, synthesised sounds, Your Turn banner, bomb explosions',
  source: { research: 'research/modes/xvlHij1tgk8.json', confidence: 'high', notes: 'Top-down 2D take on the 3D diorama; unit stats, wave count (9) and costs are inferred (video shows coins 15/16, hearts 5). Controls: tap/click; arrows cycle units, Space ends the turn, Enter toggles move/attack.' }
});
