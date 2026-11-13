// Scene 1: a wall of sealed apps pops up, each an experiment; it gives way to a lineage that grows across
// time, where most branches die (red crosses) and survivors are copied; the loop (try, test, keep) rises
// over it, its stations pulsing as they're named; one whole app flies out of the lineage into "test".
import { board, cue, defineScene, eio, eout, named, onFrame, prog, vis } from '../../../../../engine/index.ts';
import { color } from '../../../../../styles/coasys/index.ts';
import { appBox, at, caps, cross, drawn, fly, loop, mood, popIn, hold, pulse } from '../kit.ts';

export default defineScene('already-evolves', ctx => {
  const { art, t1 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2);
  const [died, survived] = [ctx.part(1, 2), ctx.part(1, 3)];
  const [evolve, tryTest, look] = [ctx.part(2, 0), ctx.part(2, 1), ctx.part(2, 2)];
  mood(ctx, 'problem');

  // Pose 1: a specimen wall of apps, popping up row by row as the first line is spoken.
  const wall = named('app-wall', at(art));
  for (let i = 0; i < 15; i++) {
    const x = 330 + (i % 5) * 315, y = 220 + Math.floor(i / 5) * 230;
    const a = l0.v0 + 0.1 + Math.floor(i / 5) * 0.45 + (i % 5) * 0.12;
    const spec = named(`experiment-${i + 1}`, at(wall));
    appBox(at(spec, 0, 0), 230, 150, { seed: i + 1 });
    caps(spec, 0, 105, `experiment ${String(i + 1).padStart(3, '0')}`, { size: 16 });
    popIn(spec, x, y, a, { s: 1 });
    if (i % 5 === 0) cue(a, 'pop');
  }
  hold(wall, ctx.t0, l1.v0 + 0.8);

  // Pose 2: a lineage of apps across time. Each generation's branches draw on, then its apps pop in;
  // most branches end (red crosses as "died" is spoken); the survivors are copied into the last generation.
  const tree = named('app-lineage', at(art));
  const gens = [[0], [0, 0, 0], [0, 0, 2, 2], [1, 1, 1, 2, 2], [0, 0, 0, 3, 3, 3]];
  const pos: [number, number][][] = gens.map((g, gi) => g.map((_, i) => [240 + gi * 360, 520 + (i - (g.length - 1) / 2) * 128]));
  const span = (ctx.part(1, 1).v1 - l1.v0 - 0.8) / 3;
  const genAt = (gi: number) => (gi < 4 ? l1.v0 + 0.5 + gi * span : survived.v0 + 0.5);
  const axis = named('time-axis', at(tree));
  drawn(axis, 'M 300 960 H 1620', l1.v0 + 0.2, { stroke: color.text3, 'stroke-width': 2 }, { dur: 1.2 });
  caps(axis, 240, 968, 'then', { size: 22 });
  caps(axis, 1680, 968, 'now', { size: 22 });
  const branches = named('branches', at(tree));
  let deaths = 0;
  gens.forEach((g, gi) => g.forEach((p, i) => {
    const [x, y] = pos[gi][i];
    if (gi > 0) {
      const [x0, y0] = pos[gi - 1][p];
      drawn(branches, `M ${x0 + 70} ${y0} C ${x0 + 200} ${y0} ${x - 200} ${y} ${x - 70} ${y}`, genAt(gi) - 0.55, { stroke: color.steel, 'stroke-width': 2, opacity: 0.45 });
    }
    const box = named(`lineage-app-${gi + 1}-${i + 1}`, at(tree));
    const inner = at(box);
    appBox(inner, 130, 86, { seed: 10 + gi * 7 + i });
    popIn(box, x, y, genAt(gi) + i * 0.06);
    const dead = gi < 4 && !gens[gi + 1].includes(i);
    if (dead) {
      const a = died.v0 + 0.2 + deaths++ * 0.13;
      onFrame(t => inner.setAttribute('opacity', (1 - 0.7 * eout(prog(t, a, a + 0.4))).toFixed(3)));
      popIn(named(`died-${gi + 1}-${i + 1}`, cross(tree, 0, 0)), x + 52, y - 34, a, { s: 0.8 });
    }
  }));
  cue(died.v0 + 0.2, 'crack');
  cue(survived.v0 + 0.5, 'pop');
  hold(tree, l1.v0, t1 + 1);
  onFrame(t => tree.setAttribute('opacity', (1 - 0.75 * eio(prog(t, evolve.v0, evolve.v0 + 0.8))).toFixed(3)));

  // Pose 3: the loop rises over the lineage; try, test and keep pulse as they're named.
  const lp = named('loop', at(art));
  loop(lp, 250, { spin: 0.25, from: tryTest.v0 });
  popIn(lp, 960, 500, evolve.v0 + 0.5, { dur: 0.6 });
  cue(evolve.v0 + 0.5, 'seed');
  const station = (deg: number): [number, number] => [960 + 250 * Math.cos((deg * Math.PI) / 180), 500 + 250 * Math.sin((deg * Math.PI) / 180)];
  const said = tryTest.v1 - tryTest.v0;
  ([-90, 30, 150] as const).forEach((deg, i) => {
    const [x, y] = station(deg);
    const a = tryTest.v0 + i * said * 0.33;
    pulse(art, x, y, 26, a, color.text);
    cue(a, 'tick', { i });
  });

  // Pose 4: one whole app flies out of the newest generation into the middle of the loop.
  const tested = named('tested-app', at(art));
  appBox(tested, 190, 130, { parts: ['plain', 'idea', 'plain', 'bad', 'plain', 'plain'], seed: 4 });
  const [sx, sy] = pos[4][2];
  fly(tested, [sx, sy], [1400, 380], [960, 500], look.v0, look.v0 + 0.9, { s0: 130 / 190, s1: 1.2 });
  cue(look.v0 + 0.9, 'land');
  const testedLabel = named('tested-label', caps(art, 960, 840, 'being tested: the whole app', { size: 22, fill: color.text2 }));
  onFrame(t => vis(testedLabel, eout(prog(t, look.v0 + 0.8, look.v0 + 1.3))));

  board(l0.v1 - 0.2, 'Every app as a sealed specimen on a wall, popping up row by row: each one an experiment someone shipped.');
  board(died.v1, 'The apps as a lineage over time, grown generation by generation; most branches end in a red cross as "died" is spoken.');
  board(l1.v1 - 0.3, 'Survivors are copied: the newest generation grows from the few that lived.');
  board(tryTest.v1, 'The lineage dims and the loop rises over it: try, test, keep pulse as they are named. This loop is the motif of the whole film.');
  board(l2.v1, 'One whole app has flown out of the newest generation into the middle of the loop: the thing being tested is the entire product.');
});
