// Lines 2–3: eight people pop in and a mint membrane draws round them; then a bot joins on the right.
import {
  defineScene, drawOn, eback, eout, line, named, onFrame, prog, set, strokePath, svg, tf, vis,
} from '../../../engine/index.ts';
import { bot, caption, color, person } from '../../../styles/coasys/index.ts';

export default defineScene('group', ({ t1, art, text }) => {
  const l2 = line(2);
  const l3 = line(3);
  const cx = 960;
  const cy = 440;

  const group = named('group', svg('g', {}, art));
  const membrane = named('membrane', strokePath(group, 'M 0 -230 A 230 230 0 1 1 -0.01 -230 Z', {
    stroke: color.mint, 'stroke-width': 4, transform: tf(cx, cy),
  }));
  const fill = svg('circle', { cx, cy, r: 230, fill: color.mint, opacity: 0 }, group);
  // Seven round a ring, one in the middle.
  const spots = [{ x: 0, y: 0 }, ...Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x: 140 * Math.cos(a), y: 140 * Math.sin(a) };
  })];
  const people = spots.map((p, i) => {
    const g = named(`person-${i + 1}`, svg('g', {}, group));
    person(g, 26, color.text);
    return { g, x: cx + p.x, y: cy + p.y, at: l2.v0 + 0.08 * i };
  });

  const botG = named('bot', svg('g', {}, art));
  bot(botG, 30);
  const botAt = l3.v0;

  caption(text, {
    name: 'caption',
    label: 'A group',
    t0: l2.v0,
    t1,
    top: 800,
    rows: [[{ h: 'People gather.&nbsp;', t: l2.v0 }, { h: '<em>A bot joins.</em>', t: l3.v0 }]],
  });

  onFrame(t => {
    for (const p of people) {
      const u = prog(t, p.at, p.at + 0.45);
      set(p.g, { transform: tf(p.x, p.y, u <= 0 ? 0.0001 : eback(u)) });
      vis(p.g, u > 0 ? 1 : 0);
    }
    drawOn(membrane, eout(prog(t, l2.v0 + 0.6, l2.v0 + 1.4)));
    set(fill, { opacity: (0.08 * prog(t, l2.v0 + 1.2, l2.v0 + 1.8)).toFixed(3) });
    const b = eout(prog(t, botAt, botAt + 0.6));
    set(botG, { transform: tf(1500 - 260 * b, cy - 40, 1) });
    vis(botG, b);
  });
});
