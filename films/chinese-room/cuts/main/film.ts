// Where is the understanding? The Chinese Room and the systems reply.
import { defineFilm } from '../../../../engine/index.ts';
import chalk from '../../../../styles/chalk/index.ts';
import close from './scenes/close.ts';
import comeback from './scenes/comeback.ts';
import conclusion from './scenes/conclusion.ts';
import question from './scenes/question.ts';
import room from './scenes/room.ts';
import scale from './scenes/scale.ts';
import shows from './scenes/shows.ts';
import systems from './scenes/systems.ts';

export default defineFilm({ style: chalk, scenes: [question, room, conclusion, scale, systems, comeback, shows, close] });
