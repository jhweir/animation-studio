// Scene 6: Searle's comeback. The library streams into the man's head as he stands in an open
// field: now he is the whole system. Inside his head, two layers behind one-way glass: the man,
// bored in English, and the process he runs, fluent in Chinese and lit as a whole.
import { bump, defineScene, drawOn, eio, eout, named, onFrame, prog, rng, set, strokePath, svg, vis } from '../../../../../engine/index.ts';
import { aurora, color, glyph, group, label, place, quad, sent, standing, words } from '../../../../../styles/chalk/index.ts';

export default defineScene('comeback', ctx => {
  const { art } = ctx;
  const l0 = ctx.line(0);
  const l1 = ctx.line(1);
  const l2 = ctx.line(2);
  const S = (i: number, j: number) => sent(ctx, i, j);

  // The field.
  const field = named('field', group(art));
  svg('line', { x1: 0, y1: 880, x2: 1920, y2: 880, stroke: color.dim, 'stroke-width': 3 }, field);
  standing(field, 960, 880, 420);
  const headAt: [number, number] = [960, 498];
  const r = rng(8);
  const books = Array.from({ length: 44 }, (_, i) => {
    const g = group(field);
    svg('rect', { x: -20, y: -27, width: 40, height: 54, rx: 3, fill: color.card, stroke: color.ink, 'stroke-width': 2 }, g);
    return { g, from: [120 + r() * 400, -60 - r() * 200] as [number, number], ctl: [500 + r() * 300, 80 + r() * 200] as [number, number], rot: (r() - 0.5) * 120, i };
  });
  const sys = named('whole-system', group(field));
  svg('circle', { cx: 960, cy: 670, r: 260, fill: 'none', stroke: color.ink, 'stroke-width': 2, 'stroke-dasharray': '6 8' }, sys);
  label(sys, 960, 980, 'the whole system', { color: color.ink, anchor: 'middle' });
  const still = words(field, 1060, 470, '?', { size: 80 });

  // Inside the head.
  const inside = named('inside-head', group(art));
  svg('circle', { cx: 960, cy: 540, r: 380, fill: color.bg, stroke: color.ink, 'stroke-width': 4 }, inside);
  const top = group(inside);
  label(top, 960, 225, 'the man: English, bored', { anchor: 'middle', size: 20 });
  const thoughts = ['milk, eggs, bread', 'is it lunch yet?', '(yawn)'].map((s, i) => words(top, 960, 300 + i * 60, s, { size: 40 }));
  const glass = strokePath(inside, 'M600 520 L1320 520', { stroke: color.ink, 'stroke-width': 2, 'stroke-dasharray': '14 10' });
  const glassLabel = label(inside, 1340, 528, 'one-way glass', { size: 18 });
  const proc = named('process', group(inside, { filter: 'url(#glow)' }));
  const grad = aurora(640, 1280);
  const rg = rng(14);
  const gl: SVGGElement[] = [];
  for (let i = 0; i < 60 && gl.length < 34; i++) {
    const x = 650 + rg() * 600;
    const y = 560 + rg() * 280;
    if (Math.hypot(x + 19 - 960, y + 19 - 540) > 350) continue;
    gl.push(glyph(proc, x, y, 38, 600 + i, grad, 2.4));
  }
  const procLabel = label(inside, 960, 880, 'the process: fluent Chinese', { anchor: 'middle', size: 20 });
  const looks = [860, 960, 1060].map(x => strokePath(inside, `M${x} 470 L${x} 512`, { stroke: color.muted, 'stroke-width': 3 }));

  onFrame(t => {
    // The field and the books.
    const fieldOn = eout(prog(t, l0.v0 - 0.2, l0.v0 + 0.4)) * (1 - prog(t, l1.v0 + 0.2, l1.v0 + 0.8));
    vis(field, fieldOn);
    const s01 = S(0, 1);
    for (const b of books) {
      const u = eio(prog(t, s01.v0 + b.i * 0.08, s01.v0 + 1.6 + b.i * 0.08));
      const p = quad(b.from, b.ctl, headAt, u);
      place(b.g, p[0], p[1], 1 - 0.75 * u, b.rot * (1 - u));
      vis(b.g, u > 0 && u < 0.99 ? 1 : 0);
    }
    vis(sys, eout(prog(t, S(0, 2).v0, S(0, 2).v0 + 0.5)));
    vis(still, eout(prog(t, S(0, 3).v0 + 0.3, S(0, 3).v0 + 0.8)));

    // Inside.
    const inOn = eout(prog(t, l1.v0 + 0.4, l1.v0 + 1.0));
    vis(inside, inOn);
    set(inside, { transform: `translate(960 540) scale(${(0.6 + 0.4 * eio(prog(t, l1.v0 + 0.3, l1.v0 + 1.2))).toFixed(4)}) translate(-960 -540)` });
    drawOn(glass, eio(prog(t, S(1, 1).v0, S(1, 1).v0 + 0.9)));
    vis(glassLabel, eout(prog(t, S(1, 1).v0 + 0.7, S(1, 1).v0 + 1.2)));
    vis(top, eout(prog(t, S(1, 2).v0, S(1, 2).v0 + 0.5)));
    thoughts.forEach((e, i) => vis(e, eout(prog(t, S(1, 2).v0 + 0.3 + i * 0.6, S(1, 2).v0 + 0.8 + i * 0.6))));
    const s13 = S(1, 3);
    gl.forEach((g, i) => vis(g, eout(prog(t, s13.v0 + i * 0.05, s13.v0 + 0.5 + i * 0.05))));
    vis(procLabel, eout(prog(t, s13.v0 + 1.0, s13.v0 + 1.5)));
    const flare = bump(prog(t, S(2, 1).v0, S(2, 1).v0 + 2.0));
    set(proc, { opacity: (0.8 + 0.2 * flare).toFixed(3), filter: flare > 0.3 ? 'url(#glowBig)' : 'url(#glow)' });
    looks.forEach((p, i) => drawOn(p, eout(prog(t, l2.v0 + 0.3 + i * 0.2, l2.v0 + 0.8 + i * 0.2))));
  });
});
