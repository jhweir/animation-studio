// Scene 8: life's branching lineage (blueprint ink) grows left to right and turns mint as it becomes a
// web of communities; then the title, with the loop.
import { board, defineScene, drawOn, named, onFrame, prog, rng, strokePath } from '../../../../../engine/index.ts';
import { beat, color, moods } from '../../../../../styles/coasys/index.ts';
import { at, community, loop, pose } from '../kit.ts';

export default defineScene('close', ctx => {
  const { art, text, t1 } = ctx;
  const l1 = ctx.line(1);

  // A branching lineage: each branch splits as it runs right. Left half in ink, right half in mint.
  const tree = named('lineage-to-communities', at(art));
  const r = rng(21);
  const branches: { d: string; x0: number }[] = [];
  const grow = (x: number, y: number, depth: number) => {
    if (depth > 5) return;
    for (const dir of [-1, 1]) {
      const x1 = x + 210 + r() * 60, y1 = y + dir * (220 / (depth + 1)) * (0.7 + r() * 0.6);
      branches.push({ d: `M ${x} ${y} C ${x + 100} ${y} ${x1 - 100} ${y1} ${x1} ${y1}`, x0: x });
      grow(x1, y1, depth + 1);
    }
  };
  grow(120, 500, 0);
  const a = ctx.t0 + 0.2;
  for (const b of branches) {
    const p = strokePath(tree, b.d, { stroke: b.x0 < 900 ? moods.blueprint.ink : color.mint, 'stroke-width': 3, opacity: 0.8 });
    const s = a + (b.x0 - 120) / 400;
    onFrame(t => drawOn(p, prog(t, s, s + 0.9)));
  }
  [[1520, 300], [1600, 560], [1480, 800], [1300, 430], [1340, 690]].forEach(([x, y], i) => {
    const g = at(tree, x, y);
    community(g, 60, 3, 40 + i);
    pose(g, a + 2.6 + i * 0.2, l1.v0 + 0.4);
  });
  pose(tree, ctx.t0, l1.v0 + 0.4);

  // The title, with the loop above it.
  const lp = named('title-loop', at(art, 960, 300));
  loop(lp, 90, { labels: false, width: 5, spin: 0.5, from: l1.v0, stroke: color.mint });
  pose(lp, l1.v0, t1 + 1);
  beat(text, { t0: l1.v0 + 0.2, t1: t1 + 1, y: 470, rows: [{ h: 'Learning to evolve', t: l1.v0 + 0.3 }], punch: false });

  board(ctx.line(0).v1, 'A branching lineage draws on from the left in blueprint ink, turns mint past the middle, and ends in small communities.');
  board(l1.v1, 'Title: "Learning to evolve", with the loop spinning above it in mint.');
});
