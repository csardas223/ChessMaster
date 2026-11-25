/* Can I SURVIVE Fog of War?  chess.com Fog of War: you only see squares your pieces stand on or can move to; there is no check and capturing the king wins. Sources: research/modes/4EIPARnGSSU.json (transcript: king capture after Qh5), frames visual_d (grey fog, AikidoRambo 1518). The position is revealed when the game ends. */
CM.mode({
  id: "4EIPARnGSSU",
  name: "Fog of War",
  category: "Variants & Games",
  description: "You only see the squares your pieces occupy or can move to; everything else is hidden in fog. There is no check: kings can walk into danger, and the game ends when a king is captured.",
  how_to_win: "Capture the enemy king.",
  player_side: "white",
  opponent: {
    name: "AikidoRambo",
    rating: 1518,
    tagline: "Fog of War opponent on chess.com"
  },
  board: {
    files: 8,
    ranks: 8,
    light: "#ecf2d1",
    dark: "#7a9e58"
  },
  rules: {
    fog: true,
    check: "none"
  },
  bot: {
    engine: "search",
    elo: 1518,
    depth: 4,
    time_ms: 700
  },
  messages: {
    win: "you captured the king in the fog",
    loss: "your king was captured in the fog"
  },
  source: {
    research: "research/modes/4EIPARnGSSU.json",
    confidence: "high"
  },
  title: "Can I SURVIVE Fog of War?"
});
