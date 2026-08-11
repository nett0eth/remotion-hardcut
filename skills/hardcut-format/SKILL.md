---
name: hardcut-format
description: The hardcut video format — hard cuts, giant kinetic type, inverted flips, camera pushes, a typing terminal, and ElevenLabs narration. Use when creating a video, promo, teaser, launch clip or explainer with this plugin, when scaffolding the Remotion project, or when turning a SCRIPT.md into scenes. Owns the eight scene types and the pacing rules.
---

# hardcut

One template. One grammar. The whole plugin is this format done properly rather than five
formats done adequately.

Raw Remotion API questions belong to `remotion-best-practices` — load it alongside this
whenever you write composition code. This skill owns the format.

## The five rules

1. **Hard cuts.** `<Series>`, never `<TransitionSeries>`. A crossfade softens exactly the
   edge the format is built on. This is not a preference; it is the name of the plugin.
2. **Scenes run 1.2–3.5s.** The two exceptions are `terminal`, which needs its command to
   finish typing, and `grid`, which needs its tiles to land. Read the seconds column on its
   own and it should look impatient.
3. **The scheme flips.** `invert: true` puts a scene on the opposite field. Flip three or
   four times across a video — it reads as a shutter and costs nothing.
4. **Two colours and an accent.** The format ignores surfaces and gradients. One accent
   element per scene, maximum.
5. **No two consecutive `bigtype` scenes share a `variant`.** A dozen identical letter
   reveals is the tell that a promo was generated rather than cut.

## The eight scene types

| Type | For | Holds |
| --- | --- | --- |
| `sting` | One mark on a full field. Opens or punctuates | 1.2–1.6s |
| `bigtype` | One to four words, set to bleed past the frame | 1.2–2.4s |
| `grid` | 2–8 labelled tiles, staggered. Vector, always crisp | 3.5–4.5s |
| `shot` | Full-bleed footage with a camera move | 1.8–2.5s |
| `terminal` | A command typing, with real output | 5–8s |
| `voice` | Mic pulse + waveform. The narration beat | 2.8–3.5s |
| `counter` | One number, huge, counting | 2–2.5s |
| `end` | The name and the command | 3–3.5s |

### `bigtype` sizing

Font size is derived from the character count so the line always reaches the frame edges.
`bleed` above 1.15 removes the padding and lets letters run off — that is the look. A
headline with comfortable margins reads as a slide.

Keep it to **four words**. `whiteSpace: nowrap` means a long string just shrinks, and a
20-character line at 1920 is no longer a hardcut, it is a subtitle.

### `shot` — the one that goes wrong

Only use footage or stills rendered at **twice the crop you intend**. A 1920 still pushed
to 1.6× is a 1200px source stretched over 1920 and it shows as mush. Screen recordings at
2560 or 3840 hold up; screenshots almost never do.

Two more failure modes, both learned the hard way:

- **Set `focus`.** A centred zoom finds only backdrop, because interfaces put their content
  on the left. `focus: "left"` more often than not.
- **Never crop text mid-word.** "…ention held through the migration" reads as broken, not
  as a stylish crop. Either frame the whole line or frame no text at all.

When in doubt, use `grid` instead — it is vector, it never softens, and it usually
communicates the same thing more directly than a blurry screenshot does.

### `terminal` — where the teaching happens

A command is the most compact honest proof a thing exists: the viewer sees the exact string
they would type and the exact output they would get, in order.

Line kinds: `command` (types out behind a prompt), `out` / `ok` / `dim`, `spin` (spinner
that resolves to `done`), `wave` (a live audio waveform with a duration on the right).

`pause` is in frames and is where the pacing is actually authored. Six frames of dead air
before a result line is the difference between a program running and a list appearing.

Cap at **10 lines**. Beyond that the type has to shrink and the shot stops reading.

## Pacing

Total runtime is derived — `hardcutMetadata` sums the scene list, so no composition ever
sets `durationInFrames`. Change a beat's `seconds` and the video re-times itself.

A 35–45s cut wants roughly: 1 sting, 5–7 bigtype, 2 terminal, 1–2 grid, 1 voice, 1 counter,
1 end. Fewer than 12 scenes and the format has nothing to cut between.

## Scaffolding

```
${CLAUDE_PLUGIN_ROOT}/template
```

Copy it to the target directory, `npm install`, then `npx remotion studio`. One composition:
`Hardcut`. Everything is in `src/defaults.ts` — copy lives in props, never in JSX.

## Verification, every time

`npx remotion still Hardcut --frame=<mid-scene> --scale=0.42` for **each scene you touched**.
This format hides its failures in motion: a `shot` framing empty backdrop, a `grid` tile
overflowing, a waveform sitting flat. Every one of those shipped at some point and was only
caught by looking at a frame.
