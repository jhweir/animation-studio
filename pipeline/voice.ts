// The voice step: one clip per narration line in build/<film>/voice/, plus timing.json, which the
// timeline reads. Only new or changed lines are voiced again.
//
// Sources, per line:
//   recorded   films/<film>/cuts/<cut>/recorded/<scene>-<i>.wav (a human take) always wins, e.g. users-2.wav
//   kokoro     draft narration from the local Kokoro model (cut.json "voice")
//   none       the line keeps its estimated reading time
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDir, filmDir, loadScript, ROOT, type Script, type ScriptLine } from './script.ts';
import type { VoiceClip } from './timeline.ts';

const VENV_PY = join(ROOT, '.venv', 'bin', 'python');
const MODEL = join(ROOT, 'assets', 'voices', 'kokoro', 'kokoro-v1.0.onnx');
const VOICES = join(ROOT, 'assets', 'voices', 'kokoro', 'voices-v1.0.bin');

export interface KokoroJob {
  out: string;
  parts: string[];
  voice: string;
  speed: number;
  lang: string;
}

export interface KokoroResult {
  out: string;
  dur: number;
  parts: [number, number][];
}

function checkSetup(): void {
  if (!existsSync(VENV_PY) || !existsSync(MODEL) || !existsSync(VOICES)) {
    throw new Error('draft voice is not set up: run pipeline/voice/setup.sh');
  }
}

/** Voice a batch of jobs with Kokoro (one model load for the whole batch). */
export function kokoro(jobs: KokoroJob[], onDone?: (r: KokoroResult) => void): Promise<KokoroResult[]> {
  checkSetup();
  return new Promise((resolve, reject) => {
    const p = spawn(VENV_PY, ['-I', join(ROOT, 'pipeline', 'voice', 'kokoro.py')], { stdio: ['pipe', 'pipe', 'pipe'] });
    const results: KokoroResult[] = [];
    let buf = '';
    let err = '';
    p.stdout.on('data', d => {
      buf += d;
      let i: number;
      while ((i = buf.indexOf('\n')) >= 0) {
        const r = JSON.parse(buf.slice(0, i)) as KokoroResult;
        buf = buf.slice(i + 1);
        results.push(r);
        onDone?.(r);
      }
    });
    p.stderr.on('data', d => (err += d));
    p.on('error', reject);
    p.on('close', code => (code === 0 ? resolve(results) : reject(new Error(`kokoro exited ${code}: ${err.slice(-1500)}`))));
    p.stdin.end(JSON.stringify({ model: MODEL, voices: VOICES, jobs }));
  });
}

/** Apply the script's pronunciation map, whole words only. */
export function spoken(text: string, pronounce: Record<string, string> = {}): string {
  let s = text;
  for (const [from, to] of Object.entries(pronounce)) {
    const esc = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp(`(?<![\\w])${esc}(?![\\w])`, 'g'), to);
  }
  return s;
}

function duration(wav: string): number {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], { encoding: 'utf8' });
  const d = Number(r.stdout.trim());
  if (!d) throw new Error(`can't read the length of ${wav}`);
  return Math.round(d * 1000) / 1000;
}

function kokoroSettings(script: Script, l: ScriptLine): { settings: string; job: Omit<KokoroJob, 'out'> } {
  const v = script.voice!;
  const voice = v.voice ?? 'am_michael';
  const speed = v.speed ?? 1;
  const lang = v.lang ?? (voice.startsWith('b') ? 'en-gb' : 'en-us');
  const parts = l.parts.map(p => spoken(p, script.pronounce));
  return { settings: `kokoro|${voice}|${speed}|${lang}|${parts.join(' / ')}`, job: { parts, voice, speed, lang } };
}

export interface VoiceReport {
  voiced: number[];
  recorded: number[];
  kept: number[];
  stale: number[];
  warnings: string[];
}

