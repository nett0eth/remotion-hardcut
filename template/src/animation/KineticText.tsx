import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { DUR, EASE, STAGGER } from "../design/motion";

export type KineticVariant =
  /** Each word slides up from behind an invisible edge. The safe default. */
  | "mask"
  /** Per-character scale overshoot. Loud, physical, best on 1–3 words. */
  | "pop"
  /** Characters resolve out of noise. Reads as "computing". */
  | "scramble"
  /** Characters arrive out of focus and sharpen. Cinematic, expensive-looking. */
  | "blur"
  /** Characters squash in horizontally then release. */
  | "stretch"
  /** Whole line rises as one block. Use when the words must not be separable. */
  | "line";

const SCRAMBLE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$*+=/\\<>";

/**
 * Deterministic stand-in for Math.random. The same (index, frame) always maps
 * to the same glyph, so a scrambled frame renders identically on every worker.
 */
const pseudoChar = (index: number, frame: number) => {
  const hash = (index * 2654435761 + frame * 40503) % SCRAMBLE_CHARS.length;
  return SCRAMBLE_CHARS[Math.abs(hash)];
};

const Char: React.FC<{
  char: string;
  variant: KineticVariant;
  index: number;
  delay: number;
  duration: number;
  accent?: string;
}> = ({ char, variant, index, delay, duration, accent }) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: variant === "pop" || variant === "stretch" ? EASE.pop : EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (char === " ") {
    return <span style={{ whiteSpace: "pre" }}> </span>;
  }

  if (variant === "scramble") {
    const settled = frame >= delay + duration;
    // While unresolved the slot still holds a glyph, so the line never reflows.
    const shown = settled ? char : frame < delay ? " " : pseudoChar(index, frame);
    return (
      <span
        style={{
          display: "inline-block",
          whiteSpace: "pre",
          color: settled ? undefined : accent,
          opacity: frame < delay ? 0 : 1,
        }}
      >
        {shown}
      </span>
    );
  }

  const style: React.CSSProperties = {
    display: "inline-block",
    whiteSpace: "pre",
    opacity: progress,
  };

  if (variant === "pop") {
    style.scale = interpolate(progress, [0, 1], [0.3, 1]);
    style.translate = `0px ${(1 - progress) * 24}%`;
  }

  if (variant === "blur") {
    style.filter = `blur(${(1 - progress) * 18}px)`;
    style.scale = interpolate(progress, [0, 1], [1.18, 1]);
  }

  if (variant === "stretch") {
    // Individual scaleX is not a standalone CSS property, so this one needs
    // a transform string. Order matters: scale before translate.
    style.transform = `scaleX(${interpolate(progress, [0, 1], [0.2, 1])}) translateY(${(1 - progress) * 18}%)`;
  }

  return <span style={style}>{char}</span>;
};

/**
 * Headline animation with a variant per mood.
 *
 * Pick by how many words there are and how hard the line should hit: `mask` for
 * anything over four words, `pop` and `stretch` for one or two, `scramble` for
 * anything technical, `blur` when the cut before it was loud and this one should
 * feel like a lens finding focus.
 *
 * Mixing variants across a video is the point — six identical reveals in a row
 * is the thing that makes a promo feel automated.
 */
export const KineticText: React.FC<{
  text: string;
  variant?: KineticVariant;
  delay?: number;
  duration?: number;
  step?: number;
  accent?: string;
  style?: React.CSSProperties;
}> = ({
  text,
  variant = "mask",
  delay = 0,
  duration = DUR.fast,
  step = STAGGER.tight,
  accent,
  style,
}) => {
  const frame = useCurrentFrame();

  if (variant === "line") {
    const progress = interpolate(frame, [delay, delay + DUR.base], [0, 1], {
      easing: EASE.out,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <span
        style={{
          display: "inline-block",
          overflow: "hidden",
          paddingBottom: "0.14em",
          marginBottom: "-0.14em",
          ...style,
        }}
      >
        <span
          style={{
            display: "inline-block",
            translate: `0px ${(1 - progress) * 105}%`,
            opacity: progress > 0 ? 1 : 0,
          }}
        >
          {text}
        </span>
      </span>
    );
  }

  if (variant === "mask") {
    const words = text.split(" ");
    return (
      <span style={style}>
        {words.map((word, index) => {
          const wordDelay = delay + index * (step + 1);
          const progress = interpolate(frame, [wordDelay, wordDelay + duration], [0, 1], {
            easing: EASE.out,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <React.Fragment key={`${word}-${index}`}>
              <span
                style={{
                  display: "inline-block",
                  overflow: "hidden",
                  paddingBottom: "0.14em",
                  marginBottom: "-0.14em",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    translate: `0px ${(1 - progress) * 105}%`,
                  }}
                >
                  {word}
                </span>
              </span>
              {index < words.length - 1 ? <span style={{ whiteSpace: "pre" }}> </span> : null}
            </React.Fragment>
          );
        })}
      </span>
    );
  }

  return (
    <span style={style}>
      {Array.from(text).map((char, index) => (
        <Char
          key={`${char}-${index}`}
          char={char}
          variant={variant}
          index={index}
          delay={delay + index * step}
          duration={duration}
          accent={accent}
        />
      ))}
    </span>
  );
};
