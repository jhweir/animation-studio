// Scene 4: back to apps, crowded at the foot of life's ladder; three panels show what they can't do
// (combine, jump between groups, learn); an app and the earliest cell side by side.
import { board, defineScene, named, svg } from '../../../../../engine/index.ts';
import { color, moods } from '../../../../../styles/coasys/index.ts';
import { appBox, arrow, at, caps, cell, community, cross, ladder, mood, pose } from '../kit.ts';

export default defineScene('bottom-rung', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2);
  mood(ctx, 'problem');

  // Pose 1: the ladder, with apps crowded below its first rung.
  const foot = named('ladder-foot', at(art));
  const lad = at(foot, 960, 430);
  ladder(lad, 720, 260);
  ['recombination', 'sharing sideways', 'learning'].forEach((s, i) => caps(lad, 170, 180 - i * 180 + 8, s, { size: 20, fill: moods.blueprint.ink, anchor: 'start' }));
  for (let i = 0; i < 7; i++) appBox(at(foot, 600 + i * 120, 880 + (i % 2) * 40), 130, 86, { seed: 30 + i });
  caps(foot, 960, 1030, 'our social tools', { size: 20 });
  pose(foot, ctx.t0, l1.v0 + 0.2);

  // Pose 2: three panels, one per missing step.
  const panels = named('cant-panels', at(art));
  for (const x of [640, 1280]) svg('line', { x1: x, y1: 220, x2: x, y2: 860, stroke: color.line, 'stroke-width': 2 }, panels);
  const combine = named('cant-combine', at(panels));
  caps(combine, 320, 260, "can't combine", { size: 26, fill: color.text });
  appBox(at(combine, 200, 540), 190, 130, { parts: ['plain', 'idea', 'plain', 'plain'], seed: 41 });
  appBox(at(combine, 440, 540), 190, 130, { parts: ['plain', 'plain', 'idea', 'plain'], seed: 42 });
  cross(combine, 320, 540, 1.1);
  const jump = named('cant-jump', at(panels));
  caps(jump, 960, 260, "can't jump between groups", { size: 26, fill: color.text });
  appBox(at(jump, 800, 540), 190, 130, { parts: ['plain', 'idea', 'plain', 'plain'], seed: 43 });
  community(at(jump, 1130, 540), 100, 7, 4, { ring: color.text3 });
  arrow(jump, 900, 450, 1040, 450, { stroke: color.orange, bend: -20, dash: '6 8' });
  cross(jump, 975, 430, 0.9);
  const learn = named('cant-learn', at(panels));
  caps(learn, 1600, 260, "can't learn", { size: 26, fill: color.text });
  ['month 1', 'month 6', 'month 12'].forEach((m, i) => {
    const g = at(learn, 1600, 400 + i * 160);
    appBox(at(g, -30, 0), 150, 100, { seed: 44 });
    community(at(g, 115, 0), 48, 4, 5, { ring: color.text3 });
    caps(g, -250, 8, m, { size: 18, anchor: 'start' });
  });
  pose(panels, l1.v0, l2.v0 + 0.2);
  pose(combine, l1.v0, l2.v0 + 0.2);
  pose(jump, ctx.part(1, 1).v0, l2.v0 + 0.2);
  pose(learn, ctx.part(1, 2).v0, l2.v0 + 0.2);

  // Pose 3: an app and the earliest life, side by side.
  const pair = named('app-and-cell', at(art));
  appBox(at(pair, 680, 500), 320, 220, { seed: 46 });
  caps(pair, 960, 515, '≈', { size: 80, fill: color.text2, weight: 300 });
  cell(at(pair, 1240, 500), 130, [0]);
  caps(pair, 680, 690, 'social tools today', { size: 22 });
  caps(pair, 1240, 690, 'the earliest life', { size: 22, fill: moods.blueprint.ink });
  pose(pair, l2.v0, t1 + 1);

  board(ctx.line(0).v1, 'Life\'s ladder (rungs labelled, blueprint ink) with our social tools crowded at its foot, below the first rung.');
  board(l1.v1, 'Three panels: can\'t combine (two good ideas walled apart), can\'t jump between groups (a tool can\'t reach a community), can\'t learn (the same app every month).');
  board(l2.v1, 'An app and a single early cell, side by side: "still evolve like the earliest life".');
});
