# films/

One folder per film, named in kebab-case.

```
films/<name>/
  script.json     title, style, scenes, narration lines (the source of what is said and when)
  film.ts         defineFilm({ style, scenes: [...] }), in playing order
  scenes/<id>.ts  one file per scene; the file name matches the scene id
  NOTES.md        the film's working state: what's done, decisions, open tweaks
  recorded/       human voice takes, line-<n>.wav; each replaces the draft voice for that line
  assets/         files only this film uses (shared ones go in the top-level assets/)
```

## script.json

```json
{
  "title": "…",
  "style": "coasys",
  "size": [1920, 1080],
  "fps": 30,
  "scenes": [{ "id": "roots", "lines": [3, 4], "pace": "warm" }],
  "lines": [{ "n": 3, "text": "…", "parts": ["…", "…"] }]
}
```

- `size` and `fps` are optional (1920×1080, 30).
- `voice`: `{ "provider": "kokoro", "voice": "am_michael", "speed": 1 }` for draft narration, or leave
  it out for estimated timing only. `pronounce` maps written words to how they're said
  (`{ "AD4M": "Adam" }`); captions keep the written form.
- Writing for the voice: avoid starting or ending a short part with an initialism, and spell out
  what the voice stumbles on in `pronounce` rather than in the text.
- Scene `pace`: `open` (first scene), `warm` (default), `calm`, `end` (last). Override any of
  `lead`, `gap`, `tail`, `hold`; a scene with no lines needs `dur`.
- Split a line into `parts` at its natural pauses (about 6–12 words each) when a scene needs to time
  something to the second half of a sentence.
- Line numbers are stable ids, not positions. When a line is cut, don't renumber the rest.

## Scenes

```ts
export default defineScene('roots', ({ t0, t1, art, ui, text, stage }) => {
  const l3 = line(3);                       // times come from the timeline
  const globe = named('globe', svg('g', {}, art));   // build once, name what can be pointed at
  onFrame(t => { /* change attributes from t only */ });
}, { after: 0.5 });                          // optional overlap into the next scene
```

- Anchor every time to `t0`/`t1`, `line(n)` or `part(n, i)`, never to absolute seconds.
- Draw into the scene's own `art` (SVG), `ui` (DOM) and `text` (DOM). They're hidden outside the
  scene's window.
- Use the style's helpers and tokens (see its `REFERENCE.md`). No hex colours in scenes.
- Start the file with a one-line comment saying what the viewer sees, as a shot description.
- Name every element a reviewer might point at.

## NOTES.md

Keep it short and current. Its job is to let a fresh session pick up the film without the old
conversation:

- **State:** which scenes are drafted, reviewed, final.
- **Decisions:** what was chosen and why, in a line each.
- **Open tweaks:** review notes not yet done, with their times.
