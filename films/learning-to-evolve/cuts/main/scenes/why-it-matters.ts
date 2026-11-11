// Scene 7: many communities, linked person to person; then each one with its own small loop
// turning, and the links between them brighter: the way we think together, evolving.
import { board, defineScene, named, onFrame, prog, rng, svg } from '../../../../../engine/index.ts';
import { color } from '../../../../../styles/coasys/index.ts';
import { at, community, loop, pose } from '../kit.ts';

export default defineScene('why-it-matters', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1);
  const spots: [number, number, number][] = [[330, 330, 130], [800, 250, 110], [1300, 330, 140], [1640, 640, 110], [1100, 760, 150], [560, 760, 130], [220, 760, 90]];
  const web = named('communities', at(art));
  const links = svg('g', { stroke: color.mint, 'stroke-width': 2 }, web);
  const r = rng(12);
  for (let i = 0; i < spots.length; i++) {
    for (let j = i + 1; j < spots.length; j++) {
      const [x0, y0] = spots[i], [x1, y1] = spots[j];
      if (Math.hypot(x1 - x0, y1 - y0) > 620) continue;
      for (let k = 0; k < 2; k++) {
        const a = r() * Math.PI * 2, b = r() * Math.PI * 2;
        svg('line', { x1: x0 + Math.cos(a) * 50, y1: y0 + Math.sin(a) * 50, x2: x1 + Math.cos(b) * 50, y2: y1 + Math.sin(b) * 50 }, links);
      }
    }
  }
  onFrame(t => links.setAttribute('opacity', (0.18 + 0.32 * prog(t, l1.v0, l1.v0 + 1.5)).toFixed(3)));
  spots.forEach(([x, y, rad], i) => {
    const g = at(web, x, y);
    community(g, rad, Math.round(rad / 14), 20 + i);
    const lp = at(g);
    svg('circle', { r: rad * 0.32, fill: color.page, opacity: 0.85 }, lp);
    loop(lp, rad * 0.22, { labels: false, width: 3, spin: 0.6 + i * 0.07, from: l1.v0, stroke: color.mint });
    pose(lp, l1.v0 + i * 0.15, t1 + 1);
  });
  pose(web, ctx.t0, t1 + 1);

  board(ctx.line(0).v1, 'Seven communities across the screen, linked person to person by faint mint lines: the tools we think together with.');
  board(l1.v1, 'Each community now has its own small loop turning, and the links between them brighten.');
});
