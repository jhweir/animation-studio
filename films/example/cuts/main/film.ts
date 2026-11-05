import { defineFilm } from '../../../../engine/index.ts';
import coasys from '../../../../styles/coasys/index.ts';
import cube from './scenes/cube.ts';
import end from './scenes/end.ts';
import group from './scenes/group.ts';
import intro from './scenes/intro.ts';

export default defineFilm({ style: coasys, scenes: [intro, group, cube, end] });
