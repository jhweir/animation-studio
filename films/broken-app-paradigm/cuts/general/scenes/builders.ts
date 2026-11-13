// Scene 5: builders with small, specific ideas; one idea, tiny, can't travel alone, so a whole social
// shell is built around it layer by layer as each part is named (front end first), then servers,
// databases and hosting beneath; then the whole stack squashes into one bar: a sliver of idea.
import { board, clamp, cue, defineScene, eio, eout, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import { at, caps, color, cross, glyph, mark, mood, person } from '../../../../../styles/coasys/index.ts';
import { arrive, drawn, pop } from '../kit.ts';

export default defineScene('builders', ctx => {
  const { art, t0 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2), l3 = ctx.line(3);
  const P = (i: number, j: number) => ctx.part(i, j);
  const k = (p: { v0: number; v1: number }, f: number) => p.v0 + (p.v1 - p.v0) * f;
  mood(ctx, 'problem');

  // Pose 1: builders, each with a small, specific idea, named one by one.
  const ideas = named('builders-ideas', at(art));
  const out1 = l2.v0 + 0.5;
  const named3: [string, number, number][] = [['a fairer way to decide', 0, 0.36], ['a map of a bioregion', 2, 0.58], ['a game to plan together', 1, 0.73]];
  const keepIdea = 1; // the map's builder is the one we follow
  named3.forEach(([s, kind, when], i) => {
    const g = at(ideas, 420 + i * 540, 520, 1, `builder-${i + 1}`);
    const p = pop(g, 0, 60, Math.max(t0 + 0.2, k(l0, 0.6)) + i * 0.15);
    person(p, 50, color.inkFigure);
    const tSay = k(P(1, 0), when);
    if (i !== keepIdea) mark(pop(g, 0, -80, tSay, { name: `idea-${i + 1}` }), kind, 0, 0, 1.2, color.orange);
    caps(arrive(g, 0, 200, tSay + 0.1), 0, 0, s, { size: 22, fill: color.text2 });
    cue(tSay, 'pop', { i });
    onFrame(t => vis(g, 1 - prog(t, l2.v0 + (i === keepIdea ? 0.6 : 0), l2.v0 + (i === keepIdea ? 1.0 : 0.4))));
  });
  caps(arrive(ideas, 960, 860, P(1, 1).v0, { until: out1 }), 0, 0, 'small and specific: what the long tail needs', { size: 24, fill: color.text });

  // The idea we follow: from its builder's hand to the middle, where it tries to leave and can't.
  const C: [number, number] = [960, 440];
  const idea = named('the-idea', at(art));
  const tSay1 = k(P(1, 0), named3[keepIdea][2]);
  const ideaG = svg('g', {}, idea);
  mark(ideaG, 2, 0, 0, 1, color.orange);
  const tMove = l2.v0 + 0.1, tTry = k(P(2, 0), 0.6);
  const tBar = l3.v0;
  onFrame(t => {
    const u = eio(prog(t, tMove, tMove + 0.8));
    const hop = Math.sin(Math.PI * prog(t, tTry, tTry + 0.7));
    const b = eio(prog(t, tBar, tBar + 0.8));
    const x = 960 + (C[0] - 960) * u + 70 * hop + (290 - C[0]) * b;
    const y = 440 + (C[1] - 440) * u + (525 - C[1]) * b;
    const s = 1.2 - 0.5 * u - 0.2 * b;
    ideaG.setAttribute('transform', tf(x, y, Math.max(0.0001, s * eout(prog(t, tSay1, tSay1 + 0.45)))));
    vis(idea, 1 - prog(t, tBar + 0.6, tBar + 0.9));
  });
  // ... it can't travel on its own.
  const no = pop(art, 1080, 440, tTry + 0.35, { name: 'cant-travel', until: tTry + 1.4 });
  cross(no, 0, 0, 0.8);
  cue(tTry + 0.35, 'thud');

  // Pose 2: the shell, layer by layer, around the tiny idea; each layer drawn on as it's named. A
  // dashed outline shows the size it has to reach first ("a whole application").
  const shell = named('social-shell', at(art, C[0], C[1]));
  const layers = ['profiles & sign-up', 'feeds & threads', 'messages', 'notifications', 'roles', 'moderation', 'onboarding', 'design system', 'web & mobile apps'];
  const p22 = P(2, 2);
  const when = [0.33, 0.45, 0.55, 0.61, 0.66, 0.70, 0.75, 0.81, 0.89].map(f => k(p22, f));
  const W = (i: number) => 120 + (i + 1) * 150, H = (i: number) => 70 + (i + 1) * 62;
  const rect = (w: number, h: number) => `M ${-w / 2 + 14} ${-h / 2} H ${w / 2 - 14} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 14} V ${h / 2 - 14} Q ${w / 2} ${h / 2} ${w / 2 - 14} ${h / 2} H ${-w / 2 + 14} Q ${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - 14} V ${-h / 2 + 14} Q ${-w / 2} ${-h / 2} ${-w / 2 + 14} ${-h / 2} Z`;
  const tWhole = k(P(2, 1), 0.55);
  const whole = drawn(shell, rect(W(8), H(8)), tWhole, 0.8, { stroke: color.steel, 'stroke-width': 2, opacity: 0.5 });
  const dashed = svg('path', { d: rect(W(8), H(8)), fill: 'none', stroke: color.steel, 'stroke-width': 2, 'stroke-dasharray': '10 10', opacity: 0.5 }, shell);
  onFrame(t => {
    vis(whole, prog(t, tWhole, tWhole + 0.01) * (1 - prog(t, tWhole + 0.8, tWhole + 0.9)) * 0.5);
    vis(dashed, Math.min(prog(t, tWhole + 0.8, tWhole + 0.9), 1 - prog(t, when[8], when[8] + 0.3)) * 0.5);
  });
  cue(tWhole, 'slide');
  layers.forEach((s, i) => {
    const g = named(`layer-${i + 1}`, svg('g', {}, shell));
    drawn(g, rect(W(i), H(i)), when[i], 0.5, { stroke: color.steel, 'stroke-width': 2.5, opacity: 0.45 + i * 0.05 });
    caps(arrive(g, 0, -H(i) / 2 + 22, when[i] + 0.15, { from: [0, -10], dur: 0.4 }), 0, 0, s, { size: 15, fill: color.text3 });
    cue(when[i], 'tap', { i: i % 3 });
  });
  caps(arrive(shell, 0, 40, P(2, 0).v1, { from: [0, 8] }), 0, 0, 'the idea', { size: 14, fill: color.orange });
  const back = named('backend', at(art, 960, 930));
  const backIn = svg('g', {}, back);
  svg('rect', { x: -720, y: -60, width: 1440, height: 120, rx: 14, fill: color.steelDark, 'fill-opacity': 0.5, stroke: color.steel, 'stroke-width': 2.5 }, backIn);
  const p23 = P(2, 3);
  [-150, 50, 250, 450, 650].forEach((x, i) => {
    const s = pop(backIn, x, 0, k(p23, 0.45) + i * 0.1, { dur: 0.4 });
    svg('path', { d: glyph.server, transform: 'scale(0.7)', fill: 'none', stroke: color.steel, 'stroke-width': 3 }, s);
  });
  caps(backIn, -690, 10, 'servers · databases · hosting', { size: 18, fill: color.text2, anchor: 'start' });
  cue(k(p23, 0.2), 'thud');

  // Pose 3: the proportions. The whole stack squashes down into one bar; the idea is a sliver of it.
  const tSq = tBar;
  onFrame(t => {
    const rise = eout(prog(t, k(p23, 0.15), k(p23, 0.15) + 0.6));
    const u = eio(prog(t, tSq, tSq + 0.8));
    // Shell spans y 126–754 and the backend 870–990: squash both into the bar's band (y 470–580).
    shell.setAttribute('transform', `translate(${C[0]} ${(C[1] + (525 - C[1]) * u).toFixed(2)}) scale(${(1 - 0.05 * u).toFixed(4)} ${(1 - 0.83 * u).toFixed(4)})`);
    back.setAttribute('transform', `translate(960 ${(930 + 160 * (1 - rise) - 405 * u).toFixed(2)}) scale(${(1 - 0.03 * u).toFixed(4)} ${(1 - 0.08 * u).toFixed(4)})`);
    vis(back, Math.min(prog(t, k(p23, 0.15), k(p23, 0.15) + 0.3), 1 - prog(t, tSq + 0.4, tSq + 0.8)));
    vis(shell, 1 - prog(t, tSq + 0.4, tSq + 0.8));
  });
  const prop = named('proportions', at(art));
  const bar = svg('rect', { x: 260, y: 470, width: 1400, height: 110, rx: 12, fill: color.steelDark, 'fill-opacity': 0.6, stroke: color.steel, 'stroke-width': 3 }, prop);
  const sliver = named('idea-sliver', svg('rect', { x: 260, y: 470, width: 60, height: 110, rx: 12, fill: color.orange }, prop));
  onFrame(t => {
    vis(bar, prog(t, tSq + 0.4, tSq + 0.8));
    const w = eout(prog(t, tSq + 0.6, tSq + 1.1));
    sliver.setAttribute('width', (60 * w).toFixed(1));
    vis(sliver, clamp(w * 4));
  });
  cue(tSq + 0.7, 'one');
  caps(arrive(prop, 290, 440, tSq + 0.9), 0, 0, 'the idea', { size: 22, fill: color.orange });
  caps(arrive(prop, 1000, 640, P(3, 1).v0), 0, 0, 'the shell: everything else', { size: 26, fill: color.text2 });

  board(l1.v1, 'Three builders, each with a small, specific idea (orange) arriving as it\'s named: a fairer way to decide, a bioregion map, a planning game.');
  board(k(p22, 0.7), 'The map idea, tiny at the centre (it tried to leave alone and was crossed out); the dashed size of a whole app around it; the shell drawing on layer by layer as each part is named.');
  board(l2.v1, 'The full shell, nine layers deep, and beneath it a backend slab: servers, databases, hosting.');
  board(l3.v1, 'The whole stack squashed into one bar: a sliver of orange for the idea, the rest steel shell.');
});
