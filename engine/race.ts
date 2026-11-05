// A race: series of values over time, ranked at any moment. Pure data and maths, no drawing; a
// style draws it (the Coasys leaderboard, for one). Between reported points a value is drawn as a
// straight line; ranks move smoothly because a row's position averages its rank over a short window
// just behind the moment, so swaps slide instead of jumping. Everything is a function of the time
// passed in, so a race scrubs and renders out of order like any other frame.
import { clamp } from './math.ts';

export interface RaceSeries {
  id: string;
  label: string;
  /** [time, value] pairs, in time order (time is whatever the race uses: years, say). */
  points: [number, number][];
  /** After the last point: `hold` keeps the last value (shown as stale), `end` leaves the race. Default `hold`. */
  after?: 'hold' | 'end';
  /** Free data carried through to the entry (an owner, a colour role, small print). */
  meta?: Record<string, string | boolean | number>;
}

export interface RaceEntry {
  series: RaceSeries;
  value: number;
  /** Smoothed position: 0 = top; may be fractional while rows swap; >= `rows` is off the board. */
  pos: number;
  /** 0..1: fades in after the first point and out after an `end`. */
  presence: number;
  /** The time of the last reported point when the value is held past it, else undefined. */
  stale?: number;
}

export interface RaceOptions {
  /** Rows shown; entries ranked below slide off the bottom. */
  rows: number;
  /** How long a swap takes, in race time. Default 0.4. */
  swap?: number;
  /** How long a new entry takes to fade in, and a leaving one to fade out. Default 0.4; 0 = at once. */
  fade?: number;
}

export interface Race {
  series: RaceSeries[];
  at(time: number): RaceEntry[];
  /** The largest value on the board at that time (for scaling bars). */
  max(time: number): number;
  /** Series that are ever ranked above `rank` (0-based exclusive) between t0 and t1. */
  everAbove(rank: number, t0: number, t1: number): RaceSeries[];
}

/** The series' value at time x, or null while it isn't in the race. */
export function seriesValue(s: RaceSeries, x: number): number | null {
  const p = s.points;
  if (!p.length || x < p[0][0]) return null;
  const last = p[p.length - 1];
  if (x >= last[0]) return (s.after ?? 'hold') === 'end' && x > last[0] ? null : last[1];
  let i = 0;
  while (p[i + 1][0] <= x) i++;
  const [x0, y0] = p[i];
  const [x1, y1] = p[i + 1];
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

export function race(series: RaceSeries[], o: RaceOptions): Race {
  const swap = o.swap ?? 0.4;
  const fade = o.fade ?? 0.4;
  const K = 9;

  // Raw rank of every series at x: present series by value, absent ones parked below the board.
  const ranks = (x: number): Map<string, number> => {
    const live = series
      .map(s => ({ s, v: seriesValue(s, x) }))
      .filter((e): e is { s: RaceSeries; v: number } => e.v !== null)
      .sort((a, b) => b.v - a.v || a.s.id.localeCompare(b.s.id));
    const m = new Map<string, number>();
    live.forEach((e, i) => m.set(e.s.id, Math.min(i, o.rows)));
    for (const s of series) if (!m.has(s.id)) m.set(s.id, o.rows);
    return m;
  };

  const at = (x: number): RaceEntry[] => {
    const acc = new Map<string, number>();
    for (let k = 0; k < K; k++) {
      const r = ranks(x - (swap * k) / (K - 1));
      for (const [id, v] of r) acc.set(id, (acc.get(id) ?? 0) + v / K);
    }
    return series.map(s => {
      const first = s.points[0]?.[0] ?? Infinity;
      const last = s.points[s.points.length - 1]?.[0] ?? -Infinity;
      const ends = (s.after ?? 'hold') === 'end';
      const ramp = (d: number) => (fade > 0 ? clamp(d / fade) : d >= 0 ? 1 : 0);
      const presence = ramp(x - first) * (ends ? 1 - ramp(x - last - 1e-9) : 1);
      const v = seriesValue(s, x) ?? (ends && x > last ? s.points[s.points.length - 1][1] : 0);
      return { series: s, value: v, pos: acc.get(s.id) ?? o.rows, presence, stale: !ends && x > last ? last : undefined };
    });
  };

  const max = (x: number) => {
    let m = 0;
    for (const s of series) m = Math.max(m, seriesValue(s, x) ?? 0);
    return m;
  };

  const everAbove = (rank: number, t0: number, t1: number) => {
    const ids = new Set<string>();
    for (let x = t0; x <= t1; x += 0.25) for (const [id, r] of ranks(x)) if (r < rank) ids.add(id);
    return series.filter(s => ids.has(s.id));
  };

  return { series, at, max, everAbove };
}
