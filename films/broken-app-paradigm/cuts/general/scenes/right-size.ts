// Scene 10: WE, an open core owned by no one; its trusted parts light as they're named; pieces drop
// into its docks; one lifts out and opens up to show what it does; a builder's single piece travels
// out to many communities; a community assembles its space and swaps a piece as it grows; then many
// people making pieces and docking them into one shared core.
import { board, clamp, cue, defineScene, eio, ein, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import { at, caps, cartridge, color, community, core, cross, membrane, person, tick } from '../../../../../styles/coasys/index.ts';
import { arrive, drawArrow, fade, pop, stagger } from '../kit.ts';

export default defineScene('right-size', ctx => {
  const { art, t0, t1 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2), l3 = ctx.line(3);
  const P = (i: number, j: number) => ctx.part(i, j);
  const k = (p: { v0: number; v1: number }, f: number) => p.v0 + (p.v1 - p.v0) * f;
  const bump = (t: number, a: number, d = 0.85) => Math.sin(Math.PI * clamp((t - a) / d));

  // Pose 1: the core rises; its trusted parts light as they're named; pieces drop into its docks.
  const p10 = P(1, 0), p11 = P(1, 1), p12 = P(1, 2);
  const out1 = p12.v0 + 0.5;
  const base = named('we-core', at(art));
  fade(base, t0, out1, 0.3);
  const tCore = Math.max(t0 + 0.2, k(l0, 0.25));
  const coreG = at(base, 960, 800);
  core(coreG, 1300, 150);
  onFrame(t => {
    const u = eio(prog(t, tCore, tCore + 0.8));
    coreG.setAttribute('transform', tf(960, 800 + 140 * (1 - u)));
    vis(coreG, prog(t, tCore, tCore + 0.4));
  });
  cue(tCore, 'lift');
  caps(arrive(base, 960, 160, k(l0, 0.85)), 0, 0, 'owned by no one', { size: 24, fill: color.mint });
  // The building blocks, the engine that draws them, the rules: each lights up as it's said.
  const tBlocks = k(p10, 0.32), tEngine = k(p10, 0.48), tRules = k(p10, 0.74);
  const blocks = named('building-blocks', at(base, 960, 800));
  for (let i = 0; i < 14; i++) {
    const x = -650 + (1300 / 14) * (i + 0.5), s = 33;
    const b = svg('rect', { x: x - s / 2, y: 3, width: s, height: s, rx: 4, fill: color.mint, 'fill-opacity': 0.5, stroke: color.mint, 'stroke-width': 2 }, blocks);
    onFrame(t => vis(b, bump(t, tBlocks + i * 0.05)));
  }
  const engine = named('engine', svg('rect', { x: -6, y: -60, width: 12, height: 120, rx: 6, fill: color.mintLight, filter: 'url(#glow)' }, at(base, 960, 800)));
  onFrame(t => {
    const u = eio(prog(t, tEngine, tEngine + 1.0));
    engine.setAttribute('x', (-640 + 1280 * u - 6).toFixed(1));
    vis(engine, bump(t, tEngine, 1.0));
  });
  const rules = named('rules', at(base, 960, 800));
  for (let i = 0; i < 4; i++) {
    const x = -650 + 325 * (i + 0.5);
    const d = svg('rect', { x: x - 104, y: -81, width: 208, height: 12, rx: 4, fill: color.mintLight, filter: 'url(#glow)' }, rules);
    onFrame(t => vis(d, bump(t, tRules + i * 0.1)));
  }
  cue(tBlocks, 'shimmer'); cue(tEngine, 'grow'); cue(tRules, 'shimmer', { i: 1 });
  const labels = ['a way to decide', 'a map', 'a forum', 'community space'];
  const said = [0.4, 0.6, 0.7, 0.8].map(f => k(p11, f));
  const dockX = (i: number) => 960 - 650 + 325 * (i + 0.5);
  // The first piece is the one we open up next, so it lives outside the core's group.
  const first = named('piece-1', at(art));
  labels.forEach((s, i) => {
    const c = i === 0 ? first : named(`piece-${i + 1}`, at(base));
    const inner = svg('g', {}, c);
    cartridge(inner, 240, 180, s);
    const a = said[i] - 0.1;
    onFrame(t => {
      const u = ein(prog(t, a, a + 0.5));
      const settle = Math.sin(Math.PI * prog(t, a + 0.5, a + 0.75)) * 8;
      if (i === 0) {
        // Lifted out and opened up: to the left, a little larger.
        const o = eio(prog(t, p12.v0, p12.v0 + 0.8));
        c.setAttribute('transform', tf(dockX(0) + (620 - dockX(0)) * o, 250 + 360 * u + settle + (520 - 610) * o, 1 + 0.25 * o));
        vis(c, Math.min(clamp(u * 4), 1 - prog(t, l2.v0, l2.v0 + 0.35)));
      } else {
        c.setAttribute('transform', tf(dockX(i), 250 + 360 * u + settle));
        vis(c, clamp(u * 4));
      }
    });
    cue(a + 0.5, 'drop', { i });
  });

  // Pose 2: the piece opened up, with what it does listed beside it, before it's let in.
  const open = named('readable-piece', at(art));
  const panel = pop(open, 1140, 520, p12.v0 + 0.5, { name: 'what-it-does', until: l2.v0 + 0.35, dur: 0.5 });
  svg('rect', { x: -280, y: -180, width: 560, height: 360, rx: 16, fill: color.surface, stroke: color.line, 'stroke-width': 2 }, panel);
  caps(panel, -250, -130, 'what it does', { size: 20, anchor: 'start' });
  ([['shows proposals', true], ['records votes', true], ['reads private messages', false]] as const).forEach(([s, ok], i) => {
    const a = p12.v0 + 1.0 + i * 0.4;
    const row = arrive(panel, -225, -55 + i * 80, a, { from: [-16, 0], dur: 0.4 });
    (ok ? tick : cross)(row, 0, 0, 0.8);
    caps(row, 45, 10, s, { size: 22, fill: ok ? color.text : color.text3, anchor: 'start', weight: 600 });
    cue(a, ok ? 'tick' : 'tap', { i });
  });

  // Pose 3: a builder makes one piece, and copies of it travel out to every community that wants it.
  const reach = named('one-piece-many-places', at(art));
  const p20 = P(2, 0);
  const out3 = P(2, 1).v0 + 0.35;
  fade(reach, l2.v0, out3, 0.2);
  person(pop(reach, 260, 560, k(p20, 0.08), { name: 'builder' }), 50, color.inkFigure);
  cartridge(pop(reach, 470, 540, k(p20, 0.2), { name: 'their-piece' }), 170, 130, 'a map', { marks: [2] });
  cue(k(p20, 0.2), 'pop');
  const tReach = k(p20, 0.48), tInside = k(p20, 0.78);
  [[1100, 220], [1500, 380], [1550, 760], [1100, 860]].forEach(([x, y], i) => {
    community(pop(reach, x, y, tReach + i * 0.12, { name: `community-${i + 1}` }), 110, 7, 120 + i);
    const bend = (i - 1.5) * 40;
    const x1 = 570, y1 = 540, x2 = x - 190, y2 = y - 40;
    drawArrow(reach, x1, y1, x2, y2, tReach + 0.3 + i * 0.12, { stroke: color.mint, bend, dash: '8 8', dur: 0.6 });
    // The copy rides the arrow's curve from the builder's piece into the community's edge.
    const len = Math.hypot(x2 - x1, y2 - y1);
    const cx = (x1 + x2) / 2 - ((y2 - y1) / len) * bend, cy = (y1 + y2) / 2 + ((x2 - x1) / len) * bend;
    const ex = x - 130, ey = y - 70;
    const copy = at(reach, 470, 540, 1, `copy-${i + 1}`);
    cartridge(copy, 90, 70, 'map', { marks: [2] });
    const a = tInside - 0.9 + i * 0.15;
    onFrame(t => {
      const u = eio(prog(t, a, a + 1.0));
      const bx = (1 - u) * (1 - u) * 470 + 2 * (1 - u) * u * cx + u * u * ex;
      const by = (1 - u) * (1 - u) * 540 + 2 * (1 - u) * u * cy + u * u * ey;
      copy.setAttribute('transform', tf(bx, by, 0.8 + 0.2 * u));
      vis(copy, prog(t, a, a + 0.15));
    });
    cue(a + 1.0, 'land', { i });
  });
  cue(tReach + 0.3, 'mesh');

  // Pose 4: a community assembles what fits, and reshapes it as it grows: the forum is set aside,
  // a rota comes in, and the membrane grows.
  const shape = named('community-assembles', at(art));
  const p21 = P(2, 1);
  const out4 = l3.v0 + 0.35;
  fade(shape, p21.v0, out4, 0.3);
  const grow = at(shape, 900, 540);
  const tFits = k(p21, 0.27), tReshape = k(p21, 0.52), tGrows = k(p21, 0.78);
  const ring = membrane(grow, 300, 130);
  onFrame(t => {
    const s = eio(prog(t, p21.v0, p21.v0 + 0.6)) * (1 + 0.08 * eio(prog(t, tGrows, tGrows + 0.8)));
    ring.setAttribute('transform', `scale(${Math.max(0.0001, s).toFixed(4)})`);
  });
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI * (3 - Math.sqrt(5)), rad = 200 * Math.sqrt((i + 0.5) / 16);
    person(pop(grow, rad * Math.cos(a), rad * Math.sin(a), stagger(p21.v0 + 0.2, p21.v0 + 1.0, i, 16), { dur: 0.35 }), 14, color.inkFigure);
  }
  const place = (name: string, label: string, deg: number, a: number, o: { dim?: number } = {}) => {
    const rad = (deg * Math.PI) / 180;
    const g = at(shape, 0, 0, 1, name);
    const inner = svg('g', {}, g);
    cartridge(inner, 130, 100, label);
    onFrame(t => {
      const u = eio(prog(t, a, a + 0.7));
      const R = 640 - 260 * u;
      g.setAttribute('transform', tf(900 + R * Math.cos(rad), 540 + R * Math.sin(rad)));
      vis(g, Math.min(prog(t, a, a + 0.3), o.dim !== undefined ? 1 - 0.6 * prog(t, o.dim, o.dim + 0.4) : 1));
    });
    cue(a + 0.7, 'land');
    return g;
  };
  place('piece-decide', 'decide', -45, tFits);
  place('piece-map', 'map', 10, tFits + 0.2);
  place('piece-forum', 'forum', 180, tFits + 0.4, { dim: tReshape });
  cross(pop(shape, 900 - 380 + 60, 490, tReshape + 0.1, { name: 'set-aside' }), 0, 0, 0.8);
  place('piece-rota', 'rota', 55, tReshape + 0.4);
  caps(arrive(shape, 900, 1010, tFits + 0.3), 0, 0, 'assemble what fits · reshape it as you grow', { size: 22, fill: color.text2 });

  // Pose 5: many people, each making a piece, and the pieces docking into one shared core.
  const together = named('made-together', at(art));
  fade(together, l3.v0, t1 + 1, 0.3);
  const p31 = P(3, 1);
  const coreB = pop(together, 960, 760, l3.v0 + 0.2, { name: 'shared-core', dur: 0.6 });
  core(coreB, 1100, 130, 6);
  const docks = [0, 1, 2, 4, 5];
  for (let i = 0; i < 9; i++) {
    const x = 420 + i * 135;
    person(pop(together, x, 300 + (i % 2) * 60, stagger(l3.v0 + 0.6, l3.v0 + 2.0, i, 9), { name: `maker-${i + 1}` }), 30, color.inkFigure);
    if (i % 2 === 0) {
      const j = i / 2;
      const c = at(together, x, 520, 1, `made-piece-${j + 1}`);
      cartridge(c, 100, 76, 'piece');
      const a = p31.v0 + j * 0.12, dock = docks[j];
      const dx = 960 - 550 + (1100 / 6) * (dock + 0.5);
      onFrame(t => {
        const s = prog(t, a, a + 0.45);
        const u = eio(prog(t, a + 0.7, a + 1.5));
        c.setAttribute('transform', tf(x + (dx - x) * u, 520 + (640 - 520) * u, Math.max(0.0001, s < 1 ? 1 - Math.pow(1 - s, 3) : 1)));
        vis(c, clamp(s * 3));
      });
      cue(a, 'pop', { i: j });
      cue(a + 1.5, 'land', { i: j });
    }
  }

  board(p11.v1, 'Ours mood. The WE core, "owned by no one" (its blocks, engine and rules lit as named), with pieces dropped into its docks: a way to decide, a map, a forum, a community space.');
  board(l1.v1, 'The first piece lifted out and opened up, with what it does listed beside it: shows proposals, records votes, does not read private messages.');
  board(k(p20, 0.97), 'A builder makes one piece, a map, and copies of it ride the arcs out into four different communities.');
  board(p21.v1, 'One community assembles its space from pieces round its edge; as it grows, the forum is set aside (dim, crossed) and a rota comes in.');
  board(l3.v1, 'Many people each made a piece, and the pieces have docked into one shared core: "something we make together".');
});
