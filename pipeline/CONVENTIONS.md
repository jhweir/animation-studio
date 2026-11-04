# pipeline/

Turns a film into a timeline, frames and files. Runs under Node 24 directly (no build step: Node
strips the types), so only erasable TypeScript here: no enums, no parameter properties.

| file | what it does |
|---|---|
| `script.ts` | the `script.json` format, pace presets, validation, film and build paths |
| `timeline.ts` | `buildTimeline(film)`: scenes and lines laid end to end from voice clips or reading-time estimates |
| `render.ts` | starts the dev server and headless Chrome; `stills`, `sheet` (contact sheet), `video` |
| `cli.ts` | `pnpm film <command> <film>`; see the header for commands |

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

Voice providers (local AI, recorded takes), music from cues, the audio mix, captions (VTT),
GPU flags for the 3D layer.
