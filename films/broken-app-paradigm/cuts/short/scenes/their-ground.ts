// Section 1. A turning globe; three steel towers rise and their grey roots creep across it until
// they reach everyone, pulses running back to the towers. Mint alternatives flicker up and fade,
// then rise as small towers built the same way, and fade too. The giants grow on "size and
// attention". The globe cracks, lifts, and the people who use and who build appear beneath it.
import {
  bump, clamp, cue, defineScene, drawOn, eback, eio, eout, lerp, mix, named, onFrame, prog, rng, scaleAbout, set,
  strokePath, svg, vis, win,
} from '../../../../../engine/index.ts';
import { beat, color, glyph, person, tileGlyphs } from '../../../../../styles/coasys/index.ts';
import { globe, grownPart, landPoints, rootNetwork, type LonLat } from '../../../../../styles/coasys/globe.ts';

// Where the giants stand, in longitude and latitude.
const TOWERS: LonLat[] = [[-22, 40], [12, 50], [44, 36]];

export default defineScene('their-ground', ({ t0, t1, art, text, line, part }) => {
  const companies = part(0, 0);
  const crept = part(0, 1);
  const everywhere = part(0, 2);
  const appearing = part(1, 0);
  const sameRules = part(1, 1);
  const game = line(2);
  const broken = line(3);
  const bigger = (t: number) => eio(prog(t, game.v0 + 0.3, game.v0 + 2.2)); // the giants grow
  const pivot = broken.v0 + 0.45 * (broken.v1 - broken.v0); // "for the people who use…"

  // Everything on the globe moves with this group: it lifts and shrinks for the closing pivot.
  const world = named('world', svg('g', {}, art));
  const cx = 960;
  const cy = 610;
  const g = globe(world, { cx, cy, r: 320, view: t => [12 + 0.4 * (t - t0), 16] });
  onFrame(t => {
    const intro = eout(prog(t, t0 + 0.1, t0 + 1.2));
    const lift = eio(prog(t, pivot - 0.6, pivot + 0.6));
    set(world, { transform: `translate(0 ${(-200 * lift).toFixed(2)}) ${scaleAbout(cx, cy, (0.93 + 0.07 * intro) * (1 - 0.36 * lift))}` });
    vis(world, intro);
  });

  // People: dots on land, appearing on "billions of people"; captured (steel, dimmer) as roots arrive.
  const people = landPoints(320, 7).map((p, i) => {
    const near = Math.min(...TOWERS.map(o => Math.hypot(o[0] - p[0], o[1] - p[1])));
    return {
      p,
      dot: svg('circle', { r: 2.6, fill: color.text }, world),
      at: companies.v0 + 1.2 + (i % 40) * 0.05,
      caught: lerp(crept.v0 + 1, everywhere.v1, clamp(near / 90)),
    };
  });
  named('people', people[0].dot.parentElement!);

  // Roots: grey, branching out from the towers' feet.
  const roots = rootNetwork({ origins: TOWERS, seed: 3, trunks: 4, length: 28, step: 2.6, depth: 2, wander: 16, branching: 0.16, bearings: [100, 260] });
  const rootsG = named('roots', svg('g', { fill: 'none', 'stroke-linecap': 'round' }, world));
  const rootPaths = roots.map(b => ({ b, el: svg('path', { stroke: color.steel, 'stroke-opacity': [0.75, 0.55, 0.4][b.depth] ?? 0.4 }, rootsG) }));
  // creeping through "crept in slowly", reaching everywhere by the end of that sentence
  const growth = (t: number) => eio(prog(t, crept.v0 - 0.3, everywhere.v1));

  // Pulses: signals running back along the main roots to the towers.
  const pulses = roots
    .filter(b => b.depth === 0)
    .map((b, i) => ({ b, el: svg('circle', { r: 3.4, fill: color.text2 }, world), off: (i * 0.37) % 1 }));

  // The giants: steel towers standing out from the surface, each with an abstract mark.
  const towers = TOWERS.map((p, i) => {
    const tg = named(`tower-${i + 1}`, svg('g', {}, world));
    const body = svg('g', {}, tg);
    svg('rect', { x: -24, y: -190, width: 48, height: 190, rx: 4, fill: color.surface2, stroke: color.steel, 'stroke-width': 3 }, body);
    svg('path', { d: tileGlyphs[i], fill: color.steel, transform: 'translate(0 -156) scale(1.05)' }, body);
    const at = companies.v0 + 0.35 + 0.3 * i;
    cue(at, 'thud');
    return { p, tg, body, at };
  });

  // Alternatives, part one: mint sprouts that flicker up and fade.
  const sproutSpots = landPoints(6, 21, { lon: [-30, 70], lat: [-25, 55] });
  const sprouts = sproutSpots.map((p, i) => {
    const sg = named(`alternative-${i + 1}`, svg('g', {}, world));
    const ring = svg('circle', { r: 12, fill: 'none', stroke: color.mint, 'stroke-width': 3 }, sg);
    const core = svg('circle', { r: 9, fill: color.mint, filter: 'url(#glow)' }, sg);
    const at = appearing.v0 + 0.15 + 0.42 * i;
    cue(at, 'pop');
    return { p, sg, ring, core, at, end: at + 1.5 };
  });

  // Alternatives, part two: small mint towers, built just like the giants, that fade too.
  const miniSpots = landPoints(3, 33, { lon: [-15, 55], lat: [-20, 30] });
  const minis = miniSpots.map((p, i) => {
    const mg = named(`small-tower-${i + 1}`, svg('g', {}, world));
    const body = svg('g', {}, mg);
    svg('rect', { x: -12, y: -84, width: 24, height: 84, rx: 3, fill: color.surface2, stroke: color.mint, 'stroke-width': 2.5 }, body);
    const at = sameRules.v0 + 1.3 + 0.55 * i; // "…one company, one sealed app…"
    cue(at, 'pop');
    return { p, mg, body, at, end: game.v0 + 0.8 + 0.2 * i };
  });

  // The crack: red, once, across the disc.
  const crackR = rng(5);
  let d = `M ${cx - 300} ${cy - 90}`;
  for (let i = 1; i <= 12; i++) d += ` L ${cx - 300 + 50 * i} ${cy - 90 + 15 * i + (crackR() - 0.5) * 60}`;
  const crack = named('crack', strokePath(world, d, { stroke: color.danger, 'stroke-width': 4 }));
  const crackAt = broken.v0 + 0.25;
  cue(crackAt, 'crack');

  // Beneath the globe: the people who use these tools, and the people who build them.
  const groups = [
    { name: 'users', x: 640, n: 5, label: 'The people who use them', build: false },
    { name: 'builders', x: 1280, n: 3, label: 'The people who build them', build: true },
  ].map((grp, gi) => {
    const gg = named(grp.name, svg('g', {}, art));
    for (let i = 0; i < grp.n; i++) {
      const pg = svg('g', { transform: `translate(${grp.x + (i - (grp.n - 1) / 2) * 84} 830)` }, gg);
      person(pg, 30, color.text);
    }
    if (grp.build) svg('path', { d: glyph.laptop, fill: 'none', stroke: color.text2, 'stroke-width': 4, transform: `translate(${grp.x} 935) scale(0.7)` }, gg);
    const label = svg('text', {
      x: grp.x, y: 1010, 'text-anchor': 'middle', fill: color.text2, 'font-size': 28, 'font-weight': 700, 'letter-spacing': '0.12em',
    }, gg);
    label.textContent = grp.label.toUpperCase();
    const at = pivot + 0.3 + 0.9 * gi;
    cue(at, 'pop');
    return { gg, at };
  });

  // Big words on the rules of the game.
  beat(text, {
    name: 'size-and-attention',
    t0: game.v0 + 0.4,
    t1: game.v1 + 0.2,
    y: 330,
    size: 112,
    dim: 0.5,
    rows: [
      { h: 'Size and attention', t: game.v0 + 0.5 },
      { h: '<em class="cold">win</em>', t: game.v0 + 1.6 },
    ],
  });

  onFrame(t => {
    const r = g.radius();
    const scaleUp = bigger(t);
    const u = growth(t);

    for (const pp of people) {
      const f = g.facing(pp.p);
      if (f <= 0.02) {
        vis(pp.dot, 0);
        continue;
      }
      const [x, y] = g.xy(pp.p);
      const caught = eout(prog(t, pp.caught, pp.caught + 0.8));
      set(pp.dot, { cx: x.toFixed(1), cy: y.toFixed(1), fill: mix(color.text, color.steel, caught) });
      vis(pp.dot, eout(prog(t, pp.at, pp.at + 0.5)) * clamp(f * 3) * (1 - 0.3 * caught));
    }

    for (const rp of rootPaths) {
      const part = grownPart(rp.b, u);
      const dPath = part ? g.path(part) : null;
      if (!dPath) {
        vis(rp.el, 0);
        continue;
      }
      set(rp.el, { d: dPath, 'stroke-width': ([3.4, 1.8, 1.1][rp.b.depth] ?? 1) * (1 + 0.6 * scaleUp) * (r / 320) });
      vis(rp.el, 1);
    }

    const pulseOn = win(t, everywhere.v0, t1, 0.6, 0.3) * (1 - 0.6 * prog(t, crackAt, crackAt + 0.6));
    for (const pl of pulses) {
      // from the root's grown tip back to its tower, repeating
      const k = 1 - ((((t - t0) * (0.35 + 0.25 * scaleUp) + pl.off) % 1) + 1) % 1;
      const reach = clamp((u - pl.b.born) / pl.b.span);
      const pos = pl.b.coords[Math.min(pl.b.coords.length - 1, Math.floor(k * reach * (pl.b.coords.length - 1)))];
      const f = g.facing(pos);
      if (f <= 0.02 || pulseOn <= 0) {
        vis(pl.el, 0);
        continue;
      }
      const [x, y] = g.xy(pos);
      set(pl.el, { cx: x.toFixed(1), cy: y.toFixed(1) });
      vis(pl.el, pulseOn * clamp(f * 3) * 0.9);
    }

    for (const tw of towers) {
      const f = g.facing(tw.p);
      const [x, y] = g.xy(tw.p);
      const ang = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
      const rise = prog(t, tw.at, tw.at + 0.55);
      const h = (rise >= 1 ? 1 : eback(rise)) * (1 + 0.55 * scaleUp);
      set(tw.tg, { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(2)})` });
      set(tw.body, { transform: `scale(1 ${Math.max(0.001, h).toFixed(4)})` });
      vis(tw.tg, rise > 0 && f > 0 ? clamp(f * 4) : 0);
    }

    for (const s of sprouts) {
      const f = g.facing(s.p);
      const o = win(t, s.at, s.end, 0.3, 0.6) * clamp(f * 4);
      vis(s.sg, o);
      if (o <= 0) continue;
      const [x, y] = g.xy(s.p);
      const grow = eback(prog(t, s.at, s.at + 0.45));
      set(s.sg, { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${Math.max(0.001, grow).toFixed(3)})` });
      const ping = prog(t, s.at + 0.1, s.at + 1.1);
      set(s.ring, { r: (10 + 30 * eout(ping)).toFixed(2) });
      vis(s.ring, (1 - ping) * 0.9);
      vis(s.core, 1 - 0.5 * bump(prog(t, s.end - 0.8, s.end)));
    }

    for (const m of minis) {
      const f = g.facing(m.p);
      const o = win(t, m.at, m.end, 0.2, 0.7) * clamp(f * 4);
      vis(m.mg, o);
      if (o <= 0) continue;
      const [x, y] = g.xy(m.p);
      const ang = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
      const rise = prog(t, m.at, m.at + 0.5);
      const shrink = 1 - 0.4 * eio(prog(t, game.v0, m.end));
      set(m.mg, { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(2)})` });
      set(m.body, { transform: `scale(1 ${Math.max(0.001, (rise >= 1 ? 1 : eback(rise)) * shrink).toFixed(4)})` });
    }

    drawOn(crack, eout(prog(t, crackAt, crackAt + 0.35)));
    vis(crack, 1 - 0.7 * prog(t, crackAt + 1.2, crackAt + 2.2));

    for (const gr of groups) {
      const a = prog(t, gr.at, gr.at + 0.5);
      vis(gr.gg, eout(a));
      set(gr.gg, { transform: `translate(0 ${(24 * (1 - eout(a))).toFixed(2)})` });
    }
  });
});
