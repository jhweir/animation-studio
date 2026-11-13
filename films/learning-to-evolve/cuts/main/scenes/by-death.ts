// Scene 2: the tested app zooms up into the unit of selection, bracketed; a handful of teams feed it and
// "does the company survive?" is its only test. Then a good idea cracks and sinks with a failing app
// while a bad one rises with a winner; a huge, slow loop rises from below with a company riding it,
// years ticking along it; "Whole things, tested by death."
import { board, cue, defineScene, eio, eout, named, onFrame, prog, svg, tf, vis } from '../../../../../engine/index.ts';
import { beat, color, person } from '../../../../../styles/coasys/index.ts';
import { appBox, arrive, at, caps, company, drawArrow, drawn, loop, mood, popIn, hold } from '../kit.ts';

export default defineScene('by-death', ctx => {
  const { art, text, t1 } = ctx;
  const l0 = ctx.line(0), l1 = ctx.line(1), l2 = ctx.line(2);
  const [teamsSaid, testSaid] = [ctx.part(0, 1), ctx.part(0, 2)];
  const [dies, lives, years] = [ctx.part(1, 0), ctx.part(1, 1), ctx.part(1, 2)];
  mood(ctx, 'problem');

  // Pose 1: the app from the loop's centre zooms up into one big app, bracketed as the unit.
  const unit = named('unit-of-selection', at(art));
  const app = named('whole-app', at(unit));
  appBox(app, 560, 360, { parts: ['plain', 'idea', 'plain', 'plain', 'bad', 'plain', 'plain', 'plain', 'plain'], seed: 8 });
  onFrame(t => {
    const u = eio(prog(t, ctx.t0, ctx.t0 + 0.8));
    app.setAttribute('transform', tf(960 + 100 * u, 500 - 30 * u, 0.41 + 0.59 * u));
  });
  const bracket = named('unit-bracket', at(unit));
  svg('rect', { x: -310, y: -210, width: 620, height: 420, rx: 30, fill: 'none', stroke: color.text, 'stroke-width': 3, 'stroke-dasharray': '14 12' }, bracket);
  caps(bracket, 0, -235, 'the unit: the whole app', { size: 28, fill: color.text });
  onFrame(t => {
    const u = eout(prog(t, l0.v0 + 0.6, l0.v0 + 1.1));
    bracket.setAttribute('transform', tf(1060, 470, 1.12 - 0.12 * u));
    vis(bracket, u);
  });
  cue(l0.v0 + 0.6, 'lock');

  const teams = named('teams', at(unit));
  for (let i = 0; i < 5; i++) popIn(person(at(teams), 26, color.steel), 330 + (i % 2 ? 40 : -40), 300 + i * 90, teamsSaid.v0 + 0.8 + i * 0.1);
  cue(teamsSaid.v0 + 0.8, 'pop');
  const teamsLabel = caps(teams, 330, 760, 'a handful of teams', { size: 20 });
  onFrame(t => vis(teamsLabel, prog(t, teamsSaid.v0 + 1.3, teamsSaid.v0 + 1.8)));
  drawArrow(teams, 400, 470, 730, 470, teamsSaid.v0 + 1.4, { stroke: color.steel, name: 'teams-arrow' });

  const survive = named('survive', at(unit));
  company(at(survive, 0, 0, 0.6));
  caps(survive, 70, 12, 'does the company survive?', { size: 26, fill: color.text2, anchor: 'start' });
  arrive(survive, 1060, 800, testSaid.v0 + 1.2, { dy: 40 });
  cue(testSaid.v0 + 1.2, 'thud');
  hold(unit, ctx.t0, l1.v0 + 0.2);

  // Pose 2: two apps. The failing one cracks and sinks with a good idea inside; the winner rises with a bad one.
  const fate = named('fates', at(art));
  const fail = named('failing-app', at(fate));
  appBox(fail, 420, 280, { parts: ['plain', 'idea', 'plain', 'plain', 'plain', 'plain'], seed: 5 });
  drawn(fail, 'M -60 -140 L -20 -60 L -70 10 L -10 90 L -40 140', dies.v0 + 1.6, { stroke: color.danger, 'stroke-width': 4 }, { dur: 0.35 });
  cue(dies.v0 + 1.6, 'crack');
  const failLabel = caps(fate, 560, 830, 'a good idea dies with it', { size: 24, fill: color.orange });
  const winApp = named('winning-app', at(fate));
  appBox(winApp, 420, 280, { parts: ['plain', 'plain', 'plain', 'bad', 'plain', 'plain'], seed: 6 });
  const winLabel = caps(fate, 1360, 830, 'a bad idea lives on', { size: 24, fill: color.danger });
  const sink = dies.v0 + 2.1, rise = lives.v0 + 0.6;
  onFrame(t => {
    const a = eback0(prog(t, dies.v0 + 0.1, dies.v0 + 0.55));
    const u = eio(prog(t, sink, sink + 1.4));
    fail.setAttribute('transform', tf(560, 480 + u * 120, a, u * -8));
    fail.setAttribute('opacity', (1 - 0.55 * u).toFixed(3));
    vis(failLabel, prog(t, sink + 0.8, sink + 1.3));
    const b = eback0(prog(t, dies.v0 + 0.25, dies.v0 + 0.7));
    winApp.setAttribute('transform', tf(1360, 480 - eio(prog(t, rise, rise + 1.2)) * 80, b));
    vis(winLabel, prog(t, rise + 0.7, rise + 1.2));
  });
  drawArrow(fate, 1610, 520, 1610, 330, rise + 0.3, { stroke: color.steel, name: 'rising-arrow' });
  cue(rise, 'slide');
  hold(fate, l1.v0, years.v0 + 0.1);

  // Pose 3: a huge, slow loop rises from below with a whole company riding it; years tick along it.
  const slowAt = named('slow-loop', at(art));
  const slow = at(slowAt);
  loop(slow, 900, { labels: false, width: 8, spin: 0.01, from: years.v0 });
  const rider = named('company-rider', at(slow, 0, -900));
  onFrame(t => {
    const a = -Math.PI / 2 + 2 * Math.PI * 0.01 * Math.max(0, t - years.v0);
    rider.setAttribute('transform', tf(900 * Math.cos(a), 900 * Math.sin(a)));
  });
  company(at(rider, -20, -100, 0.8));
  appBox(at(rider, 130, -62), 150, 100);
  for (let y = 1; y <= 5; y++) {
    const ang = -Math.PI / 2 + (y - 3) * 0.28;
    const yr = caps(slow, 850 * Math.cos(ang), 850 * Math.sin(ang) + 10, `year ${y}`, { size: 20 });
    onFrame(t => vis(yr, prog(t, years.v0 + 1 + y * 0.3, years.v0 + 1.4 + y * 0.3)));
  }
  cue(years.v0 + 1.3, 'tick', { i: 0 });
  onFrame(t => {
    const u = eio(prog(t, years.v0, years.v0 + 0.9));
    slowAt.setAttribute('transform', tf(960, 1160 + 500 * (1 - u)));
    vis(slowAt, Math.min(prog(t, years.v0, years.v0 + 0.4), 1 - 0.65 * eio(prog(t, l2.v0, l2.v0 + 0.6))));
  });

  beat(text, { t0: l2.v0 + 0.2, t1: t1 + 0.5, dim: 0.5, rows: [{ h: 'Whole things,', t: l2.v0 + 0.2 }, { h: 'tested by death.', t: l2.v0 + 1.4 }] });

  board(testSaid.v1, 'The whole app (zoomed up from the loop) bracketed as the unit of selection. A handful of teams feed it; below, the only test: does the company survive?');
  board(lives.v1, 'Two apps: the failing one cracks and sinks with a good idea (orange) inside; the winner rises carrying a bad one (red).');
  board(years.v1, 'A huge, slow loop risen from below, mostly off screen, with a whole company riding it; years tick along it: one turn takes years.');
  board(l2.v1, 'Big words over the dimmed loop: "Whole things, tested by death."');
});

/** Pop-in scale with overshoot that starts from nothing. */
function eback0(u: number): number {
  const c1 = 1.6, c3 = c1 + 1;
  return Math.max(0.0001, 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2));
}
