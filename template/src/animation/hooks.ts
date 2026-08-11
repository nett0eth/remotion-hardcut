import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DUR, EASE } from "../design/motion";

/**
 * 0 → 1 → 0 progress across the current Sequence: eases in at the start,
 * holds at 1, eases out before the sequence ends.
 *
 * The single most useful hook in the kit. Derive every property of a scene from
 * one progress value and the whole scene moves as one object.
 */
export const useEnterExit = (options?: {
  enter?: number;
  exit?: number;
  delay?: number;
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const enter = options?.enter ?? DUR.base;
  const exit = options?.exit ?? DUR.fast;
  const delay = options?.delay ?? 0;

  const enterProgress = interpolate(frame, [delay, delay + enter], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitProgress = interpolate(
    frame,
    [durationInFrames - exit, durationInFrames],
    [0, 1],
    {
      easing: EASE.in,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return enterProgress - exitProgress;
};

/**
 * Linear 0 → 1 across the current Sequence. Use for ambient motion (drifting
 * backdrops, slow zooms) where easing would read as a pump.
 */
export const useSceneProgress = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/** Seconds elapsed in the current Sequence. Handy when timing against a VO track. */
export const useSeconds = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
