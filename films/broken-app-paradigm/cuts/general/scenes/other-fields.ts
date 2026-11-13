// Scene 8: other software got smaller pieces. Games with mods, music software with plugins, websites
// with themes and plugins; then the shared pattern: a small core, and pieces anyone can build.
import { board, defineScene, named, svg } from '../../../../../engine/index.ts';
import { at, caps, color, pose } from '../../../../../styles/coasys/index.ts';

export default defineScene('other-fields', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1);
  const piece = (p: Element, x: number, y: number, w = 70, h = 46) =>
    svg('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 8, fill: color.surface2, stroke: color.text2, 'stroke-width': 2.5 }, p);

  const fields = named('other-fields', at(art));
  const panels: [string, number][] = [['games + mods', 360], ['music + plugins', 960], ['websites + plugins', 1560]];
  for (const [label, x] of panels) {
    const g = at(fields, x, 500);
    svg('rect', { x: -150, y: -110, width: 300, height: 200, rx: 18, fill: color.surface, stroke: color.text, 'stroke-width': 3 }, g);
    for (let i = 0; i < 5; i++) piece(g, -160 + i * 80, 170, 64, 44);
    caps(g, 0, 280, label, { size: 22, fill: color.text });
  }
  svg('path', { d: 'M 300 470 h 40 v -20 h 40 v 20 h 40 M 300 520 h 120', fill: 'none', stroke: color.text2, 'stroke-width': 4 }, fields);
  for (let i = 0; i < 5; i++) svg('rect', { x: 880 + i * 34, y: 430, width: 18, height: 120, rx: 4, fill: 'none', stroke: color.text2, 'stroke-width': 2.5 }, fields);
  svg('rect', { x: 1450, y: 420, width: 220, height: 30, rx: 4, fill: 'none', stroke: color.text2, 'stroke-width': 2.5 }, fields);
  caps(fields, 1560, 640, '≈ 4 in 10 websites', { size: 20, fill: color.orange });
  pose(fields, ctx.t0, l1.v0 + 0.2);

  const pattern = named('small-core-many-pieces', at(art, 960, 520));
  svg('rect', { x: -170, y: -100, width: 340, height: 200, rx: 22, fill: color.surface, stroke: color.text, 'stroke-width': 3 }, pattern);
  caps(pattern, 0, 10, 'small shared core', { size: 22, fill: color.text });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    piece(pattern, Math.cos(a) * 330, Math.sin(a) * 250);
  }
  caps(pattern, 0, 380, 'pieces anyone can build, that fit together', { size: 24, fill: color.text2 });
  pose(pattern, l1.v0, t1 + 1);

  board(ctx.line(0).v1, 'Three panels: a game with mods, music software with a rack of plugins, a website with themes and plugins ("around four in ten websites").');
  board(l1.v1, 'The pattern they share: a small core in the middle, ringed by many pieces anyone can build.');
});
