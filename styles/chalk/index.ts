// The chalk style: near-black ground, chalk-white lines, meaning as an aurora glow. A film uses it
// with `style: chalk` and imports helpers from here.
import { div, type Style } from '../../engine/index.ts';
import { mountPaint } from './paint.ts';
import { placeholder } from './placeholder.ts';
import './style.css';

export * from './tokens.ts';
export * from './anim.ts';
export * from './paint.ts';
export * from './figures.ts';
export * from './systems.ts';
export { placeholder } from './placeholder.ts';

const chalk: Style = {
  name: 'chalk',
  placeholder,
  fonts: ['300 50px "Inter"', '700 24px "Inter"'],
  mount(stage) {
    div('vignette', stage.overlay);
    mountPaint(stage);
  },
};

export default chalk;
