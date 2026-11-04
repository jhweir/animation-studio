// Coasys tokens: the palette and type scale from the Coasys app and site, as used in Data's films.
// The same values are CSS variables in style.css; keep the two in step.

export const color = {
  page: '#131533',
  bgDeep: '#0d0f26',
  surface: '#1b1e45',
  surface2: '#22265a',
  line: '#2f3468',
  purpleGrey: '#373b63',
  darkPurple: '#5c4aa8',
  /** Ours: groups, living membranes, highlighted words. */
  mint: '#88f3b4',
  mintLight: '#c1ffdf',
  /** Text on a mint highlight. */
  ink: '#0f1230',
  /** Value only. */
  orange: '#ffba94',
  /** Today's platforms, sealed boxes. */
  steel: '#a9b4c8',
  steelDark: '#4a5470',
  /** Bots and agents. */
  blue: '#91e3fd',
  /** Proposed or drafted by AI. */
  purple: '#e1b7ff',
  purpleLight: '#b8c3ff',
  text: '#ffffff',
  text2: '#c7c9dc',
  text3: '#8d90b3',
  /** Red marks, padlocks. Sparingly. */
  danger: '#e73d58',
  /** Line-drawn people. */
  inkFigure: '#e8f0ff',
} as const;

export type ColorName = keyof typeof color;

/** The three graphic languages, one per part of a story. */
export const moods = {
  /** The problem: near-black, steel, red sparingly; hard cuts, slammed words. */
  problem: { bg: '#05060c', ink: '#a9b4c8', accent: '#e73d58' },
  /** Diagrams: blueprint navy with a grid; slow lines drawn on, caps labels. */
  blueprint: { bg: '#0a1530', ink: '#dbe8ff', lines: '#9fc3ff', accent: '#ffba94' },
  /** Ours: the Coasys page with drifting orbs; eased, cards sliding in. */
  ours: { bg: '#131533', ink: '#ffffff', accent: '#88f3b4' },
} as const;

export const font = {
  film: "'Bricolage Grotesque', system-ui, sans-serif",
  app: "'DM Sans', system-ui, sans-serif",
} as const;

/** Type scale in px. Labels are bold caps with wide tracking; statements are light or very heavy. */
export const type = {
  captionLabel: { size: 22, weight: 700, tracking: '0.1em' },
  caption: { size: 64, small: 52, weight: 300, tracking: '-0.01em' },
  beatLabel: { size: 24, weight: 700, tracking: '0.14em' },
  beat: { size: 118, weight: 800, tracking: '-0.025em' },
  stageLabel: { size: 26, weight: 700, tracking: '0.1em' },
} as const;
