// Scene 6: AI (a bot, purple drafts) builds the shell fast; the finished app is an island, asking a
// community to cross over with its people and history; then a sea of islands that never connect.
import { board, defineScene, named, svg } from '../../../../../engine/index.ts';
import { appBox, arrow, at, bot, caps, color, community, cross, mark, membranePath, mood, pose } from '../../../../../styles/coasys/index.ts';

export default defineScene('islands', ctx => {
  const { art, t1 } = ctx;
  const l1 = ctx.line(1), l2 = ctx.line(2);
  mood(ctx, 'problem');
  const island = (parent: Element, x: number, y: number, r: number, seed: number) =>
    svg('path', { d: membranePath(r, seed, 2.5), transform: `translate(${x} ${y}) scale(1 0.45)`, fill: color.surface2, stroke: color.line, 'stroke-width': 3 }, parent);

  // Pose 1: AI builds the shell quickly.
  const ai = named('ai-builds-shell', at(art));
  bot(at(ai, 520, 520), 60);
  arrow(ai, 620, 520, 820, 520, { stroke: color.blue });
  [0, 1, 2, 3].forEach(i => svg('rect', { x: 1060 - 120 - i * 40, y: 520 - 80 - i * 30, width: 240 + i * 80, height: 160 + i * 60, rx: 12, fill: 'none', stroke: color.purple, 'stroke-width': 2.5, opacity: 0.8 - i * 0.12 }, ai));
  mark(ai, 0, 1060, 520, 0.6, color.orange);
  caps(ai, 1060, 820, 'the shell, faster', { size: 22, fill: color.purple });
  pose(ai, ctx.t0, l1.v0 + 0.2);

  // Pose 2: the app is an island; the community would have to cross with everything it has.
  const cross1 = named('island-app', at(art));
  island(cross1, 1400, 560, 260, 3);
  appBox(at(cross1, 1400, 500), 220, 150, { parts: ['plain', 'idea', 'plain', 'plain'], seed: 70 });
  island(cross1, 420, 600, 300, 5);
  community(at(cross1, 420, 500), 120, 9, 71);
  caps(cross1, 420, 700, 'its people · its history', { size: 20 });
  arrow(cross1, 600, 420, 1230, 420, { stroke: color.steel, bend: -120, dash: '10 10' });
  caps(cross1, 920, 250, 'move everything here?', { size: 24, fill: color.text2 });
  pose(cross1, l1.v0, l2.v0 + 0.2);

  // Pose 3: islands everywhere. Good ideas, alone, competing; none connected.
  const sea = named('islands', at(art));
  [[300, 300], [800, 230], [1350, 320], [1650, 640], [1100, 700], [550, 760], [220, 620]].forEach(([x, y], i) => {
    island(sea, x, y + 50, 150, 10 + i);
    appBox(at(sea, x, y + 10), 140, 96, { parts: ['plain', 'idea', 'plain'], seed: 80 + i });
  });
  cross(sea, 560, 270, 0.8);
  cross(sea, 1080, 270, 0.8);
  cross(sea, 820, 740, 0.8);
  caps(sea, 960, 1000, 'competing for the same attention', { size: 24, fill: color.text2 });
  pose(sea, l2.v0, t1 + 1);

  board(ctx.line(0).v1, 'A bot (blue) drafts the shell in purple layers, fast, around the small idea.');
  board(l1.v1, 'The finished app sits alone on an island; across the water, a community with its people and history is asked to move everything over.');
  board(l2.v1, 'A sea of islands, each an app with a good idea inside, none connected (crosses between them).');
});
