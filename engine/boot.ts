// Entry point of stage.html?film=<name>: loads the film's timeline and module, mounts the stage,
// and exposes window.studio for the player and the renderer.
import { allCues, renderFrame, type Cue } from './frame.ts';
import { mountScenes, mountStage, type FilmDef } from './film.ts';
import { setTimeline, type Timeline } from './timeline.ts';

export interface StudioApi {
  meta: Timeline & { cues: Cue[] };
  /** Draw the frame at t seconds. Resolves when the frame is ready to capture. */
  render(t: number): Promise<void>;
  /** Resolves once fonts are loaded and frame 0 is drawn. */
  ready: Promise<void>;
}

declare global {
  interface Window {
    studio?: StudioApi;
  }
}

function fail(message: string): never {
  const box = document.createElement('pre');
  box.textContent = message;
  Object.assign(box.style, { color: '#ff8080', font: '20px monospace', padding: '40px', whiteSpace: 'pre-wrap' });
  document.body.appendChild(box);
  throw new Error(message);
}

async function boot(): Promise<void> {
  const film = new URLSearchParams(location.search).get('film');
  if (!film || !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(film)) fail('stage.html needs ?film=<film>/<cut>');
  const [filmName, cut] = film.split('/');

  const res = await fetch(`/__studio/timeline/${film}`);
  if (!res.ok) fail(`timeline for "${film}": ${await res.text()}`);
  const tl = (await res.json()) as Timeline;
  setTimeline(tl);

  const mod = (await import(/* @vite-ignore */ `/films/${filmName}/cuts/${cut}/film.ts`)) as { default?: FilmDef };
  const def = mod.default;
  if (!def) fail(`films/${filmName}/cuts/${cut}/film.ts has no default export (use defineFilm)`);
  if (def.style.name !== tl.style) {
    console.warn(`cut.json says style "${tl.style}" but film.ts uses "${def.style.name}"`);
  }

  document.documentElement.style.background = '#000';
  Object.assign(document.body.style, { margin: '0', width: `${tl.width}px`, height: `${tl.height}px`, overflow: 'hidden' });
  const stage = mountStage(document.body, tl);
  def.style.mount(stage);
  mountScenes(stage, tl, def.scenes, def.style);

  const ready = (async () => {
    await Promise.all(def.style.fonts.map(f => document.fonts.load(f)));
    await document.fonts.ready;
    await renderFrame(0);
  })();

  window.studio = {
    meta: { ...tl, cues: allCues() },
    async render(t: number) {
      await renderFrame(t);
    },
    ready,
  };
  window.parent?.postMessage({ type: 'studio:ready' }, '*');
}

void boot();
