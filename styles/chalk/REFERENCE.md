# chalk: reference

Near-black ground, chalk-white lines, Inter. Meaning is a glow in the **aurora** (green → blue →
purple). Only a whole system glows, never a single part, and each aurora gradient spans the whole
it lights: a part shows one hue, only the whole shows the spectrum.

Import everything from `styles/chalk/index.ts`.

## Tokens (`tokens.ts`)

`color.bg` ground · `ink` chalk · `muted` secondary lines, labels, unlit network · `dim` panel
frames, horizon · `faint` closed door · `card` raised surfaces · `paper` book pages · `a1` `a2` `a3`
the aurora stops. `font.film` is Inter.

## Timing and camera (`anim.ts`)

| helper | what it's for |
|---|---|
| `sent(ctx, i, j)` | sentence j of the scene's line i; safe for single-part lines and out-of-range j |
| `along(ctx, i, f)` | a time a fraction f through line i |
| `appear(el, t, at, dur?)` | fade in from `at`; returns progress |
| `during(el, t, a, b, in?, out?)` | show between a and b with soft edges |
| `camera(g, x, y, s, cx?, cy?)` | put world point (x, y) at the stage centre at scale s |
| `cameraPath(keys, t, ease?)` | interpolate `[t, x, y, s]` keys; scale moves geometrically |
| `place(g, x, y, s?, r?)` | move a group (translate, rotate, scale) |
| `quad(a, c, b, u)` | point on a quadratic curve, for cards and books in flight |

## Paint (`paint.ts`)

| helper | what it's for |
|---|---|
| `aurora(x1, x2, y1?, y2?)` | a gradient url in the using element's coordinates; span the whole system |
| `spot(cx, cy, r, strength?)` | a soft white pool of light (spotlights, lamplight) |
| `mask(build)` | a mask url; draw white into it |
| `pattern(w, h)` | `[url, el]`: a user-space tiling pattern (the endless library) |
| `label(parent, x, y, s, { color, size, anchor })` | bold tracked caps (SVG) |
| `words(parent, x, y, s, { color, size, anchor, weight })` | light SVG words that move with the picture |
| `say(text, html, at, out, { top, size, name })` | a one-line caption in the text layer; `<em>` sets words in the aurora |
| `title(text, s, at, out, top?)` | the film's title in the aurora |

Filters: `url(#glow)` (soft) and `url(#glowBig)`.

## Figures (`figures.ts`)

| helper | draws |
|---|---|
| `group(parent, attrs?)` | an SVG group |
| `glyph(parent, x, y, s, seed, stroke?, sw?)` | an abstract glyph (never a real character) |
| `card(parent, w, h, seed)` | `{ g, glyphs }`: a slip with a row of glyphs, centred on its origin |
| `standing(parent, x, y, h)` | stick figure, feet at (x, y) |
| `seated(parent, x, y, s?)` | stick figure seated facing right with chair; (x, y) = head |
| `sleeper(parent, x, y, s?)` | figure asleep on a bed; (x, y) = head |
| `book(parent, x, y, s?)` | an open book |
| `room(parent, x, y, s?, { lamp, reader, man, name })` | the cutaway room (1000 × 640): `{ g, light, man, book, stack, reader, at }`; `at` has stage points for slot, desk, hand, head |
| `chip(parent, x, y, s?)` | a microchip |
| `neuron(parent, x, y, s?, seed?, stroke?)` | a neuron with dendrites and an axon |
| `lock(parent, x, y, s?)` | a padlock |
| `bubble(parent, x, y, w, h, tail?)` | a speech bubble |
| `thought(parent, cx, cy, rx, ry, tx, ty, dashed?)` | a thought bubble trailing to (tx, ty) |
| `panel(parent, x, y, w, h)` | a rounded frame for side-by-side comparisons |
| `headProfile(parent, x, y, s?)` | a head in profile facing right |
| `shelves(parent, x, y, w, rows, seed)` | a front-on bookshelf |

## Systems (`systems.ts`)

| helper | draws |
|---|---|
| `brain(parent, cx, cy, k, { n, seed, thalamus, name })` | side-on brain with a cortex network. Returns `{ g, at, light, thalamus, thalamusDot, mesh, lit }`; `light(f)` lights each cell and connection by `f(x, y) → 0..1` |
| `brainSpots` | unit coordinates of thalamus, auditory, wernicke, broca, motor, stem; map with `brain.at()` |
| `modelNet(parent, x, y, w, h, { seed, name })` | a model's layered network: `{ g, light(u), lock(u) }` |
