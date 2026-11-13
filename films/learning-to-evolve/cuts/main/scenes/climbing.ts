// Scene 5 (ours): WE's open core rises, its blocks and docks lighting as they're named, and cartridges drop
// into the docks one by one; the mint ladder slides in; then each of life's steps again, in mint: two
// cartridges' marks fly into a third; a cartridge copy arcs from one community to another; a group tries
// "consent", keeps it and drops "vote"; finally that community grows and a small, fast loop pops inside.
import { board, cue, defineScene, drawOn, eio, named, onFrame, prog, strokePath, svg, tf, vis } from '../../../../../engine/index.ts';
import { color } from '../../../../../styles/coasys/index.ts';
import {
  arrive, at, caps, cartridge, community, core, cross, drawArrow, fly, hold, ladder, lightRungs, loop, mark, popIn, tick,
} from '../kit.ts';

export default defineScene('climbing', ctx => {
  const { art } = ctx;
  const l0 = ctx.line(0), l2 = ctx.line(2), l3 = ctx.line(3), l4 = ctx.line(4), l5 = ctx.line(5);
  const [coreSaid, cartsSaid, stepsSaid] = [ctx.part(1, 0), ctx.part(1, 1), ctx.part(1, 2)];
  const fadeIn = (e: Element, a: number) => onFrame(t => vis(e, prog(t, a, a + 0.5)));

  // The ladder again, sliding in as "each of life's steps" is said, lit in mint as each counterpart lands.
  const ladAt = named('ladder', at(art));
  const lad = at(ladAt);
  const { rungs } = ladder(lad, 620, 110, 3, color.mint);
  const steps = ['parts from parts', 'parts travel', 'groups learn'];
  const lit = [l2.v0, l3.v0, l4.v0];
  steps.forEach((s, i) => {
    fadeIn(named(`rung-${i + 1}-label`, caps(lad, -80, 155 - i * 155 + 8, `${i + 1} ${s}`, { size: 20, fill: color.mint, anchor: 'end' })), lit[i]);
    cue(lit[i], 'step');
  });
  lightRungs(rungs, lit, color.mint);
  arrive(ladAt, 1730, 540, stepsSaid.v0, { dx: 160, dur: 0.6 });

  // Pose 1: the open core rises; its blocks light in a wave, its docks glow; cartridges drop into the docks.
  const base = named('we-core', at(art));
  const slab = named('core', at(base));
  core(slab, 1180, 150);
  arrive(slab, 800, 800, l0.v0 + 0.3, { dy: 220, dur: 0.7 });
  cue(l0.v0 + 0.3, 'lift');
  const rects = Array.from(slab.querySelectorAll('rect'));
  const wave = coreSaid.v0 + 2.6, rules = coreSaid.v0 + 5.4;
  rects.slice(1, 15).forEach((r, i) => onFrame(t => r.setAttribute('opacity', (0.55 + 0.45 * Math.sin(Math.PI * prog(t, wave + i * 0.06, wave + i * 0.06 + 0.6))).toFixed(3))));
  rects.slice(15).forEach(r => onFrame(t => r.setAttribute('opacity', (0.8 + 0.2 * Math.sin(Math.PI * prog(t, rules, rules + 0.85))).toFixed(3))));
  cue(wave, 'shimmer');
  ['voting', 'rota', 'forum', 'community app'].forEach((s, i) => {
    const c = named(`cartridge-${s.replace(' ', '-')}`, at(base));
    cartridge(c, 220, 170, s);
    const a = cartsSaid.v0 + 2.8 + i * 0.9;
    arrive(c, 800 - 590 + (1180 / 4) * (i + 0.5), 620, a, { dy: -300, dur: 0.5 });
    cue(a + 0.45, 'tap', { i });
  });
  hold(base, ctx.t0, l2.v0 + 0.2);

  // Pose 2: parts from parts. Two cartridges' marks fly along the arrows into a third that carries both.
  const recomb = named('parts-from-parts', at(art));
  const ra = l2.v0 + 0.2;
  ([['map', 320, 0], ['requests', 760, 1]] as const).forEach(([s, y, k], i) => {
    const src = named(`cartridge-${s}`, at(recomb));
    cartridge(src, 240, 180, s, { marks: [k] });
    popIn(src, 330, y, ra + i * 0.15);
    const m = named(`mark-${s}`, at(recomb));
    mark(m, k, 0, 0, 240 / 230, color.orange);
    fly(m, [330, y - 32], [620, 540 + (i ? 120 : -120)], [960 + (i ? 33 : -33), 550 - 41], ra + 1.4 + i * 0.15, ra + 2.3 + i * 0.15, { s0: 1, s1: 300 / 240, show: ra + 0.3 + i * 0.15 });
  });
  drawArrow(recomb, 470, 360, 760, 500, ra + 0.7, { stroke: color.mint, bend: -30 });
  drawArrow(recomb, 470, 720, 760, 600, ra + 0.85, { stroke: color.mint, bend: 30 });
  const combined = named('cartridge-help-nearby', at(recomb));
  cartridge(combined, 300, 230, 'help nearby', { marks: [0, 1] });
  Array.from(combined.querySelectorAll('path')).filter(p => p.getAttribute('fill') === color.orange).forEach(p => p.setAttribute('opacity', '0'));
  popIn(combined, 960, 550, ra + 1.3);
  cue(ra + 2.45, 'braid');
  fadeIn(caps(recomb, 960, 740, 'good ideas combine', { size: 22, fill: color.text2 }), ra + 2.6);
  hold(recomb, l2.v0, l3.v0 + 0.2);

  // Pose 3: parts travel. A copy of the rota arcs from one community to another, leaving a trail; the
  // first keeps its own.
  const trip = named('parts-travel', at(art));
  popIn(named('home-community', community(at(trip), 190, 9, 2)), 360, 600, l3.v0 + 0.2);
  popIn(named('other-community', community(at(trip), 190, 11, 3)), 1200, 600, l3.v0 + 0.4);
  const home = named('home-rota', at(trip));
  cartridge(home, 150, 115, 'rota');
  popIn(home, 360, 330, l3.v0 + 0.8);
  const hop = l3.v0 + 3.0, landed = hop + 1.7;
  const trail = strokePath(trip, 'M 450 300 Q 780 80 1110 300', { stroke: color.mint, 'stroke-width': 3, opacity: 0.5 });
  onFrame(t => drawOn(trail, eio(prog(t, hop, landed))));
  const moving = named('travelling-cartridge', at(trip));
  cartridge(moving, 150, 115, 'rota');
  fly(moving, [360, 330], [780, 60], [1200, 330], hop, landed, { show: hop - 0.1 });
  cue(hop, 'slide');
  cue(landed, 'land');
  fadeIn(caps(trip, 780, 930, 'nobody moves anywhere', { size: 22, fill: color.text2 }), l3.v1 - 2.2);
  hold(trip, l3.v0, l4.v0 + 0.2);

  // Pose 4: a group learns. It tries "consent", keeps it; the old "vote" dims and drops away cheaply.
  const learn = named('group-learns', at(art));
  const group = named('group', community(at(learn), 270, 14, 6));
  popIn(group, 600, 560, l4.v0 + 0.2);
  const oldAt = named('cartridge-vote', at(learn));
  const old = at(oldAt);
  cartridge(old, 190, 145, 'vote');
  popIn(oldAt, 1180, 360, l4.v0 + 0.5);
  const tryAt = l4.v0 + 2.2, keepAt = l4.v0 + 4.6, failAt = ctx.part(4, 1).v0 + 0.3;
  arrive(named('cartridge-consent', cartridge(at(learn), 190, 145, 'consent')), 1180, 740, tryAt, { dx: 220, dur: 0.6 });
  drawArrow(learn, 1070, 720, 880, 640, tryAt + 0.6, { stroke: color.mint, name: 'consent-arrow' });
  popIn(named('kept-tick', tick(learn, 0, 0)), 1285, 680, keepAt, { s: 1.1 });
  cue(keepAt, 'keep');
  popIn(named('dropped-cross', cross(learn, 0, 0)), 1270, 300, failAt);
  onFrame(t => old.setAttribute('opacity', (1 - 0.6 * prog(t, failAt, failAt + 0.5)).toFixed(3)));
  cue(failAt, 'thud');
  fadeIn(caps(learn, 1180, 900, 'a failed try costs one part', { size: 20, fill: color.text2 }), failAt + 0.8);
  hold(learn, l4.v0, l5.v0 + 0.5, 0.5);

  // Pose 5: the group grows into the frame and a small, fast loop pops in, spinning inside it.
  const inside = named('loop-inside', at(art));
  community(inside, 330, 18, 8);
  onFrame(t => {
    const u = eio(prog(t, l5.v0, l5.v0 + 0.9));
    inside.setAttribute('transform', tf(600 + 160 * u, 560 - 20 * u, 270 / 330 + (1 - 270 / 330) * u));
    vis(inside, prog(t, l5.v0, l5.v0 + 0.5));
  });
  const spinner = named('inner-loop', at(inside));
  svg('circle', { r: 120, fill: color.page, opacity: 0.85 }, spinner);
  loop(spinner, 80, { labels: false, width: 4, spin: 1, from: l5.v0, stroke: color.mint });
  popIn(spinner, 0, 0, l5.v0 + 0.9);
  cue(l5.v0 + 0.9, 'seed');

  board(cartsSaid.v1, 'Ours mood. The WE core risen from below, a slab of trusted building blocks with docks; cartridges (voting, rota, forum, community app) have dropped into it one by one.');
  board(l2.v1, 'Rung 1, in mint: parts from parts. The marks of a "map" and a "requests" cartridge flew into "help nearby", which carries both. Same layout as recombination.');
  board(l3.v1 - 0.3, 'Rung 2: a copy of the rota has arced from one community to another, leaving a trail; the first keeps its own. Mirrors the plasmid.');
  board(l4.v1, 'Rung 3: a group tried "consent", kept it (tick), and the old "vote" dimmed under a cross. Mirrors the creature at the fork.');
  board(l5.v1, 'The group grew into the frame, and a small, fast loop spins inside the single community.');
});
