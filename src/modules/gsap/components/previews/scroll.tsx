import { useRef } from "react";
import { gsap, num, str, useGSAP, type PreviewProps } from "./setup";
import { ScrollStage, Spacer } from "./stage";

/** All scroll previews scroll inside their own box, so ScrollTrigger gets `scroller: box`. */
function useScrollPreview(build: (scroller: HTMLElement) => void, deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => build(ref.current!), { scope: ref, dependencies: deps, revertOnUpdate: true });
  return ref;
}

export function ScrollRevealPreview({ p, replay }: PreviewProps) {
  const ref = useScrollPreview(
    (scroller) => {
      gsap.utils.toArray<HTMLElement>(".reveal", scroller).forEach((el) => {
        gsap.from(el, {
          y: num(p.y),
          opacity: 0,
          duration: num(p.duration, 0.8),
          ease: str(p.ease),
          scrollTrigger: {
            trigger: el,
            scroller,
            start: `top ${num(p.start, 85)}%`,
            toggleActions: "play none none reverse",
          },
        });
      });
    },
    [p, replay],
  );
  return (
    <ScrollStage ref={ref}>
      <Spacer label="Scroll down" />
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="reveal mx-6 mb-6 flex h-28 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        >
          Card {n}
        </div>
      ))}
      <Spacer label="End" />
    </ScrollStage>
  );
}

export function ScrollProgressPreview({ p, replay }: PreviewProps) {
  const ref = useScrollPreview(
    (scroller) => {
      gsap.to(".progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { scroller, start: 0, end: "max", scrub: num(p.scrub) },
      });
    },
    [p, replay],
  );
  return (
    <ScrollStage ref={ref}>
      <div className="sticky top-0 z-10 h-1.5 bg-muted">
        <div className="progress h-full origin-left scale-x-0 bg-primary" />
      </div>
      {Array.from({ length: 8 }, (_, i) => (
        <p key={i} className="mx-6 my-5 text-sm text-muted-foreground">
          Paragraph {i + 1}. Keep scrolling and watch the bar at the top fill up.
        </p>
      ))}
    </ScrollStage>
  );
}

export function PinSectionPreview({ p, replay }: PreviewProps) {
  const ref = useScrollPreview(
    (scroller) => {
      const distance = num(p.distance, 600);
      gsap.to(".panel", {
        x: Math.min(distance, 220),
        rotation: 360,
        ease: "none",
        scrollTrigger: {
          trigger: ".section",
          scroller,
          pin: true,
          start: "top top",
          end: `+=${distance}`,
          scrub: num(p.scrub),
        },
      });
    },
    [p, replay],
  );
  return (
    <ScrollStage ref={ref}>
      <Spacer label="Scroll down" />
      <section className="section flex h-72 items-center bg-accent/40 px-6">
        <div className="panel size-16 rounded-xl bg-primary" />
      </section>
      <Spacer label="Unpinned — scroll continues" />
    </ScrollStage>
  );
}

export function HorizontalScrollPreview({ p, replay }: PreviewProps) {
  const ref = useScrollPreview(
    (scroller) => {
      const wrapper = scroller.querySelector<HTMLElement>(".horizontal")!;
      const panels = gsap.utils.toArray<HTMLElement>(".panel", scroller);
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: wrapper,
          scroller,
          pin: true,
          scrub: num(p.scrub),
          end: () => `+=${wrapper.offsetWidth}`,
        },
      });
    },
    [p, replay],
  );
  return (
    <ScrollStage ref={ref}>
      <Spacer label="Scroll down" />
      <div className="horizontal flex h-72 overflow-hidden">
        {[1, 2, 3, 4].map((n) => (
          <section
            key={n}
            className="panel flex h-full w-full shrink-0 items-center justify-center text-4xl font-semibold"
            style={{ background: `color-mix(in oklch, var(--primary) ${25 * n}%, transparent)` }}
          >
            {n}
          </section>
        ))}
      </div>
      <Spacer label="End" />
    </ScrollStage>
  );
}

export function ParallaxPreview({ p, replay }: PreviewProps) {
  const ref = useScrollPreview(
    (scroller) => {
      gsap.utils.toArray<HTMLElement>("[data-speed]", scroller).forEach((el) => {
        gsap.to(el, {
          yPercent: -num(p.distance, 100) * Number(el.dataset.speed),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    [p, replay],
  );
  return (
    <ScrollStage ref={ref}>
      <Spacer label="Scroll down" />
      <div className="relative mx-6 flex h-64 items-end justify-around">
        <div data-speed="0.2" className="size-20 rounded-full bg-primary/30" />
        <div data-speed="0.6" className="size-20 rounded-full bg-primary/60" />
        <div data-speed="1" className="size-20 rounded-full bg-primary" />
      </div>
      <Spacer label="Slower ← → faster" />
    </ScrollStage>
  );
}
