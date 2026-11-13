// Scene 9: platforms open a door a crack to apps and bots, then shut and lock it; the real risk of
// opening a social space (code inside reading messages, acting as people); the two requirements:
// safe by design, owned by no one.
import { board, cue, defineScene, eio, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import { appBox, at, bot, caps, color, community, mood, person, tick } from '../../../../../styles/coasys/index.ts';
import { arrive, drawArrow, drawn, fade, pop } from '../kit.ts';

export default defineScene('why-not', ctx => {
  const { art, t0 } = ctx;
  const l1 = ctx.line(1);
  const P = (i: number, j: number) => ctx.part(i, j);
  const k = (p: { v0: number; v1: number }, f: number) => p.v0 + (p.v1 - p.v0) * f;
  mood(ctx, 'problem');
  const lock = (p: Element, s = 1) =>
    svg('path', { d: 'M -14 -8 V -20 A 14 14 0 0 1 14 -20 V -8 M -22 -8 H 22 V 22 H -22 Z', transform: `scale(${s})`, fill: 'none', stroke: color.danger, 'stroke-width': 4 / s, 'stroke-linejoin': 'round' }, p);

  // Pose 1: the door opened a crack, on their terms, and shut and locked again.
  const out1 = l1.v0 + 0.3;
  const door = named('platform-door', at(art));
  fade(door, t0, out1, 0.3);
  const p00 = P(0, 0);
  const tOpen = k(p00, 0.2), tIn = k(p00, 0.35), tShut = k(p00, 0.78);
  appBox(pop(door, 1060, 520, t0 + 0.3, { name: 'platform', dur: 0.5 }), 700, 480, { parts: Array(9).fill('plain'), seed: 100 });
  // The door: a slab in the platform's wall that slides up a little, then back down.
  // The doorway: a gap in the platform's wall, normally covered by the door.
  const gapR = svg('rect', { x: 700, y: 428, width: 20, height: 184, fill: color.bgDeep }, door);
  onFrame(t => vis(gapR, prog(t, t0 + 0.5, t0 + 0.8)));
  const slab = named('door', svg('rect', { x: 690, y: 420, width: 26, height: 200, fill: color.bgDeep, stroke: color.steel, 'stroke-width': 3 }, door));
  onFrame(t => {
    const open = eio(prog(t, tOpen, tOpen + 0.6)) * (1 - eio(prog(t, tShut, tShut + 0.4)));
    slab.setAttribute('y', (420 - 120 * open).toFixed(1));
    vis(slab, prog(t, t0 + 0.5, t0 + 0.8));
  });
  cue(tOpen, 'slide');
  // Apps and bots come up to it, on its terms; when it shuts they're pushed back out.
  const guests = named('apps-and-bots', at(art));
  const gb = at(guests, 0, 0);
  bot(at(gb, 420, 440), 34);
  appBox(at(gb, 420, 600), 110, 76, { seed: 101 });
  onFrame(t => {
    const u = eio(prog(t, tIn, tIn + 0.8)), back = eio(prog(t, tShut, tShut + 0.6));
    gb.setAttribute('transform', tf(-140 * (1 - u) + 30 * u - 120 * back, 0));
    vis(guests, Math.min(prog(t, tIn, tIn + 0.4), 1 - prog(t, out1 - 0.35, out1)));
  });
  const via = drawArrow(door, 490, 520, 660, 520, tIn + 0.6, { stroke: color.steel, dash: '8 8' });
  onFrame(t => vis(via, 1 - prog(t, tShut, tShut + 0.3)));
  lock(pop(door, 703, 520, tShut + 0.4, { name: 'padlock' }), 1.4);
  cue(tShut + 0.4, 'lock');
  caps(arrive(door, 1060, 830, tShut), 0, 0, 'open on their terms · closed when it suited them', { size: 22, fill: color.text2 });
  // "Control of the interface": the platform's frame glows once.
  const ctl = svg('rect', { x: 710, y: 280, width: 700, height: 480, rx: 48, fill: 'none', stroke: color.steel, 'stroke-width': 6, filter: 'url(#glow)' }, door);
  const tCtl = P(0, 1).v0;
  onFrame(t => vis(ctl, Math.sin(Math.PI * prog(t, tCtl, tCtl + 1.2)) * 0.7));

  // Pose 2: the risk. Code inside a space reading messages and speaking as people.
  const risk = named('the-risk', at(art));
  const out2 = P(1, 2).v0 + 0.1;
  fade(risk, l1.v0, out2, 0.3);
  const space = pop(risk, 760, 540, l1.v0 + 0.1, { name: 'social-space', dur: 0.5 });
  community(space, 300, 14, 102);
  const p11 = P(1, 1);
  const code = pop(risk, 760, 540, p11.v0, { name: 'code-inside' });
  svg('rect', { x: -70, y: -50, width: 140, height: 100, rx: 10, fill: color.surface, stroke: color.danger, 'stroke-width': 3 }, code);
  caps(code, 0, 10, '</>', { size: 28, fill: color.danger });
  cue(p11.v0, 'pop');
  const tRead = k(p11, 0.3), tAct = k(p11, 0.65);
  drawArrow(risk, 840, 500, 1270, 400, tRead, { stroke: color.danger, dash: '6 8' });
  const msg = pop(risk, 1360, 400, tRead + 0.4, { name: 'private-message' });
  svg('path', { d: 'M -70 -50 H 70 V 40 H -10 L -40 70 V 40 H -70 Z', fill: color.surface, stroke: color.steel, 'stroke-width': 3 }, msg);
  for (let i = 0; i < 3; i++) svg('line', { x1: -48, y1: -24 + i * 22, x2: i === 2 ? 10 : 48, y2: -24 + i * 22, stroke: color.steel, 'stroke-width': 3, opacity: 0.6 }, msg);
  caps(arrive(risk, 1360, 520, tRead + 0.5), 0, 0, 'reads private messages', { size: 20, fill: color.danger });
  drawArrow(risk, 840, 580, 1310, 700, tAct, { stroke: color.danger, dash: '6 8' });
  person(pop(risk, 1360, 700, tAct + 0.4, { name: 'acts-as-a-person' }), 34, color.steel);
  caps(arrive(risk, 1360, 790, tAct + 0.5), 0, 0, 'acts in people’s names', { size: 20, fill: color.danger });
  cue(tRead + 0.4, 'crack'); cue(tAct + 0.4, 'crack', { i: 1 });

  // Pose 3: the two requirements, each as it's said; the tick draws on.
  const req = named('requirements', at(art));
  const p12 = P(1, 2);
  ([['safe by design', 620, k(p12, 0.42)], ['owned by no one', 1300, k(p12, 0.7)]] as const).forEach(([s, x, a], i) => {
    const g = pop(req, x, 520, a, { name: s.replace(/ /g, '-'), dur: 0.5 });
    svg('rect', { x: -260, y: -140, width: 520, height: 280, rx: 24, fill: color.surface, stroke: color.mint, 'stroke-width': 3 }, g);
    const tk = tick(g, 0, -40, 2);
    tk.querySelector('path')!.remove();
    drawn(tk, 'M -14 0 L -4 10 L 15 -11', a + 0.35, 0.4, { stroke: color.mint, 'stroke-width': 6 });
    caps(g, 0, 70, s, { size: 30, fill: color.text });
    cue(a, 'keep', { i });
  });

  board(tShut + 1.0, 'A big platform: its door slid open a crack, apps and bots came up to it, then it shut, pushed them back, and a red padlock went on.');
  board(k(p11, 0.95), 'The risk: a piece of code (red) inside a community, reaching out to read private messages and to act as a person.');
  board(l1.v1, 'Two mint cards, each as it\'s said: "safe by design" and "owned by no one".');
});
