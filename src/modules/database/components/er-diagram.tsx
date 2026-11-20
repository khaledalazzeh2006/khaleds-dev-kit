import { useMemo } from "react";
import type { Schema } from "../lib/schema";
import { BOX_W, HEAD_H, layoutDiagram, ROW_H } from "../lib/layout";

/** ER diagram drawn from the schema (tables, columns, PK/FK markers, relation curves). */
export function ErDiagram({ schema }: { schema: Schema }) {
  const { boxes, links, width, height } = useMemo(() => layoutDiagram(schema), [schema]);
  return (
    <div className="overflow-auto rounded-lg border bg-muted/30 p-3">
      <svg
        // Scales down to fit the panel; below 380px it stops shrinking and scrolls instead.
        style={{ width: "100%", maxWidth: width, minWidth: Math.min(width, 380), height: "auto" }}
        viewBox={`-10 -10 ${width} ${height}`}
        role="img"
        aria-label="Entity relationship diagram"
        className="max-w-none"
      >
        {links.map((l) => (
          <path
            key={l.id}
            d={l.d}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={1.5}
            strokeDasharray={l.nullable ? "5 4" : undefined}
            opacity={0.8}
          />
        ))}
        {boxes.map((b) => (
          <g key={b.name} transform={`translate(${b.x},${b.y})`}>
            <rect width={BOX_W} height={b.h} rx={8} fill="var(--card)" stroke="var(--border)" />
            <rect
              width={BOX_W}
              height={HEAD_H}
              rx={8}
              fill="color-mix(in oklch, var(--primary) 18%, var(--card))"
            />
            <text x={10} y={18} fontSize={12} fontWeight={600} fill="var(--foreground)">
              {b.name}
            </text>
            {b.rows.map((r, i) => (
              <g key={r.name} transform={`translate(0,${HEAD_H + i * ROW_H})`}>
                <text
                  x={10}
                  y={14}
                  fontSize={11}
                  fill={r.pk ? "var(--primary)" : "var(--foreground)"}
                  fontFamily="var(--font-mono)"
                >
                  {r.pk ? "◆ " : r.fk ? "→ " : ""}
                  {r.name}
                  {r.nullable ? "?" : ""}
                </text>
                <text
                  x={BOX_W - 10}
                  y={14}
                  fontSize={10}
                  textAnchor="end"
                  fill="var(--muted-foreground)"
                  fontFamily="var(--font-mono)"
                >
                  {r.type}
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
