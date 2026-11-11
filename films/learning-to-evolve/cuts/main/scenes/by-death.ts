// Scene 2: the whole app as the unit of selection, fed by a handful of teams; a good idea dies inside a
// failing app while a bad one lives on in a winner; the loop takes years per turn; "tested by death".
import { board, defineScene, eio, named, onFrame, prog, svg, tf } from '../../../../../engine/index.ts';
import { beat, color, person } from '../../../../../styles/coasys/index.ts';
import { appBox, arrow, at, caps, company, loop, mood, pose } from '../kit.ts';

export default defineScene('by-death', ctx => {
  const { art, text, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2);
  mood(ctx, 'problem');

  // Pose 1: one big app, bracketed as the unit; a handful of teams on the left; "survive?" below.
  const unit = named('unit-of-selection', at(art));
  appBox(at(unit, 1060, 470), 560, 360, { parts: ['plain', 'idea', 'plain', 'plain', 'bad', 'plain', 'plain', 'plain', 'plain'], seed: 8 });
  svg('rect', { x: 750, y: 260, width: 620, height: 420, rx: 30, fill: 'none', stroke: color.text, 'stroke-width': 3, 'stroke-dasharray': '14 12' }, unit);
  caps(unit, 1060, 235, 'the unit: the whole app', { size: 28, fill: color.text });
  const teams = named('teams', at(unit));
  for (let i = 0; i < 5; i++) person(at(teams, 330, 300 + i * 90), 26, color.steel);
  caps(teams, 330, 760, 'a handful of teams', { size: 20 });
  arrow(teams, 400, 470, 730, 470, { stroke: color.steel });
  const survive = named('survive', at(unit, 1060, 800));
  company(at(survive, 0, 0, 0.6));
  caps(survive, 70, 12, 'does the company survive?', { size: 26, fill: color.text2, anchor: 'start' });
  pose(unit, ctx.t0, l1.v0 + 0.2);
  pose(survive, ctx.part(0, 2).v0, l1.v0 + 0.2);

  // Pose 2: two apps. The failing one sinks, cracked, with a good idea inside; the winner rises with a bad one.
  const fate = named('fates', at(art));
  const fail = named('failing-app', at(fate));
  appBox(fail, 420, 280, { parts: ['plain', 'idea', 'plain', 'plain', 'plain', 'plain'], seed: 5 });
  svg('path', { d: 'M -60 -140 L -20 -60 L -70 10 L -10 90 L -40 140', fill: 'none', stroke: color.danger, 'stroke-width': 4 }, fail);
  caps(fate, 560, 830, 'a good idea dies with it', { size: 24, fill: color.orange });
  const win = named('winning-app', at(fate));
  appBox(win, 420, 280, { parts: ['plain', 'plain', 'plain', 'bad', 'plain', 'plain'], seed: 6 });
  caps(fate, 1360, 830, 'a bad idea lives on', { size: 24, fill: color.danger });
  const a = ctx.part(1, 0).v0;
  onFrame(t => {
    const u = eio(prog(t, a + 0.6, a + 2.2));
    fail.setAttribute('transform', tf(560, 480 + u * 120, 1, u * -8));
    fail.setAttribute('opacity', (1 - 0.55 * u).toFixed(3));
    win.setAttribute('transform', tf(1360, 480 - eio(prog(t, ctx.part(1, 1).v0, ctx.part(1, 1).v0 + 1.4)) * 80));
  });
  arrow(fate, 1610, 520, 1610, 330, { stroke: color.steel });
  pose(fate, l1.v0, ctx.part(1, 2).v0 + 0.1);

  // Pose 3: a huge, slow loop with a whole company riding it; years mark each turn.
  const slow = named('slow-loop', at(art, 960, 1160));
  loop(slow, 900, { labels: false, width: 8, spin: 0.01, from: ctx.part(1, 2).v0 });
  const rider = at(slow, 0, -900);
  company(at(rider, 0, 40, 0.8));
  appBox(at(rider, 150, 40), 150, 100);
  for (let y = 1; y <= 5; y++) {
    const ang = -Math.PI / 2 + (y - 3) * 0.28;
    caps(slow, 980 * Math.cos(ang), 980 * Math.sin(ang), `year ${y}`, { size: 20 });
  }
  pose(slow, ctx.part(1, 2).v0, t1 + 1);
  onFrame(t => slow.setAttribute('opacity', String(t > l2.v0 ? 0.35 : 1)));

  beat(text, { t0: l2.v0 + 0.2, t1: t1 + 0.5, dim: 0.5, rows: [{ h: 'Whole things,', t: l2.v0 + 0.2 }, { h: 'tested by death.', t: l2.v0 + 1.4 }] });

  board(ctx.part(0, 2).v1, 'The whole app bracketed as the unit of selection. A handful of teams feed it; below, the only test: does the company survive?');
  board(ctx.part(1, 1).v1, 'Two apps: the failing one sinks and cracks with a good idea (orange) inside; the winner rises carrying a bad one (red).');
  board(ctx.part(1, 2).v1, 'A huge, slow loop, mostly off screen, with a whole company riding it: one turn takes years.');
  board(l2.v1, 'Big words over the dimmed loop: "Whole things, tested by death."');
});
