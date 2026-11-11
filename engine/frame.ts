// The frame loop: everything registered with onFrame runs on every render(t), in registration order.

type Updater = (t: number) => void;

const updaters: Updater[] = [];
const finishers: Updater[] = [];
const pending: Promise<unknown>[] = [];

/** Run f on every frame. f must be a pure function of t. */
export function onFrame(f: Updater): void {
  updaters.push(f);
}

/**
 * Run f after every onFrame callback of the frame has run: for drawing that depends on what the
 * frame's updaters set, such as rendering a 3D scene. Pure in t, like onFrame.
 */
export function afterFrame(f: Updater): void {
  finishers.push(f);
}

/**
 * Hold the current frame until p resolves (an image decoding, a model loading). The renderer waits
 * for it before taking the screenshot.
 */
export function waitFor(p: Promise<unknown>): void {
  pending.push(p);
}

function draw(t: number): void {
  for (const f of updaters) f(t);
  for (const f of finishers) f(t);
}

/** Draw frame t. If something is still loading, wait for it and draw the frame again. */
export function renderFrame(t: number): Promise<unknown> | undefined {
  draw(t);
  if (pending.length) return Promise.all(pending.splice(0)).then(() => draw(t));
  return undefined;
}

export interface Cue {
  t: number;
  kind: string;
  [extra: string]: unknown;
}

const cues: Cue[] = [];

/**
 * A sound cue at time t (pop, hit, caption, …). The music step turns cues into small sounds, and the
 * player shows them on the timeline. Register cues in a scene's setup, not in onFrame.
 */
export function cue(t: number, kind: string, extra: Record<string, unknown> = {}): void {
  cues.push({ ...extra, t: +t.toFixed(3), kind });
}

export function allCues(): Cue[] {
  return cues.slice().sort((a, b) => a.t - b.t);
}

export interface BoardFrame {
  t: number;
  /** What the frame should show, for whoever reviews the storyboard. */
  note: string;
}

const boardFrames: BoardFrame[] = [];

/**
 * A storyboard frame at time t: a key pose worth reviewing, with a note on what it shows.
 * `pnpm film board` renders every one, with its narration line and note. Register in a scene's
 * setup, not in onFrame.
 */
export function board(t: number, note: string): void {
  boardFrames.push({ t: +t.toFixed(3), note });
}

export function allBoard(): BoardFrame[] {
  return boardFrames.slice().sort((a, b) => a.t - b.t);
}
