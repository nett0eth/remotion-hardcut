import React from "react";
import { Loop, Sequence } from "remotion";
import type { Scene } from "./schema";
import type { Scheme } from "./scenes";

/**
 * Miniature scenes for the `showreel` grid.
 *
 * Each one is a real `Scene` object rendered by the real `HardcutScene` — the
 * showreel is not a mockup of the format, it is the format at 20% scale. If a
 * tile looks wrong, the scene type is wrong.
 *
 * The content is deliberately shorter than a full-size scene: at ~390px wide a
 * four-word headline is illegible, and the point of a tile is to show the
 * *behaviour*, not to be read.
 */
export const miniSceneFor = (kind: string, seconds: number): Scene => {
  const base = { seconds, invert: false as const };

  switch (kind) {
    case "bigtype":
      return {
        ...base,
        type: "bigtype",
        text: "Corte.",
        typed: false,
        variant: "pop",
        bleed: 1.3,
        align: "center",
      };

    case "sting":
      return { ...base, type: "sting", mark: "▮" };

    case "grid":
      return {
        ...base,
        type: "grid",
        columns: 2,
        items: [
          { label: "um", highlight: true },
          { label: "dois", highlight: false },
          { label: "três", highlight: false },
          { label: "quatro", highlight: false },
        ],
      };

    case "shot":
      // No asset in the tile, so the demo is the camera move itself over the
      // procedural backdrop. It shows what `shot` does; a real one carries footage.
      return {
        ...base,
        type: "sting",
        mark: "◎",
        caption: "camera",
      };

    case "terminal":
      return {
        ...base,
        type: "terminal",
        title: "bash",
        charsPerSecond: 22,
        lines: [
          { kind: "command", text: "hardcut render" },
          { kind: "ok", text: "  ✓ 43s", pause: 4 },
        ],
      };

    case "voice":
      return { ...base, type: "voice", label: "voz" };

    case "counter":
      return { ...base, type: "counter", value: 100, label: "número", decimals: 0 };

    default:
      return { ...base, type: "end", text: "fim", cta: "/hardcut-new" };
  }
};

/**
 * Renders a full-size 1920×1080 scene inside a small box by scaling it down,
 * looping it, and offsetting its phase.
 *
 * `Loop` resets `useCurrentFrame()` inside, so the miniature replays cleanly
 * without any of the child components knowing they are in a tile. `Sequence`
 * with a negative-feeling offset staggers the phase so eight tiles do not pulse
 * in unison, which would read as a strobe rather than a showreel.
 */
export const MiniStage: React.FC<{
  width: number;
  loop: number;
  offset: number;
  scheme: Scheme;
  children: React.ReactNode;
}> = ({ width, loop, offset, scheme, children }) => {
  const height = (width * 9) / 16;

  return (
    <div
      style={{
        width,
        height,
        overflow: "hidden",
        position: "relative",
        backgroundColor: scheme.field,
      }}
    >
      <div
        style={{
          width: 1920,
          height: 1080,
          transformOrigin: "top left",
          scale: width / 1920,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* from={-offset} starts the tile part-way into its own cycle. */}
        <Sequence from={-offset} layout="none">
          <Loop durationInFrames={loop} layout="none">
            {children}
          </Loop>
        </Sequence>
      </div>
    </div>
  );
};
