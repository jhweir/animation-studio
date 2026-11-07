// The chalk vocabulary: glyphs and cards, people, the room, a chip, a neuron, shelves, bubbles, panels.
// Everything is drawn once at setup; scenes move and fade the groups these return.
import { named, rng, svg } from '../../engine/index.ts';
import { color } from './tokens.ts';

type Pt = [number, number];
const INK = { stroke: color.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' } as const;

/** A group with optional attributes. */
export function group(parent: Element, attrs: Record<string, string | number> = {}): SVGGElement {
  return svg('g', attrs, parent);
}

/**
 * An abstract glyph: three to five strokes in a box of size s at (x, y), never a real character.
 * The same seed always draws the same glyph.
 */
export function glyph(parent: Element, x: number, y: number, s: number, seed: number, stroke: string = color.ink, sw = 2.4): SVGGElement {
  const r = rng(seed);
  const q = group(parent, { transform: `translate(${x} ${y}) scale(${s})`, stroke, 'stroke-width': sw / s, fill: 'none', 'stroke-linecap': 'round' });
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(r() * 5);
    const a = r();
    const b = r();
    if (k === 0) svg('line', { x1: 0.1, y1: 0.15 + a * 0.7, x2: 0.9, y2: 0.15 + a * 0.7 }, q);
    else if (k === 1) svg('line', { x1: 0.15 + a * 0.7, y1: 0.1, x2: 0.15 + a * 0.7, y2: 0.9 }, q);
    else if (k === 2) svg('path', { d: `M${0.2 + a * 0.3} 0.2 L${0.5 + b * 0.3} 0.8` }, q);
    else if (k === 3) svg('path', { d: `M0.15 ${0.3 + a * 0.4} q0.35 -0.25 0.7 0` }, q);
    else svg('rect', { x: 0.25 + a * 0.2, y: 0.25 + b * 0.2, width: 0.3, height: 0.3 }, q);
  }
  return q;
}

/**
 * A slip of paper w × h, centred on its group's origin, with a row of glyphs. Returns the group
 * (move it with place()) and its glyph groups (to write them on one by one).
 */
export function card(parent: Element, w: number, h: number, seed: number): { g: SVGGElement; glyphs: SVGGElement[] } {
  const g = group(parent);
  svg('rect', { x: -w / 2, y: -h / 2, width: w, height: h, fill: color.card, stroke: color.ink, 'stroke-width': 2.5, rx: 3 }, g);
  const n = Math.max(1, Math.floor(w / (h * 0.55)));
  const cell = (w * 0.84) / n;
  const gs = Math.min(h * 0.55, cell * 0.9);
  const glyphs = Array.from({ length: n }, (_, i) => glyph(g, -w / 2 + w * 0.08 + i * cell + (cell - gs) / 2, -gs / 2, gs, seed + i, color.ink, 2));
  return { g, glyphs };
}

/** A standing figure, feet at (x, y), height h. */
export function standing(parent: Element, x: number, y: number, h: number): SVGGElement {
  const q = group(parent, INK);
  const hr = h * 0.09;
  svg('circle', { cx: x, cy: y - h + hr, r: hr, fill: color.bg }, q);
  svg('path', {
    d: `M${x} ${y - h + 2 * hr} L${x} ${y - h * 0.42} M${x} ${y - h * 0.42} L${x - h * 0.1} ${y} M${x} ${y - h * 0.42} L${x + h * 0.1} ${y} `
      + `M${x} ${y - h * 0.72} L${x - h * 0.14} ${y - h * 0.5} M${x} ${y - h * 0.72} L${x + h * 0.14} ${y - h * 0.5}`,
  }, q);
  return q;
}

/** A seated figure facing right, head centre at (x, y), with its chair. Arm reaches to (x + 190s, y + 120s). */
export function seated(parent: Element, x: number, y: number, s = 1): SVGGElement {
  const q = group(parent, { ...INK, transform: `translate(${x} ${y}) scale(${s})`, 'stroke-width': 3 / s });
  svg('circle', { cx: 0, cy: 0, r: 38, fill: color.bg }, q);
  svg('path', { d: 'M-10 40 Q-40 130 -20 210 L70 210 L80 310 M-5 80 Q60 110 190 120' }, q);
  svg('path', { d: 'M-60 215 L30 215 M-50 215 L-50 310 M20 215 L20 310' }, q);
  return q;
}

/** A lying figure on a bed, head at (x, y), length 700s. */
export function sleeper(parent: Element, x: number, y: number, s = 1): SVGGElement {
  const q = group(parent, { ...INK, transform: `translate(${x} ${y}) scale(${s})`, 'stroke-width': 3 / s });
  svg('path', { d: 'M-130 110 L670 110 M-110 110 L-110 190 M650 110 L650 190' }, q);
  svg('rect', { x: -110, y: 50, width: 180, height: 60, rx: 20, fill: color.card }, q);
  svg('path', { d: 'M50 40 Q270 10 610 50' }, q);
  svg('circle', { cx: 0, cy: 0, r: 46, fill: color.bg }, q);
  svg('path', { d: 'M-18 -4 Q-10 2 -2 -4 M8 -4 Q16 2 24 -4' }, q);
  return q;
}

