# engine/

Design-neutral machinery every film uses. Nothing in here knows about a colour, a font or a
brand: that belongs to a style.

## What's here

| file | what it does |
|---|---|
| `math.ts` | `clamp`, `lerp`, `prog`, `win`, `bump`, the easings (`eio`, `eout`, `ein`, `eback`), `rng`, SVG transform strings, `sunflower` |
| `color.ts` | `mix` (blend two colours), `alpha`, `hexToRgb` |
| `dom.ts` | `svg`, `div`, `text`, `set`, `vis`/`hvis` (visibility), `named`, `strokePath`/`drawOn` |
| `timeline.ts` | the `Timeline` type and `scene(id)`, `line(n)`, `part(n, i)` |
| `frame.ts` | `onFrame`, `afterFrame`, `cue`, `board` (a storyboard frame with a note), `waitFor`, and the render loop (a frame that waited on a load is drawn again once it lands) |
| `film.ts` | `defineScene`, `defineFilm`, the `Style` contract, the stage and its layers |
| `three.ts` | 3D: `layer3d(ctx)` (a WebGL canvas per scene, rendered after each frame), `isometric`/`perspective` cameras, `loadModel`, `meshes`; import it directly, only in scenes that use 3D |
| `race.ts` | `race(series, { rows, swap?, fade? })`: values over time ranked at any moment, for a bar-chart race. Data only: straight lines between points, `hold` or `end` after the last, smoothed rank positions (`pos`) so swaps slide. A style draws it |
| `env.ts` | `capturing`: true while the renderer captures frames; for *how* to draw only, never *what* |
| `boot.ts` | the entry of `stage.html`: loads a film and exposes `window.studio` |
| `index.ts` | the public API; scenes and styles import from `engine/index.ts` only |

## Rules

- **Pure frames.** An `onFrame` callback reads `t` and writes attributes and styles. It never keeps
  state between frames, reads the clock, or calls `Math.random()`.
- **Build once, change per frame.** Create elements in a scene's setup. In `onFrame`, only change
  them.
- **Times come from the timeline.** Anchor animation to `scene(id)`, `line(n)` and `part(n, i)`, not
  to absolute seconds, so a re-voiced line carries its animation with it.
- **No style here.** If a helper needs a colour or a font, it belongs in a style.
- **Keep the public API in `index.ts`.** Anything a scene may use is exported there; the rest is
  internal.

## The stage

Layers, bottom to top: `background` (DOM) → `art` (SVG) → `three` (WebGL) → `ui` (DOM, app screens)
→ `text` (DOM, captions and big words) → `overlay` (DOM, fades and end cards). Each scene gets its
own group in `art`, `three`, `ui` and `text`, shown only between its start and end (plus its `before`/`after` overlap).

The stage size and frame rate come from the cut's `cut.json` (`size`, `fps`). Scenes read
`ctx.stage.width` and `ctx.stage.height` rather than assuming 1920×1080.

## 3D

- Drive every object from `t` in `onFrame` (rotation, position, scale, material opacity); the layer
  renders in `afterFrame`, after all updates. No three.js clocks, animation mixers or physics.
- Models live in `assets/3d/` and load through `loadModel(url, onLoad)`; restyle them in `onLoad`
  with a style's 3D helpers (e.g. `glass` in `styles/coasys/three.ts`).
- The player can't see inside a canvas, so hover shows the 3D layer's one name (`layer3d(ctx, { name })`).
- Rendering uses SwiftShader (WebGL on the CPU). Chrome can reach the GPU in headless mode, but its
  screenshots then come out white; see pipeline/render.ts.
- The canvas draws at the capture's pixel density (1 for 1080p, 2 for 4K) and at least 2× in the
  player. Never let headless Chrome shrink a canvas: it picks pixels instead of averaging them, so
  thin lines step or break apart.

## Timing conventions (measured from Data's films)

- Most changes take 0.4–0.6 s; nothing over 3 s. Fade-outs run a little shorter than fade-ins.
- Pop-ins (`eback`) ≈ 0.45 s; arrivals (`eout`) ≈ 0.5 s; moves and zooms (`eio`) ≈ 0.8 s; flashes
  (`bump`) ≈ 0.85 s; lines drawn on ≈ 0.5 s.
- Between scenes: a hard cut, with each scene ending on the picture the next one starts from.
