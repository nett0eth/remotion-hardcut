import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DUR, EASE, TRAVEL } from "../design/motion";

export type Direction = "up" | "down" | "left" | "right" | "none";

const offsetFor = (direction: Direction, distance: number, progress: number) => {
  const remaining = 1 - progress;
  switch (direction) {
    case "up":
      return `0px ${distance * remaining}px`;
    case "down":
      return `0px ${-distance * remaining}px`;
    case "left":
      return `${distance * remaining}px 0px`;
    case "right":
      return `${-distance * remaining}px 0px`;
    default:
      return "0px 0px";
  }
};

/**
 * The workhorse entrance. Fades in and optionally travels from a direction.
 *
 * `from="up"` means the element arrives *moving upward* — it starts below its
 * resting place. Blur adds a subtle focus-pull; keep it under 12 or text turns to mush.
 */
export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  from?: Direction;
  distance?: number;
  blur?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  delay = 0,
  duration = DUR.base,
  from = "up",
  distance = TRAVEL.text,
  blur = 0,
  style,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: progress,
        translate: offsetFor(from, distance, progress),
        filter: blur > 0 ? `blur(${blur * (1 - progress)}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
