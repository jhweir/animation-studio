// pnpm film <command> <film> [options]
//
//   timeline <film>                       print the scene and line times
//   stills <film> <t1,t2,…>               PNG stills at those seconds
//   sheet <film> [--at t1,t2,…] [--n 12]  one contact sheet (default: 12 frames across the film)
//   sheet <film> --scene <id> [--n 8]     a contact sheet across one scene
//   video <film> [--from s] [--to s]      the film, or a section of it, as an mp4 with its voice
//   voice <film> [--force]                voice new or changed lines (draft voice and recorded takes)
//   music <film>                          arrange and render the music with the film's score
//   voice-samples "<text>" [--voices a,b] [--speed 1]   one sentence in several voices, to choose one
//
// Quiet by default: prints output paths and a one-line summary.
import { join, relative } from 'node:path';
import { makeMusic } from './music.ts';
import { mixTrack, mux, open, sheet, stills, video, voiceTrack } from './render.ts';
import { loadScript, ROOT } from './script.ts';
import { buildTimeline } from './timeline.ts';
import { voiceFilm, voiceSamples } from './voice.ts';

const SAMPLE_VOICES = ['bf_emma', 'bf_isabella', 'bf_alice', 'bf_lily', 'bm_george', 'bm_daniel', 'bm_lewis', 'bm_fable',
  'af_heart', 'af_bella', 'af_nicole', 'af_sarah', 'am_michael', 'am_adam', 'am_eric', 'am_liam'];

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
    console.log('usage: pnpm film <timeline|stills|sheet|video|voice|voice-samples> <film> [options]  (see pipeline/cli.ts)');
    process.exit(2);
  }
  if (cmd === 'voice-samples') {
    const voices = opt('voices')?.split(',') ?? SAMPLE_VOICES;
    const t0 = Date.now();
    const out = await voiceSamples(film, voices, Number(opt('speed') ?? 1));
    console.log(rel(out[0].replace(/[^/]+$/, '')));
    console.log(`voice-samples: ${out.length} voices in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    return;
  }
  if (cmd === 'voice') {
    const t0 = Date.now();
    let done = 0;
    const r = await voiceFilm(film, {
      force: rest.includes('--force'),
      onLine: () => process.stderr.isTTY && process.stderr.write(`\rvoiced ${++done}`),
    });
    if (process.stderr.isTTY && done) process.stderr.write('\r');
    for (const w of r.warnings) console.log(`warning: ${w}`);
    const tl = buildTimeline(film);
    console.log(`voice ${film}: ${r.voiced.length} voiced, ${r.recorded.length} recorded takes, ${r.kept.length} unchanged` +
      ` in ${((Date.now() - t0) / 1000).toFixed(1)}s (film now ${tl.duration}s, voice: ${tl.voice})`);
    return;
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
      const picture = await video(s, film, from, to, (n, total) => {
        const pct = Math.floor((n / total) * 10);
        if (pct > last && process.stderr.isTTY) process.stderr.write(`\r${pct * 10}%`);
        last = pct;
      });
      if (process.stderr.isTTY) process.stderr.write('\r');
      const script = loadScript(film);
      let music = tl.music ? join(ROOT, tl.music.slice(1)) : undefined;
      if (script.score && !music) music = (await makeMusic(film, script, tl, s.meta.cues)).path;
      const track = await mixTrack(film, await voiceTrack(film, tl), music, script.loudness);
      console.log(rel(await mux(picture, track, from, Math.min(to, tl.duration))));
    } else if (cmd === 'music') {
      const r = await makeMusic(film, loadScript(film), tl, s.meta.cues);
      console.log(rel(r.path));
      console.log(`music: ${r.segments} chords, ${r.rms_dbfs} dBFS rms` +
        (r.silent_cues.length ? `; cues with no sound in this score: ${r.silent_cues.join(', ')}` : ''));
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
