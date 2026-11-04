// The timeline a film plays against. Built by pipeline/timeline.ts from script.json and the voice
// clips; scenes read their own times from it, so changing a line's voice moves its animation too.

export interface SceneTime {
  t0: number;
  t1: number;
  lines: number[];
}

export interface LineTime {
  v0: number;
  v1: number;
  text: string;
  /** Start and end of each spoken part, when the line is split into parts. */
  parts?: [number, number][];
  /** URL of the line's voice clip, when it has one. */
  clip?: string;
}

export interface Timeline {
  film: string;
  title: string;
  style: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  /** Where the voice timing came from: estimated reading time, real clips, or some of each. */
  voice: 'silent' | 'clips' | 'partial';
  scenes: Record<string, SceneTime>;
  lines: Record<string, LineTime>;
  /** URL of the music, when it was made for this exact timeline. */
  music?: string;
}

let current: Timeline | undefined;

export function setTimeline(t: Timeline): void {
  current = t;
}

export function timeline(): Timeline {
  if (!current) throw new Error('timeline read before the film was loaded');
  return current;
}

/** A scene's start and end. */
export function scene(id: string): SceneTime {
  const s = timeline().scenes[id];
  if (!s) throw new Error(`no scene "${id}" in the timeline (check script.json)`);
  return s;
}

/** A narration line's spoken start (v0) and end (v1). */
export function line(n: number): LineTime {
  const l = timeline().lines[String(n)];
  if (!l) throw new Error(`no line ${n} in the timeline (check script.json)`);
  return l;
}

/** Part i of a line. Falls back to an even split into k parts when the line has no part times. */
export function part(n: number, i: number, k = 2): { v0: number; v1: number } {
  const l = line(n);
  const p = l.parts?.[i];
  if (p) return { v0: p[0], v1: p[1] };
  const d = (l.v1 - l.v0) / k;
  return { v0: l.v0 + i * d, v1: l.v0 + (i + 1) * d };
}
