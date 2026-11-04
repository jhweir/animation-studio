"""The shared synthesiser: instruments, envelopes, filters, a stereo mixer with reverb, and the
master. numpy only. Scores (scores/<name>/score.py) build on this; nothing here knows a chord or
a mood. Ported from Data's film kit (tools/music.py), sound unchanged.
"""
import wave

import numpy as np

SR = 48000


def midi(m: float) -> float:
    """Frequency of a MIDI note (69 = A4 = 440 Hz)."""
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n: int, a: float, r: float) -> np.ndarray:
    """Linear attack over a seconds, cosine release over r seconds, flat between."""
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    na = min(na, n // 2)
    nr = min(nr, n - na)
    if na > 0:
        e[:na] = np.linspace(0, 1, na)
    if nr > 0:
        e[-nr:] *= 0.5 * (1 + np.cos(np.linspace(0, np.pi, nr)))
    return e


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def highpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1e-3)) ** 4)
    return np.fft.irfft(X, len(x))


def conv(x: np.ndarray, h: np.ndarray) -> np.ndarray:
    n = len(x) + len(h) - 1
    nf = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(h, nf), nf)[: len(x)]


class Instruments:
    """Every instrument returns a mono signal starting at 0. Seeded, so a score renders the same twice."""

    def __init__(self, seed: int = 42):
        self.rng = np.random.default_rng(seed)

    def pad(self, freq: float, n: int, bright: float) -> np.ndarray:
        """Soft detuned pad with a slow swell."""
        rng = self.rng
        t = np.arange(n) / SR
        out = np.zeros(n)
        for det in (-0.12, 0.0, 0.11):
            f = freq * (1 + det / 100)
            ph = rng.uniform(0, 2 * np.pi)
            for k, amp in ((1, 1.0), (2, 0.32 * bright), (3, 0.14 * bright), (4, 0.06 * bright)):
                out += amp * np.sin(2 * np.pi * f * k * t + ph * k)
        lfo = 1 + 0.18 * np.sin(2 * np.pi * rng.uniform(0.07, 0.15) * t + rng.uniform(0, 6))
        return out * lfo / 3

    def bowed(self, freq: float, n: int) -> np.ndarray:
        """Bowed strings: band-limited saw, slow bow swell, a little vibrato."""
        rng = self.rng
        t = np.arange(n) / SR
        vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t + rng.uniform(0, 6))
        ph = 2 * np.pi * np.cumsum(freq * vib) / SR
        out = np.zeros(n)
        for k in range(1, 14):
            if freq * k > 9000:
                break
            out += np.sin(k * ph + rng.uniform(0, 6)) / k
        return out * (1 + 0.25 * np.sin(2 * np.pi * 0.21 * t + rng.uniform(0, 6)))

    def pluck(self, freq: float, dur: float = 1.2, tau: float = 0.35, bright: float = 0.4) -> np.ndarray:
        n = int(dur * SR)
        t = np.arange(n) / SR
        e = np.exp(-t / tau) * np.minimum(1, t / 0.004)
        s = np.sin(2 * np.pi * freq * t) + bright * np.sin(4 * np.pi * freq * t) * np.exp(-t / (tau * 0.4))
        s += 0.12 * np.sin(2 * np.pi * freq * 3 * t) * np.exp(-t / (tau * 0.25))
        return s * e

    def piano(self, freq: float, dur: float = 4.0, vel: float = 1.0) -> np.ndarray:
        """A soft felt piano: slightly inharmonic partials, faster decay up high, a little hammer noise."""
        rng = self.rng
        n = int(dur * SR)
        t = np.arange(n) / SR
        s = np.zeros(n)
        b = 0.0004
        for k, amp in ((1, 1.0), (2, 0.42), (3, 0.2), (4, 0.1), (5, 0.05), (6, 0.03)):
            fk = freq * k * np.sqrt(1 + b * k * k)
            if fk > 12000:
                break
            s += amp * np.sin(2 * np.pi * fk * t + rng.uniform(0, 6)) * np.exp(-t / (1.6 / (1 + 0.5 * k)))
        s = lowpass(s, 900 + 2200 * vel)
        hammer = highpass(lowpass(rng.standard_normal(n), 3000), 400) * np.exp(-t / 0.01) * 0.04
        return (s + hammer) * np.minimum(1, t / 0.006) * vel

    def bell(self, freq: float, dur: float = 3.0, tau: float = 1.0) -> np.ndarray:
        n = int(dur * SR)
        t = np.arange(n) / SR
        s = np.zeros(n)
        for ratio, amp, tk in ((1, 1, 1), (2.0, 0.45, 0.6), (2.76, 0.3, 0.4), (5.4, 0.12, 0.2), (8.93, 0.05, 0.1)):
            s += amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t / (tau * tk))
        return s * np.minimum(1, t / 0.003)

    def noise_burst(self, dur: float, lo: float, hi: float, tau: float) -> np.ndarray:
        n = int(dur * SR)
        t = np.arange(n) / SR
        x = highpass(lowpass(self.rng.standard_normal(n), hi), lo)
        return x * np.exp(-t / tau) * np.minimum(1, t / 0.002)

    def thud(self, dur: float = 0.9) -> np.ndarray:
        n = int(dur * SR)
        t = np.arange(n) / SR
        f = 34 + 60 * np.exp(-t / 0.05)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.28) + 0.4 * self.noise_burst(dur, 80, 900, 0.04)

    def shimmer(self, freq: float, dur: float = 1.4) -> np.ndarray:
        n = int(dur * SR)
        t = np.arange(n) / SR
        e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
        s = np.sin(2 * np.pi * freq * t) + np.sin(2 * np.pi * freq * 1.004 * t) + 0.5 * np.sin(2 * np.pi * freq * 2.003 * t)
        return s * e * (0.75 + 0.25 * np.sin(2 * np.pi * 7 * t))

    def wood(self, freq: float, dur: float = 0.5) -> np.ndarray:
        n = int(dur * SR)
        t = np.arange(n) / SR
        f = freq * (1 + 0.25 * np.exp(-t / 0.012))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09) + 0.35 * np.sin(4 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)
        return (s + 0.25 * self.noise_burst(dur, 200, 1800, 0.012)) * np.minimum(1, t / 0.002)

    def click(self, freq: float = 2600, dur: float = 0.06) -> np.ndarray:
        n = int(dur * SR)
        t = np.arange(n) / SR
        return np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.008) + 0.3 * self.noise_burst(dur, 2000, 9000, 0.006)


