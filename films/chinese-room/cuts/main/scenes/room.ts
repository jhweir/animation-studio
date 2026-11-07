// Scene 2: the closed door in 1980; through the slot into the cutaway room; a card comes in, the man
// looks it up in the book, writes a reply and posts it out; the reader outside finds it perfect.
import { bump, defineScene, eio, eout, named, onFrame, prog, set, strokePath, drawOn, svg, vis } from '../../../../../engine/index.ts';
import { appear, aurora, camera, card, color, group, label, place, quad, room, sent, standing, words } from '../../../../../styles/chalk/index.ts';

export default defineScene('room', ctx => {
  const { art } = ctx;
  const l0 = ctx.line(0);
  const l1 = ctx.line(1);
  const l3 = ctx.line(3);
  const into = l1.v0 - 0.3;

  // Outside: the door in a wall, the reader, the date.
  const out = named('outside', group(art));
  svg('line', { x1: -2000, y1: 860, x2: 4000, y2: 860, stroke: color.dim, 'stroke-width': 3 }, out);
  svg('rect', { x: 760, y: 220, width: 400, height: 640, fill: color.faint, stroke: color.ink, 'stroke-width': 3 }, out);
  svg('circle', { cx: 1110, cy: 560, r: 12, fill: 'none', stroke: color.ink, 'stroke-width': 3 }, out);
  svg('rect', { x: 880, y: 470, width: 160, height: 22, fill: color.bg, stroke: color.ink, 'stroke-width': 3 }, out);
  standing(out, 560, 860, 380);
  const outCard = card(out, 120, 80, 31);
  const date = named('date', group(art));
  label(date, 1560, 200, '1980', { size: 40, anchor: 'end' });
  label(date, 1560, 240, 'John Searle', { anchor: 'end' });

  // Inside: the cutaway.
  const R = room(art, 620, 170, 1, { reader: true });
  const cardIn = card(art, 150, 96, 11);
  cardIn.g.setAttribute('data-name', 'card-in');
  const reply = card(art, 150, 96, 61);
  reply.g.setAttribute('data-name', 'reply');
  const puzzled = named('puzzled', words(art, 960, 450, '?', { size: 90 }));
  const tick = named('perfect', strokePath(art, 'M450 400 L480 430 L540 360', { stroke: aurora(440, 550), 'stroke-width': 6, filter: 'url(#glow)' }));
  const perfect = label(art, 470, 900, 'perfect', { color: color.ink, anchor: 'middle' });

  const s11 = sent(ctx, 1, 1);
  const s12 = sent(ctx, 1, 2);
  const s20 = sent(ctx, 2, 0);
  const s21 = sent(ctx, 2, 1);
  const s22 = sent(ctx, 2, 2);
  const hand = R.at.hand;
  const slot = R.at.slot;
  const desk: [number, number] = [R.at.desk[0] - 40, R.at.desk[1] + 30];
  const outDesk: [number, number] = [R.at.outDesk[0] + 20, R.at.outDesk[1] - 40];

  onFrame(t => {
    // Outside, then the camera dives into the slot.
    const dive = eio(prog(t, into, into + 1.1));
    camera(out, 960, 481, Math.pow(7, dive), 960, 481);
    vis(out, 1 - prog(t, into + 0.6, into + 1.1));
    vis(date, eout(prog(t, l0.v0 + 0.6, l0.v0 + 1.2)) * (1 - prog(t, into, into + 0.4)));
    const push = eio(prog(t, l0.v0 + 1.0, l0.v1 - 0.3));
    place(outCard.g, 960, 400 + 80 * push, 1, -6 * (1 - push));
    vis(outCard.g, 1 - prog(t, l0.v1 - 0.4, l0.v1 - 0.2));

    const inside = eout(prog(t, into + 0.7, into + 1.4));
    vis(R.g, inside);

    // A card in: hand → slot → desk.
    const u = eio(prog(t, s11.v0, s11.v1));
    const p = u < 0.5 ? quad(hand, [540, 520], slot, u * 2) : quad(slot, [800, 560], desk, (u - 0.5) * 2);
    place(cardIn.g, p[0], p[1], 0.9, -4 + 4 * u);
    vis(cardIn.g, inside * (t < s11.v0 ? 1 : 1) * (1 - prog(t, s22.v0, s22.v0 + 0.5)));

    vis(puzzled, eout(prog(t, s12.v0, s12.v0 + 0.4)) * (1 - prog(t, s20.v0, s20.v0 + 0.3)));

    // The book.
    const b = bump(prog(t, s20.v0, s20.v0 + 0.9));
    set(R.book, { transform: `translate(570 440) scale(${(1 + 0.25 * b).toFixed(3)})` });

    // The reply: written glyph by glyph on the desk, then posted out.
    const w = prog(t, s21.v0 + 0.4, s21.v1);
    reply.glyphs.forEach((gl, i) => vis(gl, eout(prog(w, i / reply.glyphs.length, (i + 0.7) / reply.glyphs.length))));
    const o = eio(prog(t, s22.v0 + 0.6, s22.v1));
    const q = o < 0.5 ? quad(outDesk, [800, 560], slot, o * 2) : quad(slot, [540, 520], [hand[0] - 10, hand[1] + 10], (o - 0.5) * 2);
    place(reply.g, q[0], q[1], 0.9, 6 * o);
    vis(reply.g, eout(prog(t, s21.v0, s21.v0 + 0.4)));

    drawOn(tick, eout(prog(t, l3.v0 + 1.2, l3.v0 + 1.8)));
    appear(perfect, t, l3.v0 + 1.6);
  });
});
