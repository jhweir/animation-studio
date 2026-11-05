// A line-drawn globe (orthographic projection of Natural Earth land) and things that live on it:
// points on land, and roots that grow across the surface. Everything is positioned in longitude and
// latitude and projected each frame, so it turns with the globe and hides on the far side.
import { geoContains, geoGraticule10, geoOrthographic, geoPath, type GeoPath, type GeoProjection } from 'd3-geo';
import type { Feature, LineString, MultiPolygon, Polygon } from 'geojson';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import land110 from 'world-atlas/land-110m.json';
import { clamp, named, onFrame, rng, set, svg } from '../../engine/index.ts';
import { color } from './tokens.ts';

export type LonLat = [number, number];

const topo = land110 as unknown as Topology<{ land: GeometryCollection }>;
/** Natural Earth land at 1:110m (public domain), as GeoJSON. */
export const land = feature(topo, topo.objects.land) as unknown as Feature<Polygon | MultiPolygon>;

export interface GlobeOptions {
  cx: number;
  cy: number;
  r: number;
  /** The view at time t: [longitude, latitude] at the centre of the disc, in degrees. */
  view: (t: number) => LonLat;
  /** Radius multiplier at time t (zooms). Default 1. */
  zoom?: (t: number) => number;
  name?: string;
}

export interface Globe {
  g: SVGGElement;
  /** The projection, updated for the current frame before anything registered after the globe runs. */
  projection: GeoProjection;
  path: GeoPath;
  cx: number;
  cy: number;
  /** Current radius in px. */
  radius(): number;
  /** Stage position of a point (whether or not it faces the viewer). */
  xy(p: LonLat): [number, number];
  /** How directly a point faces the viewer: 1 at the centre of the disc, 0 at the rim, < 0 behind. */
  facing(p: LonLat): number;
}

const rad = Math.PI / 180;

/** The globe: a dark disc, a faint graticule and land outlines. Create it before anything placed on it. */
export function globe(parent: Element, o: GlobeOptions): Globe {
  const g = named(o.name ?? 'globe', svg('g', {}, parent));
  const projection = geoOrthographic().clipAngle(90).precision(0.3).translate([o.cx, o.cy]);
  const path = geoPath(projection);
  const sphere = svg('path', { fill: color.bgDeep, 'fill-opacity': 0.85, stroke: color.line, 'stroke-width': 2 }, g);
  const grid = svg('path', { fill: 'none', stroke: color.line, 'stroke-width': 1, 'stroke-opacity': 0.55 }, g);
  const ground = svg('path', { fill: color.surface2, 'fill-opacity': 0.75, stroke: color.text3, 'stroke-width': 1.2, 'stroke-opacity': 0.7 }, g);
  const graticule = geoGraticule10();
  let r = o.r;
  onFrame(t => {
    r = o.r * (o.zoom ? o.zoom(t) : 1);
    const [lon, lat] = o.view(t);
    projection.scale(r).rotate([-lon, -lat]);
    set(sphere, { d: path({ type: 'Sphere' }) ?? '' });
    set(grid, { d: path(graticule) ?? '' });
    set(ground, { d: path(land) ?? '' });
  });
  return {
    g,
    projection,
    path,
    cx: o.cx,
    cy: o.cy,
    radius: () => r,
    xy: p => {
      const [lon, lat] = projection.rotate();
      // project without clipping: rotate the point and drop it onto the disc plane
      const l = (p[0] + lon) * rad;
      const f = p[1] * rad;
      const f0 = -lat * rad;
      const x = Math.cos(f) * Math.sin(l);
      const y = Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l);
      return [o.cx + r * x, o.cy - r * y];
    },
    facing: p => {
      const [lon, lat] = projection.rotate();
      const l = (p[0] + lon) * rad;
      const f = p[1] * rad;
      const f0 = -lat * rad;
      return Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l);
    },
  };
}

/** n random points on land (seeded), optionally inside a lon/lat box. */
export function landPoints(n: number, seed: number, box?: { lon: [number, number]; lat: [number, number] }): LonLat[] {
  const r = rng(seed);
  const out: LonLat[] = [];
  const [lo0, lo1] = box?.lon ?? [-180, 180];
  const [la0, la1] = box?.lat ?? [-60, 75];
  for (let tries = 0; out.length < n && tries < n * 400; tries++) {
    const lon = lo0 + (lo1 - lo0) * r();
    // uniform on the sphere between the two latitudes
    const s0 = Math.sin(la0 * rad);
    const s1 = Math.sin(la1 * rad);
    const lat = Math.asin(s0 + (s1 - s0) * r()) / rad;
    if (geoContains(land, [lon, lat])) out.push([lon, lat]);
  }
  return out;
}

