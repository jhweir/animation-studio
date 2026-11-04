# animation-studio

Films drawn in code. Read [README.md](README.md) for the layout, then the `CONVENTIONS.md` of the
directory you are working in.

## The one rule

Every frame is a pure function of time. Inside `onFrame(t => …)`, set attributes and styles from
`t` only: no clocks, no `Math.random()`, no state carried from the previous frame, no CSS
animations or transitions. Scrubbing backwards, rendering out of order and rendering a single
section all rely on this. Use `rng(seed)` from the engine for randomness.

## Working with James

- James reviews in the player and points at a time and a named element. Make that one change in
  the scene that owns the element; don't re-read or rewrite the rest of the film.
- Name every element a reviewer might point at (`named('globe', el)`), so the player shows it on
  hover.
- Visual choices come from the film's style. Don't invent colours or type outside the style's
  tokens; if the style lacks something, add it to the style, not to a scene.

## Resolution

Drafts render at 1080p (the default). Only a final output renders in 4K (`--scale 2`, about 3× the
time). James reviews on a 4K screen, so a 1080p draft looks softer than the player: that's expected.

## Keeping token use down

- Read a style's `REFERENCE.md`, not its source, to find a helper. Open the source only to change it.
- To check frames yourself, render one contact sheet (`pnpm film sheet <film> --at …`) and read
  that, not a series of full-size stills.
- Pipeline commands are quiet by default; they print errors and a one-line summary. Don't pipe
  ffmpeg or Chrome logs into the conversation.
- Start a fresh session per film section. `films/<film>/NOTES.md` carries the state across sessions:
  keep it current (what's done, decisions, open tweaks).

## Checks

- `pnpm typecheck` before every commit.
- After a change to the engine or a style, render the example film's contact sheet to prove nothing
  broke: `pnpm film sheet example`.

## Commits

Small commits per step, in the imperative mood. Never commit `build/`.
