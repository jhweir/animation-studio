// Frame capture: opens a film's stage in headless Chrome (served by the same Vite setup as the
// player), calls render(t) per frame and screenshots it.
import { spawn } from 'node:child_process';
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
  frame(t: number): Promise<Buffer>;
  close(): Promise<void>;
}

export async function open(film: string): Promise<Session> {
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
      args: ['--force-color-profile=srgb', '--hide-scrollbars'],
    });
    const errors: string[] = [];
    const page: Page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(String(e)));
    page.on('console', m => {
      // Failed requests are reported with their URL below.
      if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text());
    });
    page.on('response', r => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`${base}stage.html?film=${film}`);
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
      async frame(t: number) {
        await page.evaluate(tt => window.studio!.render(tt), t);
        if (errors.length) throw new Error(`page error at ${t}s:\n  ${errors.join('\n  ')}`);
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
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
    if (input) input(p.stdin!).then(() => p.stdin!.end(), reject);
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

/** The film (or a section of it) as a silent mp4. Returns its path. */
export async function video(s: Session, film: string, from = 0, to = s.meta.duration, onProgress?: (n: number, total: number) => void): Promise<string> {
  const { fps } = s.meta;
  const dir = join(buildDir(film), 'video');
  mkdirSync(dir, { recursive: true });
  const full = from === 0 && to >= s.meta.duration;
  const out = join(dir, full ? `${film}-picture.mp4` : `${film}-${stamp(from)}-${stamp(to)}.mp4`);
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
