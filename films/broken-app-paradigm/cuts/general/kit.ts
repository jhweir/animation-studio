// Motion helpers for the general cut: pop-ins, arrivals, draw-ons, a zooming camera, and a few
// sketch pieces broken into parts so their parts can move on their own (a community's people, an
// app's features). Everything is driven from t in onFrame; build once, in setup.
import {
  clamp, drawOn, eback, eio, eout, f2, lerp, named, onFrame, prog, rng, strokePath, svg, tf, vis,
} from '../../../../engine/index.ts';
import { arrowHead, at, color, mark, membranePath, person, type El } from '../../../../styles/coasys/index.ts';

type XY = [number, number];

/** a + (b - a) * i / n: the i-th of n staggered times between a and b. */
export const stagger = (a: number, b: number, i: number, n: number): number => a + ((b - a) * i) / Math.max(1, n);

/** Opacity over a window: in over `fi` from a, out over `fo` before b (b = Infinity: stays). */
export function fade(e: Element, a: number, b = Infinity, fi = 0.45, fo = 0.35): void {
  onFrame(t => vis(e, Math.min(prog(t, a, a + fi), b === Infinity ? 1 : 1 - prog(t, b - fo, b))));
}

/**
 * A group at x, y that pops in at a (eback, `dur`) and, with `until`, fades out before then. Draw
 * into the returned group; the name goes on it.
 */
export function pop(parent: Element, x: number, y: number, a: number, o: { s?: number; dur?: number; name?: string; until?: number; out?: number } = {}): El {
  const outer = at(parent, x, y, 1, o.name);
  const inner = svg('g', {}, outer);
  const dur = o.dur ?? 0.45, s = o.s ?? 1, out = o.out ?? 0.35;
  onFrame(t => {
    const u = prog(t, a, a + dur);
    inner.setAttribute('transform', `scale(${Math.max(0.0001, eback(u) * s).toFixed(4)})`);
    const gone = o.until === undefined ? 0 : prog(t, o.until - out, o.until);
    vis(outer, Math.min(clamp(u * 3), 1 - gone));
  });
  return inner;
}

/** A group at x, y that arrives at a: slides in from an offset (eout, ~0.5 s) and fades up. */
export function arrive(parent: Element, x: number, y: number, a: number, o: { from?: XY; dur?: number; name?: string; until?: number; out?: number } = {}): El {
  const g = at(parent, x, y, 1, o.name);
  const [dx, dy] = o.from ?? [0, 24];
  const dur = o.dur ?? 0.5, out = o.out ?? 0.35;
  onFrame(t => {
    const u = eout(prog(t, a, a + dur));
    g.setAttribute('transform', tf(x + dx * (1 - u), y + dy * (1 - u)));
    const gone = o.until === undefined ? 0 : prog(t, o.until - out, o.until);
    vis(g, Math.min(prog(t, a, a + dur * 0.8), 1 - gone));
  });
  return g;
}

/** A line or curve drawn on from a over `dur`. */
export function drawn(parent: Element, d: string, a: number, dur = 0.5, attrs: Record<string, string | number> = {}): SVGPathElement {
  const p = strokePath(parent, d, { stroke: color.text2, 'stroke-width': 3, ...attrs });
  onFrame(t => drawOn(p, eio(prog(t, a, a + dur))));
  return p;
}

let maskN = 0;

