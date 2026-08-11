---
description: Make a hardcut video end to end — grill, script, scaffold, build, review, render
argument-hint: [brief, e.g. "35s promo for our CLI"]
---

Make a hardcut video: $ARGUMENTS

Eight phases. Announce each one before you start it and confirm before moving on — this is a
guided flow, not a batch job. Do not skip phase 1 or 6.

**1 · Grill** — if the brief is one line, run `grill-me` to resolve the concept: what the
viewer does differently afterwards, what the single claim is, and what real proof exists
(a runnable command, real footage). Skip only if the user arrives with something specific.

**2 · Script** — load `hardcut-script`. Write `SCRIPT.md`: beat table, then a block per beat
with **Na tela / Motion / Porquê**. Get approval on structure, count and duration before
writing the blocks in full.

**3 · Scaffold** — copy `${CLAUDE_PLUGIN_ROOT}/template` to the target directory, then:

```bash
npm install
```

**4 · Build** — load `hardcut-format` for the scene vocabulary, `hardcut-motion` for the
primitives, `hardcut-design` for tokens. Turn each beat into an entry in `src/defaults.ts`.
Copy goes in props, never in JSX. Never set `durationInFrames` — it is derived.

**5 · Voice** (optional) — if the video is narrated, run `/hardcut-voice` now, before
reviewing timing. The measured audio becomes the source of truth for every `seconds` value.

**6 · Frame check** — render a still mid-scene for **every** scene:

```bash
npx remotion still Hardcut out/s01.png --frame=<n> --scale=0.42
```

Look at all of them. This format hides its failures in motion — a camera framing empty
backdrop, a grid tile overflowing, a waveform sitting flat, text cropped mid-word. Each of
those has shipped before and only a frame caught it.

**7 · Design pass** — run the critique rubric in `hardcut-design` on three stills. Fix the
two worst findings, not all seven. For a second opinion run `design-review`, ignoring its
web-only sections.

**8 · Render**

```bash
npx remotion studio
```

then `/hardcut-render final` when the user is happy.

Report the total duration against the script's budget, and say plainly what is still missing
— music and narration usually are.
