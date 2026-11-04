// Builds a film's timeline from script.json and the voice clips: scenes follow the narration.
// Without clips, each line gets its estimated reading time, so timing is close to the voiced film.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { LineTime, SceneTime, Timeline } from '../engine/timeline.ts';
import { freshMusic, musicKey } from './music.ts';
import { buildDir, loadScript, PACES, type ScriptLine } from './script.ts';

/** One voiced line: written by the voice step to build/<film>/voice/timing.json. */
export interface VoiceClip {
  n: number;
  file: string;
  /** The text the clip was made from; a changed line falls back to its estimate. */
  text: string;
  dur: number;
  /** Start and end of each part within the clip. */
  parts?: [number, number][];
  /** `kokoro` (draft) or `recorded` (a human take). */
  source: 'kokoro' | 'recorded';
  /** What the clip was made with, so a change of voice or speed re-voices it. */
  settings: string;
}

const PART_PAUSE = 0.35;
const words = (s: string) => (s.match(/[A-Za-z0-9']+/g) ?? []).length;

/** Reading time of a line: 2.8 words per second, plus a breath per part (Data's silent clips). */
function estimate(l: ScriptLine): { dur: number; parts?: [number, number][] } {
  const parts = l.parts ?? [l.text];
  const lens = parts.map(p => words(p) / 2.8 + 0.45);
  let t = 0;
  const bounds: [number, number][] = lens.map((d, i) => {
    if (i) t += PART_PAUSE;
    const b: [number, number] = [t, t + d];
    t += d;
    return b;
  });
  return { dur: t, parts: parts.length > 1 ? bounds : undefined };
}

function loadClips(film: string): Map<number, VoiceClip> {
  const path = join(buildDir(film), 'voice', 'timing.json');
  if (!existsSync(path)) return new Map();
  const clips = JSON.parse(readFileSync(path, 'utf8')) as VoiceClip[];
  return new Map(clips.map(c => [c.n, c]));
}

const r3 = (x: number) => Math.round(x * 1000) / 1000;

export function buildTimeline(film: string): Timeline {
  const script = loadScript(film);
  const clips = loadClips(film);
  const byN = new Map(script.lines.map(l => [l.n, l]));
  const lines: Record<string, LineTime> = {};
  const scenes: Record<string, SceneTime> = {};
  let voiced = 0;
  let t = 0;
  for (const sc of script.scenes) {
    const pace = { ...PACES[sc.pace ?? 'warm'] };
    const lead = sc.lead ?? pace.lead;
    const gap = sc.gap ?? pace.gap;
    const tail = sc.tail ?? pace.tail;
    const hold = sc.hold ?? pace.hold;
    const t0 = t;
    if (!sc.lines.length) {
      t += sc.dur ?? 0;
    } else {
      t += lead;
      sc.lines.forEach((n, i) => {
        if (i) t += gap;
        const l = byN.get(n)!;
        const clip = clips.get(n);
        const fresh = clip && clip.text === l.text;
        if (fresh) voiced++;
        const { dur, parts } = fresh ? { dur: clip.dur, parts: clip.parts } : estimate(l);
        lines[String(n)] = {
          v0: r3(t),
          v1: r3(t + dur),
          text: l.text,
          ...(parts ? { parts: parts.map(([a, b]) => [r3(t + a), r3(t + b)] as [number, number]) } : {}),
          ...(fresh ? { clip: `/build/${film}/voice/${clip.file}` } : {}),
        };
        t += dur;
      });
      t += hold + tail;
    }
    scenes[sc.id] = { t0: r3(t0), t1: r3(t), lines: sc.lines };
  }
  const [width, height] = script.size ?? [1920, 1080];
  const tl: Timeline = {
    film,
    title: script.title,
    style: script.style,
    width,
    height,
    fps: script.fps ?? 30,
    duration: r3(t),
    voice: voiced === 0 ? 'silent' : voiced === script.lines.length ? 'clips' : 'partial',
    scenes,
    lines,
  };
  const music = script.score ? freshMusic(film, musicKey(script, tl)) : undefined;
  return music ? { ...tl, music } : tl;
}