class Mixer:
    """Stereo buses with a dry and a reverb send. A score adds signals at times; `cuts` split the film
    into buses so that everything before a cut can decay to silence at it (reverb tail included)."""

    def __init__(self, duration: float, cuts: list[tuple[float, float]] = ()):
        self.duration = duration
        self.n = int(duration * SR)
        # each cut: (decay start, cut time). Bus i holds sounds that start before cut i.
        self.cuts = sorted(cuts, key=lambda c: c[1])
        self.buses = [dict(L=np.zeros(self.n), R=np.zeros(self.n), wL=np.zeros(self.n), wR=np.zeros(self.n))
                      for _ in range(len(self.cuts) + 1)]

    def cut_times(self) -> list[float]:
        return [c for _, c in self.cuts]

    def add(self, sig: np.ndarray, t: float, gain: float = 1.0, pan: float = 0.0, wet: float = 0.35) -> None:
        i0 = int(t * SR)
        if i0 >= self.n or i0 < 0:
            return
        sig = sig[: self.n - i0]
        bus = self.buses[sum(1 for c in self.cut_times() if t >= c)]
        pan = min(1.0, max(-1.0, pan))  # out of range gives sqrt(<0) = NaN, which silences the whole score
        gl, gr = gain * np.sqrt(0.5 * (1 - pan)), gain * np.sqrt(0.5 * (1 + pan))
        bus['L'][i0:i0 + len(sig)] += sig * gl * (1 - wet * 0.5)
        bus['R'][i0:i0 + len(sig)] += sig * gr * (1 - wet * 0.5)
        bus['wL'][i0:i0 + len(sig)] += sig * gl * wet
        bus['wR'][i0:i0 + len(sig)] += sig * gr * wet

    def _decay(self, f0: float, cut: float) -> np.ndarray:
        t = np.arange(self.n) / SR
        u = np.clip((t - f0) / max(cut - f0, 0.05), 0, 1)
        return 0.5 * (1 + np.cos(np.pi * u))

    def master(self, path: str) -> dict:
        """Reverb, gentle saturation, fades, peak at -3 dBFS; writes a 48 kHz stereo wav."""
        ir_n = int(2.8 * SR)
        tt = np.arange(ir_n) / SR
        irs = []
        for seed in (1, 2):
            r2 = np.random.default_rng(seed)
            ir = lowpass(r2.standard_normal(ir_n) * np.exp(-tt / 0.65), 5000)
            ir[: int(0.012 * SR)] = 0
            irs.append(ir / np.sqrt(np.sum(ir ** 2)))
        L = np.zeros(self.n)
        R = np.zeros(self.n)
        for i, b in enumerate(self.buses):
            gain = self._decay(*self.cuts[i]) if i < len(self.cuts) else 1
            L += (b['L'] + conv(b['wL'], irs[0]) * 0.9) * gain
            R += (b['R'] + conv(b['wR'], irs[1]) * 0.9) * gain
        mix = np.stack([highpass(L, 28), highpass(R, 28)], axis=1)
        peak = np.max(np.abs(mix))
        if peak > 0:
            mix = mix / peak * 0.85
            mix = np.tanh(mix * 1.1) / np.tanh(1.1)
        fade_in, fade_out = int(0.4 * SR), int(2.2 * SR)
        mix[:fade_in] *= np.linspace(0, 1, fade_in)[:, None]
        mix[-fade_out:] *= (0.5 * (1 + np.cos(np.linspace(0, np.pi, fade_out))))[:, None]
        peak = np.max(np.abs(mix))
        if peak > 0:
            mix *= 10 ** (-3.0 / 20) / peak
        with wave.open(path, 'wb') as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((mix * 32767).astype('<i2').tobytes())
        rms = float(np.sqrt(np.mean(mix ** 2)))
        return {'duration': self.duration, 'rms_dbfs': round(20 * np.log10(rms + 1e-12), 1)}
