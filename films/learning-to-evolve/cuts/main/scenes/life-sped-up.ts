// Scene 3 (blueprint): life's ladder. Lineages copying whole and competing; recombination joins two
// good traits in one cell; a plasmid jumps sideways between bacteria; a creature learns at a fork;
// then the loop shrinks and speeds up across the three steps.
import { board, defineScene, eio, named, onFrame, prog, svg, tf } from '../../../../../engine/index.ts';
import { color, moods } from '../../../../../styles/coasys/index.ts';
import { arrow, at, bacterium, caps, cell, cross, head, ladder, lightRungs, loop, mark, mood, plasmid, pose, tick } from '../kit.ts';

export default defineScene('life-sped-up', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2), l3 = ctx.line(3), l4 = ctx.line(4);
  mood(ctx, 'blueprint');
  const ink = moods.blueprint.ink;

  // The ladder, at the right throughout; a rung lights as each step is named.
  const lad = named('ladder', at(art, 1730, 540));
  const { rungs } = ladder(lad, 620, 110);
  const steps = ['recombination', 'sharing sideways', 'learning'];
  const stepLabels = steps.map((s, i) => named(`rung-${i + 1}-label`, caps(lad, -80, 155 - i * 155 + 8, `${i + 1} ${s}`, { size: 20, fill: ink, anchor: 'end' })));
  const lit = [l1.v0, l2.v0, l3.v0];
  lightRungs(rungs, lit, color.orange);
  stepLabels.forEach((e, i) => pose(e, lit[i], t1 + 1));
  pose(lad, ctx.part(0, 2).v0, t1 + 1);

  // Pose 1: two lineages copying themselves whole, each with its own good trait; one dies out.
  const clones = named('clonal-lineages', at(art));
  for (const [row, trait, deadFrom] of [[330, 0, 9], [710, 1, 2]] as const) {
    for (let i = 0; i < 4; i++) {
      const x = 220 + i * 330;
      const dead = i >= deadFrom;
      cell(at(clones, x, row), 80, [trait], { dead });
      if (dead) cross(clones, x, row, 1.3);
      if (i < 3) arrow(clones, x + 100, row, x + 225, row, { stroke: ink, width: 3 });
    }
  }
  caps(clones, 220, 470, 'copying whole', { size: 20, fill: ink });
  caps(clones, 760, 540, 'two good ideas can only compete', { size: 22, fill: color.text2 });
  pose(clones, ctx.t0, ctx.part(1, 2).v0);

  // Pose 2: recombination. Two traits from two lineages come together in one cell.
  const recomb = named('recombination', at(art));
  cell(at(recomb, 300, 300), 90, [0]);
  cell(at(recomb, 300, 780), 90, [1]);
  arrow(recomb, 410, 330, 760, 490, { stroke: ink, bend: -30 });
  arrow(recomb, 410, 750, 760, 590, { stroke: ink, bend: 30 });
  cell(at(recomb, 940, 540), 150, [0, 1]);
  caps(recomb, 940, 760, 'both good ideas, in one', { size: 22, fill: color.text2 });
  pose(recomb, ctx.part(1, 2).v0, l2.v0 + 0.2);

  // Pose 3: sharing sideways. A plasmid crosses from one bacterium to a stranger.
  const hgt = named('sharing-sideways', at(art));
  bacterium(at(hgt, 330, 560), 340, 2, { striped: true });
  const stranger = at(hgt, 1180, 560);
  bacterium(stranger, 340);
  const gained = mark(stranger, 2, -340 * 0.22, 0, 340 / 260, color.orange);
  svg('path', { d: 'M 420 470 Q 755 180 1090 470', fill: 'none', stroke: color.orange, 'stroke-width': 3, 'stroke-dasharray': '8 10', opacity: 0.7 }, hgt);
  const pl = named('plasmid', at(hgt));
  plasmid(pl, 30, 2);
  caps(hgt, 330, 700, 'one lineage', { size: 20, fill: ink });
  caps(hgt, 1180, 700, 'a stranger', { size: 20, fill: ink });
  const hop = ctx.part(2, 1).v0;
  onFrame(t => {
    const u = eio(prog(t, hop + 0.3, hop + 2.2));
    const x = (1 - u) * (1 - u) * 420 + 2 * (1 - u) * u * 755 + u * u * 1090;
    const y = (1 - u) * (1 - u) * 470 + 2 * (1 - u) * u * 180 + u * u * 470;
    pl.setAttribute('transform', tf(x, y));
    gained.setAttribute('opacity', u >= 1 ? '1' : '0');
  });
  pose(hgt, l2.v0, l3.v0 + 0.2);

  // Pose 4: learning. A creature tries one path, drops it, keeps the other; a small loop in its head.
  const learn = named('learning', at(art));
  head(at(learn, 360, 560), 1.6);
  loop(at(learn, 375, 525), 46, { labels: false, width: 3, spin: 0.8, from: l3.v0 });
  svg('path', { d: 'M 600 560 H 860', fill: 'none', stroke: ink, 'stroke-width': 4 }, learn);
  const tried = svg('path', { d: 'M 860 560 Q 1000 560 1260 330', fill: 'none', stroke: ink, 'stroke-width': 4, 'stroke-dasharray': '10 10' }, learn);
  svg('path', { d: 'M 860 560 Q 1000 560 1260 790', fill: 'none', stroke: color.orange, 'stroke-width': 5 }, learn);
  const fail = cross(learn, 1290, 310, 1.2);
  tick(learn, 1295, 810, 1.3, color.orange);
  caps(learn, 1060, 230, 'tried, dropped: it cost a moment', { size: 20, fill: color.text2 });
  const dropped = ctx.part(3, 2).v0;
  onFrame(t => {
    const u = prog(t, dropped, dropped + 0.5);
    tried.setAttribute('opacity', (1 - 0.6 * u).toFixed(3));
    fail.setAttribute('opacity', u.toFixed(3));
  });
  pose(learn, l3.v0, l4.v0 + 0.2);

  // Pose 5: the loop through the steps, smaller and faster each time.
  const shrink = named('shrinking-loops', at(art));
  const loops = [[250, 170, 0.08, 'copy whole'], [640, 125, 0.2, 'recombine'], [980, 88, 0.4, 'share sideways'], [1270, 55, 0.9, 'learn']] as const;
  loops.forEach(([x, r, spin, label], i) => {
    loop(at(shrink, x, 500), r, { labels: false, width: Math.max(3, r / 30), spin, from: l4.v0, stroke: i ? color.orange : ink });
    caps(shrink, x, 740, label, { size: 20, fill: ink });
  });
  caps(shrink, 760, 200, 'smaller units · faster loops · cheaper failure', { size: 26, fill: color.text });
  pose(shrink, l4.v0, t1 + 1);

  board(ctx.part(0, 2).v1, 'Blueprint mood. Two lineages copy themselves whole, each with its own good trait (orange); one dies out. The empty ladder appears on the right.');
  board(l1.v1, 'Rung 1 lights. Recombination: the two traits from separate lineages come together in one bigger cell.');
  board(l2.v1, 'Rung 2. A plasmid arcs from one bacterium to a stranger, and the stranger now carries the trait.');
  board(l3.v1, 'Rung 3. A creature with a small spinning loop in its head tries one path, drops it (cross), keeps the other.');
  board(l4.v1, 'The loop at each step: big and slow when copying whole, smaller and faster with each rung.');
});
