// Scene 6: who does the selecting. The loop with its "keep" station in question; then a split: a company
// keeping what pays, a community keeping what serves it; then a cartridge opened up, its permissions
// readable, with private messages locked outside the core's rules.
import { board, defineScene, named, svg } from '../../../../../engine/index.ts';
import { color, moods } from '../../../../../styles/coasys/index.ts';
import { appBox, arrow, at, caps, cartridge, community, company, cross, loop, mark, pose, tick } from '../kit.ts';

export default defineScene('who-selects', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2);

  // Pose 1: the loop, its "keep" station asking who decides.
  const q = named('who-keeps', at(art, 960, 480));
  loop(q, 230, { spin: 0.3, from: ctx.t0 });
  const k = (150 * Math.PI) / 180;
  svg('circle', { cx: 230 * Math.cos(k), cy: 230 * Math.sin(k), r: 40, fill: 'none', stroke: color.mint, 'stroke-width': 4 }, q);
  caps(q, 0, 400, 'who decides what gets kept?', { size: 30, fill: color.text });
  pose(q, ctx.t0, l1.v0 + 0.2);

  // Pose 2: the split. Today on the left, here on the right.
  const split = named('selectors', at(art));
  svg('rect', { x: 0, y: 0, width: 960, height: 1080, fill: moods.problem.bg }, split);
  const today = named('today', at(split));
  company(at(today, 230, 520), 1.2);
  for (let i = 0; i < 3; i++) mark(today, 0, 400 + i * 70, 500 - i * 10, 0.9, color.orange);
  arrow(today, 380, 560, 610, 560, { stroke: color.orange });
  appBox(at(today, 760, 540), 220, 150, { seed: 51 });
  tick(today, 860, 450, 1, color.steel);
  caps(today, 480, 820, 'today: what keeps a company alive', { size: 22, fill: color.steel });
  const here = named('here', at(split));
  community(at(here, 1440, 600), 220, 13, 9);
  cartridge(at(here, 1260, 250), 170, 130, 'rota');
  tick(here, 1350, 200, 1);
  cartridge(at(here, 1620, 250), 170, 130, 'streaks', { dim: true });
  cross(here, 1710, 200, 1);
  caps(here, 1440, 900, 'here: what communities choose to keep', { size: 22, fill: color.mint });
  pose(split, l1.v0, l2.v0 + 0.2);
  pose(here, ctx.part(1, 1).v0, l2.v0 + 0.2);

  // Pose 3: safety. A cartridge opened up and readable; private messages stay locked outside its reach.
  const safe = named('open-cartridge', at(art));
  svg('rect', { x: 260, y: 230, width: 1100, height: 600, rx: 40, fill: 'none', stroke: color.mint, 'stroke-width': 3, 'stroke-dasharray': '16 12' }, safe);
  caps(safe, 290, 210, 'the core holds the rules', { size: 20, fill: color.mint, anchor: 'start' });
  cartridge(at(safe, 520, 530), 280, 210, 'rota');
  svg('rect', { x: 760, y: 360, width: 520, height: 340, rx: 16, fill: color.surface, stroke: color.line, 'stroke-width': 2 }, safe);
  caps(safe, 790, 410, 'what it does', { size: 20, fill: color.text3, anchor: 'start' });
  const rows: [string, boolean][] = [['shows who is on when', true], ['adds and swaps shifts', true], ['reads your messages', false]];
  rows.forEach(([s, ok], i) => {
    (ok ? tick : cross)(safe, 815, 480 + i * 75, 0.8);
    caps(safe, 860, 490 + i * 75, s, { size: 22, fill: ok ? color.text : color.text3, anchor: 'start', weight: 600 });
  });
  const msgs = named('private-messages', at(safe, 1560, 530));
  svg('path', { d: 'M -70 -50 H 70 V 40 H -10 L -40 70 V 40 H -70 Z', fill: color.surface, stroke: color.steel, 'stroke-width': 3 }, msgs);
  svg('path', { d: 'M -14 -8 V -20 A 14 14 0 0 1 14 -20 V -8 M -22 -8 H 22 V 22 H -22 Z', fill: 'none', stroke: color.danger, 'stroke-width': 4, 'stroke-linejoin': 'round' }, msgs);
  caps(msgs, 0, 120, 'private messages', { size: 18 });
  arrow(safe, 640, 640, 1480, 590, { stroke: color.danger, dash: '6 10', bend: 220 });
  cross(safe, 1360, 760, 1);
  pose(safe, l2.v0, t1 + 1);

  board(ctx.line(0).v1, 'The loop again, its "keep" station circled in mint: who decides what gets kept?');
  board(l1.v1, 'Split screen. Left (dark): a company, money flowing in, keeps the app that pays. Right: a community keeps the rota and drops "streaks".');
  board(l2.v1, 'Safety: a cartridge with its permissions laid out to read; its reach toward private messages is blocked at the boundary the core enforces.');
});
