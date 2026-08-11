import type { EmphasisTag, VoiceObjective } from "./voice-presets.ts";

/**
 * The narration script. One entry per beat in SCRIPT.md, in order.
 *
 * `id` becomes the filename, so keep it stable — regenerating one line should
 * not invalidate the others. Renaming an id costs a re-render of that line only.
 */
export type VoiceLine = {
  id: string;
  text: string;
  /** Overrides the preset's emotion for this line alone. Eleven v3 only. */
  emphasis?: EmphasisTag;
};

export type VoiceoverConfig = {
  /** Output folder under public/ — keep one per composition. */
  compositionId: string;
  /** Drives the preset in src/design/voice.ts. */
  objective: VoiceObjective;
  /**
   * ElevenLabs voice id. Find yours at elevenlabs.io/app/voice-library, or
   * `GET https://api.elevenlabs.io/v1/voices` with your key.
   */
  voiceId: string;
  /** Overrides individual preset settings when a voice needs its own tuning. */
  overrides?: Partial<{
    stability: number;
    similarity_boost: number;
    style: number;
    speed: number;
  }>;
  lines: VoiceLine[];
};

export const voiceoverConfig: VoiceoverConfig = {
  compositionId: "Explainer",
  objective: "explain",
  voiceId: "REPLACE_WITH_VOICE_ID",
  lines: [
    {
      id: "01-hook",
      text: "Editing a forty second video used to cost an afternoon.",
    },
    {
      id: "02-problem",
      text: "Not because the editing is hard. Because every change means redoing the timing.",
    },
    {
      id: "03-mechanism",
      text: "So the script decides the timing. Every beat carries its own duration, in frames.",
      emphasis: "serious",
    },
    {
      id: "04-proof",
      text: "Change a line, and the video re-times itself. Nothing else moves.",
    },
    {
      id: "05-cta",
      text: "Start from a script.",
    },
  ],
};
