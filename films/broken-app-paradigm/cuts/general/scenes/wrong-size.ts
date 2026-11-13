// Scene 7: one problem from two ends. Fine-grained needs on one side (always changing shape), small
// ideas on the other, and between them the only unit on offer drops in: a whole app, far too big for
// either; one need and one idea are set inside it to show the size. "The unit is the wrong size."
import { board, clamp, cue, defineScene, eback, ein, eio, named, onFrame, prog, rng, tf, vis } from '../../../../../engine/index.ts';
import { appBox, at, beat, caps, color, mark, tileGlyphs } from '../../../../../styles/coasys/index.ts';
import { arrive, drawn, stagger } from '../kit.ts';

export default defineScene('wrong-size', ctx => {
  const { art, text, t0, t1 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2);
  const P = (i: number, j: number) => ctx.part(i, j);
  const k = (p: { v0: number; v1: number }, f: number) => p.v0 + (p.v1 - p.v0) * f;
  const r = rng(5);

  // "Two ends": a faint line with a node at each end, which the two fields then take over.
  const ends = named('two-ends-line', at(art));
  drawn(ends, 'M 300 540 H 1590', t0 + 0.3, 0.8, { stroke: color.line, 'stroke-width': 3 });
  for (const x of [300, 1590]) {
    const n = at(ends, x, 540);
    drawn(n, 'M 0 -18 a 18 18 0 1 1 -0.1 0', k(l0, 0.6), 0.4, { stroke: color.text2, 'stroke-width': 3 });
  }
  onFrame(t => vis(ends, 1 - prog(t, l1.v0, l1.v0 + 0.4)));

  const two = named('two-ends', at(art));
  // Needs: fine-grained, and always changing: each mark turns into another shape now and then.
  const needs = named('needs', at(two));
  const p10 = P(1, 0), p11 = P(1, 1), p12 = P(1, 2);
  for (let i = 0; i < 30; i++) {
    const x = 150 + (i % 5) * 75, y = 300 + Math.floor(i / 5) * 80;
    const first = Math.floor(r() * 4), ph = r() * 3, a = stagger(p10.v0, p10.v0 + 1.4, (i % 5) + Math.floor(i / 5), 10);
    const g = at(needs, x, y);
    const m = mark(g, first, 0, 0, 1, color.mintLight);
    onFrame(t => {
      g.setAttribute('transform', tf(x, y, Math.max(0.0001, eback(prog(t, a, a + 0.4)))));
      vis(g, prog(t, a, a + 0.15));
      const step = Math.max(0, Math.floor((t - k(p10, 0.6) + ph) / 1.6));
      m.setAttribute('d', tileGlyphs[(first + step) % 4]);
    });
  }
  cue(p10.v0, 'mesh');
  caps(arrive(two, 300, 820, k(p10, 0.35)), 0, 0, 'needs: fine-grained, changing', { size: 22, fill: color.mint });
  const ideas = named('ideas', at(two));
  for (let i = 0; i < 12; i++) {
    const g = at(ideas, 1490 + (i % 3) * 100, 360 + Math.floor(i / 3) * 110);
    mark(g, Math.floor(r() * 4), 0, 0, 1.3, color.orange);
    const a = stagger(p11.v0, p11.v0 + 1.0, i, 12), base = g.getAttribute('transform')!;
    onFrame(t => { g.setAttribute('transform', `${base} scale(${Math.max(0.0001, eback(prog(t, a, a + 0.4))).toFixed(4)})`); vis(g, prog(t, a, a + 0.15)); });
  }
  cue(p11.v0, 'pop');
  caps(arrive(two, 1590, 820, k(p11, 0.4)), 0, 0, 'ideas: small, specific', { size: 22, fill: color.orange });

  // The whole app drops in between them, far bigger than any need or idea.
  const tDrop = k(p12, 0.33);
  const unit = named('whole-app-unit', at(two, 960, 520));
  const box = at(unit, 0, 0);
  appBox(box, 620, 460, { parts: Array(6).fill('plain'), seed: 90 });
  onFrame(t => {
    const fall = ein(prog(t, tDrop - 0.5, tDrop));
    const settle = Math.sin(Math.PI * prog(t, tDrop, tDrop + 0.3)) * 10;
    box.setAttribute('transform', tf(0, -900 * (1 - fall) + settle));
    vis(unit, clamp(prog(t, tDrop - 0.5, tDrop - 0.3)));
  });
  cue(tDrop, 'thud');
  caps(arrive(unit, 0, 290, tDrop + 0.3), 0, 0, 'the only unit: a whole app', { size: 24, fill: color.steel });
  // Too big to fit anyone's needs; too big for most ideas to ship: one of each is set inside it.
  const tooNeed = k(p12, 0.55), tooIdea = k(p12, 0.82);
  const need = named('one-need', at(two));
  mark(need, 1, 0, 0, 1, color.mintLight);
  const idea = named('one-idea', at(two));
  mark(idea, 2, 0, 0, 1.3, color.orange);
  onFrame(t => {
    const u = eio(prog(t, tooNeed, tooNeed + 0.8));
    need.setAttribute('transform', tf(450 + (871 - 450) * u, 540 + (552 - 540) * u - 60 * Math.sin(Math.PI * u)));
    vis(need, prog(t, tooNeed - 0.2, tooNeed));
    const w = eio(prog(t, tooIdea, tooIdea + 0.8));
    idea.setAttribute('transform', tf(1440 + (1048 - 1440) * w, 540 + (552 - 540) * w - 60 * Math.sin(Math.PI * w)));
    vis(idea, prog(t, tooIdea - 0.2, tooIdea));
  });
  cue(tooNeed + 0.8, 'tap', { i: 0 });
  cue(tooIdea + 0.8, 'tap', { i: 2 });

  beat(text, { t0: l2.v0, t1: t1 + 0.5, dim: 0.6, rows: [{ h: 'The unit is', t: l2.v0 + 0.1 }, { h: 'the wrong size.', t: l2.v0 + 0.8 }] });

  board(k(p11, 0.9), 'Left: a field of fine-grained needs (mint marks), each changing shape now and then. Right: a handful of small ideas (orange). Nothing between them yet.');
  board(l1.v1, 'A whole app has dropped in between, far bigger than any need or idea; one need and one idea sit lost inside it.');
  board(l2.v1, 'Big words over the dimmed picture: "The unit is the wrong size."');
});
