# scores/

A score is a music style a film picks by name (`"score": "coasys-ambient"`), independent of its
visual style. Scores are Python on top of the shared synthesiser in `pipeline/music/synth.py`; the
arranger (`pipeline/music/arrange.py`) decides *when* things play, the score decides *how they
sound*.

## How a film's music is arranged

- **One chord per spoken line,** taken in turn from the scene's mood, crossfaded over 1.2 s.
- **A scene with `"cut": true`:** everything before it decays to silence at its start, reverb tail
  included. Use it where the story turns (problem → ours).
- **A `resolve` scene** turns to its next chord on the last part of each line.
- **After the last spoken word,** the score's end chord holds to the end of the film.
- **Layers** play over the scenes that list them; consecutive scenes share one span.
- **Cues** set by scenes (`cue(t, 'hit')`, captions, beats…) each play the score's sound for that
  kind. Kinds the score doesn't know are reported by `pnpm film music`.

## Shape of a score

```
scores/<name>/
  score.py       MOODS, END_CHORD, END_MOOD, LAYERS, CUES, SILENT
  REFERENCE.md   its moods, layers and cue kinds, one line each: what they sound like and when to use them
```

- `MOODS[name]`: `chords` (lists of MIDI notes, lowest first), `voice` (`pad` or `bowed`),
  `bright`, `cutoff` (Hz), `gain`, `wet` (reverb send), `bass` (gain), optional `attack` (s).
- `LAYERS[name](ctx, span)`: adds notes between `span.t0` and `span.t1`; `span.voice_end` is the
  span's last spoken word.
- `CUES[kind](ctx, cue)`: adds the sound for one cue at `cue['t']`.
- `ctx` gives `mix.add(signal, t, gain, pan, wet)`, the instruments (`ctx.ins.piano(...)`, `pad`,
  `bowed`, `pluck`, `bell`, `shimmer`, `wood`, `click`, `thud`, `noise_burst`), `chord_at(t)`,
  `mood_at(t)`, `segments_in(t0, t1)`.

## Rules

- **Seeded:** use `ctx.ins.rng`, never `random`, so a score renders the same every time.
- **Pans stay in -1..1.** Out of range gives NaN, which silences the whole score.
- **Keep levels in the score's range.** The master normalises the peak; the final mix sets loudness.
  A new sound that's much louder than its neighbours pushes everything else down.
- **REFERENCE.md is the API** for choosing moods and layers in `script.json`; update it with the score.
