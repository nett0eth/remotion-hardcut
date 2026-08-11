import { useLayoutEffect, useRef, type DependencyList } from "react";
import { createTimeline } from "animejs";
import { useCurrentFrame, useVideoConfig } from "remotion";

type AnimeTimeline = ReturnType<typeof createTimeline>;

/**
 * Runs an Anime.js v4 timeline deterministically inside Remotion.
 *
 * Same principle as the GSAP adapter: build the timeline with `autoplay: false`
 * and `seek()` it to the current frame every render. Anime seeks in
 * **milliseconds**, so the conversion is `(frame / fps) * 1000`.
 *
 * ```tsx
 * const scope = useAnimeTimeline((tl) => {
 *   tl.add(".bar", { scaleY: [0, 1], duration: 600, ease: "outExpo", delay: stagger(60) });
 * }, []);
 * ```
 *
 * Anime v4 is the better pick over GSAP when you want its stagger grammar
 * (`stagger(60, { from: "center", grid: [4, 4] })`) or SVG morphing without a
 * paid plugin. For plain entrances, the kit's presets are still lighter.
 *
 * Selectors are **not** auto-scoped the way GSAP's `gsap.context` scopes them.
 * Query from the returned ref, or use unique class names per scene.
 */
export const useAnimeTimeline = (
  build: (timeline: AnimeTimeline, root: HTMLDivElement) => void,
  deps: DependencyList = [],
) => {
  const scope = useRef<HTMLDivElement>(null);
  const timeline = useRef<AnimeTimeline | null>(null);

  useLayoutEffect(() => {
    if (!scope.current) {
      return;
    }
    const tl = createTimeline({ autoplay: false });
    build(tl, scope.current);
    timeline.current = tl;

    return () => {
      tl.pause();
      timeline.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  useLayoutEffect(() => {
    timeline.current?.seek((frame / fps) * 1000);
  });

  return scope;
};
