// Scene 8: back at the door with its slot, now seen from outside the whole structure: the camera
// pulls back to show the library behind the door glowing as one system; a card slides out; the title.
import { defineScene, eio, eout, named, onFrame, prog, rng, svg, vis } from '../../../../../engine/index.ts';
import { aurora, camera, card, color, group, place, sent, title } from '../../../../../styles/chalk/index.ts';

export default defineScene('close', ctx => {
  const { art, text, t1 } = ctx;
  const l0 = ctx.line(0);
  const s11 = sent(ctx, 1, 1);

  const world = named('outside', group(art));
  const grad = aurora(500, 1420);
  const shelves = group(world, { filter: 'url(#glow)' });
  const r = rng(2);
  const rows: { e: SVGRectElement; v: number }[] = [];
  for (let y = 120; y < 760; y += 26) {
    for (let x = 520; x < 1400; x += 90) {
      rows.push({ e: svg('rect', { x, y, width: 76, height: 10, fill: 'none', stroke: grad, 'stroke-width': 1.2 }, shelves), v: 0.12 + 0.3 * Math.abs(Math.sin(x * 0.02 + y * 0.03)) + 0.1 * r() });
    }
  }
  svg('rect', { x: 500, y: 100, width: 920, height: 680, fill: 'none', stroke: color.ink, 'stroke-width': 3 }, world);
  svg('line', { x1: -3000, y1: 780, x2: 5000, y2: 780, stroke: color.dim, 'stroke-width': 3 }, world);
  svg('rect', { x: 860, y: 400, width: 200, height: 380, fill: color.bg, stroke: color.ink, 'stroke-width': 3 }, world);
  svg('rect', { x: 920, y: 560, width: 80, height: 14, fill: color.bg, stroke: color.ink, 'stroke-width': 2.5 }, world);
  const out = card(world, 70, 44, 801);
  out.g.setAttribute('data-name', 'card-out');

  title(text, 'Where is the understanding?', s11.v1 - 0.5, t1 + 1, 940);

  onFrame(t => {
    // Start close on the door, pull back to the whole structure.
    const pull = eio(prog(t, l0.v0, s11.v0 + 1.5));
    camera(world, 960, 560 - 120 * pull, 2.4 * Math.pow(0.85 / 2.4, pull), 960, 520);
    vis(world, eout(prog(t, l0.v0 - 0.4, l0.v0 + 0.3)));
    const glowU = eio(prog(t, s11.v0, s11.v0 + 3));
    for (const row of rows) vis(row.e, row.v * (0.15 + 0.85 * glowU));
    const slide = eout(prog(t, s11.v0 + 2.0, s11.v0 + 3.0));
    place(out.g, 960, 567 + 60 * slide, 1, 4 * slide);
    vis(out.g, slide > 0 ? 1 : 0);
  });
});
