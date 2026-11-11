// End card: "Next" with a sealed app beside a cartridge, pointing to the companion film.
import { board, defineScene, named, text } from '../../../../../engine/index.ts';
import { color, font } from '../../../../../styles/coasys/index.ts';
import { appBox, arrow, at, caps, cartridge, pose } from '../kit.ts';

export default defineScene('end-card', ctx => {
  const { art, t1 } = ctx;
  const card = named('end-card', at(art));
  caps(card, 960, 330, 'next', { size: 24, fill: color.mint });
  text(card, 960, 430, "Why today's apps can't evolve, and what can", {
    fill: color.text, 'font-family': font.film, 'font-size': 56, 'font-weight': 300, 'text-anchor': 'middle',
  });
  appBox(at(card, 780, 650), 220, 150, { seed: 61 });
  arrow(card, 920, 650, 1030, 650, { stroke: color.mint });
  cartridge(at(card, 1150, 650), 200, 150, 'parts');
  pose(card, ctx.t0, t1 + 1);

  board(ctx.line(0).v1, 'End card: "Next", the companion film\'s title, and a sealed app turning into a cartridge.');
});
