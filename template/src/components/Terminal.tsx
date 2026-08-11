import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../design/fonts";
import { radius, shadow, space } from "../design/theme";
import { EASE } from "../design/motion";
import { Spinner, VoiceWave } from "./VoiceWave";

export type TermLine = {
  /**
   * `command` types out character by character behind a prompt.
   * `out` / `ok` / `dim` appear whole, one after another.
   * `wave` appears with a live waveform and a right-aligned duration.
   * `spin` shows a spinner for `hold` frames, then swaps to `done`.
   */
  kind: "command" | "out" | "ok" | "dim" | "wave" | "spin";
  text: string;
  /** Extra frames of dead air before this line. Where pacing gets authored. */
  pause?: number;
  /** `wave`: right-aligned metadata, e.g. "2.4s". */
  meta?: string;
  /** `spin`: frames to spin before resolving. */
  hold?: number;
  /** `spin`: what replaces the spinner once it resolves. */
  done?: string;
};

export type TerminalTheme = {
  chrome: string;
  field: string;
  border: string;
  text: string;
  dim: string;
  accent: string;
  ok: string;
};

/** Frame each line starts at, given typing speed and authored pauses. */
const schedule = (lines: TermLine[], cps: number, fps: number, startDelay: number) => {
  let cursor = startDelay;
  return lines.map((line) => {
    cursor += line.pause ?? 0;
    const start = cursor;
    const typing =
      line.kind === "command" ? Math.ceil((line.text.length / cps) * fps) : 0;
    const own = line.kind === "spin" ? (line.hold ?? 18) : 0;
    // 5 frames between output lines: fast enough to feel like a program,
    // slow enough that the eye can follow which line is new.
    cursor += typing + own + (line.kind === "command" ? 8 : 5);
    return { start, typing, own };
  });
};

/**
 * A terminal that actually types.
 *
 * Everything is derived from `useCurrentFrame()` — the visible substring, the
 * cursor blink, the spinner glyph, the waveform. No timers, no state, so it
 * seeks and renders deterministically.
 *
 * Why a terminal instead of a bullet list: a command is the most compact honest
 * proof that a thing exists. The viewer sees the exact string they would type
 * and the exact output they would get, in the order they would get it.
 */
export const Terminal: React.FC<{
  lines: TermLine[];
  theme: TerminalTheme;
  title?: string;
  prompt?: string;
  charsPerSecond?: number;
  startDelay?: number;
  fontSize?: number;
  width?: number | string;
}> = ({
  lines,
  theme,
  title = "bash",
  prompt = "$",
  charsPerSecond = 24,
  startDelay = 6,
  fontSize = 34,
  width = "100%",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const times = schedule(lines, charsPerSecond, fps, startDelay);

  const lineHeight = fontSize * 1.62;

  // The window itself lands before anything types.
  const enter = interpolate(frame, [0, 12], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lastStart = times[times.length - 1]?.start ?? 0;
  const cursorOnLast = frame > lastStart + 10;

  return (
    <div
      style={{
        width,
        opacity: enter,
        scale: interpolate(enter, [0, 1], [0.965, 1]),
        borderRadius: radius.lg,
        overflow: "hidden",
        backgroundColor: theme.field,
        border: `1px solid ${theme.border}`,
        boxShadow: shadow.lift,
        fontFamily: fonts.mono,
      }}
    >
      <div
        style={{
          height: fontSize * 1.9,
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingInline: 22,
          backgroundColor: theme.chrome,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((dot) => (
          <span
            key={dot}
            style={{
              width: fontSize * 0.38,
              height: fontSize * 0.38,
              borderRadius: 999,
              backgroundColor: dot,
            }}
          />
        ))}
        <span
          style={{
            marginLeft: 14,
            fontSize: fontSize * 0.62,
            color: theme.dim,
            letterSpacing: "0.06em",
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          padding: `${space.md}px ${space.lg}px ${space.lg}px`,
          display: "flex",
          flexDirection: "column",
          fontSize,
          lineHeight: `${lineHeight}px`,
        }}
      >
        {lines.map((line, index) => {
          const { start, typing, own } = times[index];
          if (frame < start) {
            // Reserve the row so later lines never jump upward as they appear.
            return <div key={index} style={{ height: lineHeight }} />;
          }

          const isLast = index === lines.length - 1;

          if (line.kind === "command") {
            const chars = Math.floor(
              interpolate(frame, [start, start + typing], [0, line.text.length], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            );
            const typed = frame >= start + typing;
            const showCursor = !typed || (isLast && cursorOnLast && frame % fps < fps / 2);

            return (
              <div key={index} style={{ color: theme.text, whiteSpace: "pre" }}>
                <span style={{ color: theme.accent }}>{prompt} </span>
                {line.text.slice(0, chars)}
                {showCursor ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: "0.55em",
                      height: "1.05em",
                      verticalAlign: "-0.16em",
                      backgroundColor: theme.accent,
                    }}
                  />
                ) : null}
              </div>
            );
          }

          if (line.kind === "spin") {
            const resolved = frame >= start + own;
            return (
              <div
                key={index}
                style={{ color: resolved ? theme.ok : theme.dim, display: "flex", gap: 14 }}
              >
                {resolved ? <span>✓</span> : <Spinner color={theme.accent} size={fontSize} />}
                <span>{resolved ? (line.done ?? line.text) : line.text}</span>
              </div>
            );
          }

          if (line.kind === "wave") {
            return (
              <div
                key={index}
                style={{
                  color: theme.text,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  height: lineHeight,
                }}
              >
                <span style={{ color: theme.ok }}>✓</span>
                <span style={{ minWidth: "9em" }}>{line.text}</span>
                <VoiceWave
                  color={theme.accent}
                  bars={13}
                  width={fontSize * 7}
                  height={fontSize * 1.15}
                  delay={start}
                  seed={index * 7 + 1}
                />
                {line.meta ? (
                  <span style={{ color: theme.dim, marginLeft: "auto" }}>{line.meta}</span>
                ) : null}
              </div>
            );
          }

          const color =
            line.kind === "ok" ? theme.ok : line.kind === "dim" ? theme.dim : theme.text;

          return (
            <div key={index} style={{ color, whiteSpace: "pre" }}>
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
