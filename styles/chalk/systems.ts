// Systems that light up: the brain (a network of cells inside a side-on outline) and a model's
// network. Each draws its unlit network in chalk and a lit copy in the aurora; light() sets how lit
// each cell and connection is, so a pulse, a spreading front or the whole can glow.
import { named, rng, set, svg } from '../../engine/index.ts';
import { group } from './figures.ts';
import { aurora } from './paint.ts';
import { color } from './tokens.ts';

type Pt = [number, number];

/** The brain's outline radius at angle th (unit scale, centre at the origin). */
function brainR(th: number): number {
  const s = Math.sin(th);
  const c = Math.cos(th);
  const a = 500;
  let b = 330;
  if (s > 0) b = 250 + 60 * Math.max(0, -c);
  if (c > 0 && s > 0) b *= 0.8;
  return 1 / Math.sqrt((c * c) / (a * a) + (s * s) / (b * b));
}

/** Places in the brain, in unit coordinates (k = 1, centre at the origin). */
export const brainSpots = {
  thalamus: [30, 60] as Pt,
  auditory: [-40, 150] as Pt,
  wernicke: [170, 100] as Pt,
  broca: [-290, 70] as Pt,
  motor: [-40, -190] as Pt,
  stem: [165, 400] as Pt,
};

export interface Brain {
  g: SVGGElement;
  /** Where a unit-coordinate spot sits in the parent's coordinates. */
  at(p: Pt): Pt;
  /** Light the network: f(x, y) in the parent's coordinates → 0..1 for each cell and connection. */
  light(f: (x: number, y: number) => number): void;
  /** The thalamus (dashed oval) and its lit dot. */
  thalamus: SVGGElement;
  thalamusDot: SVGCircleElement;
  /** The network groups, unlit and lit (to fade either as a whole). */
  mesh: SVGGElement;
  lit: SVGGElement;
}

/**
 * A side-on brain centred at (cx, cy) at scale k (k = 1 is about 1000 × 760): cerebrum, cerebellum,
 * brainstem, the lateral fissure, and a network of n cells in the cortex. `thalamus` draws the deep
 * relay as a dashed oval.
 */
