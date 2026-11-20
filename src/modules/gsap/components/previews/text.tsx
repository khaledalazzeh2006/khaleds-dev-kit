import { useRef } from "react";
import { gsap, num, SplitText, str, useGSAP, type PreviewProps } from "./setup";
import { Stage } from "./stage";

export function SplitTextPreview({ p, replay }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const type = str(p.type, "chars") as "chars" | "words" | "lines";
      // Split words too, so lines only break between words.
      const split = SplitText.create(".headline", { type: `words, ${type}`, mask: type });
      gsap.from(split[type], {
        yPercent: 100,
        opacity: 0,
        duration: num(p.duration, 0.7),
        ease: str(p.ease),
        stagger: num(p.stagger),
      });
    },
    { scope: ref, dependencies: [p, replay], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref} className="px-8">
      <h3 className="headline text-center text-4xl leading-tight font-bold">Design that moves</h3>
    </Stage>
  );
}

export function DrawSvgPreview({ p, replay }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".logo path", {
        drawSVG: 0,
        duration: num(p.duration, 1.5),
        ease: str(p.ease),
        stagger: num(p.stagger),
      });
    },
    { scope: ref, dependencies: [p, replay], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref}>
      <svg
        className="logo size-40 text-primary"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 80 L50 12 L90 80 Z" />
        <circle cx="50" cy="58" r="14" />
        <path d="M30 92 H70" />
      </svg>
    </Stage>
  );
}

const WORDS = ["React", "GSAP", "Tailwind", "Three.js", "Next.js", "NestJS", "Prisma", "Tauri"];

export function MarqueePreview({ p, replay }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.to(".track", { xPercent: -50, duration: num(p.duration, 12), ease: "none", repeat: -1 });
    },
    { scope: ref, dependencies: [p, replay], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref} className="justify-start">
      <div className="track flex w-max gap-8 text-3xl font-semibold whitespace-nowrap">
        {[...WORDS, ...WORDS].map((w, i) => (
          <span key={i} className={i % 2 ? "text-primary" : ""}>
            {w}
          </span>
        ))}
      </div>
    </Stage>
  );
}
