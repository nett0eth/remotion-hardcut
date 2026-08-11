/**
 * Generates one MP3 per narration line with ElevenLabs, applying the emotion
 * preset for the video's objective, and writes a manifest with the measured
 * duration of each line.
 *
 *   node --strip-types scripts/generate-voiceover.ts
 *   node --strip-types scripts/generate-voiceover.ts --only 03-mechanism
 *   node --strip-types scripts/generate-voiceover.ts --force
 *
 * Requires ELEVENLABS_API_KEY in the environment. The script never reads a key
 * from a file or an argument — set it in your own shell.
 *
 * Existing files are skipped unless --force, so regenerating after a copy edit
 * only costs the lines that changed.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emphasisTags, voicePresets } from "./voice-presets.ts";
import { voiceoverConfig } from "./voiceover.config.ts";

const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.error(
    "ELEVENLABS_API_KEY is not set.\n\n" +
      "  PowerShell:  $env:ELEVENLABS_API_KEY = \"sk-...\"\n" +
      "  bash/zsh:    export ELEVENLABS_API_KEY=sk-...\n\n" +
      "Get a key at https://elevenlabs.io/app/settings/api-keys",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIndex = args.indexOf("--only");
const only = onlyIndex === -1 ? null : args[onlyIndex + 1];

const { compositionId, objective, voiceId, overrides, lines } = voiceoverConfig;

if (voiceId === "REPLACE_WITH_VOICE_ID") {
  console.error(
    "Set `voiceId` in scripts/voiceover.config.ts.\n" +
      "List your voices:  curl -H \"xi-api-key: $ELEVENLABS_API_KEY\" https://api.elevenlabs.io/v1/voices",
  );
  process.exit(1);
}

const preset = voicePresets[objective];
const settings = { ...preset.voiceSettings, ...overrides };
const supportsTags = preset.modelId === "eleven_v3";

const outDir = join("public", "voiceover", compositionId);
mkdirSync(outDir, { recursive: true });

console.log(`Objective : ${objective} — ${preset.character}`);
console.log(`Model     : ${preset.modelId}${supportsTags ? "" : " (audio tags stripped)"}`);
console.log(`Settings  : stability ${settings.stability}, style ${settings.style}, speed ${settings.speed}`);
console.log("");

/**
 * v2 models read bracketed tags aloud as literal words, so they are only
 * attached when the model can act on them.
 */
const buildText = (text: string, emphasis?: keyof typeof emphasisTags) => {
  if (!supportsTags) {
    return text;
  }
  const tags = [...preset.tags];
  if (emphasis) {
    tags.push(emphasisTags[emphasis]);
  }
  return tags.length > 0 ? `${tags.join(" ")} ${text}` : text;
};

const measure = async (path: string): Promise<number | null> => {
  try {
    const { parseMedia } = await import("@remotion/media-parser");
    const { nodeReader } = await import("@remotion/media-parser/node");
    const { durationInSeconds } = await parseMedia({
      src: path,
      fields: { durationInSeconds: true },
      reader: nodeReader,
    });
    return durationInSeconds;
  } catch {
    // Not fatal — the manifest just carries null and calculateMetadata can
    // measure at render time instead.
    return null;
  }
};

type ManifestEntry = {
  id: string;
  file: string;
  text: string;
  durationInSeconds: number | null;
  seconds: number | null;
};

const manifest: ManifestEntry[] = [];

for (const line of lines) {
  const file = `voiceover/${compositionId}/${line.id}.mp3`;
  const path = join("public", "voiceover", compositionId, `${line.id}.mp3`);

  if (only && line.id !== only) {
    if (existsSync(path)) {
      manifest.push({
        id: line.id,
        file,
        text: line.text,
        durationInSeconds: await measure(path),
        seconds: null,
      });
    }
    continue;
  }

  if (existsSync(path) && !force) {
    console.log(`skip   ${line.id}  (exists — use --force to regenerate)`);
    const durationInSeconds = await measure(path);
    manifest.push({ id: line.id, file, text: line.text, durationInSeconds, seconds: null });
    continue;
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: buildText(line.text, line.emphasis),
        model_id: preset.modelId,
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
          style: settings.style,
          use_speaker_boost: settings.use_speaker_boost,
          speed: settings.speed,
        },
      }),
    },
  );

  if (!response.ok) {
    console.error(`\nFAILED ${line.id} — HTTP ${response.status}`);
    console.error(await response.text());
    process.exit(1);
  }

  writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  const durationInSeconds = await measure(path);

  console.log(
    `write  ${line.id}  ${durationInSeconds ? `${durationInSeconds.toFixed(2)}s` : "?"}`,
  );
  manifest.push({ id: line.id, file, text: line.text, durationInSeconds, seconds: null });
}

for (const entry of manifest) {
  // Half a second of air at each end, matching the video-script timing rule.
  entry.seconds = entry.durationInSeconds
    ? Math.round((entry.durationInSeconds + 1) * 100) / 100
    : null;
}

const manifestPath = join("public", "voiceover", compositionId, "manifest.json");
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`\nmanifest  ${manifestPath}`);
console.log("\nScene durations to copy into defaults.ts:");
for (const entry of manifest) {
  console.log(`  ${entry.id.padEnd(18)} seconds: ${entry.seconds ?? "?"}`);
}

const total = manifest.reduce((sum, entry) => sum + (entry.seconds ?? 0), 0);
console.log(`\nTotal narrated runtime: ${total.toFixed(1)}s`);

// Warn when the written copy fights the preset's delivery speed.
const words = lines.reduce((sum, line) => sum + line.text.split(/\s+/).length, 0);
const expected = words / preset.wordsPerSecond;
if (total > 0 && Math.abs(total - expected) / expected > 0.25) {
  console.log(
    `\nNote: the ${objective} preset delivers ~${preset.wordsPerSecond} words/s, which puts ` +
      `${words} words at ~${expected.toFixed(0)}s. The real audio is ${total.toFixed(0)}s. ` +
      `If that is too slow, the fix is usually fewer words, not a faster speed setting.`,
  );
}

// Keep the manifest from silently drifting out of sync with the config.
const configPath = join("scripts", "voiceover.config.ts");
if (existsSync(configPath)) {
  const configText = readFileSync(configPath, "utf8");
  const missing = manifest.filter((entry) => !configText.includes(entry.id));
  if (missing.length > 0) {
    console.log(`\nOrphaned audio (no longer in the config): ${missing.map((m) => m.id).join(", ")}`);
  }
}
