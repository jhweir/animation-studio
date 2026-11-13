// Scene 7: one problem from two ends. Fine-grained needs on one side, small ideas on the other, and
// between them the only unit on offer: a whole app, far too big for either. "The unit is the wrong size."
import { board, defineScene, named, rng } from '../../../../../engine/index.ts';
import { appBox, at, beat, caps, color, mark, pose } from '../../../../../styles/coasys/index.ts';

export default defineScene('wrong-size', ctx => {
  const { art, text, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2);
  const r = rng(5);

  const two = named('two-ends', at(art));
  for (let i = 0; i < 30; i++) mark(two, Math.floor(r() * 4), 150 + (i % 5) * 75, 300 + Math.floor(i / 5) * 80, 1, color.mintLight);
  caps(two, 300, 820, 'needs: fine-grained, changing', { size: 22, fill: color.mint });
  for (let i = 0; i < 12; i++) mark(two, Math.floor(r() * 4), 1490 + (i % 3) * 100, 360 + Math.floor(i / 3) * 110, 1.3, color.orange);
  caps(two, 1590, 820, 'ideas: small, specific', { size: 22, fill: color.orange });
  const unit = named('whole-app-unit', at(two, 960, 520));
  appBox(unit, 620, 460, { parts: Array(6).fill('plain'), seed: 90 });
  caps(unit, 0, 290, 'the only unit: a whole app', { size: 24, fill: color.steel });
  pose(two, ctx.t0, t1 + 1);
  pose(unit, ctx.part(1, 2).v0, t1 + 1);

  beat(text, { t0: l2.v0, t1: t1 + 0.5, dim: 0.6, rows: [{ h: 'The unit is', t: l2.v0 + 0.1 }, { h: 'the wrong size.', t: l2.v0 + 0.8 }] });

  board(ctx.part(1, 1).v1, 'Left: a field of fine-grained needs (mint marks). Right: a handful of small ideas (orange). Nothing between them yet.');
  board(l1.v1, 'A whole app drops in between, far bigger than any need or idea: the only unit this paradigm offers.');
  board(l2.v1, 'Big words over the dimmed picture: "The unit is the wrong size."');
});
