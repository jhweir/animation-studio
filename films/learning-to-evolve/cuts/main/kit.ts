// Biology drawings for Learning to evolve: cells, bacteria, plasmids, the ladder of life's steps and a
// creature's head. The shared sketch pieces (loop, app boxes, communities, cartridges, the WE core,
// at/pose/travel/caps/marks) live in styles/coasys/sketch.ts and are re-exported here for the scenes.
import { eout, onFrame, prog, svg, tf } from '../../../../engine/index.ts';
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

/** A community: a living mint membrane with people inside. */
export function head(parent: Element, s = 1): El {
  const g = svg('g', { transform: tf(0, 0, s) }, parent);
  svg('path', { d: 'M -70 70 C -100 10 -80 -90 10 -95 C 80 -98 110 -40 100 0 L 125 30 L 98 40 C 96 70 70 80 40 78 L 40 110', fill: 'none', stroke: moods.blueprint.ink, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  return g;
}
