// script.json: a film's scenes and narration lines. The single source of what is said and when.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const ROOT = join(import.meta.dirname, '..');

/** Timing presets for a scene, in seconds (from Data's films). */
export const PACES = {
  /** The film's first scene: a calm lead-in and a longer tail. */
  open: { lead: 0.4, gap: 0.55, tail: 1.4, hold: 0 },
  /** Most scenes. */
  warm: { lead: 0.3, gap: 0.55, tail: 0.45, hold: 0 },
  /** Slower scenes that need room. */
  calm: { lead: 0.3, gap: 0.6, tail: 0.5, hold: 0 },
  /** The last scene: holds on the end card. */
  end: { lead: 0.4, gap: 0.5, tail: 2.2, hold: 7.4 },
} as const;

export type Pace = keyof typeof PACES;

export interface ScriptScene {
  /** Matches defineScene(id) in the film. kebab-case. */
  id: string;
  /** Narration line numbers spoken in this scene, in order. */
  lines: number[];
  pace?: Pace;
  /** Seconds before the first line. */
  lead?: number;
  /** Seconds between lines. */
  gap?: number;
  /** Seconds after the last line. */
  tail?: number;
  /** Extra seconds held after the last line (end cards). */
  hold?: number;
  /** Length of a scene with no lines. */
  dur?: number;
}

export interface ScriptLine {
  n: number;
  /** What is said. */
  text: string;
  /**
   * The line split at natural pauses, about 6–12 words each. Scenes can time to each part with
   * part(n, i). Joined, the parts must equal `text`.
   */
  parts?: string[];
}

export interface VoiceConfig {
  /** `kokoro`: local draft narration. `silent`: estimated reading time only. Default `silent`. */
  provider: 'kokoro' | 'silent';
  /** Kokoro voice id, e.g. `bf_emma`, `af_heart`. Listen first: `pnpm film voice-samples`. */
  voice?: string;
  /** 1 = the model's natural pace. */
  speed?: number;
  /** Default `en-gb` for b* voices, else `en-us`. */
  lang?: string;
}

export interface Script {
  title: string;
  style: string;
  voice?: VoiceConfig;
  /**
   * How to say words the voice gets wrong, applied before speech: `{ "AD4M": "Adam" }`. The
   * captions and the timeline keep the written form.
   */
  pronounce?: Record<string, string>;
  /** Stage size in px. Default [1920, 1080]. */
  size?: [number, number];
  fps?: number;
  scenes: ScriptScene[];
  lines: ScriptLine[];
}

export function filmDir(film: string): string {
  if (!/^[a-z0-9-]+$/.test(film)) throw new Error(`bad film name "${film}" (kebab-case folder in films/)`);
  return join(ROOT, 'films', film);
}

export function buildDir(film: string): string {
  return join(ROOT, 'build', film);
}

export function loadScript(film: string): Script {
  const path = join(filmDir(film), 'script.json');
  let s: Script;
  try {
    s = JSON.parse(readFileSync(path, 'utf8')) as Script;
  } catch (e) {
    throw new Error(`films/${film}/script.json: ${(e as Error).message}`);
  }
  const problems: string[] = [];
  const byN = new Map(s.lines.map(l => [l.n, l]));
  const used = new Set<number>();
  const ids = new Set<string>();
  for (const sc of s.scenes) {
    if (ids.has(sc.id)) problems.push(`scene "${sc.id}" appears twice`);
    ids.add(sc.id);
    if (sc.pace && !(sc.pace in PACES)) problems.push(`scene "${sc.id}": unknown pace "${sc.pace}"`);
    if (!sc.lines.length && !sc.dur) problems.push(`scene "${sc.id}" has no lines and no dur`);
    for (const n of sc.lines) {
      if (!byN.has(n)) problems.push(`scene "${sc.id}" uses line ${n}, which doesn't exist`);
      if (used.has(n)) problems.push(`line ${n} is used by two scenes`);
      used.add(n);
    }
  }
  for (const l of s.lines) {
    if (l.parts && l.parts.join(' ').replace(/\s+/g, ' ').trim() !== l.text.replace(/\s+/g, ' ').trim()) {
      problems.push(`line ${l.n}: parts don't join up to the text`);
    }
  }
  if (problems.length) throw new Error(`films/${film}/script.json:\n  ${problems.join('\n  ')}`);
  return s;
}
