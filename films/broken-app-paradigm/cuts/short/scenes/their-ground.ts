// Section 1. A leaderboard of social platforms races from 2006 to 2021 on the left; on the right a
// globe turns, and the leaders' cables run into it, growing grey roots from each owner's ground
// across the land until they reach everyone. Mint alternatives sprout on the globe and fade. On "size
// and attention win" the board cuts to today, by company, and a line drops under the four giants.
// On "broken" the globe cracks, the board clears, and the people who use and who build appear.
import {
  bump, clamp, cue, defineScene, drawOn, eback, eio, eout, lerp, mix, named, onFrame, prog, race, rng, scaleAbout,
  set, strokePath, svg, vis, win,
} from '../../../../../engine/index.ts';
import { color, glyph, leaderboard, person } from '../../../../../styles/coasys/index.ts';
import { globe, grownPart, landPoints, rootNetwork, type LonLat } from '../../../../../styles/coasys/globe.ts';
import { companies, ownerAt, platforms, sourceLines } from '../../../data/race.ts';

const ROWS = 10;
const LEADERS = 4;
const FROM = 2006;
const TO = 2021;

// Each owner's ground on the globe (abstract places, not headquarters).
const GROUND: Record<string, LonLat> = {
  meta: [-4, 41],
  google: [24, 50],
  tencent: [44, 33],
  bytedance: [22, 8],
  newscorp: [2, 18],
  'whatsapp-inc': [-12, 28],
  'youtube-inc': [16, 46],
  hi5: [34, 14],
  'friendster-inc': [30, 2],
  mol: [30, 2],
  'specific-media': [2, 18],
};

