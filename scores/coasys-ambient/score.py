"""coasys-ambient: the sound of Data's Coasys films. Soft pads, a felt piano, bowed strings, plucks
and bells over a slow reverb. Moods follow the story: shade (calm opener), dark (the problem),
lift (something rises), warm (ours), resolve (the close). See REFERENCE.md.
"""
from synth import SR, env_adsr, highpass, lowpass, midi

# Chords are MIDI notes, lowest first.
GMAJ9, EM9, CMAJ9, GMAJ7 = [43, 50, 57, 59, 62, 66], [40, 52, 55, 59, 62, 66], [36, 48, 55, 59, 62, 64], [43, 50, 55, 59, 62, 66]
ASUS2, DM_ADD9 = [45, 52, 57, 59, 64], [38, 50, 57, 64, 65]
D_ADD9 = [38, 50, 57, 62, 64, 66]
DMAJ9, A_ADD9 = [38, 50, 57, 61, 64, 66], [45, 52, 57, 61, 64, 69]

MOODS = {
    # soft suspended pads: a calm opening
    'shade': dict(chords=[GMAJ9, EM9, CMAJ9, GMAJ7], voice='pad', bright=0.6, cutoff=1300, gain=0.042, wet=0.55, bass=0.045),
    # bowed and low: the problem
    'dark': dict(chords=[ASUS2, DM_ADD9], voice='bowed', cutoff=900, gain=0.032, wet=0.35, bass=0.08),
    # one bright chord that swells in quickly: something rises
    'lift': dict(chords=[D_ADD9], voice='pad', bright=1.0, cutoff=2200, gain=0.06, wet=0.55, bass=0.045, attack=0.9),
    # warm and moving: ours
    'warm': dict(chords=[GMAJ9, DMAJ9, EM9, A_ADD9, [47, 54, 59, 62, 66, 69], GMAJ7, DMAJ9, A_ADD9, D_ADD9,
                         [47, 54, 59, 62, 64, 69], [43, 55, 59, 62, 66, 71]],
                 voice='pad', bright=1.0, cutoff=2200, gain=0.058, wet=0.55, bass=0.045),
    # the close: Dmaj9, turning to A(add9) on the last part of a line
    'resolve': dict(chords=[DMAJ9, A_ADD9], voice='pad', bright=1.0, cutoff=2200, gain=0.058, wet=0.55, bass=0.045),
}

# Held from the last spoken word to the end (the end card): Dmaj9 (add6).
END_CHORD = [38, 50, 57, 62, 64, 66, 69]
END_MOOD = 'warm'

PENTA = [62, 64, 66, 69, 71, 74, 76, 78, 81, 83]


# ---------------------------------------------------------------- layers: ctx, span -> None
def piano(ctx, span):
    """Low, sparse felt piano through the chords, stopping before the span's last word fades."""
    t, k = span.t0 + 0.5, 0
    while t < span.voice_end + 0.1 - 0.3:
        ch = ctx.chord_at(t)
        tones = sorted(set(m if m >= 50 else m + 12 for m in ch[1:]))
        m = tones[[0, 2, 1, 3, 2][k % 5] % len(tones)]
        ctx.mix.add(ctx.ins.piano(midi(m), 3.6, 0.55 + 0.1 * ((k * 7) % 3) / 2), t, 0.09, 0.25 if k % 2 else -0.25, 0.5)
        if k % 4 == 0:  # a low root every fourth note
            ctx.mix.add(ctx.ins.piano(midi(ch[0] if ch[0] >= 36 else ch[0] + 12), 4.0, 0.5), t, 0.08, 0.0, 0.4)
        k += 1
        t += 1.45 + 0.25 * ((k * 5) % 3) / 2


def heartbeat(ctx, span):
    """A soft low pluck pulse on the chord's root at 100 bpm (root, fifth, octave, fifth)."""
    beat = 60 / 100
    for s in ctx.segments_in(span.t0, span.t1):
        r = s.notes[0] + 12 if s.notes[0] < 36 else s.notes[0]
        pat = [0, 7, 12, 7]
        t, k = max(s.a, span.t0) + 0.3, 0
        while t < min(s.b, span.t1) - 0.02:
            ctx.mix.add(ctx.ins.pluck(midi(r + pat[k % len(pat)]), 0.5, 0.14, 0.35), t, 0.035, 0.2 if k % 2 else -0.2, 0.2)
            k += 1
            t += beat


