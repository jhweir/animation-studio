// Timing and camera helpers shared by chalk scenes.
import { clamp, eout, prog, set, vis, win, type SceneContext } from '../../engine/index.ts';

/**
 * Sentence j of the scene's line i, safe for any j: a line spoken as one part gives the whole line
 * for j = 0; j past the last part clamps to the last.
 */
export function sent(ctx: SceneContext, i: number, j: number): { v0: number; v1: number } {
  const l = ctx.line(i);
  const n = l.parts?.length ?? 0;
  if (n === 0) return { v0: l.v0, v1: l.v1 };
  const k = Math.max(0, Math.min(j < 0 ? n + j : j, n - 1));
  return { v0: l.parts![k][0], v1: l.parts![k][1] };
}

/** A time a fraction f of the way through the scene's line i. */
export function along(ctx: SceneContext, i: number, f: number): number {
  const l = ctx.line(i);
  return l.v0 + (l.v1 - l.v0) * f;
}

/** Fade an SVG element in from `at` over `dur` (eased). Returns the progress. */
export function appear(e: Element, t: number, at: number, dur = 0.5): number {
  const u = eout(prog(t, at, at + dur));
  vis(e, u);
  return u;
}

/** Show an SVG element between a and b with soft edges. Returns its opacity. */
export function during(e: Element, t: number, a: number, b: number, fadeIn = 0.4, fadeOut = 0.4): number {
  const o = win(t, a, b, fadeIn, fadeOut);
  vis(e, o);
  return o;
}

/**
 * Point a camera: put world point (x, y) at the stage centre at scale s. Apply to the group that
 * holds the world; its children keep their own coordinates.
 */
export function camera(g: Element, x: number, y: number, s: number, cx = 960, cy = 540): void {
  set(g, { transform: `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${s.toFixed(5)}) translate(${(-x).toFixed(2)} ${(-y).toFixed(2)})` });
}

/** Interpolate camera keys [t, x, y, s] with eased moves between them. */
export function cameraPath(keys: [number, number, number, number][], t: number, ease = (u: number) => u): [number, number, number] {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2], keys[0][3]];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= b[0]) {
      const u = ease(clamp((t - a[0]) / (b[0] - a[0])));
      // scale interpolates geometrically so zooms feel even
      const s = a[3] * Math.pow(b[3] / a[3], u);
      return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, s];
    }
  }
  const z = keys[keys.length - 1];
  return [z[1], z[2], z[3]];
}

/** Move a group to (x, y) with scale s and rotation r (degrees). */
export function place(g: Element, x: number, y: number, s = 1, r = 0): void {
  set(g, { transform: `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})` });
}

/** Point on a quadratic curve a → c → b at u. */
export function quad(a: [number, number], c: [number, number], b: [number, number], u: number): [number, number] {
  const v = 1 - u;
  return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]];
}
