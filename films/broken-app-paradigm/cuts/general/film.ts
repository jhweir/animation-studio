// The broken app paradigm, general cut: the argument in general terms, no worked example. Every scene
// is boarded (key poses, rough motion) from the Coasys sketch pieces.
import { defineFilm } from '../../../../engine/index.ts';
import coasys from '../../../../styles/coasys/index.ts';
import builders from './scenes/builders.ts';
import diversity from './scenes/diversity.ts';
import endCard from './scenes/end-card.ts';
import fixed from './scenes/fixed.ts';
import impossible from './scenes/impossible.ts';
import islands from './scenes/islands.ts';
import otherFields from './scenes/other-fields.ts';
import rightSize from './scenes/right-size.ts';
import shape from './scenes/shape.ts';
import whyNot from './scenes/why-not.ts';
import wrongSize from './scenes/wrong-size.ts';

export default defineFilm({
  style: coasys,
  scenes: [shape, diversity, fixed, impossible, builders, islands, wrongSize, otherFields, whyNot, rightSize, endCard],
});