/** Bring build/<film>/<cut>/voice/ up to date with the script. */
export async function voiceFilm(film: string, opts: { force?: boolean; onLine?: (n: number) => void } = {}): Promise<VoiceReport> {
  const script = loadScript(film);
  const dir = join(buildDir(film), 'voice');
  mkdirSync(dir, { recursive: true });
  const timingPath = join(dir, 'timing.json');
  const priorClips = existsSync(timingPath) ? (JSON.parse(readFileSync(timingPath, 'utf8')) as VoiceClip[]) : [];
  // Drafts are reused by what they say and how (so moving or renumbering a line costs nothing);
  // recorded takes by the line's stable key.
  const draftBySettings = new Map(priorClips.filter(c => c.source === 'kokoro').map(c => [c.settings, c]));
  const recordedByKey = new Map(priorClips.filter(c => c.source === 'recorded').map(c => [c.key, c]));
  const report: VoiceReport = { voiced: [], recorded: [], kept: [], stale: [], warnings: [] };
  const next = new Map<number, VoiceClip>();
  const jobs: (KokoroJob & { n: number; key: string; settings: string; text: string; file: string })[] = [];

  for (const l of script.lines) {
    const rec = join(filmDir(film), 'recorded', `${l.key}.wav`);
    if (existsSync(rec)) {
      const settings = `recorded|${statSync(rec).mtimeMs}`;
      const old = recordedByKey.get(l.key);
      if (old && old.settings === settings && !opts.force && existsSync(join(dir, old.file))) {
        next.set(l.n, { ...old, n: l.n });
        if (old.text !== l.text) {
          report.stale.push(l.n);
          report.warnings.push(`${l.key} changed since it was recorded: re-record it (the old timing is kept until then)`);
        } else report.kept.push(l.n);
        continue;
      }
      // A human take: normalise to 48 kHz mono, -18 LUFS, and take its length. Parts split evenly for now.
      const file = `rec-${l.key}.wav`;
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', rec, '-af', 'loudnorm=I=-18:TP=-2', '-ac', '1', '-ar', '48000', join(dir, file)], { encoding: 'utf8' });
      if (r.status !== 0) throw new Error(`can't read ${rec}: ${r.stderr}`);
      next.set(l.n, { n: l.n, key: l.key, file, text: l.text, dur: duration(join(dir, file)), source: 'recorded', settings });
      report.recorded.push(l.n);
      continue;
    }
    if (script.voice?.provider !== 'kokoro') continue;
    const { settings, job } = kokoroSettings(script, l);
    const old = draftBySettings.get(settings);
    if (old && !opts.force && existsSync(join(dir, old.file))) {
      next.set(l.n, { ...old, n: l.n, key: l.key, text: l.text });
      report.kept.push(l.n);
      continue;
    }
    const file = `draft-${createHash('sha1').update(settings).digest('hex').slice(0, 12)}.wav`;
    jobs.push({ ...job, n: l.n, key: l.key, settings, text: l.text, file, out: join(dir, file) });
  }

  if (jobs.length) {
    const byOut = new Map(jobs.map(j => [j.out, j]));
    await kokoro(jobs.map(({ out, parts, voice, speed, lang }) => ({ out, parts, voice, speed, lang })), r => {
      const j = byOut.get(r.out)!;
      next.set(j.n, {
        n: j.n,
        key: j.key,
        file: j.file,
        text: j.text,
        dur: r.dur,
        ...(j.parts.length > 1 ? { parts: r.parts } : {}),
        source: 'kokoro',
        settings: j.settings,
      });
      report.voiced.push(j.n);
      opts.onLine?.(j.n);
    });
  }

  const clips = script.lines.map(l => next.get(l.n)).filter((c): c is VoiceClip => !!c);
  writeFileSync(timingPath, JSON.stringify(clips, null, 1));
  // Clips no line uses any more.
  const used = new Set(clips.map(c => c.file));
  for (const f of readdirSync(dir)) if (f.endsWith('.wav') && f !== 'track.wav' && !used.has(f)) rmSync(join(dir, f));
  return report;
}

/** Voice one sentence in several voices, to choose one. Returns the wav paths. */
export async function voiceSamples(text: string, voices: string[], speed = 1): Promise<string[]> {
  const dir = join(ROOT, 'build', 'voice-samples');
  mkdirSync(dir, { recursive: true });
  const jobs = voices.map(voice => ({
    out: join(dir, `${voice}.wav`),
    parts: [text],
    voice,
    speed,
    lang: voice.startsWith('b') ? 'en-gb' : 'en-us',
  }));
  return (await kokoro(jobs)).map(r => r.out);
}
