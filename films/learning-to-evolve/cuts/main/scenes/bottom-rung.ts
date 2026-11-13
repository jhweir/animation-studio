// Scene 4: back to apps. Life's ladder slides in and our apps drop into a heap at its foot; three panels
// open one by one for what they can't do (combine: two apps bump and are blocked; jump: a tool's arrow
// toward a community is crossed; learn: the same app month after month); an app and the earliest cell
// slide together, side by side.
import { board, cue, defineScene, eback, named, onFrame, prog, tf, vis } from '../../../../../engine/index.ts';
import { color, moods } from '../../../../../styles/coasys/index.ts';
import { appBox, arrive, at, caps, cell, community, cross, drawArrow, drawn, ladder, mood, popIn, hold } from '../kit.ts';

export default defineScene('bottom-rung', ctx => {
  const { art, t1 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2);
  const [jumpSaid, learnSaid] = [ctx.part(1, 1), ctx.part(1, 2)];
  mood(ctx, 'problem');
  const fadeIn = (e: Element, a: number) => onFrame(t => vis(e, prog(t, a, a + 0.5)));

  // Pose 1: life's ladder slides back in; our social tools drop into a heap below its first rung.
  const foot = named('ladder-foot', at(art));
  const lad = named('ladder', at(foot));
  ladder(lad, 720, 260);
  ['recombination', 'sharing sideways', 'learning'].forEach((s, i) => caps(lad, 170, 180 - i * 180 + 8, s, { size: 20, fill: moods.blueprint.ink, anchor: 'start' }));
  arrive(lad, 960, 430, ctx.t0, { dx: 300, dur: 0.7 });
  for (let i = 0; i < 7; i++) {
    const a = l0.v0 + 0.6 + i * 0.12;
    arrive(named(`app-${i + 1}`, appBox(at(foot), 130, 86, { seed: 30 + i })), 600 + i * 120, 880 + (i % 2) * 40, a, { dy: -120, dur: 0.45 });
  }
  cue(l0.v0 + 1.0, 'drop');
  const ours = caps(foot, 960, 1030, 'our social tools', { size: 20 });
  fadeIn(ours, l0.v0 + 1.6);
  hold(foot, ctx.t0, l1.v0 + 0.2);

  // Pose 2: three panels, opening as each missing step is named.
  const panels = named('cant-panels', at(art));
  drawn(panels, 'M 640 220 V 860', l1.v0 + 0.2, { stroke: color.line, 'stroke-width': 2 }, { dur: 0.6 });
  drawn(panels, 'M 1280 220 V 860', jumpSaid.v0, { stroke: color.line, 'stroke-width': 2 }, { dur: 0.6 });

  const combine = named('cant-combine', at(panels));
  fadeIn(caps(combine, 320, 260, "can't combine", { size: 26, fill: color.text }), l1.v0 + 0.2);
  const sealed = l1.v0 + 2.6;
  ([[200, 41, -1], [440, 42, 1]] as const).forEach(([x, seed, side], i) => {
    const app = named(`sealed-app-${i + 1}`, at(combine));
    appBox(at(app), 190, 130, { parts: i ? ['plain', 'plain', 'idea', 'plain'] : ['plain', 'idea', 'plain', 'plain'], seed });
    onFrame(t => {
      const pop = Math.max(0.0001, eback(prog(t, l1.v0 + 0.4 + i * 0.15, l1.v0 + 0.85 + i * 0.15)));
      const nudge = Math.sin(Math.PI * prog(t, sealed - 0.5, sealed + 0.1)) * 22;
      app.setAttribute('transform', tf(x - side * nudge, 540, pop));
      vis(app, prog(t, l1.v0 + 0.4 + i * 0.15, l1.v0 + 0.55 + i * 0.15));
    });
  });
  popIn(named('combine-blocked', cross(combine, 0, 0)), 320, 540, sealed, { s: 1.1 });
  cue(sealed, 'lock');

  const jump = named('cant-jump', at(panels));
  fadeIn(caps(jump, 960, 260, "can't jump between groups", { size: 26, fill: color.text }), jumpSaid.v0);
  const tool = named('tool-app', at(jump));
  appBox(tool, 190, 130, { parts: ['plain', 'idea', 'plain', 'plain'], seed: 43 });
  popIn(tool, 800, 540, jumpSaid.v0 + 0.3);
  const other = named('other-community', at(jump));
  community(other, 100, 7, 4, { ring: color.text3 });
  popIn(other, 1130, 540, jumpSaid.v0 + 0.6);
  drawArrow(jump, 900, 450, 1040, 450, jumpSaid.v0 + 1.6, { stroke: color.orange, bend: -20, name: 'jump-arrow' });
  popIn(named('jump-blocked', cross(jump, 0, 0)), 975, 430, jumpSaid.v0 + 2.3, { s: 0.9 });
  cue(jumpSaid.v0 + 2.3, 'thud');

  const learn = named('cant-learn', at(panels));
  fadeIn(caps(learn, 1600, 260, "can't learn", { size: 26, fill: color.text }), learnSaid.v0);
  ['month 1', 'month 6', 'month 12'].forEach((m, i) => {
    const g = named(`month-${i + 1}`, at(learn));
    appBox(at(g, -30, 0), 150, 100, { seed: 44 });
    community(at(g, 115, 0), 48, 4, 5, { ring: color.text3 });
    caps(g, -250, 8, m, { size: 18, anchor: 'start' });
    popIn(g, 1600, 400 + i * 160, learnSaid.v0 + 0.3 + i * 0.45);
    cue(learnSaid.v0 + 0.3 + i * 0.45, 'tick', { i });
  });
  hold(panels, l1.v0, l2.v0 + 0.2);

  // Pose 3: an app and the earliest life slide together, side by side.
  const pair = named('app-and-cell', at(art));
  const app = named('app-today', at(pair));
  appBox(app, 320, 220, { seed: 46 });
  caps(app, 0, 190, 'social tools today', { size: 22 });
  arrive(app, 680, 500, l2.v0 + 0.2, { dx: -220, dur: 0.6 });
  const early = named('earliest-cell', at(pair));
  cell(early, 130, [0]);
  caps(early, 0, 190, 'the earliest life', { size: 22, fill: moods.blueprint.ink });
  arrive(early, 1240, 500, l2.v0 + 0.4, { dx: 220, dur: 0.6 });
  const like = named('alike', caps(at(pair), 0, 25, '≈', { size: 80, fill: color.text2, weight: 300 }).parentElement!);
  popIn(like, 960, 490, ctx.line(2).v1 - 2.6);
  cue(ctx.line(2).v1 - 2.6, 'one');
  hold(pair, l2.v0, t1 + 1);

  board(l0.v1, 'Life\'s ladder (rungs labelled, blueprint ink) slid back in, with our social tools dropped into a heap at its foot, below the first rung.');
  board(l1.v1, 'Three panels opened in turn: can\'t combine (two apps bump and are blocked), can\'t jump between groups (a tool\'s arrow to a community is crossed), can\'t learn (the same app every month).');
  board(l2.v1, 'An app and a single early cell slid together, side by side: "still evolve like the earliest life".');
});
