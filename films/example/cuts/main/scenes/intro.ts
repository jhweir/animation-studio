// Line 1 as big words: "EVERY FRAME / IS A FUNCTION OF TIME", second row with a mint mark.
import { defineScene } from '../../../../../engine/index.ts';
import { beat } from '../../../../../styles/coasys/index.ts';

export default defineScene('intro', ({ t0, t1, text, part }) => {
  const a = part(0, 0);
  const b = part(0, 1);
  beat(text, {
    name: 'headline',
    t0,
    t1,
    y: 360,
    size: 104,
    rows: [
      { h: 'Every frame', t: a.v0 + 0.05 },
      { h: 'is a <mark>function of time</mark>', t: b.v0 + 0.1 },
    ],
  });
});
