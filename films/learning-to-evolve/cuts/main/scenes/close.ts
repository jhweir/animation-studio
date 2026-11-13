// Scene 8: life's branching lineage draws on from the left in blueprint ink, turns mint past the middle
// and ends in small communities; as the last line starts they fly together into one mint loop, spinning
// above the title.
import { board, cue, defineScene, drawOn, named, onFrame, prog, rng, strokePath } from '../../../../../engine/index.ts';
import { beat, color, moods } from '../../../../../styles/coasys/index.ts';
import { at, community, fly, hold, loop, popIn } from '../kit.ts';

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
  cue(a, 'grow');
  hold(tree, ctx.t0, l1.v0 + 0.4, 0.5);

  // The communities at the tips pop in, then fly together into the title's loop.
  const gather = l1.v0 - 0.2;
  [[1520, 300], [1600, 560], [1480, 800], [1300, 430], [1340, 690]].forEach(([x, y], i) => {
    const outer = named(`tip-community-${i + 1}`, at(art));
    const g = at(outer);
    community(g, 60, 3, 40 + i);
    popIn(g, 0, 0, a + 3.3 + i * 0.12);
    fly(outer, [x, y], [(x + 960) / 2, Math.min(y, 300) - 120], [960, 300], gather, gather + 0.8, { s0: 1, s1: 0.4, show: a + 3.3, out: gather + 0.85 });
  });
  cue(a + 3.3, 'pop');

  // The title, with the loop above it.
  const lp = named('title-loop', at(art));
  loop(lp, 90, { labels: false, width: 5, spin: 0.5, from: l1.v0, stroke: color.mint });
  popIn(lp, 960, 300, gather + 0.6, { dur: 0.5 });
  beat(text, { t0: l1.v0 + 0.2, t1: t1 + 1, y: 470, rows: [{ h: 'Learning to evolve', t: l1.v0 + 0.3 }], punch: false });

  board(l1.v0 - 0.25, 'A branching lineage has drawn on from the left in blueprint ink, turning mint past the middle, and ends in small communities.');
  board(l1.v1, 'The communities have flown together into one mint loop, spinning above the title: "Learning to evolve".');
});
