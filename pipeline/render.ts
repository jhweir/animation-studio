// Frame capture: opens a film's stage in headless Chrome (served by the same Vite setup as the
// player), calls render(t) per frame and screenshots it.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser, type CDPSession, type Page } from 'playwright-core';
import { createServer, type ViteDevServer } from 'vite';
import type { Cue } from '../engine/frame.ts';
import type { Timeline } from '../engine/timeline.ts';
import { buildDir, ROOT } from './script.ts';

type Meta = Timeline & { cues: Cue[] };

export interface Session {
  meta: Meta;
  /** Pixel density of the capture: 1 = the stage size (1080p), 2 = double (4K). */
  scale: number;
  frame(t: number): Promise<Buffer>;
  close(): Promise<void>;
}

export async function open(film: string, scale = 1): Promise<Session> {
  const server: ViteDevServer = await createServer({
    configFile: join(ROOT, 'vite.config.ts'),
    logLevel: 'error',
    server: { port: 0, hmr: false, watch: null },
  });
  await server.listen();
  const base = server.resolvedUrls?.local[0];
  if (!base) throw new Error('dev server did not start');
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROME ?? '/usr/bin/google-chrome',
      // WebGL runs on SwiftShader (the CPU). The GPU flags (--enable-gpu --use-angle=vulkan) do reach the
      // RTX 5070, but screenshots then come out white, and light scenes rendered slower anyway.
      args: ['--force-color-profile=srgb', '--hide-scrollbars'],
    });
    const errors: string[] = [];
    const page: Page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => {
      // Failed requests are reported with their URL below.
      if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text());
    });
    page.on('response', r => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`${base}stage.html?film=${film}&capture=1`); // capture: see engine/env.ts
    await page.waitForFunction(() => window.studio !== undefined || document.querySelector('pre') !== null, null, { timeout: 30000 });
    if (errors.length) throw new Error(`stage failed to load:\n  ${errors.join('\n  ')}`);
    const failed = await page.evaluate(() => document.querySelector('pre')?.textContent ?? null);
    if (failed) throw new Error(failed);
    await page.evaluate(() => window.studio!.ready);
    const meta = await page.evaluate(() => window.studio!.meta);
    await page.setViewportSize({ width: meta.width, height: meta.height });
    const cdp: CDPSession = await page.context().newCDPSession(page);
    return {
      meta,
      scale,
      async frame(t: number) {
        await page.evaluate(tt => window.studio!.render(tt), t);
        if (errors.length) throw new Error(`page error at ${t}s:\n  ${errors.join('\n  ')}`);
        // A clip with a scale: without one, DevTools returns CSS pixels even at double density.
        const clip = { x: 0, y: 0, width: meta.width, height: meta.height, scale };
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip });
        return Buffer.from(data, 'base64');
      },
      async close() {
        await browser?.close();
        await server.close();
      },
    };
  } catch (e) {
    await browser?.close();
    await server.close();
    throw e;
  }
}

