// Scene 4: the one book on the desk becomes a wall of shelves, then the camera pulls back until the
// room is a speck in an endless library; a clock beat counts the years one word would take; back to
// the library, which lights up as the whole machine that's answering.
import { bump, defineScene, eio, eout, named, onFrame, prog, rng, set, svg, vis } from '../../../../../engine/index.ts';
import {
  aurora, camera, cameraPath, card, color, group, label, mask, pattern, room, sent, shelves, words,
} from '../../../../../styles/chalk/index.ts';

export default defineScene('scale', ctx => {
  const { art } = ctx;
  const l1 = ctx.line(1);
  const l2 = ctx.line(2);
  const s00 = sent(ctx, 0, 0);
  const s02 = sent(ctx, 0, 2);
  const s11 = sent(ctx, 1, 1);
  const s12 = sent(ctx, 1, 2);
  const s13 = sent(ctx, 1, 3);
  const s21 = sent(ctx, 2, 1);

  // The world: an endless wall of shelves (a pattern), the room cut into it, near shelves that
  // arrive one by one, and the same shelves again in the aurora (masked) for the end.
  const world = named('library', group(art));
  const tile = (into: SVGPatternElement, fill: string, stroke: string) => {
    const r = rng(3);
    let x = 0;
    while (x < 236) {
      const w = Math.min(10 + r() * 14, 240 - x);
      const h = 70 + r() * 20;
      svg('rect', { x, y: 90 - h, width: w - 1, height: h, fill, stroke, 'stroke-width': 1.5 }, into);
      x += w + 2;
    }
    svg('rect', { x: 0, y: 91, width: 240, height: 3, fill: stroke === 'none' ? fill : color.ink }, into);
  };
  const [wallUrl, wallPat] = pattern(240, 110);
  tile(wallPat, color.card, color.muted);
  const [whiteUrl, whitePat] = pattern(240, 110);
  tile(whitePat, '#fff', 'none');
  const big = { x: -60000, y: -40000, width: 120000, height: 80000 };
  const wall = svg('rect', { ...big, fill: wallUrl }, world);
  const glowMask = mask(m => svg('rect', { ...big, fill: whiteUrl }, m));
  const glow = svg('rect', { ...big, fill: aurora(-24000, 24000), mask: glowMask, opacity: 0 }, world);
  svg('rect', { x: 600, y: 150, width: 1040, height: 680, fill: color.bg }, world);
  const near = [
    shelves(world, 330, 170, 240, 6, 11), shelves(world, 1670, 170, 240, 6, 12),
    shelves(world, 70, 170, 240, 6, 13), shelves(world, 1930, 170, 240, 6, 14),
  ];
  const R = room(world, 620, 170, 1);

  // Screen-space marks for the wide shot.
  const speck = named('the-man', group(art));
  svg('circle', { cx: 960, cy: 540, r: 46, fill: 'none', stroke: color.ink, 'stroke-width': 2, 'stroke-dasharray': '4 6' }, speck);
  label(speck, 960, 630, 'the man', { color: color.ink, anchor: 'middle', size: 20 });
  const counts = named('counts', group(art));
  svg('rect', { x: 1240, y: 910, width: 650, height: 130, fill: color.bg, opacity: 0.85 }, counts);
  const c1 = label(counts, 1860, 960, '100,000,000,000 numbers', { color: color.ink, anchor: 'end', size: 30 });
  const c2 = label(counts, 1860, 1010, '40,000+ volumes', { anchor: 'end', size: 24 });

  // The clock beat.
  const clock = named('clock', group(art));
  const R2 = room(clock, 620, 230, 0.8, { name: 'room-small' });
  R2.g.removeAttribute('data-name');
  svg('circle', { cx: 1560, cy: 300, r: 110, fill: 'none', stroke: color.ink, 'stroke-width': 3 }, clock);
  const hand = svg('line', { x1: 1560, y1: 300, x2: 1560, y2: 210, stroke: color.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, clock);
  label(clock, 1560, 480, 'year', { anchor: 'middle' });
  const year = words(clock, 1560, 560, '1', { size: 80 });
  const word = card(clock, 220, 110, 77);
  word.g.setAttribute('transform', 'translate(360 655)');
  label(clock, 360, 760, 'one word', { anchor: 'middle', size: 22 });

  // Camera keys: [t, x, y, scale].
  const cx = 1120;
  const cy = 490;
  const keys: [number, number, number, number][] = [
    [s02.v0, cx, cy, 1],
    [s02.v0 + 2.6, cx, cy, 0.62],
    [l1.v0 + 0.4, cx, cy, 0.62],
    [s12.v1, cx, cy, 0.022],
  ];

  onFrame(t => {
    // Book bump on "Start with the book".
    const b = bump(prog(t, s00.v0, s00.v0 + 0.9));
    set(R.book, { transform: `translate(570 440) scale(${(1 + 0.3 * b).toFixed(3)})` });
    near.forEach((n, i) => vis(n, eout(prog(t, s02.v0 + 0.3 + i * 0.5, s02.v0 + 0.8 + i * 0.5))));
    vis(wall, eout(prog(t, l1.v0, l1.v0 + 1.5)));

    const clockOn = t >= s13.v0 - 0.2 && t < l2.v0 - 0.1;
    const [x, y, s] = t < l2.v0 ? cameraPath(keys, t, eio) : [cx, cy, 0.022];
    camera(world, x, y, s);
    vis(world, clockOn ? 0 : 1);
    vis(speck, (clockOn ? 0 : 1) * (s < 0.06 ? eout(prog(t, s12.v1 - 0.6, s12.v1)) : 0) * (t >= l2.v0 ? 1 : 1));
    vis(c1, eout(prog(t, s11.v0 + 0.3, s11.v0 + 0.8)));
    vis(c2, eout(prog(t, s12.v0 + 0.3, s12.v0 + 0.8)));
    vis(counts, (clockOn ? 0 : 1) * (1 - prog(t, l2.v0, l2.v0 + 0.4)));

    vis(clock, clockOn ? 1 : 0);
    const u = prog(t, s13.v0, s13.v1);
    set(hand, { transform: `rotate(${(u * 360 * 12).toFixed(1)} 1560 300)` });
    year.textContent = Math.round(1 + 3411 * eio(u)).toLocaleString('en-GB');
    word.glyphs.forEach((gl, i) => vis(gl, i === 0 ? prog(u, 0, 0.5) : i === 1 ? 0.35 * prog(u, 0.5, 1) : 0));

    set(glow, { opacity: (0.32 * eout(prog(t, s21.v0 + 1.0, s21.v0 + 3.0))).toFixed(3) });
  });
});
