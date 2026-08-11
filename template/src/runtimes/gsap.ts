import { useLayoutEffect, useRef, type DependencyList } from "react";
import gsap from "gsap";
import { useCurrentFrame, useVideoConfig } from "remotion";

// GSAP's ticker must never drive anything here. Remotion owns time; GSAP only
// gets asked "what does the scene look like at t?". lagSmoothing off removes the
// last place where wall-clock time could leak into a render.
gsap.ticker.lagSmoothing(0);

/**
 * Runs a GSAP timeline deterministically inside Remotion.
 *
 * ## Why this exists
 *
 * GSAP animates against its own requestAnimationFrame clock. Remotion renders
 * frame N by mounting the component and screenshotting it — there is no elapsed
 * wall-clock time. Drop a normal `gsap.to()` into a composition and the render
 * comes out as the first frame of the tween, repeated, or as black.
 *
 * The fix is to build the timeline **paused** and `seek()` it to `frame / fps`
 * on every render. GSAP then behaves as a pure function from time to styles,
 * which is exactly what a frame renderer needs.
 *
 * ## Usage
 *
 * ```tsx
 * const scope = useGsapTimeline((tl) => {
 *   tl.from(".headline", { yPercent: 120, duration: 0.6, ease: "expo.out" })
 *     .from(".card", { opacity: 0, stagger: 0.08 }, "-=0.3");
 * }, []);
 *
 * return (
 *   <div ref={scope}>
 *     <h1 className="headline">…</h1>
 *   </div>
 * );
 * ```
 *
 * Times inside the timeline are **seconds**, not frames — GSAP's native unit.
 *
 * ## Rules
 *
 * - No ScrollTrigger, no `repeat: -1` with `yoyo` relying on real time, no
 *   `gsap.delayedCall`. Anything that reads the clock instead of the timeline breaks.
 * - Selectors are scoped to the returned ref, so two instances of the same scene
 *   never fight over the same class names.
 * - Prefer the kit's own presets for simple entrances. Reach for GSAP when you
 *   want its sequencing grammar (`"-=0.3"`, labels, nested timelines) or an ease
 *   Remotion does not have (`elastic`, `back`, `steps`, custom `CustomEase`).
 */
export const useGsapTimeline = (
  build: (timeline: gsap.core.Timeline) => void,
  deps: DependencyList = [],
) => {
  const scope = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      build(tl);
      timeline.current = tl;
    }, scope);

    return () => {
      context.revert();
      timeline.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Runs after the build effect on mount, and alone on every later frame.
  // suppressEvents (the default) keeps onComplete/onStart callbacks from firing
  // once per rendered frame.
  useLayoutEffect(() => {
    timeline.current?.seek(frame / fps);
  });

  return scope;
};

/**
 * Same contract, driven by a normalized 0-1 progress instead of absolute time.
 * Convenient when the timeline should stretch to fill whatever duration the
 * scene ends up with.
 */
export const useGsapProgress = (
  build: (timeline: gsap.core.Timeline) => void,
  progress: number,
  deps: DependencyList = [],
) => {
  const scope = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      build(tl);
      timeline.current = tl;
    }, scope);

    return () => {
      context.revert();
      timeline.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useLayoutEffect(() => {
    timeline.current?.progress(Math.min(1, Math.max(0, progress)));
  });

  return scope;
};