function run(cmd: string, args: string[], input?: (stdin: NodeJS.WritableStream) => Promise<void>): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: [input ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr?.on('data', d => (err += d));
    p.on('error', reject);
    p.on('close', code => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}: ${err.slice(-800)}`))));
    if (input) {
      // If the process dies mid-stream, writing raises EPIPE; let 'close' report its stderr instead.
      p.stdin!.on('error', () => {});
      input(p.stdin!).then(() => p.stdin!.end(), reject);
    }
  });
}

const stamp = (t: number) => t.toFixed(2).padStart(7, '0');

/** PNG stills at the given times. Returns their paths. */
export async function stills(s: Session, film: string, times: number[]): Promise<string[]> {
  const dir = join(buildDir(film), 'stills');
  mkdirSync(dir, { recursive: true });
  const out: string[] = [];
  for (const t of times) {
    const path = join(dir, `t-${stamp(t)}.png`);
    writeFileSync(path, await s.frame(t));
    out.push(path);
  }
  return out;
}

/** One contact sheet: small frames at the given times, each labelled with its time. */
export async function sheet(s: Session, film: string, times: number[], maxCols = 4): Promise<string> {
  const cols = Math.min(maxCols, times.length);
  const tmp = join(buildDir(film), 'sheets', 'tmp');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });
  for (const [i, t] of times.entries()) writeFileSync(join(tmp, `f-${String(i).padStart(3, '0')}.png`), await s.frame(t));
  const label = join(tmp, 'labels.txt');
  writeFileSync(label, times.map(t => t.toFixed(1)).join('\n'));
  const rows = Math.ceil(times.length / cols);
  const font = join(ROOT, 'styles', 'coasys', 'fonts', 'DMSans-var.ttf');
  const out = join(buildDir(film), 'sheets', `sheet-${stamp(times[0])}-${stamp(times[times.length - 1])}.png`);
  // Each frame: scaled to 480 wide, its time in the corner; then tiled.
  const inputs = times.flatMap((_, i) => ['-i', join(tmp, `f-${String(i).padStart(3, '0')}.png`)]);
  const scaled = times
    .map((t, i) => `[${i}:v]scale=480:-1,drawtext=fontfile='${font}':text='${t.toFixed(1)}s':x=10:y=10:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=6[f${i}]`)
    .join(';');
  const pad = rows * cols - times.length;
  const blanks = pad ? `;color=black:s=480x${Math.round((480 * s.meta.height) / s.meta.width)}:d=1,split=${pad}${Array.from({ length: pad }, (_, i) => `[b${i}]`).join('')}` : '';
  const all = times.map((_, i) => `[f${i}]`).join('') + Array.from({ length: pad }, (_, i) => `[b${i}]`).join('');
  const filter = times.length === 1
    ? scaled.replace(/\[f0\]$/, '[out]')
    : `${scaled}${blanks};${all}xstack=inputs=${rows * cols}:layout=${layout(rows, cols, s.meta)}:fill=black[out]`;
  await run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filter, '-map', '[out]', '-frames:v', '1', out]);
  rmSync(tmp, { recursive: true, force: true });
  return out;
}

function layout(rows: number, cols: number, meta: Meta): string {
  const w = 480;
  const h = Math.round((w * meta.height) / meta.width);
  const cells: string[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(`${c * w}_${r * h}`);
  return cells.join('|');
}

/**
 * The voice track for the whole film: every line's clip placed at its start time. Written to
 * build/<film>/voice/track.wav. Returns undefined when no line has a clip.
 */
export async function voiceTrack(film: string, meta: Timeline): Promise<string | undefined> {
  const clips = Object.values(meta.lines).filter(l => l.clip);
  if (!clips.length) return undefined;
  const out = join(buildDir(film), 'voice', 'track.wav');
  const inputs = clips.flatMap(l => ['-i', join(ROOT, l.clip!.slice(1))]);
  const delays = clips.map((l, i) => {
    const ms = Math.round(l.v0 * 1000);
    return `[${i}:a]aresample=48000,aformat=channel_layouts=mono,adelay=${ms}|${ms}[v${i}]`;
  });
  const mix = `${clips.map((_, i) => `[v${i}]`).join('')}amix=inputs=${clips.length}:normalize=0:duration=longest,apad=whole_dur=${meta.duration},atrim=0:${meta.duration}[out]`;
  await run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', `${delays.join(';')};${mix}`, '-map', '[out]', '-ar', '48000', '-ac', '1', out]);
  return out;
}

/**
 * The film's soundtrack: music ducked under the voice (a sidechain compressor, as in Data's films),
 * limited, then brought to the loudness target. Written to build/<film>/mix.wav.
 */
export async function mixTrack(film: string, voice: string | undefined, music: string | undefined, loudness = -16): Promise<string | undefined> {
  if (!voice && !music) return undefined;
  const out = join(buildDir(film), 'mix.wav');
  const raw = join(buildDir(film), 'mix-raw.wav');
  const norm = 'alimiter=limit=0.95';
  let graph: string;
  let inputs: string[];
  if (voice && music) {
    inputs = ['-i', music, '-i', voice];
    graph = '[0:a]volume=1.2[m];[1:a]aformat=channel_layouts=stereo,asplit=2[sc][v];' +
      '[m][sc]sidechaincompress=threshold=0.015:ratio=5:attack=8:release=900:makeup=1[md];' +
      `[md][v]amix=inputs=2:normalize=0:duration=first,${norm}[out]`;
  } else {
    inputs = ['-i', (voice ?? music)!];
    graph = `[0:a]aformat=channel_layouts=stereo,${norm}[out]`;
  }
  await run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', graph, '-map', '[out]', '-ar', '48000', '-ac', '2', raw]);
  // Two passes: measure the loudness, then one gain to the target, with a limiter catching the
  // peaks the gain pushes over -1 dBFS.
  // (ebur128, not loudnorm's own measurement: that reads ~1 dB hot on short films.)
  const probe = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', raw, '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' });
  const measured = [...probe.stderr.matchAll(/^\s+I:\s+(-?[\d.]+) LUFS/gm)].pop()?.[1];
  if (!measured) throw new Error('could not measure the mix loudness');
  const gain = loudness - Number(measured);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.89:level=false`, '-ar', '48000', out]);
  rmSync(raw);
  return out;
}

/** Put the soundtrack under a picture file (the whole film or the section from..to). Returns the final mp4. */
export async function mux(picture: string, track: string | undefined, from: number, to: number): Promise<string> {
  const out = picture.replace(/-picture\.mp4$/, '.mp4');
  const audio = track
    ? ['-ss', String(from), '-t', String(to - from), '-i', track]
    : ['-f', 'lavfi', '-t', String(to - from), '-i', 'anullsrc=r=48000:cl=mono'];
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', picture, ...audio, '-map', '0:v', '-map', '1:a',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out]);
  rmSync(picture);
  return out;
}

/** The film (or a section of it) as a picture-only mp4, ready for mux(). Returns its path. */
export async function video(s: Session, film: string, from = 0, to = s.meta.duration, onProgress?: (n: number, total: number) => void): Promise<string> {
  const { fps } = s.meta;
  const dir = join(buildDir(film), 'video');
  mkdirSync(dir, { recursive: true });
  const full = from === 0 && to >= s.meta.duration;
  const res = s.scale === 1 ? '' : `-${s.meta.height * s.scale}p`;
  const name = film.replaceAll('/', '-'); // broken-app-paradigm/short -> broken-app-paradigm-short
  const out = join(dir, `${full ? name : `${name}-${stamp(from)}-${stamp(to)}`}${res}-picture.mp4`);
  const n0 = Math.round(from * fps);
  const n1 = Math.round(to * fps);
  await run('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709', '-movflags', '+faststart', out,
  ], async stdin => {
    for (let n = n0; n < n1; n++) {
      const buf = await s.frame(n / fps);
      if (!stdin.write(buf)) await new Promise(r => stdin.once('drain', r));
      onProgress?.(n - n0 + 1, n1 - n0);
    }
  });
  return out;
}
