import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { stagger } from "animejs";
import { useGsapTimeline } from "./runtimes/gsap";
import { useAnimeTimeline } from "./runtimes/anime";
import { useMotionSequence } from "./runtimes/motion";
import { fonts } from "./design/fonts";

/**
 * Smoke test for the three third-party runtime adapters.
 *
 * Each row animates a bar from 0 to 1200px linearly over 2 seconds. If an
 * adapter's seek is working, the bar length tracks the frame number and all
 * three rows stay in lockstep. If a library is running on its own clock
 * instead, its bar sits at 0 or jumps to full and stays there.
 *
 * Render `RuntimeCheck` at frames 0, 30 and 59 whenever a runtime is upgraded.
 * A version bump in GSAP, Anime or Motion can silently break seeking, and the
 * failure looks exactly like "the animation didn't run".
 */
const ROW_HEIGHT = 200;
const TRAVEL = 1200;

const Row: React.FC<{
  label: string;
  color: string;
  refProp: React.RefObject<HTMLDivElement | null>;
  className: string;
}> = ({ label, color, refProp, className }) => (
  <div ref={refProp} style={{ height: ROW_HEIGHT, display: "flex", alignItems: "center", gap: 40 }}>
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 34,
        color: "#8B95A8",
        width: 200,
        flexShrink: 0,
      }}
    >
      {label}
    </span>
    <div
      className={className}
      style={{ height: 70, width: 0, backgroundColor: color, borderRadius: 8 }}
    />
  </div>
);

export const RuntimeCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const gsapScope = useGsapTimeline((tl) => {
    tl.to(".gsap-bar", { width: TRAVEL, duration: 2, ease: "none" });
  }, []);

  const animeScope = useAnimeTimeline((tl, root) => {
    tl.add(root.querySelectorAll(".anime-bar"), {
      width: `${TRAVEL}px`,
      duration: 2000,
      ease: "linear",
      delay: stagger(0),
    });
  }, []);

  const motionScope = useMotionSequence(
    (root) => [
      [
        root.querySelectorAll(".motion-bar"),
        { width: ["0px", `${TRAVEL}px`] },
        { duration: 2, ease: "linear" },
      ],
    ],
    [],
  );

  // The control: the kit's own frame-driven maths. Every bar should match this.
  const expected = Math.min(1, frame / fps / 2) * TRAVEL;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05060A", padding: 90, justifyContent: "center" }}>
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: 38,
          color: "#3DDC97",
          marginBottom: 30,
        }}
      >
        frame {frame} · expected width {Math.round(expected)}px
      </span>

      <Row label="gsap" color="#5B8CFF" refProp={gsapScope} className="gsap-bar" />
      <Row label="anime" color="#38BDF8" refProp={animeScope} className="anime-bar" />
      <Row label="motion" color="#3DDC97" refProp={motionScope} className="motion-bar" />

      <div style={{ height: ROW_HEIGHT, display: "flex", alignItems: "center", gap: 40 }}>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 34,
            color: "#8B95A8",
            width: 200,
            flexShrink: 0,
          }}
        >
          control
        </span>
        <div
          style={{ height: 70, width: expected, backgroundColor: "#FFB454", borderRadius: 8 }}
        />
      </div>
    </AbsoluteFill>
  );
};
