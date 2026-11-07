// Scene 3: the man's blank face and a question mark; the room mapped onto a chip (man → processor,
// book → memory, slot → input/output) with nobody home; then the room again, darkening to a
// spotlight on the man alone.
import { defineScene, drawOn, eio, eout, named, onFrame, prog, rng, strokePath, svg, vis } from '../../../../../engine/index.ts';
import { chip, color, glyph, group, label, room, seated, sent, spot, thought, words } from '../../../../../styles/chalk/index.ts';

export default defineScene('conclusion', ctx => {
  const { art } = ctx;
  const l0 = ctx.line(0);
  const l1 = ctx.line(1);
  const l2 = ctx.line(2);

  // The face.
  const face = named('face', group(art));
  svg('circle', { cx: 860, cy: 560, r: 200, fill: color.bg, stroke: color.ink, 'stroke-width': 4 }, face);
  svg('path', { d: 'M790 530 L820 530 M900 530 L930 530 M820 640 L900 640', stroke: color.ink, 'stroke-width': 5, 'stroke-linecap': 'round' }, face);
  const bub = named('thought', thought(art, 1270, 300, 150, 110, 1040, 470));
  const qm = words(bub, 1270, 340, '?', { size: 120 });
  const r = rng(4);
  const drift = Array.from({ length: 9 }, (_, i) => ({ g: glyph(art, 0, 0, 50, 300 + i, color.muted, 2), x: 260 + r() * 330, y: 200 + r() * 650, v: 10 + r() * 20 }));

  // The mapping.
  const map = named('mapping', group(art));
  const small = room(map, 180, 300, 0.55, { lamp: false, name: 'small-room' });
  small.g.removeAttribute('data-name');
  const c = named('chip', chip(map, 1450, 480, 1.3));
  const A = { stroke: color.muted, 'stroke-width': 2 };
  const arrows = [
    { p: strokePath(map, 'M360 480 Q900 300 1400 420', A), l: label(map, 900, 335, 'man → processor', { color: color.ink, anchor: 'middle', size: 22 }) },
    { p: strokePath(map, 'M500 545 Q950 640 1420 560', A), l: label(map, 950, 660, 'book → memory', { color: color.ink, anchor: 'middle', size: 22 }) },
    { p: strokePath(map, 'M180 520 Q700 900 1300 640', A), l: label(map, 700, 850, 'slot → input / output', { color: color.ink, anchor: 'middle', size: 22 }) },
  ];
  const home = named('nobody-home', thought(map, 1600, 230, 120, 80, 1500, 340, true));
  void c;

  // The room again, then the spotlight.
  const R = room(art, 620, 170, 1, { reader: true });
  const pool = named('spotlight', svg('circle', { cx: 960, cy: 600, r: 280, fill: spot(960, 600, 280, 0.16) }, art));
  const lit = seated(art, 920, 500);

  const s01 = sent(ctx, 0, 1);
  const s10 = sent(ctx, 1, 0);
  const s11 = sent(ctx, 1, 1);
  const s12 = sent(ctx, 1, 2);
  const s22 = sent(ctx, 2, 2);

  onFrame(t => {
    const faceOn = eout(prog(t, l0.v0 - 0.2, l0.v0 + 0.3)) * (1 - prog(t, l1.v0 - 0.2, l1.v0 + 0.3));
    vis(face, faceOn);
    vis(bub, faceOn * eout(prog(t, l0.v0 + 0.8, l0.v0 + 1.3)));
    vis(qm, 1);
    for (const d of drift) {
      d.g.setAttribute('transform', `translate(${d.x.toFixed(1)} ${(d.y - d.v * (t - l0.v0)).toFixed(1)}) scale(50)`);
      vis(d.g, faceOn * eout(prog(t, s01.v0, s01.v0 + 0.6)));
    }

    const mapOn = eout(prog(t, l1.v0, l1.v0 + 0.5)) * (1 - prog(t, l2.v0 - 0.2, l2.v0 + 0.3));
    vis(map, mapOn);
    arrows.forEach((a, i) => {
      const at = (i === 0 ? s10.v0 + 1.2 : s11.v0 + (i - 1) * 1.4);
      drawOn(a.p, eio(prog(t, at, at + 0.8)));
      vis(a.l, eout(prog(t, at + 0.5, at + 1.0)));
    });
    vis(home, eout(prog(t, s12.v0 + 0.8, s12.v0 + 1.3)));

    const roomOn = eout(prog(t, l2.v0, l2.v0 + 0.5));
    const dark = eio(prog(t, s22.v0 + 0.3, s22.v0 + 1.3));
    vis(R.g, roomOn * (1 - 0.82 * dark));
    vis(pool, roomOn * dark);
    vis(lit, roomOn * dark);
  });
});
