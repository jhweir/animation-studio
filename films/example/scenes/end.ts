// Line 4: a caption in two parts, then the stage fades to the deep background.
import { defineScene, div, hvis, onFrame, part, prog } from '../../../engine/index.ts';
import { caption } from '../../../styles/coasys/index.ts';

export default defineScene('end', ({ t0, t1, text, stage }) => {
  const a = part(4, 0);
  const b = part(4, 1);
  caption(text, {
    name: 'closing-caption',
    label: 'The player',
    t0,
    t1,
    top: 430,
    rows: [[{ h: 'Scrub anywhere.', t: a.v0 }], [{ h: '<span class="dim">Nothing is rendered ahead.</span>', t: b.v0 }]],
  });
  const fade = div('fade', stage.overlay);
  onFrame(t => hvis(fade, prog(t, t1 - 0.8, t1)));
});
