---
name: hardcut-script
description: Write the beat sheet for a hardcut video — hook, cut list, on-screen copy, terminal contents, and a per-scene frame budget written to SCRIPT.md. Use when asked for a roteiro, script, storyboard or beat sheet for a video, or when a hardcut build starts without one. Pairs with grill-me for stress-testing the concept first.
---

# hardcut script

The edit is decided here, not in the composition. Rewriting copy after fourteen scenes exist
costs ten times more than getting the beat sheet right.

## Before writing: get grilled

If the brief is a sentence and a hope, run **`grill-me`** first. It interviews down each
branch until the concept is actually resolved, and it will answer from the codebase rather
than asking when it can. Skip it only when the user arrives with a clear, specific idea.

The three questions that must have answers before a beat sheet exists:

- **What does the viewer do differently afterwards?** If the answer is "know about it",
  the video has no ending.
- **What is the one claim?** A hardcut carries one. Two claims is two videos.
- **What proof exists?** A terminal beat needs a real command. A `shot` needs real footage.
  Without either, the video is assertions in big type.

Then ask only what is still missing: duration cap, language, voiceover or silent, assets.

## Output: `SCRIPT.md`

```markdown
# <title>

- **Formato:** hardcut · 1920×1080 @ 30fps
- **Alvo:** 38s (1140 frames)
- **Locução:** não
- **Idioma:** pt-BR
- **Esquema:** dark, com 4 flips

| # | Beat | Cena | Segundos | Frames | Variante |
|---|------|------|----------|--------|----------|
| 1 | Abertura | sting | 1,3 | 39 | — |
| 2 | Promessa | bigtype | 1,2 | 36 | pop |
| … | | | | | |
| | **Total** | | **38,0** | **1140** | |

---

## 2 — Promessa · bigtype · 1,2s · pop

**Na tela:** Roteiro.
**Motion:** `pop`, stagger 2f. Esquema base.
**Porquê:** primeira das três palavras que definem o produto. Uma por corte.
```

Every beat block carries **Na tela**, **Motion**, **Porquê**. The "porquê" line is what stops
a beat surviving into the edit just because it was written.

For `terminal` beats, write the full line list — command, output, pauses — in the block. The
build step copies it verbatim.

## Timing

- **On-screen only, no VO:** 0,4s per word, 1,5s floor. A four-word `bigtype` is 1,6s.
- **With VO:** the audio decides. Write the estimate, then replace it with the measured
  duration after `/hardcut-voice` runs.
- **Terminal beats:** command length ÷ chars-per-second, plus every `pause`, plus 1s to read
  the final line. A 4-line terminal is rarely under 5s.
- **Hook:** the first claim lands inside 2s or the line is wrong.
- Round to whole frames.

## Structure

Opening sting → three-beat triplet → proof (terminal) → the turn → payoff → end card.

The **triplet** is the format's engine: three one-word `bigtype` scenes in a row, each with a
different variant, each 1,2–1,5s. "Roteiro. Template. Render." Use it once, early.

The **turn** is a single question or reversal on an inverted field, right before the second
proof beat. It is the only place the video slows down.

## Copy

- One idea per beat, four words per `bigtype`.
- No beat that only exists to fill time. Cut it and shorten the video.
- Terminal output must be output you could actually produce. Inventing a plausible log is
  the fastest way to lose someone who tries the command.
- End on the name and the command, nothing else.

## Handing off

Show the beat table and get approval on **structure, count and duration** before writing the
blocks in full. Then `hardcut-format` turns each beat into a scene entry.
