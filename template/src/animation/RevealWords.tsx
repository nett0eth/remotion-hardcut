import React from "react";
import { DUR, STAGGER } from "../design/motion";
import { TextReveal } from "./TextReveal";

/** Strips punctuation and case so `accentWords={["hook"]}` matches "hook," too. */
const normalize = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/**
 * A masked word-by-word reveal where chosen words come in the accent colour.
 *
 * Highlighting is a hierarchy tool, not decoration: one or two words per
 * headline. Three highlighted words in one line means none of them are.
 */
export const RevealWords: React.FC<{
  text: string;
  accentWords?: string[];
  accentColor: string;
  delay?: number;
  duration?: number;
  step?: number;
}> = ({
  text,
  accentWords = [],
  accentColor,
  delay = 0,
  duration = DUR.base,
  step = STAGGER.base,
}) => {
  const targets = accentWords.map(normalize);
  const words = text.split(" ");

  return (
    <>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <TextReveal
            text={word}
            mode="word"
            delay={delay + index * step}
            duration={duration}
            style={targets.includes(normalize(word)) ? { color: accentColor } : undefined}
          />
          {index < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </>
  );
};
