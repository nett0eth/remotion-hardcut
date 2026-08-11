import React from "react";
import { noise2D } from "@remotion/noise";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palette } from "../design/theme";

/**
 * A slow, organic, fluid-looking background: several oversized blurred colour
 * blobs whose positions are driven by simplex noise, optionally pushed through
 * an SVG turbulence displacement for that liquid edge.
 *
 * ## Why not a real fluid simulation
 *
 * WebGL Navier-Stokes solvers (Fluid-JS and friends) are **stateful** — frame N
 * is computed from frame N-1. Remotion renders frames out of order and across
 * parallel browser tabs, so a stateful simulation produces different pixels on
 * every render and tears between chunks. Two options that actually work:
 *
 * 1. This component — position is a pure function of `frame`, so it is
 *    reproducible, seekable and parallel-safe.
 * 2. Pre-render the simulation to an MP4/WebM once, then play it back with
 *    `<Video>` from `@remotion/media`. Use this when you specifically need real
 *    fluid dynamics rather than the look of them.
 *
 * ## Tuning
 *
 * - `speed` under 0.15 keeps it ambient. Above 0.4 it starts competing with the
 *   foreground and the video feels seasick.
 * - `blobs` of 3-4 reads as depth; 6+ turns to soup.
 * - `turbulence` above 0.02 eats render time and starts to look like a screensaver.
 */
export const FluidBackdrop: React.FC<{
  palette: Palette;
  speed?: number;
  blobs?: number;
  turbulence?: number;
  /** Fixed seed keeps the same video looking the same across re-renders. */
  seed?: number;
  opacity?: number;
}> = ({ palette, speed = 0.12, blobs = 4, turbulence = 0, seed = 7, opacity = 0.9 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = (frame / fps) * speed;

  const colors = [palette.mesh[0], palette.mesh[1], palette.accent, palette.accentAlt];
  const filterId = `fluid-turbulence-${seed}`;
  const isLight = palette.id === "paper";

  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg, overflow: "hidden" }}>
      {turbulence > 0 ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency={turbulence}
              numOctaves={2}
              seed={seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={Math.min(width, height) * 0.12}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      ) : null}

      <AbsoluteFill
        style={{
          filter: turbulence > 0 ? `url(#${filterId})` : undefined,
          opacity,
        }}
      >
        {new Array(blobs).fill(true).map((_, index) => {
          // Two decorrelated noise walks per blob: one for x, one for y.
          const x = 50 + noise2D(seed + index, t, index * 10) * 34;
          const y = 50 + noise2D(seed + index + 100, t, index * 10) * 30;
          const size = 55 + noise2D(seed + index + 200, t * 0.5, 0) * 18;
          const color = colors[index % colors.length];

          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                width: `${size}%`,
                aspectRatio: "1",
                translate: "-50% -50%",
                borderRadius: "50%",
                background: `radial-gradient(circle at 50% 50%, ${color} 0%, ${color}00 68%)`,
                filter: `blur(${Math.min(width, height) * 0.06}px)`,
                mixBlendMode: isLight ? "multiply" : "screen",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* Vignette keeps the eye centred and hides blob edges near the frame. */}
      <AbsoluteFill
        style={{
          background: isLight
            ? "radial-gradient(ellipse at center, rgba(255,255,255,0) 45%, rgba(255,255,255,0.55) 100%)"
            : "radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
