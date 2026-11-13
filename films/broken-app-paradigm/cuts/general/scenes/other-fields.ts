// Scene 8: other software got smaller pieces. Games with mods, music software with plugins, websites
// with themes and plugins, each arriving as it's named, its pieces sliding up to plug in; then the
// shared pattern: the three cores merge into one small core and their pieces fly out to ring it.
import { board, clamp, cue, defineScene, eio, eout, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import { at, caps, color } from '../../../../../styles/coasys/index.ts';
import { arrive, pop } from '../kit.ts';

export default defineScene('other-fields', ctx => {
  const { art, t0 } = ctx;
  const l1 = ctx.line(1);
  const P = (i: number, j: number) => ctx.part(i, j);
  const k = (p: { v0: number; v1: number }, f: number) => p.v0 + (p.v1 - p.v0) * f;
  const piece = (p: Element, w = 70, h = 46) =>
    svg('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: color.surface2, stroke: color.text2, 'stroke-width': 2.5 }, p);

  const tMerge = l1.v0;
  const fields = named('other-fields', at(art));
  onFrame(t => vis(fields, 1 - prog(t, tMerge, tMerge + 0.5)));
  const panels: [string, number, number][] = [['games + mods', 360, P(0, 1).v0], ['music + plugins', 960, P(0, 2).v0], ['websites + plugins', 1560, P(0, 3).v0]];
  const glyphs = [
    (g: Element) => svg('path', { d: 'M -60 -30 h 40 v -20 h 40 v 20 h 40 M -60 20 h 120', fill: 'none', stroke: color.text2, 'stroke-width': 4 }, g),
    (g: Element) => { for (let i = 0; i < 5; i++) svg('rect', { x: -80 + i * 34, y: -70, width: 18, height: 120, rx: 4, fill: 'none', stroke: color.text2, 'stroke-width': 2.5 }, g); },
    (g: Element) => svg('rect', { x: -110, y: -80, width: 220, height: 30, rx: 4, fill: 'none', stroke: color.text2, 'stroke-width': 2.5 }, g),
  ];
  // Where each panel's five pieces sit: below it, then (after the merge) round the one core.
  const from: [number, number][] = [];
  panels.forEach(([label, x, a], pi) => {
    const g = pop(fields, x, 500, Math.max(t0 + 0.2, a - 0.2), { name: `panel-${label.split(' ')[0]}`, dur: 0.5 });
    svg('rect', { x: -150, y: -110, width: 300, height: 200, rx: 18, fill: color.surface, stroke: color.text, 'stroke-width': 3 }, g);
    glyphs[pi](g);
    caps(arrive(fields, x, 780, a + 0.3), 0, 0, label, { size: 22, fill: color.text });
    for (let i = 0; i < 5; i++) from.push([x - 160 + i * 80, 670]);
    cue(a, 'pop', { i: pi });
  });
  caps(arrive(fields, 1560, 830, k(P(0, 3), 0.62)), 0, 0, '≈ 4 in 10 websites', { size: 20, fill: color.orange });
  cue(k(P(0, 3), 0.62), 'one');

  // The one small shared core, where the three were.
  const pattern = named('small-core-many-pieces', at(art, 960, 520));
  const core = pop(pattern, 0, 0, tMerge + 0.2, { name: 'small-shared-core', dur: 0.5 });
  svg('rect', { x: -170, y: -100, width: 340, height: 200, rx: 22, fill: color.surface, stroke: color.text, 'stroke-width': 3 }, core);
  caps(core, 0, 10, 'small shared core', { size: 22, fill: color.text });
  cue(tMerge + 0.2, 'one');
  // Fifteen pieces: each slides up to plug into its panel when the panel is named; on the pattern
  // line they fly out to ring the core (one more is built there, by someone new).
  const ring = (i: number): [number, number] => {
    const a = (i / 14) * Math.PI * 2;
    return [960 + Math.cos(a) * 330, 520 + Math.sin(a) * 250];
  };
  const pieces = named('pieces', at(art));
  for (let i = 0; i < 15; i++) {
    const g = at(pieces, 0, 0, 1, `piece-${i + 1}`);
    piece(g, 64, 44);
    const [fx, fy] = from[i];
    const [rx, ry] = ring(i % 14);
    const born = panels[Math.floor(i / 5)][2] + 0.4 + (i % 5) * 0.12;
    const fly = tMerge + 0.3 + ((i * 5) % 14) * 0.06;
    onFrame(t => {
      const up = eout(prog(t, born, born + 0.5));
      const u = eio(prog(t, fly, fly + 0.8));
      const x = fx + (rx - fx) * u, y = fy + 60 * (1 - up) + (ry - fy) * u;
      g.setAttribute('transform', tf(x, y, 1 + 0.09 * u));
      // The fifteenth has no place on the ring: it fades as the others settle.
      vis(g, Math.min(prog(t, born, born + 0.3), i === 14 ? 1 - prog(t, fly, fly + 0.4) : 1));
    });
  }
  cue(tMerge + 0.4, 'mesh');
  caps(arrive(pattern, 0, 380, k(l1, 0.6)), 0, 0, 'pieces anyone can build, that fit together', { size: 24, fill: color.text2 });
  // "That fit together": the ring brightens once.
  const glow = svg('ellipse', { cx: 0, cy: 0, rx: 330, ry: 250, fill: 'none', stroke: color.text, 'stroke-width': 2, opacity: 0 }, pattern);
  const tFit = k(l1, 0.85);
  onFrame(t => vis(glow, Math.sin(Math.PI * clamp(prog(t, tFit, tFit + 0.85))) * 0.35));

  board(k(P(0, 3), 0.8), 'Three panels, each popping in as named: a game with mods, music software with a rack of plugins, a website with themes and plugins ("around four in ten websites"); each one\'s pieces have slid up beneath it.');
  board(l1.v1, 'The pattern they share: the three became one small core in the middle, their pieces flown out to ring it.');
});
