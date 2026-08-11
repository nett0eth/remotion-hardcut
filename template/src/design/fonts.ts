/**
 * Fonts are loaded at module scope so they are ready before the first frame paints.
 * @remotion/google-fonts handles the delayRender/continueRender dance internally.
 *
 * Swapping the brand typeface = changing these two imports. Nothing else references
 * a font family name directly.
 */

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// Only the weights and subsets actually used. Loading a full family costs ~100
// network requests per render worker and buys nothing.
const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

const bricolage = loadBricolage("normal", {
  weights: ["700", "800"],
  subsets: ["latin", "latin-ext"],
});

const mono = loadMono("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});

export const fonts = {
  /** Headlines and display type. Has personality; use it big. */
  display: bricolage.fontFamily,
  /** Body, UI, captions. Neutral on purpose. */
  body: inter.fontFamily,
  /** Numbers in charts and KPI tiles — tabular figures keep digits from jittering. */
  mono: mono.fontFamily,
} as const;

/** Apply to any animated number so its width does not twitch between frames. */
export const tabularNumbers = {
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum"',
} as const;