/** An open book, centred at (x, y), width 200s. */
export function book(parent: Element, x: number, y: number, s = 1): SVGGElement {
  const q = group(parent, { ...INK, transform: `translate(${x} ${y}) scale(${s})`, 'stroke-width': 3 / s });
  svg('path', { d: 'M-100 28 L-90 0 Q-40 -10 0 6 Q40 -10 90 0 L100 28 Z M0 6 L0 28', fill: color.bg }, q);
  return q;
}

export interface Room {
  g: SVGGElement;
  /** The cone of lamplight. */
  light: SVGPathElement;
  man: SVGGElement;
  book: SVGGElement;
  /** The stack of answered cards on the desk. */
  stack: SVGGElement;
  reader?: SVGGElement;
  /** Points in stage coordinates (for cards travelling in and out). */
  at: { slot: Pt; desk: Pt; outDesk: Pt; hand: Pt; head: Pt; book: Pt };
}

/**
 * The room in cutaway, 1000 × 640 at scale s, top-left at (x, y): a door with its slot in the left
 * wall, a lamp, a desk with the book, the man seated. `reader` adds the native speaker outside.
 */
export function room(parent: Element, x: number, y: number, s = 1, opts: { lamp?: boolean; reader?: boolean; man?: boolean; name?: string } = {}): Room {
  const g = named(opts.name ?? 'room', group(parent, { transform: `translate(${x} ${y}) scale(${s})` }));
  const S = { ...INK, 'stroke-width': 3 / s };
  const light = svg('path', { d: 'M515 190 L380 470 L760 470 L605 190 Z', fill: '#fff', opacity: opts.lamp === false ? 0 : 0.06 }, g);
  const r = group(g, S);
  svg('rect', { x: 0, y: 0, width: 1000, height: 640 }, r);
  svg('rect', { x: -8, y: 220, width: 16, height: 420, fill: color.bg }, r);
  svg('rect', { x: -12, y: 380, width: 24, height: 60, fill: color.bg }, r);
  if (opts.lamp !== false) {
    svg('line', { x1: 560, y1: 0, x2: 560, y2: 150 }, r);
    svg('path', { d: 'M515 190 L535 150 L585 150 L605 190 Z' }, r);
  }
  svg('path', { d: 'M340 470 L800 470 M370 470 L370 638 M770 470 L770 638' }, r);
  const bk = named('book', book(g, 570, 440, 1));
  const stack = group(g, S);
  for (let i = 0; i < 4; i++) svg('rect', { x: 700, y: 456 - i * 6, width: 60, height: 10, fill: color.bg }, stack);
  const man = named('man', seated(g, 300, 330));
  if (opts.man === false) man.setAttribute('display', 'none');
  let reader: SVGGElement | undefined;
  if (opts.reader) {
    reader = named('reader', group(g, { transform: 'translate(-290 638)' }));
    standing(reader, 0, 0, 370);
  }
  const P = (px: number, py: number): Pt => [x + px * s, y + py * s];
  return { g, light, man, book: bk, stack, reader, at: { slot: P(0, 410), desk: P(470, 455), outDesk: P(700, 430), hand: P(-150, 400), head: P(300, 330), book: P(570, 440) } };
}

/** A microchip centred at (x, y), 250 × 250 at scale s. */
export function chip(parent: Element, x: number, y: number, s = 1): SVGGElement {
  const q = group(parent, { ...INK, transform: `translate(${x} ${y}) scale(${s})`, 'stroke-width': 3 / s });
  svg('rect', { x: -100, y: -100, width: 200, height: 200, rx: 10, fill: color.card }, q);
  for (let i = -80; i <= 80; i += 32) {
    svg('line', { x1: i, y1: -100, x2: i, y2: -125 }, q);
    svg('line', { x1: i, y1: 100, x2: i, y2: 125 }, q);
    svg('line', { x1: -100, y1: i, x2: -125, y2: i }, q);
    svg('line', { x1: 100, y1: i, x2: 125, y2: i }, q);
  }
  svg('rect', { x: -55, y: -55, width: 110, height: 110, stroke: color.muted }, q);
  return q;
}

