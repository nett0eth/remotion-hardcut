import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { EASE } from "../design/motion";

export type CameraMove = {
  /** Scale at the start and end of the shot. >1 crops in. */
  zoom?: [number, number];
  /** Pan in percent of the frame. Positive x moves the subject left. */
  x?: [number, number];
  y?: [number, number];
  /**
   * What the camera zooms toward, as a CSS transform-origin.
   *
   * Without this every shot crops to the middle of the asset, which is empty in
   * most real screenshots — interfaces put their content on the left and their
   * chrome on the edges. Getting the focal point wrong is the difference between
   * a shot of a product and a shot of its background.
   */
  origin?: string;
};

/**
 * A virtual camera over full-bleed content: push in, pull out, drift across.
 *
 * This is the move that separates a promo cut from a screen recording. Instead
 * of showing a whole interface at once — unreadable at any distance — the shot
 * is already cropped into the one control that matters, and it keeps moving so
 * the frame never reads as a static screenshot.
 *
 * Continuous, easing-free by default: a camera that eases in and out looks like
 * a UI transition. Real camera moves are near-linear across a short shot, which
 * is why `ease` defaults to linear here and nowhere else in the kit.
 *
 * ```tsx
 * <Camera move={{ zoom: [2.4, 2.0], x: [12, -4] }}>
 *   <Img src={staticFile("app.png")} />
 * </Camera>
 * ```
 */
export const Camera: React.FC<{
  children: React.ReactNode;
  move?: CameraMove;
  /** Frames the move spans. Defaults to the whole sequence via durationInFrames. */
  duration?: number;
  ease?: keyof typeof EASE;
  style?: React.CSSProperties;
}> = ({ children, move = {}, duration, ease = "linear", style }) => {
  const frame = useCurrentFrame();
  const span = duration ?? 90;

  const at = (range: [number, number] | undefined, fallback: number) =>
    range
      ? interpolate(frame, [0, span], range, {
          easing: EASE[ease],
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : fallback;

  const zoom = at(move.zoom, 1);
  const x = at(move.x, 0);
  const y = at(move.y, 0);

  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <AbsoluteFill
        style={{
          scale: zoom,
          translate: `${x}% ${y}%`,
          transformOrigin: move.origin ?? "center",
          willChange: "transform",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * Camera moves worth reaching for, so shots stay varied without being random.
 *
 * Zooms sit between 1.2 and 1.8. Past ~2x on a 1920 asset the shot shows a
 * 900px sliver — enough to lose the subject entirely unless `origin` is set
 * precisely. Start conservative and tighten only when you have seen the frame.
 */
export const SHOTS = {
  /** Slow push into a detail. The default promo shot. */
  pushIn: { zoom: [1.32, 1.58] } as CameraMove,
  /** Starts tight, reveals context. Good for a first shot. */
  pullOut: { zoom: [1.75, 1.24] } as CameraMove,
  /** Holds scale, drifts sideways across a wide UI. */
  panRight: { zoom: [1.5, 1.5], x: [7, -7] } as CameraMove,
  panLeft: { zoom: [1.5, 1.5], x: [-7, 7] } as CameraMove,
  /** Crash zoom for a punchline cut. Use once per video. */
  slam: { zoom: [1.1, 2.0] } as CameraMove,
  /** Barely-there breathing room on an otherwise static shot. */
  breathe: { zoom: [1.04, 1.1] } as CameraMove,
} as const;

/** Focal points, so a scene can say "zoom at the left third" without CSS. */
export const FOCUS = {
  center: "50% 50%",
  left: "22% 50%",
  right: "78% 50%",
  top: "50% 25%",
  bottom: "50% 75%",
} as const;

export type FocusPoint = keyof typeof FOCUS;
