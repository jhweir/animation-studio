// Scene 3: a fixed app design, decided in advance; living communities forced into its square shape;
// then the two outcomes: bend to fit, or fragment across several apps.
import { board, defineScene, named, svg } from '../../../../../engine/index.ts';
import { appBox, arrow, at, caps, color, community, company, cross, membrane, mood, person, pose } from '../../../../../styles/coasys/index.ts';

export default defineScene('fixed', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2);
  mood(ctx, 'problem');

  // Pose 1: the fixed design, from a central team.
  const design = named('fixed-design', at(art));
  appBox(at(design, 1060, 500), 620, 420, { parts: Array(9).fill('plain'), seed: 12 });
  company(at(design, 420, 500), 1);
  arrow(design, 520, 500, 730, 500, { stroke: color.steel });
  caps(design, 420, 680, 'decided in advance', { size: 22 });
  caps(design, 1060, 770, 'set layout · set toolkit', { size: 24, fill: color.text2 });
  pose(design, ctx.t0, l1.v0 + 0.2);

  // Pose 2: three different communities pressed into the same square.
  const press = named('we-adapt', at(art));
  [0, 1, 2].forEach(i => {
    const x = 420 + i * 540;
    community(at(press, x, 330), 90 + i * 20, 6 + i * 3, 20 + i);
    arrow(press, x, 460, x, 560, { stroke: color.steel });
    const box = at(press, x, 740);
    svg('rect', { x: -110, y: -110, width: 220, height: 220, rx: 14, fill: color.steelDark, 'fill-opacity': 0.4, stroke: color.steel, 'stroke-width': 3 }, box);
    svg('rect', { x: -90, y: -90, width: 180, height: 180, rx: 8, fill: color.mint, 'fill-opacity': 0.07, stroke: color.mint, 'stroke-width': 3 }, box);
    for (let k = 0; k < 6 + i * 3; k++) person(at(box, -60 + (k % 4) * 40, -50 + Math.floor(k / 4) * 45), 13, color.inkFigure);
  });
  caps(press, 960, 960, "they don't adapt to us, so we adapt to them", { size: 24, fill: color.text2 });
  pose(press, l1.v0, l2.v0 + 0.2);

  // Pose 3: two outcomes. Bend to fit; or fragment across five apps.
  const out = named('conform-or-fragment', at(art));
  svg('line', { x1: 960, y1: 200, x2: 960, y2: 880, stroke: color.line, 'stroke-width': 2 }, out);
  const bend = at(out, 480, 520);
  svg('rect', { x: -200, y: -200, width: 400, height: 400, rx: 16, fill: 'none', stroke: color.steel, 'stroke-width': 4 }, bend);
  community(bend, 180, 14, 31);
  membrane(at(bend, 250, -120), 50, 32, { dash: '6 6', fill: 0 });
  caps(out, 480, 820, 'bend to fit', { size: 26, fill: color.text });
  const frag = at(out, 1440, 520);
  [[-200, -170], [0, -200], [200, -170], [-120, 120], [120, 120]].forEach(([x, y], i) => {
    appBox(at(frag, x, y), 150, 110, { seed: 40 + i });
    community(at(frag, x, y + 10), 30, 2, 41 + i);
  });
  cross(frag, -100, -180, 0.7);
  cross(frag, 100, -180, 0.7);
  cross(frag, 0, 120, 0.7);
  caps(out, 1440, 820, 'or fragment across tools', { size: 26, fill: color.text });
  pose(out, l2.v0, t1 + 1);

  board(ctx.line(0).v1, 'Problem mood. One fixed app design (set layout, set toolkit), sent out from a central team.');
  board(l1.v1, 'Three different living communities pressed down into the same square box: we adapt to them.');
  board(ctx.part(2, 1).v1, 'The two outcomes, side by side: a community bent to fit inside a box (some people left outside), or split into pieces across five separate apps, links broken.');
});
