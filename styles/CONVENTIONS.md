# styles/

A style is a design language a film picks by name: its tokens, fonts, background, and the
helpers that draw its vocabulary (people, groups, platforms, captions…). `coasys` is the first.

## Shape of a style

```
styles/<name>/
  index.ts        the Style object (default export) + re-exports of every helper
  tokens.ts       colours, moods, fonts, type scale
  style.css       @font-face, CSS variables (in step with tokens.ts), shared CSS, scoped to #stage
  fonts/          font files with their licences next to them
  <topic>.ts      helpers grouped by what they draw: background, type, figures, groups, platforms, ui…
  REFERENCE.md    one page: every exported helper with its signature and what it's for
```

## Rules

- **REFERENCE.md is the API.** Update it in the same commit as any helper change. Claude reads it
  instead of the source, so a missing entry means a helper nobody finds.
- **Tokens are the only source of colour and type.** Helpers take colours from `tokens.ts`; scenes
  don't hard-code hex values.
- **Colour has meaning.** Each style says what its colours stand for (in Coasys: mint = ours, steel =
  today's platforms…) and keeps to it.
- **Helpers follow the engine's rules:** build once, change in `onFrame`, pure in `t`. Name what a
  reviewer might point at.
- **Promote, don't copy.** When a scene invents something another film could use, move it into the
  style rather than copying it between films.
- **Small files by topic.** A helper file over ~300 lines should split.
- **CSS is scoped to `#stage`,** so a style never leaks into the player.

## Adding a style

Copy `coasys/`'s shape, replace the tokens and fonts, and implement `mount(stage)` for its
background. Start with captions and big words; add vocabulary as films need it.
