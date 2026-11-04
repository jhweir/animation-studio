// The player: hosts stage.html in an iframe, scales it to fit, and drives its render(t) from a
// scrubber, a play loop and the keyboard. The time lives in the URL hash, so reloads (Vite reloads
// the page whenever a film file changes) come back to the same moment.
import type { StudioApi } from '../engine/boot.ts';

const $ = <E extends HTMLElement>(id: string) => document.getElementById(id) as E;
const filmSelect = $<HTMLSelectElement>('film');
const iframe = $<HTMLIFrameElement>('stage');
const frameBox = $('frame');
const viewport = $('viewport');
const outline = $('outline');
const track = $('track');
const head = $('head');
const playBtn = $<HTMLButtonElement>('play');
const speedSel = $<HTMLSelectElement>('speed');
const timeBtn = $<HTMLButtonElement>('time');
const whereEl = $('where');
const hoverEl = $('hover');
const toastEl = $('toast');

type Meta = StudioApi['meta'];

const params = new URLSearchParams(location.search);
const hash = new URLSearchParams(location.hash.slice(1));
let film = params.get('film') ?? '';
let t = Number(hash.get('t') ?? 0) || 0;
let playing = hash.get('play') === '1';
let meta: Meta | undefined;
let api: StudioApi | undefined;
let scale = 1;
let busy = false;
let queued: number | undefined;

const fmt = (x: number) => `${x.toFixed(2)}s`;

function saveHash(): void {
  const h = new URLSearchParams({ t: t.toFixed(2) });
  if (playing) h.set('play', '1');
  history.replaceState(null, '', `#${h}`);
}

function toast(s: string): void {
  toastEl.textContent = s;
  toastEl.hidden = false;
  clearTimeout((toast as { timer?: number }).timer);
  (toast as { timer?: number }).timer = window.setTimeout(() => (toastEl.hidden = true), 1600);
}

async function copy(s: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(s);
    toast(`copied: ${s}`);
  } catch {
    toast(s);
  }
}

/** Draw frame t, coalescing requests while a frame is still drawing. */
function draw(): void {
  if (!api) return;
  if (busy) {
    queued = t;
    return;
  }
  busy = true;
  void api.render(t).finally(() => {
    busy = false;
    if (queued !== undefined && queued !== t) draw();
    queued = undefined;
  });
}

function where(at: number): string {
  if (!meta) return '';
  const sc = Object.entries(meta.scenes).find(([, s]) => at >= s.t0 && at < s.t1);
  const ln = Object.entries(meta.lines).find(([, l]) => at >= l.v0 && at <= l.v1);
  return [sc ? `scene ${sc[0]}` : '', ln ? `line ${ln[0]}: “${ln[1].text}”` : ''].filter(Boolean).join(' · ');
}

function seek(to: number): void {
  if (!meta) return;
  t = Math.min(Math.max(0, to), meta.duration);
  head.style.left = `${(t / meta.duration) * 100}%`;
  timeBtn.textContent = fmt(t);
  whereEl.textContent = where(t);
  saveHash();
  draw();
}

function fit(): void {
  if (!meta) return;
  const r = viewport.getBoundingClientRect();
  scale = Math.min((r.width - 32) / meta.width, (r.height - 24) / meta.height);
  frameBox.style.width = `${meta.width * scale}px`;
  frameBox.style.height = `${meta.height * scale}px`;
  iframe.style.width = `${meta.width}px`;
  iframe.style.height = `${meta.height}px`;
  iframe.style.transform = `scale(${scale})`;
}

function buildTrack(m: Meta): void {
  const pct = (x: number) => `${(x / m.duration) * 100}%`;
  const scenesEl = $('scenes');
  const linesEl = $('lines');
  const cuesEl = $('cues');
  scenesEl.replaceChildren();
  linesEl.replaceChildren();
  cuesEl.replaceChildren();
  for (const [id, s] of Object.entries(m.scenes)) {
    const e = document.createElement('div');
    e.className = 'scene';
    e.textContent = id;
    e.title = `${id}: ${fmt(s.t0)} – ${fmt(s.t1)}`;
    Object.assign(e.style, { left: pct(s.t0), width: pct(s.t1 - s.t0) });
    scenesEl.appendChild(e);
  }
  for (const [n, l] of Object.entries(m.lines)) {
    const e = document.createElement('div');
    e.className = 'line';
    e.title = `line ${n}: ${l.text}`;
    Object.assign(e.style, { left: pct(l.v0), width: pct(l.v1 - l.v0) });
    linesEl.appendChild(e);
  }
  for (const c of m.cues) {
    const e = document.createElement('div');
    e.className = 'cue';
    e.title = `${c.kind} at ${fmt(c.t)}`;
    e.style.left = pct(c.t);
    cuesEl.appendChild(e);
  }
}

