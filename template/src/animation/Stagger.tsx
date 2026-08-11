import React from "react";
import { STAGGER } from "../design/motion";

/**
 * Gives each child an increasing delay. Children receive `delay` as a prop, so
 * they must be preset components that accept one (FadeIn, ScalePop, TextReveal…).
 *
 * Stagger is what separates motion design from "things fading in". Use it on any
 * group of three or more siblings.
 */
export const Stagger: React.FC<{
  children: React.ReactNode;
  delay?: number;
  step?: number;
  /** Reverse order — last child animates first. Useful for exits and bottom-anchored lists. */
  reverse?: boolean;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, step = STAGGER.base, reverse = false, style }) => {
  const items = React.Children.toArray(children);
  const ordered = reverse ? [...items].reverse() : items;

  return (
    <div style={style}>
      {ordered.map((child, index) => {
        if (!React.isValidElement(child)) {
          return child;
        }
        return React.cloneElement(child as React.ReactElement<{ delay?: number }>, {
          key: child.key ?? index,
          delay: delay + index * step,
        });
      })}
    </div>
  );
};
