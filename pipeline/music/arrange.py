"""Arranges a film's music from its timeline, then renders it with the film's score.

  .venv/bin/python -I pipeline/music/arrange.py < request.json

request: {"score": path to scores/<name>/score.py, "out": wav path, "duration": s, "seed": int,
          "scenes": [{"id", "t0", "t1", "music": {"mood", "layers", "cut"}, "lines": [{"v0", "v1", "parts"}]}],
          "cues": [{"t", "kind", ...}]}

The arrangement is generic: one chord per spoken line from the scene's mood (cycling through the
mood's chords), crossfaded; a scene with "cut" makes everything before it decay to silence at its
start; layers play over the scenes that list them; each cue becomes the score's sound for its kind.
After the last line, the score's end chord holds to the end. A score supplies the sounds: MOODS,
END_CHORD, LAYERS, CUES (see scores/CONVENTIONS.md).
"""
import importlib.util
import json
import os
import sys
from dataclasses import dataclass, field

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np  # noqa: E402

from synth import SR, Instruments, Mixer, env_adsr, highpass, lowpass, midi  # noqa: E402

XF = 1.2  # chord crossfade, seconds


@dataclass
class Segment:
    a: float
    b: float
    notes: list[int]
    mood: str


@dataclass
class Span:
    """A stretch of the film a layer plays over: from t0 to t1, with its last spoken word at voice_end."""
    t0: float
    t1: float
    voice_end: float
    first: bool = True


@dataclass
class Ctx:
    mix: Mixer
    ins: Instruments
    segments: list[Segment]
    duration: float
    cuts: list[float] = field(default_factory=list)

    def chord_at(self, t: float) -> list[int]:
        for s in self.segments:
            if s.a <= t < s.b:
                return s.notes
        return self.segments[-1].notes if self.segments else [50, 57, 62]

    def mood_at(self, t: float) -> str:
        for s in self.segments:
            if s.a <= t < s.b:
                return s.mood
        return self.segments[-1].mood if self.segments else 'warm'

    def segments_in(self, t0: float, t1: float) -> list[Segment]:
        return [s for s in self.segments if s.b > t0 and s.a < t1]


