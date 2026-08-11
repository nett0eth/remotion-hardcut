import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DUR, EASE } from "../design/motion";
import { tabularNumbers } from "../design/fonts";

/**
 * Animates a number from `from` to `to`. Always renders with tabular figures so
 * the digits do not shuffle sideways while counting.
 *
 * Ease out hard: a counter that decelerates into its final value reads as
 * "arriving at a result". A linear counter reads as a loading spinner.
 */
export const CountUp: React.FC<{
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** BCP-47 tag. "pt-BR" gives 1.234,5 — "en-US" gives 1,234.5. */
  locale?: string;
  style?: React.CSSProperties;
}> = ({
  to,
  from = 0,
  delay = 0,
  duration = DUR.slow,
  decimals = 0,
  prefix = "",
  suffix = "",
  locale = "en-US",
  style,
}) => {
  const frame = useCurrentFrame();

  const value = interpolate(frame, [delay, delay + duration], [from, to], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const formatted = value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span style={{ ...tabularNumbers, ...style }}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
