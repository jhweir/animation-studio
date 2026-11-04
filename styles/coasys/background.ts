// The Coasys page background: three slowly drifting orbs under a vignette, plus full-stage covers
// for the problem and blueprint moods.
import { div, hvis, onFrame, win, type Stage } from '../../engine/index.ts';

export function mountBackground(stage: Stage): void {
  const purple = div('orb purple', stage.background);
  const blue = div('orb blue', stage.background);
  const green = div('orb green', stage.background);
  div('vignette', stage.background);
  // Positions are laid out for 1920×1080 and scale with the stage.
  const kx = stage.width / 1920;
  const ky = stage.height / 1080;
  const place = (e: HTMLElement, x: number, y: number, s: number, o: number) => {
    const size = s * Math.max(kx, ky);
    Object.assign(e.style, {
      left: `${x * kx - size / 2}px`,
      top: `${y * ky - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: String(o),
    });
  };
  onFrame(t => {
    place(purple, 250 + 80 * Math.sin(t * 0.09), 900 + 50 * Math.cos(t * 0.07), 1300, 0.55);
    place(blue, 1000 + 120 * Math.sin(t * 0.05 + 1), 520, 1500, 0.6);
    place(green, 1560 + 70 * Math.cos(t * 0.08), 60 + 50 * Math.sin(t * 0.1), 1000, 0.3);
  });
}

/**
 * A full-stage cover in the background, for scenes in another mood (the problem's near-black, the
 * blueprint navy). Fades in over `fadeIn` from t0 and out over `fadeOut` before t1.
 */
export function cover(parent: HTMLElement, opts: { t0: number; t1: number; color: string; fadeIn?: number; fadeOut?: number }): HTMLDivElement {
  const e = div('cover', parent);
  e.style.background = opts.color;
  onFrame(t => hvis(e, win(t, opts.t0, opts.t1, opts.fadeIn ?? 0.001, opts.fadeOut ?? 0.4)));
  return e;
}