/** The point `dist` degrees of arc from p along `bearing` degrees (0 = north). */
export function destination(p: LonLat, bearing: number, dist: number): LonLat {
  const f1 = p[1] * rad;
  const l1 = p[0] * rad;
  const d = dist * rad;
  const b = bearing * rad;
  const f2 = Math.asin(Math.sin(f1) * Math.cos(d) + Math.cos(f1) * Math.sin(d) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(f1), Math.cos(d) - Math.sin(f1) * Math.sin(f2));
  return [((l2 / rad + 540) % 360) - 180, f2 / rad];
}

export interface RootBranch {
  coords: LonLat[];
  depth: number;
  /** When it starts growing, as a fraction of the whole network's growth (0..1). */
  born: number;
  /** How long it takes to grow, as a fraction of the whole growth. */
  span: number;
}

export interface RootOptions {
  /** Roots start here and grow outwards. */
  origins: LonLat[];
  seed: number;
  /** Main roots per origin. Default 5. */
  trunks?: number;
  /** Degrees of arc per step. Default 2.2. */
  step?: number;
  /** Steps in a main root. Default 26. */
  length?: number;
  /** Branching depth. Default 3. */
  depth?: number;
  /** How much a root turns per step, in degrees (both ways). Default 34; lower is smoother. */
  wander?: number;
  /** Chance of a side root at each step. Default 0.28. */
  branching?: number;
  /** Compass bearings the main roots set off between, in degrees. Default all round [0, 360]. */
  bearings?: [number, number];
}

/**
 * A branching root network: main roots wander outwards from each origin, sprouting thinner roots that
 * sprout thinner ones. Each branch has a birth and growth span inside the network's 0..1 growth, so a
 * single progress value draws the whole network on, trunks first.
 */
export function rootNetwork(o: RootOptions): RootBranch[] {
  const r = rng(o.seed);
  const step = o.step ?? 2.2;
  const maxDepth = o.depth ?? 3;
  const out: RootBranch[] = [];
  const grow = (start: LonLat, bearing: number, steps: number, depth: number, born: number) => {
    const coords: LonLat[] = [start];
    let p = start;
    let b = bearing;
    const kids: { at: number; p: LonLat; b: number }[] = [];
    for (let i = 1; i <= steps; i++) {
      b += (r() - 0.5) * (o.wander ?? 34);
      p = destination(p, b, step * (0.8 + 0.4 * r()));
      coords.push(p);
      if (depth < maxDepth && i > 2 && r() < (o.branching ?? 0.28)) kids.push({ at: i / steps, p, b: b + (r() < 0.5 ? -1 : 1) * (30 + 35 * r()) });
    }
    const span = 0.45 * (steps / (o.length ?? 26)) + 0.05;
    out.push({ coords, depth, born, span });
    for (const k of kids) grow(k.p, k.b, Math.max(4, Math.round(steps * (0.45 + 0.2 * r()))), depth + 1, born + span * k.at);
  };
  for (const origin of o.origins) {
    const n = o.trunks ?? 5;
    const [b0, b1] = o.bearings ?? [0, 360];
    const full = b1 - b0 >= 360;
    for (let i = 0; i < n; i++) {
      const at = full ? (360 * i) / n : b0 + ((b1 - b0) * (i + 0.5)) / n;
      grow(origin, at + (r() - 0.5) * (full ? 40 : (b1 - b0) / n), o.length ?? 26, 0, 0.05 * r());
    }
  }
  const end = Math.max(...out.map(b => b.born + b.span));
  for (const b of out) {
    b.born /= end;
    b.span /= end;
  }
  return out;
}

/** The part of a branch grown by network progress u (0..1), as a LineString, or null if not started. */
export function grownPart(b: RootBranch, u: number): LineString | null {
  const k = clamp((u - b.born) / b.span);
  if (k <= 0) return null;
  const n = b.coords.length - 1;
  const x = k * n;
  const i = Math.floor(x);
  const pts = b.coords.slice(0, i + 1);
  if (i < n) {
    const a = b.coords[i];
    const c = b.coords[i + 1];
    const f = x - i;
    pts.push([a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f]);
  }
  return { type: 'LineString', coordinates: pts };
}