def strings(ctx, span):
    """Warm bowed strings that swell in at the span's start and stay."""
    xf = 1.2
    for s in ctx.segments_in(span.t0, span.t1):
        s0, s1 = max(span.t0, s.a - xf / 2), min(ctx.duration, s.b + xf / 2, span.t1 + xf / 2)
        n = int((s1 - s0) * SR)
        if n <= 0:
            continue
        notes = [s.notes[0] + 12 if s.notes[0] < 40 else s.notes[0]] + s.notes[1:4]
        sig = sum(ctx.ins.bowed(midi(m), n) * w for m, w in zip(notes, (0.7, 0.6, 0.5, 0.35)))
        first = s.a <= span.t0 + 1
        ctx.mix.add(highpass(lowpass(sig, 1600), 70) * env_adsr(n, 2.5 if first else xf, xf if s.b < ctx.duration else 3.5), s0, 0.024, 0.0, 0.5)


def arpeggio(ctx, span):
    """A thin, steady arpeggio of plucks over the chords (96 bpm eighths, every other step)."""
    step = 60 / 96 / 2
    for s in ctx.segments_in(span.t0, span.t1):
        tones = sorted(set((m if m >= 57 else m + 12) for m in s.notes[1:]))
        pattern = [0, 2, 1, 3, 2, 1] if len(tones) >= 4 else [0, 1, 2, 1]
        k, t = 0, max(s.a, span.t0)
        while t < min(s.b, span.t1) - 0.05:
            if k % 2 == 0:
                m = tones[pattern[k % len(pattern)] % len(tones)] + 12
                ctx.mix.add(ctx.ins.pluck(midi(m), 0.7, 0.16, 0.25), t, 0.024, 0.35 if k % 4 else -0.35, 0.55)
            k += 1
            t += step


LAYERS = {'piano': piano, 'heartbeat': heartbeat, 'strings': strings, 'arpeggio': arpeggio}


# ---------------------------------------------------------------- cue sounds: ctx, cue -> None
def _pan(ctx):
    return float(ctx.ins.rng.uniform(-0.5, 0.5))


def hit(ctx, c):
    """Big words landing: a low piano note in shade, a soft knock in dark, a pluck on the root otherwise."""
    t, mood = c['t'], ctx.mood_at(c['t'])
    if mood == 'shade':
        ctx.mix.add(ctx.ins.piano(midi(ctx.chord_at(t)[0] + 12), 3.0, 0.6), t, 0.12, 0.0, 0.4)
    elif mood == 'dark':
        ctx.mix.add(ctx.ins.thud(0.7), t, 0.14, 0.0, 0.2)
    else:
        ctx.mix.add(ctx.ins.pluck(midi(ctx.chord_at(t)[0] + 24), 1.4, 0.4, 0.2), t, 0.06, 0.0, 0.45)


def lift(ctx, c):
    """A rising piano figure and bells."""
    t = c['t']
    for j, m in enumerate([62, 66, 69, 74]):
        ctx.mix.add(ctx.ins.piano(midi(m), 3.5, 0.7), t + j * 0.28, 0.1, -0.3 + 0.2 * j, 0.55)
    for j, m in enumerate([74, 78, 81]):
        ctx.mix.add(ctx.ins.bell(midi(m), 3.0, 1.2), t + 1.2 + j * 0.12, 0.04, -0.3 + 0.3 * j, 0.7)


def final(ctx, c):
    """The end card: a spread chord of bells."""
    for j, m in enumerate([62, 69, 74, 78, 81]):
        ctx.mix.add(ctx.ins.bell(midi(m), 5.0, 1.6), c['t'] + j * 0.06, 0.06, -0.4 + 0.2 * j, 0.65)


def crack(ctx, c):
    """Something breaking: a scatter of bright noise."""
    t = c['t']
    for j in range(7):
        ctx.mix.add(ctx.ins.noise_burst(0.08, 2500, 14000, 0.01), t + 0.03 + j * 0.045 + ctx.ins.rng.uniform(0, 0.02), 0.1, -0.3, 0.3)
    ctx.mix.add(ctx.ins.noise_burst(0.5, 1500, 12000, 0.05), t, 0.18, -0.3, 0.35)


def lock(ctx, c):
    """A padlock closing: two clicks."""
    ctx.mix.add(ctx.ins.click(1800, 0.07), c['t'], 0.2, 0.4, 0.3)
    ctx.mix.add(ctx.ins.click(1200, 0.08), c['t'] + 0.09, 0.24, 0.4, 0.3)


