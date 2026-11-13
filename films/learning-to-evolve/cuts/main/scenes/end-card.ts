// End card: "Next" and the companion film's title rise in; a sealed app pops up, an arrow draws, and a
// cartridge pops up beside it.
import { board, cue, defineScene, named, onFrame, prog, text, vis } from '../../../../../engine/index.ts';
import { color, font } from '../../../../../styles/coasys/index.ts';
import { appBox, arrive, at, caps, cartridge, drawArrow, hold, popIn } from '../kit.ts';

export default defineScene('end-card', ctx => {
  const { art, t0, t1 } = ctx;
  const card = named('end-card', at(art));
  const next = named('next', caps(card, 960, 330, 'next', { size: 24, fill: color.mint }));
  onFrame(t => vis(next, prog(t, t0 + 0.2, t0 + 0.7)));
  const title = named('next-title', at(card));
  text(title, 0, 0, "Why today's apps can't evolve, and what can", {
    fill: color.text, 'font-family': font.film, 'font-size': 56, 'font-weight': 300, 'text-anchor': 'middle',
  });
  arrive(title, 960, 430, t0 + 0.4, { dy: 24, dur: 0.6 });
  popIn(named('sealed-app', appBox(at(card), 220, 150, { seed: 61 })), 780, 650, t0 + 1.1);
  drawArrow(card, 920, 650, 1030, 650, t0 + 1.6, { stroke: color.mint, name: 'becomes-arrow' });
  popIn(named('cartridge', cartridge(at(card), 200, 150, 'parts')), 1150, 650, t0 + 2.1);
  cue(t0 + 2.1, 'final');
  hold(card, t0, t1 + 1);

  board(ctx.line(0).v1, 'End card: "Next", the companion film\'s title, and a sealed app with an arrow to a cartridge.');
});
