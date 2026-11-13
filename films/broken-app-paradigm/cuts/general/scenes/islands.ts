// Scene 6: AI (a bot, purple drafts) builds the shell fast; the drafts close into a finished app that
// sails off to become an island; a community across the water is asked to move everything over and
// hesitates; then a sea of islands that could connect but end up competing.
import { board, cue, defineScene, eio, eout, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import { appBox, at, bot, caps, color, community, cross, mark, membranePath, mood } from '../../../../../styles/coasys/index.ts';
import { arrive, drawArrow, drawn, fade, pop, stagger } from '../kit.ts';

export default defineScene('islands', ctx => {
  const { art, t0 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2);
  const P = (i: number, j: number) => ctx.part(i, j);
  const k = (p: { v0: number; v1: number }, f: number) => p.v0 + (p.v1 - p.v0) * f;
  mood(ctx, 'problem');
  const island = (parent: Element, r: number, seed: number) =>
    svg('path', { d: membranePath(r, seed, 2.5), transform: 'scale(1 0.45)', fill: color.surface2, stroke: color.line, 'stroke-width': 3 }, parent);
  const spread = (g: Element, x: number, y: number, a: number, dur = 0.6) =>
    onFrame(t => {
      const u = eout(prog(t, a, a + dur));
      g.setAttribute('transform', `translate(${x} ${y}) scale(${Math.max(0.0001, u).toFixed(4)} 1)`);
      vis(g, prog(t, a, a + 0.2));
    });

  // Pose 1: AI drafts the shell quickly: purple layers flick on round the small idea.
  const ai = named('ai-builds-shell', at(art));
  const tApp = l1.v0;
  const out1 = tApp + 0.6;
  const b = pop(ai, 520, 520, t0 + 0.3, { name: 'bot', until: P(0, 1).v0 + 0.8 });
  bot(b, 60);
  const beam = drawArrow(ai, 620, 520, 820, 520, t0 + 0.9, { stroke: color.blue, dur: 0.35 });
  onFrame(t => vis(beam, 1 - prog(t, P(0, 1).v0 + 0.4, P(0, 1).v0 + 0.8)));
  const drafts = named('ai-drafts', svg('g', {}, ai));
  [0, 1, 2, 3].forEach(i => {
    const r = svg('rect', { x: 1060 - 120 - i * 40, y: 520 - 80 - i * 30, width: 240 + i * 80, height: 160 + i * 60, rx: 12, fill: 'none', stroke: color.purple, 'stroke-width': 2.5 }, drafts);
    const a = t0 + 1.2 + i * 0.18;
    onFrame(t => vis(r, prog(t, a, a + 0.15) * (0.8 - i * 0.12)));
    cue(a, 'tick', { i });
  });
  // "The hardest part comes after": the drafts close into one finished app, ready to ship.
  onFrame(t => {
    const u = eio(prog(t, tApp - 0.6, tApp + 0.2));
    drafts.setAttribute('transform', `translate(1060 520) scale(${(1 - 0.55 * u).toFixed(4)}) translate(-1060 -520)`);
    vis(drafts, 1 - prog(t, tApp - 0.1, tApp + 0.2));
  });
  mark(pop(ai, 1060, 520, t0 + 0.6, { until: tApp }), 0, 0, 0, 0.6, color.orange);
  caps(arrive(ai, 1060, 820, t0 + 1.6, { until: out1 }), 0, 0, 'the shell, faster', { size: 22, fill: color.purple });

  // Pose 2: the finished app moves off and becomes an island; the community across the water would
  // have to cross with everything it has.
  const cross1 = named('island-app', at(art));
  const appIsland = at(cross1, 1400, 560, 1, 'app-island');
  island(appIsland, 260, 3);
  spread(appIsland, 1400, 560, tApp + 0.6);
  cue(tApp + 0.6, 'land');
  const app = at(cross1, 1060, 520, 1, 'finished-app');
  appBox(app, 220, 150, { parts: ['plain', 'idea', 'plain', 'plain'], seed: 70 });
  onFrame(t => {
    const s = eout(prog(t, tApp - 0.2, tApp + 0.2));
    const u = eio(prog(t, tApp + 0.2, tApp + 1.0));
    app.setAttribute('transform', tf(1060 + 340 * u, 520 - 20 * u, Math.max(0.0001, s)));
  });
  const p11 = P(1, 1);
  const tCom = k(p11, 0.27), tMove = k(p11, 0.38), tHist = k(p11, 0.55), tBet = k(p11, 0.78);
  const homeIsland = at(cross1, 420, 600, 1, 'home-island');
  island(homeIsland, 300, 5);
  spread(homeIsland, 420, 600, tCom - 0.4);
  const home = at(cross1, 420, 500, 1, 'community');
  community(home, 120, 9, 71);
  // On "bet on something new" it leans toward the crossing, and draws back.
  onFrame(t => {
    const s = eout(prog(t, tCom, tCom + 0.5));
    const lean = Math.sin(Math.PI * prog(t, tBet, tBet + 1.4));
    home.setAttribute('transform', tf(420 + 70 * lean, 500 - 12 * lean, Math.max(0.0001, s)));
    vis(home, prog(t, tCom, tCom + 0.2));
  });
  cue(tCom, 'pop');
  drawArrow(cross1, 600, 420, 1230, 420, tMove, { stroke: color.steel, bend: -120, dash: '10 10', dur: 0.8 });
  caps(arrive(cross1, 920, 250, tMove + 0.4), 0, 0, 'move everything here?', { size: 24, fill: color.text2 });
  caps(arrive(cross1, 420, 700, tHist), 0, 0, 'its people · its history', { size: 20 });
  const sink = l2.v0;
  onFrame(t => {
    const u = eio(prog(t, sink, sink + 0.7));
    cross1.setAttribute('transform', `translate(960 540) scale(${(1 - 0.4 * u).toFixed(4)}) translate(-960 -540)`);
    vis(cross1, 1 - prog(t, sink + 0.2, sink + 0.7));
  });

  // Pose 3: islands everywhere. Good ideas, each alone; the links that could join them, crossed out.
  const sea = named('islands', at(art));
  const spots = [[300, 300], [800, 230], [1350, 320], [1650, 640], [1100, 700], [550, 760], [220, 620]];
  spots.forEach(([x, y], i) => {
    const a = stagger(sink + 0.3, sink + 1.6, i, spots.length);
    const g = pop(sea, x, y, a, { name: `island-${i + 1}`, dur: 0.5 });
    const isl = svg('g', { transform: 'translate(0 50)' }, g);
    island(isl, 150, 10 + i);
    appBox(at(g, 0, 10), 140, 96, { parts: ['plain', 'idea', 'plain'], seed: 80 + i });
    cue(a, 'pop', { i });
  });
  const p21 = P(2, 1);
  const tLink = k(p21, 0.1), tCompete = k(p21, 0.6);
  [[0, 1], [1, 2], [5, 4]].forEach(([a, b], j) => {
    const [ax, ay] = spots[a], [bx, by] = spots[b];
    drawn(sea, `M ${ax + 80} ${ay + 10} L ${bx - 80} ${by + 10}`, tLink + j * 0.25, 0.6, { stroke: color.steel, 'stroke-width': 2.5, opacity: 0.6 });
  });
  [[560, 270], [1080, 270], [820, 740]].forEach(([x, y], j) => cross(pop(sea, x, y, tCompete + j * 0.2, { name: `no-link-${j + 1}` }), 0, 0, 0.8));
  cue(tCompete, 'crack');
  caps(arrive(sea, 960, 1000, tCompete + 0.4), 0, 0, 'competing for the same attention', { size: 24, fill: color.text2 });
  fade(sea, sink + 0.2, Infinity, 0.1);

  board(P(0, 0).v1, 'A bot (blue) drafts the shell in purple layers, fast, around the small idea.');
  board(l1.v1, 'The finished app has moved off onto its own island; across the water, a community with its people and history is asked to move everything over (it leans toward the crossing and draws back).');
  board(l2.v1, 'A sea of islands, each an app with a good idea inside; the links that could join them drawn in and crossed out.');
});
