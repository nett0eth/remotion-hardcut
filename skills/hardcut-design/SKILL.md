---
name: hardcut-design
description: Visual direction for hardcut — colour, typography, contrast, and the taste rules that keep a frame from looking generated. Use when choosing a palette, when a video "looks AI-made or like a slide deck", when reviewing a rendered frame, or before shipping. Includes the critique rubric and the no-violet rule.
---

# hardcut design

Tokens live in `src/design/`. Taste lives here.

| File | Holds |
| --- | --- |
| `theme.ts` | palettes, type scale, spacing, radius, tracking |
| `motion.ts` | easing curves, frame durations, stagger steps, travel distances |
| `fonts.ts` | display / body / mono, and tabular figures |

**No literal colour, size or duration in scene code.** A hardcoded `#5B8CFF` will survive a
rebrand and nobody will find it. If a value is missing from the tokens, add it there.

## No violet, no magenta

Nothing in the 250°–340° hue band, in any slot — accent, mesh, gradient or series. Enforced
in `theme.ts` and not a per-video preference.

The purple-into-blue gradient and the magenta blob backdrop are the house style of every
AI-generated video on the internet. Using them makes the output read as templated no matter
how good the motion is. Blues, teals, greens, ambers and reds only. Brand violet goes
through `accentOverride` — a deliberate decision, not a default creeping back.

## The format's own rules

1. **Two colours and an accent.** The field, its ink, one accent. hardcut has no surfaces,
   no cards, no gradients except the CTA pill. Reducing the palette this hard is what lets
   the cuts do the work.
2. **Type fills the frame.** `bigtype` derives its size from the character count so the line
   reaches the edges. Comfortable margins are what a slide has.
3. **Tracking tightens as size grows.** `-0.045em` at display size. Default tracking on a
   400px headline is the single most common amateur tell.
4. **Body copy is 42px at 1080p, not 18.** Video is watched further away, often at half size
   in a feed, and there is no scrolling back. Anything under ~38px reads as a screenshot of
   a slide deck.
5. **One accent element per scene.** Two accents means neither is an accent.
6. **Hold long enough to read.** 0,4s per word, 1,5s floor. A beat that ends as the last
   word lands is a beat nobody read.
7. **Contrast against the brightest frame**, not the average. 4.5:1 for anything the viewer
   must read at speed.

## What makes a frame look generated

| Tell | Fix |
| --- | --- |
| Purple/magenta gradients and blobs | Banned in `theme.ts` |
| Everything centred, every scene | `align: "left"` on some `bigtype` scenes |
| Elements fading in with no travel | `FadeIn from="up"` — opacity alone is not an entrance |
| The same letter variant twelve times | Rotate `variant` between consecutive `bigtype` scenes |
| A blurry zoomed screenshot | Use `grid` instead, or shoot the asset at 2× |
| Text cropped mid-word by a camera push | Frame the whole line or no text at all |
| Uniform 1.2 line height | Display 0.92, body 1.4 |
| Emoji standing in for iconography | Cut them, or commit to a real icon set |
| Every scene the same length | Vary 1,2s / 3,8s / 6s — rhythm is structural |
| Drop shadows as a legibility crutch | Fix the contrast; shadows only over footage |

## Critique rubric

Render three stills — early, middle, late — and score each against this, one line per item
with a specific fix:

1. **Focus** — where does the eye land first? Is that the most important thing?
2. **Hierarchy** — can you rank the elements without reading them?
3. **Contrast** — does text clear 4.5:1 against the *brightest* frame behind it?
4. **Alignment** — shared edges, or things "roughly" placed?
5. **Density** — could a fifth be cut with nothing lost?
6. **Motion** — is anything moving that has no reason to?
7. **Continuity** — could this frame belong to a different video?

Report the two worst and fix those. Fixing all seven at once produces mush.

For a second opinion, run **`design-review`** — it critiques against the brief and the
codebase. It is written for web UI, so ignore its responsiveness and keyboard-navigation
sections; the hierarchy, consistency and aesthetic-fidelity passes transfer directly.

## Borrowing from the web-design skills

| Skill | Use it for | Ignore |
| --- | --- | --- |
| `high-end-visual-design` | Type scale, spacing rhythm, what makes a surface look expensive | Card / hover / nav patterns |
| `design-taste-frontend` | Inferring a direction from a brief instead of defaulting | Its audit-first redesign flow |
| `anti-ui-slop` / `ui-slop-score` | Generic-output diagnosis; scoring a rendered frame | Interaction, empty and loading states |
| `ui-radar` | Real-world visual references before committing | Anything about user flows |
| `design-tokens` | Building a palette from an aesthetic philosophy | Its CSS-variable output format — hardcut tokens are TS |
| `web-design-guidelines` | Contrast ratios only | Keyboard nav, focus rings, ARIA, breakpoints — none exist in a rendered video |
| `animate` (emilkowalski) | Its decision order: should it animate → what purpose → which property → which curve | Interruption and exit-on-user-action — a timeline is never interrupted |

**When they conflict with this skill, this skill wins on anything time-based** — duration,
stagger, hold length, easing — because it is calibrated in frames against a render, not
against a browser. They win on static composition and typographic judgement.

## Brand adaptation

1. `accentOverride` takes the primary brand colour. Leave the rest alone.
2. Swap the display font in `fonts.ts` — the biggest single lever.
3. Check the brand accent against the field. Brand colours are picked for white backgrounds
   and frequently fail on black; lighten for text, keep the true colour for fills.
4. Leave the motion tokens alone. Brand is colour and type; motion is craft.
