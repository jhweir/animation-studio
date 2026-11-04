// The music step: arranges and renders build/<film>/music/music.wav with the film's score.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Cue } from '../engine/frame.ts';
import type { Timeline } from '../engine/timeline.ts';
import { buildDir, ROOT, type Script } from './script.ts';

const VENV_PY = join(ROOT, '.venv', 'bin', 'python');

/** What the music depends on, apart from the cues: the score, each scene's music and every time. */
export function musicKey(script: Script, tl: Omit<Timeline, 'music'>): string {
  const basis = {
    score: script.score,
    scenes: script.scenes.map(s => [s.id, s.music ?? {}]),
    times: [tl.duration, tl.scenes, Object.entries(tl.lines).map(([n, l]) => [n, l.v0, l.v1, l.parts])],
  };
  return createHash('sha1').update(JSON.stringify(basis)).digest('hex').slice(0, 16);
}

/** The music's URL if it was made for this timeline, else undefined. */
export function freshMusic(film: string, key: string): string | undefined {
  const meta = join(buildDir(film), 'music', 'music.json');
  if (!existsSync(meta)) return undefined;
  const m = JSON.parse(readFileSync(meta, 'utf8')) as { key: string };
  return m.key === key ? `/build/${film}/music/music.wav` : undefined;
}

export interface MusicStats {
  path: string;
  rms_dbfs: number;
  segments: number;
  silent_cues: string[];
}

export async function makeMusic(film: string, script: Script, tl: Timeline, cues: Cue[]): Promise<MusicStats> {
  if (!script.score) throw new Error(`films/${film}/script.json has no "score"`);
  const scorePath = join(ROOT, 'scores', script.score, 'score.py');
  if (!existsSync(scorePath)) throw new Error(`no score "${script.score}" (scores/${script.score}/score.py)`);
  if (!existsSync(VENV_PY)) throw new Error('music needs the Python venv: run pipeline/voice/setup.sh');
  const dir = join(buildDir(film), 'music');
  mkdirSync(dir, { recursive: true });
  const out = join(dir, 'music.wav');
  const req = {
    score: scorePath,
    out,
    duration: tl.duration,
    seed: 42,
    scenes: script.scenes
      .filter(s => tl.scenes[s.id])
      .map(s => ({
        id: s.id,
        t0: tl.scenes[s.id].t0,
        t1: tl.scenes[s.id].t1,
        music: s.music ?? {},
        lines: s.lines.map(n => tl.lines[String(n)]).map(l => ({ v0: l.v0, v1: l.v1, parts: l.parts ?? null })),
      })),
    cues,
  };
  const stdout = await new Promise<string>((resolve, reject) => {
    const p = spawn(VENV_PY, ['-I', join(ROOT, 'pipeline', 'music', 'arrange.py')], { stdio: ['pipe', 'pipe', 'pipe'] });
    let o = '';
    let e = '';
    p.stdout.on('data', d => (o += d));
    p.stderr.on('data', d => (e += d));
    p.on('error', reject);
    p.on('close', code => (code === 0 ? resolve(o) : reject(new Error(`music failed: ${(e || o).slice(-1500)}`))));
    p.stdin.end(JSON.stringify(req));
  });
  const stats = JSON.parse(stdout.trim().split('\n').pop()!) as Omit<MusicStats, 'path'>;
  const { music: _, ...bare } = tl;
  writeFileSync(join(dir, 'music.json'), JSON.stringify({ key: musicKey(script, bare), score: script.score, ...stats }, null, 1));
  return { path: out, ...stats };
}
