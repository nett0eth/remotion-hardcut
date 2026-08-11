/**
 * Narration presets keyed by what the video is *for*.
 *
 * Emotion in TTS comes from three places, in descending order of impact:
 *   1. the words themselves — a flat script reads flat no matter the settings
 *   2. `stability` — low lets the model act, high keeps it consistent
 *   3. audio tags like `[excited]` — Eleven v3 only, ignored by v2 models
 *
 * `style` above ~0.45 starts adding artefacts and slows generation. It is a
 * seasoning, not a dial to max out.
 */

export type VoiceObjective =
  | "explain"
  | "launch"
  | "social-hook"
  | "data-report"
  | "tutorial"
  | "story";

export type VoicePreset = {
  /** One line on what this sounds like. */
  character: string;
  /**
   * `eleven_multilingual_v2` — stable, fast, excellent pt-BR, no audio tags.
   * `eleven_v3` — expressive, responds to audio tags, less predictable.
   */
  modelId: "eleven_multilingual_v2" | "eleven_v3";
  voiceSettings: {
    /**
     * v2: continuous 0-1. v3: use 0.0 (Creative), 0.5 (Natural) or 1.0 (Robust).
     * Lower = more emotional range and more variance between takes.
     */
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
    speed: number;
  };
  /**
   * Audio tags prepended to each line. Eleven v3 only — on v2 they are read
   * aloud as literal text, which is why the generator strips them by model.
   */
  tags: string[];
  /** Words per second this delivery lands at. Cross-check the script's beat timings. */
  wordsPerSecond: number;
  /** What to change in the writing, not the settings. */
  writingNote: string;
};

export const voicePresets: Record<VoiceObjective, VoicePreset> = {
  explain: {
    character: "Calm authority. Confident, unhurried, never selling.",
    modelId: "eleven_multilingual_v2",
    voiceSettings: {
      stability: 0.55,
      similarity_boost: 0.75,
      style: 0.2,
      use_speaker_boost: true,
      speed: 1.0,
    },
    tags: [],
    wordsPerSecond: 2.5,
    writingNote:
      "Short declaratives. One idea per sentence. The pauses do the emphasis, so write the pauses in as line breaks.",
  },

  launch: {
    character: "Energised but controlled. Believes it, is not shouting about it.",
    modelId: "eleven_v3",
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.35,
      use_speaker_boost: true,
      speed: 1.05,
    },
    tags: ["[confident]"],
    wordsPerSecond: 2.7,
    writingNote:
      "Lead with the change, not the feature. Verbs over adjectives — 'ships in one command' beats 'incredibly fast'.",
  },

  "social-hook": {
    character: "High energy, direct address, zero preamble.",
    modelId: "eleven_v3",
    voiceSettings: {
      stability: 0.0,
      similarity_boost: 0.8,
      style: 0.45,
      use_speaker_boost: true,
      speed: 1.12,
    },
    tags: ["[excited]"],
    wordsPerSecond: 3.2,
    writingNote:
      "Second person. Contractions. First line is a claim or a question, never context. Under 12 words per line.",
  },

  "data-report": {
    character: "Neutral analyst. Precise, low affect, lets the numbers land.",
    modelId: "eleven_multilingual_v2",
    voiceSettings: {
      stability: 0.75,
      similarity_boost: 0.7,
      style: 0.05,
      use_speaker_boost: true,
      speed: 0.97,
    },
    tags: [],
    wordsPerSecond: 2.3,
    writingNote:
      "Say the number, then what it means. Never dramatise a figure with the voice — if it is impressive, the figure is doing that.",
  },

  tutorial: {
    character: "Patient and friendly. Sounds like it wants you to succeed.",
    modelId: "eleven_multilingual_v2",
    voiceSettings: {
      stability: 0.6,
      similarity_boost: 0.75,
      style: 0.15,
      use_speaker_boost: true,
      speed: 0.95,
    },
    tags: [],
    wordsPerSecond: 2.2,
    writingNote:
      "Imperatives with the reason attached. 'Open the config — this is where the fps lives.' Slower than it feels on the page.",
  },

  story: {
    character: "Warm and intimate. Close-mic, conversational.",
    modelId: "eleven_v3",
    voiceSettings: {
      stability: 0.5,
      similarity_boost: 0.85,
      style: 0.3,
      use_speaker_boost: true,
      speed: 0.95,
    },
    tags: ["[warm]"],
    wordsPerSecond: 2.4,
    writingNote:
      "Write it the way you would say it to one person. Sentence fragments are fine. Let a beat breathe before the turn.",
  },
};

/** Which preset each template category defaults to. */
export const objectiveForTemplate = {
  Explainer: "explain",
  Short: "social-hook",
  DataStory: "data-report",
} as const satisfies Record<string, VoiceObjective>;

/**
 * Per-line emotion override. Drop one of these on a single beat when it needs
 * to break from the preset — the turn in the story, the punchline, the warning.
 * Eleven v3 only.
 */
export const emphasisTags = {
  excited: "[excited]",
  serious: "[serious]",
  curious: "[curious]",
  whisper: "[whispers]",
  laugh: "[laughs]",
  sigh: "[sighs]",
  sarcastic: "[sarcastic]",
  pause: "[pause]",
} as const;

export type EmphasisTag = keyof typeof emphasisTags;
