import type { ComponentType } from "react";
import type { PreviewProps } from "./setup";
import { CounterPreview, FadeInPreview, StaggerPreview, TimelinePreview } from "./basics";
import {
  HorizontalScrollPreview,
  ParallaxPreview,
  PinSectionPreview,
  ScrollProgressPreview,
  ScrollRevealPreview,
} from "./scroll";
import { DrawSvgPreview, MarqueePreview, SplitTextPreview } from "./text";
import { DraggablePreview, FlipPreview, MagneticPreview } from "./interaction";

/** preview id (from the snippet JSON) → live preview component. */
export const previews: Record<string, ComponentType<PreviewProps>> = {
  "fade-in": FadeInPreview,
  stagger: StaggerPreview,
  timeline: TimelinePreview,
  counter: CounterPreview,
  "scroll-reveal": ScrollRevealPreview,
  "scroll-progress": ScrollProgressPreview,
  "pin-section": PinSectionPreview,
  "horizontal-scroll": HorizontalScrollPreview,
  parallax: ParallaxPreview,
  "split-text": SplitTextPreview,
  "draw-svg": DrawSvgPreview,
  marquee: MarqueePreview,
  flip: FlipPreview,
  draggable: DraggablePreview,
  magnetic: MagneticPreview,
};

/** Previews that replay on their own when params change (no Replay button needed). */
export const interactive = new Set(["flip", "draggable", "magnetic", "marquee"]);
