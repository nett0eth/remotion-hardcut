import React, { useCallback, useEffect, useState } from "react";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";

/**
 * Plays a Lottie JSON file, frame-synced to the Remotion timeline.
 *
 * This is the bridge for anything authored in a visual motion tool — **Jitter**
 * (Export → Lottie), LottieLab, Rive-to-Lottie, or After Effects via Bodymovin.
 * Design the motion where designing motion is pleasant, then drop the JSON in
 * `public/` and reference it by filename.
 *
 * @remotion/lottie already drives the animation from `useCurrentFrame()`, so
 * playback is deterministic with no adapter needed.
 *
 * ## Getting a Jitter animation in here
 *
 * 1. In Jitter: Export → Lottie → download the `.json`.
 * 2. Drop it in `public/lottie/`.
 * 3. `<LottieAsset src="lottie/logo-sting.json" />`
 *
 * Jitter's exporter targets the current Lottie spec, so effects it cannot
 * express get baked or dropped — always watch the rendered result, not the
 * Jitter preview. Gradients and blurs are the usual casualties.
 *
 * ## Timing
 *
 * The Lottie plays at its own authored frame rate. To fit it to a scene, set
 * `playbackRate`, or size the Sequence to the animation using
 * `getLottieMetadata()` inside `calculateMetadata`.
 */
export const LottieAsset: React.FC<{
  /** Path inside public/, e.g. "lottie/logo.json". Or pass `data` directly. */
  src?: string;
  data?: LottieAnimationData;
  loop?: boolean;
  playbackRate?: number;
  direction?: "forward" | "backward";
  style?: React.CSSProperties;
  className?: string;
}> = ({ src, data, loop = false, playbackRate = 1, direction = "forward", style, className }) => {
  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(
    data ?? null,
  );
  const [handle] = useState(() => (data ? null : delayRender("Loading Lottie JSON")));

  const fetchData = useCallback(async () => {
    if (!src || handle === null) {
      return;
    }
    try {
      const response = await fetch(staticFile(src));
      const json = (await response.json()) as LottieAnimationData;
      setAnimationData(json);
      continueRender(handle);
    } catch (error) {
      cancelRender(error);
    }
  }, [src, handle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!animationData) {
    return null;
  }

  return (
    <Lottie
      animationData={animationData}
      loop={loop}
      playbackRate={playbackRate}
      direction={direction}
      style={style}
      className={className}
    />
  );
};
