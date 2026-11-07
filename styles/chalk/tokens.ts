// Chalk tokens: near-black ground, chalk-white lines, and one colour for meaning: the aurora.
// The same values are CSS variables in style.css; keep the two in step.

export const color = {
  /** The ground. */
  bg: '#0f1217',
  /** Chalk: lines, figures, captions. */
  ink: '#e9e4d6',
  /** Secondary lines, labels, unlit network. */
  muted: '#5f6672',
  /** Panel frames, the horizon, unlit marks. */
  dim: '#3a404a',
  /** Faint fills: a closed door, a far wall. */
  faint: '#232831',
  /** Cards, bubbles, chip bodies: a raised surface. */
  card: '#1a1f27',
  /** A book's open pages. */
  paper: '#d8d2c4',
  /**
   * Meaning, as an aurora: green, blue, purple. Only a whole system glows, never a single part, and
   * the gradient spans the whole it lights, so a part shows one hue and only the whole the spectrum.
   */
  a1: '#5ef2b0',
  a2: '#4fc3f7',
  a3: '#b18cff',
} as const;

export type ColorName = keyof typeof color;

export const font = {
  film: "'Inter', system-ui, sans-serif",
} as const;

/** Type scale in px. Captions are light; labels are bold caps with wide tracking. */
export const type = {
  caption: { size: 50, weight: 300 },
  title: { size: 76, weight: 300 },
  label: { size: 24, weight: 700, tracking: '0.14em' },
} as const;
