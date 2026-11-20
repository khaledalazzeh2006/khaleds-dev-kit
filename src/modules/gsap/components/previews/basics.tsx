import { useRef } from "react";
import { gsap, num, str, useGSAP, type PreviewProps } from "./setup";
import { Stage } from "./stage";

export function FadeInPreview({ p, replay }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".box", {
        y: num(p.y),
        opacity: 0,
        duration: num(p.duration, 1),
        ease: str(p.ease),
      });
    },
    { scope: ref, dependencies: [p, replay], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref}>
      <div className="box flex size-24 items-center justify-center rounded-xl bg-primary font-medium text-primary-foreground">
        Hello
      </div>
    </Stage>
  );
}

export function StaggerPreview({ p, replay }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      gsap.from(".item", {
        y: num(p.y),
        opacity: 0,
        duration: num(p.duration, 1),
        ease: str(p.ease),
        stagger: num(p.stagger),
      });
    },
    { scope: ref, dependencies: [p, replay], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref} className="gap-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="item size-12 rounded-lg bg-primary" />
      ))}
    </Stage>
  );
}

export function TimelinePreview({ p, replay }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const o = `-=${num(p.overlap)}`;
      gsap
        .timeline({ defaults: { duration: num(p.duration, 0.7), ease: str(p.ease) } })
        .from(".title", { y: 40, opacity: 0 })
        .from(".subtitle", { y: 20, opacity: 0 }, o)
        .from(".cta", { scale: 0.8, opacity: 0 }, o);
    },
    { scope: ref, dependencies: [p, replay], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref} className="flex-col gap-2">
      <h3 className="title text-2xl font-semibold">Build faster</h3>
      <p className="subtitle text-muted-foreground">Everything in one place.</p>
      <span className="cta mt-2 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground">
        Get started
      </span>
    </Stage>
  );
}

export function CounterPreview({ p, replay }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const el = ref.current!.querySelector(".count")!;
      const counter = { value: 0 };
      gsap.to(counter, {
        value: num(p.end, 1000),
        duration: num(p.duration, 2),
        ease: str(p.ease),
        onUpdate: () => {
          el.textContent = Math.round(counter.value).toLocaleString("en");
        },
      });
    },
    { scope: ref, dependencies: [p, replay], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref} className="flex-col">
      <span className="count font-mono text-5xl font-semibold tabular-nums">0</span>
      <span className="text-xs text-muted-foreground">happy users</span>
    </Stage>
  );
}
