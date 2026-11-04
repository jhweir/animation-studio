# pipeline/

Turns a film into a timeline, frames and files. Runs under Node 24 directly (no build step: Node
strips the types), so only erasable TypeScript here: no enums, no parameter properties.

| file | what it does |
|---|---|
| `script.ts` | the `script.json` format, pace presets, validation, film and build paths |
| `timeline.ts` | `buildTimeline(film)`: scenes and lines laid end to end from voice clips or reading-time estimates |
| `render.ts` | starts the dev server and headless Chrome; `stills`, `sheet` (contact sheet), `video` |
| `cli.ts` | `pnpm film <command> <film>`; see the header for commands |
| `voice.ts` | the voice step: recorded takes, Kokoro drafts, `timing.json`; voice samples |
| `voice/kokoro.py` | Kokoro TTS in the repo's `.venv` (set up once with `voice/setup.sh`) |

## Voice

- `pnpm film voice <film>` voices only new or changed lines. A line is re-voiced when its text, its
  pronunciation, the voice or the speed changes; `--force` re-voices everything.
- A human take at `films/<film>/recorded/line-<n>.wav` always wins over the draft voice. If the
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
- **Voice is a source, not a step baked in.** `build/<film>/voice/timing.json` lists clips
  (`{ n, file, text, dur, parts? }`). A clip whose `text` no longer matches its line is ignored and
  the line falls back to its estimate, so editing a line never leaves stale timing.

## Timing

Scenes run end to end. Each scene: `lead`, then its lines with `gap` between them, then `hold` and
`tail`. Presets (`pace` in `script.json`): `open`, `warm` (default), `calm`, `end`. Without clips, a
line lasts its words / 2.8 s + 0.45 s per part + 0.35 s between parts.

## Still to come

Part times for recorded takes (from silence), music from cues, the audio mix and loudness,
captions (VTT), GPU flags for the 3D layer.
