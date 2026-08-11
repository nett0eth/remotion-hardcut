import React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Series,
  staticFile,
  useVideoConfig,
  type CalculateMetadataFunction,
} from "remotion";
import { getPalette, withAccent } from "./design/theme";
import { HardcutScene, schemeFor } from "./scenes";
import type { HardcutProps } from "./schema";

export const Hardcut: React.FC<HardcutProps> = ({
  palette: paletteId,
  accentOverride,
  scheme,
  music,
  musicVolume,
  scenes,
}) => {
  const { fps } = useVideoConfig();
  const palette = withAccent(getPalette(paletteId), accentOverride);
  const baseDark = scheme === "dark";

  return (
    <AbsoluteFill>
      {/* Series, never TransitionSeries. The name of this template is the rule:
          a crossfade softens exactly the edge the format is built on. */}
      <Series>
        {scenes.map((scene, index) => (
          <Series.Sequence
            key={index}
            durationInFrames={Math.max(1, Math.round(scene.seconds * fps))}
          >
            <HardcutScene
              scene={scene}
              scheme={schemeFor(palette, scene.invert ? !baseDark : baseDark)}
            />
            {scene.vo ? <Audio src={staticFile(scene.vo)} /> : null}
          </Series.Sequence>
        ))}
      </Series>

      {music ? <Audio src={staticFile(music)} volume={musicVolume} loop /> : null}
    </AbsoluteFill>
  );
};

/** Duration is derived from the scene list. Never hardcode it. */
export const hardcutMetadata: CalculateMetadataFunction<HardcutProps> = ({ props }) => {
  const fps = 30;

  return {
    durationInFrames: Math.max(
      1,
      props.scenes.reduce((total, scene) => total + Math.round(scene.seconds * fps), 0),
    ),
    fps,
    width: 1920,
    height: 1080,
  };
};
