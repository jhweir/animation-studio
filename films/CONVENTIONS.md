# films/

One folder per film. A film keeps its **script versions** as markdown and its **cuts**: buildable
versions of the film, each a script plus scenes plus settings. Several of each can exist side by
side; small revisions live in git history, not in copies.

```
films/<film>/
  NOTES.md                the film's working state: what's done, decisions, open tweaks
  scripts/<date>-<name>.md  script versions (the words)
  cuts/<cut>/             a buildable version of the film
    cut.json              which script, style, voice, score; per-scene pace and music
    film.ts               defineFilm({ style, scenes: [...] })
    scenes/<id>.ts        one file per scene that's been built
    recorded/<id>-<i>.wav human voice takes, e.g. users-2.wav; each replaces the draft voice
  shared/                 scene helpers more than one cut uses
```

A film id is `<film>/<cut>` (`broken-app-paradigm/short`); `<film>` alone works while it has one
cut. Output goes to `build/<film>/<cut>/`.

Copy a cut folder when you want a second take on the animation alive at the same time; copy a
script when you want two versions of the words. Otherwise edit in place and let git keep history.

## The script (markdown)

```markdown
# The broken app paradigm

## 1. Fighting on their ground {#their-ground}

A handful of companies now shape how billions of people communicate, find information and
organise. Their reach crept in slowly. Now it's everywhere.

> A blockquote is a note to ourselves, not narration.
```

- `#` is the title. Each `##` heading is a scene; `{#id}` names it (otherwise the id comes from the
  heading, numbering dropped). Keep ids stable once scenes and settings use them.
- Each paragraph is one narration line. Its sentences become its parts, so a scene can time to
  any sentence; ` / ` adds a split inside a sentence.
- Blockquotes, `###` headings, `---` rules and `<!-- comments -->` are ignored.
- Writing for the voice: avoid starting or ending a sentence with an initialism, and put what the
  voice stumbles on in `pronounce` in cut.json rather than respelling it in the script.

## cut.json

```json
{
  "script": "scripts/2026-11-05-short.md",
  "style": "coasys",
  "voice": { "provider": "kokoro", "voice": "am_michael" },
  "pronounce": { "AD4M": "Adam" },
  "score": "coasys-ambient",
  "scenes": {
    "their-ground": { "pace": "open", "music": { "mood": "shade", "layers": ["piano"] } }
  }
}
```

- `size` and `fps` are optional (1920×1080, 30). `loudness` sets the mix target (-16 LUFS).
- Per scene: `pace` (`open`, `warm` default, `calm`, `end`) or `lead`/`gap`/`tail`/`hold`; `dur`
  for a scene with no lines; `music` with `mood`, `layers` and `cut` (see the score's REFERENCE.md).
- Settings for a scene the script no longer has are an error, so a renamed scene can't silently
  lose its settings.

## Scenes

```ts
export default defineScene('their-ground', ({ t0, t1, art, ui, text, line, part, stage }) => {
  const l0 = line(0);                                  // the scene's first line
  const crept = part(0, 1);                            // its second sentence
  const globe = named('globe', svg('g', {}, art));     // build once; name what can be pointed at
  onFrame(t => { /* change attributes from t only */ });
}, { after: 0.5 });                                    // optional overlap into the next scene
```

- Lines are counted **within the scene** from 0 (`line(-1)` is the last), so editing another
  section never moves this one's animation.
- Anchor every time to `t0`/`t1`, `line(i)` or `part(i, j)`, never to absolute seconds.
- Draw into the scene's own `art` (SVG), `three` (3D), `ui` (DOM) and `text` (DOM).
- Use the style's helpers and tokens (its `REFERENCE.md`). No hex colours in scenes.
- Start the file with a one-line comment saying what the viewer sees.
- A scene in the script that the cut hasn't built yet shows the style's placeholder: its title and
  its narration, timed to the voice. List a scene in `film.ts` once it's built.

## Storyboards

Board a film in its real cut, so the drawings become the animation once they're approved:

- Build each scene as its key poses first (layout, drawings, simple moves between poses), and mark
  each pose in the scene's setup with `board(t, 'what the frame shows')`.
- `pnpm film board <film> [--scene <id>]` renders every marked frame, with its scene, the narration
  spoken at that moment and its note, to `build/<film>/<cut>/board/`: one PNG per frame, `index.html`
  (open it in a browser) and `board.png` (the whole board as one image). A scene with no `board()`
  frames gets one at its middle (its placeholder, until it's built).
- Rough drawing pieces made for a board can live in the cut (e.g. `cuts/<cut>/kit.ts`) while the
  imagery is being explored; move what's approved into the style.

## NOTES.md

Short and current, so a fresh session can pick the film up without the old conversation:
**state** (which scenes are drafted, reviewed, final), **decisions** (one line each, with why),
**open tweaks** (review notes not yet done, with their times).
