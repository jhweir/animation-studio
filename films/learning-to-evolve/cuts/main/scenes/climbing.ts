// Scene 5 (ours): WE's open core with cartridges docking; then each of life's steps again, in mint:
// cartridges built from cartridges, a cartridge travelling between communities, a group trying a new
// way to decide; finally the loop small enough to spin inside one community.
import { board, defineScene, eio, named, onFrame, prog, svg, tf } from '../../../../../engine/index.ts';
import { color } from '../../../../../styles/coasys/index.ts';
import { arrow, at, caps, cartridge, community, core, cross, ladder, lightRungs, loop, pose, tick } from '../kit.ts';

export default defineScene('climbing', ctx => {
  const { art, t1 } = ctx;
  const l2 = ctx.line(2), l3 = ctx.line(3), l4 = ctx.line(4), l5 = ctx.line(5);

  // The ladder again, now lit in mint as each counterpart lands.
  const lad = named('ladder', at(art, 1730, 540));
  const { rungs } = ladder(lad, 620, 110, 3, color.mint);
  const steps = ['parts from parts', 'parts travel', 'groups learn'];
  const lit = [l2.v0, l3.v0, l4.v0];
  steps.forEach((s, i) => pose(named(`rung-${i + 1}-label`, caps(lad, -80, 155 - i * 155 + 8, `${i + 1} ${s}`, { size: 20, fill: color.mint, anchor: 'end' })), lit[i], t1 + 1));
  lightRungs(rungs, lit, color.mint);
  pose(lad, ctx.part(1, 2).v0, t1 + 1);

  // Pose 1: the open core; cartridges drop into its docks.
  const base = named('we-core', at(art));
  core(at(base, 800, 800), 1180, 150);
  const labels = ['voting', 'rota', 'forum', 'community app'];
  const drop = ctx.part(1, 1).v0;
  labels.forEach((s, i) => {
    const c = named(`cartridge-${s.replace(' ', '-')}`, at(base));
    cartridge(c, 220, 170, s);
    const x = 800 - 590 + (1180 / 4) * (i + 0.5);
    onFrame(t => {
      const u = eio(prog(t, drop + i * 0.35, drop + i * 0.35 + 0.8));
      c.setAttribute('transform', tf(x, 260 + u * 360));
      c.setAttribute('opacity', Math.min(1, u * 3).toFixed(3));
    });
  });
  pose(base, ctx.t0, l2.v0 + 0.2);

  // Pose 2: parts from parts. Two cartridges combine into a third.
  const recomb = named('parts-from-parts', at(art));
  cartridge(at(recomb, 330, 320), 240, 180, 'map', { marks: [0] });
  cartridge(at(recomb, 330, 760), 240, 180, 'requests', { marks: [1] });
  arrow(recomb, 470, 360, 760, 500, { stroke: color.mint, bend: -30 });
  arrow(recomb, 470, 720, 760, 600, { stroke: color.mint, bend: 30 });
  cartridge(at(recomb, 960, 550), 300, 230, 'help nearby', { marks: [0, 1] });
  caps(recomb, 960, 740, 'good ideas combine', { size: 22, fill: color.text2 });
  pose(recomb, l2.v0, l3.v0 + 0.2);

  // Pose 3: parts travel. A cartridge arcs from one community to another; the first keeps its copy.
  const travel = named('parts-travel', at(art));
  community(at(travel, 360, 600), 190, 9, 2);
  community(at(travel, 1200, 600), 190, 11, 3);
  cartridge(at(travel, 360, 330), 150, 115, 'rota');
  svg('path', { d: 'M 450 300 Q 780 80 1110 300', fill: 'none', stroke: color.mint, 'stroke-width': 3, 'stroke-dasharray': '8 10', opacity: 0.7 }, travel);
  const moving = named('travelling-cartridge', at(travel));
  cartridge(moving, 150, 115, 'rota');
  const hop = l3.v0 + 0.6;
  onFrame(t => {
    const u = eio(prog(t, hop, hop + 2));
    const x = (1 - u) * (1 - u) * 360 + 2 * (1 - u) * u * 780 + u * u * 1200;
    const y = (1 - u) * (1 - u) * 330 + 2 * (1 - u) * u * 60 + u * u * 330;
    moving.setAttribute('transform', tf(x, y));
  });
  caps(travel, 780, 930, 'nobody moves anywhere', { size: 22, fill: color.text2 });
  pose(travel, l3.v0, l4.v0 + 0.2);

  // Pose 4: a group learns. It tries a new way to decide and keeps it; the old one drops away cheaply.
  const learn = named('group-learns', at(art));
  community(at(learn, 600, 560), 270, 14, 6);
  const old = at(learn, 1180, 360);
  cartridge(old, 190, 145, 'vote', { dim: true });
  cross(learn, 1270, 300, 1);
  cartridge(at(learn, 1180, 740), 190, 145, 'consent');
  tick(learn, 1285, 680, 1.1);
  arrow(learn, 1070, 720, 880, 640, { stroke: color.mint });
  caps(learn, 1180, 900, 'a failed try costs one part', { size: 20, fill: color.text2 });
  pose(learn, l4.v0, l5.v0 + 0.2);

  // Pose 5: the loop, small and fast, inside one community.
  const inside = named('loop-inside', at(art, 760, 540));
  community(inside, 330, 18, 8);
  svg('circle', { r: 120, fill: color.page, opacity: 0.85 }, inside);
  loop(inside, 80, { labels: false, width: 4, spin: 1, from: l5.v0, stroke: color.mint });
  pose(inside, l5.v0, t1 + 1);

  board(ctx.part(1, 1).v1 + 1.2, 'Ours mood. The WE core: a slab of trusted building blocks with docks; cartridges (voting, rota, forum, community app) drop into it.');
  board(l2.v1, 'Rung 1, in mint: parts from parts. A "map" and a "requests" cartridge combine into "help nearby", carrying both marks. Same layout as recombination.');
  board(l3.v1 - 0.3, 'Rung 2: a cartridge arcs from one community to another while the first keeps its copy. Mirrors the plasmid.');
  board(l4.v1, 'Rung 3: a group tries "consent" instead of "vote", keeps it, and the old part drops away. Mirrors the creature at the fork.');
  board(l5.v1, 'The loop, small and fast, spinning inside a single community.');
});
