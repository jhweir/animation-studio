# animation-studio

Explainer animations drawn in code. Every frame is a pure function of time: a film exposes
`render(t)`, and the same call drives the live player (scrub to any moment) and the final render
(headless Chrome captures each frame and pipes it into ffmpeg).

Nothing here needs a paid service. Drawing, timing, rendering and (later) music and draft
narration all run on this machine.

## Quick start

You need Node 24, pnpm, Google Chrome and ffmpeg.

```bash
pnpm install
pipeline/voice/setup.sh                    # once: Python venv + Kokoro model (~350 MB) for draft voice
pnpm dev                                   # open http://localhost:5173/player.html?film=example
pnpm film voice example                    # voice new or changed lines
pnpm film stills example 2,6,10            # PNG stills at those seconds
pnpm film sheet example                    # one contact sheet across the whole film
pnpm film video example                    # the full film as an mp4
pnpm film video example --from 4 --to 9    # one section
```

Output lands in `build/<film>/` (git-ignored).

## Layout

```
engine/      design-neutral: timeline, easing, DOM/SVG helpers, the frame loop, cues, layers
styles/      design styles a film picks by name; each has tokens, fonts, helpers and a REFERENCE.md
assets/      files shared across films: svg, 3d, audio, voices (each with its source and licence)
films/       one folder per film: script.json, film.ts, scenes/, NOTES.md
player/      the timeline player (scrub, play, markers, hover names), served by `pnpm dev`
pipeline/    timeline builder, renderer (stills, contact sheets, video), CLI
```

Each directory has a `CONVENTIONS.md`. Start with [CLAUDE.md](CLAUDE.md) for the working rules.

## The loop

1. Write or edit the film's `script.json` (scenes and narration lines).
2. Write scenes in `films/<film>/scenes/`. Open the player; it reloads on every save and keeps
   the current time.
3. Review in the player. Hover an element to see its name, copy the time, and ask for a change
   ("at 42.3s, make `globe` smaller").
4. Render a section, then the film.

## Roadmap

- **Sound:** music from cues (porting Data's synthesiser), sound effects, the mix, captions.
- **3D:** a three.js layer between art and ui, driven by `t`; the WE cube as its first model; GPU
  rendering in headless Chrome.
- **Coasys vocabulary:** membranes, lattice, sealed boxes, WE app chrome, end card, as films need them.
- **Player:** audio in sync, loop a range, draggable cues.

## Credits

The scene model, the Coasys drawing vocabulary, the timing conventions and the render approach
come from Data's Coasys film kit (`coasys/film-kit`), adapted here into typed modules with the
engine split from the style.

Fonts: Bricolage Grotesque and DM Sans, both under the SIL Open Font License (licence files sit
next to the fonts).
