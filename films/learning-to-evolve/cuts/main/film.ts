// Learning to evolve, main cut. Every scene is boarded (key poses, rough motion) from ../kit.ts.
import { defineFilm } from '../../../../engine/index.ts';
import coasys from '../../../../styles/coasys/index.ts';
import alreadyEvolves from './scenes/already-evolves.ts';
import bottomRung from './scenes/bottom-rung.ts';
import byDeath from './scenes/by-death.ts';
import climbing from './scenes/climbing.ts';
import close from './scenes/close.ts';
import endCard from './scenes/end-card.ts';
import lifeSpedUp from './scenes/life-sped-up.ts';
import whoSelects from './scenes/who-selects.ts';
import whyItMatters from './scenes/why-it-matters.ts';

export default defineFilm({
  style: coasys,
  scenes: [alreadyEvolves, byDeath, lifeSpedUp, bottomRung, climbing, whoSelects, whyItMatters, close, endCard],
});
