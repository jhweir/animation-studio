// The Coasys style. A film uses it with `style: coasys` and imports helpers from here.
import { svg, type Style } from '../../engine/index.ts';
import { mountBackground } from './background.ts';
import { mountType } from './type.ts';
import './style.css';

export * from './tokens.ts';
export * from './background.ts';
export * from './type.ts';
export * from './figures.ts';

const coasys: Style = {
  name: 'coasys',
  fonts: ['300 70px "Bricolage Grotesque"', '700 24px "Bricolage Grotesque"', '800 120px "Bricolage Grotesque"', '400 16px "DM Sans"'],
  mount(stage) {
    mountBackground(stage);
    mountType(stage);
    // Glow filters: filter="url(#glow)" (soft) and url(#glowBig).
    const glow = (id: string, blur: number, double: boolean) => {
      const f = svg('filter', { id, filterUnits: 'userSpaceOnUse', x: -3000, y: -3000, width: 8000, height: 8000 }, stage.defs);
      svg('feGaussianBlur', { stdDeviation: blur, result: 'b' }, f);
      const m = svg('feMerge', {}, f);
      svg('feMergeNode', { in: 'b' }, m);
      if (double) svg('feMergeNode', { in: 'b' }, m);
      svg('feMergeNode', { in: 'SourceGraphic' }, m);
    };
    glow('glow', 6, false);
    glow('glowBig', 16, true);
  },
};

export default coasys;
