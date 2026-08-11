import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Types text out one character at a time. Deterministic — the visible substring
 * is a pure function of the frame, so it renders identically every time.
 *
 * `charsPerSecond` around 22 reads as fast human typing. The cursor blinks on a
 * frame modulo, never on a CSS animation.
 */
export const Typewriter: React.FC<{
  text: string;
  delay?: number;
  charsPerSecond?: number;
  cursor?: boolean;
  cursorColor?: string;
  style?: React.CSSProperties;
}> = ({
  text,
  delay = 0,
  charsPerSecond = 22,
  cursor = true,
  cursorColor = "currentColor",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - delay);
  const visible = Math.floor(
    interpolate(elapsed, [0, (text.length / charsPerSecond) * fps], [0, text.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const done = visible >= text.length;
  // Two blinks per second, independent of frame rate.
  const cursorVisible = done ? frame % fps < fps / 2 : true;

  return (
    <span style={{ whiteSpace: "pre-wrap", ...style }}>
      {text.slice(0, visible)}
      {cursor ? (
        <span
          style={{
            display: "inline-block",
            width: "0.08em",
            height: "1em",
            marginLeft: "0.06em",
            verticalAlign: "-0.1em",
            backgroundColor: cursorColor,
            opacity: cursorVisible ? 1 : 0,
          }}
        />
      ) : null}
    </span>
  );
};
