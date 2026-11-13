// Scene 2: diversity all the way down, through the social-cell holarchy, as one continuous zoom. A
// field of different communities; the camera dives into one, full of different people; then into one
// person, whose needs change by day and role; then pulls all the way back out. Communities grow and
// split; then the nesting, side by side.
import { board, clamp, cue, defineScene, eback, named, onFrame, prog, rng, svg, tf, vis } from '../../../../../engine/index.ts';
import { at, caps, color, community, membrane, personCell } from '../../../../../styles/coasys/index.ts';
import { arrive, camera, crowd, drawArrow, drawn, fade, pop, stagger, zoomAt, type View } from '../kit.ts';

export default defineScene('diversity', ctx => {
  const { art, t0 } = ctx;
  const L = (i: number) => ctx.line(i);
  const P = (i: number, j: number) => ctx.part(i, j);
  const r = rng(17);
  const needs = () => Array.from({ length: 2 + Math.floor(r() * 3) }, () => Math.floor(r() * 4));

  // The camera: field (a touch close, then pulled back on "hundreds of thousands") → one community →
  // one person → all the way back out.
  const ONE = { x: 960, y: 430, r: 60 };            // the community we dive into (the climate group)
  const k1 = ONE.r / 420;                           // its inside is drawn at the close-up's size, scaled down
  const ME = { x: 300 * Math.sqrt(0.5 / 11), y: 0 }; // the person we dive into, inside it
  const k2 = 62 / 200;                              // their facets are drawn at the person close-up's size
  const s1 = 1 / k1, s2 = 1 / (k1 * k2);
  const field0: View = { x: 960, y: 540, s: 1 };
  const keys: [number, number, View][] = [
    [t0, t0, { x: 960, y: 540, s: 1.12 }],
    [P(1, 0).v0, P(1, 0).v1, field0],
    [L(2).v0, L(2).v0 + 1.7, { x: ONE.x, y: ONE.y + 20 / s1, s: s1 }],
    [L(3).v0, L(3).v0 + 1.7, { x: ONE.x + ME.x * k1, y: ONE.y + 20 / s2, s: s2 }],
    [L(4).v0, L(4).v0 + 1.4, field0],
  ];
  const zoom = (t: number) => zoomAt(keys, t);
  const world = named('zoom', svg('g', {}, art));
  const worldOut = P(4, 1).v0;
  onFrame(t => {
    world.setAttribute('transform', camera(keys, t));
    vis(world, 1 - prog(t, worldOut, worldOut + 0.4));
  });

  // Pose 1: a field of communities, every one different, popping in from the middle out and drifting.
  const field = named('community-field', at(world));
  const labelled = [8, 17, 24, 31], named4 = ['choir', 'climate group', 'research lab', 'neighbourhood'];
  const say = [0.02, 0.18, 0.36, 0.5].map(k => P(1, 1).v0 + (P(1, 1).v1 - P(1, 1).v0) * k);
  for (let i = 0; i < 42; i++) {
    const x = 120 + (i % 7) * 280 + (Math.floor(i / 7) % 2) * 140, y = 130 + Math.floor(i / 7) * 150;
    if (x > 1860) continue;
    const rad = 36 + r() * 40, n = 1 + Math.floor(r() * 5);
    const born = t0 + 0.2 + Math.hypot(x - 960, y - 520) / 1000 * 1.6;
    if (i === 17) {
      // The one we dive into: coarse people from far away, its close-up inside.
      const g = named('climate-group', at(field, x, y));
      const c = crowd(g, ONE.r, 5, 7);
      onFrame(t => {
        const z = zoom(t);
        g.setAttribute('transform', tf(x, y, Math.max(0.0001, eback(prog(t, born, born + 0.45)))));
        vis(c.ring, 1 - clamp((z - 1.6) / 1.6));
        c.people.forEach(p => vis(p, 1 - clamp((z - 1.6) / 1.6)));
      });
    } else {
      const g = at(field, x, y);
      community(g, rad, n, i + 1);
      const ph = i * 1.7;
      onFrame(t => {
        const s = eback(prog(t, born, born + 0.45)) * (1 + 0.03 * Math.sin(t * 0.9 + ph));
        g.setAttribute('transform', tf(x + 4 * Math.sin(t * 0.4 + ph), y + 3 * Math.cos(t * 0.35 + ph), Math.max(0.0001, s)));
      });
    }
    const li = labelled.indexOf(i);
    if (li >= 0) {
      const lab = arrive(field, x, y + 92, say[li], { name: `label-${named4[li].replace(' ', '-')}` });
      caps(lab, 0, 0, named4[li], { size: 18, fill: color.text2 });
      cue(say[li], 'tap', { i: li });
      onFrame(t => { if (t > L(2).v0 - 0.4) vis(lab, 1 - prog(t, L(2).v0 - 0.4, L(2).v0)); });
    }
  }
  cue(t0 + 0.6, 'mesh');
  // Which one: a bright ring draws round the climate group just before the dive.
  const pick = drawn(world, `M ${ONE.x} ${ONE.y - 76} a 76 76 0 1 1 -0.1 0`, L(2).v0 - 0.5, 0.5, { stroke: color.text, 'stroke-width': 3 });
  onFrame(t => { if (t > L(2).v0 + 0.2) vis(pick, 1 - prog(t, L(2).v0 + 0.2, L(2).v0 + 0.6)); });

  // Pose 2: inside the community, every person a different cell (fades in as the camera arrives).
  const one = named('one-community', at(world, ONE.x, ONE.y, k1));
  const inner = membrane(one, 420, 7);
  const cells: SVGGElement[] = [];
  for (let i = 0; i < 11; i++) {
    const a = i * Math.PI * (3 - Math.sqrt(5)), rad = 300 * Math.sqrt((i + 0.5) / 11);
    const x = rad * Math.cos(a), y = rad * Math.sin(a);
    const c = at(one, x, y, 1, i === 0 ? 'this-person' : undefined);
    personCell(c, 62, i === 0 ? [0, 1, 2] : needs(), i === 0 ? 51 : 30 + i);
    cells.push(c);
    const born = stagger(L(2).v0 + 1.3, L(2).v0 + 2.6, i, 11);
    onFrame(t => {
      const z = zoom(t);
      c.setAttribute('transform', tf(x, y, Math.max(0.0001, eback(prog(t, born, born + 0.45)))));
      // The others step back while we look at one person, and return on the way out.
      const others = i === 0 ? 0 : Math.min(prog(t, L(3).v0, L(3).v0 + 0.6), 1 - prog(t, L(4).v0, L(4).v0 + 0.3));
      vis(c, clamp((z - 1.6) / 1.6) * (1 - others));
    });
  }
  onFrame(t => vis(inner, clamp((zoom(t) - 1.6) / 1.6)));
  cue(L(2).v0 + 1.4, 'shimmer');

  // Pose 3: one person, and the same person in different moments and roles, as they're named.
  const me = named('one-person', at(one, ME.x, ME.y, k2));
  const facets = [['monday', [3, 0]], ['friday', [1, 1, 2]], ['as host', [2, 3]], ['as newcomer', [0]], ['in a crisis', [1, 3, 3]]] as const;
  const when = [0.38, 0.45, 0.6, 0.67, 0.8].map(k => L(3).v0 + (L(3).v1 - L(3).v0) * k);
  const facetOut = L(4).v0 + 0.3;
  facets.forEach(([label, ns], i) => {
    const a = -Math.PI / 2 + (i / facets.length) * Math.PI * 2;
    const x = 380 * Math.cos(a) * 1.35, y = 380 * Math.sin(a) * 0.95;
    const link = drawn(me, `M ${210 * Math.cos(a)} ${210 * Math.sin(a)} L ${x - 80 * Math.cos(a)} ${y - 80 * Math.sin(a)}`, when[i] - 0.3, 0.4, { stroke: color.mint, 'stroke-width': 2, opacity: 0.4 });
    const cell = pop(me, x, y, when[i], { name: `facet-${label.replace(/ /g, '-')}`, until: facetOut });
    personCell(cell, 70, [...ns], 60 + i);
    caps(arrive(me, x, y + 100, when[i] + 0.15, { until: facetOut }), 0, 0, label, { size: 18, fill: color.text2 });
    onFrame(t => { if (t > facetOut - 0.3) vis(link, 1 - prog(t, facetOut - 0.3, facetOut)); });
    cue(when[i], 'pop');
  });

  // Pose 4: everything moves. Twelve people grow to a thousand, then split with new purposes.
  const time = named('communities-change', at(art));
  const grow = P(4, 1), works = P(4, 2);
  const out4 = L(5).v0 + 0.35;
  const g0 = grow.v0 + 0.1;
  fade(time, g0, out4);
  const small = pop(time, 300, 520, g0, { name: 'twelve-people' });
  community(small, 80, 4, 71);
  drawArrow(time, 410, 520, 560, 520, g0 + 0.3, { stroke: color.mint, dur: 0.35 });
  const big = pop(time, 820, 520, g0 + 0.55, { name: 'a-thousand', dur: 0.6 });
  community(big, 220, 22, 72);
  // It breaks at a thousand: the big membrane flashes red.
  const crack = membrane(big, 220, 72, { ring: color.danger, fill: 0, width: 5 });
  const tBreak = works.v0 + (works.v1 - works.v0) * 0.72;
  onFrame(t => vis(crack, Math.sin(Math.PI * prog(t, tBreak, tBreak + 0.85))));
  cue(tBreak, 'crack');
  drawArrow(time, 1060, 470, 1270, 360, g0 + 1.0, { stroke: color.mint, dur: 0.4 });
  drawArrow(time, 1060, 570, 1270, 680, g0 + 1.1, { stroke: color.mint, dur: 0.4 });
  community(pop(time, 1450, 320, g0 + 1.35, { name: 'split-a' }), 140, 11, 73);
  community(pop(time, 1450, 720, g0 + 1.5, { name: 'split-b' }), 120, 8, 74);
  cue(g0 + 1.35, 'pop');
  caps(arrive(time, 1660, 520, g0 + 1.8), 0, 0, 'split, new purpose', { size: 20 });
  caps(arrive(time, 300, 660, works.v0 + (works.v1 - works.v0) * 0.3), 0, 0, 'twelve people', { size: 20 });
  caps(arrive(time, 820, 800, tBreak), 0, 0, 'a thousand', { size: 20 });

  // Pose 5: the holarchy pulled back, side by side: community, one person in it, that person's cell.
  const nest = named('holarchy', at(art));
  const h0 = L(5).v0 + 0.25;
  community(pop(nest, 360, 520, h0, { name: 'holarchy-community' }), 240, 18, 81);
  drawn(nest, 'M 430 424 a 46 46 0 1 1 -0.1 0', h0 + 0.4, 0.4, { stroke: color.text, 'stroke-width': 3 });
  drawn(nest, 'M 470 450 L 760 380', h0 + 0.7, 0.4, { stroke: color.text, 'stroke-width': 2, opacity: 0.5 });
  const zoomed = pop(nest, 960, 520, h0 + 0.9, { name: 'holarchy-people' });
  membrane(zoomed, 230, 82);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * (3 - Math.sqrt(5)), rad = 160 * Math.sqrt((i + 0.5) / 7);
    personCell(at(zoomed, rad * Math.cos(a), rad * Math.sin(a)), 44, needs(), 90 + i);
  }
  drawn(nest, 'M 1100 470 L 1400 420', h0 + 1.3, 0.4, { stroke: color.text, 'stroke-width': 2, opacity: 0.5 });
  personCell(pop(nest, 1560, 520, h0 + 1.5, { name: 'holarchy-person' }), 170, [0, 1, 2, 3], 99);
  cue(h0, 'pop'); cue(h0 + 0.9, 'pop', { i: 1 }); cue(h0 + 1.5, 'pop', { i: 2 });
  caps(arrive(nest, 960, 900, h0 + 2.0, { name: 'all-the-way-down' }), 0, 0, 'diversity all the way down, and always moving', { size: 28, fill: color.text });
  // Always moving: the whole nest breathes very slightly.
  onFrame(t => nest.setAttribute('transform', `translate(960 520) scale(${(1 + 0.012 * Math.sin((t - h0) * 1.3)).toFixed(4)}) translate(-960 -520)`));

  board(P(1, 1).v1, 'A field of dozens of communities, each a different shape and size, drifting; four named as the voice says them (choir, climate group, research lab, neighbourhood).');
  board(L(2).v1, 'The camera has dived into the climate group: every person inside is their own small cell with different needs (marks).');
  board(L(3).v1, 'Dived again, into one person: the same person on Monday, on Friday, as host, as newcomer, in a crisis, with different needs each time.');
  board(L(4).v1, 'Pulled back out, then: twelve people grow to a thousand (which flashes red as it breaks), then split into two groups with new purposes.');
  board(L(5).v1, 'The holarchy side by side: community, then person, then the person\'s own cell, with "diversity all the way down, and always moving".');
});
