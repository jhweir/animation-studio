// Films, scenes and styles, and the stage they draw on.
import { hvis, svg, vis } from './dom.ts';
import { onFrame } from './frame.ts';
import { scene as sceneTime, type SceneTime, type Timeline } from './timeline.ts';

/**
 * The stage, bottom to top: background (DOM), art (SVG), three (WebGL canvases, one per scene that
 * uses 3D), ui (DOM, app screens), text (DOM, captions and big words), overlay (DOM, fades and end
 * cards).
 */
export interface Stage {
  width: number;
  height: number;
  root: HTMLDivElement;
  background: HTMLDivElement;
  art: SVGSVGElement;
  defs: SVGDefsElement;
  three: HTMLDivElement;
  ui: HTMLDivElement;
  text: HTMLDivElement;
  overlay: HTMLDivElement;
}

/** What a scene's setup receives: its times and its own layer groups. */
export interface SceneContext extends SceneTime {
  id: string;
  stage: Stage;
  /** This scene's SVG group in the art layer. */
  art: SVGGElement;
  /** This scene's container in the 3D layer: pass the context to layer3d() from engine/three.ts. */
  three: HTMLDivElement;
  /** This scene's container in the ui layer. */
  ui: HTMLDivElement;
  /** This scene's container in the text layer. */
  text: HTMLDivElement;
}

export interface SceneOptions {
  /**
   * Seconds the scene stays mounted after its end, for an exit that overlaps the next scene.
   * Default 0: a hard cut, the norm (end each scene on the picture the next one starts from).
   */
  after?: number;
  /** Seconds the scene mounts before its start, for an entrance that overlaps the previous scene. */
  before?: number;
}

export interface SceneDef {
  id: string;
  setup: (ctx: SceneContext) => void;
  options: SceneOptions;
}

/** Define a scene. Its id must match a scene id in the film's script.json. */
export function defineScene(id: string, setup: (ctx: SceneContext) => void, options: SceneOptions = {}): SceneDef {
  return { id, setup, options };
}

export interface Style {
  name: string;
  /** Font specs (CSS font shorthand) that must load before frames are captured. */
  fonts: string[];
  /** Add the style's background, SVG defs and anything else every film in it shares. */
  mount(stage: Stage): void;
}

export interface FilmDef {
  style: Style;
  scenes: SceneDef[];
}

export function defineFilm(def: FilmDef): FilmDef {
  return def;
}

function layer(cls: string, parent: Element, w: number, h: number): HTMLDivElement {
  const e = document.createElement('div');
  e.className = `layer ${cls}`;
  Object.assign(e.style, { position: 'absolute', left: '0', top: '0', width: `${w}px`, height: `${h}px` });
  parent.appendChild(e);
  return e;
}

export function mountStage(host: HTMLElement, tl: Timeline): Stage {
  const { width: w, height: h } = tl;
  const root = document.createElement('div');
  root.id = 'stage';
  Object.assign(root.style, { position: 'absolute', left: '0', top: '0', width: `${w}px`, height: `${h}px`, overflow: 'hidden' });
  host.appendChild(root);
  const background = layer('background', root, w, h);
  const art = svg('svg', { class: 'layer art', viewBox: `0 0 ${w} ${h}`, width: w, height: h }, root);
  Object.assign(art.style, { position: 'absolute', left: '0', top: '0', overflow: 'visible' });
  const defs = svg('defs', {}, art);
  const three = layer('three', root, w, h);
  const ui = layer('ui', root, w, h);
  const text = layer('text', root, w, h);
  const overlay = layer('overlay', root, w, h);
  return { width: w, height: h, root, background, art, defs, three, ui, text, overlay };
}

/** Run each scene's setup, inside its own layer groups, shown only during its time window. */
export function mountScenes(stage: Stage, tl: Timeline, scenes: SceneDef[]): void {
  const defined = new Set(scenes.map(s => s.id));
  for (const id of Object.keys(tl.scenes)) {
    if (!defined.has(id)) console.warn(`script.json has scene "${id}" but the film defines no scene for it`);
  }
  for (const def of scenes) {
    if (!tl.scenes[def.id]) continue; // cut from the script: skip
    const time = sceneTime(def.id);
    const art = svg('g', { 'data-scene': def.id }, stage.art);
    const mk = (parent: HTMLDivElement) => {
      const e = document.createElement('div');
      e.dataset.scene = def.id;
      Object.assign(e.style, { position: 'absolute', inset: '0' });
      parent.appendChild(e);
      return e;
    };
    const three = mk(stage.three);
    const ui = mk(stage.ui);
    const text = mk(stage.text);
    const from = time.t0 - (def.options.before ?? 0);
    const to = time.t1 + (def.options.after ?? 0);
    const last = time.t1 >= tl.duration - 1e-3;
    onFrame(t => {
      const on = t >= from && (t < to || (last && t <= to));
      vis(art, on ? 1 : 0);
      hvis(three, on ? 1 : 0);
      hvis(ui, on ? 1 : 0);
      hvis(text, on ? 1 : 0);
    });
    def.setup({ id: def.id, ...time, stage, art, three, ui, text });
  }
}
