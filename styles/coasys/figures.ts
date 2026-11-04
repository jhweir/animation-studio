// People, bots and small glyphs. Local coordinates, centred on 0,0; position them with a parent
// group's transform.
import { svg } from '../../engine/index.ts';
import { color } from './tokens.ts';

/** Glyph paths, about 100 units across. */
export const glyph = {
  key: 'M -29 0 A 13 13 0 1 1 -3 0 A 13 13 0 1 1 -29 0 Z M -3 0 H 30 M 21 0 V 10 M 30 0 V 12',
  check: 'M -9 0 L -3 6 L 9 -7',
  laptop: 'M -48 -36 H 48 A 6 6 0 0 1 54 -30 V 18 H -54 V -30 A 6 6 0 0 1 -48 -36 Z M -68 24 H 68 L 61 34 H -61 Z',
  phone: 'M -20 -44 H 20 A 8 8 0 0 1 28 -36 V 36 A 8 8 0 0 1 20 44 H -20 A 8 8 0 0 1 -28 36 V -36 A 8 8 0 0 1 -20 -44 Z M -8 34 H 8',
  server: 'M -44 -40 H 44 V -16 H -44 Z M -44 -12 H 44 V 12 H -44 Z M -44 16 H 44 V 40 H -44 Z M -8 -28 H 30 M -8 0 H 30 M -8 28 H 30',
  bot: 'M -36 -20 H 36 A 12 12 0 0 1 48 -8 V 26 A 12 12 0 0 1 36 38 H -36 A 12 12 0 0 1 -48 26 V -8 A 12 12 0 0 1 -36 -20 Z M 0 -20 V -34 M -12 22 H 12',
  cloud: 'M -40 14 A 18 18 0 0 1 -30 -18 A 26 26 0 0 1 20 -22 A 20 20 0 0 1 40 14 Z',
} as const;

/** Abstract "platform" marks: deliberately no real brand logos. */
export const tileGlyphs = [
  'M -12 0 A 12 12 0 1 1 12 0 A 12 12 0 1 1 -12 0 Z',
  'M 0 -14 L 13 10 H -13 Z',
  'M 0 -14 L 14 0 L 0 14 L -14 0 Z',
  'M -13 -10 H 13 V 6 H -2 L -9 13 V 6 H -13 Z',
] as const;

/** Path data for a filled person (head and shoulders) of radius r. */
export function personPath(r: number): string {
  const s = r / 10;
  return (
    `M ${-10 * s} ${-8 * s} A ${10 * s} ${10 * s} 0 1 1 ${10 * s} ${-8 * s} A ${10 * s} ${10 * s} 0 1 1 ${-10 * s} ${-8 * s} Z ` +
    `M ${-17 * s} ${22 * s} C ${-17 * s} ${9 * s} ${-9 * s} ${4 * s} 0 ${4 * s} C ${9 * s} ${4 * s} ${17 * s} ${9 * s} ${17 * s} ${22 * s} Z`
  );
}

/** A filled person of radius r. */
export function person(parent: Element, r: number, fill: string = color.text): SVGPathElement {
  return svg('path', { d: personPath(r), fill }, parent);
}

/** A bot, at the same visual size as person(r). Bots are blue. */
export function bot(parent: Element, r: number, stroke: string = color.blue): SVGGElement {
  const g = svg('g', {}, parent);
  svg('path', { d: glyph.bot, fill: color.surface2, stroke, 'stroke-width': 5, transform: `scale(${(r / 22).toFixed(3)})` }, g);
  return g;
}

/** A hexagon path of radius r, point up. */
export function hexPath(r: number): string {
  let d = '';
  for (let k = 0; k < 6; k++) {
    const a = ((-90 + 60 * k) * Math.PI) / 180;
    d += `${k ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
  }
  return `${d}Z`;
}
