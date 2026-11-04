# Coasys style: reference

Import from `styles/coasys/index.ts`. This page is the API; read the source only to change it.

## Tokens (`tokens.ts`)

`color.*`: `page #131533`, `bgDeep`, `surface`, `surface2`, `line`, `mint #88f3b4` (ours),
`mintLight`, `ink` (text on mint), `orange #ffba94` (value only), `steel #a9b4c8` (today's
platforms), `steelDark`, `blue #91e3fd` (bots), `purple #e1b7ff` (drafted by AI), `purpleLight`,
`text`, `text2`, `text3`, `danger #e73d58` (sparingly), `inkFigure`.

`moods.problem` (near-black, steel, red), `moods.blueprint` (navy grid, ink, lines, orange),
`moods.ours` (the page, mint). `font.film` (Bricolage Grotesque), `font.app` (DM Sans). `type.*`:
the type scale.

In HTML, the same colours are CSS variables on `#stage`: `--mint`, `--steel`, `--text-2`, ….

**Colour meanings are fixed:** mint = ours, steel = today's platforms, blue = bots, orange = value,
purple = proposed by AI, red = danger. Don't use a colour for anything else.

## Background (`background.ts`)

Mounted automatically: three drifting orbs and a vignette.

- `cover(parent, { t0, t1, color, fadeIn?, fadeOut? })`: a full-stage colour cover, for scenes in
  the problem or blueprint mood. Put it in `ctx.ui` (under the text) or `ctx.stage.background`.

## Words (`type.ts`)

- `caption(ctx.text, { label?, t0, t1, top?, rows: [[{ h, t }, …], …], small?, name? })`: a mint
  label pill over light 64 px rows; each piece rises in at its own `t`. `h` is HTML: `<em>` for a
  mint word (`em.warm`, `em.cold`, `em.red`), `<mark>` for a highlighter wipe, `<span class="dim">`.
  Pieces are inline blocks, so a trailing space collapses: end a piece with `&nbsp;` instead.
- `beat(ctx.text, { t0, t1, rows: [{ h, t, size? }], y?, size?, dim?, label?, punch?, name? })`:
  big 800-weight uppercase words that slam in; `dim` darkens the art behind; each row kicks the
  camera unless `punch: false`.
- `stageLabel(ctx.art, text, a, b, x?)`: an uppercase label at the top of the stage.
- `punch(t, amount?)`: a short scale kick of the art layer.
- `wipeMark(markEl, u)`: drive a highlighter mark yourself.

## Figures (`figures.ts`)

- `person(parent, r, fill?)`, `personPath(r)`: a filled head-and-shoulders, radius `r`.
- `bot(parent, r, stroke?)`: a bot at the same size as `person(r)`, blue by default.
- `hexPath(r)`: a point-up hexagon.
- `glyph.*`: path data for `key`, `check`, `laptop`, `phone`, `server`, `bot`, `cloud`.
- `tileGlyphs`: four abstract platform marks (never real logos).

## SVG filters

`filter="url(#glow)"` (soft) and `filter="url(#glowBig)"`.

## Still to port from Data's kit

Membrane groups (`cell`, `living`), DNA rings, the platform lattice, sealed app boxes, tiles, layer
bars, the big central AI, spaces, line-drawn walking people, the WE app window and phone, the
Coasys logo and lockup, the end card, counters, ripples. Port each when a film first needs it.
