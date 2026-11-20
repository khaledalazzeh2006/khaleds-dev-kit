import { useRef, useState } from "react";
import { Draggable, Flip, gsap, num, str, useGSAP, type PreviewProps } from "./setup";
import { Stage } from "./stage";
import { cn } from "@/lib/utils";

export function FlipPreview({ p }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [list, setList] = useState(false);
  const { contextSafe } = useGSAP({ scope: ref });

  const toggle = contextSafe(() => {
    const state = Flip.getState(".card");
    setList((l) => !l);
    // Wait for React to render the new layout, then animate from the old one.
    requestAnimationFrame(() =>
      Flip.from(state, {
        duration: num(p.duration, 0.6),
        ease: str(p.ease),
        stagger: num(p.stagger),
        absolute: true,
      }),
    );
  });

  return (
    <Stage ref={ref} className="flex-col gap-3 p-4">
      <button
        type="button"
        onClick={toggle}
        className="rounded-md border px-3 py-1 text-xs hover:bg-accent"
      >
        Toggle layout
      </button>
      <div className={cn("w-full max-w-sm gap-2", list ? "flex flex-col" : "grid grid-cols-3")}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            data-flip-id={n}
            className={cn(
              "card rounded-lg bg-primary text-xs text-primary-foreground",
              list ? "h-6 px-2 leading-6" : "flex h-14 items-center justify-center",
            )}
          >
            {n}
          </div>
        ))}
      </div>
    </Stage>
  );
}

export function DraggablePreview({ p }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const [d] = Draggable.create(".card", {
        type: str(p.type, "x,y") as "x,y",
        bounds: ref.current,
        inertia: p.inertia === true || p.inertia === "true",
      });
      return () => d?.kill();
    },
    { scope: ref, dependencies: [p], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref}>
      <div className="card flex size-24 cursor-grab items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground select-none">
        Drag me
      </div>
    </Stage>
  );
}

export function MagneticPreview({ p }: PreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const btn = ref.current!.querySelector<HTMLElement>(".magnetic")!;
      const opts = { duration: num(p.duration, 0.6), ease: str(p.ease) };
      const xTo = gsap.quickTo(btn, "x", opts);
      const yTo = gsap.quickTo(btn, "y", opts);
      const strength = num(p.strength, 0.4);
      const move = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * strength);
        yTo((e.clientY - r.top - r.height / 2) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      btn.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", leave);
      return () => {
        btn.removeEventListener("mousemove", move);
        btn.removeEventListener("mouseleave", leave);
      };
    },
    { scope: ref, dependencies: [p], revertOnUpdate: true },
  );
  return (
    <Stage ref={ref}>
      <button
        type="button"
        className="magnetic rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground"
      >
        Hover me
      </button>
    </Stage>
  );
}
