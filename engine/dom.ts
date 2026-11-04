// Building SVG and DOM, and setting visibility. Build once in a scene's setup; change in onFrame.
import { clamp } from './math.ts';

const NS = 'http://www.w3.org/2000/svg';
type Attrs = Record<string, string | number>;

/** Create an SVG element, set its attributes, append it to parent. */
export function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, parent?: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
}

/** Set attributes on an element. */
export function set(e: Element, attrs: Attrs): void {
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
}

/** SVG text at x, y. */
export function text(parent: Element, x: number, y: number, s: string, attrs: Attrs = {}): SVGTextElement {
  const e = svg('text', { x, y, ...attrs }, parent);
  e.textContent = s;
  return e;
}

/** An HTML div with a class (and optional inner HTML), appended to parent. */
export function div(cls: string, parent: Element, html?: string): HTMLDivElement {
  const e = document.createElement('div');
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  parent.appendChild(e);
  return e;
}

/** SVG opacity; elements at zero opacity are not painted. */
export function vis(e: Element, o: number): void {
  e.setAttribute('opacity', clamp(o).toFixed(3));
  e.setAttribute('display', o <= 0.001 ? 'none' : 'inline');
}

/** HTML opacity; elements at zero opacity are not painted. */
export function hvis(e: HTMLElement, o: number): void {
  e.style.opacity = clamp(o).toFixed(3);
  e.style.display = o <= 0.001 ? 'none' : '';
}

/**
 * Give an element a name a reviewer can point at. The player shows the nearest named element under
 * the cursor. Names are kebab-case and unique within a scene: `globe`, `root-network`, `caption-1`.
 */
export function named<E extends Element>(name: string, e: E): E {
  e.setAttribute('data-name', name);
  return e;
}

/** A stroked path that can be drawn on with drawOn(). */
export function strokePath(parent: Element, d: string, attrs: Attrs = {}): SVGPathElement {
  return svg('path', {
    d,
    fill: 'none',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    pathLength: 1,
    'stroke-dasharray': '1 0',
    ...attrs,
  }, parent);
}

/** Draw a strokePath on: p = 0 hidden, 1 complete. */
export function drawOn(e: SVGPathElement, p: number): void {
  const u = clamp(p);
  e.setAttribute('stroke-dasharray', u >= 1 ? '1 0' : `${u.toFixed(4)} 1`);
  e.setAttribute('display', u <= 0.0005 ? 'none' : 'inline');
}