/** A neuron centred at (x, y): a cell body, dendrites and an axon running right. */
export function neuron(parent: Element, x: number, y: number, s = 1, seed = 5, stroke: string = color.ink): SVGGElement {
  const q = group(parent, { ...INK, stroke, transform: `translate(${x} ${y}) scale(${s})`, 'stroke-width': 3 / s });
  svg('circle', { cx: 0, cy: 0, r: 28, fill: color.card }, q);
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const l = 70 + r() * 50;
    svg('path', { d: `M${Math.cos(a) * 28} ${Math.sin(a) * 28} Q${Math.cos(a + 0.3) * l * 0.6} ${Math.sin(a + 0.3) * l * 0.6} ${Math.cos(a) * l} ${Math.sin(a) * l}` }, q);
  }
  svg('path', { d: 'M28 10 Q120 40 220 20' }, q);
  return q;
}

/** A padlock centred at (x, y). */
export function lock(parent: Element, x: number, y: number, s = 1): SVGGElement {
  const q = group(parent, { ...INK, stroke: color.muted, transform: `translate(${x} ${y}) scale(${s})`, 'stroke-width': 3 / s });
  svg('rect', { x: -16, y: -4, width: 32, height: 26, rx: 4, fill: color.card }, q);
  svg('path', { d: 'M-10 -4 L-10 -14 Q0 -30 10 -14 L10 -4' }, q);
  return q;
}

/** A speech bubble with a tail on the left or right. */
export function bubble(parent: Element, x: number, y: number, w: number, h: number, tail: 'left' | 'right' = 'left'): SVGGElement {
  const q = group(parent, INK);
  svg('rect', { x, y, width: w, height: h, rx: 26, fill: color.card }, q);
  const tx = tail === 'left' ? x + 40 : x + w - 40;
  svg('path', { d: `M${tx - 14} ${y + h - 1} L${tx + (tail === 'left' ? -24 : 24)} ${y + h + 30} L${tx + 14} ${y + h - 1}`, fill: color.card }, q);
  return q;
}

/** A thought bubble (ellipse with two trailing dots) whose tail points to (tx, ty). */
export function thought(parent: Element, cx: number, cy: number, rx: number, ry: number, tx: number, ty: number, dashed = false): SVGGElement {
  const q = group(parent, { ...INK, ...(dashed ? { 'stroke-dasharray': '10 10' } : {}) });
  svg('ellipse', { cx, cy, rx, ry, fill: color.card }, q);
  svg('circle', { cx: tx + (cx - tx) * 0.45, cy: ty + (cy - ty) * 0.45, r: 16, fill: color.card }, q);
  svg('circle', { cx: tx + (cx - tx) * 0.18, cy: ty + (cy - ty) * 0.18, r: 9, fill: color.card }, q);
  return q;
}

/** A rounded panel frame (for side-by-side comparisons) with an optional caption label below. */
export function panel(parent: Element, x: number, y: number, w: number, h: number): SVGGElement {
  const q = group(parent);
  svg('rect', { x, y, width: w, height: h, rx: 14, fill: 'none', stroke: color.dim, 'stroke-width': 2 }, q);
  return q;
}

/** A head in profile facing right; (x, y) is the top of the skull, about 560s tall. */
export function headProfile(parent: Element, x: number, y: number, s = 1): SVGPathElement {
  const d = `M${x} ${y} C${x + 230 * s} ${y - 10 * s} ${x + 330 * s} ${y + 140 * s} ${x + 300 * s} ${y + 280 * s} L${x + 340 * s} ${y + 360 * s} L${x + 300 * s} ${y + 380 * s} `
    + `L${x + 300 * s} ${y + 440 * s} Q${x + 250 * s} ${y + 480 * s} ${x + 180 * s} ${y + 470 * s} L${x + 170 * s} ${y + 560 * s} `
    + `M${x} ${y} C${x - 200 * s} ${y + 10 * s} ${x - 260 * s} ${y + 200 * s} ${x - 180 * s} ${y + 360 * s} Q${x - 140 * s} ${y + 430 * s} ${x - 110 * s} ${y + 560 * s}`;
  return svg('path', { d, ...INK }, parent);
}

/**
 * A bookshelf seen from the front: `rows` shelves of spines across width w from (x, y), each row
 * 110 tall. Returns the group.
 */
export function shelves(parent: Element, x: number, y: number, w: number, rows: number, seed: number): SVGGElement {
  const q = group(parent);
  const r = rng(seed);
  for (let row = 0; row < rows; row++) {
    const y0 = y + row * 110;
    let px = x;
    while (px < x + w - 12) {
      const bw = Math.min(10 + r() * 14, x + w - px);
      const bh = 70 + r() * 20;
      svg('rect', { x: px, y: y0 + 90 - bh, width: bw, height: bh, fill: color.card, stroke: color.muted, 'stroke-width': 1.5 }, q);
      px += bw + 2;
    }
    svg('line', { x1: x - 6, y1: y0 + 92, x2: x + w + 6, y2: y0 + 92, stroke: color.ink, 'stroke-width': 2 }, q);
  }
  return q;
}