export function brain(parent: Element, cx: number, cy: number, k: number, opts: { n?: number; seed?: number; thalamus?: boolean; name?: string } = {}): Brain {
  const g = named(opts.name ?? 'brain', group(parent));
  const sw = Math.max(1.5, 3 * Math.min(1, k * 1.3));
  const B = group(g, { stroke: color.ink, 'stroke-width': sw, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  svg('path', { d: `M${cx + 120 * k} ${cy + 180 * k} Q${cx + 150 * k} ${cy + 300 * k} ${cx + 120 * k} ${cy + 420 * k} L${cx + 210 * k} ${cy + 420 * k} Q${cx + 220 * k} ${cy + 300 * k} ${cx + 250 * k} ${cy + 200 * k}`, fill: color.bg }, B);
  svg('path', { d: `M${cx + 230 * k} ${cy + 190 * k} Q${cx + 300 * k} ${cy + 330 * k} ${cx + 430 * k} ${cy + 290 * k} Q${cx + 520 * k} ${cy + 250 * k} ${cx + 470 * k} ${cy + 150 * k} Z`, fill: color.bg }, B);
  let d = '';
  for (let i = 0; i <= 720; i++) {
    const th = (i / 720) * Math.PI * 2;
    const r = (brainR(th) + 6 * Math.sin(th * 34) + 4 * Math.sin(th * 71 + 1)) * k;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(th) * r).toFixed(1)} ${(cy + Math.sin(th) * r).toFixed(1)}`;
  }
  svg('path', { d: `${d}Z`, fill: color.bg }, B);
  svg('path', { d: `M${cx - 300 * k} ${cy + 120 * k} Q${cx - 120 * k} ${cy + 60 * k} ${cx + 160 * k} ${cy - 10 * k}`, 'stroke-width': sw * 0.8 }, B);

  const inside = (x: number, y: number) => Math.hypot(x - cx, y - cy) < brainR(Math.atan2(y - cy, x - cx)) * k * 0.93;
  const r = rng(opts.seed ?? 7);
  const pts: Pt[] = [];
  const n = opts.n ?? 260;
  while (pts.length < n) {
    const x = cx + (-490 + r() * 980) * k;
    const y = cy + (-330 + r() * 640) * k;
    if (inside(x, y)) pts.push([x, y]);
  }
  const grad = aurora(cx - 480 * k, cx + 480 * k);
  const mesh = group(g, { stroke: color.ink, 'stroke-width': 1, opacity: 0.25 });
  const lit = group(g, { stroke: grad, 'stroke-width': 1.8 * Math.max(0.7, k), filter: k > 0.3 ? 'url(#glow)' : '' });
  const items: { x: number; y: number; e: SVGElement }[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const near = pts.map((q, j) => [Math.hypot(q[0] - p[0], q[1] - p[1]), j] as const).sort((a, b) => a[0] - b[0]).slice(1, 4);
    for (const [, j] of near) {
      if (j < i) continue;
      const q = pts[j];
      svg('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1] }, mesh);
      items.push({ x: (p[0] + q[0]) / 2, y: (p[1] + q[1]) / 2, e: svg('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], opacity: 0 }, lit) });
    }
  }
  for (const p of pts) {
    svg('circle', { cx: p[0], cy: p[1], r: 2.5 * Math.max(0.6, k), fill: color.muted }, mesh);
    items.push({ x: p[0], y: p[1], e: svg('circle', { cx: p[0], cy: p[1], r: 4 * Math.max(0.6, k), fill: grad, stroke: 'none', opacity: 0 }, lit) });
  }
  const at = (p: Pt): Pt => [cx + p[0] * k, cy + p[1] * k];
  const th = at(brainSpots.thalamus);
  const thalamus = named('thalamus', group(g));
  svg('ellipse', { cx: th[0], cy: th[1], rx: 48 * k, ry: 30 * k, fill: color.card, stroke: color.ink, 'stroke-width': sw * 0.8, 'stroke-dasharray': `${7 * Math.max(k, 0.4)} ${6 * Math.max(k, 0.4)}` }, thalamus);
  const thalamusDot = svg('circle', { cx: th[0], cy: th[1], r: 9 * Math.max(k, 0.5), fill: color.a1, filter: 'url(#glow)', opacity: 0 }, thalamus);
  if (!opts.thalamus) thalamus.setAttribute('display', 'none');
  let last = '';
  return {
    g, at, thalamus, thalamusDot, mesh, lit,
    light(f) {
      let key = '';
      const vals = items.map(it => {
        const v = Math.max(0, Math.min(1, f(it.x, it.y)));
        const s = v < 0.004 ? '0' : v.toFixed(2);
        key += s;
        return s;
      });
      if (key === last) return;
      last = key;
      items.forEach((it, i) => it.e.setAttribute('opacity', vals[i]));
    },
  };
}

export interface ModelNet {
  g: SVGGElement;
  /** 0 = unlit, 1 = fully lit. */
  light(u: number): void;
  /** 0 = free, 1 = locked (dashed, greyed connections). */
  lock(u: number): void;
}

/** A model's network in a rounded box: six layers of five units, x/y top-left, w × h. */
export function modelNet(parent: Element, x: number, y: number, w: number, h: number, opts: { seed?: number; name?: string } = {}): ModelNet {
  const g = named(opts.name ?? 'model', group(parent));
  const r = rng(opts.seed ?? 3);
  const cols = 6;
  const rows = 5;
  const grad = aurora(x, x + w);
  svg('rect', { x, y, width: w, height: h, rx: 12, fill: color.card, stroke: color.ink, 'stroke-width': 2.5 }, g);
  const P = (c: number, rr: number): Pt => [x + w * (0.12 + (0.76 * c) / (cols - 1)), y + h * (0.15 + (0.7 * rr) / (rows - 1))];
  const base = group(g, { stroke: color.muted, 'stroke-width': 1.2, opacity: 0.6 });
  const lit = group(g, { stroke: grad, 'stroke-width': 1.8, filter: 'url(#glow)', opacity: 0 });
  for (let c = 0; c < cols - 1; c++) {
    for (let a = 0; a < rows; a++) {
      for (let b = 0; b < rows; b++) {
        if (r() < 0.45) {
          const A = P(c, a);
          const Bp = P(c + 1, b);
          svg('line', { x1: A[0], y1: A[1], x2: Bp[0], y2: Bp[1] }, base);
          svg('line', { x1: A[0], y1: A[1], x2: Bp[0], y2: Bp[1] }, lit);
        }
      }
    }
  }
  const nodes = group(g);
  const litNodes = group(g, { opacity: 0, filter: 'url(#glow)' });
  for (let c = 0; c < cols; c++) {
    for (let a = 0; a < rows; a++) {
      const A = P(c, a);
      svg('circle', { cx: A[0], cy: A[1], r: 6, fill: color.bg, stroke: color.ink, 'stroke-width': 2 }, nodes);
      svg('circle', { cx: A[0], cy: A[1], r: 6, fill: grad }, litNodes);
    }
  }
  return {
    g,
    light(u) {
      set(lit, { opacity: u.toFixed(3) });
      set(litNodes, { opacity: u.toFixed(3) });
    },
    lock(u) {
      set(base, { 'stroke-dasharray': u > 0.01 ? `${(8 - 6 * u).toFixed(2)} ${(5 * u).toFixed(2)}` : 'none' });
    },
  };
}
