# hardcut template

```bash
npm install
npx remotion studio
```

One composition: `Hardcut`, 1920×1080 @ 30fps.

## Layout

```
scripts/          voiceover generator, emotion presets, narration config
src/
├── design/       tokens — theme.ts, motion.ts, fonts.ts
├── animation/    primitives — KineticText, Camera, FadeIn, CountUp, DrawPath…
├── components/   Terminal, VoiceWave, MicPulse, backdrops
├── runtimes/     deterministic adapters for GSAP, Anime.js and Lottie
├── schema.ts     the eight scene types
├── scenes.tsx    how each one renders
└── defaults.ts   the video itself
```

## The three rules

**1 · Copy lives in props.** Everything is in `defaults.ts`, validated by a zod schema and
editable in Studio. Nothing readable is hardcoded in JSX.

**2 · Duration is derived.** No `durationInFrames` anywhere. `hardcutMetadata` sums the
scene list — change a beat's `seconds` and the video re-times itself.

**3 · Hard cuts.** `<Series>`, never `<TransitionSeries>`.

## Narration

```bash
export ELEVENLABS_API_KEY=sk-...     # your shell, not a file
npm run voiceover                     # --only <id> | --force
```

Edit `scripts/voiceover.config.ts` (objective, voice id, one line per beat). Presets are in
`scripts/voice-presets.ts`. Output lands in `public/voiceover/<id>.mp3` with a
`manifest.json` of measured durations — copy those into each scene's `seconds` and set `vo`.

## Rendering

```bash
npx remotion still Hardcut out/check.png --frame=470 --scale=0.42
npx remotion render Hardcut out/video.mp4 --crf=18
```

Render a still per scene before the final. This format hides its failures in motion.

## Assets

Everything in `public/`, referenced with `staticFile()`. For `shot` scenes, use sources at
**twice** the intended crop — a 1920 still pushed to 1.6× is a 1200px source over 1920 and
it shows.

## Third-party runtimes

Never call `gsap.to()` or `animate()` directly in a composition. Use `useGsapTimeline` /
`useAnimeTimeline` from `src/runtimes/`, which build the timeline paused and seek it to the
current frame. CSS transitions, CSS `animation`, `setTimeout` and `requestAnimationFrame`
will not render.
