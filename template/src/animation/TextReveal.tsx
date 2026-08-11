import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DUR, EASE, STAGGER } from "../design/motion";

export type RevealMode = "word" | "char" | "line";

const split = (text: string, mode: RevealMode): string[] => {
  if (mode === "char") return Array.from(text);
  if (mode === "line") return text.split("\n");
  return text.split(" ");
};

const Piece: React.FC<{
  content: string;
  delay: number;
  duration: number;
  mask: boolean;
}> = ({ content, delay, duration, mask }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const inner = (
    <span
      style={{
        display: "inline-block",
        opacity: progress,
        translate: `0px ${(1 - progress) * (mask ? 100 : 30)}%`,
        whiteSpace: "pre",
      }}
    >
      {content}
    </span>
  );

  if (!mask) {
    return inner;
  }

  // overflow:hidden turns the travel into a reveal from behind an edge.
  // Padding compensates for descenders getting clipped.
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        paddingBottom: "0.12em",
        marginBottom: "-0.12em",
      }}
    >
      {inner}
    </span>
  );
};

/**
 * Reveals text piece by piece. `mask` slides each piece up from behind an
 * invisible edge instead of just fading — the single highest-value upgrade
 * you can make to a headline.
 *
 * Use `word` for headlines, `line` for multi-line statements, `char` only for
 * short labels (per-character on a sentence reads as noise).
 */
export const TextReveal: React.FC<{
  text: string;
  mode?: RevealMode;
  delay?: number;
  duration?: number;
  step?: number;
  mask?: boolean;
  style?: React.CSSProperties;
}> = ({
  text,
  mode = "word",
  delay = 0,
  duration = DUR.base,
  step = STAGGER.base,
  mask = true,
  style,
}) => {
  const pieces = split(text, mode);

  return (
    <span style={style}>
      {pieces.map((piece, index) => (
        <React.Fragment key={`${piece}-${index}`}>
          <Piece
            content={piece}
            delay={delay + index * step}
            duration={duration}
            mask={mask}
          />
          {mode === "word" && index < pieces.length - 1 ? " " : null}
          {mode === "line" && index < pieces.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </span>
  );
};
