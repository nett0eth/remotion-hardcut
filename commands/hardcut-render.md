---
description: Render stills, a preview, or the final MP4
argument-hint: [still | sweep | preview | final]
---

Render: $ARGUMENTS

Default to `sweep` — in this format, one still per scene is the check that actually catches
things.

**still** — one frame.

```bash
npx remotion still Hardcut out/check.png --frame=<n> --scale=0.42
```

`--frame` is zero-based. Render mid-scene, never on a cut.

**sweep** — one still per scene. Compute each scene's midpoint by accumulating
`seconds × 30` down the `scenes` array, render them all, and **look at every one**. A
camera framing empty backdrop, a flat waveform, a grid tile overflowing and text cropped
mid-word have all shipped and were only caught this way.

**preview** — fast pass to judge pacing.

```bash
npx remotion render Hardcut out/preview.mp4 --scale=0.5 --jpeg-quality=70
```

Watch it for rhythm, not for detail: any scene that feels long is long.

**final**

```bash
npx remotion render Hardcut out/video.mp4 --crf=18
```

Add `--codec=h264` for social platforms. For a transparent overlay,
`--codec=vp8 --pixel-format=yuva420p` with a `.webm` extension.

Afterwards report the output path, duration and file size. If a render fails, read the
actual error first — the usual causes are a missing file in `public/`, a `delayRender()`
that never continued, and a wrong composition id.
