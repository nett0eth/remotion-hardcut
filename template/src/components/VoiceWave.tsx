import React from "react";
import { noise2D } from "@remotion/noise";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../design/motion";

/**
 * Audio waveform with two modes.
 *
 * With `src`, the bars are driven by the real FFT of that file via
 * `visualizeAudio` — the wave actually moves with the words, goes still in the
 * pauses, and spikes on stressed syllables. That is the difference between a
 * voice visualiser and a decoration, and it is obvious on screen.
 *
 * Without `src`, bars fall back to simplex noise: still a pure function of
 * `frame`, still deterministic, but only the *idea* of a voice. Use the
 * fallback for tiles and thumbnails where no audio is attached.
 */
type WaveProps = {
  color: string;
  bars?: number;
  width?: number;
  height?: number;
  /** Frame the wave starts moving. Before it, bars sit flat. */
  delay?: number;
  /** Frame the wave settles back to flat. Omit to run for the whole scene. */
  stopAt?: number;
  speed?: number;
  seed?: number;
};

/**
 * `useAudioData` cannot take a nullable source, and hooks cannot be called
 * conditionally — so the two modes are two components and the dispatcher picks
 * one. `src` is stable for the life of a scene, so React never has to swap
 * between them mid-render.
 */
export const VoiceWave: React.FC<WaveProps & { src?: string }> = ({ src, ...rest }) =>
  src ? <SpectrumWave src={src} {...rest} /> : <Wave {...rest} spectrum={null} />;

const SpectrumWave: React.FC<WaveProps & { src: string }> = ({ src, ...rest }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioData = useAudioData(staticFile(src));

  const spectrum = audioData
    ? visualizeAudio({
        fps,
        frame: Math.max(0, frame - (rest.delay ?? 0)),
        audioData,
        numberOfSamples: 32,
      })
    : null;

  return <Wave {...rest} spectrum={spectrum} />;
};

const Wave: React.FC<WaveProps & { spectrum: number[] | null }> = ({
  color,
  bars = 18,
  width = 190,
  height = 44,
  delay = 0,
  stopAt,
  speed = 6,
  seed = 3,
  spectrum,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Envelope: ramps up over 6 frames, and back down over 6 before stopAt.
  const rampIn = interpolate(frame, [delay, delay + 6], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rampOut =
    stopAt === undefined
      ? 0
      : interpolate(frame, [stopAt - 6, stopAt], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const envelope = Math.max(0, rampIn - rampOut);

  const t = ((frame - delay) / fps) * speed;
  // 1.55 leaves a gap of just over half a bar. Tighter and it reads as a solid
  // block; looser and it reads as a chart.
  const barWidth = width / (bars * 1.55);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: barWidth * 0.8,
        width,
        height,
      }}
    >
      {new Array(bars).fill(true).map((_, index) => {
        let amplitude: number;

        if (spectrum) {
          // Map the bar index across the spectrum, then mirror around the
          // centre so the wave reads symmetrically like a voice meter rather
          // than a left-to-right frequency chart.
          const half = Math.floor(bars / 2);
          const fromCentre = Math.abs(index - half);
          // Only the first ~12 of 32 bins carry speech (roughly 0–8kHz). Spread
          // those across the half-width instead of the whole spectrum: mapping
          // all 32 bins parks two thirds of the bars on frequencies a voice
          // never reaches, and no amount of gain wakes them up.
          const SPEECH_BINS = 12;
          const bin = Math.min(
            spectrum.length - 1,
            Math.floor((fromCentre / Math.max(1, half)) * SPEECH_BINS),
          );
          // Speech energy falls off steeply with frequency, so a flat gain
          // leaves everything but the middle two bars motionless. The ramp
          // compensates per band: quiet high bins get more gain than loud low
          // ones, and the whole wave moves instead of one spike.
          amplitude = Math.min(1, spectrum[bin] * (5 + bin * 2.4));
        } else {
          // Two octaves so the wave has both a slow swell and per-bar chatter.
          const swell = noise2D(seed, t * 0.35, index * 0.12);
          const chatter = noise2D(seed + 90, t, index * 0.6);
          // Simplex noise averages around 0.3 in absolute terms, which leaves
          // bars at a third of the height and reading as a flat line. Gained up
          // and clamped so the wave actually uses its box.
          amplitude = Math.min(1, Math.abs(swell * 0.6 + chatter * 0.4) * 2.1);
        }
        // A small floor so silence still reads as a mic that is on, not a dead
        // component. Lower than the noise mode's floor because real speech has
        // real pauses and the contrast is the point.
        const barHeight = height * (0.06 + amplitude * 0.94 * envelope);

        return (
          <span
            key={index}
            style={{
              width: barWidth,
              height: barHeight,
              borderRadius: barWidth,
              backgroundColor: color,
              opacity: 0.55 + amplitude * 0.45,
            }}
          />
        );
      })}
    </span>
  );
};

/**
 * Microphone glyph with concentric rings pulsing outward — the "listening" or
 * "generating speech" state, drawn without an icon dependency.
 */
export const MicPulse: React.FC<{
  color: string;
  size?: number;
  delay?: number;
  /** Seconds per ring. Slower reads as calm, faster as urgent. */
  period?: number;
}> = ({ color, size = 120, delay = 0, period = 1.4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = Math.max(0, frame - delay) / fps;

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {[0, 1, 2].map((ring) => {
        // Each ring is a third of a period out of phase with the next.
        const phase = (elapsed / period + ring / 3) % 1;
        return (
          <span
            key={ring}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `3px solid ${color}`,
              scale: 0.55 + phase * 0.75,
              opacity: (1 - phase) * 0.5,
            }}
          />
        );
      })}

      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="none">
        <rect x="9" y="2" width="6" height="12" rx="3" fill={color} />
        <path
          d="M5 11a7 7 0 0 0 14 0"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M12 18v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
};

/** Braille spinner. Deterministic — the frame index picks the glyph. */
export const Spinner: React.FC<{ color: string; size?: number; fpsPerStep?: number }> = ({
  color,
  size = 34,
  fpsPerStep = 3,
}) => {
  const frame = useCurrentFrame();
  const glyphs = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  return (
    <span style={{ color, fontSize: size, lineHeight: 1 }}>
      {glyphs[Math.floor(frame / fpsPerStep) % glyphs.length]}
    </span>
  );
};
