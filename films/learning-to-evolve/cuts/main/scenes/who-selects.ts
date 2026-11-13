// Scene 6: who does the selecting. The small loop inside the community grows into the big loop, its
// "keep" station circled: who decides? Then a split: a dark panel slides in where money flows from a
// company into the app it keeps; on the right a community keeps the rota and drops "streaks". Then the
// rota travels to the middle and opens up: what it does, readable, and its reach toward private
// messages blocked at the boundary the core enforces.
import { board, cue, defineScene, eio, eout, line, named, onFrame, prog, scene, svg, tf, vis } from '../../../../../engine/index.ts';
import { color, moods } from '../../../../../styles/coasys/index.ts';
import {
  appBox, arrive, at, caps, cartridge, community, company, cross, drawArrow, fly, hold, loop, mark, popIn, tick,
} from '../kit.ts';

export default defineScene('who-selects', ctx => {
  const { art, t1, t0 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2);
  const [selecting, here] = [ctx.part(0, 1), ctx.part(1, 1)];
  const fadeIn = (e: Element, a: number) => onFrame(t => vis(e, prog(t, a, a + 0.5)));

  // The handoff: the community the last scene ended on fades as its small mint loop grows into the big one.
  const prev = line(scene('climbing').lines.at(-1)!).v0;
  const handoff = named('handoff-community', at(art, 760, 540));
  community(handoff, 330, 18, 8);
  svg('circle', { r: 120, fill: color.page, opacity: 0.85 }, handoff);
  onFrame(t => vis(handoff, 1 - prog(t, t0, t0 + 0.6)));

  // Pose 1: the loop, its "keep" station circled in mint as "what does the selecting" is said.
  const q = named('who-keeps', at(art));
  const big = at(q), small = at(q);
  loop(big, 230, { spin: 0.3, from: t0 });
  loop(small, 230, { labels: false, width: 4 * 230 / 80, spin: 1, from: prev, stroke: color.mint });
  onFrame(t => {
    const u = eio(prog(t, t0, t0 + 0.9));
    q.setAttribute('transform', tf(760 + 200 * u, 540 - 60 * u, 80 / 230 + (1 - 80 / 230) * u));
    vis(big, prog(t, t0 + 0.2, t0 + 0.8));
    vis(small, 1 - prog(t, t0 + 0.2, t0 + 0.8));
  });
  const k = (150 * Math.PI) / 180;
  const ring = named('keep-ring', svg('circle', { r: 40, fill: 'none', stroke: color.mint, 'stroke-width': 4 }, at(q)).parentElement!);
  popIn(ring, 230 * Math.cos(k), 230 * Math.sin(k), selecting.v0 + 0.8);
  cue(selecting.v0 + 0.8, 'tick');
  const ask = named('who-decides', caps(q, 0, 400, 'who decides what gets kept?', { size: 30, fill: color.text }));
  fadeIn(ask, selecting.v0 + 1.2);
  hold(q, t0, l1.v0 + 0.3);

  // Pose 2: the split. A dark panel slides in for today; here, on the right, a community chooses.
  const split = named('selectors', at(art));
  const dark = named('today-panel', svg('rect', { x: 0, y: 0, width: 960, height: 1080, fill: moods.problem.bg }, split));
  onFrame(t => dark.setAttribute('transform', tf(-960 * (1 - eout(prog(t, l1.v0, l1.v0 + 0.6))), 0)));
  const today = named('today', at(split));
  popIn(named('company', company(at(today), 1.2)), 230, 520, l1.v0 + 0.5);
  drawArrow(today, 380, 560, 610, 560, l1.v0 + 0.9, { stroke: color.orange, name: 'money-arrow' });
  for (let i = 0; i < 3; i++) {
    const m = named(`money-${i + 1}`, at(today));
    mark(m, 0, 0, 0, 0.9, color.orange);
    onFrame(t => {
      const f = (((t - l1.v0 - 1.2) * 0.6 + i / 3) % 1 + 1) % 1;
      m.setAttribute('transform', tf(390 + 200 * f, 510 - 24 * Math.sin(Math.PI * f)));
      vis(m, t < l1.v0 + 1.2 ? 0 : Math.sin(Math.PI * f));
    });
  }
  popIn(named('kept-app', appBox(at(today), 220, 150, { seed: 51 })), 760, 540, l1.v0 + 1.3);
  popIn(named('kept-app-tick', tick(today, 0, 0, 1, color.steel)), 860, 450, l1.v0 + 2.2);
  cue(l1.v0 + 2.2, 'keep');
  fadeIn(caps(today, 480, 820, 'today: what keeps a company alive', { size: 22, fill: color.steel }), l1.v0 + 1.0);

  const ours = named('here', at(split));
  popIn(named('community', community(at(ours), 220, 13, 9)), 1440, 600, here.v0 + 0.2);
  const rota = named('rota', cartridge(at(ours), 170, 130, 'rota'));
  popIn(rota, 1260, 250, here.v0 + 0.8);
  const streaksAt = named('streaks', at(ours));
  const streaks = at(streaksAt);
  cartridge(streaks, 170, 130, 'streaks');
  popIn(streaksAt, 1620, 250, here.v0 + 1.0);
  popIn(named('rota-tick', tick(ours, 0, 0)), 1350, 200, here.v0 + 1.8);
  cue(here.v0 + 1.8, 'keep');
  const dropAt = here.v0 + 2.4;
  popIn(named('streaks-cross', cross(ours, 0, 0)), 1710, 200, dropAt);
  onFrame(t => streaks.setAttribute('opacity', (1 - 0.6 * prog(t, dropAt, dropAt + 0.5)).toFixed(3)));
  cue(dropAt, 'thud');
  fadeIn(caps(ours, 1440, 900, 'here: what communities choose to keep', { size: 22, fill: color.mint }), here.v0 + 1.2);
  hold(split, l1.v0, l2.v0 + 0.4);

  // Pose 3: safety. The rota travels to the middle and opens: what it does, readable; its reach toward
  // private messages is blocked at the boundary the core holds.
  const safe = named('open-cartridge', at(art));
  const d = l2.v1 - l2.v0, at2 = (f: number) => l2.v0 + d * f;
  const opened = named('opened-rota', at(safe));
  cartridge(opened, 280, 210, 'rota');
  fly(opened, [1260, 250], [800, 260], [520, 530], l2.v0 + 0.1, l2.v0 + 1.1, { s0: 170 / 280, s1: 1 });
  const sheet = named('what-it-does', at(safe));
  svg('rect', { x: 760, y: 360, width: 520, height: 340, rx: 16, fill: color.surface, stroke: color.line, 'stroke-width': 2 }, sheet);
  caps(sheet, 790, 410, 'what it does', { size: 20, fill: color.text3, anchor: 'start' });
  arrive(sheet, 0, 0, at2(0.33), { dx: -160, dur: 0.6 });
  const rows: [string, boolean][] = [['shows who is on when', true], ['adds and swaps shifts', true], ['reads your messages', false]];
  rows.forEach(([s, ok], i) => {
    const a = at2(0.42) + i * 0.5;
    popIn(named(`permission-${i + 1}-mark`, (ok ? tick : cross)(sheet, 0, 0)), 815, 480 + i * 75, a, { s: 0.8 });
    fadeIn(named(`permission-${i + 1}`, caps(sheet, 860, 490 + i * 75, s, { size: 22, fill: ok ? color.text : color.text3, anchor: 'start', weight: 600 })), a + 0.1);
    cue(a, 'tick', { i });
  });
  const rules = named('core-boundary', at(safe));
  svg('rect', { x: -550, y: -300, width: 1100, height: 600, rx: 40, fill: 'none', stroke: color.mint, 'stroke-width': 3, 'stroke-dasharray': '16 12' }, rules);
  caps(rules, -520, -320, 'the core holds the rules', { size: 20, fill: color.mint, anchor: 'start' });
  onFrame(t => {
    const u = eout(prog(t, at2(0.72), at2(0.72) + 0.6));
    rules.setAttribute('transform', tf(810, 530, 1.06 - 0.06 * u));
    vis(rules, u);
  });
  const msgs = named('private-messages', at(safe));
  svg('path', { d: 'M -70 -50 H 70 V 40 H -10 L -40 70 V 40 H -70 Z', fill: color.surface, stroke: color.steel, 'stroke-width': 3 }, msgs);
  svg('path', { d: 'M -14 -8 V -20 A 14 14 0 0 1 14 -20 V -8 M -22 -8 H 22 V 22 H -22 Z', fill: 'none', stroke: color.danger, 'stroke-width': 4, 'stroke-linejoin': 'round' }, msgs);
  caps(msgs, 0, 120, 'private messages', { size: 18 });
  popIn(msgs, 1560, 530, at2(0.76));
  drawArrow(safe, 640, 640, 1480, 590, at2(0.8), { stroke: color.danger, bend: 220, width: 3, dur: 0.7, name: 'reach-arrow' });
  popIn(named('reach-blocked', cross(safe, 0, 0)), 1360, 722, at2(0.8) + 0.5);
  cue(at2(0.8) + 0.5, 'lock');
  hold(safe, l2.v0, t1 + 1);

  board(l0.v1, 'The small loop from inside the community has grown into the big loop again, its "keep" station circled in mint: who decides what gets kept?');
  board(l1.v1, 'Split screen. Left (a dark panel slid in): money flows from a company into the app it keeps. Right: a community keeps the rota and drops "streaks".');
  board(l2.v1, 'Safety: the rota has travelled to the middle and opened up, what it does readable; its reach toward private messages is blocked at the boundary the core holds.');
});
