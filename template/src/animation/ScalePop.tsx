import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DUR, EASE } from "../design/motion";

/**
 * Scales in with a small overshoot. For badges, icons, KPI tiles, logo stings —
 * anything that should feel like it *landed*. Do not use on paragraphs.
 */
export const ScalePop: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  /** Starting scale. Below 0.8 the overshoot starts to look cartoonish. */
  fromScale?: number;
  origin?: React.CSSProperties["transformOrigin"];
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  duration = DUR.base,
  fromScale = 0.88,
  origin = "center",
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: EASE.pop,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [delay, delay + duration * 0.5], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        scale: interpolate(progress, [0, 1], [fromScale, 1]),
        transformOrigin: origin,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
