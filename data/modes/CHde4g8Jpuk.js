/* Can I BEAT the December Bots? (2025)  Normal chess against chess.com's December 2025 holiday bots of rising strength: Leftover Turkey (~325), Frosty (~1050), Cabana Santa (~2840). Sources: research/modes/CHde4g8Jpuk.json, frames visual_d (icy blue board #abd1df/#1f4164). Other bots between Frosty and Santa are not named in the research and are left out. */
CM.mode({
  id: "CHde4g8Jpuk",
  name: "December Bots",
  category: "Variants & Games",
  description: "Normal chess on an icy holiday board against chess.com's December bots: Leftover Turkey, Frosty, and finally Cabana Santa at about 2840.",
  how_to_win: "Checkmate each holiday bot to unwrap the next one.",
  player_side: "white",
  opponent: {
    name: "Leftover Turkey",
    rating: 325,
    avatar: "assets/modes/CHde4g8Jpuk/turkey.png"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#abd1df",
    dark: "#1f4164"
  },
  params: {
    levels: [
      {
        name: "Leftover Turkey",
        rating: 325,
        avatar: "assets/modes/CHde4g8Jpuk/turkey.png",
        hello: "Gobble... I'm still a bit cold from the fridge.",
        chat: [
          "Gobble.",
          "I'm reheated and ready.",
          "Is it still Thanksgiving?"
        ]
      },
      {
        name: "Frosty",
        rating: 1050,
        avatar: "assets/modes/CHde4g8Jpuk/frosty.png",
        hello: "Let it snow!",
        chat: [
          "Brr, sharp move.",
          "I'm melting under pressure.",
          "Snowball fight!"
        ]
      },
      {
        name: "Cabana Santa",
        rating: 2840,
        avatar: "assets/modes/CHde4g8Jpuk/santa.png",
        hello: "Ho ho ho! Santa is on vacation, but not from chess.",
        chat: [
          "Ho ho ho!",
          "Naughty list for that move.",
          "Sunscreen and sacrifices."
        ],
        loss: "Ho ho ho! Better luck next Christmas."
      }
    ],
    chatChance: 0.3
  },
  vfx: [
    {
      type: "particles",
      kind: "dust",
      count: 30,
      duration_ms: 0,
      id: "snow"
    }
  ],
  source: {
    research: "research/modes/CHde4g8Jpuk.json",
    confidence: "high",
    notes: "Only the three named bots are included. Portraits: exact chess.com art at 200px instead of the 76-90px video crops: frosty.png = Frosty-BOT https://images.chesscomfiles.com/uploads/v1/user/502197831.c06fe26f.200x200o.1ae08b4ccb6c.png, santa.png = Cabana-Santa-BOT https://images.chesscomfiles.com/uploads/v1/user/502198181.5e10c7a6.200x200o.29794fb00ffd.png (api.chess.com/pub/player/<user> avatar, 200px), figure registered + tone-matched onto the video crop's background (tools/art6_bot_portraits.py, 2026-11-25 PM ET)."
  },
  title: "Can I BEAT the December Bots? (2025)",
  hooks: 'g4_ladder'
});
