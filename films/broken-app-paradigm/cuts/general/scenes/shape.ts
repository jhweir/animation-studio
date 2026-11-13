// Scene 1: a community talking, organising, deciding; one central team stamping out the same finished
// app to millions; the two people it fails, side by side: the community and the builder.
import { board, clamp, cue, defineScene, eio, ein, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import { appBox, at, caps, color, company, mark, mood, person } from '../../../../../styles/coasys/index.ts';
import { appParts, arrive, blobSquarePath, crowd, drawArrow, fade, pop, popEach, popPeople, stagger } from '../kit.ts';

export default defineScene('shape', ctx => {
  const { art, t0 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2);
  const made = ctx.part(1, 0), hands = ctx.part(1, 1);
  const word = (a: number, b: number, k: number) => a + (b - a) * k; // a moment k of the way through a line

  // Pose 1: a community, with what its tools let it do. It grows in, then breathes while the line says
  // the tools shape what it can become; it sinks away when the next line begins.
  const c = named('community', at(art, 960, 500));
  const cIn = svg('g', {}, c);
  const cc = crowd(cIn, 250, 16, 3);
  onFrame(t => {
    const u = eio(prog(t, t0 + 0.1, t0 + 0.9));
    const grow = 1 + 0.05 * eio(prog(t, word(l0.v0, l0.v1, 0.55), l0.v1));
    const away = ein(prog(t, l1.v0 - 0.1, l1.v0 + 0.4));
    cIn.setAttribute('transform', tf(0, 0, (0.6 + 0.4 * u) * grow * (1 - 0.3 * away)));
    vis(cc.ring, u);
    vis(c, 1 - away);
  });
  popPeople(cc, t0 + 0.5, t0 + 1.6);
  const verbs = named('talk-organise-decide', at(c));
  ['talk', 'organise', 'decide'].forEach((s, i) => {
    const a = word(l0.v0, l0.v1, [0.27, 0.33, 0.45][i]);
    const v = arrive(verbs, -360 + i * 360, 360, a, { name: `verb-${s}` });
    caps(v, 0, 0, s, { size: 26, fill: color.mint });
    cue(a, 'tap', { i });
  });

  // Pose 2: one team, one finished app, copied out to millions.
  mood({ ...ctx, t0: l1.v0, t1: l2.v0 + 0.3 }, 'problem');
  const stamp = named('one-app-for-millions', at(art));
  const out = l2.v0 + 0.3;
  const team = pop(stamp, 300, 520, made.v0 + 0.3, { name: 'one-team', until: out });
  company(team, 1.1);
  caps(arrive(stamp, 300, 680, hands.v0, { until: out }), 0, 0, 'one team', { size: 22 });
  const tDesign = word(hands.v0, hands.v1, 0.3);
  const tDone = word(hands.v0, hands.v1, 0.55);
  const tHand = word(hands.v0, hands.v1, 0.62);
  const design = drawArrow(stamp, 400, 520, 490, 520, tDesign - 0.3, { stroke: color.steel, dur: 0.35 });
  const app = at(stamp, 640, 520, 1, 'one-finished-app');
  const box = appParts(app, 260, 180, { seed: 2 });
  fade(box.frame, tDesign, out);
  popEach(box.items, tDesign + 0.2, tDone - 0.2, 0.35);
  // Finished: the box seals with a brief bright edge.
  const seal = svg('rect', { x: -130, y: -90, width: 260, height: 180, rx: 18, fill: 'none', stroke: color.text, 'stroke-width': 4 }, app);
  onFrame(t => {
    vis(seal, Math.sin(Math.PI * prog(t, tDone, tDone + 0.6)) * 0.8);
    vis(app, 1 - prog(t, out - 0.35, out));
  });
  caps(arrive(stamp, 640, 660, tDone, { until: out }), 0, 0, 'one finished app', { size: 22 });
  cue(tDone, 'lock');
  const handOut = drawArrow(stamp, 790, 520, 940, 520, tHand - 0.2, { stroke: color.steel, dur: 0.35 });
  for (const e of [design, handOut]) onFrame(t => vis(e, 1 - prog(t, out - 0.35, out)));
  // The copies fly out of the one app to their places in the crowd, each landing by a person.
  const copies = named('copies', at(stamp));
  for (let i = 0; i < 24; i++) {
    const x = 1020 + (i % 6) * 140, y = 250 + Math.floor(i / 6) * 150;
    const a = stagger(tHand, tHand + 1.1, (i % 6) + Math.floor(i / 6) * 0.5, 8.5);
    const cp = at(copies, x, y);
    appBox(cp, 110, 76, { seed: 2 });
    onFrame(t => {
      const u = eio(prog(t, a, a + 0.6));
      cp.setAttribute('transform', tf(640 + (x - 640) * u, 520 + (y - 520) * u, 0.45 + 0.55 * u));
      vis(cp, Math.min(clamp(u * 4), 1 - prog(t, out - 0.35, out)));
    });
    const p = pop(copies, x + 40, y + 52, a + 0.5, { until: out });
    person(p, 12, color.inkFigure);
  }
  cue(tHand + 0.4, 'mesh');
  caps(arrive(stamp, 1370, 900, tHand + 1.4, { until: out }), 0, 0, 'the same for millions', { size: 22 });

  // Pose 3: who it fails. A community pressed into a box; a builder with a small idea and a huge box.
  const fails = named('who-it-fails', at(art));
  const tUse = word(l2.v0, l2.v1, 0.45), tBuild = word(l2.v0, l2.v1, 0.82);
  const users = named('users-in-a-box', at(fails, 600, 500));
  const uc = crowd(users, 200, 12, 5);
  const frame = svg('rect', { x: -220, y: -170, width: 440, height: 340, rx: 18, fill: 'none', stroke: color.steel, 'stroke-width': 4, pathLength: 1 }, users);
  onFrame(t => {
    vis(uc.ring, prog(t, l2.v0, l2.v0 + 0.45));
    const u = eio(prog(t, tUse - 0.2, tUse + 0.6));
    frame.setAttribute('stroke-dasharray', `${u.toFixed(4)} 1`);
    vis(frame, u > 0 ? 1 : 0);
    // The box closes in: the membrane flattens against it.
    const sq = eio(prog(t, tUse + 0.4, tUse + 1.2));
    uc.ring.setAttribute('d', blobSquarePath(200, 5, 168 * sq + 200 * (1 - sq), sq * 0.85));
    users.setAttribute('transform', tf(600, 500, 1, 0) + ` scale(${(1 - 0.06 * sq).toFixed(4)} ${(1 - 0.12 * sq).toFixed(4)})`);
  });
  popPeople(uc, l2.v0 + 0.1, l2.v0 + 0.9, 0.35);
  cue(tUse + 0.6, 'thud');
  caps(arrive(fails, 600, 760, tUse - 0.4), 0, 0, 'the people who use them', { size: 24, fill: color.text });
  const builder = named('builder', at(fails, 1320, 500));
  person(pop(builder, -120, 60, tBuild - 0.5), 40, color.inkFigure);
  mark(pop(builder, -120, -40, tBuild - 0.2, { name: 'small-idea' }), 1, 0, 0, 0.9, color.orange);
  const big = pop(builder, 110, 20, tBuild + 0.3, { name: 'huge-app', dur: 0.6 });
  appBox(big, 300, 220, { seed: 9 });
  cue(tBuild - 0.2, 'pop');
  caps(arrive(fails, 1320, 760, tBuild - 0.4), 0, 0, 'the people who build them', { size: 24, fill: color.text });

  board(l0.v1, 'A community grown in, with what its tools let it do: talk, organise, decide (each arriving as it is said).');
  board(l2.v0 - 0.1, 'Problem mood. One team designs one app, seals it, and copies fly out of it to a crowd of millions.');
  board(l2.v1, 'Who this fails: a community squeezed square inside a steel box; a builder holding a small idea (orange) beside a huge box.');
});
