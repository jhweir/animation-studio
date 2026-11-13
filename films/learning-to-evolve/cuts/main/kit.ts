// Biology drawings for Learning to evolve: cells, bacteria, plasmids, the ladder of life's steps and a
// creature's head. The shared sketch pieces (loop, app boxes, communities, cartridges, the WE core,
// at/pose/travel/caps/marks) live in styles/coasys/sketch.ts and are re-exported here for the scenes.
import { clamp, drawOn, eback, eio, eout, named, onFrame, prog, strokePath, svg, tf, vis } from '../../../../engine/index.ts';
import { color, mark, moods, type El } from '../../../../styles/coasys/index.ts';

export {
  appBox, arrow, at, caps, cartridge, community, company, core, cross, loop, mark, mood, pose, tick, travel,
} from '../../../../styles/coasys/index.ts';

export function cell(parent: Element, r: number, traits: number[] = [], o: { stroke?: string; dead?: boolean } = {}): El {
  const g = svg('g', {}, parent);
  const stroke = o.stroke ?? moods.blueprint.ink;
  svg('circle', { r, fill: moods.blueprint.bg, stroke, 'stroke-width': 3, ...(o.dead ? { 'stroke-dasharray': '6 6', opacity: 0.5 } : {}) }, g);
  svg('circle', { cx: -r * 0.25, cy: -r * 0.2, r: r * 0.28, fill: 'none', stroke, 'stroke-width': 2, opacity: 0.6 }, g);
  const spots = traits.length > 1 ? [[r * 0.32, -r * 0.12], [r * 0.02, r * 0.42]] : [[r * 0.25, r * 0.28]];
  traits.forEach((k, i) => mark(g, k, spots[i % 2][0], spots[i % 2][1], r / 70, o.dead ? 'none' : color.orange, o.dead ? stroke : 'none'));
  return g;
}

