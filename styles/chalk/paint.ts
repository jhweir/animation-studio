// Shared paint: the aurora gradient, glow filters, spotlights, and words drawn in SVG or the text layer.
import { div, named, onFrame, svg, text, type Stage } from '../../engine/index.ts';
import { color } from './tokens.ts';

let defs: SVGDefsElement | undefined;
let n = 0;

export function mountPaint(stage: Stage): void {
  defs = stage.defs;
  const glow = (id: string, blur: number, double: boolean) => {
    const f = svg('filter', { id, filterUnits: 'userSpaceOnUse', x: -40000, y: -40000, width: 80000, height: 80000 }, defs);
    svg('feGaussianBlur', { stdDeviation: blur, result: 'b' }, f);
    const m = svg('feMerge', {}, f);
    svg('feMergeNode', { in: 'b' }, m);
    if (double) svg('feMergeNode', { in: 'b' }, m);
    svg('feMergeNode', { in: 'SourceGraphic' }, m);
  };
  glow('glow', 6, false);
  glow('glowBig', 14, true);
}

function needDefs(): SVGDefsElement {
  if (!defs) throw new Error('chalk: paint used before the style was mounted');
  return defs;
}

/**
 * The aurora (green → blue → purple) from (x1, y1) to (x2, y2), in the coordinates of the element
 * that uses it, so it moves and scales with that element's group. Span it across the whole system it
 * lights. Returns a `url(#…)` for fill or stroke.
 */
export function aurora(x1: number, x2: number, y1 = 0, y2 = 0): string {
  const id = `aurora-${n++}`;
  const g = svg('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1, y1, x2, y2 }, needDefs());
  svg('stop', { offset: '0%', 'stop-color': color.a1 }, g);
  svg('stop', { offset: '50%', 'stop-color': color.a2 }, g);
  svg('stop', { offset: '100%', 'stop-color': color.a3 }, g);
  return `url(#${id})`;
}

/** A soft white pool of light at (cx, cy), radius r, for fill. */
export function spot(cx: number, cy: number, r: number, strength = 0.13): string {
  const id = `spot-${n++}`;
  const g = svg('radialGradient', { id, gradientUnits: 'userSpaceOnUse', cx, cy, r }, needDefs());
  svg('stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': strength }, g);
  svg('stop', { offset: '100%', 'stop-color': '#fff', 'stop-opacity': 0 }, g);
  return `url(#${id})`;
}

/** A mask id from a builder that draws white (shown) and black (hidden) into it. */
export function mask(build: (m: SVGMaskElement) => void): string {
  const id = `mask-${n++}`;
  const m = svg('mask', { id, maskUnits: 'userSpaceOnUse', x: -40000, y: -40000, width: 80000, height: 80000 }, needDefs());
  build(m);
  return `url(#${id})`;
}

/** A tiling pattern in user space; draw into the returned element. Returns [url, pattern]. */
export function pattern(w: number, h: number): [string, SVGPatternElement] {
  const id = `pattern-${n++}`;
  const p = svg('pattern', { id, patternUnits: 'userSpaceOnUse', width: w, height: h }, needDefs());
  return [`url(#${id})`, p];
}

/** A bold, tracked, uppercase SVG label. */
export function label(parent: Element, x: number, y: number, s: string, opts: { color?: string; size?: number; anchor?: 'start' | 'middle' | 'end' } = {}): SVGTextElement {
  return text(parent, x, y, s.toUpperCase(), {
    fill: opts.color ?? color.muted, stroke: 'none', 'font-size': opts.size ?? 24, 'font-weight': 700, 'letter-spacing': '0.14em',
    'text-anchor': opts.anchor ?? 'start',
  });
}

/** Light SVG words (for words that live in the picture and move with it). */
export function words(parent: Element, x: number, y: number, s: string, opts: { color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number } = {}): SVGTextElement {
  return text(parent, x, y, s, {
    fill: opts.color ?? color.ink, stroke: 'none', 'font-size': opts.size ?? 50, 'font-weight': opts.weight ?? 300, 'text-anchor': opts.anchor ?? 'middle',
  });
}

/**
 * A caption in the text layer: one light line, rising in at `at`, out at `out`. Wrap words in <em>
 * to set them in the aurora.
 */
export function say(parent: HTMLElement, html: string, at: number, out: number, opts: { top?: number; name?: string; size?: number } = {}): HTMLDivElement {
  const e = named(opts.name ?? 'caption', div('say', parent, html));
  e.style.top = `${opts.top ?? 940}px`;
  if (opts.size) e.style.fontSize = `${opts.size}px`;
  onFrame(t => {
    const a = Math.min(1, Math.max(0, (t - at) / 0.6));
    const b = Math.min(1, Math.max(0, (out - t) / 0.4));
    const o = Math.min(a, b);
    e.style.opacity = o.toFixed(3);
    e.style.display = o <= 0.001 ? 'none' : '';
    e.style.transform = `translateY(${((1 - (1 - Math.pow(1 - a, 3))) * 18).toFixed(2)}px)`;
  });
  return e;
}

/** The film's title in the aurora, in the text layer. */
export function title(parent: HTMLElement, s: string, at: number, out: number, top = 860): HTMLDivElement {
  const e = named('title', div('title', parent, `<span>${s}</span>`));
  e.style.top = `${top}px`;
  onFrame(t => {
    const o = Math.min(Math.max(0, (t - at) / 1.0), Math.max(0, (out - t) / 0.6), 1);
    e.style.opacity = o.toFixed(3);
    e.style.display = o <= 0.001 ? 'none' : '';
  });
  return e;
}
