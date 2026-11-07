// Scene 1: a chat exchange types out; on "shuffling symbols" the answer's words come loose as glyph
// tiles; on "older than the internet" the tiles settle into a door with a slot. Title over the door.
import { defineScene, eio, eout, lerp, named, onFrame, prog, rng, svg, vis } from '../../../../../engine/index.ts';
import { along, appear, bubble, color, glyph, group, place, sent, title, words } from '../../../../../styles/chalk/index.ts';

export default defineScene('question', ctx => {
  const { art, text, t1 } = ctx;
  const l0 = ctx.line(0);
  const l2 = ctx.line(2);
  const loose = sent(ctx, 1, 1).v0;
  const settle = l2.v0 + 0.2;

  const q = named('question', group(art));
  bubble(q, 1020, 210, 600, 110, 'right');
  words(q, 1320, 280, 'Why is this joke funny?', { size: 40 });

  const a = named('answer', group(art));
  bubble(a, 300, 400, 1000, 300, 'left');
  const rows = ['It works because the punchline makes you', 'reread the setup. The word you took one', 'way turns out to mean something else, and', 'the surprise is the joke.'];
  const rowEls = rows.map((s, i) => words(a, 350, 470 + i * 58, s, { size: 38, anchor: 'start' }));

  // Tiles: from the answer's rows, to a scatter, to the door's outline.
  const door: [number, number][] = [];
  for (let y = 180; y <= 774; y += 66) door.push([820, y]);
  for (let x = 886; x <= 1018; x += 66) door.push([x, 180]);
  for (let y = 180; y <= 774; y += 66) door.push([1084, y]);
  const r = rng(9);
  const tiles = door.map(([dx, dy], i) => {
    const g = named(`tile-${i + 1}`, group(art));
    svg('rect', { x: -29, y: -29, width: 58, height: 58, rx: 7, fill: color.card, stroke: color.ink, 'stroke-width': 2 }, g);
    glyph(g, -21, -21, 42, 200 + i, color.ink, 2);
    return {
      g,
      from: [360 + (i % 8) * 115 + 29, 460 + Math.floor(i / 8) * 64 + 29] as [number, number],
      mid: [700 + r() * 1000, 140 + r() * 760] as [number, number],
      rot: (r() - 0.5) * 70,
      to: [dx + 29, dy + 29] as [number, number],
      i,
    };
  });
  const slot = named('slot', svg('rect', { x: 920, y: 470, width: 100, height: 20, fill: color.bg, stroke: color.ink, 'stroke-width': 3 }, art));

  title(text, 'Where is the understanding?', sent(ctx, 2, 1).v0 + 0.3, t1, 900);

  onFrame(t => {
    appear(q, t, l0.v0 + 0.1);
    const fadeA = 1 - prog(t, loose + 0.2, loose + 0.8);
    vis(a, eout(prog(t, l0.v0 + 1.2, l0.v0 + 1.7)) * fadeA);
    vis(q, eout(prog(t, l0.v0 + 0.1, l0.v0 + 0.6)) * (1 - prog(t, loose + 0.4, loose + 1.0)));
    rowEls.forEach((e, i) => vis(e, eout(prog(t, along(ctx, 0, 0.18 + i * 0.16), along(ctx, 0, 0.18 + i * 0.16) + 0.5)) * (1 - prog(t, loose, loose + 0.3))));
    for (const tl of tiles) {
      const u1 = eio(prog(t, loose + tl.i * 0.03, loose + 1.3 + tl.i * 0.03));
      const u2 = eio(prog(t, settle + tl.i * 0.04, settle + 1.5 + tl.i * 0.04));
      const x = lerp(lerp(tl.from[0], tl.mid[0], u1), tl.to[0], u2);
      const y = lerp(lerp(tl.from[1], tl.mid[1], u1), tl.to[1], u2);
      const rot = tl.rot * u1 * (1 - u2);
      const s = lerp(0.5, 1, u1);
      place(tl.g, x, y, s, rot);
      vis(tl.g, prog(t, loose - 0.05, loose + 0.2));
    }
    appear(slot, t, settle + 2.2);
  });
});
