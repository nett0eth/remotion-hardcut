import React from "react";
import { interpolate } from "remotion";
import { useSceneProgress } from "./hooks";

/**
 * Slow, continuous drift across the whole scene. Layer three of these at
 * different `speed` values to get depth for free.
 *
 * Speed is in pixels travelled over the entire sequence. Background layers get
 * small values, foreground layers larger ones — that ratio *is* the parallax.
 */
export const Parallax: React.FC<{
  children: React.ReactNode;
  /** Pixels travelled over the whole sequence. Negative reverses direction. */
  speed?: number;
  axis?: "x" | "y";
  /** Extra scale so edges never expose the frame while drifting. */
  overscan?: number;
  style?: React.CSSProperties;
}> = ({ children, speed = 60, axis = "x", overscan = 1.06, style }) => {
  const progress = useSceneProgress();
  const travel = interpolate(progress, [0, 1], [-speed / 2, speed / 2]);

  return (
    <div
      style={{
        translate: axis === "x" ? `${travel}px 0px` : `0px ${travel}px`,
        scale: overscan,
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * The Ken Burns move: a slow push in (or out) on a still image so it stops
 * looking like a still image.
 */
export const SlowZoom: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  style?: React.CSSProperties;
}> = ({ children, from = 1.0, to = 1.12, style }) => {
  const progress = useSceneProgress();

  return (
    <div
      style={{
        scale: interpolate(progress, [0, 1], [from, to]),
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