// Scrubbing
let dragging = false;
const seekFromPointer = (e: PointerEvent) => {
  if (!meta) return;
  const r = track.getBoundingClientRect();
  seek(((e.clientX - r.left) / r.width) * meta.duration);
};
track.addEventListener('pointerdown', e => {
  dragging = true;
  track.setPointerCapture(e.pointerId);
  setPlaying(false);
  seekFromPointer(e);
});
track.addEventListener('pointermove', e => dragging && seekFromPointer(e));
track.addEventListener('pointerup', () => (dragging = false));

// Voice: each line's clip, scheduled on the audio clock from the current time. Muted below 1×.
let audioCtx: AudioContext | undefined;
const buffers = new Map<string, Promise<AudioBuffer | undefined>>();
let sources: AudioBufferSourceNode[] = [];
let voiceOn = localStorage.getItem('player:voice') !== 'off';

function clip(url: string): Promise<AudioBuffer | undefined> {
  if (!buffers.has(url)) {
    buffers.set(url, (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return undefined;
        audioCtx ??= new AudioContext();
        return await audioCtx.decodeAudioData(await res.arrayBuffer());
      } catch {
        return undefined;
      }
    })());
  }
  return buffers.get(url)!;
}

function stopVoice(): void {
  for (const s of sources) s.stop();
  sources = [];
}

async function startVoice(from: number, ctxStart: number): Promise<void> {
  if (!meta || !audioCtx || !voiceOn || Number(speedSel.value) !== 1) return;
  for (const l of Object.values(meta.lines)) {
    if (!l.clip || l.v1 <= from) continue;
    const buf = await clip(l.clip);
    if (!buf || !playing) continue;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    const offset = Math.max(0, from - l.v0);
    src.start(ctxStart + Math.max(0, l.v0 - from), offset);
    sources.push(src);
  }
}

// Playback: the audio clock × speed drives the time; frames are skipped if a scene can't keep up.
let playFrom = 0;
let clockStart = 0;
let audioClock = false;
const clock = () => (audioClock && audioCtx ? audioCtx.currentTime : performance.now() / 1000);
function tick(): void {
  if (!playing || !meta) return;
  const next = playFrom + (clock() - clockStart) * Number(speedSel.value);
  if (next >= meta.duration) {
    seek(meta.duration);
    setPlaying(false);
    return;
  }
  seek(next);
  requestAnimationFrame(tick);
}
async function setPlaying(on: boolean): Promise<void> {
  playing = on && !!meta;
  playBtn.textContent = playing ? '❚❚' : '▶';
  saveHash();
  stopVoice();
  if (!playing) return;
  if (meta && t >= meta.duration - 0.01) seek(0);
  audioCtx ??= new AudioContext();
  // Resuming needs a user gesture; without one, play on the page clock, silently.
  await Promise.race([audioCtx.resume(), new Promise(r => setTimeout(r, 300))]);
  if (!playing) return;
  audioClock = audioCtx.state === 'running';
  playFrom = t;
  clockStart = clock() + 0.05; // a little headroom for the first clip to be scheduled
  if (audioClock) void startVoice(playFrom, clockStart);
  requestAnimationFrame(tick);
}
speedSel.addEventListener('change', () => playing && setPlaying(true));
const voiceBtn = $<HTMLButtonElement>('voiceToggle');
const showVoice = () => (voiceBtn.textContent = voiceOn ? 'voice on' : 'voice off');
showVoice();
voiceBtn.addEventListener('click', () => {
  voiceOn = !voiceOn;
  localStorage.setItem('player:voice', voiceOn ? 'on' : 'off');
  showVoice();
  if (playing) setPlaying(true);
});
playBtn.addEventListener('click', () => setPlaying(!playing));

function sceneStep(dir: 1 | -1): void {
  if (!meta) return;
  const starts = Object.values(meta.scenes).map(s => s.t0).sort((a, b) => a - b);
  const target = dir > 0 ? starts.find(s => s > t + 0.01) : [...starts].reverse().find(s => s < t - 0.01);
  if (target !== undefined) seek(target);
}

