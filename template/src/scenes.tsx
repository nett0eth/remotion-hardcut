import React from "react";
import {
  AbsoluteFill,
  Img,
  Loop,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import type { Scene } from "./schema";
import { fonts, tabularNumbers } from "./design/fonts";
import { radius, space, tracking, type Palette } from "./design/theme";
import { DUR, EASE, STAGGER } from "./design/motion";
import { Camera, FOCUS, SHOTS } from "./animation/Camera";
import { CountUp } from "./animation/CountUp";
import { FadeIn } from "./animation/FadeIn";
import { KineticText } from "./animation/KineticText";
import { Typewriter } from "./animation/Typewriter";
import { LottieAsset } from "./runtimes/LottieAsset";
import { Terminal } from "./components/Terminal";
import { MicPulse, VoiceWave } from "./components/VoiceWave";
import { RuntimePanels } from "./components/RuntimePanels";
import { SocialCta } from "./components/SocialCta";
import { MiniStage, miniSceneFor } from "./showreel";

/**
 * hardcut ignores the palette's surfaces and runs on two colours: a field and
 * its inverse. Colour appears only as the accent, and only on one element per
 * scene. Reducing the palette this hard is what lets the cuts do the work.
 */
export type Scheme = { field: string; ink: string; accent: string };

export const schemeFor = (palette: Palette, dark: boolean): Scheme =>
  dark
    ? { field: "#05060A", ink: "#FFFFFF", accent: palette.accent }
    : { field: "#F4F4F2", ink: "#08090C", accent: palette.accent };

type CutStyle = "settle" | "punch" | "left" | "right" | "rise" | "flash";

/**
 * Every cut lands inside 5 frames, but not identically. `cut` picks the
 * arrival: scale settles, directional slides, or an ink flash. Twelve
 * identical settles in a row reads as automated — same rule as the letter
 * variants.
 *
 * On top of the arrival, every scene carries a barely-there linear drift
 * (scale 1 → 1.02 across its whole duration) so holds never sit dead still.
 * Linear on purpose: eased ambient motion reads as a pump.
 */
const Cut: React.FC<{ scheme: Scheme; cut?: CutStyle; children: React.ReactNode }> = ({
  scheme,
  cut = "settle",
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // 1 → 0 over the arrival window. Everything below derives from it.
  const remaining = interpolate(frame, [0, cut === "punch" ? 5 : 4], [1, 0], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const drift = 1 + 0.02 * (frame / Math.max(1, durationInFrames));

  const scale =
    cut === "punch" ? 1 + 0.055 * remaining : cut === "settle" || cut === "flash" ? 1 + 0.02 * remaining : 1;

  const translate =
    cut === "left"
      ? `${-2.5 * remaining}% 0%`
      : cut === "right"
        ? `${2.5 * remaining}% 0%`
        : cut === "rise"
          ? `0% ${2.5 * remaining}%`
          : "0% 0%";

  return (
    <AbsoluteFill style={{ backgroundColor: scheme.field, overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: scale * drift, translate }}>{children}</AbsoluteFill>

      {cut === "flash" ? (
        <AbsoluteFill
          style={{ backgroundColor: scheme.ink, opacity: remaining * 0.65, pointerEvents: "none" }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; scheme: Scheme; delay?: number }> = ({
  text,
  scheme,
  delay = DUR.base,
}) => (
  <FadeIn delay={delay} duration={DUR.fast} from="up" distance={16}>
    <span
      style={{
        fontFamily: fonts.body,
        fontSize: 32,
        fontWeight: 600,
        letterSpacing: tracking.label,
        textTransform: "uppercase",
        color: scheme.ink,
        opacity: 0.55,
      }}
    >
      {text}
    </span>
  </FadeIn>
);

export const HardcutScene: React.FC<{ scene: Scene; scheme: Scheme }> = ({ scene, scheme }) => {
  const { width, durationInFrames, fps } = useVideoConfig();
  const frame = useCurrentFrame();

  switch (scene.type) {
    case "bigtype": {
      // Size from the character count so the line always reaches the frame
      // edges. Fitting type to the box is the whole look — a headline with
      // comfortable margins reads as a slide, not a promo.
      const fontSize = (width / Math.max(4, scene.text.length)) * 1.85 * scene.bleed;

      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems:
                scene.align === "left"
                  ? "flex-start"
                  : scene.align === "right"
                    ? "flex-end"
                    : "center",
              paddingInline: scene.bleed > 1.15 ? 0 : 60,
            }}
          >
            <div
              style={{
                fontFamily: fonts.display,
                fontSize,
                fontWeight: 800,
                lineHeight: 0.92,
                letterSpacing: "-0.045em",
                color: scheme.ink,
                whiteSpace: "nowrap",
              }}
            >
              {scene.typed ? (
                <Typewriter
                  text={scene.text}
                  charsPerSecond={26}
                  cursor
                  cursorColor={scheme.accent}
                />
              ) : (
                <KineticText
                  text={scene.text}
                  variant={scene.variant}
                  duration={DUR.fast}
                  step={STAGGER.tight}
                  accent={scheme.accent}
                />
              )}
            </div>
          </AbsoluteFill>
        </Cut>
      );
    }

    case "sting":
      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <Camera move={SHOTS.breathe} duration={durationInFrames}>
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: 260,
                  height: 260,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Two phase-offset rings expanding behind the mark — the mark
                    lands, the energy keeps radiating. Pure function of frame. */}
                {[0, 1].map((ring) => {
                  const phase = (frame / 48 + ring / 2) % 1;
                  return (
                    <div
                      key={ring}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: radius.pill,
                        border: `3px solid ${scheme.ink}`,
                        scale: 0.95 + phase * 0.9,
                        opacity: (1 - phase) * 0.3,
                      }}
                    />
                  );
                })}

                <div
                  style={{
                    width: 260,
                    height: 260,
                    borderRadius: radius.pill,
                    backgroundColor: scheme.ink,
                    color: scheme.field,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 130,
                    lineHeight: 1,
                  }}
                >
                  {scene.mark}
                </div>
              </div>
            </AbsoluteFill>
          </Camera>

          {scene.caption ? (
            <AbsoluteFill
              style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 180 }}
            >
              <Caption text={scene.caption} scheme={scheme} delay={DUR.fast} />
            </AbsoluteFill>
          ) : null}
        </Cut>
      );

    case "grid":
      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: space.xl,
              paddingInline: 130,
            }}
          >
            {scene.heading ? (
              <span
                style={{
                  fontFamily: fonts.display,
                  fontSize: 92,
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  color: scheme.ink,
                  textAlign: "center",
                }}
              >
                <KineticText text={scene.heading} variant="mask" duration={DUR.fast} />
              </span>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${scene.columns}, 1fr)`,
                gap: space.md,
                width: "100%",
              }}
            >
              {scene.items.map((item, index) => {
                // 4 frames apart: fast enough to read as one gesture, slow
                // enough that the eye tracks the order.
                const delay = DUR.fast + index * 4;
                return (
                  <FadeIn
                    key={item.label}
                    delay={delay}
                    duration={DUR.base}
                    from="up"
                    distance={34}
                  >
                    <div
                      style={{
                        padding: `${space.md}px ${space.md}px`,
                        borderRadius: radius.md,
                        border: `2px solid ${item.highlight ? scheme.accent : `${scheme.ink}22`}`,
                        backgroundColor: item.highlight ? `${scheme.accent}18` : "transparent",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        minHeight: 150,
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.display,
                          fontSize: 44,
                          fontWeight: 700,
                          letterSpacing: "-0.02em",
                          color: item.highlight ? scheme.accent : scheme.ink,
                        }}
                      >
                        {scene.loop ? (
                          // Looping turns a list of names into a demonstration:
                          // each label replays its own variant on a cycle,
                          // offset per tile so the grid does not pulse in unison.
                          <Loop durationInFrames={scene.loop} layout="none">
                            <KineticText
                              text={item.label}
                              variant={item.variant ?? "mask"}
                              delay={index * 3}
                              duration={DUR.fast}
                              step={STAGGER.tight}
                              accent={scheme.accent}
                            />
                          </Loop>
                        ) : (
                          <KineticText
                            text={item.label}
                            variant={item.variant ?? "mask"}
                            delay={delay + 2}
                            duration={DUR.fast}
                            step={STAGGER.tight}
                            accent={scheme.accent}
                          />
                        )}
                      </span>
                      {item.caption ? (
                        <span
                          style={{
                            fontFamily: fonts.mono,
                            fontSize: 26,
                            color: scheme.ink,
                            opacity: 0.5,
                          }}
                        >
                          {item.caption}
                        </span>
                      ) : null}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </AbsoluteFill>
        </Cut>
      );

    case "showreel": {
      // Tile width derives from the same grid maths the CSS uses, because the
      // miniature has to know its own pixel width to compute the scale factor.
      const gutter = 260;
      const gap = space.md;
      const tileWidth = (1920 - gutter - gap * (scene.columns - 1)) / scene.columns;

      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: space.xl,
              paddingInline: gutter / 2,
            }}
          >
            {scene.heading ? (
              <span
                style={{
                  fontFamily: fonts.display,
                  fontSize: 92,
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  color: scheme.ink,
                  textAlign: "center",
                }}
              >
                <KineticText text={scene.heading} variant="mask" duration={DUR.fast} />
              </span>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${scene.columns}, 1fr)`,
                gap,
                width: "100%",
              }}
            >
              {scene.items.map((item, index) => (
                <FadeIn
                  key={item.kind + index}
                  delay={DUR.fast + index * 4}
                  duration={DUR.base}
                  from="up"
                  distance={30}
                >
                  <div
                    style={{
                      borderRadius: radius.md,
                      overflow: "hidden",
                      border: `2px solid ${item.highlight ? scheme.accent : `${scheme.ink}1A`}`,
                    }}
                  >
                    <MiniStage
                      width={tileWidth}
                      loop={scene.loop}
                      offset={item.offset}
                      scheme={scheme}
                    >
                      <HardcutScene
                        scene={miniSceneFor(item.kind, scene.loop / 30)}
                        scheme={scheme}
                      />
                    </MiniStage>

                    <div
                      style={{
                        padding: "12px 18px",
                        backgroundColor: item.highlight ? `${scheme.accent}1F` : "transparent",
                        borderTop: `2px solid ${item.highlight ? scheme.accent : `${scheme.ink}1A`}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fonts.mono,
                          fontSize: 26,
                          fontWeight: 600,
                          color: item.highlight ? scheme.accent : scheme.ink,
                          letterSpacing: tracking.label,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </AbsoluteFill>
        </Cut>
      );
    }

    case "runtimes":
      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: space.xl,
              paddingInline: 130,
            }}
          >
            {scene.heading ? (
              <span
                style={{
                  fontFamily: fonts.display,
                  fontSize: 92,
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  color: scheme.ink,
                  textAlign: "center",
                }}
              >
                <KineticText text={scene.heading} variant="mask" duration={DUR.fast} />
              </span>
            ) : null}

            <RuntimePanels scheme={scheme} />
          </AbsoluteFill>
        </Cut>
      );

    case "shot":
      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <Camera
            move={{ ...SHOTS[scene.shot], origin: FOCUS[scene.focus] }}
            duration={durationInFrames}
          >
            {scene.video ? (
              <Video
                src={staticFile(scene.video)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : scene.lottie ? (
              <LottieAsset src={scene.lottie} style={{ width: "100%", height: "100%" }} />
            ) : scene.image ? (
              <Img
                src={staticFile(scene.image)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : null}
          </Camera>

          {scene.label ? (
            <AbsoluteFill
              style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: 90 }}
            >
              <FadeIn delay={DUR.instant} duration={DUR.fast} from="up" distance={16}>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 30,
                    fontWeight: 600,
                    letterSpacing: tracking.label,
                    textTransform: "uppercase",
                    color: "#FFFFFF",
                    backgroundColor: "#00000099",
                    padding: "10px 20px",
                    borderRadius: radius.sm,
                  }}
                >
                  {scene.label}
                </span>
              </FadeIn>
            </AbsoluteFill>
          ) : null}
        </Cut>
      );

    case "terminal":
      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: space.lg,
              paddingInline: 150,
            }}
          >
            <Terminal
              lines={scene.lines}
              title={scene.title}
              charsPerSecond={scene.charsPerSecond}
              width={1520}
              fontSize={38}
              theme={{
                // The terminal keeps its own dark chrome in both schemes. A
                // light-mode terminal reads as a text editor, not a shell.
                chrome: "#14161C",
                field: "#0B0D12",
                border: "#242833",
                text: "#E8EDF5",
                dim: "#6E7A8C",
                accent: scheme.accent,
                ok: "#3DDC97",
              }}
            />
            {scene.caption ? <Caption text={scene.caption} scheme={scheme} /> : null}
          </AbsoluteFill>
        </Cut>
      );

    case "voice":
      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: space.lg,
            }}
          >
            <MicPulse color={scheme.accent} size={200} />

            {/* Driven by the scene's own narration file, so the wave is the
                actual voice — moving on the words, still in the pauses. */}
            <VoiceWave
              color={scheme.ink}
              bars={34}
              width={900}
              height={130}
              delay={0}
              seed={11}
              src={scene.vo}
            />

            <span
              style={{
                fontFamily: fonts.display,
                fontSize: 84,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: scheme.ink,
                textAlign: "center",
              }}
            >
              <KineticText
                text={scene.label}
                variant="mask"
                duration={DUR.fast}
                step={STAGGER.tight}
              />
            </span>

            {scene.preset ? (
              <FadeIn delay={DUR.base} duration={DUR.fast} from="up" distance={16}>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 34,
                    color: scheme.accent,
                    letterSpacing: tracking.label,
                  }}
                >
                  {scene.preset}
                </span>
              </FadeIn>
            ) : null}

            {scene.caption ? (
              <Caption text={scene.caption} scheme={scheme} delay={DUR.slow} />
            ) : null}
          </AbsoluteFill>
        </Cut>
      );

    case "counter":
      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: space.md,
            }}
          >
            <FadeIn delay={0} duration={DUR.instant} from="none">
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: 38,
                  fontWeight: 700,
                  letterSpacing: tracking.label,
                  textTransform: "uppercase",
                  color: scheme.ink,
                  opacity: 0.55,
                }}
              >
                {scene.label}
              </span>
            </FadeIn>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: space.lg,
                fontFamily: fonts.display,
                fontSize: 260,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "-0.05em",
                color: scheme.ink,
                ...tabularNumbers,
              }}
            >
              {scene.mark ? (
                <span style={{ fontSize: 140, lineHeight: 1 }}>{scene.mark}</span>
              ) : null}
              <CountUp
                to={scene.value}
                delay={DUR.instant}
                duration={DUR.slow}
                decimals={scene.decimals}
                prefix={scene.prefix}
                suffix={scene.suffix}
                locale="pt-BR"
              />
            </div>

            {/* Progress bar synced to the count — the number and the bar arrive
                together, which makes the count feel measured, not decorative. */}
            <div
              style={{
                width: 460,
                height: 8,
                borderRadius: 4,
                backgroundColor: `${scheme.ink}1F`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 4,
                  backgroundColor: scheme.accent,
                  width: `${
                    interpolate(frame, [DUR.instant, DUR.instant + DUR.slow], [0, 100], {
                      easing: EASE.out,
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })
                  }%`,
                }}
              />
            </div>
          </AbsoluteFill>
        </Cut>
      );

    case "end":
      return (
        <Cut scheme={scheme} cut={scene.cut}>
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: space.lg,
            }}
          >
            <span
              style={{
                fontFamily: fonts.display,
                fontSize: 128,
                fontWeight: 800,
                lineHeight: 0.98,
                letterSpacing: "-0.04em",
                textAlign: "center",
                color: scheme.ink,
              }}
            >
              <KineticText
                text={scene.text}
                variant="mask"
                duration={DUR.fast}
                step={STAGGER.tight}
              />
            </span>

            {scene.cta ? (
              <FadeIn delay={DUR.base} duration={DUR.base} from="up" distance={22}>
                <div
                  style={{
                    padding: "22px 56px",
                    borderRadius: radius.pill,
                    backgroundColor: scheme.accent,
                    fontFamily: fonts.mono,
                    fontSize: 44,
                    fontWeight: 700,
                    color: "#05060A",
                  }}
                >
                  {scene.cta}
                </div>
              </FadeIn>
            ) : null}

            {scene.handle && scene.avatar ? (
              <SocialCta
                handle={scene.handle}
                avatar={scene.avatar}
                scheme={scheme}
                delay={DUR.slow}
              />
            ) : scene.lottie ? (
              <FadeIn delay={DUR.slow} duration={DUR.base} from="up" distance={18}>
                {/* Remotion advances a Lottie one of its frames per composition
                    frame, so an animation authored at 60fps runs at half speed
                    in a 30fps video. The rate correction puts it back. */}
                <LottieAsset
                  src={scene.lottie}
                  loop
                  playbackRate={(scene.lottieFps ?? 30) / fps}
                  style={{ width: scene.lottieWidth ?? 520, height: "auto" }}
                />
              </FadeIn>
            ) : null}
          </AbsoluteFill>
        </Cut>
      );
  }
};
