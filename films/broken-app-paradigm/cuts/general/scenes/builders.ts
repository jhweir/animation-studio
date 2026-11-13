// Scene 5: builders with small, specific ideas; one idea, tiny, wrapped in layer after layer of rebuilt
// social shell (front end first), then servers, databases and hosting beneath; the proportions.
import { board, defineScene, named, onFrame, prog, svg } from '../../../../../engine/index.ts';
import { at, caps, color, glyph, mark, mood, person, pose } from '../../../../../styles/coasys/index.ts';

export default defineScene('builders', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2), l3 = ctx.line(3);
  mood(ctx, 'problem');

  // Pose 1: builders, each with a small, specific idea.
  const ideas = named('builders-ideas', at(art));
  [['a fairer way to decide', 0], ['a map of a bioregion', 2], ['a game to plan together', 1]].forEach(([s, k], i) => {
    const g = at(ideas, 420 + i * 540, 520);
    person(at(g, 0, 60), 50, color.inkFigure);
    mark(g, k as number, 0, -80, 1.2, color.orange);
    caps(g, 0, 200, s as string, { size: 22, fill: color.text2 });
  });
  caps(ideas, 960, 860, 'small and specific: what the long tail needs', { size: 24, fill: color.text });
  pose(ideas, ctx.t0, l2.v0 + 0.2);

  // Pose 2: the shell, layer by layer, around one tiny idea; the backend beneath.
  const shell = named('social-shell', at(art, 960, 440));
  const layers = ['profiles & sign-up', 'feeds & threads', 'messages', 'notifications', 'roles', 'moderation', 'onboarding', 'design system', 'web & mobile apps'];
  const start = ctx.part(2, 2).v0;
  const span = ctx.part(2, 2).v1 - start;
  layers.forEach((s, i) => {
    const w = 120 + (i + 1) * 150, h = 70 + (i + 1) * 62;
    const g = svg('g', {}, shell);
    svg('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14, fill: 'none', stroke: color.steel, 'stroke-width': 2.5, opacity: 0.45 + i * 0.05 }, g);
    caps(g, 0, -h / 2 + 22, s, { size: 15, fill: color.text3 });
    const at0 = start + (i / layers.length) * span;
    onFrame(t => g.setAttribute('opacity', prog(t, at0, at0 + 0.3).toFixed(3)));
  });
  mark(shell, 0, 0, 0, 0.7, color.orange);
  caps(shell, 0, 40, 'the idea', { size: 14, fill: color.orange });
  pose(shell, l2.v0, l3.v0 + 0.2);
  const back = named('backend', at(art, 960, 930));
  svg('rect', { x: -720, y: -60, width: 1440, height: 120, rx: 14, fill: color.steelDark, 'fill-opacity': 0.5, stroke: color.steel, 'stroke-width': 2.5 }, back);
  [-150, 50, 250, 450, 650].forEach(x => svg('path', { d: glyph.server, transform: `translate(${x} 0) scale(0.7)`, fill: 'none', stroke: color.steel, 'stroke-width': 3 }, back));
  caps(back, -690, 10, 'servers · databases · hosting', { size: 18, fill: color.text2, anchor: 'start' });
  pose(back, ctx.part(2, 3).v0, l3.v0 + 0.2);

  // Pose 3: the proportions. A sliver of idea; everything else is shell.
  const prop = named('proportions', at(art));
  svg('rect', { x: 260, y: 470, width: 1400, height: 110, rx: 12, fill: color.steelDark, 'fill-opacity': 0.6, stroke: color.steel, 'stroke-width': 3 }, prop);
  svg('rect', { x: 260, y: 470, width: 60, height: 110, rx: 12, fill: color.orange }, prop);
  caps(prop, 290, 440, 'the idea', { size: 22, fill: color.orange });
  caps(prop, 1000, 640, 'the shell: everything else', { size: 26, fill: color.text2 });
  pose(prop, l3.v0, t1 + 1);

  board(l1.v1, 'Three builders, each with a small, specific idea (orange): a fairer way to decide, a bioregion map, a planning game.');
  board(ctx.part(2, 2).v1, 'One tiny idea at the centre; the social shell builds up around it layer by layer: profiles, feeds, messages, notifications, roles, moderation, onboarding, design system, apps.');
  board(l2.v1, 'Beneath the shell, a backend slab: servers, databases, hosting.');
  board(l3.v1, 'The proportions as one bar: a sliver of orange for the idea, the rest steel shell.');
});
