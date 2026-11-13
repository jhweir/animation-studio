// Scene 1: a community talking, organising, deciding; one central team stamping out the same finished
// app to millions; the two people it fails, side by side: the community and the builder.
import { board, defineScene, named, svg } from '../../../../../engine/index.ts';
import { appBox, arrow, at, caps, color, community, company, mark, mood, person, pose } from '../../../../../styles/coasys/index.ts';

export default defineScene('shape', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2);

  // Pose 1: a community, with what its tools let it do.
  const c = named('community', at(art, 960, 500));
  community(c, 250, 16, 3);
  ['talk', 'organise', 'decide'].forEach((s, i) => caps(c, -360 + i * 360, 360, s, { size: 26, fill: color.mint }));
  pose(c, ctx.t0, l1.v0 + 0.2);

  // Pose 2: one team, one finished app, copied out to millions.
  const stamp = named('one-app-for-millions', at(art));
  mood({ ...ctx, t0: l1.v0, t1: l2.v0 + 0.3 }, 'problem');
  company(at(stamp, 300, 520), 1.1);
  caps(stamp, 300, 680, 'one team', { size: 22 });
  appBox(at(stamp, 640, 520), 260, 180, { seed: 2 });
  caps(stamp, 640, 660, 'one finished app', { size: 22 });
  arrow(stamp, 400, 520, 490, 520, { stroke: color.steel });
  for (let i = 0; i < 24; i++) {
    const x = 1020 + (i % 6) * 140, y = 250 + Math.floor(i / 6) * 150;
    appBox(at(stamp, x, y), 110, 76, { seed: 2 });
    person(at(stamp, x + 40, y + 52), 12, color.inkFigure);
  }
  arrow(stamp, 790, 520, 940, 520, { stroke: color.steel });
  caps(stamp, 1370, 900, 'the same for millions', { size: 22 });
  pose(stamp, l1.v0, l2.v0 + 0.2);

  // Pose 3: who it fails. A community pressed into a box; a builder with a small idea and a huge box.
  const fails = named('who-it-fails', at(art));
  const users = at(fails, 600, 500);
  svg('rect', { x: -220, y: -170, width: 440, height: 340, rx: 18, fill: 'none', stroke: color.steel, 'stroke-width': 4 }, users);
  community(users, 200, 12, 5);
  caps(fails, 600, 760, 'the people who use them', { size: 24, fill: color.text });
  const builder = at(fails, 1320, 500);
  person(at(builder, -120, 60), 40, color.inkFigure);
  mark(builder, 1, -120, -40, 0.9, color.orange);
  appBox(at(builder, 110, 20), 300, 220, { seed: 9 });
  caps(fails, 1320, 760, 'the people who build them', { size: 24, fill: color.text });
  pose(fails, l2.v0, t1 + 1);

  board(ctx.line(0).v1, 'A community with what its tools let it do: talk, organise, decide.');
  board(l1.v1, 'Problem mood. One team, one finished app, copied out unchanged to a crowd of millions.');
  board(l2.v1, 'Who this fails: a community squeezed inside a steel box; a builder holding a small idea (orange) beside a huge box.');
});
