// Scene 4: an impossible job. The attention-and-profit company is only part of it; even a team that
// truly wants to serve can't, because the knowledge of what's needed sits inside communities, far
// from the people who can change the tools; so apps serve the head of a long tail, and lag behind.
import { board, cue, defineScene, eio, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import {
  appBox, at, caps, color, community, company, mark, membrane, mood, person,
} from '../../../../../styles/coasys/index.ts';
import { arrive, drawArrow, drawn, fade, pop } from '../kit.ts';

export default defineScene('impossible', ctx => {
  const { art, t0 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2), l3 = ctx.line(3);
  const P = (i: number, j: number) => ctx.part(i, j);
  const k = (p: { v0: number; v1: number }, f: number) => p.v0 + (p.v1 - p.v0) * f;
  mood(ctx, 'problem');

  // Pose 1: the familiar villain, then set aside: it shrinks back on "it isn't the whole problem".
  const out1 = l1.v0 + 0.3;
  const villain = named('attention-company', at(art, 960, 480));
  const vIn = svg('g', {}, villain);
  company(pop(vIn, 0, 0, t0 + 0.3, { dur: 0.5 }), 1.3);
  const coins = named('coins', svg('g', {}, vIn));
  for (let i = 0; i < 4; i++) {
    const a = k(P(0, 0), 0.6) + i * 0.18;
    mark(pop(coins, 120 + i * 50, -60 + i * 30, a), 0, 0, 0, 0.8, color.orange);
    cue(a, 'tap', { i });
  }
  caps(arrive(vIn, 0, 210, k(P(0, 0), 0.45)), 0, 0, 'built for attention and profit', { size: 24, fill: color.text2 });
  caps(arrive(vIn, 0, 260, P(0, 1).v0), 0, 0, 'part of it, not the whole problem', { size: 20 });
  onFrame(t => {
    const u = eio(prog(t, P(0, 2).v0, P(0, 2).v0 + 0.8));
    vIn.setAttribute('transform', tf(0, -40 * u, 1 - 0.25 * u));
    vis(villain, (1 - 0.5 * u) * (1 - prog(t, out1 - 0.35, out1)));
  });

  // Pose 2: a team that truly wants to serve its users; "still can't". Then the team walks off to the
  // far side, where it sits in the next picture.
  const good = named('good-team', at(art));
  const tGo = l2.v0 + 0.2;
  const tTeam = P(2, 1).v0;
  for (let i = 0; i < 5; i++) {
    const p = at(good, 0, 0, 1, `team-member-${i + 1}`);
    person(p, 34, color.steel);
    const born = l1.v0 + 0.3 + i * 0.12;
    const [x0, y0] = [760 + i * 100, 480], [x1, y1] = [1360 + i * 60, 720];
    onFrame(t => {
      const pp = prog(t, born, born + 0.45);
      const u = eio(prog(t, tGo + i * 0.05, tGo + 0.9 + i * 0.05));
      p.setAttribute('transform', tf(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, Math.max(0.0001, (pp < 1 ? (1 - Math.pow(1 - pp, 3)) : 1) * (1 - 0.3 * u))));
      // Faint while the far side is still empty; full once the tools are there.
      vis(p, Math.min(pp * 3, 1 - 0.55 * u + 0.55 * prog(t, tTeam, tTeam + 0.4), 1 - prog(t, l3.v0, l3.v0 + 0.3)));
    });
  }
  cue(l1.v0 + 0.3, 'pop');
  caps(arrive(good, 960, 620, l1.v0 + 1.0, { until: tGo + 0.3 }), 0, 0, 'a team that truly wants to serve', { size: 26, fill: color.text });
  caps(arrive(good, 960, 680, P(1, 1).v0, { until: tGo + 0.3 }), 0, 0, 'still can’t', { size: 24, fill: color.danger });
  cue(P(1, 1).v0, 'thud');

  // Pose 3: the knowledge problem. Needs inside communities; the power to change tools far away.
  const out3 = l3.v0 + 0.3;
  const gap = named('knowledge-gap', at(art));
  fade(gap, l2.v0, out3, 0.2);
  const tKnow = k(P(2, 0), 0.3);
  [[260, 330, 110], [560, 640, 130], [260, 800, 90]].forEach(([x, y, r], i) => {
    const g = pop(gap, x, y, l2.v0 + 0.3 + i * 0.2, { name: `community-${i + 1}` });
    community(g, r, 6, 50 + i);
    for (let j = 0; j < 3; j++) mark(pop(g, -r * 0.5 + j * r * 0.5, -r - 22, tKnow + i * 0.15 + j * 0.08), (i + j) % 4, 0, 0, 0.55, color.mintLight);
  });
  cue(tKnow, 'shimmer');
  caps(arrive(gap, 430, 990, k(P(2, 0), 0.65)), 0, 0, 'know the needs · can’t change the tools', { size: 22, fill: color.mint });
  // Far away: a wall rises between them.
  const wall = named('far-away', svg('rect', { x: 880, y: 160, width: 70, height: 760, fill: color.steelDark, opacity: 0.5 }, gap));
  const tWall = k(P(2, 1), 0.45);
  onFrame(t => {
    const u = eio(prog(t, tWall - 0.3, tWall + 0.5));
    wall.setAttribute('y', (920 - 760 * u).toFixed(1));
    wall.setAttribute('height', (760 * u).toFixed(1));
  });
  cue(tWall, 'thud');
  const team = at(gap, 1480, 520);
  company(pop(team, 0, 0, tTeam, { name: 'company' }), 1);
  appBox(pop(team, 0, -230, tTeam + 0.3, { name: 'their-app' }), 200, 130, { seed: 61 });
  caps(arrive(gap, 1480, 990, k(P(2, 1), 0.7)), 0, 0, 'can change the tools · can’t see the needs', { size: 22, fill: color.steel });

  // Pose 4: the long tail. One app serves the head; most communities live out in the tail.
  const out4 = P(3, 2).v0 + 0.3;
  const tail = named('long-tail', at(art));
  fade(tail, l3.v0, out4, 0.3);
  const x0 = 220, x1 = 1760, yb = 820, top = 240;
  let d = `M ${x0} ${top}`;
  for (let i = 1; i <= 60; i++) {
    const u = i / 60;
    d += ` L ${x0 + (x1 - x0) * u} ${yb - (yb - top) * Math.exp(-u * 7)}`;
  }
  const area = svg('path', { d: `${d} L ${x1} ${yb} L ${x0} ${yb} Z`, fill: color.steelDark, opacity: 0.25 }, tail);
  drawn(tail, `M ${x0} ${yb} H ${x1}`, l3.v0 + 0.2, 0.5, { stroke: color.text3, 'stroke-width': 2 });
  drawn(tail, d, l3.v0 + 0.5, 1.0, { stroke: color.text2, 'stroke-width': 4 });
  onFrame(t => vis(area, prog(t, l3.v0 + 1.2, l3.v0 + 1.7) * 0.25));
  const tHead = k(P(3, 0), 0.55);
  const head = svg('rect', { x: x0, y: top - 20, width: 230, height: yb - top + 20, fill: color.steel, opacity: 0.18 }, tail);
  onFrame(t => {
    const u = eio(prog(t, tHead, tHead + 0.6));
    head.setAttribute('width', (230 * u).toFixed(1));
    vis(head, u > 0 ? 0.18 : 0);
  });
  appBox(pop(tail, x0 + 115, 160, tHead - 0.6, { name: 'one-app' }), 160, 100, { seed: 62 });
  caps(arrive(tail, x0 + 115, 880, tHead), 0, 0, 'what one app can serve', { size: 20, fill: color.steel });
  const tTail = P(3, 1).v0;
  for (let i = 0; i < 26; i++) {
    const c = pop(tail, 560 + (i % 13) * 92, 700 - Math.floor(i / 13) * 70 - (i % 3) * 10, tTail + 0.2 + (i % 13) * 0.07 + Math.floor(i / 13) * 0.1, { dur: 0.4 });
    membrane(c, 22, 70 + i);
  }
  cue(tTail + 0.2, 'mesh');
  caps(arrive(tail, 1150, 880, tTail + 0.8), 0, 0, 'most communities live out here', { size: 22, fill: color.mint });

  // Pose 5: always behind. The app chases the group; by the time it gets there, the group has moved.
  const lag = named('always-behind', at(art));
  const p32 = P(3, 2);
  const tChase = k(p32, 0.15), tMoved = k(p32, 0.65);
  fade(lag, p32.v0, Infinity, 0.3);
  const lagApp = at(lag, 300, 540, 1, 'catching-up-app');
  appBox(lagApp, 220, 150, { seed: 63 });
  onFrame(t => lagApp.setAttribute('transform', tf(300 + 200 * eio(prog(t, tChase, tChase + 1.6)), 540)));
  drawArrow(lag, 640, 540, 940, 540, tChase + 1.2, { stroke: color.steel, dur: 0.6 });
  const ghost = membrane(at(lag, 1060, 540), 110, 75, { dash: '8 8', fill: 0 });
  const grp = at(lag, 1060, 540, 1, 'the-group');
  community(grp, 130, 10, 76);
  onFrame(t => {
    const u = eio(prog(t, tMoved - 0.4, tMoved + 0.6));
    grp.setAttribute('transform', tf(1060 + 440 * u, 540 - 120 * u, 0.85 + 0.15 * u));
    vis(ghost, prog(t, tMoved, tMoved + 0.5));
  });
  cue(tMoved, 'slide');
  caps(arrive(lag, 1060, 700, tMoved + 0.3), 0, 0, 'where the group was', { size: 20 });
  caps(arrive(lag, 1500, 610, tMoved + 0.6), 0, 0, 'where it is now', { size: 20, fill: color.mint });

  board(P(0, 1).v1, 'Problem mood. The familiar villain, a company built for attention and profit (orange coins), labelled "part of it, not the whole problem".');
  board(l1.v1, 'A team that truly wants to serve its users. "Still can\'t".');
  board(l2.v1, 'The knowledge problem: communities on the left hold the needs (marks above them) but can\'t change their tools; a wall has risen; on the right, the team (walked over from the last picture) can change the tools but can\'t see the needs.');
  board(P(3, 1).v1, 'The long tail drawn on: one app serves the tall head of common needs; most communities sit out in the long, flat tail.');
  board(l3.v1, 'Always behind: the app has crept to where the group used to be (dashed); the group has already moved on.');
});
