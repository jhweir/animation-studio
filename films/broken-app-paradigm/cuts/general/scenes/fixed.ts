// Scene 3: a fixed app design, decided in advance; living communities pressed down into its square
// shape; then the two outcomes: bend to fit (one person squeezed out), or fragment across several apps.
import { board, cue, defineScene, eback, eio, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import { appBox, at, caps, color, community, company, cross, membrane, mood } from '../../../../../styles/coasys/index.ts';
import { appParts, arrive, blobSquarePath, crowd, drawArrow, drawn, fade, pop, popEach, popPeople } from '../kit.ts';

export default defineScene('fixed', ctx => {
  const { art, t0 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2);
  const at0 = (k: number) => l0.v0 + (l0.v1 - l0.v0) * k;
  const p20 = ctx.part(2, 0);
  const at2 = (k: number) => p20.v0 + (p20.v1 - p20.v0) * k;
  mood(ctx, 'problem');

  // Pose 1: the fixed design, from a central team. The box, then its set layout, then its set
  // toolkit, then who decided it.
  const out1 = l1.v0 + 0.3;
  const design = named('fixed-design', at(art));
  const app = pop(design, 1060, 500, Math.max(t0 + 0.2, at0(0.2)), { name: 'fixed-app', until: out1, dur: 0.5 });
  const box = appParts(app, 620, 420, { parts: Array(9).fill('plain'), seed: 12 });
  // The set layout: a grid ruled into the box.
  const grid = svg('g', {}, app);
  for (const x of [-103, 103]) drawn(grid, `M ${x} -150 V 195`, at0(0.38), 0.5, { stroke: color.steel, 'stroke-width': 2, opacity: 0.5 });
  for (const y of [-40, 80]) drawn(grid, `M -295 ${y} H 295`, at0(0.42), 0.5, { stroke: color.steel, 'stroke-width': 2, opacity: 0.5 });
  popEach(box.items, at0(0.52), at0(0.62), 0.35);
  cue(at0(0.38), 'tick'); cue(at0(0.52), 'tap');
  caps(arrive(design, 1060, 770, at0(0.45), { until: out1 }), 0, 0, 'set layout · set toolkit', { size: 24, fill: color.text2 });
  company(pop(design, 420, 500, at0(0.68), { name: 'central-team', until: out1 }), 1);
  const decide = drawArrow(design, 520, 500, 730, 500, at0(0.78), { stroke: color.steel });
  onFrame(t => vis(decide, 1 - prog(t, out1 - 0.35, out1)));
  caps(arrive(design, 420, 680, at0(0.7), { until: out1 }), 0, 0, 'decided in advance', { size: 22 });

  // Pose 2: three different communities pressed into the same square. The boxes arrive on "they
  // don't adapt to us"; the communities press down into them on "so we adapt to them".
  const press = named('we-adapt', at(art));
  const out2 = l2.v0 + 0.3;
  const tPress = ctx.part(1, 1).v0;
  fade(press, l1.v0, out2, 0.3);
  [0, 1, 2].forEach(i => {
    const x = 420 + i * 540, n = 6 + i * 3, r = 90 + i * 20;
    const boxG = pop(press, x, 740, l1.v0 + 0.1 + i * 0.12, { name: `square-${i + 1}` });
    svg('rect', { x: -110, y: -110, width: 220, height: 220, rx: 14, fill: color.steelDark, 'fill-opacity': 0.4, stroke: color.steel, 'stroke-width': 3 }, boxG);
    const g = named(`community-${i + 1}`, at(press, x, 330));
    const c = crowd(g, r, n, 20 + i, { pr: 13 });
    const go = tPress + i * 0.15;
    // Each person's place in the box: a grid, as the steel square allows.
    const cols = Math.ceil(Math.sqrt(n)), rows = Math.ceil(n / cols), sp = 150 / cols;
    const grid = c.spots.map((_, k) => [((k % cols) - (cols - 1) / 2) * sp, (Math.floor(k / cols) - (rows - 1) / 2) * sp + 4] as [number, number]);
    onFrame(t => {
      vis(c.ring, prog(t, l1.v0 + 0.2 + i * 0.12, l1.v0 + 0.6 + i * 0.12));
      const u = eio(prog(t, go, go + 0.8));
      g.setAttribute('transform', tf(x, 330 + 410 * u));
      c.ring.setAttribute('d', blobSquarePath(r, 20 + i, 90, u));
      c.people.forEach((p, k) => {
        const [sx, sy] = c.spots[k], [gx, gy] = grid[k];
        const b = l1.v0 + 0.3 + i * 0.15 + k * 0.05;
        p.setAttribute('transform', tf(sx + (gx - sx) * u, sy + (gy - sy) * u, Math.max(0.0001, eback(prog(t, b, b + 0.35)))));
        vis(p, prog(t, b, b + 0.12));
      });
    });
    const down = drawArrow(press, x, 460, x, 560, l1.v0 + 0.6 + i * 0.12, { stroke: color.steel, dur: 0.35 });
    onFrame(t => vis(down, 1 - prog(t, go, go + 0.25)));
    cue(go + 0.75, 'thud', { i });
  });
  caps(arrive(press, 960, 960, tPress + 0.3), 0, 0, "they don't adapt to us, so we adapt to them", { size: 24, fill: color.text2 });

  // Pose 3: two outcomes. Bend to fit (one person squeezed out); or fragment across five apps.
  const out = named('conform-or-fragment', at(art));
  fade(out, l2.v0 + 0.1, Infinity, 0.3);
  drawn(out, 'M 960 200 V 880', l2.v0 + 0.2, 0.6, { stroke: color.line, 'stroke-width': 2 });
  const bend = named('bend-to-fit', at(out, 480, 520));
  const frame = svg('rect', { x: -200, y: -200, width: 400, height: 400, rx: 16, fill: 'none', stroke: color.steel, 'stroke-width': 4, pathLength: 1 }, bend);
  const bc = crowd(bend, 180, 14, 31);
  popPeople(bc, l2.v0 + 0.4, l2.v0 + 1.2, 0.35);
  const tFit = at2(0.3), tBend = at2(0.4);
  const ghost = membrane(at(bend, 250, -120), 50, 32, { dash: '6 6', fill: 0 });
  const left = bc.people[bc.people.length - 1];
  const [lx, ly] = bc.spots[bc.spots.length - 1];
  onFrame(t => {
    vis(bc.ring, prog(t, l2.v0 + 0.3, l2.v0 + 0.7));
    const f = eio(prog(t, tFit, tFit + 0.6));
    frame.setAttribute('stroke-dasharray', `${f.toFixed(4)} 1`);
    vis(frame, f > 0 ? 1 : 0);
    const u = eio(prog(t, tBend, tBend + 0.8));
    bc.ring.setAttribute('d', blobSquarePath(180, 31, 182, u * 0.9));
    // The one who doesn't fit is pushed out of the square.
    const e = eio(prog(t, tBend + 0.3, tBend + 1.1));
    const b = l2.v0 + 0.4 + (0.8 * 13) / 14;
    const s = Math.max(0.0001, eback(prog(t, b, b + 0.35)));
    left.setAttribute('transform', tf(lx + (250 - lx) * e, ly + (-125 - ly) * e, s));
    vis(ghost, prog(t, tBend + 0.8, tBend + 1.2));
  });
  cue(tBend + 0.6, 'thud');
  caps(arrive(out, 480, 820, tFit), 0, 0, 'bend to fit', { size: 26, fill: color.text });

  // Fragment: one community breaks into five pieces, each pulled into a different app.
  const frag = named('fragment', at(out, 1440, 520));
  const tFrag = at2(0.55), tLose = at2(0.8);
  const spots = [[-200, -170], [0, -200], [200, -170], [-120, 120], [120, 120]];
  const whole = named('whole-community', at(frag, 0, -20));
  community(whole, 110, 10, 41);
  onFrame(t => vis(whole, Math.min(prog(t, tFrag - 0.9, tFrag - 0.5), 1 - prog(t, tFrag, tFrag + 0.2))));
  spots.forEach(([x, y], i) => {
    const b = pop(frag, x, y, tFrag + 0.1 + i * 0.08, { name: `app-${i + 1}` });
    appBox(b, 150, 110, { seed: 40 + i });
    const piece = at(frag, 0, -20);
    community(piece, 30, 2, 41 + i);
    onFrame(t => {
      const u = eio(prog(t, tFrag, tFrag + 0.8 + i * 0.06));
      piece.setAttribute('transform', tf(x * u, -20 + (y + 30) * u, 1));
      vis(piece, prog(t, tFrag - 0.05, tFrag + 0.15));
    });
  });
  cue(tFrag, 'crack');
  // What came from being connected: the links between the pieces, and they break.
  const links = [[0, 1], [1, 2], [3, 4]];
  links.forEach(([a, b], k) => {
    const [ax, ay] = spots[a], [bx, by] = spots[b];
    drawn(frag, `M ${ax} ${ay + 10} L ${bx} ${by + 10}`, tLose - 0.6 + k * 0.1, 0.4, { stroke: color.mint, 'stroke-width': 2, opacity: 0.5 });
  });
  [[-100, -180], [100, -180], [0, 120]].map(([x, y], k) => {
    cross(pop(frag, x, y, tLose + k * 0.15, { name: `broken-link-${k + 1}` }), 0, 0, 0.7);
  });
  cue(tLose, 'crack', { i: 1 });
  caps(arrive(out, 1440, 820, tFrag + 0.2), 0, 0, 'or fragment across tools', { size: 26, fill: color.text });
  // "Spread across five apps": the five boxes flash in turn.
  const felt = ctx.part(2, 1);
  const tFive = felt.v0 + (felt.v1 - felt.v0) * 0.7;
  spots.forEach(([x, y], i) => {
    const h = svg('rect', { x: x - 79, y: y - 59, width: 158, height: 118, rx: 14, fill: 'none', stroke: color.text, 'stroke-width': 3 }, frag);
    onFrame(tt => vis(h, Math.sin(Math.PI * prog(tt, tFive + i * 0.12, tFive + i * 0.12 + 0.6)) * 0.7));
  });
  cue(tFive, 'tap');

  board(at0(0.9), 'Problem mood. One fixed app design: a ruled layout and a set toolkit, decided in advance and sent out from a central team.');
  board(l1.v1, 'Three different living communities pressed down into the same square boxes, their people put in rows: we adapt to them.');
  board(p20.v1, 'The two outcomes, side by side: a community squashed square in a box with one person pushed out; or one community broken into five separate apps, the links between them crossed out.');
});
