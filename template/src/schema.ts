import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { paletteIds } from "./design/theme";

/**
 * hardcut: one template, one grammar.
 *
 * Hard cuts, giant type, inverted flips, a camera that pushes into cropped
 * footage, and a terminal that types. Scenes run 1.2–3.5s except `terminal`,
 * which needs its command to finish. The format lives on pace.
 */

const base = {
  seconds: z.number().min(0.6).max(10),
  /**
   * Flips this scene to the inverse of the video's base scheme. Alternating
   * light and dark between cuts is the format's signature — it reads as a
   * shutter, and it costs nothing.
   */
  invert: z.boolean().default(false),
  /**
   * How this scene lands after the cut. Still no crossfades — these are
   * different flavours of *arrival*, resolved within 5 frames:
   *
   * - `settle` — scale 1.02 → 1. The default.
   * - `punch`  — harder scale settle. For beats that should hit.
   * - `left` / `right` — the frame slides in ~2.5% from that side.
   * - `rise`   — slides up. Good before terminals and grids.
   * - `flash`  — one ink flash over the first frames. A literal shutter;
   *              two or three per video, on the turns.
   *
   * Twelve identical settles is the same tell as twelve identical letter
   * reveals. Vary them.
   */
  cut: z.enum(["settle", "punch", "left", "right", "rise", "flash"]).optional(),
  vo: z.string().optional(),
};

const letterVariant = z.enum(["mask", "pop", "scramble", "blur", "stretch", "line"]);
const shotKind = z.enum(["pushIn", "pullOut", "panRight", "panLeft", "slam", "breathe"]);

