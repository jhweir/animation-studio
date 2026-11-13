// End card: "Next" and the follow-up film's promise, over the core with one piece docked.
import { board, defineScene, named, text } from '../../../../../engine/index.ts';
import { at, caps, cartridge, color, core, font, pose } from '../../../../../styles/coasys/index.ts';

export default defineScene('end-card', ctx => {
  const card = named('end-card', at(ctx.art));
  caps(card, 960, 330, 'next', { size: 24, fill: color.mint });
  text(card, 960, 430, 'We open it up and show how it works', {
    fill: color.text, 'font-family': font.film, 'font-size': 56, 'font-weight': 300, 'text-anchor': 'middle',
  });
  core(at(card, 960, 720), 600, 110, 3);
  cartridge(at(card, 960, 580), 150, 110, 'piece');
  pose(card, ctx.t0, ctx.t1 + 1);

  board(ctx.line(0).v1, 'End card: "Next", the follow-up\'s promise, and the core with one piece docked.');
});
