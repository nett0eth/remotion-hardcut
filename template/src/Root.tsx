import React from "react";
import { Composition } from "remotion";
import { Hardcut, hardcutMetadata } from "./Hardcut";
import { hardcutSchema } from "./schema";
import { defaults } from "./defaults";
import { RuntimeCheck } from "./RuntimeCheck";

/**
 * One composition. `durationInFrames` is absent on purpose — hardcutMetadata
 * sums the scene list, so changing a beat's `seconds` re-times the video with
 * no second edit.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Hardcut"
        component={Hardcut}
        schema={hardcutSchema}
        defaultProps={defaults}
        calculateMetadata={hardcutMetadata}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Smoke test for the GSAP / Anime / Motion seek adapters. Render frames
          0, 30 and 59 after upgrading any of them — a version bump can break
          seeking silently, and it looks just like "the animation didn't run". */}
      <Composition
        id="RuntimeCheck"
        component={RuntimeCheck}
        durationInFrames={60}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
