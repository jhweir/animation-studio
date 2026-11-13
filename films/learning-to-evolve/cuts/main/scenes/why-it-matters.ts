// Scene 7: seven communities pop up across the screen; links draw between them person to person as "the
// tools we think together with" is said, and small signals start running along them; then each community
// gets its own small loop turning, and the links brighten: the way we think together, evolving.
import { board, cue, defineScene, named, onFrame, prog, rng, svg, vis } from '../../../../../engine/index.ts';
import { color } from '../../../../../styles/coasys/index.ts';
import { at, community, drawn, hold, loop, popIn } from '../kit.ts';

export default defineScene('why-it-matters', ctx => {
  const { art, t1, t0 } = ctx;
  const l1 = ctx.line(1);
  const [together, shape] = [ctx.part(0, 1), ctx.part(0, 2)];
  const spots: [number, number, number][] = [[330, 330, 130], [800, 250, 110], [1300, 330, 140], [1640, 640, 110], [1100, 760, 150], [560, 760, 130], [220, 760, 90]];
  const web = named('communities', at(art));
  const links = named('links', svg('g', {}, web));
  const signals = named('signals', svg('g', {}, web));
  const r = rng(12);
  let n = 0;
  for (let i = 0; i < spots.length; i++) {
    for (let j = i + 1; j < spots.length; j++) {
      const [x0, y0] = spots[i], [x1, y1] = spots[j];
      if (Math.hypot(x1 - x0, y1 - y0) > 620) continue;
      for (let k = 0; k < 2; k++) {
        const a = r() * Math.PI * 2, b = r() * Math.PI * 2;
        const p0: [number, number] = [x0 + Math.cos(a) * 50, y0 + Math.sin(a) * 50], p1: [number, number] = [x1 + Math.cos(b) * 50, y1 + Math.sin(b) * 50];
        drawn(links, `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} L ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`, together.v0 + n * 0.05, { stroke: color.mint, 'stroke-width': 2 });
        if (n % 3 === 0) {
          const dot = svg('circle', { r: 5, fill: color.mint, filter: 'url(#glow)' }, signals);
          const phase = r(), speed = 0.35 + r() * 0.25;
          onFrame(t => {
            const f = (((t - shape.v0) * speed + phase) % 1 + 1) % 1;
            dot.setAttribute('cx', (p0[0] + (p1[0] - p0[0]) * f).toFixed(1));
            dot.setAttribute('cy', (p0[1] + (p1[1] - p0[1]) * f).toFixed(1));
            vis(dot, t < shape.v0 ? 0 : Math.sin(Math.PI * f) * prog(t, shape.v0, shape.v0 + 0.6));
          });
        }
        n++;
      }
    }
  }
  onFrame(t => links.setAttribute('opacity', (0.18 + 0.32 * prog(t, l1.v0, l1.v0 + 1.5)).toFixed(3)));
  cue(together.v0, 'mesh');
  spots.forEach(([x, y, rad], i) => {
    const g = named(`community-${i + 1}`, at(web));
    community(g, rad, Math.round(rad / 14), 20 + i);
    popIn(g, x, y, t0 + 0.1 + i * 0.15);
    const lp = named(`loop-${i + 1}`, at(g));
    svg('circle', { r: rad * 0.32, fill: color.page, opacity: 0.85 }, lp);
    loop(lp, rad * 0.22, { labels: false, width: 3, spin: 0.6 + i * 0.07, from: l1.v0, stroke: color.mint });
    popIn(lp, 0, 0, l1.v0 + 0.2 + i * 0.15);
  });
  cue(t0 + 0.1, 'pop');
  cue(l1.v0 + 0.2, 'shimmer');
  hold(web, t0, t1 + 1);

  board(together.v1, 'Seven communities across the screen, linked person to person by faint mint lines drawn between them: the tools we think together with.');
  board(shape.v1, 'Small signals run along the links: what we notice, understand and do together passes through these tools.');
  board(l1.v1, 'Each community now has its own small loop turning, and the links between them brighten.');
});
