// Sketch vocabulary: the pieces Coasys films use to explain the app paradigm and its alternative,
// first drawn for storyboards. The loop (try, test, keep), sealed app boxes, communities, cartridges,
// the WE core, a company block, and small helpers to place, show, move, label and mark things.
// Everything is drawn centred on 0,0; place it with `at()`.
import {
  eio, named, onFrame, prog, rng, svg, text, tf, vis, win, type SceneContext,
} from '../../engine/index.ts';
import { cover } from './background.ts';
import { person, tileGlyphs } from './figures.ts';
import { color, font, moods } from './tokens.ts';

export type El = SVGGElement;

/** A group at x, y (scale s, rotation r), optionally named for the player. */
export function at(parent: Element, x = 0, y = 0, s = 1, name?: string, r = 0): El {
  const g = svg('g', { transform: tf(x, y, s, r) }, parent);
  return name ? named(name, g) : g;
}

/** Show e between a and b, fading in and out. */
export function pose(e: Element, a: number, b: number, fade = 0.45): void {
  onFrame(t => vis(e, win(t, a, b, fade, fade * 0.8)));
}

/** Move e from one place to another between a and b (eased), and keep it there. */
export function travel(e: Element, from: [number, number], to: [number, number], a: number, b: number, s = 1): void {
  onFrame(t => {
    const u = eio(prog(t, a, b));
    e.setAttribute('transform', tf(from[0] + (to[0] - from[0]) * u, from[1] + (to[1] - from[1]) * u, s));
  });
}

/** The scene's mood: problem (near-black), blueprint (navy with a grid) or ours (the page). */
export function mood(ctx: SceneContext, m: 'problem' | 'blueprint' | 'ours'): void {
  if (m === 'ours') return;
  cover(ctx.stage.background, { t0: ctx.t0, t1: ctx.t1, color: moods[m].bg, fadeIn: 0.3 });
  if (m === 'blueprint') {
    const g = svg('g', { stroke: moods.blueprint.lines, 'stroke-width': 1, opacity: 0.1 }, ctx.art);
    for (let x = 0; x <= ctx.stage.width; x += 60) svg('line', { x1: x, y1: 0, x2: x, y2: ctx.stage.height }, g);
    for (let y = 0; y <= ctx.stage.height; y += 60) svg('line', { x1: 0, y1: y, x2: ctx.stage.width, y2: y }, g);
  }
}

/** Bold spaced caps, the film's label voice. */
export function caps(parent: Element, x: number, y: number, s: string, o: { size?: number; fill?: string; anchor?: string; weight?: number } = {}): SVGTextElement {
  return text(parent, x, y, s.toUpperCase(), {
    fill: o.fill ?? color.text3, 'font-family': font.film, 'font-size': o.size ?? 24, 'font-weight': o.weight ?? 700,
    'letter-spacing': '0.1em', 'text-anchor': o.anchor ?? 'middle',
  });
}

/** A small shape: one of the four abstract marks, as a trait or a feature. */
export function mark(parent: Element, k: number, x: number, y: number, s: number, fill: string, stroke = 'none'): SVGPathElement {
  return svg('path', { d: tileGlyphs[k % 4], transform: tf(x, y, s), fill, stroke, 'stroke-width': 3 / s }, parent);
}

export function arrowHead(parent: Element, x: number, y: number, dx: number, dy: number, size: number, fill: string): void {
  const nx = -dy, ny = dx;
  const d = `M ${x + dx * size} ${y + dy * size} L ${x - dx * size * 0.6 + nx * size * 0.7} ${y - dy * size * 0.6 + ny * size * 0.7} L ${x - dx * size * 0.6 - nx * size * 0.7} ${y - dy * size * 0.6 - ny * size * 0.7} Z`;
  svg('path', { d, fill }, parent);
}

