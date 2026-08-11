import type { HardcutProps } from "./schema";

/**
 * The plugin's own intro, and the reference edit for the format.
 *
 * Two rules drive it. **Rhythm**: nothing holds past 3.2s except the terminal
 * beats, which need their command to finish typing. **Variety**: no two
 * consecutive `bigtype` scenes share a `variant`, because a dozen identical
 * letter reveals is the tell that a promo was generated rather than cut.
 *
 * The terminal beats carry the teaching load — a command the viewer could type,
 * with the output they would actually get.
 */
export const defaults: HardcutProps = {
  palette: "midnight",
  scheme: "dark",
  musicVolume: 0.35,
  scenes: [
    { type: "sting", seconds: 1.3, invert: true, mark: "▮", caption: "remotion-hardcut" },

    { type: "bigtype", seconds: 1.3, invert: false, text: "Roteiro.", bleed: 1.25, typed: false, variant: "pop", align: "center", cut: "punch", vo: "vo/01-roteiro.mp3" },
    { type: "bigtype", seconds: 1.2, invert: false, text: "Template.", bleed: 1.25, typed: false, variant: "stretch", align: "center", cut: "left", vo: "vo/02-template.mp3" },
    { type: "bigtype", seconds: 1.7, invert: false, text: "Render.", bleed: 1.25, typed: false, variant: "blur", align: "center", cut: "right", vo: "vo/03-render.mp3" },

    {
      type: "terminal",
      seconds: 6.6,
      invert: false,
      cut: "rise",
      vo: "vo/04-terminal1.mp3",
      title: "bash — meu-video",
      charsPerSecond: 26,
      caption: "um comando, um projeto",
      lines: [
        { kind: "command", text: "claude /hardcut-new" },
        { kind: "dim", text: "  lendo SCRIPT.md — 14 beats, 38s", pause: 6 },
        { kind: "spin", text: "  montando o projeto", hold: 24, done: "  projeto montado" },
        { kind: "ok", text: "  ✓ 8 tipos de cena · corte seco · tokens" },
      ],
    },

    { type: "bigtype", seconds: 2.8, invert: true, text: "Um formato único.", bleed: 1, typed: false, variant: "mask", align: "center", cut: "flash", vo: "vo/05-formato.mp3" },

    {
      // Every tile is the real scene type at 20% scale, looping. Not a label in
      // a box — literally the same components the full video runs on.
      type: "showreel",
      seconds: 6.5,
      invert: false,
      cut: "rise",
      vo: "vo/06-showreel.mp3",
      heading: "Biblioteca de animações",
      columns: 4,
      loop: 60,
      items: [
        { kind: "bigtype", label: "bigtype", offset: 0, highlight: true },
        { kind: "sting", label: "sting", offset: 8, highlight: false },
        { kind: "grid", label: "grid", offset: 16, highlight: false },
        { kind: "shot", label: "shot", offset: 24, highlight: false },
        { kind: "terminal", label: "terminal", offset: 4, highlight: true },
        { kind: "voice", label: "voice", offset: 12, highlight: false },
        { kind: "counter", label: "counter", offset: 20, highlight: false },
        { kind: "end", label: "end", offset: 28, highlight: false },
      ],
    },

    {
      // `loop` is what makes this a demo instead of a list: each label replays
      // its own variant on a 50-frame cycle.
      type: "grid",
      seconds: 5,
      invert: true,
      vo: "vo/07-grid.mp3",
      heading: "Biblioteca de animação de texto",
      columns: 3,
      loop: 50,
      items: [
        { label: "pop", caption: "escala com overshoot", variant: "pop", highlight: false },
        { label: "stretch", caption: "esmaga e solta", variant: "stretch", highlight: false },
        { label: "blur", caption: "foco de lente", variant: "blur", highlight: false },
        { label: "scramble", caption: "resolve do ruído", variant: "scramble", highlight: true },
        { label: "mask", caption: "sobe atrás da borda", variant: "mask", highlight: false },
        { label: "line", caption: "linha inteira em bloco", variant: "line", highlight: false },
      ],
    },

    { type: "bigtype", seconds: 2.1, invert: false, text: "E a narração?", bleed: 1, typed: false, variant: "line", align: "center", cut: "left", vo: "vo/08-narracao.mp3" },

    {
      type: "terminal",
      seconds: 8,
      invert: false,
      cut: "rise",
      vo: "vo/09-terminal2.mp3",
      title: "bash — narração",
      charsPerSecond: 24,
      caption: "elevenlabs, uma emoção por objetivo",
      lines: [
        { kind: "command", text: "npm run voiceover" },
        { kind: "dim", text: "  objetivo: explain — autoridade calma", pause: 6 },
        { kind: "dim", text: "  modelo: eleven_multilingual_v2 · stability 0.55" },
        { kind: "wave", text: "01-hook", meta: "2.4s", pause: 4 },
        { kind: "wave", text: "02-problema", meta: "3.1s", pause: 6 },
        { kind: "wave", text: "03-mecanismo", meta: "4.0s", pause: 6 },
        { kind: "ok", text: "  ✓ 3 faixas · as cenas se recronometram", pause: 6 },
      ],
    },

    {
      // The waveform in this scene is driven by this very file, so the bars are
      // the narration itself rather than a decoration.
      type: "voice",
      seconds: 4.6,
      invert: false,
      vo: "vo/10-voice.mp3",
      label: "Seis objetivos",
      preset: "explain · launch · social-hook · data-report · tutorial · story",
      caption: "cada um com modelo, stability e audio tags próprios",
    },

    { type: "counter", seconds: 2.8, invert: false, value: 11, label: "primitivas de motion", decimals: 0, cut: "punch", vo: "vo/11-counter.mp3" },

    {
      // Was a `bigtype` naming three libraries. Now each panel is animated by
      // the library it names, so the scene cannot claim an integration that is
      // broken — it would visibly freeze instead.
      type: "runtimes",
      seconds: 6.2,
      invert: false,
      cut: "rise",
      vo: "vo/12-runtimes.mp3",
      heading: "Bibliotecas de animação",
    },

    { type: "bigtype", seconds: 3.7, invert: true, text: "Sem gradiente roxo.", bleed: 1, typed: false, variant: "pop", align: "center", cut: "flash", vo: "vo/13-roxo.mp3" },

    {
      // 4.5s: the badge types the handle (~1s), the chips land, and the bell
      // gets two full ring cycles before the video ends.
      type: "end",
      seconds: 5.2,
      invert: false,
      vo: "vo/14-end.mp3",
      text: "remotion-hardcut",
      cta: "/hardcut-new",
      handle: "@nett0eth",
      avatar: "avatar.png",
    },
  ],
};
