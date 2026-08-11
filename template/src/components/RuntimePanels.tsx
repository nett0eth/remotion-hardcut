import React from "react";
import { stagger } from "animejs";
import { Loop } from "remotion";
import { fonts } from "../design/fonts";
import { radius, space, tracking } from "../design/theme";
import { useGsapTimeline } from "../runtimes/gsap";
import { useAnimeTimeline } from "../runtimes/anime";
import { useMotionSequence } from "../runtimes/motion";
import { LottieAsset } from "../runtimes/LottieAsset";

/**
 * Four panels, each animated by the library it names — and each demonstrating
 * the thing that library is actually best at, with real elements instead of
 * four identical letter entrances:
 *
 * - GSAP    → the classic box tween: slide + rotate + border-radius morph on
 *             `elastic.out`, an ease Remotion's Easing cannot express.
 * - Anime   → its signature grid stagger: 18 dots blooming from the centre.
 * - Motion  → spring physics: an equalizer of five bars, each on its own spring.
 * - Lottie  → a real Lottie JSON playing.
 *
 * The scene still cannot lie: if an adapter's seek breaks, that panel visibly
 * freezes instead of a claim in big type quietly becoming false.
 */

const PANEL_LOOP = 55;

type PanelScheme = { field: string; ink: string; accent: string };

const Panel: React.FC<{
  name: string;
  mechanism: string;
  scheme: PanelScheme;
  children: React.ReactNode;
}> = ({ name, mechanism, scheme, children }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: space.sm,
      alignItems: "center",
      padding: `${space.lg}px ${space.md}px`,
      borderRadius: radius.lg,
      border: `2px solid ${scheme.ink}1A`,
    }}
  >
    <div
      style={{
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {children}
    </div>

    <span
      style={{
        fontFamily: fonts.display,
        fontSize: 46,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: scheme.ink,
      }}
    >
      {name}
    </span>

    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 24,
        color: scheme.accent,
        letterSpacing: tracking.label,
      }}
    >
      {mechanism}
    </span>
  </div>
);

/** The canonical GSAP demo: one box, tweened hard. Slide, spin, morph, elastic. */
const GsapDemo: React.FC<{ scheme: PanelScheme }> = ({ scheme }) => {
  const scope = useGsapTimeline((tl) => {
    tl.fromTo(
      ".gsap-box",
      { x: -110, rotation: 0, borderRadius: 14, scale: 0.8 },
      {
        x: 110,
        rotation: 180,
        borderRadius: 44,
        scale: 1,
        duration: 1.3,
        ease: "elastic.out(1, 0.45)",
      },
    );
  }, []);

  return (
    <div ref={scope} style={{ width: 300, display: "flex", justifyContent: "center" }}>
      <div
        className="gsap-box"
        style={{ width: 88, height: 88, backgroundColor: scheme.accent }}
      />
    </div>
  );
};

/** Anime's party trick: a grid of dots staggering outward from the centre. */
const AnimeDemo: React.FC<{ scheme: PanelScheme }> = ({ scheme }) => {
  const scope = useAnimeTimeline((tl, root) => {
    tl.add(root.querySelectorAll(".anime-dot"), {
      scale: [0, 1],
      opacity: [0.15, 1],
      duration: 650,
      ease: "outBack",
      delay: stagger(50, { grid: [6, 3], from: "center" }),
    });
  }, []);

  return (
    <div
      ref={scope}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 22px)",
        gridTemplateRows: "repeat(3, 22px)",
        gap: 16,
      }}
    >
      {new Array(18).fill(true).map((_, index) => (
        <span
          key={index}
          className="anime-dot"
          style={{
            width: 22,
            height: 22,
            borderRadius: 999,
            backgroundColor: index === 8 || index === 9 ? scheme.accent : scheme.ink,
          }}
        />
      ))}
    </div>
  );
};

/** Motion's spring physics: five bars, each settling on its own spring. */
const MotionDemo: React.FC<{ scheme: PanelScheme }> = ({ scheme }) => {
  const scope = useMotionSequence(
    (root) => [
      [
        root.querySelectorAll(".motion-bar"),
        { scaleY: [0, 1] },
        { type: "spring", stiffness: 330, damping: 11, delay: (i: number) => i * 0.09 },
      ],
    ],
    [],
  );

  const heights = [70, 130, 170, 105, 145];

  return (
    <div ref={scope} style={{ display: "flex", alignItems: "flex-end", gap: 18, height: 170 }}>
      {heights.map((height, index) => (
        <div
          key={index}
          className="motion-bar"
          style={{
            width: 26,
            height,
            borderRadius: 13,
            backgroundColor: index === 2 ? scheme.accent : scheme.ink,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
};

export const RuntimePanels: React.FC<{ scheme: PanelScheme }> = ({ scheme }) => (
  <div style={{ display: "flex", gap: space.md, width: "100%" }}>
    <Panel name="GSAP" mechanism="tween elástico" scheme={scheme}>
      <Loop durationInFrames={PANEL_LOOP} layout="none">
        <GsapDemo scheme={scheme} />
      </Loop>
    </Panel>

    <Panel name="Anime.js" mechanism="stagger em grade" scheme={scheme}>
      <Loop durationInFrames={PANEL_LOOP} layout="none">
        <AnimeDemo scheme={scheme} />
      </Loop>
    </Panel>

    <Panel name="Motion" mechanism="física de mola" scheme={scheme}>
      <Loop durationInFrames={PANEL_LOOP} layout="none">
        <MotionDemo scheme={scheme} />
      </Loop>
    </Panel>

    <Panel name="Lottie" mechanism="lottie json" scheme={scheme}>
      <LottieAsset src="lottie/pulse.json" loop style={{ width: 230, height: 230 }} />
    </Panel>
  </div>
);