function onKey(e: KeyboardEvent): void {
  if (!meta || (e.target as HTMLElement).tagName === 'SELECT') return;
  const frame = 1 / meta.fps;
  const keys: Record<string, () => void> = {
    ' ': () => setPlaying(!playing),
    ArrowRight: () => seek(t + (e.shiftKey ? 1 : frame)),
    ArrowLeft: () => seek(t - (e.shiftKey ? 1 : frame)),
    Home: () => seek(0),
    End: () => seek(meta!.duration),
    ']': () => sceneStep(1),
    '[': () => sceneStep(-1),
  };
  const f = keys[e.key];
  if (f) {
    e.preventDefault();
    if (e.key !== ' ') setPlaying(false);
    f();
  }
}
document.addEventListener('keydown', onKey);
timeBtn.addEventListener('click', () => void copy(fmt(t)));

// Hover names: the nearest [data-name] under the cursor, with its scene, outlined.
function describe(target: Element | null): { label: string; el?: Element } {
  const namedEl = target?.closest('[data-name]');
  const sceneEl = target?.closest('[data-scene]');
  const sc = sceneEl?.getAttribute('data-scene');
  if (!namedEl) return { label: sc ? `scene ${sc}` : '' };
  const names: string[] = [];
  for (let e: Element | null = namedEl; e; e = e.parentElement?.closest('[data-name]') ?? null) {
    names.unshift(e.getAttribute('data-name')!);
  }
  return { label: `${sc ? `${sc} › ` : ''}${names.join(' › ')}`, el: namedEl };
}
/** The topmost visible element under a point that belongs to something named (layers stack full-stage boxes). */
function hit(doc: Document, x: number, y: number): Element | null {
  const shown = (e: Element) => {
    for (let a: Element | null = e; a && a !== doc.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.display === 'none' || Number(cs.opacity) < 0.02) return false;
    }
    return true;
  };
  const all = doc.elementsFromPoint(x, y);
  return all.find(e => e.closest('[data-name]') && shown(e)) ?? all.find(e => e.closest('[data-scene]') && shown(e)) ?? null;
}
function hookStage(): void {
  const doc = iframe.contentDocument;
  if (!doc) return;
  doc.addEventListener('keydown', onKey);
  doc.addEventListener('mousemove', e => {
    const { label, el } = describe(hit(doc, e.clientX, e.clientY));
    hoverEl.textContent = label;
    if (!el) {
      outline.hidden = true;
      return;
    }
    const r = el.getBoundingClientRect();
    Object.assign(outline.style, {
      left: `${r.left * scale - 3}px`,
      top: `${r.top * scale - 3}px`,
      width: `${r.width * scale + 6}px`,
      height: `${r.height * scale + 6}px`,
    });
    outline.hidden = false;
  });
  doc.addEventListener('mouseleave', () => {
    hoverEl.textContent = '';
    outline.hidden = true;
  });
  doc.addEventListener('click', e => {
    const { label } = describe(hit(doc, e.clientX, e.clientY));
    void copy(label ? `at ${fmt(t)}, ${label}` : `at ${fmt(t)}`);
  });
}

// Loading
window.addEventListener('message', async e => {
  if (e.source !== iframe.contentWindow || (e.data as { type?: string })?.type !== 'studio:ready') return;
  api = iframe.contentWindow?.studio;
  if (!api) return;
  await api.ready;
  meta = api.meta;
  $('title').textContent = meta.title;
  $('voice').textContent = {
    silent: 'timing: estimated (no voice yet)',
    clips: 'timing: voice clips',
    partial: 'timing: some lines voiced, the rest estimated',
  }[meta.voice];
  for (const l of Object.values(meta.lines)) if (l.clip) void clip(l.clip);
  buildTrack(meta);
  fit();
  hookStage();
  seek(t);
  if (playing) setPlaying(true);
});
window.addEventListener('resize', fit);

async function init(): Promise<void> {
  const films = (await (await fetch('/__studio/films')).json()) as string[];
  if (!film || !films.includes(film)) film = films[0] ?? '';
  for (const f of films) filmSelect.add(new Option(f, f, f === film, f === film));
  filmSelect.addEventListener('change', () => {
    location.href = `/player.html?film=${filmSelect.value}`;
  });
  if (!film) {
    whereEl.textContent = 'No films yet: add films/<name>/script.json';
    return;
  }
  document.title = `${film} · Player`;
  iframe.src = `/stage.html?film=${film}`;
}

void init();
