// Single-threaded Fairy-Stockfish (Chess Master build): commands are queued and read by UCI::loop via Asyncify.
class Queue {
  constructor() { this.getter = null; this.list = []; }
  async get() { if (this.list.length > 0) return this.list.shift(); return await new Promise((resolve) => (this.getter = resolve)); }
  put(x) { if (this.getter) { const g = this.getter; this.getter = null; g(x); return; } this.list.push(x); }
}
Module["queue"] = new Queue();
Module["postMessage"] = (cmd) => Module["queue"].put(String(cmd));
const listeners = [];
const early = [];
Module["addMessageListener"] = (l) => { listeners.push(l); early.splice(0).forEach((d) => l(d)); };
Module["removeMessageListener"] = (l) => { const i = listeners.indexOf(l); if (i >= 0) listeners.splice(i, 1); };
Module["print"] = Module["printErr"] = (data) => { if (!listeners.length) { early.push(data); return; } for (const l of listeners) l(data); };
