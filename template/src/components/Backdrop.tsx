import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palette } from "../design/theme";
import { FluidBackdrop } from "./FluidBackdrop";

export type BackdropVariant = "solid" | "mesh" | "grid" | "spotlight" | "fluid";

/**
 * Grain over a flat background is the cheapest way to stop a video looking like
 * a slide deck. Rendered as a static SVG turbulence tile — no per-frame noise,
 * because animated grain at 30fps reads as video compression artefacts.
 */
const Grain: React.FC<{ opacity: number }> = ({ opacity }) => (
  <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <svg width="100%" height="100%">
      <filter id="backdrop-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="4" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#backdrop-grain)" />
    </svg>
  </AbsoluteFill>
);

/**
 * The layer every scene sits on. Pick a variant per template, not per scene —
 * changing the backdrop between scenes of the same video destroys continuity.
 *
 * - `solid`     — flat colour. The right answer more often than people think.
 * - `mesh`      — three static gradient stops. Depth without motion.
 * - `grid`      — technical, drifting rule grid. For product and dev-facing work.
 * - `spotlight` — a soft pool of light behind the subject. Editorial, focused.
 * - `fluid`     — noise-driven blobs. Alive, but it will fight busy foregrounds.
 */
export const Backdrop: React.FC<{
  palette: Palette;
  variant?: BackdropVariant;
  /** 0 disables. 0.06-0.12 is the useful band. */
  grain?: number;
  children?: React.ReactNode;
}> = ({ palette, variant = "mesh", grain = 0.08, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const isLight = palette.id === "paper";

  // One slow drift shared by every variant, so backdrops feel like one system.
  const drift = interpolate(frame, [0, Math.max(1, durationInFrames)], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg, overflow: "hidden" }}>
      {variant === "fluid" ? <FluidBackdrop palette={palette} /> : null}

      {variant === "mesh" ? (
        <AbsoluteFill
          style={{
            background: `
              radial-gradient(60% 55% at ${18 + drift * 6}% ${22 + drift * 4}%, ${palette.mesh[0]} 0%, transparent 60%),
              radial-gradient(55% 50% at ${82 - drift * 6}% ${76 - drift * 4}%, ${palette.mesh[1]} 0%, transparent 62%),
              linear-gradient(160deg, ${palette.bgAlt} 0%, ${palette.mesh[2]} 100%)
            `,
          }}
        />
      ) : null}

      {variant === "spotlight" ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(45% 60% at 50% ${40 + drift * 3}%, ${palette.mesh[0]} 0%, transparent 70%), ${palette.bg}`,
          }}
        />
      ) : null}

      {variant === "grid" ? (
        <AbsoluteFill
          style={{
            backgroundImage: `
              linear-gradient(${palette.border} 1px, transparent 1px),
              linear-gradient(90deg, ${palette.border} 1px, transparent 1px)
            `,
            backgroundSize: "96px 96px",
            // A drifting grid must move by whole cells or it strobes.
            backgroundPosition: `${(frame / fps) * 8}px ${(frame / fps) * 8}px`,
            opacity: isLight ? 0.5 : 0.28,
            maskImage:
              "radial-gradient(ellipse 75% 70% at 50% 45%, black 20%, transparent 100%)",
          }}
        />
      ) : null}

      {grain > 0 ? <Grain opacity={grain} /> : null}

      {children}
    </AbsoluteFill>
  );
};
