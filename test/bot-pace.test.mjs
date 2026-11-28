/* cfb-pace: bots that pose as human players take 0.6-1.8 s (js/bot/bot.js PACE), longer in complex positions;
   engines, puzzle / real-time / 3D modes and bot.pace 'instant' keep the mode's own quick reply. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { makeSandbox, game } from './engine-sandbox.mjs';

function botSandbox() {
  const sb = makeSandbox();
  sb.CM.util = sb.CM.util || { pick: (a) => a[0], rand: () => 0 };
  vm.runInContext(fs.readFileSync(new URL('../js/bot/bot.js', import.meta.url), 'utf8'), sb, { filename: 'js/bot/bot.js' });
  sb.CM_DATA.videoKinds = { pz: 'Puzzle', hu: 'Variant' };
  sb.CM_DATA.modeIndex = { d3: { tags: ['3D'] } };
  return sb;
}

test('human persona: 600-1800 ms, randomised', () => {
  const sb = botSandbox(); const { V, st } = game();
  const spec = { id: 'hu', bot: {} }, opp = { name: '2025ramr', rating: 1954 };
  const t = Array.from({ length: 200 }, () => sb.CM.bot.thinkMs(spec, opp, V, st, V.legal(st)));
  assert.ok(t.every((x) => x >= 600 && x <= 1800), 'inside the window');
  assert.ok(new Set(t).size > 20, 'randomised');
});

test('complex positions take longer on average', () => {
  const sb = botSandbox();
  const simple = game('4k3/8/8/8/8/8/8/4K2R', { turn: 'w' });
  const busy = game('r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R', { turn: 'w', ply: 20 });
  const avg = (g) => { let s = 0; for (let i = 0; i < 400; i++) s += sb.CM.bot.thinkMs({ id: 'hu', bot: {} }, { name: 'Vlad26ru' }, g.V, g.st, g.V.legal(g.st)); return s / 400; };
  assert.ok(avg(busy) > avg(simple) + 100, `busy ${avg(busy)} vs simple ${avg(simple)}`);
});

test('engines, puzzles, 3D and instant modes keep their quick reply', () => {
  const sb = botSandbox(); const { V, st } = game(); const mv = V.legal(st);
  assert.equal(sb.CM.bot.thinkMs({ id: 'hu', bot: {} }, { name: 'Stockfish 17' }, V, st, mv), null);
  assert.equal(sb.CM.bot.thinkMs({ id: 'pz', bot: {} }, { name: 'Bob' }, V, st, mv), null);
  assert.equal(sb.CM.bot.thinkMs({ id: 'd3', bot: {} }, { name: 'Peasant' }, V, st, mv), null);
  assert.equal(sb.CM.bot.thinkMs({ id: 'hu', bot: { pace: 'instant' } }, { name: 'Bob' }, V, st, mv), null);
  sb.CM.bot.PACE.human = null;
  assert.equal(sb.CM.bot.thinkMs({ id: 'hu', bot: {} }, { name: 'Bob' }, V, st, mv), null, 'one switch turns pacing off');
});
