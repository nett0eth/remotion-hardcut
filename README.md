# remotion-hardcut

One video template, done properly.

Hard cuts, giant kinetic type, inverted light/dark flips, a camera that pushes into cropped
footage, a terminal that actually types, and ElevenLabs narration with an emotion preset per
objective. Brief in, rendered MP4 out.

The name is the rule: `<Series>`, never `<TransitionSeries>`. A crossfade softens exactly
the edge the format is built on.

## Install

```bash
/plugin install remotion-hardcut
```

Or copy the folder into `~/.claude/plugins/` and restart Claude Code.

## Commands

| Command | What it does |
| --- | --- |
| `/hardcut-new` | Full flow: grill → script → scaffold → build → voice → frame check → design pass → render |
| `/hardcut-script` | Writes/refines `SCRIPT.md` only |
| `/hardcut-voice` | ElevenLabs narration, then re-times the scenes to the real audio |
| `/hardcut-render` | Stills, a per-scene sweep, a preview, or the final MP4 |

## Skills

| Skill | Owns |
| --- | --- |
| `hardcut-format` | The eight scene types, the five rules, pacing, scaffolding |
| `hardcut-script` | Beat sheets, timing maths, structure |
| `hardcut-motion` | Primitives, camera, terminal, GSAP/Anime/Lottie adapters |
| `hardcut-design` | Palette, type, contrast, the critique rubric |

They compose with `remotion-best-practices`, which stays the authority on the Remotion API.

## The eight scene types

`sting` · `bigtype` · `grid` · `shot` · `terminal` · `voice` · `counter` · `end`

Every one is driven by props in `src/defaults.ts`. Copy never lives in JSX, and no
composition sets `durationInFrames` — `hardcutMetadata` sums the scene list, so changing a
beat's `seconds` re-times the video.

## Six letter variants

`mask` · `pop` · `stretch` · `blur` · `scramble` · `line`

Rotate them between consecutive `bigtype` scenes. A dozen identical reveals is the tell that
a promo was generated rather than cut. `scramble` hashes `(index, frame)` rather than calling
`Math.random`, so every render worker resolves the same letters.

## Third-party libraries

| Library | How it is wired |
| --- | --- |
| **GSAP** | `useGsapTimeline` — paused timeline, seeked to `frame / fps` |
| **Anime.js v4** | `useAnimeTimeline` — `autoplay: false` + `seek(ms)` |
| **Motion** (motion.dev) | `useMotionSequence` — sequence paused on creation, `controls.time` set per frame |
| **Lottie** | `LottieAsset`, fed by Jitter exports or the `text-to-lottie` skill |
| **react-bits** | Installed as source via `jsrepo`, then ported off RAF and CSS transitions |
| **Fluid motion** | `FluidBackdrop`, stateless and noise-driven |

All three animation libraries run on their own RAF clock; Remotion has none. Unseeked, they
render one frozen frame or black. Each adapter builds the timeline paused and seeks it per
frame.

**This is verified, not asserted.** The `RuntimeCheck` composition animates one bar per
library linearly over two seconds against a frame-driven control bar. At frames 15 and 45
all four bars are identical. Re-render it after any runtime upgrade — a version bump can
break seeking silently, and the failure looks like "the animation didn't run".

## Companion skills

Installed separately with `npx skills add`. `hardcut-design` and `hardcut-script` carry the
tables of what transfers to video and what does not.

`grill-me` and `design-review` are wired into `/hardcut-new` directly — grilling before the
beat sheet, reviewing after the build. The rest of `designer-skills`, plus `anti-ui-slop`,
`ui-slop-score`, `ui-radar`, `high-end-visual-design` and `animate`, inform the design skill.

## Design constraint: no violet, no magenta

Nothing in the 250°–340° hue band ships in any palette slot, enforced in `theme.ts`. The
purple-into-blue gradient is the house style of AI-generated video and makes good motion
read as templated. Brand violet goes through `accentOverride`.

## Layout

```
remotion-hardcut/
├── .claude-plugin/plugin.json
├── commands/            four slash commands
├── skills/              four skills
└── template/
    ├── scripts/         voiceover generator + emotion presets
    └── src/
        ├── design/      tokens
        ├── animation/   primitives
        ├── components/  Terminal, VoiceWave, backdrops
        ├── runtimes/    GSAP / Anime / Lottie adapters
        ├── schema.ts    the eight scene types
        ├── scenes.tsx   how each one renders
        └── defaults.ts  the video
```
