// A film's words and settings. Each film keeps its script versions as markdown in
// films/<film>/scripts/, and each cut (a buildable version: films/<film>/cuts/<cut>/) names one
// script in its cut.json together with its style, voice, score and per-scene settings.
//
// A film id is "<film>/<cut>". "<film>" alone works when the film has exactly one cut.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

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

export interface SceneMusic {
  /** One of the score's moods (coasys-ambient: shade, dark, lift, warm, resolve). Default `warm`. */
  mood?: string;
  /** Score layers playing over this scene; consecutive scenes listing a layer share one span. */
  layers?: string[];
  /** Everything before this scene decays to silence at its start: a clean musical cut. */
  cut?: boolean;
}

/** Per-scene settings in cut.json, keyed by scene id. */
export interface SceneSettings {
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
  music?: SceneMusic;
}

export interface VoiceConfig {
  /** `kokoro`: local draft narration. `silent`: estimated reading time only. Default `silent`. */
  provider: 'kokoro' | 'silent';
  /** Kokoro voice id, e.g. `am_michael` (the default), `bf_emma`. Listen first: `pnpm film voice-samples`. */
  voice?: string;
  /** 1 = the model's natural pace. */
  speed?: number;
  /** Default `en-gb` for b* voices, else `en-us`. */
  lang?: string;
}

/** cut.json */
export interface Cut {
  /** The script this cut is built from, relative to the film's folder: `scripts/<name>.md`. */
  script: string;
  style: string;
  voice?: VoiceConfig;
  /**
   * How to say words the voice gets wrong, applied before speech: `{ "AD4M": "Adam" }`. Captions
   * and the timeline keep the written form.
   */
  pronounce?: Record<string, string>;
  /** A score in scores/ (e.g. `coasys-ambient`). Leave out for no music. */
  score?: string;
  /** Loudness target of the final mix in LUFS. Default -16. */
  loudness?: number;
  /** Stage size in px. Default [1920, 1080]. */
  size?: [number, number];
  fps?: number;
  scenes?: Record<string, SceneSettings>;
}

export interface ScriptScene extends SceneSettings {
  /** Matches defineScene(id) in the cut. kebab-case. */
  id: string;
  /** The scene's heading in the script. */
  title: string;
  /** Narration line numbers spoken in this scene, in order. */
  lines: number[];
}

export interface ScriptLine {
  /** Position in the whole film, from 1. Changes when lines are added above it. */
  n: number;
  /** Stable name for the line: `<scene>-<position in scene>`, e.g. `users-2`. Names recorded takes. */
  key: string;
  /** What is said. */
  text: string;
  /** The line's sentences (and any extra ` / ` splits): scenes time to them with part(). */
  parts: string[];
}

/** A cut with its script parsed: everything the timeline, voice and music steps need. */
export interface Script extends Omit<Cut, 'scenes'> {
  title: string;
  scenes: ScriptScene[];
  lines: ScriptLine[];
}

const NAME = /^[a-z0-9-]+$/;

/** "<film>/<cut>", filling in the cut when the film has only one. */
export function resolveFilm(id: string): string {
  const [film, cut, ...rest] = id.split('/');
  if (!film || !NAME.test(film) || rest.length || (cut !== undefined && !NAME.test(cut))) {
    throw new Error(`bad film id "${id}": use <film>/<cut>, both kebab-case`);
  }
  if (cut) return `${film}/${cut}`;
  const cuts = listCuts(film);
  if (cuts.length === 1) return `${film}/${cuts[0]}`;
  throw new Error(cuts.length ? `film "${film}" has several cuts; pick one: ${cuts.map(c => `${film}/${c}`).join(', ')}` : `no cuts in films/${film}/cuts/`);
}

export function listCuts(film: string): string[] {
  const dir = join(ROOT, 'films', film, 'cuts');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(dir, d.name, 'cut.json')))
    .map(d => d.name)
    .sort();
}

/** Every buildable film id. */
export function listFilms(): string[] {
  const dir = join(ROOT, 'films');
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .flatMap(d => listCuts(d.name).map(c => `${d.name}/${c}`));
}

/** films/<film>/cuts/<cut> */
export function filmDir(id: string): string {
  const [film, cut] = resolveFilm(id).split('/');
  return join(ROOT, 'films', film, 'cuts', cut);
}

/** films/<film> */
export function filmRoot(id: string): string {
  return join(ROOT, 'films', resolveFilm(id).split('/')[0]);
}

/** build/<film>/<cut> */
export function buildDir(id: string): string {
  return join(ROOT, 'build', ...resolveFilm(id).split('/'));
}