/** An arrow (as sketch's `arrow`) drawn on from a over `dur`, its head arriving at the end. Dashes survive the draw-on. */
export function drawArrow(parent: Element, x1: number, y1: number, x2: number, y2: number, a: number, o: { stroke?: string; bend?: number; width?: number; dash?: string; dur?: number; name?: string } = {}): El {
  const g = svg('g', {}, parent);
  if (o.name) named(o.name, g);
  const stroke = o.stroke ?? color.text2, w = o.width ?? 4, dur = o.dur ?? 0.5;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = mx + (-(y2 - y1) / len) * (o.bend ?? 0), cy = my + ((x2 - x1) / len) * (o.bend ?? 0);
  const d = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  const id = `bap-arrow-${++maskN}`;
  const m = svg('mask', { id, maskUnits: 'userSpaceOnUse', x: -4000, y: -4000, width: 10000, height: 10000 }, g);
  const reveal = strokePath(m, d, { stroke: 'white', 'stroke-width': w + 8 });
  svg('path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', mask: `url(#${id})`, ...(o.dash ? { 'stroke-dasharray': o.dash } : {}) }, g);
  const head = svg('g', {}, g);
  const tx = x2 - cx, ty = y2 - cy, tl = Math.hypot(tx, ty) || 1;
  arrowHead(head, x2, y2, tx / tl, ty / tl, 9 + w, stroke);
  onFrame(t => {
    const u = eio(prog(t, a, a + dur));
    drawOn(reveal, u);
    vis(head, prog(t, a + dur * 0.75, a + dur));
  });
  return g;
}

/** Point i of 72 on a living membrane (as sketch's membranePath) and on a rounded square, blended by u. */
export function blobSquarePath(r: number, seed: number, half: number, u: number, wobble = 1): string {
  const rr = rng(seed);
  const off = Array.from({ length: 9 }, () => rr() * 0.08 - 0.04);
  let d = '';
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * 2 * Math.PI;
    let w = 0;
    for (let j = 0; j < 3; j++) w += off[j * 3] * Math.sin(a * (j + 2) + off[j * 3 + 1] * 40);
    const R = r * (1 + w * wobble);
    const c = Math.cos(a), s = Math.sin(a);
    // A squircle (|x|^8 + |y|^8 = half^8) reads as a square with soft corners.
    const q = half / Math.pow(Math.pow(Math.abs(c), 8) + Math.pow(Math.abs(s), 8), 1 / 8);
    const k = lerp(R, q, u);
    d += `${i ? 'L' : 'M'}${f2(k * c)} ${f2(k * s)}`;
  }
  return `${d}Z`;
}

export interface Crowd {
  g: El;
  ring: SVGPathElement;
  people: El[];
  spots: XY[];
}

/** A community (as sketch's `community`) whose membrane and people are separate, so they can move. */
export function crowd(parent: Element, r: number, n: number, seed = 1, o: { ring?: string; people?: string; pr?: number } = {}): Crowd {
  const g = svg('g', {}, parent);
  const ringColor = o.ring ?? color.mint;
  const ring = svg('path', { d: membranePath(r, seed), fill: ringColor, 'fill-opacity': 0.07, stroke: ringColor, 'stroke-width': 3 }, g);
  const pr = o.pr ?? Math.min(16, (r * 0.55) / Math.sqrt(n));
  const spots: XY[] = Array.from({ length: n }, (_, i) => {
    const a = i * Math.PI * (3 - Math.sqrt(5));
    const rad = r * 0.68 * Math.sqrt((i + 0.5) / n);
    return [rad * Math.cos(a), rad * Math.sin(a) - pr * 0.3];
  });
  const people = spots.map(([x, y]) => {
    const p = at(g, x, y);
    person(p, pr, o.people ?? color.inkFigure);
    return p;
  });
  return { g, ring, people, spots };
}

/** Pop a crowd's people in one by one between a and b (the membrane is the caller's). */
export function popPeople(c: Crowd, a: number, b: number, dur = 0.4): void {
  c.people.forEach((p, i) => {
    const s = stagger(a, b, i, c.people.length);
    const [x, y] = c.spots[i];
    onFrame(t => {
      const u = prog(t, s, s + dur);
      p.setAttribute('transform', tf(x, y, Math.max(0.0001, eback(u))));
      vis(p, clamp(u * 3));
    });
  });
}

export interface Box {
  g: El;
  frame: El;
  items: El[];
}

