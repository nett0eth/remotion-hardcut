---
description: Generate ElevenLabs narration with an emotion preset matched to the video's objective
argument-hint: [explain | launch | social-hook | data-report | tutorial | story]
---

Generate the narration. Objective: $ARGUMENTS

**The API key.** The script reads `ELEVENLABS_API_KEY` from the environment. Never ask the
user to paste a key into the chat and never write one into a file. If it is unset, tell them
to set it in their own shell and stop:

```bash
export ELEVENLABS_API_KEY=sk-...
```

PowerShell: `$env:ELEVENLABS_API_KEY = "sk-..."`

**1 · Objective.** Use the argument, or infer and confirm:

| Objective | Sounds like |
| --- | --- |
| `explain` | Calm authority, unhurried |
| `launch` | Energised but controlled |
| `social-hook` | High energy, direct address |
| `data-report` | Neutral analyst, low affect |
| `tutorial` | Patient and friendly |
| `story` | Warm, close-mic |

Presets are in `scripts/voice-presets.ts` — model, stability, style, speed, audio tags, and a
`writingNote` saying what to change in the *copy* for that delivery. Apply the note to the
script before generating. Settings cannot rescue flat writing.

**2 · Voice id.** Ask, or list what the account has:

```bash
curl -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices
```

Set it in `scripts/voiceover.config.ts`.

**3 · Fill the config.** One `lines` entry per narrated beat, ids matching the beat numbers
(`01-hook`, `02-problema`). Ids are filenames — keep them stable so a copy edit only
regenerates the line that changed. Add `emphasis` to one or two lines that must break from
the preset; tags only work on `eleven_v3` and are stripped automatically elsewhere.

**4 · Generate.**

```bash
npm run voiceover
```

`--only <id>` for one line, `--force` to overwrite. Existing audio is skipped by default.

**5 · Re-time.** The script prints each line's real duration, already padded with 0,5s of
air at both ends. Copy them into the scenes' `seconds` and set each scene's `vo`. **The
audio is now the source of truth for timing, not the estimate in SCRIPT.md** — update the
beat table too, so the two do not drift.

If the script warns that runtime is far off the preset's words-per-second, cut words.
`speed` past ~1.15 sounds rushed, not fast.

**6 · Listen.** Render a preview with audio and actually play it. Check for a line clipped
by a cut, VO finishing before the visual, and music drowning the voice — `musicVolume` above
0.15 fights narration.
