import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate, useCurrentFrame } from "remotion";
import { DUR, EASE } from "../design/motion";

/**
 * Draws an SVG path as if a pen were tracing it. Powers line charts, underlines,
 * arrows, signatures and route reveals.
 *
 * Must be rendered inside an <svg>. `evolvePath` returns the dash props for a
 * given 0-1 progress; no manual getTotalLength() calls, no DOM measurement.
 */
export const DrawPath: React.FC<{
  d: string;
  delay?: number;
  duration?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: "butt" | "round" | "square";
  fill?: string;
  style?: React.CSSProperties;
}> = ({
  d,
  delay = 0,
  duration = DUR.slow,
  stroke = "currentColor",
  strokeWidth = 6,
  strokeLinecap = "round",
  fill = "none",
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, d);

  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin="round"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      style={style}
    />
  );
};
