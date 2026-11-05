// The broken app paradigm, short cut. Scenes not listed here play as placeholders.
import { defineFilm } from '../../../../engine/index.ts';
import coasys from '../../../../styles/coasys/index.ts';
import theirGround from './scenes/their-ground.ts';

export default defineFilm({ style: coasys, scenes: [theirGround] });
