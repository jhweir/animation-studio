// Scene 7: what the room shows. The spotlight on the man widens to the whole room. Three blind
// parts (a man with a book, a chip, a neuron); the neuron's panel becomes you. A sleeper whose
// understanding is full while experience is empty. A frozen model beside a brain whose memory link
// is cut and still understands. Then the room, you, and a model with an open question.
import { defineScene, drawOn, eio, eout, named, onFrame, prog, set, strokePath, svg, vis } from '../../../../../engine/index.ts';
import {
  aurora, book, brain, chip, color, group, label, lock, modelNet, neuron, panel, room, seated, sent, sleeper, spot,
  standing, thought, words,
} from '../../../../../styles/chalk/index.ts';

export default defineScene('shows', ctx => {
  const { art } = ctx;
  const L = [0, 1, 2, 3, 4].map(i => ctx.line(i));
  const S = (i: number, j: number) => sent(ctx, i, j);

  // 0: spotlight, then the whole room.
  const R = room(art, 620, 170, 1, { reader: true });
  const pool = named('spotlight', svg('circle', { cx: 960, cy: 600, r: 280, fill: spot(960, 600, 280, 0.16) }, art));
  const lit = seated(art, 920, 500);
  const roomGlow = strokePath(art, 'M600 150 L1640 150 L1640 830 L600 830 Z', { stroke: aurora(600, 1640), 'stroke-width': 4, filter: 'url(#glow)' });

  // 1: three blind parts.
  const parts = named('three-parts', group(art));
  const p1 = group(parts);
  panel(p1, 80, 220, 540, 520);
  seated(p1, 280, 360, 0.8);
  book(p1, 450, 520, 0.8);
  label(p1, 350, 790, 'a man with a book', { anchor: 'middle', size: 22 });
  const p2 = group(parts);
  panel(p2, 690, 220, 540, 520);
  chip(p2, 960, 480, 1.1);
  label(p2, 960, 790, 'a chip', { anchor: 'middle', size: 22 });
  const p3 = group(parts);
  panel(p3, 1300, 220, 540, 520);
  const n3 = neuron(p3, 1530, 480, 1);
  const n3Label = label(p3, 1570, 790, 'a neuron', { anchor: 'middle', size: 22 });
  const you = group(p3);
  standing(you, 1570, 700, 420);
  const youBrain = brain(you, 1572, 335, 0.055, { n: 24, seed: 4, name: 'your-brain' });
  label(you, 1570, 790, 'you', { color: color.ink, anchor: 'middle', size: 22 });
  const qs = [350, 960, 1570].map(x => words(parts, x, 700, '?', { size: 60, color: color.dim }));

  // 2: understanding and experience.
  const sleep = named('asleep', group(art));
  sleeper(sleep, 430, 650, 1);
  const sb = brain(sleep, 432, 645, 0.075, { n: 30, seed: 6, name: 'sleeping-brain' });
  thought(sleep, 620, 380, 160, 110, 470, 560, true);
  const dials = named('dials', group(sleep));
  const dg = aurora(1320, 1760);
  label(dials, 1320, 400, 'understanding', { color: color.ink });
  svg('rect', { x: 1320, y: 420, width: 440, height: 26, rx: 13, fill: 'none', stroke: color.ink, 'stroke-width': 2 }, dials);
  const fillU = svg('rect', { x: 1320, y: 420, width: 440, height: 26, rx: 13, fill: dg, filter: 'url(#glow)' }, dials);
  label(dials, 1320, 540, 'experience', { color: color.ink });
  svg('rect', { x: 1320, y: 560, width: 440, height: 26, rx: 13, fill: 'none', stroke: color.ink, 'stroke-width': 2 }, dials);
  svg('rect', { x: 1320, y: 560, width: 30, height: 26, rx: 13, fill: color.muted }, dials);

  // 3: the frozen rulebook.
  const frozen = named('frozen', group(art));
  panel(frozen, 80, 200, 840, 600);
  panel(frozen, 1000, 200, 840, 600);
  label(frozen, 500, 850, 'a model today', { anchor: 'middle', size: 22 });
  label(frozen, 1420, 850, 'a brain', { anchor: 'middle', size: 22 });
  const M = modelNet(frozen, 140, 280, 460, 320, { name: 'frozen-model' });
  const locks = [[250, 300], [490, 300], [370, 580]].map(([x, y]) => lock(frozen, x, y, 1.2));
  const pad = (x: number, color2: string) => {
    const g = group(frozen);
    svg('rect', { x, y: 330, width: 200, height: 240, rx: 6, fill: color.card, stroke: color.ink, 'stroke-width': 2.5 }, g);
    const lines = [0, 1, 2, 3].map(i => svg('line', { x1: x + 25, y1: 380 + i * 40, x2: x + 175, y2: 380 + i * 40, stroke: color2, 'stroke-width': 3 }, g));
    return lines;
  };
  const chatLines = pad(660, color.ink);
  label(frozen, 760, 610, 'the conversation', { anchor: 'middle', size: 18 });
  const FB = brain(frozen, 1500, 470, 0.42, { n: 120, seed: 15, name: 'brain-memory' });
  const memLines = pad(1060, color.ink);
  label(frozen, 1160, 610, 'new memories', { anchor: 'middle', size: 18 });
  const link = strokePath(frozen, 'M1270 450 Q1310 380 1340 430', { stroke: color.ink, 'stroke-width': 3 });
  const cut = strokePath(frozen, 'M1285 395 L1320 450', { stroke: color.a3, 'stroke-width': 5 });
  const stillLabel = label(frozen, 1500, 740, 'still understands', { color: color.a1, anchor: 'middle', size: 22 });

  // 4: still open.
  const open = named('still-open', group(art));
  panel(open, 80, 220, 540, 520);
  panel(open, 690, 220, 540, 520);
  panel(open, 1300, 220, 540, 520);
  label(open, 350, 790, 'the room', { anchor: 'middle', size: 22 });
  label(open, 960, 790, 'you', { anchor: 'middle', size: 22 });
  label(open, 1570, 790, 'a model', { anchor: 'middle', size: 22 });
  room(open, 150, 330, 0.4, { lamp: false, name: 'room-panel' });
  const roomPanelGlow = strokePath(open, 'M140 320 L560 320 L560 590 L140 590 Z', { stroke: aurora(140, 560), 'stroke-width': 3, filter: 'url(#glow)' });
  const OB = brain(open, 960, 470, 0.45, { n: 140, seed: 21, name: 'your-brain-panel' });
  const OM = modelNet(open, 1370, 300, 400, 280, { name: 'model-panel' });
  const openQ = words(open, 1570, 500, '?', { size: 140 });

  onFrame(t => {
    // 0
    const on0 = eout(prog(t, L[0].v0 - 0.2, L[0].v0 + 0.3)) * (1 - prog(t, L[1].v0 - 0.3, L[1].v0 + 0.1));
    const widen = eio(prog(t, S(0, 1).v0, S(0, 1).v0 + 1.2));
    vis(R.g, on0 * (0.18 + 0.82 * widen));
    vis(pool, on0 * (1 - widen));
    vis(lit, on0 * (1 - widen));
    vis(roomGlow, on0);
    drawOn(roomGlow, eio(prog(t, S(0, 1).v0 + 0.6, S(0, 1).v0 + 2.2)));

    // 1
    const on1 = eout(prog(t, L[1].v0, L[1].v0 + 0.4)) * (1 - prog(t, L[2].v0 - 0.3, L[2].v0 + 0.1));
    vis(parts, on1);
    const s11 = S(1, 1);
    vis(p1, eout(prog(t, s11.v0, s11.v0 + 0.4)));
    vis(p2, eout(prog(t, s11.v0 + 1.0, s11.v0 + 1.4)));
    vis(p3, eout(prog(t, s11.v0 + 1.8, s11.v0 + 2.2)));
    qs.forEach((q, i) => vis(q, eout(prog(t, s11.v0 + 0.4 + i * 0.9, s11.v0 + 0.8 + i * 0.9)) * (i === 2 ? 1 - prog(t, S(1, 2).v0 + 0.5, S(1, 2).v0 + 1.0) : 1)));
    const becomeYou = eio(prog(t, S(1, 2).v0 + 0.5, S(1, 2).v0 + 1.5));
    vis(n3, 1 - becomeYou);
    vis(n3Label, 1 - becomeYou);
    vis(you, becomeYou);
    youBrain.light(() => eout(prog(t, S(1, 2).v0 + 1.3, S(1, 2).v0 + 2.0)));

    // 2
    const on2 = eout(prog(t, L[2].v0, L[2].v0 + 0.5)) * (1 - prog(t, L[3].v0 - 0.3, L[3].v0 + 0.1));
    vis(sleep, on2);
    sb.light(() => 1);
    vis(dials, eout(prog(t, S(2, 2).v0, S(2, 2).v0 + 0.5)));
    set(fillU, { width: (440 * eio(prog(t, S(2, 2).v0 + 0.4, S(2, 2).v0 + 1.4))).toFixed(1) });

    // 3
    const on3 = eout(prog(t, L[3].v0, L[3].v0 + 0.5)) * (1 - prog(t, L[4].v0 - 0.3, L[4].v0 + 0.1));
    vis(frozen, on3);
    const free = eio(prog(t, S(3, 6).v0 + 0.5, S(3, 6).v0 + 2.0));
    M.lock(1 - free);
    M.light(0.5);
    locks.forEach(l => vis(l, 1 - free));
    // the conversation fills, then is wiped
    const s32 = S(3, 2);
    chatLines.forEach((e, i) => vis(e, eout(prog(t, s32.v0 + i * 0.5, s32.v0 + 0.3 + i * 0.5)) * (1 - prog(t, s32.v1 - 0.5, s32.v1))));
    // the brain's notepad feeds the cortex until the link is cut
    const s33 = S(3, 3);
    memLines.forEach((e, i) => vis(e, eout(prog(t, L[3].v0 + 0.5 + i * 0.4, L[3].v0 + 0.8 + i * 0.4))));
    drawOn(link, 1);
    drawOn(cut, eio(prog(t, s33.v0 + 0.3, s33.v0 + 0.8)));
    FB.light(() => 0.8);
    vis(stillLabel, eout(prog(t, s33.v0 + 1.5, s33.v0 + 2.0)));

    // 4
    const on4 = eout(prog(t, L[4].v0, L[4].v0 + 0.5));
    vis(open, on4);
    const s43 = S(4, 3);
    const all = eio(prog(t, s43.v0, s43.v0 + 1.5));
    vis(roomPanelGlow, 0.5 + 0.5 * all);
    OB.light(() => 0.6 + 0.4 * all);
    OM.light(0.3 + 0.3 * eout(prog(t, S(4, 1).v0, S(4, 1).v0 + 1)) * (1 - all) + 0.6 * all);
    vis(openQ, eout(prog(t, S(4, 1).v0, S(4, 1).v0 + 0.5)) * (1 - 0.6 * all));
  });
});