def mesh(ctx, c):
    """Many things connecting: a fast sweep of high plucks."""
    for j in range(14):
        ctx.mix.add(ctx.ins.pluck(midi(PENTA[(j * 3) % len(PENTA)] + 12), 0.5, 0.1, 0.1), c['t'] + j * 0.05, 0.028, -0.8 + j * 0.11, 0.5)


def tap(ctx, c):
    """A wooden tap; `i` steps through three notes and across the stereo field."""
    i = c.get('i', 0)
    ctx.mix.add(ctx.ins.wood(midi([64, 67, 71][i % 3]), 0.6), c['t'], 0.11, -0.4 + 0.4 * i, 0.4)


def tick(ctx, c):
    i = c.get('i', 0)
    ctx.mix.add(ctx.ins.click(2200 + 120 * i, 0.05), c['t'], 0.06, -0.7 + 0.18 * i, 0.25)


def one(ctx, c):
    """A single, important moment: a low piano octave and a bell."""
    t = c['t']
    ctx.mix.add(ctx.ins.piano(midi(64), 4.5, 0.6), t, 0.11, 0.0, 0.55)
    ctx.mix.add(ctx.ins.piano(midi(52), 4.5, 0.5), t, 0.07, 0.0, 0.5)
    ctx.mix.add(ctx.ins.bell(midi(76), 4.0, 1.4), t + 0.05, 0.03, 0.0, 0.7)


def step(ctx, c):
    """Two soft footsteps."""
    ctx.mix.add(ctx.ins.noise_burst(0.12, 150, 900, 0.03), c['t'], 0.035, -0.3, 0.3)
    ctx.mix.add(ctx.ins.noise_burst(0.12, 150, 900, 0.03), c['t'] + 0.32, 0.03, 0.3, 0.3)


CUES = {
    'seed': lambda ctx, c: (ctx.mix.add(ctx.ins.bell(midi(74), 4, 1.3), c['t'], 0.12, 0, 0.6),
                            ctx.mix.add(ctx.ins.bell(midi(81), 4, 1.1), c['t'] + 0.02, 0.06, 0.3, 0.6)),
    'grow': lambda ctx, c: ctx.mix.add(ctx.ins.shimmer(midi(86), 2.2), c['t'], 0.03, 0, 0.7),
    'pop': lambda ctx, c: ctx.mix.add(ctx.ins.pluck(midi(int(ctx.ins.rng.choice([69, 74, 76]))), 0.9, 0.18, 0.5), c['t'], 0.08, _pan(ctx), 0.4),
    'braid': lambda ctx, c: ctx.mix.add(ctx.ins.shimmer(midi(90), 1.2), c['t'], 0.02, 0, 0.7),
    'tick': tick,
    'crack': crack,
    'thud': lambda ctx, c: ctx.mix.add(ctx.ins.thud(), c['t'], 0.2, 0.3, 0.25),
    'lock': lock,
    'mesh': mesh,
    'drop': lambda ctx, c: ctx.mix.add(ctx.ins.pluck(midi(62), 0.9, 0.2, 0.3), c['t'], 0.08, -0.2, 0.35),
    'hit': hit,
    'lift': lift,
    'shimmer': lambda ctx, c: ctx.mix.add(ctx.ins.shimmer(midi(81), 2.5), c['t'], 0.02, 0, 0.7),
    'final': final,
    'land': lambda ctx, c: ctx.mix.add(ctx.ins.pluck(midi(69), 0.9, 0.2, 0.3), c['t'], 0.06, -0.2, 0.35),
    'tap': tap,
    'one': one,
    'step': step,
    'slide': lambda ctx, c: ctx.mix.add(ctx.ins.bell(midi(69), 3.5, 1.4), c['t'], 0.045, 0.2, 0.7),
    'keep': lambda ctx, c: (ctx.mix.add(ctx.ins.bell(midi(74), 4.5, 1.6), c['t'], 0.05, -0.2, 0.7),
                            ctx.mix.add(ctx.ins.bell(midi(78), 4.5, 1.4), c['t'] + 0.08, 0.03, 0.2, 0.7)),
    'ripple': lambda ctx, c: ctx.mix.add(ctx.ins.shimmer(midi(81), 2.8), c['t'], 0.03, -0.6, 0.7),
    'warm': lambda ctx, c: ctx.mix.add(ctx.ins.shimmer(midi(78), 2.0), c['t'], 0.02, 0.2, 0.7),
}

# Cue kinds that are deliberately silent in this score.
SILENT = {'caption'}
