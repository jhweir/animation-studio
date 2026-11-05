// Films, scenes and styles, and the stage they draw on.
import { hvis, svg, vis } from './dom.ts';
import { onFrame } from './frame.ts';
import { line as lineTime, scene as sceneTime, type LineTime, type SceneTime, type Timeline } from './timeline.ts';

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
  /** The scene's narration lines, in order, with their times. */
  lineTimes: LineTime[];
  /** The scene's i-th line (from 0; -1 = the last). */
  line(i: number): LineTime;
  /** Part j (a sentence, from 0; -1 = the last) of the scene's i-th line. */
  part(i: number, j: number): { v0: number; v1: number };
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

/** Define a scene. Its id must match a scene id (a `##` heading) in the cut's script. */
export function defineScene(id: string, setup: (ctx: SceneContext) => void, options: SceneOptions = {}): SceneDef {
  return { id, setup, options };
}

export interface Style {
  name: string;
  /** Font specs (CSS font shorthand) that must load before frames are captured. */
  fonts: string[];
  /** Add the style's background, SVG defs and anything else every film in it shares. */
  mount(stage: Stage): void;
  /** Drawn for a scene the cut hasn't built yet: typically its title and its narration as captions. */
  placeholder?: (ctx: SceneContext) => void;
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

/**
 * Run each scene's setup, inside its own layer groups, shown only during its time window. A scene in
 * the script that the cut doesn't define yet gets the style's placeholder (its title and narration),
 * so a film plays end to end while it's being built.
 */
export function mountScenes(stage: Stage, tl: Timeline, scenes: SceneDef[], style: Style): void {
  const byId = new Map(scenes.map(s => [s.id, s]));
  for (const s of scenes) {
    if (!tl.scenes[s.id]) console.warn(`the cut defines scene "${s.id}", which isn't in its script`);
  }
  for (const id of Object.keys(tl.scenes)) {
    const def = byId.get(id) ?? (style.placeholder ? defineScene(id, style.placeholder) : undefined);
    if (!def) {
      console.warn(`no scene "${id}" in the cut, and the style has no placeholder`);
      continue;
    }
    const time = sceneTime(id);
    const art = svg('g', { 'data-scene': id }, stage.art);
    const mk = (parent: HTMLDivElement) => {
      const e = document.createElement('div');
      e.dataset.scene = id;
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
    const lines = time.lines.map(n => lineTime(n));
    def.setup({
      id,
      ...time,
      stage,
      art,
      three,
      ui,
      text,
      lineTimes: lines,
      line: i => {
        const l = lines[i < 0 ? lines.length + i : i];
        if (!l) throw new Error(`scene "${id}" has ${lines.length} line(s); line(${i}) doesn't exist`);
        return l;
      },
      part: (i, j) => {
        const l = lines[i < 0 ? lines.length + i : i];
        if (!l) throw new Error(`scene "${id}" has ${lines.length} line(s); part(${i}, ${j}) doesn't exist`);
        const k = l.parts?.length ?? 1;
        const p = l.parts?.[j < 0 ? k + j : j];
        if (p) return { v0: p[0], v1: p[1] };
        if (j === 0 || j === -1) return { v0: l.v0, v1: l.v1 };
        throw new Error(`scene "${id}" line ${i} has ${k} part(s); part(${i}, ${j}) doesn't exist`);
      },
    });
  }
}
