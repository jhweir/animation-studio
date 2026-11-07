// Scene 5: the systems reply. The man is "a part"; the whole room is the system. Then a question
// travels through a head: ear → thalamus (the man's place) → neocortex (the rulebook that also does
// the work) → speech. The room splits store from work; brains and models don't. A lens stops at
// stations, none of which understands. Then the whole brain lights: the pattern of the whole.
import { defineScene, drawOn, eio, eout, named, onFrame, prog, set, strokePath, svg, vis } from '../../../../../engine/index.ts';
import {
  along, aurora, book, brain, brainSpots, card, color, group, headProfile, label, modelNet, neuron, panel,
  place, room, say, seated, sent, words,
} from '../../../../../styles/chalk/index.ts';

type Pt = [number, number];
const dist = (x: number, y: number, p: Pt) => Math.hypot(x - p[0], y - p[1]);
const lerpPt = (a: Pt, b: Pt, u: number): Pt => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];

export default defineScene('systems', ctx => {
  const { art, text } = ctx;
  const L = [0, 1, 2, 3, 4, 5, 6].map(i => ctx.line(i));
  const S = (i: number, j: number) => sent(ctx, i, j);

  // 0: the heading.
  const head0 = named('heading', group(art));
  label(head0, 960, 470, 'the most famous reply', { anchor: 'middle' });
  words(head0, 960, 570, 'The systems reply', { size: 96 });

  // 1: the room; the man is a part; the room is the system.
  const R = room(art, 620, 190, 1);
  const part = named('a-part', group(art));
  svg('circle', { cx: 940, cy: 640, r: 210, fill: 'none', stroke: color.ink, 'stroke-width': 2, 'stroke-dasharray': '6 8' }, part);
  label(part, 940, 890, 'a part', { color: color.ink, anchor: 'middle' });
  const whole = named('the-system', group(art));
  const wholeGrad = aurora(600, 1640);
  const outline = strokePath(whole, 'M600 170 L1640 170 L1640 850 L600 850 Z', { stroke: wholeGrad, 'stroke-width': 4, filter: 'url(#glow)' });
  label(whole, 1640, 140, 'the whole system', { color: color.a2, anchor: 'end' });

  // 2: the head, the ear, the relay.
  const headG = named('head', group(art));
  headProfile(headG, 900, 170, 1.2);
  const small = brain(headG, 940, 390, 0.38, { n: 110, thalamus: true, name: 'brain-in-head' });
  const ear = svg('path', { d: 'M1010 520 q30 0 30 40 q0 40 -30 40', fill: 'none', stroke: color.ink, 'stroke-width': 3 }, headG);
  void ear;
  const waves = [0, 1, 2, 3].map(i => svg('path', { d: `M${1230 - i * 45} ${500 - i * 12} Q${1180 - i * 45} 560 ${1230 - i * 45} ${620 + i * 12}`, fill: 'none', stroke: color.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, headG));
  const th = small.at(brainSpots.thalamus);
  const route = strokePath(headG, `M1015 560 Q1000 470 ${th[0]} ${th[1]}`, { stroke: color.ink, 'stroke-width': 2.5, 'stroke-dasharray': '8 8' });
  const relayCard = card(headG, 70, 46, 501);
  label(headG, 760, 960, "thalamus: the man's place", { color: color.ink, anchor: 'middle', size: 22 });

  // 3 and 6: the big brain.
  const B = brain(art, 960, 450, 1, { thalamus: true, name: 'neocortex' });
  const bLabels = named('labels', group(art));
  label(bLabels, 300, 130, 'neocortex', { color: color.ink });
  label(bLabels, 1640, 130, '100,000,000,000,000+', { color: color.a2, anchor: 'end' });
  label(bLabels, 1640, 164, 'connections', { anchor: 'end' });
  const ghost = named('rulebook', book(art, 960, 430, 3.2));
  // [label, spot, label offset, anchor]
  const stations: [string, Pt, Pt, 'start' | 'middle' | 'end'][] = [
    ['auditory cortex: sound', B.at(brainSpots.auditory), [-30, 60], 'end'],
    ["Wernicke's area: meaning", B.at(brainSpots.wernicke), [40, 60], 'start'],
    ["Broca's area: words", B.at(brainSpots.broca), [-30, 60], 'end'],
    ['motor cortex: movement', B.at(brainSpots.motor), [0, -36], 'middle'],
    ['brainstem: lips and tongue', B.at(brainSpots.stem), [40, 0], 'start'],
  ];
  const stationLabels = stations.map(([s, p, o, anchor]) => {
    const g = group(art);
    svg('circle', { cx: p[0], cy: p[1], r: 14, fill: 'none', stroke: color.ink, 'stroke-width': 2.5 }, g);
    label(g, p[0] + o[0], p[1] + o[1], s, { color: color.ink, anchor, size: 20 });
    return g;
  });
  const pulse = named('pulse', svg('circle', { cx: 0, cy: 0, r: 14, fill: color.a1, filter: 'url(#glowBig)' }, art));
  say(text, "It's your rulebook.", S(3, 1).v0, S(3, 2).v0 + 0.3);
  say(text, 'It also does the work.', S(3, 2).v0 + 0.4, S(3, 3).v0);

  // 4: store and work, three ways.
  const three = named('store-and-work', group(art));
  panel(three, 80, 180, 540, 560);
  panel(three, 690, 180, 540, 560);
  panel(three, 1300, 180, 540, 560);
  label(three, 350, 790, 'the room', { anchor: 'middle', size: 22 });
  label(three, 960, 790, 'a brain', { anchor: 'middle', size: 22 });
  label(three, 1570, 790, 'a model', { anchor: 'middle', size: 22 });
  const roomPanel = group(three);
  book(roomPanel, 250, 495, 1);
  seated(roomPanel, 470, 380, 0.75);
  label(roomPanel, 250, 600, 'store', { color: color.ink, anchor: 'middle' });
  label(roomPanel, 500, 650, 'work', { color: color.ink, anchor: 'middle' });
  const gap = strokePath(roomPanel, 'M370 250 L370 700', { stroke: color.muted, 'stroke-width': 2 });
  const brainPanel = group(three);
  const PB = brain(brainPanel, 960, 440, 0.45, { n: 140, seed: 21, name: 'brain-panel' });
  label(brainPanel, 960, 680, 'store + work', { color: color.ink, anchor: 'middle' });
  const modelPanel = group(three);
  const M = modelNet(modelPanel, 1370, 300, 400, 280);
  label(modelPanel, 1570, 680, 'store + work', { color: color.ink, anchor: 'middle' });

  // 5: the lens.
  const lensScene = named('lens', group(art));
  const LB = brain(lensScene, 760, 470, 0.85, { n: 220, seed: 9, name: 'brain-lens' });
  set(LB.g, { opacity: 0.55 });
  const lensRing = svg('circle', { cx: 0, cy: 0, r: 60, fill: 'none', stroke: color.ink, 'stroke-width': 3 }, lensScene);
  const lensLine = svg('line', { stroke: color.ink, 'stroke-width': 2 }, lensScene);
  svg('circle', { cx: 1440, cy: 470, r: 300, fill: color.bg, stroke: color.ink, 'stroke-width': 3 }, lensScene);
  const cells = group(lensScene);
  neuron(cells, 1380, 450, 0.9, 5);
  neuron(cells, 1520, 590, 0.6, 8);
  neuron(cells, 1560, 330, 0.5, 11);
  words(lensScene, 1440, 880, '?', { size: 90, color: color.dim });
  const lensName = label(lensScene, 1440, 140, '', { color: color.ink, anchor: 'middle', size: 22 });
  const lensStops: [string, Pt][] = [
    ["Broca's area", LB.at(brainSpots.broca)],
    ["Wernicke's area", LB.at(brainSpots.wernicke)],
    ['motor cortex', LB.at(brainSpots.motor)],
  ];

  // 6: the inset room, lit as a whole.
  const inset = named('room-whole', group(art));
  panel(inset, 1500, 760, 340, 220);
  room(inset, 1560, 800, 0.22, { lamp: false, name: 'inset-room' });
  const insetGlow = strokePath(inset, 'M1550 795 L1785 795 L1785 945 L1550 945 Z', { stroke: aurora(1550, 1790), 'stroke-width': 3, filter: 'url(#glow)' });

  const thB = B.at(brainSpots.thalamus);
  const route3: Pt[] = [thB, ...stations.map(s => s[1])];

  onFrame(t => {
    // 0
    vis(head0, eout(prog(t, L[0].v0 - 0.2, L[0].v0 + 0.4)) * (1 - prog(t, L[1].v0 - 0.3, L[1].v0)));

    // 1
    const on1 = eout(prog(t, L[1].v0, L[1].v0 + 0.5)) * (1 - prog(t, L[2].v0 - 0.3, L[2].v0 + 0.1));
    vis(R.g, on1);
    vis(part, on1 * eout(prog(t, S(1, 1).v0, S(1, 1).v0 + 0.5)) * (1 - prog(t, S(1, 3).v0, S(1, 3).v0 + 0.4)));
    vis(whole, on1);
    drawOn(outline, eio(prog(t, S(1, 3).v0 + 0.3, S(1, 3).v0 + 2.0)));
    vis(whole.lastElementChild!, eout(prog(t, S(1, 3).v0 + 1.6, S(1, 3).v0 + 2.1)));

    // 2
    const on2 = eout(prog(t, L[2].v0, L[2].v0 + 0.5)) * (1 - prog(t, L[3].v0 - 0.4, L[3].v0 + 0.1));
    vis(headG, on2);
    const s21 = S(2, 1);
    waves.forEach((w, i) => {
      const u = (t - s21.v0) * 1.4 - i * 0.25;
      vis(w, t > s21.v0 ? Math.max(0, Math.min(1, u)) * (1 - prog(t, s21.v0 + 3, s21.v0 + 3.6)) : 0);
    });
    drawOn(route, eio(prog(t, s21.v0 + 1.0, s21.v0 + 2.6)));
    const rc = prog(t, s21.v0 + 1.0, s21.v0 + 2.6);
    place(relayCard.g, 1015 + (th[0] - 1015) * eio(rc), 560 + (th[1] - 560) * eio(rc) - 40 * Math.sin(Math.PI * rc), 0.6, -8);
    vis(relayCard.g, rc > 0 && rc < 1 ? 1 : 0);
    set(small.thalamusDot, { opacity: eout(prog(t, s21.v0 + 2.5, s21.v0 + 3.0)).toFixed(3) });
    const fan = prog(t, s21.v0 + 3.0, s21.v1);
    small.light((x, y) => (dist(x, y, th) < 400 * fan ? 0.8 : 0));

    // 3 and 6: the big brain
    const on3 = eout(prog(t, L[3].v0 - 0.3, L[3].v0 + 0.4)) * (1 - prog(t, L[4].v0 - 0.4, L[4].v0));
    const on6 = eout(prog(t, L[6].v0 - 0.2, L[6].v0 + 0.4));
    vis(B.g, Math.max(on3, on6));
    vis(bLabels, on3);
    set(B.thalamusDot, { opacity: (on3 > 0 ? 1 : on6).toFixed(3) });
    const s30 = S(3, 0);
    const s33 = S(3, 3);
    const front = 1100 * eio(prog(t, s30.v0, s30.v0 + 3.5));
    const pu = prog(t, s33.v0 + 0.3, s33.v1);
    const seg = Math.min(route3.length - 2, Math.floor(pu * (route3.length - 1)));
    const pp = lerpPt(route3[seg], route3[seg + 1], eio(pu * (route3.length - 1) - seg));
    const pulseOn = pu > 0 && pu < 1;
    set(pulse, { cx: pp[0].toFixed(1), cy: pp[1].toFixed(1) });
    vis(pulse, on3 * (pulseOn ? 1 : 0));
    stationLabels.forEach((g, i) => vis(g, on3 * eout(prog(pu, i / (route3.length - 1) + 0.12, i / (route3.length - 1) + 0.2))));
    const s61 = S(6, 1);
    const whole6 = eio(prog(t, s61.v0 + 0.5, s61.v0 + 2.5));
    if (on6 > 0) B.light((x, y) => (dist(x, y, thB) < 1200 * whole6 ? 1 : 0));
    else B.light((x, y) => {
      const base = dist(x, y, thB) < front ? 0.16 : 0;
      const near = pulseOn ? Math.max(0, 1 - dist(x, y, pp) / 160) : 0;
      return Math.max(base, near);
    });
    vis(ghost, on3 * eout(prog(t, S(3, 1).v0, S(3, 1).v0 + 0.5)) * 0.35 * (1 - prog(t, S(3, 2).v0, S(3, 2).v0 + 0.8)));

    // 4
    const on4 = eout(prog(t, L[4].v0, L[4].v0 + 0.5)) * (1 - prog(t, L[5].v0 - 0.3, L[5].v0 + 0.1));
    vis(three, on4);
    vis(roomPanel, eout(prog(t, L[4].v0 + 0.2, L[4].v0 + 0.7)));
    drawOn(gap, eio(prog(t, along(ctx, 4, 0.12), along(ctx, 4, 0.22))));
    vis(brainPanel, eout(prog(t, S(4, 1).v0, S(4, 1).v0 + 0.5)));
    PB.light(() => 0.75 * eout(prog(t, S(4, 1).v0 + 0.3, S(4, 1).v0 + 1.2)));
    vis(modelPanel, eout(prog(t, S(4, 2).v0, S(4, 2).v0 + 0.5)));
    M.light(0.75 * eout(prog(t, S(4, 2).v0 + 0.5, S(4, 2).v0 + 1.4)));

    // 5
    const on5 = eout(prog(t, L[5].v0, L[5].v0 + 0.5)) * (1 - prog(t, L[6].v0 - 0.4, L[6].v0));
    vis(lensScene, on5);
    const stop = t < S(5, 1).v0 ? 0 : t < S(5, 2).v0 ? 1 : 2;
    const prevStop = Math.max(0, stop - 1);
    const at = stop === 0 ? L[5].v0 : S(5, stop).v0;
    const mv = eio(prog(t, at, at + 0.7));
    const lp = stop === 0 ? lensStops[0][1] : lerpPt(lensStops[prevStop][1], lensStops[stop][1], mv);
    set(lensRing, { cx: lp[0].toFixed(1), cy: lp[1].toFixed(1) });
    set(lensLine, { x1: (lp[0] + 50).toFixed(1), y1: (lp[1] - 30).toFixed(1), x2: 1220, y2: 380 });
    lensName.textContent = lensStops[stop][0].toUpperCase();
    vis(cells, stop === 0 ? 1 : 0.4 + 0.6 * mv);

    // 6
    vis(inset, on6 * eout(prog(t, s61.v0 + 1.5, s61.v0 + 2.2)));
    drawOn(insetGlow, eio(prog(t, s61.v0 + 2.0, s61.v0 + 3.0)));
  });
});
