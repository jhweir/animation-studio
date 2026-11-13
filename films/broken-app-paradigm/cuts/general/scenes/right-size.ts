// Scene 10: WE, an open core owned by no one; pieces dock into it; one opened up and readable; a
// builder's single piece travelling to many communities; a community assembling and reshaping its
// space; then many people adding pieces together.
import { board, defineScene, eio, named, onFrame, prog, svg, tf } from '../../../../../engine/index.ts';
import {
  arrow, at, caps, cartridge, color, community, core, cross, membrane, person, pose, tick,
} from '../../../../../styles/coasys/index.ts';

export default defineScene('right-size', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2), l3 = ctx.line(3);

  // Pose 1: the core; pieces drop into its docks.
  const base = named('we-core', at(art));
  core(at(base, 960, 800), 1300, 150);
  const labels = ['a way to decide', 'a map', 'a forum', 'community space'];
  const drop = ctx.part(1, 1).v0;
  labels.forEach((s, i) => {
    const c = named(`piece-${i + 1}`, at(base));
    cartridge(c, 240, 180, s);
    const x = 960 - 650 + (1300 / 4) * (i + 0.5);
    onFrame(t => {
      const u = eio(prog(t, drop + i * 0.35, drop + i * 0.35 + 0.8));
      c.setAttribute('transform', tf(x, 250 + u * 360));
      c.setAttribute('opacity', Math.min(1, u * 3).toFixed(3));
    });
  });
  caps(base, 960, 160, 'owned by no one', { size: 24, fill: color.mint });
  pose(base, ctx.t0, ctx.part(1, 2).v0 + 0.1);

  // Pose 2: one piece, opened up and readable before it's let in.
  const open = named('readable-piece', at(art));
  cartridge(at(open, 620, 520), 300, 220, 'a way to decide');
  svg('rect', { x: 860, y: 340, width: 560, height: 360, rx: 16, fill: color.surface, stroke: color.line, 'stroke-width': 2 }, open);
  caps(open, 890, 390, 'what it does', { size: 20, anchor: 'start' });
  ([['shows proposals', true], ['records votes', true], ['reads private messages', false]] as const).forEach(([s, ok], i) => {
    (ok ? tick : cross)(open, 915, 465 + i * 80, 0.8);
    caps(open, 960, 475 + i * 80, s, { size: 22, fill: ok ? color.text : color.text3, anchor: 'start', weight: 600 });
  });
  pose(open, ctx.part(1, 2).v0, l2.v0 + 0.2);

  // Pose 3: a builder makes one piece, and it reaches every community that wants it.
  const reach = named('one-piece-many-places', at(art));
  person(at(reach, 260, 560), 50, color.inkFigure);
  cartridge(at(reach, 470, 540), 170, 130, 'a map', { marks: [2] });
  [[1100, 220], [1500, 380], [1550, 760], [1100, 860]].forEach(([x, y], i) => {
    community(at(reach, x, y), 110, 7, 120 + i);
    cartridge(at(reach, x - 130, y - 70), 90, 70, 'map', { marks: [2] });
    arrow(reach, 570, 540, x - 190, y - 40, { stroke: color.mint, bend: (i - 1.5) * 40, dash: '8 8' });
  });
  pose(reach, l2.v0, ctx.part(2, 1).v0 + 0.1);

  // Pose 4: a community assembles what fits, and reshapes it as it grows.
  const shape = named('community-assembles', at(art));
  const grow = at(shape, 900, 540);
  membrane(grow, 300, 130);
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI * (3 - Math.sqrt(5)), rad = 200 * Math.sqrt((i + 0.5) / 16);
    person(at(grow, rad * Math.cos(a), rad * Math.sin(a)), 14, color.inkFigure);
  }
  [['decide', -45], ['map', 10], ['rota', 55]].forEach(([s, a]) => {
    const rad = ((a as number) * Math.PI) / 180;
    cartridge(at(grow, 380 * Math.cos(rad), 380 * Math.sin(rad)), 130, 100, s as string);
  });
  const swap = at(shape, 900 + 380 * Math.cos(Math.PI), 540);
  cartridge(swap, 130, 100, 'forum', { dim: true });
  cross(swap, 60, -50, 0.8);
  caps(shape, 900, 1010, 'assemble what fits · reshape it as you grow', { size: 22, fill: color.text2 });
  pose(shape, ctx.part(2, 1).v0, l3.v0 + 0.2);

  // Pose 5: many people, adding pieces to one shared core.
  const together = named('made-together', at(art));
  core(at(together, 960, 760), 1100, 130, 6);
  for (let i = 0; i < 9; i++) {
    const x = 420 + i * 135;
    person(at(together, x, 300 + (i % 2) * 60), 30, color.inkFigure);
    if (i % 2 === 0) cartridge(at(together, x, 520), 100, 76, 'piece');
  }
  pose(together, l3.v0, t1 + 1);

  board(ctx.part(1, 1).v1, 'Ours mood. The WE core, "owned by no one", with pieces docking in: a way to decide, a map, a forum, a community space.');
  board(l1.v1, 'One piece opened up, with what it does listed beside it: shows proposals, records votes, does not read private messages.');
  board(ctx.part(2, 0).v1, 'A builder makes one piece, a map, and copies of it arc out to four different communities.');
  board(l2.v1, 'One community assembles its space from pieces around its edge, swapping out one that no longer fits.');
  board(l3.v1, 'Many people, each adding pieces to one shared core: "something we make together".');
});
