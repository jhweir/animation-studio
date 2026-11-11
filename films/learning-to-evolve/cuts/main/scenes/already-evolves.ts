// Scene 1: a wall of sealed apps, each an experiment; they spread into a lineage across time where most
// die and survivors are copied; the loop (try, test, keep) rises over it; one whole app sits in "test".
import { board, defineScene, named, onFrame, rng, svg } from '../../../../../engine/index.ts';
import { color } from '../../../../../styles/coasys/index.ts';
import { appBox, at, caps, cross, loop, mood, pose, travel } from '../kit.ts';

export default defineScene('already-evolves', ctx => {
  const { art, t1 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2);
  mood(ctx, 'problem');
  const r = rng(3);
  const kinds = () => Array.from({ length: 4 }, () => 'plain' as const);

  // Pose 1: a specimen wall of apps.
  const wall = named('app-wall', at(art));
  for (let i = 0; i < 15; i++) {
    const x = 330 + (i % 5) * 315, y = 220 + Math.floor(i / 5) * 230;
    appBox(at(wall, x, y), 230, 150, { parts: kinds(), seed: i + 1 });
    caps(wall, x, y + 105, `experiment ${String(i + 1).padStart(3, '0')}`, { size: 16 });
  }
  pose(wall, ctx.t0, l1.v0 + 0.4);

  // Pose 2: a lineage of apps over time; most branches end in a cross, survivors are copied.
  const tree = named('app-lineage', at(art));
  const gens = [[0], [0, 0, 0], [0, 1, 1, 2], [1, 1, 2, 3, 3], [0, 0, 1, 3, 4, 4]];
  const alive = [[true], [true, true, false], [false, true, false, true], [true, false, false, true, false], [true, true, true, true, true, true]];
  const pos: [number, number][][] = gens.map((g, gi) => g.map((_, i) => [240 + gi * 360, 520 + (i - (g.length - 1) / 2) * 128]));
  const lines = svg('g', { stroke: color.steel, 'stroke-width': 2, opacity: 0.45 }, tree);
  gens.forEach((g, gi) => g.forEach((p, i) => {
    if (gi === 0) return;
    const [x0, y0] = pos[gi - 1][p], [x1, y1] = pos[gi][i];
    svg('path', { d: `M ${x0 + 70} ${y0} C ${x0 + 200} ${y0} ${x1 - 200} ${y1} ${x1 - 70} ${y1}`, fill: 'none' }, lines);
  }));
  gens.forEach((g, gi) => g.forEach((_, i) => {
    const [x, y] = pos[gi][i];
    const dead = !alive[gi][i] || (gi < 4 && !gens[gi + 1].includes(i));
    const b = at(tree, x, y);
    appBox(b, 130, 86, { parts: ['plain', 'plain', 'plain', 'plain'], seed: 10 + gi * 7 + i + Math.floor(r() * 3) });
    if (dead && gi < 4) {
      b.setAttribute('opacity', '0.3');
      cross(tree, x + 52, y - 34, 0.8);
    }
  }));
  caps(tree, 240, 968, 'then', { size: 22 });
  caps(tree, 1680, 968, 'now', { size: 22 });
  svg('line', { x1: 300, y1: 960, x2: 1620, y2: 960, stroke: color.text3, 'stroke-width': 2, 'stroke-dasharray': '4 10' }, tree);
  pose(tree, l1.v0 + 0.2, t1 + 1);
  onFrame(t => tree.setAttribute('opacity', String(t > l2.v0 ? 0.25 : 1)));

  // Pose 3: the loop over the lineage. Pose 4: one whole app in "test".
  const lp = named('loop', at(art, 960, 500));
  loop(lp, 250, { spin: 0.25, from: l2.v0 });
  pose(lp, ctx.part(2, 1).v0 - 0.2, t1 + 1);
  const tested = named('tested-app', at(art));
  appBox(tested, 190, 130, { parts: ['plain', 'idea', 'plain', 'bad', 'plain', 'plain'], seed: 4 });
  travel(tested, [1500, 860], [960, 500], ctx.part(2, 2).v0, ctx.part(2, 2).v0 + 0.8, 1.2);
  const testedLabel = named('tested-label', caps(art, 960, 840, 'being tested: the whole app', { size: 22, fill: color.text2 }));
  pose(tested, ctx.part(2, 2).v0 - 0.1, t1 + 1);
  pose(testedLabel, ctx.part(2, 2).v0 + 0.6, t1 + 1);

  board(l0.v1 - 0.2, 'Every app as a sealed specimen on a wall: each one an experiment someone shipped.');
  board(l1.v1 - 0.3, 'The same apps as a lineage over time: most branches die (red crosses), survivors get copied.');
  board(ctx.part(2, 1).v1, 'The loop rises over the lineage: try, test, keep. This loop is the motif of the whole film.');
  board(l2.v1, 'One whole app slides into the middle of the loop: the thing being tested is the entire product.');
});
