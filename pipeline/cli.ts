// pnpm film <command> <film> [options]
//
//   timeline <film>                       print the scene and line times
//   stills <film> <t1,t2,…>               PNG stills at those seconds
//   sheet <film> [--at t1,t2,…] [--n 12]  one contact sheet (default: 12 frames across the film)
//   sheet <film> --scene <id> [--n 8]     a contact sheet across one scene
//   video <film> [--from s] [--to s]      the film, or a section of it, as a silent mp4
//
// Quiet by default: prints output paths and a one-line summary.
import { relative } from 'node:path';
import { open, sheet, stills, video } from './render.ts';
import { ROOT } from './script.ts';
import { buildTimeline } from './timeline.ts';

const [cmd, film, ...rest] = process.argv.slice(2);
const opt = (name: string) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
const rel = (p: string) => relative(ROOT, p);
const times = (s: string) => s.split(',').map(Number).filter(n => !Number.isNaN(n));
const spread = (a: number, b: number, n: number) =>
  Array.from({ length: n }, (_, i) => +(a + ((b - a) * (i + 0.5)) / n).toFixed(2));

async function main(): Promise<void> {
  if (!cmd || !film) {
    console.log('usage: pnpm film <timeline|stills|sheet|video> <film> [options]  (see pipeline/cli.ts)');
    process.exit(2);
  }
  const tl = buildTimeline(film);
  if (cmd === 'timeline') {
    for (const [id, s] of Object.entries(tl.scenes)) {
      console.log(`${id.padEnd(20)} ${s.t0.toFixed(2).padStart(7)} – ${s.t1.toFixed(2).padStart(7)}  lines ${s.lines.join(', ')}`);
    }
    console.log(`duration ${tl.duration}s, voice: ${tl.voice}`);
    return;
  }
  const t0 = Date.now();
  const s = await open(film);
  try {
    if (cmd === 'stills') {
      const at = rest[0] && !rest[0].startsWith('--') ? times(rest[0]) : [];
      if (!at.length) throw new Error('stills needs times, e.g. 2,6.5,10');
      for (const p of await stills(s, film, at)) console.log(rel(p));
    } else if (cmd === 'sheet') {
      const n = Number(opt('n') ?? 12);
      const sc = opt('scene');
      let at: number[];
      if (opt('at')) at = times(opt('at')!);
      else if (sc) {
        const r = tl.scenes[sc];
        if (!r) throw new Error(`no scene "${sc}"`);
        at = spread(r.t0, r.t1, n);
      } else at = spread(0, tl.duration, n);
      console.log(rel(await sheet(s, film, at)));
    } else if (cmd === 'video') {
      const from = Number(opt('from') ?? 0);
      const to = Number(opt('to') ?? tl.duration);
      let last = 0;
      const out = await video(s, film, from, to, (n, total) => {
        const pct = Math.floor((n / total) * 10);
        if (pct > last && process.stderr.isTTY) process.stderr.write(`\r${pct * 10}%`);
        last = pct;
      });
      if (process.stderr.isTTY) process.stderr.write('\r');
      console.log(rel(out));
    } else {
      throw new Error(`unknown command "${cmd}"`);
    }
  } finally {
    await s.close();
  }
  console.log(`${cmd} ${film}: done in ${((Date.now() - t0) / 1000).toFixed(1)}s (film ${tl.duration}s, voice: ${tl.voice})`);
}

main().catch(e => {
  console.error(`error: ${(e as Error).message}`);
  process.exit(1);
});
