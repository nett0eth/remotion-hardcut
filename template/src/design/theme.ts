/**
 * Design tokens. Everything visual in this kit reads from here — no literal colors,
 * font sizes or paddings inside scene code. Rebranding a video is editing this file.
 */

export type Palette = {
  id: string;
  /** Page background, darkest or lightest surface. */
  bg: string;
  /** Slightly raised background for banding and depth. */
  bgAlt: string;
  /** Cards, tiles, chips. */
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  /** Primary accent — the one color the eye should chase. */
  accent: string;
  /** Secondary accent. Use for gradients and second data series only. */
  accentAlt: string;
  positive: string;
  negative: string;
  /** Three stops for mesh/gradient backdrops. */
  mesh: [string, string, string];
  /**
   * The only gradient allowed on foreground surfaces. Hand-picked per palette —
   * `accent → accentAlt` is a clash in half of them (blue into orange), so the
   * gradient is its own token rather than something derived.
   */
  accentGradient: [string, string];
  /** Data series order for charts. */
  series: string[];
};

/**
 * Palette constraint: **no violet or magenta**. Nothing in the 250°–340° hue
 * band, in any slot — accent, mesh, gradient or series.
 *
 * This is not a taste preference to be relitigated per video. Purple-into-blue
 * gradients and magenta blob backdrops are the default look of every AI-generated
 * video on the internet; using them makes the output read as templated no matter
 * how good the motion is. Blues, teals, greens, ambers and reds only.
 */
export const palettes = {
  midnight: {
    id: "midnight",
    bg: "#07090F",
    bgAlt: "#0D1018",
    surface: "#141924",
    border: "#232A38",
    text: "#F5F7FA",
    textMuted: "#8B95A8",
    accent: "#5B8CFF",
    accentAlt: "#38BDF8",
    positive: "#3DDC97",
    negative: "#FF6B6B",
    mesh: ["#1B2E6B", "#0E4459", "#07090F"],
    accentGradient: ["#5B8CFF", "#38BDF8"],
    series: ["#5B8CFF", "#38BDF8", "#3DDC97", "#FFB454", "#FF6B6B"],
  },
  paper: {
    id: "paper",
    bg: "#F7F5F1",
    bgAlt: "#EFEBE4",
    surface: "#FFFFFF",
    border: "#DED8CE",
    text: "#14120F",
    textMuted: "#6B655C",
    accent: "#1F4FD8",
    accentAlt: "#D9531E",
    positive: "#1F7A4C",
    negative: "#C0392B",
    mesh: ["#E8E2D8", "#F7F5F1", "#DCE4F5"],
    accentGradient: ["#1F4FD8", "#5B8CFF"],
    series: ["#1F4FD8", "#D9531E", "#1F7A4C", "#0E7490", "#B58A00"],
  },
  neon: {
    id: "neon",
    bg: "#05060A",
    bgAlt: "#0A0D14",
    surface: "#101520",
    border: "#1D2735",
    text: "#EAFBFF",
    textMuted: "#7C93A8",
    accent: "#00E5FF",
    accentAlt: "#00FFA3",
    positive: "#00FFA3",
    negative: "#FF4757",
    mesh: ["#00405C", "#00563D", "#05060A"],
    accentGradient: ["#00E5FF", "#00FFA3"],
    series: ["#00E5FF", "#00FFA3", "#FFD166", "#4D96FF", "#FF4757"],
  },
  warm: {
    id: "warm",
    bg: "#120D0B",
    bgAlt: "#1A1210",
    surface: "#241A16",
    border: "#3A2A23",
    text: "#FFF6EE",
    textMuted: "#B09A8C",
    accent: "#FF8A3D",
    accentAlt: "#FFCF5C",
    positive: "#7DD87D",
    negative: "#FF5C5C",
    mesh: ["#5C2A0F", "#7A4A12", "#120D0B"],
    accentGradient: ["#FF8A3D", "#FFCF5C"],
    series: ["#FF8A3D", "#FFCF5C", "#7DD87D", "#6BB8FF", "#FF5C5C"],
  },
} satisfies Record<string, Palette>;

export type PaletteId = keyof typeof palettes;
export const paletteIds = Object.keys(palettes) as [PaletteId, ...PaletteId[]];

export const getPalette = (id: PaletteId): Palette => palettes[id];

/**
 * Applies a brand accent over a palette. The gradient's first stop follows the
 * override so a branded CTA does not keep the stock colour on one edge.
 */
export const withAccent = (palette: Palette, accent?: string): Palette =>
  accent
    ? { ...palette, accent, accentGradient: [accent, palette.accentGradient[1]] }
    : palette;

/** The one approved foreground gradient, as a CSS value. */
export const accentGradientCss = (palette: Palette, angle = 90) =>
  `linear-gradient(${angle}deg, ${palette.accentGradient[0]}, ${palette.accentGradient[1]})`;

/**
 * Type scale in px, tuned per orientation. Portrait needs bigger relative type
 * because the frame is narrower and the video is watched on a phone at arm's length.
 *
 * Landscape body sits at 42px, not the ~16-20px a web layout would use at this
 * width. Video is watched further from the screen, often at half size in a feed,
 * and there is no scrolling back to reread — anything under ~38px at 1080p reads
 * as a slide deck screenshot rather than a video.
 */
export const typeScale = {
  landscape: {
    display: 150,
    h1: 96,
    h2: 72,
    lead: 52,
    body: 42,
    label: 28,
    caption: 64,
    number: 200,
  },
  portrait: {
    display: 128,
    h1: 96,
    h2: 70,
    lead: 54,
    body: 42,
    label: 30,
    caption: 82,
    number: 190,
  },
} as const;

export type Orientation = keyof typeof typeScale;

/** 8pt grid, scaled up for video. */
export const space = {
  xs: 8,
  sm: 16,
  md: 28,
  lg: 48,
  xl: 80,
  xxl: 128,
} as const;

export const radius = {
  sm: 10,
  md: 20,
  lg: 32,
  pill: 999,
} as const;

/** Margins nothing important may cross. Portrait values dodge platform UI. */
export const safeArea = {
  landscape: { top: 90, right: 140, bottom: 90, left: 140 },
  portrait: { top: 240, right: 90, bottom: 330, left: 90 },
} as const;

export const shadow = {
  card: "0 24px 60px rgba(0,0,0,0.35)",
  lift: "0 40px 120px rgba(0,0,0,0.5)",
} as const;

/** Tracking gets tighter as type gets bigger. Never track large display type loose. */
export const tracking = {
  display: "-0.035em",
  heading: "-0.02em",
  body: "-0.005em",
  label: "0.12em",
} as const;
