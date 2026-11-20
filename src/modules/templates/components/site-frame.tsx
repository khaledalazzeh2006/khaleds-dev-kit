import { useEffect, useRef, useState } from "react";
import { BODY_CLASS } from "../lib/theme";

const SKELETON = `<!doctype html><html><head><meta charset="utf-8" /><style id="tw"></style></head><body class="${BODY_CLASS}"></body></html>`;

/**
 * Live, scaled preview of the generated page. The iframe is created once; CSS and markup are
 * swapped in place so the page doesn't flash or lose its scroll position while you edit.
 * Sandboxed without scripts or forms: the generated markup can't run code or navigate away.
 */
export function SiteFrame({ html, css, width }: { html: string; css: string; width: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setBox({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!ready || !doc) return;
    const style = doc.getElementById("tw");
    if (style) style.textContent = css;
    doc.body.innerHTML = html;
  }, [ready, html, css]);

  const scale = box.w ? Math.min(1, box.w / width) : 1;
  return (
    <div
      ref={wrapRef}
      className="relative min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted/30"
    >
      <iframe
        ref={frameRef}
        title="Template preview"
        srcDoc={SKELETON}
        sandbox="allow-same-origin"
        onLoad={() => setReady(true)}
        className="absolute top-0 left-1/2 origin-top border-0 bg-white"
        style={{
          width,
          height: box.h / scale,
          transform: `translateX(-50%) scale(${scale})`,
        }}
      />
    </div>
  );
}
