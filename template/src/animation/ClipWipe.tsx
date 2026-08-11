import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DUR, EASE } from "../design/motion";

export type WipeDirection = "left" | "right" | "up" | "down" | "center";

const insetFor = (direction: WipeDirection, hidden: number) => {
  const pct = `${hidden * 100}%`;
  switch (direction) {
    case "left":
      return `0 ${pct} 0 0`;
    case "right":
      return `0 0 0 ${pct}`;
    case "up":
      return `0 0 ${pct} 0`;
    case "down":
      return `${pct} 0 0 0`;
    case "center":
      return `0 ${hidden * 50}% 0 ${hidden * 50}%`;
  }
};

/**
 * Reveals its children behind a moving edge using clip-path. No opacity change —
 * the content is either there or it isn't, which reads crisper than a fade for
 * images, cards and bars.
 *
 * `left` means the edge travels to the left, i.e. content appears from the left.
 */
export const ClipWipe: React.FC<{
  children: React.ReactNode;
  direction?: WipeDirection;
  delay?: number;
  duration?: number;
  radius?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  direction = "left",
  delay = 0,
  duration = DUR.base,
  radius = 0,
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
        clipPath: `inset(${insetFor(direction, 1 - progress)} round ${radius}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
