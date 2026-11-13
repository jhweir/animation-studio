// Scene 9: platforms open a door to apps and bots, then lock it; the real risk of opening a social space
// (code reading messages, acting as people); the two requirements: safe by design, owned by no one.
import { board, defineScene, named, svg } from '../../../../../engine/index.ts';
import { appBox, arrow, at, bot, caps, color, community, mood, person, pose, tick } from '../../../../../styles/coasys/index.ts';

export default defineScene('why-not', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1);
  mood(ctx, 'problem');
  const lock = (p: Element, x: number, y: number, s = 1) =>
    svg('path', { d: 'M -14 -8 V -20 A 14 14 0 0 1 14 -20 V -8 M -22 -8 H 22 V 22 H -22 Z', transform: `translate(${x} ${y}) scale(${s})`, fill: 'none', stroke: color.danger, 'stroke-width': 4 / s, 'stroke-linejoin': 'round' }, p);

  // Pose 1: the door opened a crack, on their terms, and locked again.
  const door = named('platform-door', at(art));
  appBox(at(door, 1060, 520), 700, 480, { parts: Array(9).fill('plain'), seed: 100 });
  svg('rect', { x: 690, y: 420, width: 26, height: 200, fill: color.bgDeep, stroke: color.steel, 'stroke-width': 3 }, door);
  bot(at(door, 420, 440), 34);
  appBox(at(door, 420, 600), 110, 76, { seed: 101 });
  arrow(door, 490, 520, 660, 520, { stroke: color.steel, dash: '8 8' });
  lock(door, 703, 520, 1.4);
  caps(door, 1060, 830, 'open on their terms · closed when it suited them', { size: 22, fill: color.text2 });
  pose(door, ctx.t0, l1.v0 + 0.2);

  // Pose 2: the risk. Code inside a space reading messages and speaking as people.
  const risk = named('the-risk', at(art));
  community(at(risk, 760, 540), 300, 14, 102);
  const code = at(risk, 760, 540);
  svg('rect', { x: -70, y: -50, width: 140, height: 100, rx: 10, fill: color.surface, stroke: color.danger, 'stroke-width': 3 }, code);
  caps(code, 0, 10, '</>', { size: 28, fill: color.danger });
  svg('path', { d: 'M -70 -50 H 70 V 40 H -10 L -40 70 V 40 H -70 Z', transform: 'translate(1360 400)', fill: color.surface, stroke: color.steel, 'stroke-width': 3 }, risk);
  arrow(risk, 840, 500, 1270, 400, { stroke: color.danger, dash: '6 8' });
  caps(risk, 1360, 520, 'reads private messages', { size: 20, fill: color.danger });
  person(at(risk, 1360, 700), 34, color.steel);
  arrow(risk, 840, 580, 1310, 700, { stroke: color.danger, dash: '6 8' });
  caps(risk, 1360, 790, 'acts in people’s names', { size: 20, fill: color.danger });
  pose(risk, l1.v0, ctx.part(1, 2).v0 + 0.1);

  // Pose 3: the two requirements.
  const req = named('requirements', at(art));
  [['safe by design', 620], ['owned by no one', 1300]].forEach(([s, x]) => {
    const g = at(req, x as number, 520);
    svg('rect', { x: -260, y: -140, width: 520, height: 280, rx: 24, fill: color.surface, stroke: color.mint, 'stroke-width': 3 }, g);
    tick(g, 0, -40, 2);
    caps(g, 0, 70, s as string, { size: 30, fill: color.text });
  });
  pose(req, ctx.part(1, 2).v0, t1 + 1);

  board(ctx.line(0).v1, 'A big platform with a narrow door: apps and bots let in on its terms, then a red padlock on the door.');
  board(ctx.part(1, 1).v1, 'The risk: a piece of code (red) inside a community, reaching out to read private messages and to act as a person.');
  board(l1.v1, 'Two mint cards: "safe by design" and "owned by no one".');
});
