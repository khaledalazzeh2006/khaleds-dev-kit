import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { ParamValue } from "@/lib/content/schema";

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  SplitText,
  Flip,
  Draggable,
  InertiaPlugin,
  DrawSVGPlugin,
);

export { gsap, useGSAP, ScrollTrigger, SplitText, Flip, Draggable };

export interface PreviewProps {
  p: Record<string, ParamValue>;
  /** Changes when the user presses Replay. */
  replay: number;
}

export const num = (v: ParamValue | undefined, fallback = 0) =>
  typeof v === "number" ? v : Number(v) || fallback;
export const str = (v: ParamValue | undefined, fallback = "") =>
  v === undefined ? fallback : String(v);