// ---------------------------------------------------------------- the markdown script

/** Sentences of a paragraph; ` / ` adds a split inside a sentence. */
export function splitParts(text: string): string[] {
  return text
    .split(/\s+\/\s+/)
    .flatMap(seg => seg.split(/(?<=[.!?][”"’)]?)\s+(?=[A-Z“"‘(])/))
    .map(p => p.trim())
    .filter(Boolean);
}

const slug = (s: string) =>
  s
    .replace(/^\s*\d+[.)]\s*/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const unemphasise = (s: string) => s.replace(/(\*\*|__|\*|_)(\S(?:.*?\S)?)\1/g, '$2');

export interface ParsedScript {
  title: string;
  scenes: { id: string; title: string; paragraphs: string[] }[];
}

/**
 * The script format:
 *   # Title
 *   ## Scene heading {#scene-id}      a scene; without {#id} the id comes from the heading
 *   A paragraph is one narration line. Its sentences are its parts.
 *   > a blockquote is a note, not narration; so is an <!-- HTML comment -->
 */
export function parseScript(md: string): ParsedScript {
  const src = md.replace(/<!--[\s\S]*?-->/g, '');
  let title = '';
  const scenes: ParsedScript['scenes'] = [];
  for (const block of src.split(/\n\s*\n/)) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    const first = lines[0];
    const h1 = first.match(/^#\s+(.*)$/);
    const h2 = first.match(/^##\s+(.*?)(?:\s*\{#([a-z0-9-]+)\})?\s*$/);
    if (h1 && !title) {
      title = h1[1].trim();
      continue;
    }
    if (h2) {
      const heading = h2[1].trim();
      scenes.push({ id: h2[2] ?? slug(heading), title: heading, paragraphs: [] });
      if (lines.length > 1) throw new Error(`text straight under "${first}": leave a blank line after a heading`);
      continue;
    }
    if (/^#{1,6}\s/.test(first) || first.startsWith('>') || /^(-{3,}|\*{3,})$/.test(first)) continue;
    if (!scenes.length) continue; // text before the first scene: an introduction, not narration
    scenes[scenes.length - 1].paragraphs.push(unemphasise(lines.join(' ').replace(/\s+/g, ' ')));
  }
  return { title, scenes };
}

export function loadCut(id: string): Cut {
  const path = join(filmDir(id), 'cut.json');
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Cut;
  } catch (e) {
    throw new Error(`${relative(ROOT, path)}: ${(e as Error).message}`);
  }
}

export function loadScript(id: string): Script {
  const cut = loadCut(id);
  const cutPath = relative(ROOT, join(filmDir(id), 'cut.json'));
  const mdPath = join(filmRoot(id), cut.script ?? '');
  if (!cut.script || !existsSync(mdPath)) throw new Error(`${cutPath}: "script" must name a file in the film's folder, e.g. scripts/draft.md`);
  const parsed = parseScript(readFileSync(mdPath, 'utf8'));
  const problems: string[] = [];
  const settings = cut.scenes ?? {};
  const ids = new Set<string>();
  const scenes: ScriptScene[] = [];
  const lines: ScriptLine[] = [];
  for (const sc of parsed.scenes) {
    if (ids.has(sc.id)) problems.push(`scene "${sc.id}" appears twice (give one an {#id})`);
    ids.add(sc.id);
    const set = settings[sc.id] ?? {};
    if (set.pace && !(set.pace in PACES)) problems.push(`scene "${sc.id}": unknown pace "${set.pace}"`);
    if (!sc.paragraphs.length && !set.dur) problems.push(`scene "${sc.id}" has no lines and no "dur" in cut.json`);
    const ns = sc.paragraphs.map((p, i) => {
      const parts = splitParts(p);
      lines.push({ n: lines.length + 1, key: `${sc.id}-${i + 1}`, text: parts.join(' '), parts });
      return lines.length;
    });
    scenes.push({ ...set, id: sc.id, title: sc.title, lines: ns });
  }
  for (const k of Object.keys(settings)) if (!ids.has(k)) problems.push(`cut.json has settings for scene "${k}", which isn't in the script`);
  if (!parsed.scenes.length) problems.push('the script has no scenes (## headings)');
  if (problems.length) throw new Error(`${cutPath} + ${relative(ROOT, mdPath)}:\n  ${problems.join('\n  ')}`);
  const { scenes: _, ...rest } = cut;
  return { ...rest, title: parsed.title || id, scenes, lines };
}
