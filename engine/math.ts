// Time and number helpers. Everything here is pure.

export const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;

/** 0..1 as t goes from time a to time b (b is a time, not a length). */
export const prog = (t: number, a: number, b: number): number => clamp((t - a) / (b - a));

/** Visible window: fades in over `fadeIn` from a, out over `fadeOut` before b. 0..1. */
export const win = (t: number, a: number, b: number, fadeIn = 0.5, fadeOut = 0.5): number =>
  Math.min(prog(t, a, a + fadeIn), 1 - prog(t, b - fadeOut, b));

/** 0 → 1 → 0 over u in 0..1: flashes. */
export const bump = (u: number): number => Math.sin(Math.PI * clamp(u));

// Easings take u in 0..1.
/** Cubic in-out: moves and zooms (typical 0.8 s). */
export const eio = (u: number): number => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
/** Cubic out: arrivals (typical 0.5 s). */
export const eout = (u: number): number => 1 - Math.pow(1 - u, 3);
/** Cubic in: departures. */
export const ein = (u: number): number => u * u * u;
/** Pop-in with ~9% overshoot (typical 0.45 s). */
export const eback = (u: number): number => {
  const c1 = 1.6;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2);
};

/** Seeded random numbers (mulberry32). Use instead of Math.random(), so every render is identical. */
export function rng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Number formatted for an SVG attribute (two decimals, no -0). */
export const f2 = (x: number): string => (Math.abs(x) < 1e-6 ? 0 : x).toFixed(2);

/** SVG transform: translate, rotate (degrees), scale. */
export const tf = (x: number, y: number, s = 1, r = 0): string =>
  `translate(${f2(x)} ${f2(y)}) rotate(${f2(r)}) scale(${Math.max(s, 0.0001).toFixed(4)})`;

/** SVG transform that scales about a fixed stage point (for groups drawn in absolute coordinates). */
export const scaleAbout = (cx: number, cy: number, s: number): string =>
  `translate(${f2(cx)} ${f2(cy)}) scale(${Math.max(s, 0.0001).toFixed(4)}) translate(${f2(-cx)} ${f2(-cy)})`;

/** n points spread evenly over a disc of radius R (golden-angle spiral), centred on 0,0. */
export function sunflower(n: number, R: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const r = R * Math.sqrt((i + 0.5) / n);
    const a = i * ga;
    pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
  }
  return pts;
}
