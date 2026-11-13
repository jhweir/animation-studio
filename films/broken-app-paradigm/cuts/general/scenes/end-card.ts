// End card: "Next" and the follow-up film's promise, over the core with one piece dropping into it.
import { board, cue, defineScene, ein, named, onFrame, prog, text, tf, vis } from '../../../../../engine/index.ts';
import { at, caps, cartridge, color, core, font } from '../../../../../styles/coasys/index.ts';
import { arrive, pop } from '../kit.ts';

export default defineScene('end-card', ctx => {
  const { t0 } = ctx;
  const l0 = ctx.line(0);
  const card = named('end-card', at(ctx.art));
  caps(arrive(card, 960, 330, t0 + 0.1, { name: 'next' }), 0, 0, 'next', { size: 24, fill: color.mint });
  text(arrive(card, 960, 430, l0.v0, { name: 'promise', dur: 0.6 }), 0, 0, 'We open it up and show how it works', {
    fill: color.text, 'font-family': font.film, 'font-size': 56, 'font-weight': 300, 'text-anchor': 'middle',
  });
  core(pop(card, 960, 720, l0.v0 + 0.6, { name: 'core', dur: 0.6 }), 600, 110, 3);
  const piece = at(card, 960, 580, 1, 'piece');
  cartridge(piece, 150, 110, 'piece');
  const tDrop = l0.v1 - 0.2;
  onFrame(t => {
    const u = ein(prog(t, tDrop, tDrop + 0.5));
    const settle = Math.sin(Math.PI * prog(t, tDrop + 0.5, tDrop + 0.75)) * 6;
    piece.setAttribute('transform', tf(960, 500 + 80 * u + settle));
    vis(piece, prog(t, tDrop, tDrop + 0.2));
  });
  cue(tDrop + 0.5, 'final');

  board(l0.v1 + 1.2, 'End card: "Next", the follow-up\'s promise, and the core with one piece just dropped into its dock.');
});
