/**
 * Motion tokens. Durations are in frames at 30fps — use `frames(seconds, fps)`
 * if the composition runs at another rate.
 */

import { Easing } from "remotion";

export const EASE = {
  /** Default entrance. Fast out of the gate, long glide into place. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Default exit. Hesitates, then leaves with gravity. */
  in: Easing.bezier(0.7, 0, 0.84, 0),
  /** Symmetric move between two resting states. */
  inOut: Easing.bezier(0.45, 0, 0.55, 1),
  /** Overshoots ~10% then settles. Emphasis only — never on body text. */
  pop: Easing.bezier(0.34, 1.56, 0.64, 1),
  /** Slow ambient drift for backgrounds and parallax. */
  drift: Easing.bezier(0.37, 0, 0.63, 1),
  linear: Easing.linear,
} as const;

/** Frame durations at 30fps. */
export const DUR = {
  /** Micro-feedback, barely perceptible. */
  instant: 6,
  /** Small elements: chips, icons, list rows. */
  fast: 12,
  /** The default for anything entering the frame. */
  base: 20,
  /** Large surfaces, full-frame moves. */
  slow: 32,
  /** Backdrop and ambient motion. */
  ambient: 90,
} as const;

/** Delay between siblings in a staggered group. Above 6 frames it reads as sloppy. */
export const STAGGER = {
  tight: 2,
  base: 3,
  loose: 5,
} as const;

/** Spring presets, for the rare case physics beats a curve. */
export const SPRING = {
  /** No visible bounce, just organic settle. */
  smooth: { damping: 200, mass: 0.6, stiffness: 100 },
  /** One soft bounce. */
  gentle: { damping: 14, mass: 0.7, stiffness: 120 },
  /** Snappy, springy, attention-grabbing. */
  snappy: { damping: 10, mass: 0.5, stiffness: 200 },
} as const;

export const frames = (seconds: number, fps: number) => Math.round(seconds * fps);

/**
 * Distance an element travels while entering. Tie travel to element size:
 * big things move less, or the frame feels like it is sliding apart.
 */
export const TRAVEL = {
  text: 40,
  card: 80,
  panel: 160,
} as const;