/** A bacterium: a capsule of width w, with one trait. `striped` tells two lineages apart. */
export function bacterium(parent: Element, w: number, trait?: number, o: { striped?: boolean } = {}): El {
  const g = svg('g', {}, parent);
  const h = w * 0.42;
  svg('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: moods.blueprint.bg, stroke: moods.blueprint.ink, 'stroke-width': 3 }, g);
  if (o.striped) for (let i = -2; i <= 2; i++) svg('line', { x1: i * w * 0.14, y1: -h / 2 + 6, x2: i * w * 0.14, y2: h / 2 - 6, stroke: moods.blueprint.lines, 'stroke-width': 2, opacity: 0.4 }, g);
  if (trait != null) mark(g, trait, -w * 0.22, 0, w / 260, color.orange);
  return g;
}

/** A plasmid: the small ring of genes a bacterium passes sideways, carrying one trait. */
export function plasmid(parent: Element, r: number, trait: number): El {
  const g = svg('g', {}, parent);
  svg('circle', { r, fill: 'none', stroke: color.orange, 'stroke-width': 4 }, g);
  mark(g, trait, 0, 0, r / 26, color.orange);
  return g;
}

/** The ladder: two rails and rungs, numbered from the bottom. Returns the rung lines to light. */
export function ladder(parent: Element, h: number, w: number, rungs = 3, stroke: string = moods.blueprint.ink): { g: El; rungs: SVGLineElement[] } {
  const g = svg('g', {}, parent);
  for (const x of [-w / 2, w / 2]) svg('line', { x1: x, y1: -h / 2, x2: x, y2: h / 2, stroke, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.6 }, g);
  const out: SVGLineElement[] = [];
  for (let i = 0; i < rungs; i++) {
    const y = h / 2 - (h / (rungs + 1)) * (i + 1);
    out.push(svg('line', { x1: -w / 2, y1: y, x2: w / 2, y2: y, stroke, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.25 }, g));
  }
  return { g, rungs: out };
}

/** Light rung lines (and fade their labels in) at their times. */
export function lightRungs(rungs: SVGLineElement[], times: number[], lit: string): void {
  onFrame(t => rungs.forEach((r, i) => {
    const u = eout(prog(t, times[i], times[i] + 0.5));
    r.setAttribute('opacity', (0.25 + 0.75 * u).toFixed(3));
    r.setAttribute('stroke', u > 0.5 ? lit : moods.blueprint.ink);
  }));
}

/** A simple creature's head in profile, for learning. Its outline is a strokePath: draw it on with drawOn. */
export function head(parent: Element, s = 1): { g: El; outline: SVGPathElement } {
  const g = svg('g', { transform: tf(0, 0, s) }, parent);
  const outline = strokePath(g, 'M -70 70 C -100 10 -80 -90 10 -95 C 80 -98 110 -40 100 0 L 125 30 L 98 40 C 96 70 70 80 40 78 L 40 110', { stroke: moods.blueprint.ink, 'stroke-width': 4 });
  return { g, outline };
}

// ---- Motion helpers. Each registers its own onFrame; give an element to one of them only (nest groups
// to combine a move with a fade window).

type P = [number, number];
const fadeOutBy = (t: number, out?: number, len = 0.35): number => (out == null ? 1 : 1 - prog(t, out - len, out));

/** Pop e in at x, y (scale s) from time a with a small overshoot (eback, 0.45 s); fade it out before `out`. */
export function popIn(e: Element, x: number, y: number, a: number, o: { s?: number; out?: number; dur?: number; r?: number } = {}): void {
  const dur = o.dur ?? 0.45, s = o.s ?? 1;
  onFrame(t => {
    const u = prog(t, a, a + dur);
    e.setAttribute('transform', tf(x, y, s * Math.max(eback(u), 0.0001), o.r ?? 0));
    vis(e, Math.min(clamp(u * 3), fadeOutBy(t, o.out)));
  });
}

/** Slide e in to x, y from an offset (eout, 0.5 s), fading in; fade it out before `out`. */
export function arrive(e: Element, x: number, y: number, a: number, o: { dx?: number; dy?: number; s?: number; out?: number; dur?: number } = {}): void {
  const dur = o.dur ?? 0.5;
  onFrame(t => {
    const u = eout(prog(t, a, a + dur));
    e.setAttribute('transform', tf(x + (o.dx ?? 0) * (1 - u), y + (o.dy ?? 0) * (1 - u), o.s ?? 1));
    vis(e, Math.min(prog(t, a, a + dur * 0.7), fadeOutBy(t, o.out)));
  });
}

/** A stroked path drawn on from a over `dur` (eout); fades out before `out`. */
export function drawn(parent: Element, d: string, a: number, attrs: Record<string, string | number> = {}, o: { dur?: number; out?: number } = {}): SVGPathElement {
  const p = strokePath(parent, d, attrs);
  const dur = o.dur ?? 0.5;
  onFrame(t => {
    drawOn(p, eout(prog(t, a, a + dur)));
    p.setAttribute('stroke-opacity', fadeOutBy(t, o.out).toFixed(3));
  });
  return p;
}

/** A point on the quadratic curve p0 → c → p1. */
export function quad(p0: P, c: P, p1: P, u: number): P {
  const v = 1 - u;
  return [v * v * p0[0] + 2 * v * u * c[0] + u * u * p1[0], v * v * p0[1] + 2 * v * u * c[1] + u * u * p1[1]];
}

/** An arrow whose shaft draws on from a (0.5 s) and whose head pops at the tip; fades out before `out`. */
export function drawArrow(parent: Element, x1: number, y1: number, x2: number, y2: number, a: number, o: { stroke?: string; bend?: number; width?: number; dur?: number; out?: number; name?: string } = {}): El {
  const g = svg('g', {}, parent);
  if (o.name) named(o.name, g);
  const stroke = o.stroke ?? color.text2, w = o.width ?? 4, dur = o.dur ?? 0.5;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = (x1 + x2) / 2 + (-(y2 - y1) / len) * (o.bend ?? 0), cy = (y1 + y2) / 2 + ((x2 - x1) / len) * (o.bend ?? 0);
  const shaft = strokePath(g, `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, { stroke, 'stroke-width': w });
  const k = 9 + w;
  const head = svg('path', { d: `M ${k} 0 L ${-k * 0.6} ${k * 0.7} L ${-k * 0.6} ${-k * 0.7} Z`, fill: stroke }, g);
  const deg = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
  onFrame(t => {
    const u = eout(prog(t, a, a + dur));
    drawOn(shaft, u);
    const h = eback(prog(t, a + dur * 0.8, a + dur * 0.8 + 0.3));
    head.setAttribute('transform', tf(x2, y2, Math.max(h, 0.0001), deg));
    vis(head, prog(t, a + dur * 0.8, a + dur * 0.8 + 0.1));
    vis(g, fadeOutBy(t, o.out));
  });
  return g;
}

/** Fly e along a quadratic curve between a and b (eio), scaling s0 → s1. Visible from `show` (default a). */
export function fly(e: Element, p0: P, c: P, p1: P, a: number, b: number, o: { s0?: number; s1?: number; show?: number; out?: number } = {}): void {
  const s0 = o.s0 ?? 1, s1 = o.s1 ?? s0, show = o.show ?? a;
  onFrame(t => {
    const u = eio(prog(t, a, b));
    const [x, y] = quad(p0, c, p1, u);
    e.setAttribute('transform', tf(x, y, s0 + (s1 - s0) * u));
    vis(e, Math.min(prog(t, show, show + 0.3), fadeOutBy(t, o.out)));
  });
}

/** A ring that swells and fades at time a (0.85 s): points at a station or an arrival. */
export function pulse(parent: Element, x: number, y: number, r: number, a: number, stroke: string, dur = 0.85): SVGCircleElement {
  const c = svg('circle', { cx: x, cy: y, r, fill: 'none', stroke, 'stroke-width': 4 }, parent);
  onFrame(t => {
    const u = prog(t, a, a + dur);
    c.setAttribute('r', (r * (1 + 0.7 * eout(u))).toFixed(2));
    vis(c, u <= 0 || u >= 1 ? 0 : (1 - u) * Math.min(1, u * 6));
  });
  return c;
}

/** Show e from a (its children make their own entrances) and fade it out over `out` seconds before b. */
export function hold(e: Element, a: number, b: number, out = 0.4): void {
  onFrame(t => vis(e, t < a ? 0 : 1 - prog(t, b - out, b)));
}