/** An arrow from (x1, y1) to (x2, y2), bowed by `bend` px. */
export function arrow(parent: Element, x1: number, y1: number, x2: number, y2: number, o: { stroke?: string; bend?: number; width?: number; dash?: string } = {}): El {
  const g = svg('g', {}, parent);
  const stroke = o.stroke ?? color.text2;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = mx + (-(y2 - y1) / len) * (o.bend ?? 0), cy = my + ((x2 - x1) / len) * (o.bend ?? 0);
  svg('path', { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, fill: 'none', stroke, 'stroke-width': o.width ?? 4, 'stroke-linecap': 'round', ...(o.dash ? { 'stroke-dasharray': o.dash } : {}) }, g);
  const tx = x2 - cx, ty = y2 - cy, tl = Math.hypot(tx, ty) || 1;
  arrowHead(g, x2, y2, tx / tl, ty / tl, 9 + (o.width ?? 4), stroke);
  return g;
}

/** A red cross: this one died, or this can't happen. */
export function cross(parent: Element, x: number, y: number, s = 1): El {
  const g = at(parent, x, y, s);
  svg('path', { d: 'M -14 -14 L 14 14 M 14 -14 L -14 14', stroke: color.danger, 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
  return g;
}

/** A check: kept. */
export function tick(parent: Element, x: number, y: number, s = 1, stroke: string = color.mint): El {
  const g = at(parent, x, y, s);
  svg('path', { d: 'M -14 0 L -4 10 L 15 -11', fill: 'none', stroke, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  return g;
}

/**
 * The loop: try, test, keep, round a circle of radius r, with arrows between the stations and a
 * bright dot that runs round it (`spin` sets turns per second; 0 holds it at the top).
 */
export function loop(parent: Element, r: number, o: { stroke?: string; labels?: boolean; width?: number; spin?: number; from?: number; name?: string } = {}): El {
  const g = svg('g', {}, parent);
  if (o.name) named(o.name, g);
  const stroke = o.stroke ?? color.text;
  const w = o.width ?? Math.max(3, r / 40);
  svg('circle', { r, fill: 'none', stroke, 'stroke-width': w, opacity: 0.85 }, g);
  const stations = [['try', -90], ['test', 30], ['keep', 150]] as const;
  for (const [name, deg] of stations) {
    const a = (deg * Math.PI) / 180;
    const x = r * Math.cos(a), y = r * Math.sin(a);
    svg('circle', { cx: x, cy: y, r: w * 3.2, fill: color.bgDeep, stroke, 'stroke-width': w }, g);
    if (o.labels !== false) {
      const lx = (r + w * 9 + 18) * Math.cos(a), ly = (r + w * 9 + 18) * Math.sin(a);
      caps(g, lx, ly + w * 2.6, name, { size: Math.max(18, w * 6), fill: stroke, anchor: Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end' });
    }
    const b = ((deg + 60) * Math.PI) / 180;
    arrowHead(g, r * Math.cos(b), r * Math.sin(b), -Math.sin(b), Math.cos(b), w * 3, stroke);
  }
  const dot = svg('circle', { r: w * 1.8, fill: color.text, filter: 'url(#glow)' }, g);
  const spin = o.spin ?? 0;
  const from = o.from ?? 0;
  onFrame(t => {
    const a = -Math.PI / 2 + 2 * Math.PI * spin * Math.max(0, t - from);
    dot.setAttribute('cx', (r * Math.cos(a)).toFixed(2));
    dot.setAttribute('cy', (r * Math.sin(a)).toFixed(2));
  });
  return g;
}

/**
 * A sealed app: a closed steel box with a title bar, its features fixed inside. `parts` lists the
 * features: 'plain', 'idea' (a good idea, orange) or 'bad' (red).
 */
export function appBox(parent: Element, w: number, h: number, o: { parts?: ('plain' | 'idea' | 'bad')[]; seed?: number; stroke?: string } = {}): El {
  const g = svg('g', {}, parent);
  const stroke = o.stroke ?? color.steel;
  svg('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: Math.min(w, h) * 0.1, fill: color.steelDark, 'fill-opacity': 0.45, stroke, 'stroke-width': 3 }, g);
  const bar = -h / 2 + Math.max(14, h * 0.14);
  svg('line', { x1: -w / 2, y1: bar, x2: w / 2, y2: bar, stroke, 'stroke-width': 2, opacity: 0.7 }, g);
  for (let i = 0; i < 3; i++) svg('circle', { cx: -w / 2 + 14 + i * 12, cy: (-h / 2 + bar) / 2, r: 3, fill: stroke, opacity: 0.7 }, g);
  const parts = o.parts ?? ['plain', 'plain', 'plain', 'plain'];
  const cols = Math.ceil(Math.sqrt(parts.length * (w / h)));
  const rows = Math.ceil(parts.length / cols);
  const cw = w / (cols + 0.5), ch = (h - (bar + h / 2)) / (rows + 0.5);
  const r = rng(o.seed ?? 1);
  const s = Math.min(cw, ch) / 46;
  parts.forEach((p, i) => {
    const cx = -w / 2 + cw * (0.75 + (i % cols)), cy = bar + ch * (0.75 + Math.floor(i / cols));
    const fill = p === 'idea' ? color.orange : p === 'bad' ? color.danger : 'none';
    mark(g, Math.floor(r() * 4), cx, cy, s, fill, p === 'plain' ? stroke : fill);
  });
  return g;
}

/** A cell: membrane, nucleus, and traits (mark indices) drawn in orange. */
/** Path data for a living membrane: a gently wobbling closed loop of radius r (seeded). */
export function membranePath(r: number, seed = 1, wobble = 1): string {
  const rr = rng(seed);
  const off = Array.from({ length: 9 }, () => rr() * 0.08 - 0.04);
  let d = '';
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * 2 * Math.PI;
    let w = 0;
    for (let j = 0; j < 3; j++) w += off[j * 3] * Math.sin(a * (j + 2) + off[j * 3 + 1] * 40);
    const R = r * (1 + w * wobble);
    d += `${i ? 'L' : 'M'}${(R * Math.cos(a)).toFixed(1)} ${(R * Math.sin(a)).toFixed(1)}`;
  }
  return `${d}Z`;
}

/** A living membrane (a social cell's boundary), mint by default, lightly filled. */
export function membrane(parent: Element, r: number, seed = 1, o: { ring?: string; width?: number; fill?: number; dash?: string } = {}): SVGPathElement {
  const ring = o.ring ?? color.mint;
  return svg('path', {
    d: membranePath(r, seed), fill: ring, 'fill-opacity': o.fill ?? 0.07, stroke: ring, 'stroke-width': o.width ?? 3,
    ...(o.dash ? { 'stroke-dasharray': o.dash } : {}),
  }, parent);
}

/** A community: a living mint membrane with people inside. */
export function community(parent: Element, r: number, n: number, seed = 1, o: { ring?: string; people?: string } = {}): El {
  const g = svg('g', {}, parent);
  membrane(g, r, seed, { ring: o.ring });
  const pr = Math.min(16, (r * 0.55) / Math.sqrt(n));
  const spots = Array.from({ length: n }, (_, i) => {
    const a = i * Math.PI * (3 - Math.sqrt(5));
    const rad = r * 0.68 * Math.sqrt((i + 0.5) / n);
    return { x: rad * Math.cos(a), y: rad * Math.sin(a) };
  });
  for (const p of spots) person(at(g, p.x, p.y - pr * 0.3), pr, o.people ?? color.inkFigure);
  return g;
}

/**
 * A person as a social cell: a person inside their own small membrane, with their needs as marks
 * around them (mark indices; each person gets a different set). The holarchy's smallest level.
 */
export function personCell(parent: Element, r: number, needs: number[] = [], seed = 1, o: { ring?: string; needFill?: string } = {}): El {
  const g = svg('g', {}, parent);
  membrane(g, r, seed, { ring: o.ring, width: Math.max(2, r / 30) });
  person(at(g, 0, -r * 0.08), r * 0.42, color.inkFigure);
  needs.forEach((k, i) => {
    const a = -Math.PI / 2 + ((i + 0.5) / needs.length) * Math.PI * 2 + 0.4;
    mark(g, k, r * 0.72 * Math.cos(a), r * 0.72 * Math.sin(a), r / 120, o.needFill ?? color.mintLight);
  });
  return g;
}

/** A cartridge: a plug-in experience with a label plate and contacts. Optional marks on the plate. */
export function cartridge(parent: Element, w: number, h: number, label: string, o: { stroke?: string; marks?: number[]; dim?: boolean } = {}): El {
  const g = svg('g', {}, parent);
  const stroke = o.stroke ?? color.mint;
  const c = w * 0.16;
  svg('path', { d: `M ${-w / 2} ${-h / 2} H ${w / 2 - c} L ${w / 2} ${-h / 2 + c} V ${h / 2} H ${-w / 2} Z`, fill: color.surface, stroke, 'stroke-width': 3, 'stroke-linejoin': 'round', ...(o.dim ? { opacity: 0.4 } : {}) }, g);
  const px = -w / 2 + w * 0.12, pw = w * 0.76, py = -h / 2 + h * 0.14, ph = h * 0.5;
  svg('rect', { x: px, y: py, width: pw, height: ph, rx: 6, fill: stroke, 'fill-opacity': 0.14, stroke, 'stroke-width': 2 }, g);
  for (let i = 0; i < 6; i++) svg('line', { x1: -w * 0.3 + i * w * 0.12, y1: h / 2 - h * 0.17, x2: -w * 0.3 + i * w * 0.12, y2: h / 2 - h * 0.05, stroke, 'stroke-width': 3, opacity: 0.6 }, g);
  const ms = o.marks ?? [];
  ms.forEach((k, i) => mark(g, k, (i - (ms.length - 1) / 2) * w * 0.22, py + ph * 0.36, w / 230, color.orange));
  caps(g, 0, py + ph * (ms.length ? 0.82 : 0.6), label, { size: Math.max(12, Math.min(w * 0.1, 28, (pw * 1.1) / (label.length * 0.75 + 1))), fill: color.text, weight: 700 });
  return g;
}

/** The WE core: a shared slab of trusted building blocks, with docks along its top edge. */
export function core(parent: Element, w: number, h: number, docks = 4): El {
  const g = svg('g', {}, parent);
  svg('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 18, fill: color.mint, 'fill-opacity': 0.1, stroke: color.mint, 'stroke-width': 3 }, g);
  const n = 14;
  for (let i = 0; i < n; i++) {
    const s = h * 0.22;
    const x = -w / 2 + (w / n) * (i + 0.5);
    svg('rect', { x: x - s / 2, y: h * 0.02, width: s, height: s, rx: 4, fill: 'none', stroke: color.mint, 'stroke-width': 2, opacity: 0.55 }, g);
  }
  for (let i = 0; i < docks; i++) {
    const x = -w / 2 + (w / docks) * (i + 0.5);
    svg('rect', { x: x - w / docks * 0.32, y: -h / 2 - 6, width: (w / docks) * 0.64, height: 12, rx: 4, fill: color.mint, opacity: 0.8 }, g);
  }
  caps(g, -w / 2 + 28, -h * 0.12, 'WE · shared open core', { size: 22, fill: color.mint, anchor: 'start' });
  return g;
}

/** A company: a steel office block. */
export function company(parent: Element, s = 1): El {
  const g = svg('g', { transform: tf(0, 0, s) }, parent);
  svg('rect', { x: -60, y: -90, width: 120, height: 180, rx: 6, fill: color.steelDark, 'fill-opacity': 0.5, stroke: color.steel, 'stroke-width': 3 }, g);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) svg('rect', { x: -42 + c * 32, y: -72 + r * 30, width: 20, height: 16, fill: color.steel, opacity: 0.45 }, g);
  return g;
}

/** A simple creature's head in profile, for learning. */
