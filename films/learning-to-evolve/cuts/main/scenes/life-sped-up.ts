// Scene 3 (blueprint): life's ladder. Two lineages copy themselves whole, cell by cell, and one dies out;
// recombination flies two good traits into one cell; a plasmid arcs sideways from one bacterium into a
// stranger; a creature draws on, tries a path, drops it and keeps another; then the loop steps across
// the three rungs, shrinking and speeding up each time.
import { board, cue, defineScene, drawOn, eio, eout, named, onFrame, prog, strokePath, tf, vis } from '../../../../../engine/index.ts';
import { color, moods } from '../../../../../styles/coasys/index.ts';
import {
  arrive, at, bacterium, caps, cell, cross, drawArrow, drawn, fly, head, ladder, lightRungs, loop, mark, mood, plasmid, popIn, hold, pulse, tick,
} from '../kit.ts';

export default defineScene('life-sped-up', ctx => {
  const { art, t1 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2), l3 = ctx.line(3), l4 = ctx.line(4);
  mood(ctx, 'blueprint');
  const ink = moods.blueprint.ink;

  // The ladder slides in at the right as "three steps" is said; a rung lights as each step is named.
  const ladAt = named('ladder', at(art));
  const lad = at(ladAt);
  const { rungs } = ladder(lad, 620, 110);
  const steps = ['recombination', 'sharing sideways', 'learning'];
  const lit = [l1.v0, l2.v0, l3.v0];
  steps.forEach((s, i) => {
    const label = named(`rung-${i + 1}-label`, caps(lad, -80, 155 - i * 155 + 8, `${i + 1} ${s}`, { size: 20, fill: ink, anchor: 'end' }));
    onFrame(t => vis(label, eout(prog(t, lit[i], lit[i] + 0.5))));
    cue(lit[i], 'step');
  });
  lightRungs(rungs, lit, color.orange);
  arrive(ladAt, 1730, 540, ctx.part(0, 2).v0, { dx: 160, dur: 0.6 });

  // Pose 1: two lineages copying themselves whole, cell by cell, each with its own good trait; then the
  // lower lineage dies out as "until one died out" is spoken.
  const clones = named('clonal-lineages', at(art));
  const dieAt = ctx.part(1, 1).v1 - 1.4;
  for (const [row, trait, deadFrom, lag] of [[330, 0, 9, 0], [710, 1, 2, 0.3]] as const) {
    for (let i = 0; i < 4; i++) {
      const x = 220 + i * 330;
      const a = l0.v0 + 0.4 + lag + i * 1.1;
      const c = named(`lineage-${trait + 1}-cell-${i + 1}`, at(clones));
      const alive = at(c);
      cell(alive, 80, [trait]);
      popIn(c, x, row, a);
      if (i < 3) drawArrow(clones, x + 100, row, x + 225, row, a + 0.5, { stroke: ink, width: 3 });
      if (i >= deadFrom) {
        const d = dieAt + (i - deadFrom) * 0.25;
        const dead = at(c);
        cell(dead, 80, [trait], { dead: true });
        onFrame(t => {
          const u = prog(t, d, d + 0.4);
          vis(alive, 1 - u);
          vis(dead, u);
        });
        popIn(named(`died-${i + 1}`, cross(clones, 0, 0)), x, row, d, { s: 1.3 });
      }
    }
  }
  cue(l0.v0 + 0.4, 'pop');
  cue(dieAt, 'crack');
  const copyLabel = caps(clones, 220, 470, 'copying whole', { size: 20, fill: ink });
  const competeLabel = caps(clones, 760, 540, 'two good ideas can only compete', { size: 22, fill: color.text2 });
  onFrame(t => {
    vis(copyLabel, prog(t, l0.v0 + 1.2, l0.v0 + 1.7));
    vis(competeLabel, prog(t, ctx.part(1, 1).v0 + 2.5, ctx.part(1, 1).v0 + 3));
  });
  const recombSaid = ctx.part(1, 2).v0;
  hold(clones, ctx.t0, recombSaid + 0.3);

  // Pose 2: recombination. Two parent cells pop in; their traits fly along the arrows into one new cell.
  const recomb = named('recombination', at(art));
  const ra = recombSaid + 0.3;
  [300, 780].forEach((y, i) => {
    const parent = named(`parent-${i + 1}`, at(recomb));
    cell(parent, 90, []);
    popIn(parent, 300, y, ra + i * 0.15);
  });
  drawArrow(recomb, 410, 330, 760, 490, ra + 0.7, { stroke: ink, bend: -30 });
  drawArrow(recomb, 410, 750, 760, 590, ra + 0.85, { stroke: ink, bend: 30 });
  const child = named('recombined-cell', at(recomb));
  cell(child, 150, []);
  popIn(child, 940, 540, ra + 1.4);
  ([[0, 300, -1], [1, 780, 1]] as const).forEach(([k, y, side], i) => {
    const m = named(`trait-${k + 1}`, at(recomb));
    mark(m, k, 0, 0, 1, color.orange);
    const to: [number, number] = i ? [940 + 2, 540 + 63] : [940 + 48, 540 - 18];
    fly(m, [322, y + 25], [600, 540 + side * 180], to, ra + 1.3 + i * 0.15, ra + 2.3 + i * 0.15, { s0: 90 / 70, s1: 150 / 70, show: ra + i * 0.15 });
  });
  cue(ra + 2.4, 'braid');
  const bothLabel = caps(recomb, 940, 760, 'both good ideas, in one', { size: 22, fill: color.text2 });
  onFrame(t => vis(bothLabel, prog(t, ra + 2.6, ra + 3.1)));
  hold(recomb, recombSaid, l2.v0 + 0.2);

  // Pose 3: sharing sideways. Two bacteria slide in; a plasmid arcs from one to the stranger, leaving a
  // trail, and settles into it as the stranger's new trait.
  const hgt = named('sharing-sideways', at(art));
  const donor = named('donor-bacterium', at(hgt));
  bacterium(donor, 340, 2, { striped: true });
  caps(donor, 0, 140, 'one lineage', { size: 20, fill: ink });
  arrive(donor, 330, 560, l2.v0 + 0.2, { dx: -200 });
  const stranger = named('stranger-bacterium', at(hgt));
  bacterium(stranger, 340);
  caps(stranger, 0, 140, 'a stranger', { size: 20, fill: ink });
  arrive(stranger, 1180, 560, l2.v0 + 0.5, { dx: 200 });
  const gained = named('gained-trait', at(hgt));
  mark(gained, 2, 0, 0, 340 / 260, color.orange);
  const hop = ctx.part(2, 1).v0 + 0.5, landed = hop + 1.9;
  popIn(gained, 1180 - 340 * 0.22, 560, landed + 0.35);
  const trail = strokePath(hgt, 'M 420 470 Q 755 180 1090 470', { stroke: color.orange, 'stroke-width': 3, opacity: 0.5 });
  onFrame(t => drawOn(trail, eio(prog(t, hop, landed))));
  const pl = named('plasmid', at(hgt));
  const plIn = at(pl);
  plasmid(plIn, 30, 2);
  fly(pl, [420, 470], [755, 180], [1090, 470], hop, landed, { show: hop - 0.4 });
  onFrame(t => {
    const u = eio(prog(t, landed, landed + 0.5));
    plIn.setAttribute('transform', tf(15 * u, 90 * u, 1 - 0.6 * u));
    plIn.setAttribute('opacity', (1 - u).toFixed(3));
  });
  cue(hop, 'slide');
  cue(landed + 0.35, 'land');
  hold(hgt, l2.v0, l3.v0 + 0.2);

  // Pose 4: learning. A creature draws on with a small loop spinning in its head; it tries one path,
  // keeps the other, and drops the first (a cross) for the cost of a moment.
  const learn = named('learning', at(art));
  const creature = named('creature', at(learn, 360, 560));
  const { outline } = head(creature, 1.6);
  onFrame(t => drawOn(outline, eio(prog(t, l3.v0 + 0.1, l3.v0 + 1.0))));
  const brains = ctx.part(3, 1), dropSaid = ctx.part(3, 2), moment = ctx.part(3, 3);
  const thought = named('head-loop', at(learn));
  loop(thought, 46, { labels: false, width: 3, spin: 0.8, from: brains.v0 });
  popIn(thought, 375, 525, brains.v0 + 0.2);
  cue(brains.v0 + 0.2, 'seed');
  drawn(learn, 'M 600 560 H 860', brains.v0 + 1.2, { stroke: ink, 'stroke-width': 4 });
  const tried = drawn(learn, 'M 860 560 Q 1000 560 1260 330', brains.v0 + 1.8, { stroke: ink, 'stroke-width': 4 }, { dur: 0.6 });
  drawn(learn, 'M 860 560 Q 1000 560 1260 790', brains.v0 + 3.4, { stroke: color.orange, 'stroke-width': 5 }, { dur: 0.6 });
  popIn(named('kept-tick', tick(learn, 0, 0, 1, color.orange)), 1295, 810, brains.v0 + 4.0, { s: 1.3 });
  cue(brains.v0 + 4.0, 'keep');
  const drop = dropSaid.v0 + 0.4;
  popIn(named('dropped-cross', cross(learn, 0, 0)), 1290, 310, drop, { s: 1.2 });
  cue(drop, 'thud');
  onFrame(t => {
    if (t >= drop) tried.setAttribute('stroke-dasharray', '0.025 0.025');
    tried.setAttribute('opacity', (1 - 0.6 * prog(t, drop, drop + 0.5)).toFixed(3));
  });
  const momentLabel = caps(learn, 1060, 230, 'tried, dropped: it cost a moment', { size: 20, fill: color.text2 });
  onFrame(t => vis(momentLabel, prog(t, moment.v0, moment.v0 + 0.5)));
  hold(learn, l3.v0, l4.v0 + 0.2);

  // Pose 5: the loop steps across the rungs, shrinking and speeding up each time.
  const shrink = named('shrinking-loops', at(art));
  const loops = [[250, 170, 0.08, 'copy whole'], [640, 125, 0.2, 'recombine'], [980, 88, 0.4, 'share sideways'], [1270, 55, 0.9, 'learn']] as const;
  loops.forEach(([x, r, spin, label], i) => {
    const g = named(`loop-${label.replace(' ', '-')}`, at(shrink));
    loop(g, r, { labels: false, width: Math.max(3, r / 30), spin, from: l4.v0, stroke: i ? color.orange : ink });
    const a = l4.v0 + 0.4 + i * 0.7;
    if (i === 0) popIn(g, x, 500, a);
    else {
      const [px, pr] = [loops[i - 1][0], loops[i - 1][1]];
      fly(g, [px, 500], [(px + x) / 2, 500], [x, 500], a, a + 0.8, { s0: pr / r, s1: 1, show: a });
    }
    const lab = caps(shrink, x, 740, label, { size: 20, fill: ink });
    onFrame(t => vis(lab, prog(t, a + 0.5, a + 0.9)));
    cue(a + 0.6, 'tap', { i });
  });
  const words: [string, number, number][] = [['smaller units', 430, ctx.part(4, 1).v0], ['faster loops', 760, ctx.part(4, 1).v0 + 0.7], ['cheaper failure', 1090, ctx.part(4, 2).v0]];
  words.forEach(([w, x, a], i) => {
    const e = named(`claim-${i + 1}`, caps(shrink, x, 200, w, { size: 26, fill: color.text }));
    onFrame(t => {
      const u = eout(prog(t, a, a + 0.5));
      vis(e, u);
      e.setAttribute('transform', tf(0, 16 * (1 - u)));
    });
  });
  pulse(shrink, 1270, 500, 55, ctx.part(4, 3).v0 + 0.4, color.orange);
  cue(ctx.part(4, 3).v0 + 0.4, 'shimmer');
  hold(shrink, l4.v0, t1 + 1);

  board(l0.v1, 'Blueprint mood. Two lineages copy themselves whole, cell by cell, each with its own good trait (orange). The empty ladder has slid in on the right.');
  board(ctx.part(1, 1).v1, 'Rung 1 lit. "Until one died out": the lower lineage\'s last cells go dashed under red crosses.');
  board(l1.v1, 'Recombination: the two traits have flown along the arrows from separate parents into one bigger cell.');
  board(l2.v1, 'Rung 2. A plasmid has arced from one bacterium to a stranger, leaving a trail, and settled into it as its new trait.');
  board(l3.v1, 'Rung 3. A creature with a small spinning loop in its head tried one path, dropped it (cross, dashed), and kept the other (orange, tick).');
  board(l4.v1, 'The loop stepped across the rungs: big and slow when copying whole, smaller and faster with each step. Smaller units, faster loops, cheaper failure.');
});
