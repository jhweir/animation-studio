// Scene 2: diversity all the way down, through the social-cell holarchy. A field of different
// communities; zoom into one, full of different people; zoom into one person, whose needs change by
// day and role; communities growing and splitting over time; then the nesting, pulled back.
import { board, defineScene, named, rng, svg } from '../../../../../engine/index.ts';
import { arrow, at, caps, color, community, membrane, personCell, pose } from '../../../../../styles/coasys/index.ts';

export default defineScene('diversity', ctx => {
  const { art, t1 } = ctx;
  const L = (i: number) => ctx.line(i);
  const r = rng(17);
  const needs = () => Array.from({ length: 2 + Math.floor(r() * 3) }, () => Math.floor(r() * 4));

  // Pose 1: a field of communities, every one different.
  const field = named('community-field', at(art));
  const named4 = ['choir', 'climate group', 'research lab', 'neighbourhood'];
  for (let i = 0; i < 42; i++) {
    const x = 120 + (i % 7) * 280 + (Math.floor(i / 7) % 2) * 140, y = 130 + Math.floor(i / 7) * 150;
    if (x > 1860) continue;
    const g = at(field, x, y);
    community(g, 36 + r() * 40, 1 + Math.floor(r() * 5), i + 1);
    if (i === 8 || i === 17 || i === 24 || i === 31) caps(field, x, y + 92, named4[[8, 17, 24, 31].indexOf(i)], { size: 18, fill: color.text2 });
  }
  pose(field, ctx.t0, L(2).v0 + 0.2);

  // Pose 2: one community, close up: every person a different cell.
  const one = named('one-community', at(art, 960, 520));
  membrane(one, 420, 7);
  for (let i = 0; i < 11; i++) {
    const a = i * Math.PI * (3 - Math.sqrt(5)), rad = 300 * Math.sqrt((i + 0.5) / 11);
    personCell(at(one, rad * Math.cos(a), rad * Math.sin(a)), 62, needs(), 30 + i);
  }
  pose(one, L(2).v0, L(3).v0 + 0.2);

  // Pose 3: one person, and the same person in different moments and roles.
  const me = named('one-person', at(art, 960, 520));
  personCell(me, 200, [0, 1, 2], 51);
  const facets = [['monday', [3, 0]], ['friday', [1, 1, 2]], ['as host', [2, 3]], ['as newcomer', [0]], ['in a crisis', [1, 3, 3]]] as const;
  facets.forEach(([label, ns], i) => {
    const a = -Math.PI / 2 + (i / facets.length) * Math.PI * 2;
    const x = 380 * Math.cos(a) * 1.35, y = 380 * Math.sin(a) * 0.95;
    svg('line', { x1: 210 * Math.cos(a), y1: 210 * Math.sin(a), x2: x - 80 * Math.cos(a), y2: y - 80 * Math.sin(a), stroke: color.mint, 'stroke-width': 2, opacity: 0.4 }, me);
    personCell(at(me, x, y), 70, [...ns], 60 + i);
    caps(me, x, y + 100, label, { size: 18, fill: color.text2 });
  });
  pose(me, L(3).v0, L(4).v0 + 0.2);

  // Pose 4: everything moves. A community grows, then splits.
  const time = named('communities-change', at(art));
  community(at(time, 300, 520), 80, 4, 71);
  caps(time, 300, 660, 'twelve people', { size: 20 });
  arrow(time, 410, 520, 560, 520, { stroke: color.mint });
  community(at(time, 820, 520), 220, 22, 72);
  caps(time, 820, 800, 'a thousand', { size: 20 });
  arrow(time, 1060, 470, 1270, 360, { stroke: color.mint });
  arrow(time, 1060, 570, 1270, 680, { stroke: color.mint });
  community(at(time, 1450, 320), 140, 11, 73);
  community(at(time, 1450, 720), 120, 8, 74);
  caps(time, 1660, 520, 'split, new purpose', { size: 20 });
  pose(time, L(4).v0, L(5).v0 + 0.2);

  // Pose 5: the holarchy pulled back: field, community, person, nested.
  const nest = named('holarchy', at(art));
  community(at(nest, 360, 520), 240, 18, 81);
  svg('circle', { cx: 430, cy: 470, r: 46, fill: 'none', stroke: color.text, 'stroke-width': 3 }, nest);
  svg('line', { x1: 470, y1: 450, x2: 760, y2: 380, stroke: color.text, 'stroke-width': 2, opacity: 0.5 }, nest);
  const zoomed = at(nest, 960, 520);
  membrane(zoomed, 230, 82);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * (3 - Math.sqrt(5)), rad = 160 * Math.sqrt((i + 0.5) / 7);
    personCell(at(zoomed, rad * Math.cos(a), rad * Math.sin(a)), 44, needs(), 90 + i);
  }
  svg('line', { x1: 1100, y1: 470, x2: 1400, y2: 420, stroke: color.text, 'stroke-width': 2, opacity: 0.5 }, nest);
  personCell(at(nest, 1560, 520), 170, [0, 1, 2, 3], 99);
  caps(nest, 960, 900, 'diversity all the way down, and always moving', { size: 28, fill: color.text });
  pose(nest, L(5).v0, t1 + 1);

  board(L(1).v1, 'A field of dozens of communities, each a different shape and size; a few labelled (choir, climate group, research lab, neighbourhood).');
  board(L(2).v1, 'Zoom into one community: every person inside is their own small cell with different needs (marks).');
  board(L(3).v1, 'Zoom into one person: the same person on Monday, on Friday, as host, as newcomer, in a crisis, with different needs each time.');
  board(L(4).v1, 'Everything moves: twelve people grow to a thousand, then split into two groups with new purposes.');
  board(L(5).v1, 'The holarchy pulled back: community, then person, nested, with "diversity all the way down, and always moving".');
});
