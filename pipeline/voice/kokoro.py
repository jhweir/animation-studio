"""Kokoro text-to-speech for the voice step (pipeline/voice.ts). Loads the model once, then voices
every job it is given.

stdin:  {"model": path, "voices": path, "jobs": [{"out": wav path, "parts": [text, ...],
         "voice": "bf_emma", "speed": 1.0, "lang": "en-gb"}]}
stdout: one JSON line per job: {"out": path, "dur": seconds, "parts": [[start, end], ...]}

Parts are voiced one by one and joined with a short pause, so each part's start and end are exact.
Only needs kokoro-onnx and soundfile (see pipeline/voice/setup.sh).
"""
import json
import sys

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

PART_PAUSE = 0.35  # seconds between parts, as in pipeline/timeline.ts


def main() -> None:
    req = json.load(sys.stdin)
    k = Kokoro(req['model'], req['voices'])
    for job in req['jobs']:
        chunks, bounds, t, sr = [], [], 0.0, 24000
        for i, text in enumerate(job['parts']):
            audio, sr = k.create(text, voice=job['voice'], speed=job.get('speed', 1.0), lang=job.get('lang', 'en-us'))
            if i:
                chunks.append(np.zeros(int(PART_PAUSE * sr), dtype=np.float32))
                t += PART_PAUSE
            chunks.append(audio)
            d = len(audio) / sr
            bounds.append([round(t, 3), round(t + d, 3)])
            t += d
        sf.write(job['out'], np.concatenate(chunks), sr)
        print(json.dumps({'out': job['out'], 'dur': round(t, 3), 'parts': bounds}), flush=True)


if __name__ == '__main__':
    main()
