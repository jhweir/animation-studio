// The Coasys leaderboard: draws an engine `race` as ranked rows of bars that grow, shrink and slide
// past each other. Any data: the film supplies the series and maps scene time to race time.
import { clamp, mix, named, onFrame, set, svg, type Race, type RaceEntry } from '../../engine/index.ts';
import { color } from './tokens.ts';

export interface LeaderboardOptions {
  /** Left edge and top of the first row, in px. */
  x: number;
  y: number;
  /** Rows on the board (match the race's `rows`). */
  rows: number;
  /** Row pitch and bar height, px. Default 46 and 30. */
  pitch?: number;
  barH?: number;
  /** Width of the name column; bars start after it. Default 240. */
  nameW?: number;
  /** Length of the longest bar, px. Default 560. */
  maxLen?: number;
  /** Race time at scene time t. */
  time: (t: number) => number;
  /** Opacity of the whole board at scene time t. Default 1. */
  visible?: (t: number) => number;
  /** Rows above this are the leaders: brighter names, filled bars. Default 0 (none). */
  leaders?: number;
  /** The period label (a year, say), drawn large and quiet. */
  period?: { x: number; y: number; anchor?: 'start' | 'end'; text: (time: number) => string; size?: number };
  /** Value text. Default `formatCount` (values in millions). */
  format?: (value: number) => string;
  name?: string;
}

/** Where a row was drawn this frame: read it from an onFrame registered after the board. */
export interface RowState {
  entry: RaceEntry;
  /** Vertical centre of the row, px. */
  y: number;
  /** End of the bar, px. */
  end: number;
  /** End of the value text, px (approximate). */
  after: number;
  /** Row opacity, including the board's. */
  opacity: number;
}

export interface Leaderboard {
  g: SVGGElement;
  /** Row states for this frame, by series id. */
  rows: Map<string, RowState>;
  /** Top edge of row position i, px (for drawing a line between rows). */
  rowTop(i: number): number;
}

/** Millions as `950M`, `1.27B`, `0.9M`. */
export function formatCount(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(m >= 10000 ? 1 : 2)}B`;
  if (m >= 10) return `${Math.round(m)}M`;
  return `${m.toFixed(1)}M`;
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function leaderboard(parent: Element, race: Race, o: LeaderboardOptions): Leaderboard {
  const pitch = o.pitch ?? 46;
  const barH = o.barH ?? 30;
  const nameW = o.nameW ?? 240;
  const maxLen = o.maxLen ?? 560;
  const leaders = o.leaders ?? 0;
  const format = o.format ?? formatCount;
  const barX = o.x + nameW;
  const g = named(o.name ?? 'leaderboard', svg('g', {}, parent));

  const period = o.period
    ? svg('text', {
      x: o.period.x, y: o.period.y, 'text-anchor': o.period.anchor ?? 'start', fill: color.text3, 'fill-opacity': 0.55,
      'font-size': o.period.size ?? 150, 'font-weight': 800, 'letter-spacing': '-0.02em',
    }, g)
    : null;
  if (period) named('period', period);

  const rowEls = race.series.map(s => {
    const alt = s.meta?.alt === true;
    const rg = named(`row-${slug(s.label)}`, svg('g', {}, g));
    const label = svg('text', { x: barX - 20, 'text-anchor': 'end', 'font-size': 23, 'font-weight': 700, 'letter-spacing': '0.08em' }, rg);
    label.textContent = s.label.toUpperCase();
    const bar = svg('rect', { x: barX, height: barH, rx: 4, 'stroke-width': alt ? 0 : 2 }, rg);
    const sub = typeof s.meta?.sub === 'string' ? svg('text', { x: barX + 14, fill: color.text2, 'font-size': 16, 'font-weight': 500 }, rg) : null;
    if (sub) sub.textContent = s.meta!.sub as string;
    const value = svg('text', { fill: alt ? color.mint : color.text2, 'font-size': 21, 'font-weight': 500 }, rg);
    const valueNum = svg('tspan', {}, value);
    const valueNote = svg('tspan', { fill: color.text3 }, value);
    return { s, alt, rg, label, bar, sub, value, valueNum, valueNote, subW: (sub?.textContent?.length ?? 0) * 8.2 + 28 };
  });

  const rows = new Map<string, RowState>();
  const rowTop = (i: number) => o.y + i * pitch;

  onFrame(t => {
    const time = o.time(t);
    const board = clamp(o.visible ? o.visible(t) : 1);
    if (period) {
      period.textContent = o.period!.text(time);
      set(period, { opacity: board.toFixed(3) });
    }
    const entries = race.at(time);
    const max = Math.max(1e-9, race.max(time));
    rows.clear();
    entries.forEach((e, i) => {
      const r = rowEls[i];
      const onBoard = clamp(o.rows - e.pos);
      const op = board * e.presence * onBoard;
      if (op <= 0.001) {
        set(r.rg, { opacity: 0 });
        return;
      }
      const top = rowTop(e.pos);
      const len = Math.max(4, (e.value / max) * maxLen);
      const lead = leaders > 0 ? clamp(leaders + 0.5 - e.pos) : 0;
      set(r.rg, { opacity: op.toFixed(3) });
      set(r.label, { y: (top + barH * 0.74).toFixed(1), fill: r.alt ? color.mint : mix(color.text2, color.text, lead) });
      set(r.bar, {
        y: top.toFixed(1), width: len.toFixed(1),
        fill: r.alt ? color.mint : mix(color.surface2, color.steelDark, lead),
        stroke: color.steel, 'stroke-opacity': (0.5 + 0.5 * lead).toFixed(3),
      });
      if (r.sub) set(r.sub, { y: (top + barH * 0.7).toFixed(1), opacity: len > r.subW ? 1 : 0 });
      r.valueNum.textContent = format(e.value);
      const note = typeof e.series.meta?.note === 'string' ? ` ${e.series.meta.note}` : '';
      r.valueNote.textContent = (e.stale !== undefined ? ` (${String(Math.round(e.stale))})` : '') + note;
      set(r.value, { x: (barX + len + 12).toFixed(1), y: (top + barH * 0.74).toFixed(1) });
      const textW = (r.valueNum.textContent.length + r.valueNote.textContent.length) * 11.5;
      rows.set(e.series.id, { entry: e, y: top + barH / 2, end: barX + len, after: barX + len + 12 + textW, opacity: op });
    });
  });

  return { g, rows, rowTop };
}