def load_score(path: str):
    spec = importlib.util.spec_from_file_location('score', path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def arrange(req: dict, score) -> tuple[list[Segment], list[tuple[float, float]], dict[str, list[Span]]]:
    scenes = req['scenes']
    lines = [(sc, ln) for sc in scenes for ln in sc['lines']]
    # cuts: (decay start = the previous scene's last word + 0.1, cut = this scene's start)
    cuts = []
    last_word = 0.0
    for sc in scenes:
        if sc['music'].get('cut') and sc['t0'] > 0:
            cuts.append((min(last_word + 0.1, sc['t0'] - 0.05), sc['t0']))
        if sc['lines']:
            last_word = sc['lines'][-1]['v1']
    cut_times = [c for _, c in cuts]
    end_at = (lines[-1][1]['v1'] + 0.15) if lines else req['duration']

    segments: list[Segment] = []
    counters: dict[str, int] = {}

    def chord(mood: str) -> list[int]:
        chords = score.MOODS[mood]['chords']
        i = counters.get(mood, 0)
        counters[mood] = i + 1
        return chords[i % len(chords)]

    for i, (sc, ln) in enumerate(lines):
        mood = sc['music'].get('mood', 'warm')
        if mood not in score.MOODS:
            raise SystemExit(f"scene {sc['id']}: the score has no mood '{mood}' (has: {', '.join(score.MOODS)})")
        first_in_scene = ln is sc['lines'][0]
        a = 0.0 if i == 0 else ln['v0']
        if first_in_scene and sc['t0'] in cut_times:
            a = sc['t0']  # nothing after a cut starts before it
        b = lines[i + 1][1]['v0'] if i + 1 < len(lines) else end_at
        nxt = next((c for c in cut_times if a < c <= b), None)
        if nxt is not None:
            b = nxt  # the last chord before a cut ends at it
        # a resolving scene turns on its lines' last part
        parts = ln.get('parts')
        if mood == 'resolve' and parts and len(parts) > 1 and parts[-1][0] > a:
            segments.append(Segment(a, parts[-1][0], chord(mood), mood))
            segments.append(Segment(parts[-1][0], b, chord(mood), mood))
        else:
            segments.append(Segment(a, b, chord(mood), mood))
    if end_at < req['duration']:
        segments.append(Segment(end_at, req['duration'], score.END_CHORD, score.END_MOOD))
    segments = [s for s in segments if s.b > s.a]

    # layer spans: consecutive scenes that list a layer merge into one span
    spans: dict[str, list[Span]] = {}
    for sc in scenes:
        voice_end = sc['lines'][-1]['v1'] if sc['lines'] else sc['t1']
        for name in sc['music'].get('layers', []):
            if name not in score.LAYERS:
                raise SystemExit(f"scene {sc['id']}: the score has no layer '{name}' (has: {', '.join(score.LAYERS)})")
            lst = spans.setdefault(name, [])
            if lst and abs(lst[-1].t1 - sc['t0']) < 1e-3 and sc['t0'] not in cut_times:
                lst[-1].t1 = sc['t1']
                lst[-1].voice_end = voice_end
            else:
                lst.append(Span(sc['t0'], sc['t1'], voice_end))
    return segments, cuts, spans


def play_chords(ctx: Ctx, score) -> None:
    for s in ctx.segments:
        m = score.MOODS[s.mood] if s.mood in score.MOODS else score.MOODS[score.END_MOOD]
        s0 = s.a if s.a in ctx.cuts else max(0.0, s.a - XF / 2)
        s1 = s.b if s.b in ctx.cuts else min(ctx.duration, s.b + XF / 2)
        n = int((s1 - s0) * SR)
        if n <= 0:
            continue
        sig = np.zeros(n)
        if m['voice'] == 'bowed':
            for j, note in enumerate(s.notes):
                sig += ctx.ins.bowed(midi(note + 12 if note < 40 else note), n) * (0.8 if j else 0.5)
            sig = highpass(lowpass(sig, m['cutoff']), 70)
        else:
            for j, note in enumerate(s.notes):
                sig += ctx.ins.pad(midi(note + 12 if note < 45 else note), n, m['bright']) * (0.9 if j else 0.6)
            sig = lowpass(sig, m['cutoff'])
        att = m.get('attack', XF if s.a > 0 else 2.0)
        if s.a in ctx.cuts:
            att = 0.05
        rel = 0.05 if s.b in ctx.cuts else (XF if s.b < ctx.duration else 3.5)
        e = env_adsr(n, att, rel)
        ctx.mix.add(sig * e, s0, gain=m['gain'], wet=m['wet'])
        root = midi(s.notes[0] - 12 if s.notes[0] >= 40 else s.notes[0])
        tt = np.arange(n) / SR
        bass = np.sin(2 * np.pi * root * tt) + 0.25 * np.sin(4 * np.pi * root * tt)
        ctx.mix.add(bass * e, s0, gain=m['bass'], wet=0.1)


def main() -> None:
    req = json.load(sys.stdin)
    score = load_score(req['score'])
    segments, cuts, spans = arrange(req, score)
    mix = Mixer(req['duration'], cuts)
    ctx = Ctx(mix, Instruments(req.get('seed', 42)), segments, req['duration'], [c for _, c in cuts])
    play_chords(ctx, score)
    for name, lst in spans.items():
        for k, span in enumerate(lst):
            span.first = k == 0
            score.LAYERS[name](ctx, span)
    unknown = set()
    for c in req['cues']:
        f = score.CUES.get(c['kind'])
        if f:
            f(ctx, c)
        elif c['kind'] not in getattr(score, 'SILENT', set()):
            unknown.add(c['kind'])
    stats = mix.master(req['out'])
    stats['silent_cues'] = sorted(unknown)
    stats['segments'] = len(segments)
    print(json.dumps(stats))


if __name__ == '__main__':
    main()
