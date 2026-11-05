# pipeline/

Turns a film into a timeline, frames and files. Runs under Node 24 directly (no build step: Node
strips the types), so only erasable TypeScript here: no enums, no parameter properties.

| file | what it does |
|---|---|
| `script.ts` | film ids, the markdown script parser, `cut.json`, pace presets, validation, film and build paths |
| `timeline.ts` | `buildTimeline(film)`: scenes and lines laid end to end from voice clips or reading-time estimates |
| `render.ts` | starts the dev server and headless Chrome; `stills`, `sheet` (contact sheet), `video` |
| `cli.ts` | `pnpm film <command> <film>`; see the header for commands |
| `voice.ts` | the voice step: recorded takes, Kokoro drafts, `timing.json`; voice samples |
| `voice/kokoro.py` | Kokoro TTS in the repo's `.venv` (set up once with `voice/setup.sh`) |
| `music.ts` | the music step: sends the timeline and cues to the arranger; `music.json` records what it was made for |
| `music/synth.py` | the shared synthesiser: instruments, filters, mixer, reverb, master (ported from Data) |
| `music/arrange.py` | chords per line, cuts, layers, cue sounds, using the film's score from `scores/` |

## Music and the mix

- `pnpm film music <film>` renders `build/<film>/music/music.wav`. The music records a key of the
  timeline it was made for; when the timing changes, the player drops it until it's rebuilt, and
  `pnpm film video` rebuilds it automatically.
- Cues come from the scenes' code, which the key can't see. After changing cues, re-run `music`.
- `pnpm film video` mixes the soundtrack: the music ducked under the voice with a sidechain
  compressor (threshold 0.015, ratio 5, attack 8 ms, release 900 ms, as in Data's films), a
  limiter, then one gain to the loudness target (`loudness` in cut.json, default -16 LUFS;
  YouTube plays at about -14). Loudness is measured with ffmpeg's `ebur128`, not `loudnorm`, which
  reads about 1 dB hot on short films.

## Voice

- `pnpm film voice <film>` voices only new or changed lines. A line is re-voiced when its text, its
  pronunciation, the voice or the speed changes; `--force` re-voices everything.
- A human take at `films/<film>/cuts/<cut>/recorded/<scene>-<i>.wav` (e.g. `users-2.wav`) always
  wins over the draft voice; it's normalised to -18 LUFS. If the
  line's text changes after recording, the old take and timing are kept and a warning says to
  re-record it.
- Recorded takes have no part times yet: `part(n, i)` falls back to an even split for them.
- `pnpm film voice-samples "<sentence>"` voices one sentence in 16 voices into
  `build/voice-samples/`, to choose one.
- Kokoro runs on the CPU at about twice real time; no GPU or service needed.

## Rules

- **Quiet by default.** Print output paths and one summary line. ffmpeg runs with
  `-loglevel error`; its stderr is shown only when it fails.
- **Never write into `films/`.** Everything a command produces goes to `build/<film>/`.
- **One timeline builder.** The dev server, the player and the renderer all call
  `buildTimeline`, so what you scrub is what renders.
- **Voice is a source, not a step baked in.** `build/<film>/<cut>/voice/timing.json` lists clips
  (`{ n, key, file, text, dur, parts? }`). A clip whose `text` no longer matches its line is ignored
  and the line falls back to its estimate, so editing a line never leaves stale timing. Drafts are
  reused by content (moving a line costs nothing); recorded takes by the line's key (`users-2`).

## Resolution

The stage is laid out at 1920×1080; `--scale 2` captures it at double pixel density, so text, SVG and
3D are drawn natively at 3840×2160 (about 3× the render time). On a 4K screen a 1080p video is
upscaled and looks soft next to the player.

**Drafts render at 1080p (the default); only the final output renders at `--scale 2`.** A soft
1080p draft on a 4K screen is expected, not a bug: judge detail in the player.

## Timing

Scenes run end to end. Each scene: `lead`, then its lines with `gap` between them, then `hold` and
`tail`. Presets (`pace` in `cut.json`): `open`, `warm` (default), `calm`, `end`. Without clips, a
line lasts its words / 2.8 s + 0.45 s per part + 0.35 s between parts.

## Still to come

Part times for recorded takes (from silence), captions (VTT), GPU flags for the 3D layer, real
audio files (sound effects, licensed music) alongside the synthesiser.
