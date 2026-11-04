// Words on screen: captions, big slammed words, stage labels, highlighter marks, camera punches.
import {
  clamp, cue, div, eback, eio, eout, hvis, named, onFrame, prog, text, vis, win, type Stage,
} from '../../engine/index.ts';
import { color } from './tokens.ts';

/** A piece of a caption or beat row: HTML (may contain <em> and <mark>) that arrives at time t. */
export interface Piece {
  h: string;
  t: number;
}

/** Highlighter wipe on a <mark>: the bar grows left to right; the text turns ink once covered. */
export function wipeMark(m: HTMLElement, u: number): void {
  const p = eio(clamp(u));
  m.style.backgroundSize = `${(100 * p).toFixed(1)}% 78%`;
  m.style.color = p > 0.45 ? color.ink : '';
}

export interface CaptionOptions {
  /** Shown in the mint pill above the rows. */
  label?: string;
  t0: number;
  t1: number;
  /** Top of the caption in px. Default 820. */
  top?: number;
  rows: Piece[][];
  small?: boolean;
  name?: string;
}

/** A caption: a label pill and rows whose pieces rise in at their own times. */
export function caption(parent: HTMLElement, c: CaptionOptions): HTMLDivElement {
  const box = named(c.name ?? 'caption', div('cap', parent));
  box.style.top = `${c.top ?? 820}px`;
  const lbl = c.label ? div('lbl', box, c.label) : null;
  const spans: { e: HTMLSpanElement; t: number; marks: HTMLElement[] }[] = [];
  for (const r of c.rows) {
    const row = div(c.small ? 'row small' : 'row', box);
    for (const p of r) {
      const s = document.createElement('span');
      s.innerHTML = p.h;
      row.appendChild(s);
      spans.push({ e: s, t: p.t, marks: [...s.querySelectorAll('mark')] });
      cue(p.t, 'caption');
    }
  }
  onFrame(t => {
    const o = win(t, c.t0, c.t1, 0.5, 0.5);
    hvis(box, o);
    if (o <= 0) return;
    if (lbl) lbl.style.transform = `translateY(${((1 - eout(prog(t, c.t0, c.t0 + 0.6))) * 14).toFixed(2)}px)`;
    for (const s of spans) {
      const p = eout(prog(t, s.t, s.t + 0.7));
      s.e.style.opacity = p.toFixed(3);
      s.e.style.transform = `translateY(${((1 - p) * 22).toFixed(2)}px)`;
      s.marks.forEach(m => wipeMark(m, prog(t, s.t + 0.35, s.t + 0.75)));
    }
  });
  return box;
}

/** An uppercase, tracked label at the top of the stage, shown between a and b. */
export function stageLabel(parent: SVGElement, s: string, a: number, b: number, x = 960): SVGTextElement {
  const e = text(parent, x, 118, s.toUpperCase(), {
    fill: color.text3, 'font-size': 26, 'font-weight': 700, 'letter-spacing': '0.1em', 'text-anchor': 'middle',
  });
  onFrame(t => vis(e, win(t, a, b, 0.35, 0.35)));
  return e;
}

// Camera punch: a short scale kick of the art layer on big beats. Mounted once per film.
const punches: [number, number][] = [];
let beatDim: HTMLDivElement | undefined;
const dims: { t0: number; t1: number; dim: number }[] = [];

/** A short scale kick of the art layer at t. */
export function punch(t: number, amount = 0.035): void {
  punches.push([t, amount]);
}

export function mountType(stage: Stage): void {
  const art = stage.art;
  const cx = stage.width / 2;
  const cy = stage.height * 0.46;
  onFrame(t => {
    let s = 1;
    for (const [a, amt] of punches) {
      if (t > a && t < a + 0.6) s += amt * Math.exp(-(t - a) * 7) * Math.sin((Math.min(1, (t - a) * 18) * Math.PI) / 2);
    }
    art.style.transformOrigin = `${cx}px ${cy}px`;
    art.style.transform = s === 1 ? '' : `scale(${s.toFixed(4)})`;
  });
  beatDim = div('beatdim', stage.text);
  const dimEl = beatDim;
  onFrame(t => {
    let d = 0;
    for (const c of dims) d = Math.max(d, c.dim * win(t, c.t0, c.t1, 0.15, 0.3));
    hvis(dimEl, d);
  });
}

export interface BeatOptions {
  t0: number;
  t1: number;
  rows: (Piece & { size?: number })[];
  /** Top of the first row in px. Default 380. */
  y?: number;
  /** Font size in px. Default 118. */
  size?: number;
  /** 0..1: darkens the art behind the words. */
  dim?: number;
  label?: string;
  /** Kick the art layer as each row lands. Default true. */
  punch?: boolean;
  name?: string;
}

/** Big words: rows slam in at their own times with a scale overshoot; marks wipe in after. */
export function beat(parent: HTMLElement, c: BeatOptions): HTMLDivElement {
  const box = named(c.name ?? 'beat', div('beat', parent));
  box.style.top = `${c.y ?? 380}px`;
  const lbl = c.label ? div('blbl', box, c.label) : null;
  const rows = c.rows.map(r => {
    const row = div('br', box);
    row.style.fontSize = `${r.size ?? c.size ?? 118}px`;
    const s = document.createElement('span');
    s.innerHTML = r.h;
    row.appendChild(s);
    cue(r.t, 'hit', { big: !!c.dim });
    if (c.punch !== false) punch(r.t, c.dim ? 0.05 : 0.03);
    return { s, t: r.t, marks: [...s.querySelectorAll('mark')] as HTMLElement[] };
  });
  if (c.dim) dims.push({ t0: c.t0, t1: c.t1, dim: c.dim });
  onFrame(t => {
    const o = win(t, c.t0, c.t1, 0.12, 0.3);
    hvis(box, o);
    if (o <= 0) return;
    if (lbl) lbl.style.opacity = eout(prog(t, c.t0, c.t0 + 0.3)).toFixed(3);
    for (const r of rows) {
      const u = prog(t, r.t, r.t + 0.32);
      r.s.style.opacity = clamp(u * 3).toFixed(3);
      r.s.style.transform = `scale(${(u >= 1 ? 1 : 1.35 - 0.35 * eback(u)).toFixed(4)})`;
      r.marks.forEach(m => wipeMark(m, prog(t, r.t + 0.18, r.t + 0.5)));
    }
  });
  return box;
}
