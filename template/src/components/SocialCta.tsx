import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fonts } from "../design/fonts";
import { radius, space } from "../design/theme";
import { DUR, EASE } from "../design/motion";
import { ScalePop } from "../animation/ScalePop";
import { Typewriter } from "../animation/Typewriter";

type Scheme = { field: string; ink: string; accent: string };

/**
 * Native social badge + CTA row: avatar pops in with a radiating ring, the
 * handle types itself out, then three chips land staggered — follow, a bell
 * that actually rings, save.
 *
 * This replaced a watermarked Jitter Lottie export. Rebuilding it from the
 * kit's own primitives means no watermark, vector sharpness at any scale, the
 * project's fonts and accent — and the bell can keep ringing on a loop, which
 * a baked export cannot retime.
 */

const Icon: React.FC<{ d: string; color: string; size?: number }> = ({
  d,
  color,
  size = 30,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d={d} stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICONS = {
  follow: "M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21c0-3.3 2.7-6 6-6s6 2.7 6 6M19 8v6M16 11h6",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  save: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
} as const;

const Chip: React.FC<{
  icon: keyof typeof ICONS;
  label?: string;
  scheme: Scheme;
  delay: number;
  filled?: boolean;
  /** Periodic ring wiggle after landing — for the bell. */
  ring?: boolean;
}> = ({ icon, label, scheme, delay, filled = false, ring = false }) => {
  const frame = useCurrentFrame();

  // Ring in 14-frame bursts every 60 frames, starting after the chip lands.
  const since = frame - (delay + DUR.base);
  const burst = since >= 0 ? since % 60 : -1;
  const rotate =
    ring && burst >= 0 && burst < 14
      ? Math.sin((burst / 14) * Math.PI * 3) * 14 * (1 - burst / 14)
      : 0;

  return (
    <ScalePop delay={delay} duration={DUR.fast} fromScale={0.7}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: label ? 12 : 0,
          padding: label ? "14px 30px" : "14px 18px",
          borderRadius: radius.pill,
          backgroundColor: filled ? scheme.accent : "transparent",
          border: `2px solid ${filled ? scheme.accent : `${scheme.ink}33`}`,
        }}
      >
        <span style={{ display: "inline-flex", rotate: `${rotate}deg`, transformOrigin: "top center" }}>
          <Icon d={ICONS[icon]} color={filled ? "#05060A" : scheme.ink} />
        </span>
        {label ? (
          <span
            style={{
              fontFamily: fonts.body,
              fontSize: 30,
              fontWeight: 700,
              color: filled ? "#05060A" : scheme.ink,
            }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </ScalePop>
  );
};

export const SocialCta: React.FC<{
  handle: string;
  avatar: string;
  scheme: Scheme;
  delay?: number;
}> = ({ handle, avatar, scheme, delay = 0 }) => {
  const frame = useCurrentFrame();

  // One ring radiating from the avatar as it lands.
  const ringPhase = interpolate(frame, [delay + 4, delay + 26], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const chipsAt = delay + DUR.slow;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: space.lg,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: space.md }}>
        <div style={{ position: "relative", width: 116, height: 116 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: radius.pill,
              border: `3px solid ${scheme.accent}`,
              scale: 1 + ringPhase * 0.55,
              opacity: (1 - ringPhase) * 0.8,
            }}
          />
          <ScalePop delay={delay} duration={DUR.base} fromScale={0.5}>
            <Img
              src={staticFile(avatar)}
              style={{
                width: 116,
                height: 116,
                borderRadius: radius.pill,
                display: "block",
              }}
            />
          </ScalePop>
        </div>

        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 66,
            fontWeight: 700,
            color: scheme.ink,
          }}
        >
          <Typewriter
            text={handle}
            delay={delay + 8}
            charsPerSecond={20}
            cursor
            cursorColor={scheme.accent}
          />
        </span>
      </div>

      <div style={{ display: "flex", gap: space.sm, alignItems: "center" }}>
        <Chip icon="follow" label="Seguir" scheme={scheme} delay={chipsAt} filled />
        <Chip icon="bell" scheme={scheme} delay={chipsAt + 5} ring />
        <Chip icon="save" label="Salvar" scheme={scheme} delay={chipsAt + 10} />
      </div>
    </div>
  );
};
