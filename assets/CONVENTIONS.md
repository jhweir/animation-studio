# assets/

Files shared across films. Something only one film uses lives in that film's `assets/` instead.

```
assets/
  svg/      icons, figures, holons, globe outlines
  3d/       models (glTF/GLB)
  audio/
    sfx/    short sounds for cues
    music/  beds and stems
  voices/   reference clips and voice models for narration
  SOURCES.md
```

## Rules

- **Every file has a source and a licence.** Add a row to `SOURCES.md` in the same commit: file,
  where it came from (made here, a URL, a person), licence, any limits on use. A file without a row
  doesn't get used in a film.
- **Voices need consent.** A cloned voice needs the speaker's written OK for this use, recorded in
  `SOURCES.md`. Built-in voices of a TTS model carry that model's licence (check it allows
  commercial use before a film is published).
- **Prefer drawing in code.** A shape the style can draw (people, bots, membranes) belongs in the
  style as a helper, not here as an SVG. `svg/` is for things that are genuinely drawn by hand or
  come from elsewhere.
- **SVGs are recolourable.** Use `currentColor` or no fill, so a style's tokens set the colour.
- **Large binaries stay out of git** (voice models, long recordings): `.gitignore` excludes them
  under `voices/`. Note in `SOURCES.md` where to get them.
- kebab-case file names.