/** A sealed app (as sketch's `appBox`) with each feature in its own group, so features can pop. */
export function appParts(parent: Element, w: number, h: number, o: { parts?: ('plain' | 'idea' | 'bad')[]; seed?: number; stroke?: string } = {}): Box {
  const g = svg('g', {}, parent);
  const frame = svg('g', {}, g);
  const stroke = o.stroke ?? color.steel;
  svg('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: Math.min(w, h) * 0.1, fill: color.steelDark, 'fill-opacity': 0.45, stroke, 'stroke-width': 3 }, frame);
  const bar = -h / 2 + Math.max(14, h * 0.14);
  svg('line', { x1: -w / 2, y1: bar, x2: w / 2, y2: bar, stroke, 'stroke-width': 2, opacity: 0.7 }, frame);
  for (let i = 0; i < 3; i++) svg('circle', { cx: -w / 2 + 14 + i * 12, cy: (-h / 2 + bar) / 2, r: 3, fill: stroke, opacity: 0.7 }, frame);
  const parts = o.parts ?? ['plain', 'plain', 'plain', 'plain'];
  const cols = Math.ceil(Math.sqrt(parts.length * (w / h)));
  const rows = Math.ceil(parts.length / cols);
  const cw = w / (cols + 0.5), ch = (h - (bar + h / 2)) / (rows + 0.5);
  const r = rng(o.seed ?? 1);
  const s = Math.min(cw, ch) / 46;
  const items = parts.map((p, i) => {
    const cx = -w / 2 + cw * (0.75 + (i % cols)), cy = bar + ch * (0.75 + Math.floor(i / cols));
    const fill = p === 'idea' ? color.orange : p === 'bad' ? color.danger : 'none';
    const it = at(g, cx, cy);
    mark(it, Math.floor(r() * 4), 0, 0, s, fill, p === 'plain' ? stroke : fill);
    return it;
  });
  return { g, frame, items };
}

/** Pop each item of a list of groups (placed with `at`) in turn between a and b, keeping its place. */
export function popEach(items: El[], a: number, b: number, dur = 0.45): void {
  items.forEach((it, i) => {
    const base = it.getAttribute('transform') ?? '';
    const s = stagger(a, b, i, items.length);
    onFrame(t => {
      const u = prog(t, s, s + dur);
      it.setAttribute('transform', `${base} scale(${Math.max(0.0001, eback(u)).toFixed(4)})`);
      vis(it, clamp(u * 3));
    });
  });
}

/** A view of the world: the point shown at the stage centre, and the zoom. */
export type View = { x: number; y: number; s: number };

/**
 * The camera between keyed views: each key is [time it starts moving, time it arrives, view]. A move
 * that changes zoom is a pure zoom about the point both views share (so nothing drifts sideways),
 * with the zoom eased in log space; a move at one zoom is an eased pan.
 */
export function camera(keys: [number, number, View][], t: number, W = 1920, H = 1080): string {
  let v = keys[0][2];
  for (let k = 1; k < keys.length; k++) {
    const [a, b, n] = keys[k];
    if (t <= a) break;
    const u = eio(prog(t, a, b));
    if (Math.abs(n.s - v.s) < 1e-6) v = { x: lerp(v.x, n.x, u), y: lerp(v.y, n.y, u), s: v.s };
    else {
      const px = (v.s * v.x - n.s * n.x) / (v.s - n.s), py = (v.s * v.y - n.s * n.y) / (v.s - n.s);
      const s = Math.exp(lerp(Math.log(v.s), Math.log(n.s), u));
      // Screen position of the fixed point p stays put: W/2 + s (p - c) = W/2 + v.s (p - v.c).
      v = { x: px - (v.s * (px - v.x)) / s, y: py - (v.s * (py - v.y)) / s, s };
    }
  }
  return `translate(${f2(W / 2)} ${f2(H / 2)}) scale(${v.s.toFixed(5)}) translate(${f2(-v.x)} ${f2(-v.y)})`;
}

/** The zoom the camera shows at t (for fading detail in and out with the zoom). */
export function zoomAt(keys: [number, number, View][], t: number): number {
  let s = keys[0][2].s;
  for (let k = 1; k < keys.length; k++) {
    const [a, b, n] = keys[k];
    if (t <= a) break;
    s = Math.exp(lerp(Math.log(s), Math.log(n.s), eio(prog(t, a, b))));
  }
  return s;
}
