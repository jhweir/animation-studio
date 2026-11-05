# player/

The timeline player: `pnpm dev`, then `http://localhost:5173/player.html?film=<name>`.

It loads `stage.html?film=<name>` in an iframe, scales it to fit, and calls the film's
`render(t)` as you scrub or play. Nothing is rendered ahead, so any frame is one call away.

## What it does

- **Track:** scenes on top, spoken lines below (hover for the text), sound cues as ticks. Click or
  drag to seek.
- **Keys:** space play/pause, ←/→ one frame, shift+←/→ one second, `[`/`]` previous/next scene,
  home/end.
- **Hover names:** the nearest named element under the cursor is outlined and shown as
  `scene › name`. Clicking the stage copies `at 12.43s, group › bot` for a review note.
- **Reloads keep your place:** the time lives in the URL hash, and Vite reloads the page whenever a
  film file, `cut.json` or script changes.

## Rules

- The player is a dev tool with its own neutral look (`player.css`); it never uses a film's style.
- It only talks to the stage through `window.studio` (`meta`, `render`, `ready`) and the DOM's
  `data-name` / `data-scene` attributes. Anything new it needs goes into that API in `engine/boot.ts`.
- Playback is real time × speed and skips frames a heavy scene can't keep up with. The render
  pipeline never skips: judge smoothness from a rendered section, not from the player.

## Sound

Each line's clip plays from the audio clock, which also drives the time while playing, so picture
and voice stay in sync. The music plays too when it was made for the current timing, ducked under
the voice roughly as the final mix does. Both are muted below 1× and can be switched off
(remembered per browser). For the exact balance, listen to a rendered section.

## Still to come

A loop range, draggable cues.