export default defineScene('their-ground', ({ t0, art, line, part }) => {
  const companiesLine = part(0, 0);
  const appearing = part(1, 0);
  const sameRules = part(1, 1);
  const game = line(2);
  const broken = line(3);
  const raceStart = t0 + 1.6;
  const raceEnd = sameRules.v1 - 0.4;
  const year = (t: number) => FROM + (TO - FROM) * prog(t, raceStart, raceEnd);
  const todayAt = game.v0 - 0.3; // the cut to today
  const lineAt = game.v0 + 1.3; // the line under the giants
  const crackAt = broken.v0 + 0.25;
  const pivot = broken.v0 + 0.45 * (broken.v1 - broken.v0); // "for the people who use…"
  const clearBoard = (t: number) => 1 - eio(prog(t, pivot - 0.7, pivot));

  // The world: globe, roots, people, sprouts. It moves to the centre and shrinks for the pivot.
  const cx = 1440;
  const cy = 560;
  const world = named('world', svg('g', {}, art));
  const g = globe(world, { cx, cy, r: 390, view: t => [14 + 0.25 * (t - t0), 22] });
  onFrame(t => {
    const intro = eout(prog(t, t0 + 0.1, t0 + 1.2));
    const k = eio(prog(t, pivot - 0.7, pivot + 0.5));
    set(world, { transform: `translate(${(-480 * k).toFixed(2)} ${(-160 * k).toFixed(2)}) ${scaleAbout(cx, cy, (0.94 + 0.06 * intro) * (1 - 0.25 * k))}` });
    vis(world, intro);
  });

  // The two boards: the race, then today by company.
  const raceData = race(platforms, { rows: ROWS, swap: 0.45 });
  const todayData = race(companies, { rows: ROWS, fade: 0, swap: 0 });
  const boardIn = (t: number) => eout(prog(t, t0 + 0.6, t0 + 1.5));
  const board = { x: 60, y: 150, rows: ROWS, nameW: 260, maxLen: 600, leaders: LEADERS };
  const raceBoard = leaderboard(art, raceData, {
    ...board, name: 'race', time: year,
    visible: t => boardIn(t) * (1 - prog(t, todayAt, todayAt + 0.35)),
    period: { x: 80, y: 820, text: x => String(Math.floor(x + 1e-6)) },
  });
  const todayBoard = leaderboard(art, todayData, {
    ...board, name: 'today', time: () => 2025,
    visible: t => prog(t, todayAt + 0.2, todayAt + 0.6) * clearBoard(t),
    period: { x: 80, y: 820, text: () => 'Today' },
  });

  // Sources, small, bottom left.
  const src = named('sources', svg('text', { x: 80, y: 1040, fill: color.text3, 'font-size': 16 }, art));
  onFrame(t => {
    src.textContent = t < todayAt + 0.2 ? sourceLines.race : sourceLines.today;
    vis(src, boardIn(t) * win(t, t0, todayAt + 0.2, 0.3, 0.2) + win(t, todayAt + 0.2, pivot, 0.4, 0.5));
  });

  // The line under the giants, today.
  const lineY = todayBoard.rowTop(LEADERS) - 8;
  const giantsLine = named('line', strokePath(art, `M 40 ${lineY} L 1000 ${lineY}`, { stroke: color.danger, 'stroke-width': 2.5, 'stroke-dasharray': '10 8' }));
  cue(lineAt, 'thud');

  // People: dots on land; captured (steel, dimmer) when an owner's roots reach them.
  const people = landPoints(320, 7).map((p, i) => ({ p, dot: svg('circle', { r: 2.6, fill: color.text }, world), at: companiesLine.v0 + 0.8 + (i % 40) * 0.05 }));
  named('people', people[0].dot.parentElement!);

  // Roots: one network per owner, grown in proportion to its biggest platform.
  const ownerIds = Object.keys(GROUND).filter(o => !['mol', 'specific-media'].includes(o));
  const rootsG = named('roots', svg('g', { fill: 'none', 'stroke-linecap': 'round' }, world));
  const nets = ownerIds.map((o, i) => ({
    o,
    origin: GROUND[o],
    branches: rootNetwork({ origins: [GROUND[o]], seed: 11 + i, trunks: 4, length: 14, step: 2.4, depth: 2, wander: 34, branching: 0.2 }).map(b => ({
      b,
      el: svg('path', { stroke: color.steel, 'stroke-opacity': [0.75, 0.55, 0.4, 0.3][b.depth] ?? 0.3 }, rootsG),
    })),
  }));
  const ownerSize = (o: string, t: number): number => {
    if (t >= todayAt + 0.2) {
      const c = companies.find(s => s.id === o);
      if (c) return c.points[0][1];
    }
    const x = year(t);
    let m = 0;
    for (const e of raceData.at(x)) if (ownerAt(e.series.id, x) === o) m = Math.max(m, e.value * e.presence);
    return m;
  };
  // growth 0..1: a billion users spreads roots most of the way
  const growthOf = (size: number) => clamp(Math.pow(size / 2000, 0.7));

  // Cables: from a leader's bar to its owner's ground.
  const cablesG = named('cables', svg('g', { fill: 'none', stroke: color.steel, 'stroke-linecap': 'round', 'stroke-width': 3 }, art));
  const cable = new Map<string, SVGPathElement>();
  const cableFor = (key: string) => {
    let el = cable.get(key);
    if (!el) {
      el = svg('path', {}, cablesG);
      cable.set(key, el);
    }
    return el;
  };
  for (const s of [...platforms, ...companies]) cableFor(s.id + (companies.includes(s) ? ':co' : ''));

  // Alternatives: mint sprouts across the land that grow small roots of their own, then fade.
  const sproutSpots = landPoints(7, 21, { lon: [-20, 60], lat: [-25, 55] });
  const sprouts = sproutSpots.map((p, i) => {
    const sg = named(`alternative-${i + 1}`, svg('g', {}, world));
    const rootEls = rootNetwork({ origins: [p], seed: 40 + i, trunks: 4, length: 6, step: 1.8, depth: 1, wander: 30, branching: 0.3 })
      .map(b => ({ b, el: svg('path', { fill: 'none', stroke: color.mint, 'stroke-opacity': 0.7, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, sg) }));
    const ring = svg('circle', { r: 12, fill: 'none', stroke: color.mint, 'stroke-width': 3 }, sg);
    const core = svg('circle', { r: 8, fill: color.mint, filter: 'url(#glow)' }, sg);
    const at = appearing.v0 + 0.1 + 1.25 * i;
    cue(at, 'pop');
    return { p, sg, rootEls, ring, core, at, end: at + 2.6 };
  });

  // The crack: red, once, across the disc.
  const crackR = rng(5);
  let d = `M ${cx - 360} ${cy - 110}`;
  for (let i = 1; i <= 12; i++) d += ` L ${cx - 360 + 60 * i} ${cy - 110 + 18 * i + (crackR() - 0.5) * 60}`;
  const crack = named('crack', strokePath(world, d, { stroke: color.danger, 'stroke-width': 4 }));
  cue(crackAt, 'crack');

  // Beneath: the people who use these tools, and the people who build them.
  const groups = [
    { name: 'users', x: 640, n: 5, label: 'The people who use them', build: false },
    { name: 'builders', x: 1280, n: 3, label: 'The people who build them', build: true },
  ].map((grp, gi) => {
    const gg = named(grp.name, svg('g', {}, art));
    for (let i = 0; i < grp.n; i++) person(svg('g', { transform: `translate(${grp.x + (i - (grp.n - 1) / 2) * 84} 830)` }, gg), 30, color.text);
    if (grp.build) svg('path', { d: glyph.laptop, fill: 'none', stroke: color.text2, 'stroke-width': 4, transform: `translate(${grp.x} 935) scale(0.7)` }, gg);
    const label = svg('text', { x: grp.x, y: 1010, 'text-anchor': 'middle', fill: color.text2, 'font-size': 28, 'font-weight': 700, 'letter-spacing': '0.12em' }, gg);
    label.textContent = grp.label.toUpperCase();
    const at = pivot + 0.4 + 0.9 * gi;
    cue(at, 'pop');
    return { gg, at };
  });

  onFrame(t => {
    const r = g.radius();
    const sizes = new Map(ownerIds.map(o => [o, ownerSize(o, t)]));

    // roots, per owner
    for (const n of nets) {
      const u = growthOf(sizes.get(n.o) ?? 0);
      for (const rp of n.branches) {
        const gp = grownPart(rp.b, u);
        const dp = gp ? g.path(gp) : null;
        if (!dp) {
          vis(rp.el, 0);
          continue;
        }
        set(rp.el, { d: dp, 'stroke-width': (([3.2, 1.8, 1.1, 0.8][rp.b.depth] ?? 0.8) * (r / 390)).toFixed(2) });
        vis(rp.el, 1);
      }
    }

    // people: caught once their nearest owner's roots have grown out to them
    for (const pp of people) {
      const f = g.facing(pp.p);
      if (f <= 0.02) {
        vis(pp.dot, 0);
        continue;
      }
      let caught = 0;
      for (const n of nets) {
        const dist = Math.hypot(n.origin[0] - pp.p[0], (n.origin[1] - pp.p[1]) * 1.3);
        caught = Math.max(caught, clamp((growthOf(sizes.get(n.o) ?? 0) * 42 - dist) / 6 + 1));
      }
      const [x, y] = g.xy(pp.p);
      set(pp.dot, { cx: x.toFixed(1), cy: y.toFixed(1), fill: mix(color.text, color.steel, caught) });
      vis(pp.dot, eout(prog(t, pp.at, pp.at + 0.5)) * clamp(f * 3) * (1 - 0.3 * caught));
    }

    // cables from the leaders' bars to their owners' ground
    const showing = t < todayAt + 0.2 ? raceBoard : todayBoard;
    const yr = year(t);
    for (const [key, el] of cable) {
      const id = key.replace(/:co$/, '');
      const isCo = key.endsWith(':co');
      const row = (isCo ? todayBoard : raceBoard).rows.get(id);
      const owner = isCo ? id : ownerAt(id, yr);
      const ground = owner ? GROUND[owner] : undefined;
      if (!row || !ground || (isCo ? showing !== todayBoard : showing !== raceBoard)) {
        vis(el, 0);
        continue;
      }
      const lead = clamp(LEADERS + 0.5 - row.entry.pos);
      const o = lead * row.opacity * clamp(g.facing(ground) * 4);
      if (o <= 0.01) {
        vis(el, 0);
        continue;
      }
      // the world group's transform, applied by hand so the cable meets the moved globe
      const k = eio(prog(t, pivot - 0.7, pivot + 0.5));
      const s = (0.94 + 0.06 * eout(prog(t, t0 + 0.1, t0 + 1.2))) * (1 - 0.25 * k);
      const [gx0, gy0] = g.xy(ground);
      const gx = cx + (gx0 - cx) * s - 480 * k;
      const gy = cy + (gy0 - cy) * s - 160 * k;
      const x0 = row.after + 16;
      set(el, { d: `M ${x0.toFixed(1)} ${row.y.toFixed(1)} C ${(x0 + 170).toFixed(1)} ${row.y.toFixed(1)} ${(gx - 170).toFixed(1)} ${gy.toFixed(1)} ${gx.toFixed(1)} ${gy.toFixed(1)}`, 'stroke-opacity': (0.7 * o).toFixed(3) });
      vis(el, 1);
    }

    drawOn(giantsLine, eout(prog(t, lineAt, lineAt + 0.6)));
    vis(giantsLine, t < lineAt ? 0 : clearBoard(t));

    for (const s of sprouts) {
      const f = g.facing(s.p);
      const o = win(t, s.at, s.end, 0.3, 0.8) * clamp(f * 4);
      vis(s.sg, o);
      if (o <= 0) continue;
      const [x, y] = g.xy(s.p);
      const grow = eback(prog(t, s.at, s.at + 0.45));
      const u = eio(prog(t, s.at + 0.3, s.at + 1.6)) * (1 - eio(prog(t, s.end - 1, s.end)));
      for (const rp of s.rootEls) {
        const gp = grownPart(rp.b, u);
        const dp = gp ? g.path(gp) : null;
        set(rp.el, { d: dp ?? '' });
      }
      set(s.ring, { cx: x.toFixed(1), cy: y.toFixed(1), r: (10 + 30 * eout(prog(t, s.at + 0.1, s.at + 1.1))).toFixed(2) });
      vis(s.ring, (1 - prog(t, s.at + 0.1, s.at + 1.1)) * 0.9);
      set(s.core, { cx: x.toFixed(1), cy: y.toFixed(1), r: (8 * Math.max(0.001, grow) * lerp(1, 0.6, bump(prog(t, s.end - 1.2, s.end)))).toFixed(2) });
    }

    drawOn(crack, eout(prog(t, crackAt, crackAt + 0.35)));
    vis(crack, t < crackAt ? 0 : 1 - 0.7 * prog(t, crackAt + 1.2, crackAt + 2.2));

    for (const gr of groups) {
      const a = prog(t, gr.at, gr.at + 0.5);
      vis(gr.gg, eout(a));
      set(gr.gg, { transform: `translate(0 ${(24 * (1 - eout(a))).toFixed(2)})` });
    }
  });
});
