import { useLayoutEffect, useRef, type DependencyList } from "react";
import { animate, type AnimationPlaybackControls, type AnimationSequence } from "motion";
import { useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Runs a Motion (motion.dev) sequence deterministically inside Remotion.
 *
 * Same principle as the GSAP and Anime adapters: the library must never advance
 * itself. Motion has no `autoplay: false`, so the sequence is created and
 * `pause()`d in the same synchronous layout effect, then seeked every render.
 * `controls.time` is in **seconds**.
 *
 * ```tsx
 * const scope = useMotionSequence((root) => [
 *   [root.querySelectorAll(".bar"), { scaleY: [0, 1] }, { duration: 0.6, delay: stagger(0.06) }],
 *   [root.querySelector(".label"), { opacity: [0, 1] }, { at: "-0.2" }],
 * ], []);
 * ```
 *
 * ## Which of the three to reach for
 *
 * - **Motion** — springs that actually feel like springs, and the smallest
 *   bundle of the three. Its `at: "-0.2"` sequence grammar is the nicest to read.
 * - **GSAP** — deepest easing library (`elastic`, `back`, `CustomEase`) and
 *   nested timelines. Reach for it when the choreography is complex.
 * - **Anime.js v4** — best stagger grammar (`stagger(60, { grid: [4,4] })`) and
 *   free SVG morphing.
 *
 * For a plain entrance, all three are overkill — the kit's own primitives are
 * lighter and already share the project's easing tokens.
 *
 * ## Rules
 *
 * - **Selectors are global in Motion's vanilla API.** Always query from the
 *   returned root ref, never pass a bare `".bar"` string, or two instances of
 *   the same scene will animate each other's elements.
 * - No `repeat: Infinity` that relies on real time, no gestures, no
 *   scroll-linked effects. Anything reading a clock instead of being seeked
 *   renders as a frozen frame.
 * - Motion may drive some properties through WAAPI. Seeking via `time` is
 *   supported on both drivers, but verify with a still before trusting a render.
 */
export const useMotionSequence = (
  build: (root: HTMLDivElement) => AnimationSequence,
  deps: DependencyList = [],
) => {
  const scope = useRef<HTMLDivElement>(null);
  const controls = useRef<AnimationPlaybackControls | null>(null);

  useLayoutEffect(() => {
    if (!scope.current) {
      return;
    }

    const playback = animate(build(scope.current));
    // Pause in the same synchronous tick it was created, before any frame is
    // painted, so the animation never advances on its own clock.
    playback.pause();
    controls.current = playback;

    return () => {
      playback.cancel();
      controls.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Runs after the build effect on mount, and alone on every later frame.
  useLayoutEffect(() => {
    if (controls.current) {
      controls.current.time = frame / fps;
    }
  });

  return scope;
};