export const sceneSchema = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("bigtype"),
    /** One to four words. It is set to bleed past the frame edge on purpose. */
    text: z.string(),
    /** Types the text out with a cursor instead of revealing it. */
    typed: z.boolean().default(false),
    /**
     * How the letters arrive. Vary it between cuts — six identical reveals in a
     * row is what makes a promo feel automated.
     */
    variant: letterVariant.default("mask"),
    /** How far past the frame the type may run. 1 = fits, 1.4 = bleeds hard. */
    bleed: z.number().min(0.6).max(2).default(1),
    align: z.enum(["left", "center", "right"]).default("center"),
  }),

  z.object({
    ...base,
    type: z.literal("sting"),
    /** Single glyph or short mark, centred on a full-bleed field. */
    mark: z.string(),
    caption: z.string().optional(),
  }),

  z.object({
    ...base,
    type: z.literal("grid"),
    heading: z.string().optional(),
    columns: z.number().min(2).max(4).default(4),
    /**
     * Frames per animation cycle. With a loop, each tile's label replays its
     * variant continuously — which turns a list of names into an actual
     * demonstration. Without it, everything fires in the first 20 frames and
     * then sits still for the rest of the scene.
     */
    loop: z.number().min(20).max(200).optional(),
    items: z
      .array(
        z.object({
          label: z.string(),
          caption: z.string().optional(),
          /** Letter animation for this tile's label. Mix them to show range. */
          variant: letterVariant.optional(),
          highlight: z.boolean().default(false),
        }),
      )
      .min(2)
      .max(8),
  }),

  z.object({
    ...base,
    type: z.literal("showreel"),
    /**
     * A grid where every tile renders a **live miniature of the real scene
     * type**, looping. Not a label in a box — the same components the full
     * video uses, scaled down and replayed.
     *
     * This is the honest way to show a format's range: if a tile looks wrong
     * here, the scene type is wrong, because it is literally the same code.
     */
    heading: z.string().optional(),
    columns: z.number().min(2).max(4).default(4),
    /** Frames per demo cycle. 60 gives each miniature two seconds to play. */
    loop: z.number().min(30).max(200).default(60),
    items: z
      .array(
        z.object({
          /** Which scene type this tile demonstrates. `showreel` is excluded — no recursion. */
          kind: z.enum([
            "bigtype",
            "sting",
            "grid",
            "shot",
            "terminal",
            "voice",
            "counter",
            "end",
          ]),
          label: z.string(),
          /** Offsets this tile's loop so the grid does not pulse in unison. */
          offset: z.number().min(0).max(200).default(0),
          highlight: z.boolean().default(false),
        }),
      )
      .min(2)
      .max(8),
  }),

  z.object({
    ...base,
    type: z.literal("shot"),
    /**
     * Full-bleed asset in public/.
     *
     * Only use footage or stills rendered at **twice** the crop you intend —
     * a 1920 still pushed to 1.6x is a 1200px source stretched over 1920 and it
     * shows. Screen recordings at 2560 or 3840 hold up; screenshots rarely do.
     */
    image: z.string().optional(),
    video: z.string().optional(),
    lottie: z.string().optional(),
    shot: shotKind.default("pushIn"),
    /** What the camera zooms toward. Screenshots rarely have their subject centred. */
    focus: z.enum(["center", "left", "right", "top", "bottom"]).default("center"),
    /** Burned-in label, bottom left. Four words maximum. */
    label: z.string().optional(),
  }),

  z.object({
    ...base,
    type: z.literal("terminal"),
    title: z.string().default("bash"),
    charsPerSecond: z.number().min(6).max(60).default(24),
    caption: z.string().optional(),
    lines: z
      .array(
        z.object({
          kind: z.enum(["command", "out", "ok", "dim", "wave", "spin"]),
          text: z.string(),
          /** Extra frames of dead air before this line. Where pacing is authored. */
          pause: z.number().min(0).max(120).optional(),
          /** `wave`: right-aligned metadata, e.g. "2.4s". */
          meta: z.string().optional(),
          /** `spin`: frames to spin before resolving to `done`. */
          hold: z.number().min(0).max(120).optional(),
          done: z.string().optional(),
        }),
      )
      .min(1)
      .max(10),
  }),

  z.object({
    ...base,
    type: z.literal("runtimes"),
    /**
     * Four panels, each animated by the library it names — GSAP's elastic ease,
     * Anime's centre stagger, a Motion spring, a real Lottie file.
     *
     * This scene cannot lie about the integrations: if an adapter's seek breaks,
     * the panel visibly freezes instead of a claim in big type quietly becoming
     * false. Give it at least 3.5s so every loop plays through once.
     */
    heading: z.string().optional(),
  }),

  z.object({
    ...base,
    type: z.literal("voice"),
    label: z.string(),
    caption: z.string().optional(),
    /** Shown under the wave, e.g. the emotion preset that produced it. */
    preset: z.string().optional(),
  }),

  z.object({
    ...base,
    type: z.literal("counter"),
    value: z.number(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    decimals: z.number().min(0).max(2).default(0),
    label: z.string(),
    mark: z.string().optional(),
  }),

  z.object({
    ...base,
    type: z.literal("end"),
    text: z.string(),
    cta: z.string().optional(),
    /**
     * Lottie file in public/, played under the CTA — a social handle badge, a
     * logo sting, an animated wordmark.
     *
     * `lottieFps` matters: a 60fps Lottie in a 30fps composition plays at half
     * speed unless the rate is corrected, and half speed on an end card reads
     * as a stall.
     */
    lottie: z.string().optional(),
    /** Author fps of the Lottie file. Defaults to 30 at the use site. */
    lottieFps: z.number().min(1).max(120).optional(),
    lottieWidth: z.number().min(100).max(1400).optional(),
    /**
     * Social badge + CTA row (follow / bell / save), rendered natively by
     * `SocialCta`. Both must be set together: `handle` is the text, `avatar`
     * an image in public/. Takes the slot below the CTA pill — do not combine
     * with `lottie`, one closing element is enough.
     */
    handle: z.string().optional(),
    avatar: z.string().optional(),
  }),
]);

export const hardcutSchema = z.object({
  palette: z.enum(paletteIds),
  accentOverride: zColor().optional(),
  /** Base scheme. Scenes with `invert` flip to the other one. */
  scheme: z.enum(["dark", "light"]).default("dark"),
  music: z.string().optional(),
  musicVolume: z.number().min(0).max(1).default(0.35),
  scenes: z.array(sceneSchema).min(1),
});

export type Scene = z.infer<typeof sceneSchema>;
export type HardcutProps = z.infer<typeof hardcutSchema>;
