// Scene 4: an impossible job. The attention-and-profit company is only part of it; even a team that
// truly wants to serve can't, because the knowledge of what's needed sits inside communities, far
// from the people who can change the tools; so apps serve the head of a long tail, and lag behind.
import { board, defineScene, named, svg } from '../../../../../engine/index.ts';
import {
  appBox, arrow, at, caps, color, community, company, mark, membrane, mood, person, pose,
} from '../../../../../styles/coasys/index.ts';

export default defineScene('impossible', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2), l3 = ctx.line(3);
  mood(ctx, 'problem');

  // Pose 1: the familiar villain, then set aside.
  const villain = named('attention-company', at(art, 960, 480));
  company(villain, 1.3);
  for (let i = 0; i < 4; i++) mark(villain, 0, 120 + i * 50, -60 + i * 30, 0.8, color.orange);
  caps(villain, 0, 210, 'built for attention and profit', { size: 24, fill: color.text2 });
  caps(villain, 0, 260, 'part of it, not the whole problem', { size: 20 });
  pose(villain, ctx.t0, l1.v0 + 0.2);

  // Pose 2: a team that truly wants to serve its users.
  const good = named('good-team', at(art, 960, 480));
  for (let i = 0; i < 5; i++) person(at(good, -200 + i * 100, 0), 34, color.steel);
  caps(good, 0, 140, 'a team that truly wants to serve', { size: 26, fill: color.text });
  caps(good, 0, 200, 'still can’t', { size: 24, fill: color.danger });
  pose(good, l1.v0, l2.v0 + 0.2);

  // Pose 3: the knowledge problem. Needs inside communities; the power to change tools far away.
  const gap = named('knowledge-gap', at(art));
  [[260, 330, 110], [560, 640, 130], [260, 800, 90]].forEach(([x, y, r], i) => {
    const g = at(gap, x, y);
    community(g, r, 6, 50 + i);
    for (let k = 0; k < 3; k++) mark(g, (i + k) % 4, -r * 0.5 + k * r * 0.5, -r - 22, 0.55, color.mintLight);
  });
  caps(gap, 430, 990, 'know the needs · can’t change the tools', { size: 22, fill: color.mint });
  svg('rect', { x: 880, y: 160, width: 70, height: 760, fill: color.steelDark, opacity: 0.5 }, gap);
  const team = at(gap, 1480, 520);
  company(team, 1);
  for (let i = 0; i < 3; i++) person(at(team, -150 + i * 150, 200), 26, color.steel);
  appBox(at(team, 0, -230), 200, 130, { seed: 61 });
  caps(gap, 1480, 990, 'can change the tools · can’t see the needs', { size: 22, fill: color.steel });
  pose(gap, l2.v0, l3.v0 + 0.2);

  // Pose 4: the long tail. One app serves the head; most communities live out in the tail.
  const tail = named('long-tail', at(art));
  const x0 = 220, x1 = 1760, yb = 820, top = 240;
  let d = `M ${x0} ${top}`;
  for (let i = 1; i <= 60; i++) {
    const u = i / 60;
    d += ` L ${x0 + (x1 - x0) * u} ${yb - (yb - top) * Math.exp(-u * 7)}`;
  }
  svg('path', { d: `${d} L ${x1} ${yb} L ${x0} ${yb} Z`, fill: color.steelDark, opacity: 0.25 }, tail);
  svg('path', { d, fill: 'none', stroke: color.text2, 'stroke-width': 4 }, tail);
  svg('line', { x1: x0, y1: yb, x2: x1, y2: yb, stroke: color.text3, 'stroke-width': 2 }, tail);
  svg('rect', { x: x0, y: top - 20, width: 230, height: yb - top + 20, fill: color.steel, opacity: 0.18 }, tail);
  appBox(at(tail, x0 + 115, 160), 160, 100, { seed: 62 });
  caps(tail, x0 + 115, 880, 'what one app can serve', { size: 20, fill: color.steel });
  for (let i = 0; i < 26; i++) membrane(at(tail, 560 + (i % 13) * 92, 700 - Math.floor(i / 13) * 70 - (i % 3) * 10), 22, 70 + i);
  caps(tail, 1150, 880, 'most communities live out here', { size: 22, fill: color.mint });
  pose(tail, l3.v0, ctx.part(3, 2).v0 + 0.2);

  // Pose 5: always behind. The app arrives where the group used to be.
  const lag = named('always-behind', at(art));
  appBox(at(lag, 500, 540), 220, 150, { seed: 63 });
  arrow(lag, 640, 540, 940, 540, { stroke: color.steel });
  membrane(at(lag, 1060, 540), 110, 75, { dash: '8 8', fill: 0 });
  caps(lag, 1060, 700, 'where the group was', { size: 20 });
  community(at(lag, 1500, 420), 130, 10, 76);
  caps(lag, 1500, 610, 'where it is now', { size: 20, fill: color.mint });
  pose(lag, ctx.part(3, 2).v0, t1 + 1);

  board(ctx.line(0).v1, 'The familiar villain, a company built for attention and profit (orange coins), labelled "part of it, not the whole problem".');
  board(l1.v1, 'A team that truly wants to serve its users. "Still can\'t".');
  board(l2.v1, 'The knowledge problem: communities on the left hold the needs (marks above them) but can\'t change their tools; behind a wall on the right, the team can change the tools but can\'t see the needs.');
  board(ctx.part(3, 1).v1, 'The long tail: one app serves the tall head of common needs; most communities sit out in the long, flat tail.');
  board(l3.v1, 'Always behind: the app arrives where the group used to be; the group has already moved on.');
});
