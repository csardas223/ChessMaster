/* Can I BEAT Once a Pawn a King?  Let's-play of the Steam chess roguelike Once a Pawn a King (Clover Bite): the
   tutorial and the first Cellars rooms, rebuilt as a 2D top-down game frame (js/games/once-pawn-king.js).
   Sources: research/modes/C9v7G3dJl7E.json; transcript (analyze_video, 2026-11-26) 0:22-1:00 Pongement intro,
   1:04-1:17 placement / moves / End turn, 1:31-2:08 capture-all rule, patrols, White moves first, enemies leave their
   patrol to capture, 3:02-3:11 Angel blessings Pull + Hop for piece shards, 4:06-4:44 order numbers, mana 50, +10 per
   kill, refills each room, 5:03 key clears the room, 5:54-5:58 Butcher (pawn / bishop, army of two), 6:48-6:51 chests
   + keys, 9:31 two knights, 12:15 bishop + four pawns, 19:57 money bag.
   Art: Pongement + white pawn portraits cut from the video's own frame (i.ytimg.com maxres1); Pawnjamin card, door,
   shard and key icons cut from the game's Steam store screenshots (app 3298910) because the video's frames are not
   downloadable here; see assets/modes/C9v7G3dJl7E/source.notes. Board pieces use the selected piece set (black army /
   white army). Inferred: room layouts and patrols, shard prices and rewards, blessing mana cost 20. */
CM.mode({
  id: 'C9v7G3dJl7E',
  title: 'Can I BEAT Once a Pawn a King?',
  name: 'Once a Pawn a King',
  category: 'Variants & Games',
  frame: 'game',
  description: 'A chess roguelike in a purple dungeon. Place your black pieces on the starting tiles and press Start: White always moves first, and every white piece shows its patrol (its next move) with a number for the order it moves in. Each of your pieces may move once per turn, then End turn. Clear a room by capturing every white piece, by reaching the key, or by unlocking the door with a key. Between rooms the Angel sells blessings (Pull, Hop) and the Butcher sells pieces (army of two). Blessings cost mana (50 per room, +10 per kill) and do not spend the move. Chests open with a key from a neighbouring tile.',
  how_to_win: 'Get Pongement and your army through the tutorial and the first three Cellars rooms. Lose every piece and the run is over.',
  player_side: 'black',
  player: { name: 'Black army', rating: null, avatar: 'assets/modes/C9v7G3dJl7E/pongement.jpg' },
  opponent: { name: 'White army', rating: null, avatar: 'assets/modes/C9v7G3dJl7E/white_pawn.jpg', tagline: 'Countless identical white pieces. None of them talk.' },
  theme: { background: '#1a0c18' },
  game: { module: 'once-pawn-king', aspect: 1, controls: ['left', 'right', '|', 'action'] },
  assets: {
    pong_card: 'assets/modes/C9v7G3dJl7E/pawnjamin_card.png', door: 'assets/modes/C9v7G3dJl7E/door.png',
    shard: 'assets/modes/C9v7G3dJl7E/shard.png', key: 'assets/modes/C9v7G3dJl7E/key.png', pull: 'assets/modes/C9v7G3dJl7E/pull.png'
  },
  source: { research: 'research/modes/C9v7G3dJl7E.json', confidence: 'medium', notes: 'Rules from the transcript; the game is 3D, this is a top-down 2D take with the game\'s file labels (G..A left to right, rank 1 at the top). Room layouts, patrols, prices and mana costs inferred. Controls: tap; arrows switch pieces (the game\'s scroll), Enter/K = Start / End turn.' }
});
